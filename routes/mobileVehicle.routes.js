const express = require('express');
const router = express.Router();
const pool = require('../db');
const { requireAuth } = require('../authMiddleware');

//CREATE VEHICLE
router.post('/', requireAuth, async (req, res) => {
  const { user_id, vehicle_num, make, model, year } = req.body;
  try {
    const [result] = await pool.query(
      `INSERT INTO Vehicles (User_Id, Vehicle_Num, Make, Model, Year, Is_active)
       VALUES (?, ?, ?, ?, ?, TRUE)`,
      [user_id, vehicle_num, make, model, year]
    );
    res.status(201).json({ vehicle_id: result.insertId, message: 'Vehicle created successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

//UPDATE VEHICLE
router.put('/:id', requireAuth, async (req, res) => {
  const { id } = req.params;
  const { vehicle_num, make, model, year, is_active } = req.body;
  try {
    const [result] = await pool.query(
      `UPDATE Vehicles 
       SET Vehicle_Num = ?, Make = ?, Model = ?, Year = ?, Is_active = ?
       WHERE Vehicle_Id = ?`,
      [vehicle_num, make, model, year, is_active, id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Vehicle not found' });
    res.json({ message: 'Vehicle updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

//DELETE VEHICLE
router.delete('/:id', requireAuth, async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.query('DELETE FROM Vehicles WHERE Vehicle_Id = ?', [id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Vehicle not found' });
    res.json({ message: 'Vehicle deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

//GET VEHICLE BY ID
router.get('/:id', requireAuth, async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query('SELECT * FROM Vehicles WHERE Vehicle_Id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Vehicle not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

//GET VEHICLES BY USER
router.get('/user/:userId', requireAuth, async (req, res) => {
  const { userId } = req.params;
  try {
    const [rows] = await pool.query(
      'SELECT * FROM Vehicles WHERE User_Id = ?',
      [userId]
    );
    if (rows.length === 0) return res.status(404).json({ message: 'No vehicles found for this user' });
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

//GET ALL VEHICLES
router.get('/', requireAuth, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM Vehicles');
    if (rows.length === 0) return res.status(404).json({ message: 'No vehicles found' });
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
