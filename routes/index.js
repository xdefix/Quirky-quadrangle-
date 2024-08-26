const express = require('express');
const router = express.Router();
const indexController = require('../controllers/userController');
const authenticationService = require('../services/authentication');
const { authenticateJWT } = require('../services/authentication');
const userModel = require('../models/userModel');
const app = express();

// Error handling middleware
const errorHandler = (err, req, res, next) => {
    console.error(err);
    res.status(500).send('Internal Server Error');
};

// Routes
router.get('/user/:id', authenticateJWT, indexController.getUser); // GET route for retrieving user information
router.post('/user/:id/editIt', authenticateJWT, indexController.editUser); // POST route for editing user information
router.get('/user/:id/edit', authenticateJWT, indexController.getEditUserPage); // GET route for retrieving user edit page

router.get('/', (req, res) => {
    res.render('homePage');
});

router.get('/register', indexController.registerUser); // GET route for user registration
router.post('/createUser', indexController.createUser); // POST route for creating a new user

router.get('/login', (req, res) => {
    res.render('login');
});
router.post('/login', (req, res) => {
    userModel.getAllUsers()
        .then((users) => {
            authenticationService.authenticateUser(req, users, res);
        })
        .catch((err) => {
            next(err); // Pass the error to the error handling middleware
        });
});

router.get('/createPost', authenticateJWT, (req, res) => {
    res.render('createPost');
});
router.post('/createPost', authenticateJWT, indexController.createPost); // POST route for creating a new post

router.get('/userPosts', authenticateJWT, indexController.getUserData); // GET route for retrieving user posts
router.post('/post/:id/delete', authenticateJWT, indexController.deletePost); // POST route for deleting a post

router.get('/events', authenticateJWT, indexController.getsUserData); // GET route for retrieving user events
router.post('/event/:id/delete', authenticateJWT, indexController.deleteEvent); // POST route for deleting an event

router.post('/like/:postId', authenticateJWT, indexController.updateLikeCount); // POST route for updating like count of a post
router.get('/comment/:id/delete', authenticateJWT, indexController.deleteComment); // POST route for deleting a comment


router.get('/feed', authenticateJWT, indexController.getUsersData); // GET route for retrieving user feed

router.get('/sports', authenticateJWT, (req, res) => {
    res.render('sports');
});

router.get('/userProfile', authenticateJWT, (req, res, next) => {
    userModel.getUser(req.user.id)
        .then((user) => {
            res.render('userProfile', { user: user });
        })
        .catch((err) => {
            next(err); // Pass the error to the error handling middleware
        });
});

router.get('/guest', (req, res) => {
    res.render('guest');
});

router.get('/addEvent', authenticateJWT, (req, res) => {
    res.render('addEvent');
});
router.post('/addEvent', authenticateJWT, (req, res, next) => {
    const userId = req.user.id;
    const event = req.body.content;


    userModel.addEvent(userId, event)
        .then((result) => {
            res.redirect('/events');
        })
        .catch((err) => {
            next(err); // Pass the error to the error handling middleware
        });
    
});

router.get('/logout', (req, res) => {
    res.cookie('accessToken', '', { maxAge: 0 });
    res.redirect('/');
});

router.get('/oilWrestling', (req, res) => {
    res.render('oilWrestling');
});
router.get('/oilWrestlingLI', (req, res) => {
    res.render('oilWrestlingLI');
});
router.get('/cheeseRolling', (req, res) => {
    res.render('cheeseRolling');
});
router.get('/cheeseRollingLI', (req, res) => {
    res.render('cheeseRollingLI');
});
router.get('/uderwaterHokey', (req, res) => {
    res.render('uderwaterHokey');
});
router.get('/uderwaterHokeyLI', (req, res) => {
    res.render('uderwaterHokeyLI');
});
router.get('/ostrichRacing', (req, res) => {
    res.render('ostrichRacing');
});
router.get('/ostrichRacingLI', (req, res) => {
    res.render('ostrichRacingLI');
});

router.post('/post/:postId/comment', authenticateJWT, indexController.addComment); // POST route for adding a comment to a post


// Attach error handling middleware
app.use((err, req, res, next) => {
    // Set the status code based on the error or use a default value
    const statusCode = err.statusCode || 500;

    // Render the error page template with the error details
    res.status(statusCode).render('error.ejs', { error: err });
});

module.exports = router;
