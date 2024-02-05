'use strict';

const Video = require('../models/videos-model');
const User = require('../models/user-model');
const { validationResult } = require('express-validator');
const { videoValidationRules, reactVideoValidationRules, editVideoValidationRules } = require('../validators/video-validator');


exports.createVideo = function (req, res) {

    videoValidationRules(req);

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, message: "Validation failed", errors: errors.array() });
    }

    if (req.body.title &&
        req.body.description &&
        req.body.credits &&
        req.body.videoUrl &&
        req.body.category &&
        req.body.private &&
        req.params.user_id) {

        let category = req.body.category;

        category = category.toLowerCase();

        if (category && !['comedy', 'terror', 'motivation',
            'podcast', 'game', 'tutorial',].includes(category)) {
            return res.status(400).json({ success: false, message: "Invalid userType value only accept comedy, terror, motivation, podcast, game or tutorial" });
        }

        let newVideo = new Video({
            title: req.body.title,
            description: req.body.description,
            credits: req.body.credits,
            videoUrl: req.body.videoUrl,
            category: category,
            authorId: req.params.user_id,
            private: req.body.private
        });

        Video.addVideo(newVideo, (result, err) => {
            if (err) {
                res.json({ success: false, message: "Error when registering the video", error: err })
            } else {
                res.json({ success: true, video: result })
            }
        })
    } else {
        res.json({ success: false, message: "Incomplete information" })
    }
}

exports.viewVideo = async function (req, res) {
    const videoId = req.params.video_id;
    const userId = req.params.user_id || null;

    try {

        if (userId === null) {
            const videosLonger = await Video.find({ private: false, _id: videoId });

            return res.json({ success: true, result: videosLonger, message: "You only view public videos now, if you want all videos you may create a account" });
        } else {
            const videosLonger = await Video.find({ _id: videoId });

            const userInfo = await User.getUserById(userId)

            if (userInfo) {
                return res.json({ success: true, result: videosLonger });
            } else {
                return res.json({ success: false, message: "Permission denied. Only users register can perform this action." })
            }

        }

    } catch (err) {
        return res.status(401).json({ success: false, message: err })
    }
}

exports.reactVideo = async function (req, res) {

    reactVideoValidationRules(req);

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, message: "Validation failed", errors: errors.array() });
    }

    const videoId = req.params.video_id;

    try {
        const videoCharacteristics = await Video.getVideoById(videoId);

        // Extract existing comments and user ratings
        let comments = videoCharacteristics.comentaries || [];
        let userRatings = videoCharacteristics.userRatings || [];

        // Add data such as comments, video ratings, likes, etc. According to data received to put in model
        const addData = {
            viewsNumber: videoCharacteristics.viewsNumber + 1,
            numLikes: (req.body.like) ? videoCharacteristics.numLikes + 1 : videoCharacteristics.numLikes,
        };

        if (req.body.rating) {
            userRatings.push(req.body.rating);
            addData.userRatings = userRatings;
        }

        if (req.body.comment) {
            comments.push(req.body.comment);
            addData.comentaries = comments;
        }

        const updatedVideo = await Video.findByIdAndUpdate(videoId, addData, { new: true });

        if (!updatedVideo) {
            return res.status(404).json({ success: false, message: "Video not found." });
        }

        const videoRatings = await Video.getVideoById(videoId);

        let userPutRatings = videoRatings.userRatings || [];

        if (userPutRatings.length !== 0) {
            const averageRatings = calculateAverage(userPutRatings);

            const averageData = {
                videoRating: averageRatings
            }

            const updatedRating = await Video.findByIdAndUpdate(videoId, averageData, { new: true });
        }

        return res.json({ success: true, message: "Video updated successfully", updatedVideo: updatedVideo });
    } catch (err) {
        return res.status(500).json({ success: false, message: 'Error updating video', error: err });
    }
};

exports.myVideos = async function (req, res) {
    const userId = req.params.user_id;

    try {

        const myVideos = await Video.find({ authorId: userId });

        if (myVideos.length === 0) {
            return res.json({ success: false, message: "You don't have any videos published" })
        }

        return res.json({ success: true, result: myVideos });

    } catch (err) {
        return res.status(401).json({ success: false, message: err })
    }
}

exports.videoType = async function (req, res) {

    const privateVideo = req.body.private;

    try {
        if (privateVideo !== undefined) {
            let query = {};

            if (privateVideo) {
                query = { "private": true };
            } else {
                query = { "private": false };
            }

            const generalVideos = await Video.find(query);

            if (generalVideos.length === 0) {
                return res.json({ success: true, message: privateVideo ? "No private videos found" : "No public videos found" });
            } else {
                return res.json({ success: true, result: generalVideos });
            }
        } else {
            return res.json({ success: false, message: "Error, must send if the video is private or not (boolean type)" });
        }
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}

exports.topRatedVideos = async function (req, res) {

    const userId = req.params.user_id || null;

    if (userId === null) {
        const topRatedVideos = await Video.aggregate([
            {
                $addFields: {
                    averageRating: {
                        $avg: "$userRatings"
                    }
                }
            },
            {
                private: false
            },
            {
                $sort: {
                    averageRating: -1
                }
            }
        ]);

        return res.json({ success: true, message: topRatedVideos })

    } else {
        const topRatedVideos = await Video.aggregate([
            {
                $addFields: {
                    averageRating: {
                        $avg: "$userRatings"
                    }
                }
            },
            {
                private: true
            },
            {
                $sort: {
                    averageRating: -1
                }
            }
        ]);

        return res.json({ success: true, message: topRatedVideos })

    }


}



exports.editVideo = async function (req, res) {

    editVideoValidationRules(req);

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, message: "Validation failed", errors: errors.array() });
    }


    const videoId = req.params.video_id;
    const newData = req.body;

    if (!videoId) {
        return res.status(400).json({ success: false, message: "Video Id is required for edit." })
    }

    if (newData.category) {
        newData.category = newData.userType.toLowerCase();
        let category = newData.category;

        if (category && !['comedy', 'terror', 'motivation',
            'podcast', 'game', 'tutorial',].includes(category)) {
            return res.status(400).json({ success: false, message: "Invalid category value only accept comedy, terror, motivation, podcast, game or tutorial" });
        }
    }

    Video.findByIdAndUpdate(videoId, newData, { new: true })
        .then(updateVideo => {
            if (!updateVideo) {
                return res.status(404).json({ success: false, message: "Video not found." })
            }
            return res.json({ success: true, message: "Video updated successfully", updateVideo: updateVideo })
        })
        .catch(err => {
            return res.status(500).json({ success: false, message: 'Error updating video', error: err });
        })
}


exports.deleteVideo = async function (req, res) {
    const videoId = req.params.video_id;

    try {
        const videoExist = await Video.getVideoById(videoId);

        if (videoExist) {
            if (videoId) {
                const deletedVideo = await Video.deleteVideoById(videoId);

                if (deletedVideo) {
                    return res.json({ success: true, message: "Video deleted successfully", deletedVideo: deletedVideo });
                } else {
                    return res.json({ success: false, message: "Video not found" });
                }

            } else {
                return res.json({ success: false, message: "Invalid video ID" });
            }
        } else {
            return res.json({ success: false, message: "Video doesn't exist" })
        }

    } catch (err) {
        return res.json({ success: false, message: "Error deleting video", error: err })
    }
}


function calculateAverage(array) {

    if (array.length === 0) {
        return 0;
    }

    const sum = array.reduce((accumulator, value) => accumulator + value, 0);
    const average = sum / array.length;

    return average
}