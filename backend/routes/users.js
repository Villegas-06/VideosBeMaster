const express = require('express');
const router = express.Router();

const jwt = require('jsonwebtoken');

const User = require('../models/user-model');
const config = require('../config/config');

router.post('/register', (req, res) => {
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
});

router.post("/authenticate", async (req, res, next) => {
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
                        nombre: user.name,
                        apellido: user.lastname,
                        username: user.username,
                        email: user.email,
                        tipo: user.userType,
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
});



module.exports = router;