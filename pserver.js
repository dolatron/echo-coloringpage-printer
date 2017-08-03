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
  res.send(JSON.stringify({success: 'print action [' + search + '] requested ' + pages + ' times'}));
})

//handle count request
app.get('/count/:search?', function(req, res) {
  var search = req.params.search
  var output = findPages(search);  //check how many matches
  res.send(JSON.stringify({success: 'search for [' + search + '] found ' + output.length + ' pages'}));
})

function printPages(pages, search) {
  console.log('print action requested [', pages, '] times for [', search ,']');

  //set up printer
  var printer = new nodeprinter(settings.printer);
  var popt = {
    media: settings.printerOpts
  }

  //only print a max of 10 pages at a time, if more are requested print just 1
  if (isNaN(pages) || pages > 10) { pages = 1; }

  var files = getPages(search, pages);

  for (var i=0; i<files.length; i++) {
    if (files[i]) {
      var p = fp + '/' + files[i];
      printer.printFile(p, popt);
      console.log ('printed file:', files[i]);
    }
  }
}

function getPages(search, count) {
  var found = findPages(search)
  var files = []
  console.log ('matched:', found.length, 'pages')

  //as long as we have some results
  if (found.length > 0) {
    if (count > found.length) { count = found.length }

    //loop through requested files - and remove printed files to reduce dupes
    for (var i=0; i<count; i++) {
      var rand = Math.floor(Math.random() * (found.length));
      files.push(found[rand]);
      found.splice(rand, 1);
    }
  }

  return files
}

function findPages(search) {
  //clean search string to remove spaces and trailing /\W|s$/g
  search = search ? search.toLowerCase().replace(/\W/g,'') : ''

  //see if there are any matches
  var found = find(search)

  //if there are less than 5 matches, start removing characters until we find more
  while (found.length < 5 && search.length > 0) {
    search = search.substring(0, search.length-1)
    found = found.concat(find(search))
  }

  return found
}

function find(search) {
  //use fuzzy search to string match a collection of files
  return fuzzy.filter(search, files).map(function(el) { return el.string; });
}
