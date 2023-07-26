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

module.exports = {
    connectDB,
    getDB,
    closeDB,
};
