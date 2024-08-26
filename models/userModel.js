const db = require('../services/database.js');
const vader = require('vader-sentiment');


// Create a new user in the database
exports.createUser = (name, surname, email, password, picture) => {
  return new Promise((resolve, reject) => {
    if (getSentiment(name) && getSentiment(surname)) {
      reject({message: "Please make sure your name or surname aren't offensive"})
      return
    }
    const sql = 'INSERT INTO sportUsers (name, surname, email, password, picture) VALUES (?, ?, ?, ?, ?)';
    db.config.query(sql, [name, surname, email, password, picture], (err, result) => {
      if (err) {
        const errorMessage = 'Error creating user: ' + err.message;
        reject(new Error(errorMessage));
      } else {
        resolve(result);
      }
    });
  });
};

// Create a new post for a user in the database
exports.createPost = (userId, post) => {
  return new Promise((resolve, reject) => {
    if (!post) {
      const error = new Error('Post content is required');
      error.statusCode = 400; // Bad Request
      reject(error);
    } else {

      if (getSentiment(post)) {
        reject({message: "Please make sure your post isn't offensive"})
        return
      }

      const sql = 'INSERT INTO userPost (userId, post) VALUES (?, ?)';
      db.config.query(sql, [userId, post], (err, result) => {
        if (err) {
          const errorMessage = 'Error creating post: ' + err.message;
          reject(new Error(errorMessage));
        } else {
          resolve(result);
        }
      });
    }
  });
};

// Update a user's information in the database
exports.updateUser = (userId, name, surname, picture) => {
  return new Promise((resolve, reject) => {

    if (getSentiment(name) && getSentiment(surname)) {
      reject({message: "Please make sure your name or surname aren't offensive"})
      return
    }

    const sql = 'UPDATE sportUsers SET name = ?, surname = ?, picture = ? WHERE id = ?';
    db.config.query(sql, [name, surname, picture, userId], (err, result) => {
      if (err) {
        const errorMessage = 'Error updating user: ' + err.message;
        reject(new Error(errorMessage));
      } else {
        resolve(result);
      }
    });
  });
};

// Retrieve a user's information for editing
exports.getUserForEdit = (userId) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM sportUsers WHERE id = ?';
    db.config.query(sql, [userId], (err, result) => {
      if (err) {
        const errorMessage = 'Error retrieving user: ' + err.message;
        reject(new Error(errorMessage));
      } else {
        resolve(result);
      }
    });
  });
};

// Retrieve a user's posts from the database
exports.getUserPosts = (userId) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM userPost WHERE userId = ? ORDER BY created DESC';

    db.config.query(sql, [userId], (err, results) => {
      if (err) {
        const errorMessage = 'Error retrieving user posts: ' + err.message;
        reject(new Error(errorMessage));
      } else {
        resolve(results);
      }
    });
  });
};

// Retrieve a user's information from the database
exports.getUser = (user_id) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM sportUsers WHERE id = ?';
    db.config.query(sql, [user_id], function (err, user, fields) {
      if (err) {
        const errorMessage = 'Error retrieving user: ' + err.message;
        reject(new Error(errorMessage));
      } else {
        resolve(user[0]);
      }
    });
  });
};

// Retrieve all users from the database
exports.getAllUsers = () => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM sportUsers';
    db.config.query(sql, (err, result) => {
      if (err) {
        const errorMessage = 'Error retrieving users: ' + err.message;
        reject(new Error(errorMessage));
      } else {
        resolve(result);
      }
    });
  });
};

// Retrieve all posts from the database
exports.getAllPosts = () => {
  return new Promise((resolve, reject) => {
    const sql =
      'SELECT sportUsers.name, posts.post, posts.postId, posts.likes, sportUsers.picture FROM sportUsers JOIN posts ON sportUsers.id = posts.userId ORDER BY created DESC';
    db.config.query(sql, (err, results) => {
      if (err) {
        const errorMessage = 'Error retrieving posts: ' + err.message;
        reject(new Error(errorMessage));
      } else {
        resolve(results);
      }
    });
  });
};

// Check if a user has liked a post
exports.userHasLikedPost = (userId, postId) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM userLikes WHERE userId = ? AND postId = ?;';
    db.config.query(sql, [userId, postId], (err, results) => {
      if (err) {
        const errorMessage = 'Error checking if user has liked post: ' + err.message;
        reject(new Error(errorMessage));
      } else {
        resolve(!!results && results.length > 0);
      }
    });
  });
};

// Add an event for a user in the database
exports.addEvent = (userId, event) => {
  return new Promise((resolve, reject) => {
    if (!event) {
      const error = new Error('Event details are required');
      error.statusCode = 400; // Bad Request
      reject(error);
      return
    } else {
      

      if (getSentiment(event)) {
        reject({message: "Please make sure your event post isn't offensive"})
        return
      }

      const sql = 'INSERT INTO events (userId, event) VALUES (?, ?)';
      db.config.query(sql, [userId, event], (err, result) => {
        if (err) {
          const errorMessage = 'Error adding event: ' + err.message;
          reject(new Error(errorMessage));
        } else {
          resolve(result);
        }
      });
    }
  });
};

