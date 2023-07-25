const { MongoMemoryServer } = require('mongodb-memory-server');
const { MongoClient } = require('mongodb');

const {
    connectDB,
    closeDB,
    increaseId,
    getTodosWithDeadlineTomorrow,
} = require('./db');

let mongoServer;
const dbName = 'paybox-test';let dbClient;
let db;
jest.mock('./db', () => {
    const actualModule = jest.requireActual('./db');
    return {
        ...actualModule,
        connectDB: jest.fn(),
        closeDB: jest.fn(),
        getTodosWithDeadlineTomorrow:jest.fn()
    };
});
beforeAll(async () => {
    const mongoServer = await MongoMemoryServer.create();
    const mongoURI = mongoServer.getUri();
    dbClient = await MongoClient.connect(mongoURI, {
        useUnifiedTopology: true,
        useNewUrlParser: true,
    });
    db = dbClient.db(dbName);
});

describe('Database Module Tests', () => {
    beforeEach(async () => {
        await db.collection('todos').deleteMany({});
        await db.collection('todos-settings').deleteMany({});
        connectDB.mockResolvedValue(db);

    });

    it('should increment the ID', async () => {
        const res = await increaseId(db);
        expect(res).toBe(1);

    });

    it('should retrieve todos with deadline tomorrow', async () => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const todo = { title: 'Tomorrow Todo', deadline: tomorrow };
        await db.collection('todos').insertOne(todo);
        const today = new Date();
        const todoToday = { title: 'Today Todo', deadline: today };
        await db.collection('todos').insertOne(todoToday);
        getTodosWithDeadlineTomorrow.mockResolvedValue([{ title: 'Tomorrow Todo', deadline: tomorrow }])
        const todos = await getTodosWithDeadlineTomorrow();
        expect(todos.length).toBe(1);
        expect(todos[0].title).toBe(todo.title);
    });
});
