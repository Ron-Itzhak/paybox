const request = require('supertest');
const app = require('./notification');
const {
getTodosWithDeadlineTomorrow,
} = require('./db');
jest.mock('./db', () => {
    const actualModule = jest.requireActual('./db');
    return {
        ...actualModule,
        connectDB: jest.fn(),
        closeDB: jest.fn(),
        getTodosWithDeadlineTomorrow:jest.fn()
    };
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
        const mockTodos = [{ id: 1, title: 'Todo 1', deadline: '2023-07-26' }];
        getTodosWithDeadlineTomorrow.mockResolvedValue(mockTodos)
        // // Stub the db.getTodosWithDeadlineTomorrow() function to return the mock data
        // jest.mock('./db', () => ({
        //     getTodosWithDeadlineTomorrow: jest.fn().mockResolvedValue(mockTodos)
        // }));

        const res = await request(app).get('/sendNotifications');
        expect(res.status).toBe(200);
        expect(res.body).toEqual(mockTodos);

        jest.clearAllMocks(); // Clear all mocks after the test
    });

    it('should return a 500 status code when an error occurs during fetching todos', async () => {

        getTodosWithDeadlineTomorrow.mockRejectedValue(new Error('Database error'))

        const res = await request(app).get('/sendNotifications');
        expect(res.status).toBe(500);
        expect(res.body).toEqual({ error: 'Error sending notifications' });

        jest.clearAllMocks(); // Clear all mocks after the test
    });
});
