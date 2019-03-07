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

//USE THIS LINE ONCE TO SET UP STORE TABLE
// sessionStore.sync();

//THIS MUST COME AFTER THE SESSION AND BEFORE PASSPORT
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

app.use(function(req, res, next) {
  res.locals.alerts = req.flash();
  res.locals.currentUser = req.user;
  next();
});

app.get('/', function(req, res) {
  res.render('main');
});

app.get('/search', function(req, res) {
  var search = req.query.search;
  var url = 'https://api.discogs.com/database/search?q='+ encodeURI(search) + '&key=' + process.env.CONSUMER_KEY + '&secret=' + process.env.CONSUMER_SECRET
  request( {url,
    headers: {
      'User-Agent': "Record Exchange - Student Project"
    }
}, function(error, response, body) {
    let results = JSON.parse(body).results;
    res.render('index', {results})
  });
});

app.post('/search', function(req, res) {
  db.user.findById(parseInt(req.user.dataValues.id)).then(function(user) {
    return user.createRelease({
      title: req.body.title,
      artist: req.body.title,
      year: req.body.year,
      genre: req.body.style,
      label: req.body.label,
      imgUrl: req.body.imgUrl
    })
    }).then(function(release){
        res.redirect('collection');
  });
});

// ADD PROFILE PHOTO WITH CLOUDINARY

app.get('/profile', isLoggedIn, function(req, res) {
  db.photo.findOne({
    where: {userId: req.user.id}
  }).then(function(photo) {
    if (photo) {
      res.render('profile', {photo: photo.link});
    } else {
        res.render('profile', {photo: null});
    };
  });
});

app.post('/profile', upload.single('myFile'), function(req, res) {
  cloudinary.uploader.upload(req.file.path, function(result) {
    db.photo.findOrCreate({
      where: {
        userId: parseInt(req.user.dataValues.id)
      },
      defaults: {link: result.url}
    }).spread(function(photo, created) {
        res.redirect('profile');
    });
  });
});

app.get('/collection', isLoggedIn, function(req, res) {
  db.user.findOne({
    where: {id: req.user.id},
    include: [db.release]
  }).then( function(user) {
      res.render('collection', {releases: user.releases, user})
  });
});

app.get('/messages', isLoggedIn, function(req, res) {
  res.render('messages');
});

app.get('/map', function(req, res) {
  res.render('map/index');
});

app.get('/find', function(req, res) {
  geocodingClient.forwardGeocode({
    query: "record shop " + req.query.city + ", " + req.query.state
  }).send().then(function(response) {
      let markers = [];
      response.body.features.forEach(function(feature){
          markers.push(feature.center);
      })
      res.render('map/show', {markers});
  });
});

app.get('/shops', function(req, res) {
  res.render('map/show');
});

app.delete('/releases/:id', function(req, res) {
  db.usersReleases.destroy({
    where: {releaseId: req.params.id, userId: req.user.id}
  }).then(function() {
      res.redirect('/collection');
  });
});

app.use('/auth', require('./controllers/auth'));

var server = app.listen(process.env.PORT || 3000);

module.exports = server;
