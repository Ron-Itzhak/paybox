const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
dotenv.config();
const bodyParser = require('body-parser');
const db = require("./db");

const app = express();
app.use(cors({
    methods: ['GET']
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

const port = process.env.NOTIFICATION_PORT || 4000;

app.get('/', (req, res) => {
    res.send('notifications microservice is running');
});
app.get('/sendNotifications', async (req, res) => {

    try {
        const todosTomorrow = await getTodosWithDeadlineTomorrow();
        console.log('Sending notifications for todos with deadline tomorrow:', todosTomorrow);
        res.status(200).json(todosTomorrow);
    } catch (error) {
        res.status(500).json({error: 'Error sending notifications'});
    }
});

async function getTodosWithDeadlineTomorrow() {
    const database = await db.connectDB();
    const todosCollection = database.collection('todos');
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const endOfTomorrow = new Date(tomorrow);
    endOfTomorrow.setDate(tomorrow.getDate() + 1);
    const query = {deadline: {$gte: today, $lt: endOfTomorrow}};

    return await todosCollection.find(query).toArray();
}
if (process.env.NODE_ENV !== 'test') {

app.listen(port, () => {
    console.log(`Notification service listening at http://localhost:${port}`);
});
}
process.on('SIGINT', () => {
    console.log('Received SIGINT. Closing server and database connection...');
    server.close(() => {
        db.closeDB();
        console.log('server and MongoDB connection closed');
        process.exit(0);
    });
});


module.exports = {
    app,
    getTodosWithDeadlineTomorrow
};