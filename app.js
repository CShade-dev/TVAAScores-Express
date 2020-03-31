const ck = require('ckey');
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
const client = new Client({
  user: ck.PGUSER,
  host: 'localhost',
  database: ck.PGDATABASE,
  password: ck.PGPASSWORD,
  port: 5432
})
// view engine setup
var app = express()

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());
app.use(session({
  secret: ck.SECRET,
  resave: true,
  saveUninitialized: false
}));
client.connect();


app.post('/login', (request, response, foo) => {
  const password = request.body.password
  const email = request.body.email
  const emailvalues = [request.body.email]
  client.query('SELECT * FROM users WHERE email=$1', emailvalues, (err, res) => {
    if (res.rows.length === 0) {
      response.status(401).end()
      console.log("Email/Password is incorrect.")
    } 
    else {
      if (email == res.rows[0].email) { 
        if (password == res.rows[0].password) {
        console.log("Logged in as " + res.rows[0].name + " from " + res.rows[0].team + ".");
        request.session.authenticated = true;
        response.status(203).end()
        }
        else {
          response.status(403).end()
          console.log("Email/Password is incorrect.")
        }
      } 
      else {
        response.status(403).end()
        console.log("Email/Password is incorrect.")
      }
    }
  })
});
app.get('/login', (request, response, foo) => {
  request.session.authenticated ? (
    response.status(200).end()
  ) : (
    response.status(403).end()
  )
  });

app.post('/admin', (request, response, foo) => {
  const password = request.body.password
  const email = request.body.email
  const emailvalues = [request.body.email]
  client.query('SELECT * FROM users WHERE email=$1', emailvalues, (err, res) => {
    if (res.rows.length === 0) {
      request.session.adminauthenticated = false;
      response.status(401).end()
      console.log(request.session.adminauthenticated)
      console.log("Email/Password is incorrect.")
    } 
    else {
      if ("admin" == res.rows[0].team) { 
        if (password == res.rows[0].password) {
        console.log(res.rows[0].name + " logged into the Admin Panel.");
        request.session.adminauthenticated = true;
        console.log(request.session.adminauthenticated)
        response.status(200).end()
        }
        else {
          response.status(401).end()
          request.session.adminauthenticated = false;
          console.log(request.session.adminauthenticated)
          console.log("Email/Password is incorrect.")
        }
      } 
      else {
        response.status(401).end()
        request.session.adminauthenticated = false;
        console.log(request.session.adminauthenticated)
        console.log("Email/Password is incorrect.")
      }
    }
  })
});

app.get('/admin', (request, response, foo) => {
    console.log(request.session.adminauthenticated)}
);
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
