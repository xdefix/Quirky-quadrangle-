const indexModel = require('../models/userModel');
const uuid = require('uuid');
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;

// Render the registration form
exports.registerUser = (req, res) => {
  res.render('register');
};

// Create a new user
exports.createUser = (req, res) => {
  // Check if a file is uploaded
  if (!req.files || !req.files.picture) {
    return res.status(400).send('No file uploaded');
  }

  const { name, surname, email, password } = req.body;

  // Generate a UUID for the image
  const imageUUID = uuid.v4();
  const picture = req.files.picture;
  const extension = picture.name.split('.').pop();
  const fileName = `${imageUUID}.${extension}`;

  // Hash the password
  bcrypt.hash(password, 10, function (err, hash) {
    if (err) {
      return res.status(500).send('Internal Server Error');
    }

    // Move the uploaded picture to the appropriate directory
    picture.mv(`public/uploads/${fileName}`)
      .then(() => {
        // Create the user in the database
        return indexModel.createUser(name, surname, email, hash, `/uploads/${fileName}`);
      })
      .then(() => {
        res.redirect('/');
      })
      .catch(err => {
        next(err)
      });
  });
};

// Create a new post
exports.createPost = (req, res, next) => {
  const { post } = req.body;
  const userId = req.user.id;

  // Create the post in the database
  indexModel.createPost(userId, post)
    .then(() => {
      res.redirect('/userPosts');
    })
    .catch(err => {
      next(err)
    });
};

// Get posts for a specific user
exports.getUserPosts = (req, res, next) => {
  const userId = req.params.userId;

  // Retrieve posts for the user from the database
  indexModel.getUserPosts(userId)
    .then((posts) => {
      res.render('userPosts', { posts });
    })
    .catch(err => {
      next(err)
    });
};

// Delete a post and its associated comments
exports.deletePost = (req, res, next) => {
  const postId = req.params.id;

  // Delete comments associated with the post first
  indexModel.deleteComments(postId)
    .then(() => {
      // Once comments are deleted, delete the post
      return indexModel.deletePost(postId);
    })
    .then(() => {
      res.redirect('/userPosts');
    })
    .catch(err => {
      next(err)
    });
};

// Get user data and posts for the user profile
exports.getUserData = (req, res, next) => {
  const userId = req.user.id;

  // Retrieve user data and posts for the user from the database
  Promise.all([
    indexModel.getUser(userId),
    indexModel.getUserPosts(userId)
  ])
    .then(([user, posts]) => {
      if (user) {
        res.render('userPosts', { user: user, posts: posts });
      } else {
        throw new Error("User not found");
      }
    })
    .catch(error => {
      next(err);
    });
};

// Delete a comment
exports.deleteComment = (req, res, next) => {
  const commentId = req.params.id;

  // Delete the comment from the database
  indexModel.deleteComment(commentId)
    .then(() => {
      res.redirect('/feed'); // Redirect to the appropriate page
    })
    .catch(err => {
      next(err)
    });
};

// Get user profile
exports.getUser = (req, res, next) => {
  if (parseInt(req.params.id) !== req.user.id) {
    return res.status(403).send('Unauthorized access');
  }

  // Retrieve user data from the database
  indexModel.getUser(parseInt(req.user.id))
    .then(user => {
      if (user) {
        res.render('userProfile', { user: user });
      } else {
        throw new Error("User not found");
      }
    })
    .catch(error => {
      next(err)
    });
};

// Edit user profile
exports.editUser = (req, res, next) => {
  if (!req.files || !req.files.picture) {
    return res.status(400).send('No file uploaded');
  }

  const userId = req.params.id;
  const { name, surname } = req.body;

  let picture = null;

  if (req.files && req.files.picture) {
    const imageUUID = uuid.v4();
    const pictureFile = req.files.picture;
    const extension = pictureFile.name.split('.').pop();
    const fileName = `${imageUUID}.${extension}`;

    picture = `/uploads/${fileName}`;

    // Move the uploaded picture to the appropriate directory
    pictureFile.mv(`public/uploads/${fileName}`)
      .then(() => {
        // Update the user profile in the database
        return indexModel.updateUser(userId, name, surname, picture);
      })
      .then(() => {
        res.redirect('/userProfile');
      })
      .catch(err => {
        next(err)
      });
  }
};

