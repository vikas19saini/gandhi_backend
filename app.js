var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');
var compression = require('compression')
require('dotenv').config({ path: __dirname + '/.env' });
global.appRootDir = path.join(__dirname, 'views')

var indexRouter = require('./routes/index');

var app = express();

const validatingCors = function (req, callback) {
  var corsOptions;
  if (req.header('Origin') === process.env.CLIENT_URL) {
    corsOptions = { origin: true }
  } else {
    corsOptions = { origin: true }
  }

  callback(null, corsOptions);
}

// Enabling cors
app.use(cors(validatingCors));
app.use(compression());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.send(err).json();
  //res.render('error');
});

module.exports = app;
