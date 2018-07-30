var express   = require('express');
var router    = express.Router();
const multer  = require('multer')
const upload  = multer({dest:'./uploads'})
const passport = require('passport') 
const LocalStrategy = require('passport-local').Strategy

var User = require('../models/user')

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/register', function(req, res, next) {
  res.render('register' ,{title: "Register"});
});

router.post('/register', upload.single('profileimage'), function(req, res, next) {
  let name = req.body.name
  let email = req.body.email
  let username = req.body.username
  let password = req.body.password
  let password2 = req.body.password2
  let profileimage = req.body.profileimage

  if(req.file){
    console.log('Uploading Files...')
    let profileimage = req.file.filename
  }else{
    console.log('No file uploaded..')
    let profileimage = 'noimage.jpg'
  }

  //Form validator
  req.checkBody('name', 'Name field is required').notEmpty()
  req.checkBody('email', 'Email field is required').notEmpty()
  req.checkBody('email', 'Email is not valid').isEmail()
  req.checkBody('username', 'Username field is required').notEmpty()
  req.checkBody('password', 'Password field is required').notEmpty()
  req.checkBody('password2', 'password do not match').equals(req.body.password)
  

  //check errors 
  let errors = req.validationErrors()

  if(errors){
    res.render('register', {
      errors: errors
    })
    // console.log('Errors')
  }else{
    // console.log('No Errors')
    let newUser = new User({
      name: name, 
      email: email,
      username: username,
      password: password,
      profileimage: profileimage
    })

    User.createUser(newUser, function(err, user){
      if(err) throw err;
      console.log(user)
    })

    req.flash('success', 'You are now Register and can login')

    res.location('/')
    res.redirect('/')
  }
})

router.get('/login', function(req, res, next) {
  res.render('login', {title: "Login"});
});

router.post('/login',
  passport.authenticate('local', {failureRedirect: '/users/login', failureFlash: 'Invalid username and Password'}),
  function(req, res) {
    req.flash('success', 'You are now logged in')
    res.redirect('/');
});

passport.serializeUser(function(user, done) {
  done(null, user.id);
});
  
passport.deserializeUser(function(id, done) {
  User.getUserById(id, function(err, user) {
    done(err, user);
  });
});

passport.use(new LocalStrategy(function(username, password, done){
  User.getUserByUsername(username, function(err, user){
    if(err) throw err;
    if(!user){
      return done(null, false, {message: 'Unknown User'})
    }

    User.comparePassword(password, user.password, function(err, isMatch){
      if(err) return done(err)
      if(isMatch){
        return done(null, user)
      }else{
        return done(null, false, {message: 'Invalid Password'})
      }
    })
  })
}))

router.get('/logout', function(req, res){
  req.logout()
  req.flash('success', 'You are noe Logged out!')
  res.redirect('/users/login')
})


module.exports = router;
