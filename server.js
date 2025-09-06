require('dotenv').config();
const express = require('express');
const { requireAuth } = require('./authMiddleware');
const pool = require('./db');

// Auth routes
const webAuthRoutes = require('./routes/webAuth.routes');
const mobileAuthRoutes = require('./routes/mobileAuth.routes');

// Vehicle routes
const webVehicleRoutes = require('./routes/webVehicle.routes');
const mobileVehicleRoutes = require('./routes/mobileVehicle.routes');

// Checklist routes
const webChecklistRoutes = require('./routes/webChecklist.routes');
const mobileChecklistRoutes = require('./routes/mobileChecklist.routes');

//Inspection Routes
const webInspectionRoutes = require('./routes/webInspection.routes');
const mobileInspectionRoutes = require('./routes/mobileInspection.routes');


const app = express();
app.use(express.json());

//ROUTES

// Auth
app.use('/web/auth', webAuthRoutes);
app.use('/mobile/auth', mobileAuthRoutes);

// Vehicles
app.use('/web/vehicles', webVehicleRoutes);
app.use('/mobile/vehicles', mobileVehicleRoutes);

// Checklists
app.use('/web/checklists', webChecklistRoutes);
app.use('/mobile/checklists', mobileChecklistRoutes);

// Inspection
app.use('/web/inspections', webInspectionRoutes);
app.use('/mobile/inspections', mobileInspectionRoutes);

//PROTECTED TEST ROUTE
app.get('/me', requireAuth, async (req, res) => {
  const [rows] = await pool.query(
    'SELECT User_Id, Name, Email, Phone_No, Role_Id, Is_active FROM Users WHERE User_Id = ?',
    [req.user.sub]
  );
  if (rows.length === 0) return res.status(404).json({ message: 'User not found' });
  res.json({ user: rows[0] });
});

//SERVER START
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running at http://localhost:${port}`));
