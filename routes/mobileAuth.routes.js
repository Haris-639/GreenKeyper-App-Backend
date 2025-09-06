const express = require('express');
const bcrypt = require('bcrypt');
const { body, validationResult } = require('express-validator');
const pool = require('../db');
const { generateAccessToken, generateRefreshToken } = require('../jwt');

const router = express.Router();

// REGISTER (Mobile)
router.post(
  '/register',
  body('name').isLength({ min: 2 }),
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
  body('role_id').isInt(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { name, email, password, phone_no, role_id } = req.body;

    const [existing] = await pool.query('SELECT * FROM Users WHERE Email = ?', [email]);
    if (existing.length > 0) return res.status(409).json({ message: 'Email already in use' });

    const hash = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      `INSERT INTO Users (Role_Id, Name, Email, Password, Phone_No, Is_active) 
       VALUES (?, ?, ?, ?, ?, TRUE)`,
      [role_id, name, email, hash, phone_no || null]
    );

    res.status(201).json({ message: 'Mobile user created', user_id: result.insertId });
  }
);

// LOGIN (Mobile)
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const [rows] = await pool.query('SELECT * FROM Users WHERE Email = ?', [email]);
  if (rows.length === 0) return res.status(401).json({ message: 'Invalid credentials' });

  const user = rows[0];
  const match = await bcrypt.compare(password, user.Password);
  if (!match) return res.status(401).json({ message: 'Invalid credentials' });

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  res.json({
    source: 'mobile',
    access_token: accessToken,
    refresh_token: refreshToken,
    user: {
      user_id: user.User_Id,
      name: user.Name,
      email: user.Email,
      phone_no: user.Phone_No,
      role_id: user.Role_Id,
    },
  });
});

// LOGOUT (Mobile)
router.post('/logout', (req, res) => {
  res.json({ message: 'Mobile user logged out successfully' });
});

module.exports = router;


// UPDATE USER (Mobile)
router.put('/update/:id', async (req, res) => {
  const userId = req.params.id;
  const { name, email, phone_no } = req.body;

  try {
    const [rows] = await pool.query('SELECT * FROM Users WHERE User_Id = ?', [userId]);
    if (rows.length === 0) return res.status(404).json({ message: 'User not found' });

    await pool.query(
      'UPDATE Users SET Name = ?, Email = ?, Phone_No = ? WHERE User_Id = ?',
      [name || rows[0].Name, email || rows[0].Email, phone_no || rows[0].Phone_No, userId]
    );

    res.json({ source: 'mobile', message: 'User updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE USER (Mobile)
router.delete('/delete/:id', async (req, res) => {
  const userId = req.params.id;

  try {
    const [rows] = await pool.query('SELECT * FROM Users WHERE User_Id = ?', [userId]);
    if (rows.length === 0) return res.status(404).json({ message: 'User not found' });

    await pool.query('DELETE FROM Users WHERE User_Id = ?', [userId]);
    res.json({ source: 'mobile', message: 'User deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

