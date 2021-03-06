const path = require('path');
const express = require('express');
const favicon = require('serve-favicon');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const db = require('./db');
const resolve = file => path.resolve(__dirname, file);
const api = require('./api');
const app = express();
const fs = require('fs');

app.set('port', 8090);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use('/static', express.static(resolve('../dist/static')));
// app.use('/favicon.ico', favicon(resolve('../dist/static/images/bitbug_favicon.ico')));

app.use("*", function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header("Access-Control-Allow-Headers", "Content-Type,Content-Length, Authorization, Accept,X-Requested-With");
  res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

app.use(api);

app.use(function (req, res, next) {
  fs.readFile(resolve('../dist/index.html'), function (err, data) {
    if (err) {
      res.status(404);
      throw err;
    }
    res.writeHead(200, { 'Content-type': 'text/html; charset=utf-8' });
    res.end(data);
  });
});

app.use(function (err, req, res, next) {
  console.error(err.stack);
  res.status(500);
  res.send('500');
});

app.listen(app.get('port'), function () {
  console.log('Visit http://localhost:' + app.get('port') + " 时间:" + new Date().toLocaleTimeString());
})
