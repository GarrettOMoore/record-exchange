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
const async = require('async');
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
            type: null,
    })
    }).then(function(){
            res.redirect('/collection');
    }) 
});

// get trade page with comments and release info

app.get('/trade', function (req, res) {
    db.usersReleases.findAll({
    where: { userId: req.user.id }
    }).then(function (usersReleases) {
    let tradeables = usersReleases.filter(function (release) {
        return release.isTradeable
    }).map(function (userRelease) {
        return function (callback) {
        db.release.findOne({
            where: { id: userRelease.releaseId }
        }).then( function(release) { 
            let tradeObj = {userRelease, release}
            callback(null, tradeObj) 
        })
        }
    })
    return tradeables;
    }).then( function(tradeables) {
    async.parallel(tradeables, function(err, results) { 
        res.render('user/trade', {releases: results})
        // res.json({releases: results});
    });
    });
});

// // // Messages page
app.get('/messages', isLoggedIn, function(req, res) {
    db.user.findAll({
    }).then(function(users) {
        db.message.findAll({
            where: {recievedUserId: req.user.id}
        }).then(function(messages) {
            // res.json({users, messages})
            res.render('user/messages', {users, messages})
        })
})
})

//send message
app.post('/messages', function(req, res) {
    db.message.create({
        sendUserId: req.user.id,
        recievedUserId: req.body.user,
        message: req.body.message
    }).then(function(message) {
    res.redirect('/messages');
    })
})

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

// Show user collection
app.get('/collection', isLoggedIn, function(req, res) {
    db.user.findOne({
    where: {id: req.user.id},
    include: [db.release]
    }).then( function(user) {
        res.render('user/collection', {releases: user.releases, user})
    });
});

app.put('/trade/:id', function(req, res) {
    db.usersReleases.update({
        isTradeable: true,
        comment: req.body.comment,
    }, {
    where: {
        userId: req.user.id,
        releaseId: req.params.id
    }
    }).then(function(usersReleases) {
        res.redirect('/collection')
    })
})


// Display all users
app.get('/users', isLoggedIn, function(req, res) {
    db.photo.findAll({
        include: [db.user]
    }).then(function (photos) {
        res.render('main/users', {photos})
    })
})

// Render map index page
app.get('/map', function(req, res) {
    res.render('map/index');
});

// Query mapbox with City and State
app.get('/find', function(req, res) {
    geocodingClient.forwardGeocode({
    query: "starbucks " 
    // + req.query.city + ", " + req.query.state
    }).send().then(function(response) {
        let markers = [];
        response.body.features.forEach(function(feature){
            markers.push(feature.center);
        })
        res.json(markers)
        // res.render('map/show', {markers});
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
        res.redirect('/collection');
    });
});

app.use('/auth', require('./controllers/auth'));
// app.use('/profile', require('./controllers/profile'));

var server = app.listen(process.env.PORT || 4000);

module.exports = server;
