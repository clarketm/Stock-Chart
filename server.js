var path = require('path');
var favicon = require('serve-favicon');
//var logger = require('morgan');
var cookieParser = require('cookie-parser');
var flash = require('connect-flash');
var mongoose = require('mongoose');
var session = require('express-session');
var passport = require('passport');
var bodyParser = require('body-parser');
var express = require('express');
var app = express();

//socket io
var server = require('http').Server(app);
var io = require('socket.io')(server);

var index = require('./routes/index');
var users = require('./routes/users');

require('dotenv').load();
require('./app/config/passport')(passport);

mongoose.connect(process.env.MONGO_URI);
mongoose.Promise = global.Promise;

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
//app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({secret:'MySecret'}));
app.use(flash());

app.use(function(req, res, next){
    res.locals.message = req.flash();
    next();
});

app.use(passport.initialize());
app.use(passport.session());

app.use(function (req, res, next) {
    res.locals.login = req.isAuthenticated();
    next();
});

app.use('/', index);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

// connect to socket.io
io.on('connection', function (socket) {
    console.log('Client Connected..');

    ///retrieve new stock from client
    socket.on('submitStock', function (data) {
        console.log(data);
     ///do mongodb stuff here

     ///send new stocks to all clients
     socket.emit('activeStocks', data);
    });
});

var port = process.env.PORT || 8080;
server.listen(port,  function () {
    console.log('Node.js listening on port ' + port + '...');
});
