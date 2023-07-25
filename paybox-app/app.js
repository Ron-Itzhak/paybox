const express = require('express');
const bodyParser = require('body-parser'); // Import body-parser
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();
const app = express();
app.use(cors({
    methods: ['GET','POST','DELETE','UPDATE','PUT','PATCH']
}));
const port = process.env.APP_PORT || 9000;
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const collectionName = 'todos';
const db = require('./db');
app.get('/', (req, res) => {
    res.send('App microservice is running!');
});
app.post('/todos', async (req, res) => {
    const { title,  content, deadline } = req.body;
    const formattedDeadline = new Date(deadline);
    if (isNaN(formattedDeadline.getTime())) {
        return res.status(400).json({ error: 'Invalid date format for deadline' });
    }
    const newTodo = {
        title,content,
        deadline: formattedDeadline,
        completed: false,
    };
    try {
        const result = await db.insertTodo(newTodo);
        res.status(201).json(result);
    }
    catch (e){
                console.error('Error creating todo:', e);
                res.status(500).json({error: 'Failed to create todo.'});
    }
});
app.get('/todos', async (req, res) => {
    const database = await db.connectDB();
    try {
        const todos = await database.collection(collectionName)
            .find()
            .toArray();
        res.json(todos)
    }
    catch (e){
            console.error('Error fetching todos:', e);
            res.status(500).json({error: 'Failed to fetch todos.'});
    }
});
app.put('/todos/:id', async (req, res) => {
    const database = await db.connectDB()
    const todo_id = parseInt(req.params.id);
    const { title,  content, deadline } = req.body;
    const formattedDeadline = new Date(deadline);

    if (isNaN(formattedDeadline.getTime())) {
        return res.status(400).json({ error: 'Invalid date format for deadline' });
    }

    console.log(title,  content, deadline);
    try {
    const updated = database.collection(collectionName).findOneAndUpdate(
        {todo_id},
        {$set: {title,content,deadline}},
        {returnOriginal: false},
    );
        res.status(200).json('updated successfully');
    }catch (e){
                console.error('Error updating todo:');
                res.status(500).json({error: 'Failed to update todo.'});
            }
});
app.delete('/todos/:id', async (req, res) => {
    const database = await db.connectDB()
    const todo_id = parseInt(req.params.id);
    try {
    const deleted = database.collection('todos').deleteOne({todo_id});
        res.status(200).json(`${todo_id} deleted Successfully`);

    }
    catch (e){
            console.error('Error deleting todo:', e);
            res.status(500).json({ error: 'Failed to delete todo.' });
    }
});
app.listen(port, () => {
    console.log(`App service listening at http://localhost:${port}`);
});
module.exports = app;