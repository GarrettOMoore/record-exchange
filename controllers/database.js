'use strict';

var util = require('util.js');
var artist = "Brian Eno";

module.exports = function(client) {
    var database = {};
    database.status = {accepted: 'Accepted', draft: 'Draft', deleted: 'Deleted', rejected: 'Rejected'};
    database.getArtist = function(artist, callback) {
        console.log(artist);
        return client.get('/artists/' + artist, callback);

    }};