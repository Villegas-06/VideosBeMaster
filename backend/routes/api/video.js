const VideoController = require('../../controllers/video-controller');
const UserMiddleware = require('../../middleware/user-middleware');
const passport = require('passport');

module.exports = function (router) {
    router.post('/videos/register/:user_id', passport.authenticate("jwt", { session: false }), UserMiddleware.checkUserRegister, VideoController.createVideo);
    router.get('/videos/react/:video_id', VideoController.reactVideo);
    router.get('/videos/my_videos/:user_id', passport.authenticate("jwt", {session: false}), UserMiddleware.checkUserRegister, VideoController.myVideos);
    router.get('/videos/video_type/:user_id', passport.authenticate("jwt", {session: false}), UserMiddleware.checkUserRegister, VideoController.videoType);
    router.get('/videos/top_rated/:user_id?', passport.authenticate("jwt", {session: false}), UserMiddleware.checkUserRegister, VideoController.topRatedVideos);
    router.get('/videos/view/:video_id/:user_id?', VideoController.viewVideo);
    router.put('/videos/edit/:video_id/:user_id', passport.authenticate("jwt", {session: false}), UserMiddleware.checkUserRegister, VideoController.editVideo);
    router.delete('/videos/delete/:video_id/:user_id', passport.authenticate("jwt", {session: false}), UserMiddleware.checkUserRegister, VideoController.deleteVideo)
}
