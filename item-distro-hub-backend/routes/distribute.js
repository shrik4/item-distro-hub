const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Item = require('../models/Item');
const User = require('../models/User');

// @route   POST /api/distribute
// @desc    Distribute items to agents
// @access  Private (Admin only)
router.post('/', auth, async (req, res) => {
  try {
    const { items, agentIds } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'No items provided for distribution' });
    }
    if (!agentIds || !Array.isArray(agentIds) || agentIds.length === 0) {
      return res.status(400).json({ message: 'No agent IDs provided for distribution' });
    }

    // Basic validation: ensure agentIds are valid ObjectIds if needed
    // For now, we'll assume they are valid strings

    // Save items to the database and assign to agents
    const savedItems = await Promise.all(items.map(async (item, index) => {
      const agentId = agentIds[index % agentIds.length]; // Distribute cyclically
      const newItem = new Item({
        firstName: item.firstName,
        phone: item.phone,
        notes: item.notes,
        assignedTo: agentId,
        assignedAt: new Date(),
      });
      return newItem.save();
    }));

    res.status(200).json({ message: 'Items distributed successfully', distributedCount: savedItems.length });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;