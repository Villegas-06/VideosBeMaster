const VideoController = require('../../controllers/video-controller');
const UserMiddleware = require('../../middleware/user-middleware');
const passport = require('passport');

module.exports = function (router) {
    router.post('/videos/register/:user_id', passport.authenticate("jwt", { session: false }), UserMiddleware.checkUserRegister, VideoController.createVideo);
    router.get('/videos/view/:video_id', VideoController.viewVideo);
}