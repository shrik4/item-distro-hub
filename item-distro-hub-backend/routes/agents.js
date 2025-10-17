// routes/agents.js
const express = require('express');
const router = express.Router();
const Agent = require('../models/Agent');
const Item = require('../models/Item');
const bcrypt = require('bcryptjs');
const auth = require('../middleware/auth');

// Create agent
router.post('/', auth, async (req, res) => {
  try {
    const { name, email, mobile, password } = req.body;
    if (!name || !email || !mobile || !password) return res.status(400).json({ message: 'Missing fields' });

    const existing = await Agent.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(409).json({ message: 'Agent with this email already exists' });

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const agent = new Agent({
      name,
      email: email.toLowerCase(),
      mobile,
      passwordHash
    });
    await agent.save();

    res.status(201).json({ id: agent._id, name: agent.name, email: agent.email, mobile: agent.mobile });
  } catch (err) {
    console.error('create agent error', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// List agents with assignedCount
router.get('/', auth, async (req, res) => {
  try {
    const agents = await Agent.find().sort({ createdAt: 1 }).lean();
    // compute assigned counts
    const agentIds = agents.map(a => a._id);
    const counts = await Item.aggregate([
      { $match: { assignedTo: { $in: agentIds } } },
      { $group: { _id: '$assignedTo', count: { $sum: 1 } } }
    ]);

    const countMap = {};
    counts.forEach(c => { countMap[String(c._id)] = c.count; });

    const out = agents.map(a => ({
      id: a._id,
      name: a.name,
      email: a.email,
      mobile: a.mobile,
      createdAt: a.createdAt,
      assignedCount: countMap[String(a._id)] || 0
    }));

    res.json(out);
  } catch (err) {
    console.error('list agents err', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get agent assigned items
router.get('/:id/lists', auth, async (req, res) => {
  try {
    const agentId = req.params.id;
    const agent = await Agent.findById(agentId).lean();
    if (!agent) return res.status(404).json({ message: 'Agent not found' });

    const items = await Item.find({ assignedTo: agentId }).sort({ createdAt: 1 }).lean();

    res.json({ agentId: agent._id, agentName: agent.name, items });
  } catch (err) {
    console.error('agent lists err', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;