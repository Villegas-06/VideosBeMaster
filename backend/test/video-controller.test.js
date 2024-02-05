
const request = require('supertest');
const express = require('express');
const app = express();
const videoController = require('../controllers/video-controller');

// Mock video data for testing
const mockVideo = {
    title: 'Test Video',
    description: 'This is a test video',
    credits: 'Test Credits',
    videoUrl: 'https://example.com/test-video.mp4',
    category: 'tutorial',
    private: false,
    user_id: 'mockUserId',
};

// Mock Express app
app.use(express.json());

// Mock Express route for createVideo
app.post('/videos/register/:user_id', videoController.createVideo);
app.get('/videos/view/:video_id/:user_id?', videoController.viewVideo);
app.put('/videos/react/:video_id', videoController.reactVideo);
app.get('/videos/my_videos/:user_id', videoController.myVideos);
app.get('/videos/video_type/:user_id', videoController.videoType);

describe('Video Controller Tests', () => {
    test('createVideo should create a new video', async () => {
        const response = await request(app)
            .post('/videos/register/:user_id')
            .send(mockVideo);

        expect(response.statusCode).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.video.title).toBe(mockVideo.title);
        expect(response.body.video.description).toBe(mockVideo.description);
    });

    test('viewVideo should return the correct video for a valid user and video ID', async () => {
        const response = await request(app)
            .get(`/videos/view/65beef07cf105c64a310f61c/65bd67602858dbec465e18af`) // Replace mockVideoId with a valid video ID
            .send();

        expect(response.statusCode).toBe(200);
        expect(response.body.success).toBe(true);
    });

    test('viewVideo should return a permission denied message for an invalid user ID', async () => {
        const response = await request(app)
            .get(`/videos/view/65beef07cf105c64a310f61c/65bd67602858dbec465e18ag`) // Replace invalidUserId with an invalid user ID
            .send();

        expect(response.statusCode).toBe(200);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe("Permission denied. Only users register can perform this action.");
    });

    test('reactVideo should update the video and return the updated video', async () => {
        const response = await request(app)
            .put(`/videos/react/65beef07cf105c64a310f61c`)
            .send({
                like: true,
                rating: 4,
                comment: 'Great video!',
            });

        expect(response.statusCode).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe("Video updated successfully");
        expect(response.body.updatedVideo).toBeDefined();
    });

    test('reactVideo should return a not found message for an invalid video ID', async () => {
        const response = await request(app)
            .put(`/videos/react/65beef07cf105c64a310f62c`)
            .send({
                like: true,
            });

        expect(response.statusCode).toBe(404);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe("Video not found.");
    });

    test('myVideos should return the videos published by a user', async () => {
        const response = await request(app)
            .get(`/videos/my_videos/65bd67602858dbec465e18af`)
            .send();

        expect(response.statusCode).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.result).toBeDefined();
    });

    test('myVideos should return a message for a user with no published videos', async () => {
        const response = await request(app)
            .get(`/videos/my_videos/65c034479af89440d2e3490b`) // Replace anotherMockUserId with a different user ID
            .send();

        expect(response.statusCode).toBe(200);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe("You don't have any videos published");
    });

    test('videoType should return public or private videos based on the provided boolean', async () => {
        const responsePublic = await request(app)
            .post('/videos/video_type/65bd67602858dbec465e18af')
            .send({
                private: false,
            });

        const responsePrivate = await request(app)
            .post('/videos/video_type/65bd67602858dbec465e18af')
            .send({
                private: true,
            });

        expect(responsePublic.statusCode).toBe(200);
        expect(responsePublic.body.success).toBe(true);
        expect(responsePublic.body.result).toBeDefined();

        expect(responsePrivate.statusCode).toBe(200);
        expect(responsePrivate.body.success).toBe(true);
        expect(responsePrivate.body.result).toBeDefined();
    });

    test('videoType should return an error message for missing private boolean', async () => {
        const response = await request(app)
            .post('/videos/video_type/65bd67602858dbec465e18af')
            .send();

        expect(response.statusCode).toBe(200);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe("Error, must send if the video is private or not (boolean type)");
    });

});