var express = require('express');
var cors=require("cors")
var app = express();

global.__basedir = __dirname;
app.use(express.json());
app.use(cors());
require('./routes')(app);
require('./plugins/db')(app);

app.get('/', function (req, res) {
  res.setHeader('Access-Control-Allow-Credentials',"true");
  res.send('Received client request');
});


app.listen(8081, function () {
  console.log('Server is running in http://localhost:8081!');
});