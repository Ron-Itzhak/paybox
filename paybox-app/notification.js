const express = require('express');
const app = express();
const dotenv = require('dotenv');
const cors = require('cors');
dotenv.config();
const bodyParser = require('body-parser');
const db = require("./db"); // Import body-parser
app.use(cors({
    methods: ['GET', 'POST', 'DELETE', 'UPDATE', 'PUT', 'PATCH']
}));
const port = process.env.NOTIFICATION_PORT || 4000;
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.get('/', (req, res) => {
    res.send('notifications microservice is running');
});
app.get('/sendNotifications', async (req, res) => {

    try {
        const todosTomorrow = await db.getTodosWithDeadlineTomorrow();
        console.log('Sending notifications for todos with deadline tomorrow:', todosTomorrow);
        res.status(200).json(todosTomorrow);
    } catch (error) {
        res.status(500).json({error: 'Error sending notifications'});
    }
});

app.listen(port, () => {
    console.log(`Notification service listening at http://localhost:${port}`);
});


module.exports = app;