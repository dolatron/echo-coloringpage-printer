'use strict';
var fs = require('fs');
var path = require('path');
var nodeprinter = require('node-printer');

var http = require('http');
var https = require('https');
var basicAuth = require('basic-auth-connect');
var express = require('express');
var fuzzy = require('fuzzy');
var app = express();
var server;

// load user settings
try {
  var settings = {};
  var settingsFile = require(path.resolve(__dirname, 'settings.json'));
  for (var i in settingsFile) {
    settings[i] = settingsFile[i];
  }  
} catch (e) {
  console.error('unable to load settings.json', e);
  return;
}

//authenticate user
if (settings.auth) {
//add this block to settings.json for auth support
//"auth": { 
//  "username": "username",
//  "password": "password"
//}        
  app.use(basicAuth(settings.auth.username, settings.auth.password));
}

//configure and start server
if (settings.https) {
  //add this block to settings.json for https support
  //"https": {
  //  "key": "path to your pem"
  //  "cert" : "path to cert pem"
  //},
  try {
    var privateKey  = fs.readFileSync(settings.https.key, 'utf8');
    var certificate = fs.readFileSync(settings.https.cert, 'utf8');
    var credentials = {key: privateKey, cert: certificate};
    
    server = https.createServer(credentials, app);
    server.listen(settings.securePort);
    
    console.log('https server listening on port', settings.securePort);
  } catch (e) {
    console.error('unable to start https server', e);
    return;
  }
} else {
  try {
    //no https - start http server inststead
    server = http.createServer(app);
    server.listen(settings.port);

    console.log('http server listening on port', settings.port);
  } catch (e) {
    console.error('unable to start http server', e);
    return;    
  }
}

//load printable pages into array
var fp = path.resolve(__dirname, settings.filesPath);
var files = fs.readdirSync(fp);
console.log ('found:', files.length, 'printable pages in', fp);

//handle print request
app.get('/print/:pages?/:search?', function(req, res) {
  var pages = req.params.pages
  var search = req.params.search
  printPages(pages, search);  //count of pages requested
  res.send(JSON.stringify({success: 'print action "' + search + '" requested ' + pages + 'times'}));
})

function printPages(pages, search) {
  console.log('print action requested [', pages, '] times');

  //set up printer
    var printer = new nodeprinter(settings.printer);
    var popt = {
    media: settings.printerOpts
  }

  //only print a max of 10 pages at a time, if more are requested print just 1
  if (isNaN(pages) || pages > 10) { pages = 1; }

  for (var i=0; i<pages; i++) {
    //load coloring pages into array
    if (files.length == 0) {
      files = fs.readdirSync(fp);
    }
    //pick a page at random & remove it from the array of printable pages
    var pfile = getPage(search);
    if (pfile) {
      var p = fp + '/' + pfile;
      printer.printFile(p, popt);
      console.log ('printed file:', pfile);
    }
  }
}

function getPage(search) {
  //clean search string to remove spaces and trailing /\W|s$/g

  search = search ? search.toLowerCase().replace(/\W/g,'') : ''

  //see if there are any matches
  var found = find(search, files)

  //if there are less than 5 matches, start removing characters until we find more
  while (found.length < 5 && search.length > 0) {
    search = search.substring(0, search.length-1)
    found = found.concat(find(search))
  }

  //as long as we have some results - return one
  if (found.length > 0) {
    console.log ('matched:', found.length, 'pages')
    var rand = Math.floor(Math.random() * (found.length));
    return found[rand]
  }

  return null
}

function find(search) {
  //use fuzzy search to string match a collection of files
  var results = fuzzy.filter(search, files)
  var matches = results.map(function(el) { return el.string; });
  return matches
}