// Retrieve a user's events from the database
exports.getUserEvents = (userId) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM events WHERE userId = ? ORDER BY created DESC';

    db.config.query(sql, [userId], (err, results) => {
      if (err) {
        const errorMessage = 'Error retrieving user events: ' + err.message;
        reject(new Error(errorMessage));
      } else {
        resolve(results);
      }
    });
  });
};

// Delete an event from the database
exports.deleteEvent = (eventID) => {
  return new Promise((resolve, reject) => {
    const sql = 'DELETE FROM events WHERE eventID = ?';
    db.config.query(sql, [eventID], (err, result) => {
      if (err) {
        const errorMessage = 'Error deleting event: ' + err.message;
        reject(new Error(errorMessage));
      } else {
        resolve(result);
      }
    });
  });
};

// Retrieve all events from the database
exports.getAllEvents = () => {
  return new Promise((resolve, reject) => {
    const sql =
      'SELECT sportUsers.name, events.event, events.eventID, sportUsers.picture FROM sportUsers JOIN events ON sportUsers.id = events.userId ORDER BY created DESC';
    db.config.query(sql, (err, results) => {
      if (err) {
        const errorMessage = 'Error retrieving events: ' + err.message;
        reject(new Error(errorMessage));
      } else {
        resolve(results);
      }
    });
  });
};

// Add a comment for a post in the database
exports.addComment = (postId, comment, userId) => {
  return new Promise((resolve, reject) => {

    if (getSentiment(comment)) {
      reject({message: "Please make sure your comment isn't offensive"})
      return
    }
    


    const sql = 'INSERT INTO comments (postId, comment, userId) VALUES (?, ?, ?)';
    db.config.query(sql, [postId, comment, userId], (err, result) => {
      if (err) {
        const errorMessage = 'Error adding comment: ' + err.message;
        reject(new Error(errorMessage));
      } else {
        resolve(result);
      }
    });
  });
};

// Retrieve comments for a post from the database
exports.getComments = (postId) => {
  return new Promise((resolve, reject) => {
    // const sql = 'SELECT * FROM comments WHERE postId = ?';
    const sql = 'SELECT comments.*, sportUsers.* FROM comments INNER JOIN sportUsers ON comments.userId = sportUsers.id WHERE comments.postId = ?';

    db.config.query(sql, [postId], (err, result) => {
      if (err) {
        const errorMessage = 'Error retrieving comments: ' + err.message;
        reject(new Error(errorMessage));
      } else {
        resolve(result);
      }
    });
  });
};

// Delete comments for a post from the database
exports.deleteComments = (postId) => {
  return new Promise((resolve, reject) => {
    const sql = 'DELETE FROM comments WHERE postId = ?';
    db.config.query(sql, [postId], (err, result) => {
      if (err) {
        const errorMessage = 'Error deleting comments: ' + err.message;
        reject(new Error(errorMessage));
      } else {
        resolve(result);
      }
    });
  });
};

// Delete a post from the database
exports.deletePost = (postId) => {
  return new Promise((resolve, reject) => {
    const deleteCommentsQuery = 'DELETE FROM comments WHERE postId = ?';
    const deletePostQuery = 'DELETE FROM userPost WHERE postId = ?';

    db.config.query(deleteCommentsQuery, [postId], (err, commentsResult) => {
      if (err) {
        const errorMessage = 'Error deleting comments: ' + err.message;
        reject(new Error(errorMessage));
      } else {
        db.config.query(deletePostQuery, [postId], (err, postResult) => {
          if (err) {
            const errorMessage = 'Error deleting post: ' + err.message;
            reject(new Error(errorMessage));
          } else {
            resolve(postResult);
          }
        });
      }
    });
  });
};

// Delete a comment from the database
exports.deleteComment = (commentId) => {
  return new Promise((resolve, reject) => {
    const sql = 'DELETE FROM comments WHERE commentId = ?';
    db.config.query(sql, [commentId], (err, result) => {
      if (err) {
        const errorMessage = 'Error deleting comment: ' + err.message;
        reject(new Error(errorMessage));
      } else {
        resolve(result);
      }
    });
  });
};

// Retrieve the number of likes for a post from the database
exports.getPostLikes = (postId) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT likes FROM posts WHERE postId = ?';
    db.config.query(sql, [postId], (err, result) => {
      if (err) {
        const errorMessage = 'Error retrieving post likes: ' + err.message;
        reject(new Error(errorMessage));
      } else {
        resolve(result[0].likes);
      }
    });
  });
};

// Update the likes for a post in the database
exports.updatePostLikes = (postId, userId) => {
  return new Promise(async (resolve, reject) => {
    const hasLiked = await this.userHasLikedPost(userId, postId);
    let sql;
    if (hasLiked) sql = "DELETE FROM userLikes WHERE userId = ? AND postId = ?;";
    else sql = "INSERT INTO userLikes(userId, postId) VALUES(?, ?);";

    db.config.query(sql, [userId, postId], (err, result) => {
      if (err) {
        const errorMessage = 'Error updating post likes: ' + err.message;
        reject(new Error(errorMessage));
      } else {
        resolve(result);
      }
    });
  });
};


//AAI homework to implement sentiment. makes usre users can't post offensive cntent
function getSentiment(input){

  const intensity = vader.SentimentIntensityAnalyzer.polarity_scores(input);
    
  //-0.05 is the offcial value for a negative sentiment
  if(intensity.compound<=-0.05){
    return true
  }else{
    return false 
  }

}
