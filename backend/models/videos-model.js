const mongoose = require('mongoose');

const VideoSchema = mongoose.Schema({
    title: { type: String, require: true },
    description: { type: String, require: true },
    credits: { type: String, require: false },
    videoUrl: { type: String, require: true },
    category: {
        type: String,
        require: true,
        enum: ['comedy', 'terror', 'motivation',
            'podcast', 'game', 'tutorial']
    },
    authorId: { type: String, require: true },
    numLikes: { type: Number, require: false, default: 0 },
    comentaries: { type: Array, require: false },
    videoRating: { type: Number, require: true, default: 0.0 },
    viewsNumber: { type: Number, require: false, default: 0 },
    private: { type: Boolean, require: true },
    userRatings: { type: Array, require: false },

    publicatedAt: { type: Date, require: false, default: Date.now },
});


VideoSchema.statics = {
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

const Video = (module.exports = mongoose.model("Video", VideoSchema));

// Specific backend methods

module.exports.getVideoById = function (id) {
    return Video.findById(id).exec();
}

module.exports.deleteVideoById = async function (id) {
    try {
        const video = await Video.deleteOne({ _id: id });
        return video;
    } catch (err) {
        throw err;
    }
}

module.exports.addVideo = async function (newVideo, callback) {
    try {
        const video = new Video(newVideo);
        const savedVideo = await video.save();
        callback(savedVideo, null);
    } catch (err) {
        callback(null, err);
    }
}

module.exports.getCountVideos = function (callback) {
    Video.count().exec(callback);
}

module.exports.getAll = function (obj) {
    return Video.find(obj)
}