const express = require('express');
const router = express.Router();
const db = require('../models');
const passport = require('../config/passportConfig');


router.get('/signup', function(req, res) {
  res.render('auth/signup');
});

router.post('/signup', function(req, res) {
  console.log("Hit the signup post route...")
  db.user.findOrCreate({
    where: {email: req.body.email},
    defaults: {
      name: req.body.name,
      password: req.body.password,
      location: req.body.location
    }
  }).spread(function(user, created){
    console.log("Inside the spread function...");
    if (created) {
      console.log('User created.');
      passport.authenticate('local', {
        successRedirect: '/',
        successFlash: 'Account created & logged in'
      })(req, res);
    } else {
      console.log('Email already exists.');
      req.flash('error', 'Email already exists.');
      res.redirect('auth/signup');
    }
  }).catch(function(error){
    console.log("We got an error:", error);
    res.redirect("/auth/signup");
  });
});

router.get('/login', function(req, res) {
  res.render('auth/login');
});

router.post('/login', passport.authenticate('local', {
  successRedirect: '/',
  successFlash: 'You have logged in!',
  failureRedirect: '/auth/login',
  failureFlash: 'Invalid username and/or password.'
}));

router.get('/logout', function(req, res) {
  req.logout();
  req.flash('success', 'You have logged out.')
  res.redirect('/');
});


module.exports = router;
