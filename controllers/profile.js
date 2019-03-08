require('dotenv').config();
const methodOverride = require('method-override');
const express = require('express');
const ejsLayouts = require('express-ejs-layouts');
const bodyParser = require('body-parser');
const passport = require('./config/passportConfig');
const session = require('express-session');
const flash = require('connect-flash');
const isLoggedIn = require('./middleware/isLoggedIn');
const helmet = require('helmet');
const SequelizeStore = require('connect-session-sequelize')(session.Store);
const db = require('./models');
const app = express();
const request = require('request');
const multer = require('multer');
const upload = multer({dest: './uploads/'});
const cloudinary = require('cloudinary');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const geocodingClient = mbxGeocoding({
    accessToken: process.env.MAP_BOX_KEY
});

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(require('morgan')('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(ejsLayouts);
app.set('layout extractScripts', true);
app.use(helmet());
app.use(methodOverride('_method'));

const sessionStore = new SequelizeStore({
    db: db.sequelize,
  expiration: 30 * 60 * 1000
});

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    store: sessionStore
}));

// USE THIS LINE ONCE TO SET UP STORE TABLE
// sessionStore.sync();

app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

app.use(function(req, res, next) {
    res.locals.alerts = req.flash();
    res.locals.currentUser = req.user;
    next();
});
// Add profile photo with Cloudinary
app.get('/profile', isLoggedIn, function(req, res) {
    db.photo.findOne({
        where: {userId: req.user.id}
    }).then(function(photo) {
        if (photo) {
        res.render('user/profile', {photo: photo.link});
    } else {
        res.render('user/profile', {photo: null});
    };
    });
});

// Post user profile photo to DB
app.post('/profile', upload.single('myFile'), function(req, res) {
    cloudinary.uploader.upload(req.file.path, function(result) {
    db.photo.findOrCreate({
        where: {
        userId: parseInt(req.user.dataValues.id)
        },
        defaults: {link: result.url}
    }).spread(function(photo, created) {
        res.redirect('/profile');
    });
    });
});

// Update profile picture

app.put('/profile', upload.single('myFile'), function(req, res) {
    cloudinary.uploader.upload(req.file.path, function(result) {
    db.photo.update({
        link: result.url
        }, {where: {userId: req.user.id}}
    ).then(function(photo, created) {
        res.redirect('/profile');
    });
    });
});