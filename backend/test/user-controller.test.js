const request = require('supertest');
const express = require('express');
const app = express();
const jwt = require('jsonwebtoken');
const userController = require('../controllers/user-controller');

// Mock user data for testing
const mockUser = {
    name: 'John',
    lastname: 'Doe',
    username: 'johndoe',
    email: 'john@example.com',
    password: 'password123',
};

// Mock Express app
app.use(express.json());

// Mock Express route for createUser
app.post('/users/register', userController.createUser);
app.post('/users/authenticate', userController.authenticate);
app.delete('/users/delete/:user_id', userController.deleteUser);
app.get('/users/get_users/:user_id', userController.getUsers);
app.put('/users/edit/:user_id', userController.editUsers);

describe('User Controller Tests', () => {

    let token;  // Variable to store the JWT token

    // Before running the tests, generate a JWT token for authentication
    beforeAll(async () => {
        const response = await request(app)
            .post('/users/authenticate')
            .send({
                email: 'john@example.com',
                password: 'password123',
            });

        token = response.body.token;
    });

    test('createUser should create a new user', async () => {
        const response = await request(app)
            .post('/users/register')
            .send(mockUser);

        expect(response.statusCode).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.user.name).toBe(mockUser.name);
        expect(response.body.user.lastname).toBe(mockUser.lastname);
    });

    test('authenticate should return a JWT token for a valid user credentials', async () => {
        const response = await request(app)
            .post('/authenticate')
            .send({
                email: 'john@example.com',
                password: 'password123',
            });

        expect(response.statusCode).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.token).toBeDefined();
    });

    test('authenticate should return an error message for invalid user credentials', async () => {
        const response = await request(app)
            .post('/authenticate')
            .send({
                email: 'john@example.com',
                password: 'invalidPassword',
            });

        expect(response.statusCode).toBe(200);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe("Wrong password");
    });

    test('deleteUser should delete the user and return the deleted user', async () => {
        const response = await request(app)
            .delete(`/users/delete/65bd67602858dbec465e18af`)
            .set('Authorization', `Bearer ${token}`)
            .send();

        expect(response.statusCode).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe("User deleted successfully");
        expect(response.body.deletedUser).toBeDefined();
    });

    test('deleteUser should return a not found message for an invalid user ID', async () => {
        const response = await request(app)
            .delete(`/users/delete/65bd67602858dbec465e18af`)
            .set('Authorization', `Bearer ${token}`)
            .send();

        expect(response.statusCode).toBe(200);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe("User not found");
    });

    test('getUsers should return a list of all users', async () => {
        const response = await request(app)
            .get('/users/get_users/65bd6ad881a3bc06f7623ae3')
            .set('Authorization', `Bearer ${token}`)
            .send();

        expect(response.statusCode).toBe(200);
        expect(response.body.length).toBeGreaterThan(0);
    });

    test('editUsers should update the user and return the updated user', async () => {
        const response = await request(app)
            .put(`/users/edit/65bd6ad881a3bc06f7623ae3`)
            .set('Authorization', `Bearer ${token}`)
            .send({
                name: 'UpdatedName',
                userType: 'admin',
            });

        expect(response.statusCode).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe("User updated successfully");
        expect(response.body.updatedUser).toBeDefined();
    });

    test('editUsers should return a not found message for an invalid user ID', async () => {
        const response = await request(app)
            .put(`/users/edit/65bd6ad881a3bc06f7623ae4`)
            .set('Authorization', `Bearer ${token}`)
            .send({
                name: 'UpdatedName',
            });

        expect(response.statusCode).toBe(404);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe("User not found.");
    });

});