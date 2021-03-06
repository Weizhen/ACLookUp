var http = require ('http');
var mongoose = require ("mongoose");
var express = require('express');

// Here we find an appropriate database to connect to, defaulting to
// localhost if we don't find one.  
var uristring = 
  process.env.MONGOLAB_URI || 
  process.env.MONGOHQ_URL || 
  'mongodb://dev:dev@ds043062.mongolab.com:43062/devdb';

// The http server will listen to an appropriate port, or default to
// port 5000.
var theport = process.env.PORT || 5000;

// Makes connection asynchronously.  Mongoose will queue up database
// operations and release them when the connection is complete.
mongoose.connect(uristring, function (err, res) {
  if (err) { 
    console.log ('ERROR connecting to: ' + uristring + '. ' + err);
  } else {
    console.log ('Succeeded connected to: ' + uristring);
  }
});

// This is the schema.  Note the types, validation and trim
// statements.  They enforce useful constraints on the data.
var accessorySchema = new mongoose.Schema({
  aid: { type: String},
  img: { type: String},
  des: { type: String}
});

var mschema = new mongoose.Schema({
  pid: { type: String},
  acs: [accessorySchema]
});

// Compiles the schema into a model, opening (or creating, if
// nonexistent) the 'PowerUsers' collection in the MongoDB database
var pm = mongoose.model('ProductMapping', mschema);

// Clear out old data
pm.remove({}, function(err) {
  if (err) {
    console.log ('error deleting old data.');
  }
});

// Creating one user.
// var p1 = new pm ({
//   pid: '8421010802',
//   acs: [{aid: '8202118330', img: 'ac0055820', des: 'HOSE REEL HM LIGHT 8-266'},{aid:'8202118331', img: 'ac0055820', des: 'HOSE REEL HM LIGHT 8-270'},{aid: '8202118332', img: 'ac0055820', des: 'HOSE REEL HM LIGHT 10-268'},{aid:'8202118341',img:'ac0055820',des: 'HOSE REEL HM LIGHT 8-8 NPT'}]
// });

// // Saving it to the database.  
// p1.save(function (err) {if (err) console.log ('Error on save!')});

// // Creating more users manually
// var p2 = new pm ({
//   pid: '8421010803',
//   acs: [{aid: '8202118330', img: 'ac0055820', des: 'HOSE REEL HM LIGHT 8-266'},{aid:'8202118331', img: 'ac0055820', des: 'HOSE REEL HM LIGHT 8-270'},{aid: '8202118332', img: 'ac0055820', des: 'HOSE REEL HM LIGHT 10-268'},{aid:'8202118341',img:'ac0055820',des: 'HOSE REEL HM LIGHT 8-8 NPT'}]
// });

// p2.save(function (err) {if (err) console.log ('Error on save!')});



// In case the browser connects before the database is connected, the
// user will see this message.
var found = ['DB Connection not yet established.  Try again later.  Check the console output for error messages if this persists.'];



var app = express();


app.use('/pid', function(req, res, next){
  console.log(req);
  var key = req.path.replace("/","");
  var query = pm.find({'pid': key});
  query.exec(function(err, result) {
    if (!err) {
      if(result.length > 0) {
        res.status(200).jsonp({c:200, data:result});
        next();
      } else {
        res.status(404).jsonp({c:404, data:'no data'});
      }
    } else {
      console.log('Error occurs: ' + err);
      res.status(500).jsonp({c:500, data:'error'});
      next();
    }
  });
});
app.listen(theport);

// Create a rudimentary http server.  (Note, a real web application
// would use a complete web framework and router like express.js). 
// This is effectively the main interaction loop for the application. 
// As new http requests arrive, the callback function gets invoked.
// http.createServer(function (req, res) {
//   res.writeHead(200, {'Content-Type': 'text/html'});
//   createWebpage(req, res);
// }).listen(theport);

// function createWebpage (req, res) {
//   // Let's find all the documents
//   pm.find({}).exec(function(err, result) { 
//     if (!err) { 
//       res.write(html1 + JSON.stringify(result, undefined, 2) +  html2 + result.length + html3);
//       // Let's see if there are any senior citizens (older than 64) with the last name Doe using the query constructor
//       var query = pm.find({'pid': '8421010803'}); // (ok in this example, it's all entries)
//       query.exec(function(err, result) {
// 	if (!err) {
// 	  res.end(html4 + JSON.stringify(result, undefined, 2) + html5 + result.length + html6);
// 	} else {
// 	  res.end('Error in second query. ' + err)
// 	}
//       });
//     } else {
//       res.end('Error in first query. ' + err)
//     };
//   });
// }

// // Tell the console we're getting ready.
// // The listener in http.createServer should still be active after these messages are emitted.
// console.log('http server will be listening on port %d', theport);
// console.log('CTRL+C to exit');

// //
// // House keeping.

// //
// // The rudimentary HTML content in three pieces.
// var html1 = '<title> Product lookup demo </title> \
// <head> \
// <style> body {color: #394a5f; font-family: sans-serif} </style> \
// </head> \
// <body> \
// <h1> Atlas copco product lookup service demo result</h1> \
// This is used to demo product lookup service: \
// <br\> \
// <br\> \
// <br\> <h2> All Documents in MonogoDB database </h2> <pre><code> ';
// var html2 = '</code></pre> <br\> <i>';
// var html3 = ' documents. </i> <br\> <br\>';
// var html4 = '<h2> Queried (product ID = 8421010803) Documents in database </h2> <pre><code> ';
// var html5 = '</code></pre> <br\> <i>';
// var html6 = ' documents. </i> <br\> <br\> \
// <br\> <br\> <center></center>';


