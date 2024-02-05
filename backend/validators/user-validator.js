
const { body, param } = require('express-validator');

const createUserValidationRules = (req) => {
    return [
        body('name').notEmpty().withMessage('Name is required'),
        body('lastname').notEmpty().withMessage('Lastname is required'),
        body('username').notEmpty().withMessage('Username is required'),
        body('email').notEmpty().withMessage('Email is required').isEmail().withMessage('Invalid email format'),
        body('password').notEmpty().withMessage('Password is required'),
    ];
};

const authenticateValidationRules = (req) => {
    return [
        body('email').notEmpty().withMessage('Email is required').isEmail().withMessage('Invalid email format'),
        body('password').notEmpty().withMessage('Password is required'),
    ];
};

const editUserValidationRules = (req) => {
    return [
        param('user_id').notEmpty().withMessage('User ID is required'),
        body('name').optional().notEmpty().withMessage('Name is required'),
        body('lastname').optional().notEmpty().withMessage('Lastname is required'),
        body('username').optional().notEmpty().withMessage('Username is required'),
        body('email').optional().notEmpty().withMessage('Email is required').isEmail().withMessage('Invalid email format'),
        body('password').optional().notEmpty().withMessage('Password is required'),
        body('userType').optional().notEmpty().withMessage('User Type is required').isIn(['user', 'admin']).withMessage('Invalid user type'),
    ];
};

module.exports = {
    createUserValidationRules,
    authenticateValidationRules,
    editUserValidationRules,
};
