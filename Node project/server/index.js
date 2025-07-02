const express = require('express');
const fs = require('fs');
const path = require('path');
const logger = require('./logger');
const errorHandler = require('./errorHandler');
const validateTask = require('./validateTask');

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'tasks.json');

app.use(express.json());
app.use(logger);

// Helper to read/write JSON
function readTasks() {
  const data = fs.readFileSync(DATA_FILE);
  return JSON.parse(data);
}
function writeTasks(tasks) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(tasks, null, 2));
}

// Routes
app.get('/tasks', (req, res) => {
  const tasks = readTasks();
  res.json(tasks);
});

app.post('/tasks', validateTask, (req, res) => {
  const tasks = readTasks();
  const newTask = { id: Date.now().toString(), ...req.body };
  tasks.push(newTask);
  writeTasks(tasks);
  res.status(201).json(newTask);
});

app.put('/tasks/:id', validateTask, (req, res) => {
  const tasks = readTasks();
  const index = tasks.findIndex(t => t.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Task not found' });

  tasks[index] = { id: req.params.id, ...req.body };
  writeTasks(tasks);
  res.json(tasks[index]);
});

app.delete('/tasks/:id', (req, res) => {
  let tasks = readTasks();
  const index = tasks.findIndex(t => t.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Task not found' });

  const deleted = tasks.splice(index, 1)[0];
  writeTasks(tasks);
  res.json(deleted);
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
