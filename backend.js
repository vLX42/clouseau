const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

let todos = [];

app.get('/todos', (req, res) => {
  res.json(todos);
});

app.post('/todos', (req, res) => {
  const { text } = req.body;
  const newTodo = { id: Date.now().toString(), text, done: false };
  todos.push(newTodo);
  res.status(201).json(newTodo);
});

app.put('/todos/:id', (req, res) => {
  const { id } = req.params;
  const todo = todos.find(t => t.id === id);
  if (todo) {
    todo.done = !todo.done;
    res.json(todo);
  } else {
    res.status(404).send('Todo not found');
  }
});

app.delete('/todos/:id', (req, res) => {
  const { id } = req.params;
  todos = todos.filter(t => t.id !== id);
  res.status(204).end();
});

app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});