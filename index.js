const express = require('express');
//const fetch = require('node-fetch');
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use('/public', express.static('public'));

const todos = [];

app.get('/todos', (req, res) => {
  res.json(todos);
});

app.post('/todos', (req, res) => {
  const { title } = req.body;
  const todo = { id: todos.length + 1, title };
  todos.push(todo);
  res.json(todo);
});

app.put('/todos/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const { title } = req.body;
  const todoIndex = todos.findIndex(todo => todo.id === id);
  if (todoIndex === -1) {
    res.status(404).json({ error: 'TODO item not found' });
  } else {
    todos[todoIndex].title = title;
    res.json(todos[todoIndex]);
  }
});

app.delete('/todos/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const todoIndex = todos.findIndex(todo => todo.id === id);
  if (todoIndex === -1) {
    res.status(404).json({ error: 'TODO item not found' });
  } else {
    todos.splice(todoIndex, 1);
    res.sendStatus(204);
  }
});

app.get('/', (req, res) => {
  fetch('http://localhost:3000/todos')
    .then(response => response.json())
    .then(todos => {
      const todoList = todos.map(todo => `<li>${todo.title}</li>`).join('');
      const html = `
        <!DOCTYPE html>
        <link rel="stylesheet" href="/public/style.css">
        <html>
        <head>
          <meta charset="utf-8">
          <title>TODO List</title>
        </head>
        <body>
          <h1>TODO List</h1>
          <form action="/" method="POST" id="todo-form">
            <input type="text" name="title" placeholder="Title" required>
            <button type="submit">Add</button>
          </form>
          <ul id="todo-list">${todoList}</ul>
          <script>
            const todoForm = document.getElementById('todo-form');
            todoForm.addEventListener('submit', event => {
              event.preventDefault();
              const formData = new FormData(todoForm);
              const title = formData.get('title');
              const completed = formData.get('completed');
              fetch('/todos', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  title,
                  completed,
                }),
              })
                .then(response => response.json())
                .then(todo => {
                  const todoList = document.getElementById('todo-list');
                  const todoItem = document.createElement('li');
                  todoItem.innerText = todo.title;
                  todoList.appendChild(todoItem);
                  todoForm.reset();
                });
            });
          </script>
        </body>
        </html>
      `;
      res.send(html);
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));