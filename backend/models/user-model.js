const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const UserSchema = mongoose.Schema({

    name: { type: String, require: true },
    lastname: { type: String, require: true },
    username: { type: String, require: true },
    email: { type: String, require: true },
    password: { type: String, require: true },
    userType: {
        type: String,
        require: false,
        enum: ['user', 'admin'],
        default: 'user'
    },

    createdAt: { type: Date, require: false, default: Date.now }

})

UserSchema.statics = {
    get: function (query, callback) {
        this.findOne(query).exec(callback)
    },
    getAll: function (query, callback) {
        this.find(quer, { password: 0 }).exec(callback)
    },
    updateById: function (id, updateData, callback) {
        this.findOneAndUpdate(
            { _id: id },
            { $set: updateData },
            { new: true },
            callback
        )
    },
    removeById: function (removeData, callback) {
        this.findOneAndRemove(removeData, callback)
    },
    create: function (data, callback) {
        {
            const user = new this(data);
            user.save(callback)
        }
    }
}

const User = (module.exports = mongoose.model("User", UserSchema));

// Specific backend methods

module.exports.getUserById = function (id) {
    return User.findById(id).exec()
}


module.exports.getUserByEmail = async function (email) {
    try {
        const user = await User.findOne({ email: email });
        return user;
    } catch (err) {
        throw err;
    }
};

module.exports.addUser = async function (newUser, callback) {
    try {
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(newUser.password, salt);
        newUser.password = hash;

        // Use the model directly, not the schema
        const existingUser = await User.findOne({ email: newUser.email });

        if (!existingUser) {
            const savedUser = await new User(newUser).save();
            callback(savedUser, null);
        } else {
            callback(null, "User exists");
        }
    } catch (err) {
        callback(null, err);
    }
};


module.exports.comparePassword = function (candidatePassword, hash, callback) {
    bcrypt.compare(candidatePassword, hash, (err, isMatch) => {
        if (err) {
            return callback(err);
        }
        callback(null, isMatch);
    });
};


module.exports.getCountUsers = function (obj, callback) {
    User.count().exec(callback);
};


module.exports.getUsers = function (obj, callback) {
    User.find(obj).exec(callback);
}
