const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const db = require('../models');

passport.serializeUser(function(user, cb) {
    cb(null, user.id);
});

passport.deserializeUser(function(id, cb) {
    db.user.findById(id).then(function(user) {
        cb(null, user);
    }).catch(cb);
});

passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
}, function(email, password, cb) {
    console.log("Trying to authenticate...")
    db.user.findOne({
        where: {email: email}
    }).then(function(user) {
        console.log("Found a user:", user);
        if(!user || !user.validPassword(password)) {
            console.log("About to call cb with false...");
            cb(null, false);
        } else {
            console.log("About to call cb with user...");
            cb(null, user);
        }
    }).catch(cb);
}));

module.exports = passport;