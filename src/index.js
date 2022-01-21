const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;
  const user = users.find((user) => user.username === username);
  if (!user) {
    return response.status(404).json({ error: 'Mensagem do erro' });
  }
  request.user = user;
  return next();
}

function generateUuid() {
  return uuidv4();
}

app.post('/users', (request, response) => {
  try {
    const { name, username } = request.body;
    const userAlreadyExists = users.some((user) => user.username === username);

    if (userAlreadyExists) {
      return response.status(400).json({ 	error: 'Mensagem do erro' })
    }
    const id = generateUuid();
    const todos = [];
    const user = {
      id,
      name,
      username,
      todos
    }
    users.push(user);
    return response.status(201).json(user)
  } catch (error) {
    return response.status(500).json({ error });
  }


});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  try {
    const { username } = request.user;
    const todoUser = users.find((user) => user.username === username);
    return response.json(todoUser.todos)
  } catch (error) {
    return response.status(500).json({ error });
  }

});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  try {
    const { title, deadline } = request.body;
    const { user } = request;
    const id = generateUuid();
    const done = false
    const created_at = new Date()
    const todos = {
      id,
      title,
      done,
      deadline: new Date(deadline),
      created_at
    }
    user.todos.push(todos)
    return response.status(201).json(todos)
  } catch (error) {
    return response.status(500).json({ error });
  }
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  try {
    const { id } = request.params;
    const { title, deadline } = request.body;
    const {todos} = request.user;
    const todoExists = todos.find((item) => item.id === id);
    if (!todoExists) {
      return response.status(404).json({ error: 'Todo not found' });
    }
    todoExists.title = title;
    todoExists.deadline = deadline;
    return response.status(201).json(todoExists)    
  } catch (error) {
    return response.status(500).json({ error });
  }


});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  try {
    const { id } = request.params;
    const {todos} = request.user;
    const todoExists = todos.find((item) => item.id === id);
    if (!todoExists) {
      return response.status(404).json({ error: 'Todo not found' });
    }
    todoExists.done = true;
    return response.status(201).json(todoExists)    
  } catch (error) {
    return response.status(500).json({ error });
  }

});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  try {
    const { id } = request.params;
    const {user} = request;
    const todoExists = user.todos.findIndex((item) => item.id === id);
    if (todoExists === -1) {
      return response.status(404).json({ error: 'Mensagem do erro'});
    }
    user.todos.splice(todoExists,1);
    return response.status(204).send();  
  } catch (error) {
    return response.status(500).json({ error });
  }

});

module.exports = app;