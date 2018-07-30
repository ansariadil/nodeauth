const createError       = require('http-errors');
const express           = require('express');
const path              = require('path');
const cookieParser      = require('cookie-parser');
const logger            = require('morgan');
const bodyParser        = require('body-parser');
const session           = require('express-session')
const passport          = require('passport') 
const LocalStrategy     = require('passport-local').Strategy
const multer            = require('multer')
const upload            = multer({dest:'./uploads'})
const flash             = require('connect-flash')
const bcrypt            = require('bcrypt')
const mongo             = require('mongodb')
const mongoose          = require('mongoose')
const ExpressValidator  = require('express-validator')
const pug               = require('pug')

let db = mongoose.connection


let indexRouter = require('./routes/index');
let usersRouter = require('./routes/users');

let app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// handle session
app.use(session({
  secret: 'secret',
  saveUninitialized: true,
  resave: true
}))



//passport
app.use(passport.initialize())
app.use(passport.session())

//validator
app.use(ExpressValidator({
  errorFormatter: function(param, msg, value){
    let namespace = param.split('.')
    , root = namespace.shift()
    , formParam = root

    while(namespace.length){
      formParam += '['+namespace.shift()
    }
    return{
      param: formParam,
      msg: msg,
      value: value
    }
  }
}))

app.use(flash());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

app.get('*', function(req, res, next){
  res.locals.user = req.user || null;
  next()
})

app.use('/', indexRouter);
app.use('/users', usersRouter);

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
  res.render('error');
});

module.exports = app;
