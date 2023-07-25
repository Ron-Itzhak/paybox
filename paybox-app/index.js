const express = require('express');
const {MongoClient} = require("mongodb");
const app = express();
const port = 8000;
const url = 'mongodb://localhost:27017';
const dbName = 'paybox';
// let db;
// const client = new MongoClient('mongodb://localhost:27017');
//
// let conn;
// try {
//     conn = await client.connect();
// } catch(e) {
//     console.error(e);
// }
// db = conn.db(dbName);

MongoClient.connect(url, { useUnifiedTopology: true })
    .then(client => {
        console.log('Connected to MongoDB');
        const db = client.db(dbName); // Change 'testdb' to your desired database name

        // Define a simple route
        app.get('/', async (req, res) => {
            const documents = await db.collection('todos')
                .find()
                .toArray()
            res.json(documents)
        });

        // Start the server
        const port = 3000;
        app.listen(port, () => {
            console.log(`Server is running on http://localhost:${port}`);
        });
    })
    .catch(err => {
        console.error('Error connecting to MongoDB:', err);
    });


// app.get('/', (req, res) => {
//     res.send('Hello World!');
// });

app.get('/todostest', (req, res) => {
    db.collection('todos')
        .find()
        .toArray((err, todos) => {
            if (err) {
                console.error('Error fetching todos:', err);
                res.status(500).json({ error: 'Failed to fetch todos.' });
                return;
            }
            res.json(todos);
        });
});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});