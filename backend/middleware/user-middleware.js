const User = require('../models/user-model');

module.exports.checkUserType = async function (req, res, next) {
    const userId = req.params.user_id;

    const userInfo = await User.getUserById(userId);

    if (userInfo) {
        if (userInfo.userType.trim() === 'admin') {
            // If the user type is "admin", go to the following route.
            next();
        } else {
            // If the user type is not "admin", it replies with an error message.
            return res.json({ success: false, message: "Permission denied. Only admin users can perform this action." });
        }
    } else {
        return res.json({ success: false, message: "User doesn't exist" });
    }


}

module.exports.checkUserRegister = async function (req, res, next) {

    const userId = req.params.user_id;

    const userExist = await User.getUserById(userId);

    if (userExist) {
        // If user exist can upload video
        next();
    } else {
        // If the user doesn't exist you cannot upload video
        return res.json({ success: false, message: "Permission denied. Only users register can perform this action." });
    }
}
