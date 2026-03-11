var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
let mongoose = require('mongoose')
let sql = require('mssql')

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
//localhost:3000/users
app.use('/api/v1/users', require('./routes/users'));
app.use('/api/v1/roles', require('./routes/roles'));
app.use('/api/v1/products', require('./routes/products'))
app.use('/api/v1/categories', require('./routes/categories'))

// Database Connection - Try MongoDB first, fallback to SQL Server
let isMongoConnected = false;
let isSqlConnected = false;

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/NNPTUD-C4');
mongoose.connection.on('connected', function () {
  console.log("MongoDB connected");
  isMongoConnected = true;
})
mongoose.connection.on('disconnected', function () {
  console.log("MongoDB disconnected");
  isMongoConnected = false;
  // Try to connect to SQL Server if MongoDB disconnects
  if (!isSqlConnected) {
    connectToSqlServer();
  }
})
mongoose.connection.on('disconnecting', function () {
  console.log("MongoDB disconnecting");
})
mongoose.connection.on('error', function (err) {
  console.log("MongoDB error:", err.message);
  isMongoConnected = false;
  // Try to connect to SQL Server if MongoDB fails
  if (!isSqlConnected) {
    connectToSqlServer();
  }
})

// SQL Server Connection fallback
const sqlConfig = {
  server: 'localhost',
  authentication: {
    type: 'default',
    options: {
      userName: 'trung',
      password: '123'
    }
  },
  options: {
    trustServerCertificate: true,
    validateBulkLoadParameters: true,
    database: 'NNPTUD-C4'
  }
}

function connectToSqlServer() {
  sql.connect(sqlConfig)
    .then(pool => {
      console.log("SQL Server connected");
      isSqlConnected = true;
      app.locals.sqlPool = pool;
    })
    .catch(err => {
      console.log("SQL Server connection error:", err.message);
      console.log("Make sure SQL Server is running and database NNPTUD-C4 exists");
    })
}

// Attempt SQL Server connection if MongoDB is not available after 3 seconds
setTimeout(() => {
  if (!isMongoConnected && !isSqlConnected) {
    console.log("MongoDB not connected, trying SQL Server...");
    connectToSqlServer();
  }
}, 3000);
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
  res.render('error');
});

module.exports = app;
