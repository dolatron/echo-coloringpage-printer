'use strict';

var http = require('http');
var https = require('https');

var options = require('./options');

var AlexaSkill = require('./AlexaSkill');
var Colors = function () {
    AlexaSkill.call(this, options.appid);
};


Colors.prototype = Object.create(AlexaSkill.prototype);
Colors.prototype.constructor = Colors;

Colors.prototype.intentHandlers = {
    // register custom intent handlers
    PrintIntent: function (intent, session, response) {
        console.log("PrintIntent received");
        var pages = intent.slots.Pages.value ? intent.slots.Pages.value : 1;
        var person = intent.slots.Person.value ? intent.slots.Person.value + ' ' : '' ;
        var subject = intent.slots.Subject.value ? intent.slots.Subject.value : '';
        var suffix = ''
        
        if (pages > 1) { suffix = 's'}
        var message = 'I printed ' + person + pages + ' ' + subject + ' coloring page' + suffix;

        //send print request to pi node server
        options.path = '/print/' + encodeURIComponent(pages) + '/' + encodeURIComponent(subject); 
        httpreq(options, function(error) {
            genericResponse(error, response, message);
        });
    },
};

function httpreq(options, responseCallback) {
    var transport = options.useHttps ? https : http;
    
    console.log("Sending " + (options.useHttps ? "HTTPS" : "HTTP" ) + " request to: " + options.path);
  
    var req = transport.request(options, function(httpResponse) {
        var body = '';
        
        httpResponse.on('data', function(data) {
            body += data;
        });
        
        httpResponse.on('end', function() {
            responseCallback(undefined, body);
        });
    });

    req.on('error', function(e) {
        responseCallback(e);
    });

    req.end();
}

function genericResponse(error, response, success) {
    if (!error) {
        if (!success) {
            response.tell("OK");
        }
        else {
            response.tell(success);
        }
    }
    else {
        response.tell("The Lambda service encountered an error: " + error.message);
    }
}

// Create the handler that responds to the Alexa Request.
exports.handler = function (event, context) {
    // Create an instance of the Colors skill.
    var colors = new Colors();
    colors.execute(event, context);
};