// Get user data for editing the user profile
exports.getEditUserPage = async (req, res, next) => {
  try {
    const user = await indexModel.getUserForEdit(req.params.id);
    if (!user || user.length === 0) {
      res.status(404).send('User not found');
    } else {
      res.render('editUser', { user: user[0] });
    }
  } catch (error) {
    next(err);
  }
};

// Get user data and posts for the feed
exports.getUsersData = async (req, res, next) => {
  try {
    const user = await indexModel.getUser(req.user.id);
    const posts = await indexModel.getAllPosts();

    // Get comments for each post and add them to the post object
    for (let post of posts) {
      post.comments = await indexModel.getComments(post.postId);
      post.liked = await indexModel.userHasLikedPost(req.user.id, post.postId);
    }


    if (user) {
      res.render('feed', { user: user, posts: posts });
    } else {
      throw new Error("Posts not found");
    }
  } catch (error) {
    next(err);
  }
};

// Add an event
exports.addEvent = (req, res, next) => {
  const { event } = req.body;
  const userId = req.user.id;

  // Add the event to the database
  indexModel.addEvent(userId, event)
    .then(() => {
      res.redirect('/events');
    })
    .catch(err => {
      next(err)
    });
};

// Get user events
exports.getUserEvents = (req, res) => {
  const userId = req.params.userId;

  // Retrieve events for the specified user from the database
  indexModel.getUserEvents(userId)
    .then((events) => {
      res.render('events', { events });
    })
    .catch(err => {
      next(err)
    });
};

// Delete an event
exports.deleteEvent = (req, res) => {
  const eventID = req.params.id;

  // Delete the event from the database
  indexModel.deleteEvent(eventID)
    .then(() => {
      res.redirect('/events');
    })
    .catch(err => {
      next(err)
    });
};

// Get user data and events for the events page
exports.getsUserData = (req, res, next) => {
  Promise.all([indexModel.getUser(req.user.id), indexModel.getAllEvents()])
    .then(([user, events]) => {
      if (user) {
        // Get the logged-in user's information from the signed cookie ("accessToken")
        // It will be used to compare if the name of the person that created the post matches the name of the logged-in user
        let cookie = getCookieInfo(req);
        res.render('events', { user: user, events: events, cookieUser: cookie });
      } else {
        throw new Error("Events not found");
      }
    })
    .catch(error => {
      next(err)
    });
};

// Add a comment to a post
exports.addComment = (req, res, next) => {
  const postId = req.params.postId;
  const userId = req.user.id;
  const { comment } = req.body;

  // Add the comment to the database
  indexModel.addComment(postId, comment, userId)
    .then(() => {
      res.redirect('/feed');
    })
    .catch(err => {
      next(err)
    });
};

// Update the like count for a post
exports.updateLikeCount = (req, res) => {
  const postId = req.params.postId;
  const userId = req.user.id;

  // Retrieve the current like count from the database
  indexModel.getPostLikes(postId)
    .then(currentLikes => {
      // Update the like count based on the user's action
      // Update the like count in the database
      indexModel.updatePostLikes(postId, userId)
        .then(async () => {
          const liked = await indexModel.userHasLikedPost(userId, postId);
          res.status(200).json({ liked });
        })
        .catch(error => {
          next(err)
        });
    })
    .catch(error => {
      next(err)
    });
};

// Helper function to get information from the cookie
function getCookieInfo(req) {
  if (req.cookies && req.cookies.accessToken) {
    let token = req.cookies.accessToken;
    try {
      let cookie = jwt.verify(token, ACCESS_TOKEN_SECRET);
      return cookie;
    } catch {
      return null;
    }
  }
};
