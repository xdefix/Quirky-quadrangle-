const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;

// Function to check if the provided password matches the stored hash
async function checkPassword(password, hash) {
  let pw = await bcrypt.compare(password, hash);
  return pw;
}

// Function to authenticate a user based on email and password
async function authenticateUser(req, users, res) {
  try {
    const { email, password } = req.body;
    const user = users.find((u) => {
      return u.email === email;
    });

    if (user && password && (await checkPassword(password, user.password))) {
      // Generate an access token using JWT
      const accessToken = jwt.sign(
        {
          id: user.id,
          name: user.name,
        },
        ACCESS_TOKEN_SECRET,
        { expiresIn: '30m' }
      );
      // Set the access token as a cookie
      res.cookie('accessToken', accessToken);

      res.redirect('/userProfile'); // Redirect to the user profile page
    } else {
      const error = new Error('Username or password incorrect');
      error.statusCode = 401; // Unauthorized
      throw error;
    }
  } catch (err) {
    // Pass the error to the next middleware (error handler)
    next(err);
  }
}

// Middleware to authenticate JWT (JSON Web Token)
function authenticateJWT(req, res, next) {
  const token = req.cookies['accessToken'];
  if (token) {
    // Verify the token using the secret key
    jwt.verify(token, ACCESS_TOKEN_SECRET, (err, user) => {
      if (err) {
        const error = new Error('Forbidden');
        error.statusCode = 403; // Forbidden
        throw error;
      }
      req.user = user; // Attach the user object to the request for further use
      next();
    });
  } else {
    const error = new Error('Unauthorized');
    error.statusCode = 401; // Unauthorized
    throw error;
  }
}

module.exports = {
  authenticateUser,
  authenticateJWT,
};
