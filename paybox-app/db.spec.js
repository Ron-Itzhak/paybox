const { MongoMemoryServer } = require('mongodb-memory-server');
const { MongoClient } = require('mongodb');

const {
    connectDB,
    getDB,
    closeDB,
    insertTodo,
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

afterAll(async () => {
    await dbClient.close();
    await mongoServer.stop();

});



describe('Database Module Tests', () => {
    beforeEach(async () => {
        await db.collection('todos').deleteMany({});
        await db.collection('todos-settings').deleteMany({});
        connectDB.mockResolvedValue(db);

    });

    afterEach(() => {
        closeDB();
    });

    it('should increment the ID', async () => {
        const res = await increaseId(db);
        expect(res).toBe(1);

    });


it('should insert a todo and increment the ID and expect that title,content,date', async () => {
        const todo = { title: 'Test Todo', content: 'Test content', deadline: new Date() };
        await insertTodo(todo);

        const todos = await db.collection('todos').find({}).toArray();
        expect(todos.length).toBe(0);

        const settings = await db.collection('todos-settings').findOne({});
        expect(settings.todo_id).toBe(1);
    });

    it('should retrieve todos with deadline tomorrow', async () => {
        // Insert a todo with tomorrow's deadline
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const todo = { title: 'Tomorrow Todo', deadline: tomorrow };
        await db.collection('todos').insertOne(todo);

        // Insert a todo with today's deadline (should not be retrieved)
        const today = new Date();
        const todoToday = { title: 'Today Todo', deadline: today };
        await db.collection('todos').insertOne(todoToday);

        const todos = await getTodosWithDeadlineTomorrow();
        expect(todos.length).toBe(1);
        expect(todos[0].title).toBe(todo.title);
    });
});
