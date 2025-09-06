const express = require('express');
const router = express.Router();
const pool = require('../db');
const { requireAuth } = require('../authMiddleware');

//CREATE CHECKLIST
router.post('/', requireAuth, async (req, res) => {
  const { created_by, vehicle_id, checklist_name, type } = req.body;
  try {
    const [result] = await pool.query(
      `INSERT INTO Checklists (Created_By, Vehicle_Id, Checklist_Name, Type, Is_active)
       VALUES (?, ?, ?, ?, TRUE)`,
      [created_by, vehicle_id, checklist_name, type]
    );
    res.status(201).json({ checklist_id: result.insertId, message: 'Checklist created successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

//UPDATE CHECKLIST
router.put('/:id', requireAuth, async (req, res) => {
  const { id } = req.params;
  const { checklist_name, type, is_active } = req.body;
  try {
    const [result] = await pool.query(
      `UPDATE Checklists 
       SET Checklist_Name = ?, Type = ?, Is_active = ?
       WHERE Checklist_Id = ?`,
      [checklist_name, type, is_active, id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Checklist not found' });
    res.json({ message: 'Checklist updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

//DELETE CHECKLIST
router.delete('/:id', requireAuth, async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.query('DELETE FROM Checklists WHERE Checklist_Id = ?', [id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Checklist not found' });
    res.json({ message: 'Checklist deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

//GET CHECKLIST BY ID 
router.get('/:id', requireAuth, async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query('SELECT * FROM Checklists WHERE Checklist_Id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Checklist not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

//GET ALL CHECKLISTS
router.get('/', requireAuth, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM Checklists');
    if (rows.length === 0) return res.status(404).json({ message: 'No checklists found' });
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

//GET CHECKLISTS BY VEHICLE
router.get('/vehicle/:vehicleId', requireAuth, async (req, res) => {
  const { vehicleId } = req.params;
  try {
    const [rows] = await pool.query('SELECT * FROM Checklists WHERE Vehicle_Id = ?', [vehicleId]);
    if (rows.length === 0) return res.status(404).json({ message: 'No checklists found for this vehicle' });
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
