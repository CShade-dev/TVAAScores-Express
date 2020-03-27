const dotenv = require('dotenv');
var createError = require('http-errors');
var session = require('express-session');
var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');
const { Client } = require('pg');
var app = express();
const client = new Client()
// view engine setup
var app = express()
dotenv.config();
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());
app.use(session({
  secret: process.env.SECRET,
  resave: true,
  saveUninitialized: false
}));
client.connect();


app.post('/login', (request, response, foo) => {
  console.log("test")
  const password = request.body.password
  const email = request.body.email
  const emailvalues = [request.body.email]
  client.query('SELECT * FROM users WHERE email=$1', emailvalues, (err, res) => {
    if(err) {
      console.log(err)
    } else {
      if (res.rows[0].email == email && res.rows[0].password == password) {
        console.log("Logged in as " + res.rows[0].name + " from " + res.rows[0].team + ".");
        request.session.user = res.rows[0].name;
        response.send(request.session.user)
      } else {
        console.log("Email/Password is incorrect.")
      }
    }
  })
});
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
});

module.exports = app;
