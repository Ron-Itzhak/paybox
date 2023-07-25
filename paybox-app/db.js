const {MongoClient} = require('mongodb');
const dotenv = require('dotenv');
dotenv.config();

const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/';
const dbName = 'paybox';
let dbClient = null;

async function connectDB() {
    try {
        if (!dbClient) {
            dbClient = await MongoClient.connect(mongoURI, {useUnifiedTopology: true});
        }
        return dbClient.db(dbName);
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        throw error;
    }
}

function getDB() {
    if (!dbClient) {
        throw new Error('Database not connected');
    }
    return dbClient.db(dbName);
}

function closeDB() {
    if (dbClient) {
        dbClient.close();
        dbClient = null;
        console.log('MongoDB connection closed');
    }
}


async function increaseId(db) {
    const settingsCollection = db.collection('todos-settings');
    const result = await settingsCollection.findOneAndUpdate(
        {},
        {$inc: {todo_id: 1}},
        {upsert: true, returnOriginal: false}
    );

    return result.value ? result.value.todo_id : 1;
}

async function insertTodo(todo) {
    const database = await connectDB();
    const todo_id = await increaseId(database);
    const todoWithId = {...todo, todo_id};

    const todosCollection = database.collection('todos');
    return await todosCollection.insertOne(todoWithId);
}

async function getTodosWithDeadlineTomorrow() {
    const database = await connectDB();
    const todosCollection = database.collection('todos');
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const endOfTomorrow = new Date(tomorrow);
    endOfTomorrow.setDate(tomorrow.getDate() + 1);
    const query = { deadline: { $gte: today, $lt: endOfTomorrow } };

    return await todosCollection.find(query).toArray();
}

module.exports = {
    connectDB,
    insertTodo,
    increaseId,
    getTodosWithDeadlineTomorrow,
    getDB,
    closeDB,
};
