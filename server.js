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

// Root Page
app.get('/', function(req, res) {
  res.render('main/main');
});

// Display search results
app.get('/search', function(req, res) {
  var search = req.query.search;
  var url = 'https://api.discogs.com/database/search?q='+ encodeURI(search) + '&key=' + process.env.CONSUMER_KEY + '&secret=' + process.env.CONSUMER_SECRET
  request( {url,
    headers: {
      'User-Agent': "Record Exchange - Student Project"
    }
}, function(error, response, body) {
    let results = JSON.parse(body).results;
    res.render('main/index', {results})
  });
});

// Add selected albums to collection
app.post('/search', function(req, res) {
  db.user.findById(parseInt(req.user.dataValues.id)).then(function(user) {
    return user.createRelease({
      title: req.body.title,
      artist: req.body.title,
      year: req.body.year,
      genre: req.body.style,
      label: req.body.label,
      imgUrl: req.body.imgUrl,
      type: null
    })
    }).then(function(release){
        res.redirect('user/collection');
  });
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
        res.redirect('user/profile');
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
    })
  })});

// Show user collection
app.get('/collection', isLoggedIn, function(req, res) {
  db.user.findOne({
    where: {id: req.user.id},
    include: [db.release]
    }).then( function(user) {
      res.render('user/collection', {releases: user.releases, user})
  });
});

// Messages page
app.get('/messages', isLoggedIn, function(req, res) {
  res.render('user/messages');
});

// Display all users
app.get('/users', isLoggedIn, function(req, res) {
  db.user.findAll({
    include: [db.photo]
  }).then(function (users) {
    res.render('main/users', {users})
  })
})

// Render map index page
app.get('/map', function(req, res) {
  res.render('map/index');
});

// Query mapbox with City and State
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

// Display map results
app.get('/shops', function(req, res) {
  res.render('map/show');
});

// Delete album from user collection
app.delete('/releases/:id', function(req, res) {
  db.usersReleases.destroy({
    where: {releaseId: req.params.id, userId: req.user.id}
  }).then(function() {
      res.redirect('user/collection');
  });
});

app.use('/auth', require('./controllers/auth'));

var server = app.listen(process.env.PORT || 3000);

module.exports = server;
