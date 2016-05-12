'use strict';

var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var winston = require('winston');
var app = express();
var Client = require('node-rest-client').Client;
 
var client = new Client();

var info_url= process.env.API_URL + '/info';

console.log(info_url);
client.registerMethod("infoUrl", info_url, "GET");

global.logger = winston;
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'public')));

if (process.env.SHUD_LOG_TO_FILE) {
  logger.add(winston.transports.File, {filename: 'logs.log'});
}
logger.remove(winston.transports.Console);
logger.add(winston.transports.Console,
  {level: process.env.LOG_LEVEL || 'debug'});
app.set('view engine', 'ejs'); 
app.set('views', __dirname, '/public/views');
app.get('/',
  function (req, res) {
    logger.info('Main page');
    client.methods.infoUrl(function (data, response) {
       console.log(data);
       //console.log(response);
       res.render('./public/views/home',{message:data});
    });
  }
);

app.get('/env',
  function (req, res) {
    res.status(200).json({
      'API_URL': process.env.API_URL,
      'LOG_LEVEL': process.env.LOG_LEVEL,
      'SHUD_LOG_TO_FILE': process.env.SHUD_LOG_TO_FILE
    });
  }
);

app.use(
  function (req, res) {
    res.status(404);
    logger.error('Page not found');
    res.send('Page does not exist');
  }
);

var PORT = process.env.WWW_PORT || '80';

app.listen(PORT,
  function () {
    logger.info('micro-www running on port:', PORT);
  }
);
