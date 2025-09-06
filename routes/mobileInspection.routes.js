const express = require('express');
const router = express.Router();
const pool = require('../db');
const { requireAuth } = require('../authMiddleware');

// CREATE INSPECTION
router.post('/', requireAuth, async (req, res) => {
  const { checklist_id, driver_id, vehicle_id, inspection_date, type, notes, signature, status } = req.body;
  try {
    const [result] = await pool.query(
      `INSERT INTO Inspections (Checklist_Id, Driver_Id, Vehicle_Id, Inspection_Date, Type, Notes, Signature, Status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [checklist_id, driver_id, vehicle_id, inspection_date, type, notes, signature, status]
    );
    res.status(201).json({ inspection_id: result.insertId, message: 'Inspection created successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// UPDATE INSPECTION
router.put('/:id', requireAuth, async (req, res) => {
  const { id } = req.params;
  const { type, notes, signature, status } = req.body;
  try {
    const [result] = await pool.query(
      `UPDATE Inspections 
       SET Type = ?, Notes = ?, Signature = ?, Status = ?
       WHERE Inspection_Id = ?`,
      [type, notes, signature, status, id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Inspection not found' });
    res.json({ message: 'Inspection updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE INSPECTION
router.delete('/:id', requireAuth, async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.query('DELETE FROM Inspections WHERE Inspection_Id = ?', [id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Inspection not found' });
    res.json({ message: 'Inspection deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET INSPECTION BY ID
router.get('/:id', requireAuth, async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query('SELECT * FROM Inspections WHERE Inspection_Id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Inspection not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET ALL INSPECTIONS
router.get('/', requireAuth, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM Inspections');
    if (rows.length === 0) return res.status(404).json({ message: 'No inspections found' });
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
