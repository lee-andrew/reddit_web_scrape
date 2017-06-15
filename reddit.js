var request = require('request');
var cheerio = require('cheerio');
var url = ["https://www.reddit.com/"];
var extraPages = 2; // Number of extra pages

var promiseAll = new Promise( function(resolveAll, rejectAll) {
    var loop = function(i) {
        var promise = new Promise ( function(resolve, reject) {
            requestNextPage(url[i], resolve);
        });
        promise.then( function() {
            requestTitles(url[i], i+1); // Start request for titles
            i++;
            if ( i < extraPages ) { // Continue on with next page
                loop(i);
            }
            else { // Finished with the last page
                resolveAll(i);
            }
        });                            
    }
    loop(0); // Start at the front page of reddit
});

promiseAll.then( function(i) {
    requestTitles(url[i], i+1); // Start request for titles on the last page
});

function requestTitles(url, page) {
    request(url, function (error, response, body) {
        if (!error) {
            console.log("Page: ", page);  
            var $ = cheerio.load(body);
            var title = $("[data-event-action='title']").map( function() { return $(this).html(); } ); // Put all titles on current page into an array
            for ( var i = 0; i < title.length; i++ ) {
                console.log( (i+1) + ": " + title[i]); // Print all titles on current page
            }
        } else {
          console.log("We’ve encountered an error: " + error);
        }
    });
}

function requestNextPage (currentUrl, resolve) {
    request( currentUrl, function( error, response, body ) {
        var $ = cheerio.load(body);
        var nextUrl = $(".next-button a").attr('href'); // Get the URL of the next button
        url.push(nextUrl);
        resolve();
    });
}