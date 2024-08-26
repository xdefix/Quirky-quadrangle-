const express = require('express'); 

const app = express(); // Create an instance of the express application

const port = 3000; // Specify the port number the server will listen on

const fileUpload = require('express-fileupload'); 

const bodyParser = require('body-parser'); 

const path = require('path'); 

const indexRouter = require('./routes/index'); 

const cookieParser = require('cookie-parser'); 

const { registerUser } = require('./controllers/userController'); 

app.use(cookieParser()); 

app.use(fileUpload()); 

app.use(bodyParser.urlencoded({ extended: true })); // Use the body-parser middleware to parse request bodies

app.use(express.static(path.join(__dirname, 'public'))); // Serve static files from the 'public' directory

app.set('view engine', 'ejs'); // Set the view engine to 'ejs'

app.set('views', path.join(__dirname, 'views')); // Set the directory for views to the 'views' directory

app.use('/', indexRouter); // Mount the index router at the root path ('/')

// Error handler middleware
app.use((err, req, res, next) => {
  // Set the status code to the error's status or default to 500 (Internal Server Error)
  res.status(err.status || 500);
  // Render the error page using the "error" template and pass the error object
  res.render('error', { status: err.status, message: err.message });
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`); // Start the server and listen for incoming requests on the specified port
});
