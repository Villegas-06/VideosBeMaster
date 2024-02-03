'use strict';

const Video = require('../models/videos-model');

exports.createVideo = function (req, res) {

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

        return res.json({ success: true, message: "Video updated successfully", updatedVideo: updatedVideo });
    } catch (err) {
        return res.status(500).json({ success: false, message: 'Error updating video', error: err });
    }
};