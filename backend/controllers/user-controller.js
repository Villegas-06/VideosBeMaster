'use strict';

const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const User = require('../models/user-model');
const config = require('../config/config');

exports.createUser = function (req, res) {
    if (req.body.name &&
        req.body.lastname &&
        req.body.username &&
        req.body.email &&
        req.body.password) {
        let newUser = new User({
            name: req.body.name,
            lastname: req.body.lastname,
            username: req.body.username,
            email: req.body.email,
            password: req.body.password
        });
        User.addUser(newUser, (result, err) => {
            if (err) {
                res.json({ success: false, message: "Error when registering the user", error: err });
            } else {
                delete result._doc.password
                res.json({ success: true, user: result });
            }
        });
    } else {
        res.json({ success: false, message: "Incomplete information" });
    }
};

exports.authenticate = async function (req, res) {
    const email = req.body.email;
    const password = req.body.password;

    try {
        const user = await User.getUserByEmail(email);

        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }

        User.comparePassword(password, user.password, (err, isMatch) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ success: false, message: "Authentication failed" });
            }

            if (isMatch) {
                // Continue with successful authentication logic
                const token = jwt.sign({ user }, config.secret, {
                    // expiresIn: 604800, // 1 week
                });

                res.json({
                    success: true,
                    token: "JWT " + token,
                    user: {
                        id: user._id,
                        _id: user._id,
                        name: user.name,
                        lastname: user.lastname,
                        username: user.username,
                        email: user.email,
                        user_type: user.userType,
                    },
                });
            } else {
                return res.json({ success: false, message: "Wrong password" });
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Authentication failed" });
    }
};

exports.deleteUser = async function (req, res) {
    const userId = req.params.user_id;

    try {
        const userExist = await User.getUserById(userId)

        if (userExist) {
            if (userId) {
                const deletedUser = await User.deleteUserById(userId);

                if (deletedUser) {
                    return res.json({ success: true, message: "User deleted successfully", deletedUser: deletedUser });
                } else {
                    return res.json({ success: false, message: "User not found" });
                }

            } else {
                return res.json({ success: false, message: "Invalid user ID" });
            }
        } else {
            return res.json({ success: false, message: "User doesn't exist" })
        }

    } catch (err) {
        return res.json({ success: false, message: "Error deleting user", error: err })
    }
};

exports.getUsers = function (req, res) {
    User.getAll()
        .then(result => {
            return res.json(result);
        })
        .catch(err => {
            return res.status(500).json({
                success: false,
                message: 'Cannot get Users',
                data: err
            });
        });
};

exports.editUsers = async function (req, res) {
    const userId = req.params.user_id;
    const newData = req.body;

    if (!userId) {
        return res.status(400).json({ success: false, message: "User Id is required for edit." })
    }
    if (newData.userType) {
        newData.userType = newData.userType.toLowerCase();
    }

    if (newData.password) {
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(newData.password, salt);
        newData.password = hash;
    }

    if (newData.userType && !['user', 'admin'].includes(newData.userType)) {
        return res.status(400).json({ success: false, message: "Invalid userType value only accept user or admin" });
    }

    User.findByIdAndUpdate(userId, newData, { new: true })
        .then(updateUser => {
            if (!updateUser) {
                return res.status(404).json({ success: false, message: "User not found." })
            }
            return res.json({ success: true, message: "User updated successfully", updatedUser: updateUser })
        })
        .catch(err => {
            return res.status(500).json({ success: false, message: 'Error updating user', error: err });
        })
}