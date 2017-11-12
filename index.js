'use strict';

require('dotenv').config();
const bodyParser = require('body-parser')
const request = require('request')
const rp = require('request-promise');
const jsonQuery = require('json-query');
const underSc = require("underscore");
const format = require('format-number');
const Telegraf = require('telegraf');
const Client = require('node-rest-client').Client;
const isUndefined = require("is-undefined");
const json2html = require('node-json2html');
const datetime = require('node-datetime');
const S = require('string');
const cheerio = require("cheerio");
const HtmlTableToJson = require('html-table-to-json');
const stringify = require('json-stable-stringify');
const sanitizeHtml = require('sanitize-html');
const normalizeUrl = require('normalize-url');
const uuidv1 = require('uuid/v1');


const APIAI_TOKEN = process.env.APIAI_TOKEN;
const APIAI_SESSION_ID = uuidv1();

const express = require('express');
const app = express();




app.use(express.static(__dirname + '/views')); // html
app.use(express.static(__dirname + '/public')); // js, css, images

const server = app.listen(process.env.PORT || 5000, () => {
  console.log('Express server listening on port %d in %s mode', server.address().port, app.settings.env);
});

const io = require('socket.io')(server);
io.on('connection', function(socket){
  console.log('a user connected');
});

const apiai = require('apiai')(APIAI_TOKEN);

// Web UI
app.get('/', (req, res) => {
  res.sendFile('index.html');
});

io.on('connection', function(socket) {
  socket.on('chat message', (text) => {
    console.log('Message: ' + text);

    // Get a reply from API.ai

    console.log('SENDING THIS TEXT TO APIAAI : \n'+text+'\n');

    let dtTimestamp = datetime.create();


    let apiaiReq = apiai.textRequest(text, {
      "sessionId": APIAI_SESSION_ID,
      "originalRequest": {
        "source": "bmivoice", 
        "data": { 
          "message": { 
            "date": dtTimestamp, 
            "chat": { 
              "last_name": "Supendi", 
              "id": 233954027, 
              "type": "private", 
              "first_name": "Gumilar Irwan", 
              "username": "gumilaris" }, 
              "message_id": 8008, 
              "from": { 
                "language_code": "id-ID", 
                "last_name": "Supendi", 
                "id": 233954027, 
                "is_bot": false, 
                "first_name": "Gumilar Irwan", 
                "username": "gumilaris" 
              }, 
              "text": text } }
      }
    });

    apiaiReq.on('response', (response) => {

      console.log('GET RESPONSE FROM APIAI : \n'+JSON.stringify(response)+'\n\n');

      let aiText = response.result.fulfillment.speech;
      console.log('Bot reply: ' + aiText);
      socket.emit('bot reply', aiText);
    });

    apiaiReq.on('error', (error) => {
      console.log(error);
    });

    apiaiReq.end();

  });
});
