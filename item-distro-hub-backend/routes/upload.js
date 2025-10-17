// routes/upload.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const auth = require('../middleware/auth');
const { parseFileBuffer } = require('../utils/parseFile');
const Item = require('../models/Item');
const Agent = require('../models/Agent');
const { distributeItemsAmongAgents } = require('../utils/distribute');

const MAX_SIZE = parseInt(process.env.MAX_UPLOAD_SIZE_BYTES || '5242880', 10); // 5MB default

// multer in-memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: MAX_SIZE },
  fileFilter: (req, file, cb) => {
    const allowed = ['.csv', '.xlsx', '.xls'];
    const fname = (file.originalname || '').toLowerCase();
    if (fname.endsWith('.csv') || fname.endsWith('.xlsx') || fname.endsWith('.xls')) {
      cb(null, true);
    } else {
      cb(new Error('Only csv, xlsx or xls files are allowed'));
    }
  }
});

// POST /api/upload -> accepts multipart file or JSON { items, distribute, agentIds }
router.post('/', auth, upload.single('file'), async (req, res) => {
  try {
    let items = [];
    if (req.file) {
      // parse file buffer
      items = await parseFileBuffer(req.file.buffer, req.file.originalname);
    } else if (req.body.items) {
      // JSON posted items
      items = JSON.parse(req.body.items);
    } else {
      return res.status(400).json({ message: 'No file or items provided' });
    }

    // optional agentIds in body (JSON array of ids)
    let agentIds = [];
    if (req.body.agentIds) {
      agentIds = JSON.parse(req.body.agentIds);
    } else {
      // default: select first 5 agents created
      const agents = await Agent.find().sort({ createdAt: 1 }).limit(5).select('_id').lean();
      agentIds = agents.map(a => String(a._id));
    }

    if (items.length === 0) {
      return res.status(200).json({ distributed: [], totalItems: 0, message: 'No items to upload' });
    }

    if (agentIds.length === 0) {
      return res.status(400).json({ message: 'No agents available for distribution. Create agents first or provide agentIds.' });
    }

    // Validate items: ensure required fields exist
    const validItems = [];
    for (const it of items) {
      if (!it.firstName || !it.phone) {
        // skip invalid rows or optionally reject
        continue;
      }
      validItems.push({
        firstName: it.firstName,
        phone: it.phone,
        notes: it.notes || '',
        originalRow: it.originalRow || {}
      });
    }

    // Save items initially (unassigned) and keep their docs
    const savedItems = await Item.insertMany(validItems.map(i => ({ ...i, uploadedBy: req.user._id })));

    // Distribute saved items by ids
    // We'll work with items array of docs (converted to plain objects)
    const itemDocs = savedItems.map(i => ({
      id: String(i._id),
      firstName: i.firstName,
      phone: i.phone,
      notes: i.notes,
      originalRow: i.originalRow
    }));

    const distributed = distributeItemsAmongAgents(itemDocs, agentIds);

    // Update DB: set assignedTo for each item
    const bulkOps = [];
    for (const bucket of distributed) {
      for (const it of bucket.items) {
        bulkOps.push({
          updateOne: {
            filter: { _id: it.id },
            update: { $set: { assignedTo: bucket.agentId } }
          }
        });
      }
    }
    if (bulkOps.length > 0) {
      await Item.bulkWrite(bulkOps);
    }

    // Return distributed lists
    res.json({ distributed, totalItems: itemDocs.length });
  } catch (err) {
    console.error('upload err', err);
    res.status(500).json({ message: 'Upload error', error: err.message });
  }
});

// POST /api/distribute -> re-distribute provided items among given agentIds
router.post('/distribute', auth, async (req, res) => {
  try {
    const { items, agentIds } = req.body;
    if (!Array.isArray(items) || items.length === 0) return res.status(400).json({ message: 'items required' });
    if (!Array.isArray(agentIds) || agentIds.length === 0) return res.status(400).json({ message: 'agentIds required' });

    // items may be item ids or objects. Normalize to objects with id
    const normalized = items.map(it => {
      if (typeof it === 'string') return { id: it };
      if (it.id) return { id: it.id };
      if (it._id) return { id: String(it._id) };
      // item object might be full object - create new item
      return null;
    }).filter(Boolean);

    // If items are objects without id (new items), insert them:
    // For simplicity, require items to be existing item IDs or full objects with firstName & phone
    const newItemsToInsert = [];
    for (const it of items) {
      if (!it.id && it.firstName && it.phone) {
        newItemsToInsert.push({ firstName: it.firstName, phone: it.phone, notes: it.notes || '', uploadedBy: req.user._id });
      }
    }
    let inserted = [];
    if (newItemsToInsert.length > 0) inserted = await Item.insertMany(newItemsToInsert);

    const idList = [
      ...normalized.map(n => n.id),
      ...inserted.map(i => String(i._id))
    ];

    // Load item docs for distribution
    const docs = await Item.find({ _id: { $in: idList } }).lean();
    const itemDocs = docs.map(d => ({ id: String(d._id), firstName: d.firstName, phone: d.phone, notes: d.notes }));

    // Distribute
    const distributed = distributeItemsAmongAgents(itemDocs, agentIds);

    // Update DB assignments
    const bulkOps = [];
    for (const bucket of distributed) {
      for (const it of bucket.items) {
        bulkOps.push({
          updateOne: {
            filter: { _id: it.id },
            update: { $set: { assignedTo: bucket.agentId } }
          }
        });
      }
    }
    if (bulkOps.length > 0) await Item.bulkWrite(bulkOps);

    res.json({ distributed, total: itemDocs.length });
  } catch (err) {
    console.error('distribute err', err);
    res.status(500).json({ message: 'Distribute error', error: err.message });
  }
});

module.exports = router;