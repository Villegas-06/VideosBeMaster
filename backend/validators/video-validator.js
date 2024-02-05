
const { body, param } = require('express-validator');

const createVideoValidationRules = (req) => {
    return [
        body('title').notEmpty().withMessage('Title is required'),
        body('description').notEmpty().withMessage('Description is required'),
        body('credits').notEmpty().withMessage('Credits is required'),
        body('videoUrl').notEmpty().withMessage('Video URL is required').isURL().withMessage('Invalid URL format'),
        body('category').notEmpty().withMessage('Category is required').custom(value => {
            const validCategories = ['comedy', 'terror', 'motivation', 'podcast', 'game', 'tutorial'];
            if (!validCategories.includes(value.toLowerCase())) {
                throw new Error('Invalid category. Accepted values are comedy, terror, motivation, podcast, game, tutorial');
            }
            return true;
        }),
        body('private').notEmpty().withMessage('Private field is required').isBoolean().withMessage('Private field must be a boolean'),
        param('user_id').notEmpty().withMessage('User ID is required'),
    ];
};


const videoValidationRules = (req) => {
    return [
        body('title').notEmpty().withMessage('Title is required'),
        body('description').notEmpty().withMessage('Description is required'),
        body('credits').notEmpty().withMessage('Credits is required'),
        body('videoUrl').notEmpty().withMessage('Video URL is required').isURL().withMessage('Invalid URL format'),
        body('category').notEmpty().withMessage('Category is required').custom(value => {
            const validCategories = ['comedy', 'terror', 'motivation', 'podcast', 'game', 'tutorial'];
            if (!validCategories.includes(value.toLowerCase())) {
                throw new Error('Invalid category. Accepted values are comedy, terror, motivation, podcast, game, tutorial');
            }
            return true;
        }),
        body('private').notEmpty().withMessage('Private field is required').isBoolean().withMessage('Private field must be a boolean'),
        param('user_id').notEmpty().withMessage('User ID is required'),
    ];
};

const reactVideoValidationRules = (req) => {
    return [
        param('video_id').notEmpty().withMessage('Video ID is required'),
        body('like').optional().isBoolean().withMessage('Like field must be a boolean'),
        body('rating').optional().isNumeric().withMessage('Rating field must be a number'),
        body('comment').optional().isString().withMessage('Comment field must be a string'),
    ];
};

const editVideoValidationRules = (req) => {
    return [
        param('video_id').notEmpty().withMessage('Video ID is required'),
        body('title').optional().notEmpty().withMessage('Title is required'),
        body('description').optional().notEmpty().withMessage('Description is required'),
        body('credits').optional().notEmpty().withMessage('Credits is required'),
        body('videoUrl').optional().notEmpty().withMessage('Video URL is required').isURL().withMessage('Invalid URL format'),
        body('category').optional().notEmpty().withMessage('Category is required').custom(value => {
            const validCategories = ['comedy', 'terror', 'motivation', 'podcast', 'game', 'tutorial'];
            if (!validCategories.includes(value.toLowerCase())) {
                throw new Error('Invalid category. Accepted values are comedy, terror, motivation, podcast, game, tutorial');
            }
            return true;
        }),
        body('private').optional().notEmpty().withMessage('Private field is required').isBoolean().withMessage('Private field must be a boolean'),
        param('user_id').optional().notEmpty().withMessage('User ID is required'),
    ];
};

module.exports = {
    createVideoValidationRules,
    videoValidationRules,
    reactVideoValidationRules,
    editVideoValidationRules,
};