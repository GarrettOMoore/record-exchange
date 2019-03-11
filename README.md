![alt text](https://i.imgur.com/ZwYtvBC.png "record-exchange")
## Garrett Moore 2019 - Data provided by Discogs.

### Created using:

1. SQL/PostGres/Sequelize
2. JavaScript
3. Node.js
   * Mapbox
   * BCrypt
   * Cloudinary
   * Dotenv
   * Express
   * Express Ejs Layouts
   * Express Sessions
   * Helmet
   * Passport/Passport Local
4. HTML/CSS/Bootstrap
5. [www.discogs.com] Data provided by Discogs

### Deployed VIA Heroku (https://mighty-sands-84315.herokuapp.com)


I began sketching out the idea for Record-Exchange the weekend of 3/1/2019. I knew I wanted to make something music related for my second project - and after experimenting with the wonderful **Discogs API**, I knew that I needed to incorporate it somehow. The idea came to me after talking to a friend about the various online bartering groups we've encountered that dealt with just about everything except directly with music. 

![alt text](https://i.imgur.com/eSDVwTz.jpg "first sketch")

I wanted to make a platform on which users can explore new music, initiate conversation, trade albums, and foster the artistic curiousity that first drew me to the internet when I was a kid. I wouldn't be the person I am today if I hadn't spent those countless hours scouring every forum I could trying to take in as much new music as possible. 

![alt text](https://i.imgur.com/NCXGDu5.jpg "second sketch")

After sketching out the general concept of the project, along with what packages I might need, etc. - I got to work creating all of my data entities in SQL. I knew that the core functionality of the app would rely upon the connection of the User and Release tables - so I started with those first. Each table with a uni-directional One to Many relationship, joined by the usersReleases table containing the userId and releaseId information. After getting that core up and working - I made the Photo and Message tables. The latter being connected to Users by the same uni-directional One -> Many as before.

### Entity Relations map created in draw.io
![alt text](https://i.imgur.com/1BUV06o.png "ER Map")

Once I had my packages installed, authentication processes, and models created and migrated - I was ready to start fleshing out the project in VSC. I began making all of the files and associations I knew I would need (.env, server, etc).

***

I then started writing out my basic CRUD routes - beginning with the first GET to query the API.

```javascript
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
```

The first roadblock I encountered using the API was the results I got back from the initial searches. It seemed that given Discogs wildly vast database - it not only brought back multiple versions of every album by any artist - but it brought back ** EVERY ** single release even remotely associated with them. On top of that - any query also resulted in not just the label or genre information - but multiple arrays of information for each tag. It made for quite an overwhelming user experience - so I began to implement some conditional rendering to seek out only master releases and their pertinent information.

![alt text](https://i.imgur.com/WoJXYt4.png "search-results")

Then I was able to start routing **Search Results -> User Collection**

```javascript
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
  ```

After applying some basic styling - I was able to render up the Collections page I wanted. Keeping a minimal design - I implemented modals for each release in the collection to display all of the associated information. 

![alt text](https://i.imgur.com/IgV5AKq.png "collections-page")

***

### With modal pop up.

![alt text](https://i.imgur.com/2nVXQdp.png "collections-page-with-modal")


#### 'See More by This Artist'
Using .split() on the returned object - I just selected the artist name and redirect the user to the search results for that artist
***

Once the user has designated any items for their collection - they're able to select any of them to be available for trade. Having a boolean column in the join table - the add to trade button just toggles it to **True** and prompts the user to add a comment about the album. I had a tough time getting both the album information and associated comments to render together on the myTrade page. After a lot of experimenting - I was recommended to use async to fire off all of the DB queries in a row. That solved the issue of only being to get one album out of the db at a time.

***

3/10/2019 //

I have all of the basic functionality of the app up and running - but I still have a few things I plan to add over the coming weeks. A messaging system so users and directly message one another - either with a socket server chat - or just direct one to one messaging via the database.

This was a really fun project to make - having the app revolve around something I'm extremely passionate about, it was a really great drive to experiment and push myself to learn new approaches and techniques to programming.











