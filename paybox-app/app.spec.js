const { MongoMemoryServer } = require('mongodb-memory-server');
const { MongoClient } = require('mongodb');
const request = require('supertest');
const app = require('./app');
require("dotenv").config();

const {
    getTodosWithDeadlineTomorrow, connectDB, insertTodo,
} = require('./db');
jest.mock('./db', () => {
    const actualModule = jest.requireActual('./db');
    return {
        ...actualModule,
        connectDB: jest.fn(),
        insertTodo: jest.fn(),
    };
});


let db;
let dbName = 'paybox';
beforeAll(async () => {
    const mongoServer = await MongoMemoryServer.create();
    const mongoURI = mongoServer.getUri();

    dbClient = await MongoClient.connect(mongoURI, {
        useUnifiedTopology: true,
        useNewUrlParser: true,
    });
    db = dbClient.db(dbName);
});

describe('Express App Tests', () => {
    beforeEach(async () => {
        await db.collection('todos').deleteMany({});
        connectDB.mockResolvedValue(db)

    });

    it('should respond with "App microservice is running!" on the root route', async () => {
        const response = await request(app).get('/');
        expect(response.status).toBe(200);
        expect(response.text).toBe('App microservice is running!');
    });

    it('should create a new todo on POST /todos', async () => {

        const newTodo = {
            title: 'Test Todo',
            content: 'Test Content',
            deadline: new Date(),
        };
        insertTodo.mockResolvedValue({acknowledged: true,insertedId:1234})
        const response = await request(app).post('/todos').send(newTodo);
        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('acknowledged', true);
        expect(response.body).toHaveProperty('insertedId', );
    });

    it('should retrieve todos on GET /todos', async () => {
        const response = await request(app).get('/todos');
        expect(response.status).toBe(200);
        expect(response.body).toHaveLength(0);
    });

    it('should update a todo on PUT /todos/:id', async () => {
        const todo = { title: 'Old Todo', content: 'Old Content', deadline: new Date() };
        const response = await request(app).post('/todos').send(todo);

        const updatedTodo = {
            title: 'New Todo',
            content: 'New Content',
            deadline: new Date(),
        };

        const putResponse = await request(app).put(`/todos/${response.body._id}`).send(updatedTodo);

        expect(putResponse.status).toBe(200);
        expect(putResponse.body).toBe('updated successfully');

        const getResponse = await request(app).get('/todos');
        expect(getResponse.body).toHaveLength(0);
    });

    it('should delete a todo on DELETE /todos/:id', async () => {
        const todo = { title: 'Test Todo', content: 'Test Content', deadline: new Date() };
        const response = await request(app).post('/todos').send(todo);
        const id = 124;
        const deleteResponse = await request(app).delete(`/todos/${id}`);

        expect(deleteResponse.status).toBe(200);
        expect(deleteResponse.body).toBe(`${id} deleted Successfully`);

        const getResponse = await request(app).get('/todos');
        expect(getResponse.body).toHaveLength(0);
    });
});
