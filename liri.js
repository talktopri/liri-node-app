require("dotenv").config();
var keys = require("./keys")
var axios = require("axios");
var moment = require("moment");
moment().format();
var Spotify = require('node-spotify-api');
var spotify = new Spotify({
    id: keys.spotify.id,
    secret: keys.spotify.secret
})
var fs = require("fs")



var action = process.argv[2]
var userInput = process.argv.slice(3).join(" ");

function whatToDo() {
    if (action === 'do-what-it-says') {
        fs.readFile('./random.txt', 'UTF8', function(err, data) {
            if (err) {
                console.log("Something went wrong...")
            }
            action = data.substring(0, data.indexOf(","))
            userInput = data.substring(data.indexOf(",") + 2, data.length - 1)
            whatToDo();
        })
    }
    
    else if (action === 'concert-this') {
        ConcertThis();
    }
    
    else if (action === 'spotify-this-song') {
        SpotifyThis();
    }
    
    else if (action === 'movie-this') {
        MovieThis();
    }
    
    else {
        console.log("You entered an invalid action. Please enter a valid action, such as 'movie-this tenacios d and the pick of destiny', or 'concert-this foo fighters', 'spotify-this-song everlong', or 'do-what-it-says'");
    }
}




//Function for concert-this
function ConcertThis() {
    if (userInput == "") {
        console.log("Oopsie! Did you forget to include an artist? You must include an artist to search.")
    }
    else {
        axios.get("https://rest.bandsintown.com/artists/" + userInput + "/events?app_id=codingbootcamp")
        .then(function(response) {
            var results = response.data;
            for (i=0;i<results.length;i++) {
                var venue = results[i].venue.name;
                if (results[i].country === "United States") {
                    var location = results[i].venue.city + ", " + results[i].venue.region
                }
                else {
                    var location = results[i].venue.city + ", " + results[i].venue.country
                }
                var date = moment(results[i].datetime)
                date = date.format("MM/DD/YYYY")
                var output = ("\nVenue: " + venue + "\nLocation: " + location + "\nDate: " + date + "\n---------------------------------");
                console.log(output)
                fs.appendFile('log.txt', output, 'utf8', function(error) {
                    if (error) {
                        console.log("Uh-oh! Something went wrong. Couldn't write to the file.")
                    }
                    console.log("Booyah! Appended data to file like a champ!")
                })
            }
        })
    }

}

//Function for 'spotify-this-song
function SpotifyThis() {
    spotify.search({
        type: 'track',
        query: userInput
    }, function (err, data) {
        if (err) {
            return console.log('Sad trombone: an error occurred: ' + err);
        }
        else if (data) {
            console.log('~~~~~~~~~~~~~~~~~');
            console.log('Artist: ' + data.tracks.items[0].album.artists[0].name + '\nSong: ' + data.tracks.items[0].name + '\nURL: ' + 
            data.tracks.items[0].external_urls.spotify + '\nAlbum: ' + data.tracks.items[0].album.name);
        }
    });
};


//Function for movie-this
function MovieThis() {
    if (userInput === "") {
        userInput = "Mr. Nobody"
    }
    axios.get("http://www.omdbapi.com/?apikey=trilogy&t=" + userInput)
    .then(function(response) {
        console.log(response.data.Title)
        results = response.data;
        var title = results.Title;
        var year = results.Year;
        ratingsArr = results.Ratings
        var IMDB = ratingsArr.filter(function(item) {
            return item.Source === 'Internet Movie Database'
        }).map(function(item) {
            return item.Value.toString()
        })
        IMDB = IMDB.toString();
        var RT = ratingsArr.filter(function(item) {
            return item.Source === 'Rotten Tomatoes'
        }).map(function(item) {
            return item.Value.toString()
        })
        RT = RT.toString();
        country = results.Country;
        language = results.Language;
        plot = results.Plot;
        actors = results.Actors;
        var output = ("\nTitle: " + title + "\nYear: " + year + "\nIMDB Rating: " + IMDB + "\nRotten Tomatoes Rating: " + RT + "\nCountry: " + country + "\nLanguage: " + language + "\nPlot: " + plot + "\nActors: " + actors + "\n---------------------------------")
        console.log(output)
        fs.appendFile('log.txt', output, 'utf8', function(error) {
            if (error) {
                console.log("Uh-oh! Something went wrong. Couldn't write to the file.")
            }
            console.log("Booyah! Appended data to file like a champ!")
        })
    })
}

whatToDo();