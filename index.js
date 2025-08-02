const express = require('express');
const app = express();

app.use(express.json());

const PORT = 3000;

let cars = [
  { id: 1, name: 'BMW M5' },
  { id: 2, name: 'Mercedes C63' },
  { id: 3, name: 'Porche 911'}
];

app.get('/', (req, res) => {
  res.send('Welcome to the Express API!');
});

app.get('/cars', (req,res)=> {
    res.json(cars)    
});

app.post('/cars', (req, res) => {
  const newcar = req.body;
  cars.push(newcar);
  res.status(201).json(newcar);
});

app.put('/cars/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = cars.findIndex(car => car.id === id);
  if (index !== -1) {
    cars[index] = req.body;
    res.json(cars[index]);
  } 
  else {
    res.status(404).json({ message: 'Car not found' });
  }
});

app.patch('/cars/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const car = cars.find(i => i.id === id);
  if (car) {
    Object.assign(car, req.body);
    res.json(car);
  }
  else {
    res.status(404).json({ message: 'Car not found' });
  }
});

app.delete('/cars/:id', (req, res) => {
  const id = parseInt(req.params.id);
  cars = cars.filter(car => car.id !== id);
  res.json({ message: 'Car deleted' });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});