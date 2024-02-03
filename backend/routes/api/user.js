const UserController = require('../../controllers/user-controller');
const passport = require('passport');
const UserMiddleware = require('../../middleware/user-middleware')

module.exports = function (router) {
    router.get('/users/get_users/:user_id', passport.authenticate("jwt", { session: false }), UserMiddleware.checkUserType, UserController.getUsers);
    router.post('/users/register', UserController.createUser);
    router.post('/users/authenticate', UserController.authenticate);
    router.put('/users/edit/:user_id', passport.authenticate("jwt", { session: false }), UserMiddleware.checkUserType, UserController.editUsers);
    router.delete('/users/delete/:user_id', passport.authenticate("jwt", { session: false }), UserMiddleware.checkUserType, UserController.deleteUser);
}
