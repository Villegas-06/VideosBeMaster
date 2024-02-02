const UserController = require('../../controllers/user-controller');

module.exports = function (router) {
    router.post('/user', UserController.createUser);
    router.post("/users/authenticate", UserController.authenticate);
}