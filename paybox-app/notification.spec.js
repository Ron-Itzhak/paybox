const request = require('supertest');
const {
    app, getTodosWithDeadlineTomorrow,
} = require('./notification');

const application = require('./app');
const {connectDB} = require("./db");
const {MongoMemoryServer} = require("mongodb-memory-server");
const {MongoClient} = require("mongodb");
jest.mock('./db', () => {
    const actualModule = jest.requireActual('./db');
    return {
        ...actualModule, connectDB: jest.fn(), closeDB: jest.fn(),
    };
});

let db;
let dbName = 'paybox';
beforeAll(async () => {
    const mongoServer = await MongoMemoryServer.create();
    const mongoURI = mongoServer.getUri();

    dbClient = await MongoClient.connect(mongoURI, {
        useUnifiedTopology: true, useNewUrlParser: true,
    });
    db = dbClient.db(dbName);
});

describe('Notifications Tests', () => {
    beforeEach(async () => {
        db.dropDatabase();
        connectDB.mockResolvedValue(db)
        await db.collection('todos').deleteMany({});

    });
    describe('GET /', () => {
        it('should return a 200 status code and a "notifications microservice is running" message', async () => {
            const res = await request(app).get('/');
            expect(res.status).toBe(200);
            expect(res.text).toBe('notifications microservice is running');
        });
    });

    describe('GET /sendNotifications', () => {
        it('should return a 200 status code and an array of todos', async () => {
            await db.collection('todos').insertOne({id: 1, title: 'Todo 1', deadline: '2023-07-28'});
            //const mockTodos = [{id: 1, title: 'Todo 1', deadline: '2023-07-26'}];
            const res = await request(app).get('/sendNotifications');
            expect(res.status).toBe(200);
            expect(res.body).toEqual([]);

            jest.clearAllMocks();
        });

    });

    describe('deadlineTomorrow', () => {
        it('should retrieve todos with deadline tomorrow', async () => {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            const todo = {title: 'Tomorrow Todo', deadline: tomorrow};
            const today = new Date();
            const todoToday = {title: 'Today Todo', deadline: today};
            await db.collection('todos').insertOne(todo);
            const todos = await getTodosWithDeadlineTomorrow();
            expect(todos.length).toBe(1);
            expect(todos[0].title).toBe(todo.title);
        });

    });
});