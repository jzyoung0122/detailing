var path=require("path")
var express = require('express');
var app = express();
global.__basedir = __dirname;
app.use(express.json());
app.use(express.static('dist'))

app.use(express.static(path.join(__dirname,'./dist')))
// // app.use(history())

require('./routes')(app);
require('./plugins/db')(app);

// app.get('/', function (req, res) {
//   res.send('Received client request');
// });


app.get('./*', (req,res)=>{
 res.sendFile((__dirname+'./dist/index.html'))
})


app.listen(8081, function () {
  console.log('Server is running in http://localhost:8081!');
});
