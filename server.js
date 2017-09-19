// server.js

// BASE SETUP
// ======================================================

// call the packages that we need
var express = require('express');
var app = express();
var bodyParser = require('body-parser');


//var documentClient = require("documentdb").DocumentClient;
//var config = require("./config");

var DocumentDBClient = require('documentdb').DocumentClient
//  , config = require('./config')
//  , fs = require('fs')
//  , async = require('async')
//  , databaseId = config.names.database
//  , collectionId = config.names.collection
//  , dbLink
//  , collLink;

//var host = config.connection.endpoint;
//var masterKey = config.connection.authKey;

// Establish a new instance of the DocumentDBClient to be used throughout this demo
//var client = new DocumentDBClient(host, { masterKey: masterKey });


//var HttpStatusCodes = { NOTFOUND: 404 };
var databaseUrl = `dbs/database1`;
var collectionUrl = `${databaseUrl}/colls/collection1`;





var port = process.env.PORT || 8090;    // set the PORT

// configure the app to use body parser()
// this will let us get data from POST
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());




var dbConfig = { endPoint: "", peimaryKey: "", databaseId: "", collectionId: "" };
dbConfig.endPoint = "https://localhost:8081/";
dbConfig.peimaryKey = "C2y6yDjf5/R+ob0N8A7Cgv30VRDJIWEHLM+4QDU5DE2nQ9nDuVTqobD4b8mGGyPMbIZnqyMsEcaGQy67XIw/Jw==";
dbConfig.databaseId = "Test";
dbConfig.collectionId = "Test";
var client = new DocumentDBClient(dbConfig.endPoint, {
masterKey: dbConfig.peimaryKey
},
{
    DisableSSLVerification :true,
    EnableEndpointDiscovery : false,
    MediaReadMode : "Buffered",
    RequestTimeout : 10000,
    MediaRequestTimeout : 10000,
    PreferredLocations : [],
    RetryOptions: {}
});





// Function definitions
// https://github.com/Azure-Samples/azure-cosmos-db-documentdb-nodejs-getting-started/blob/master/app.js
function getDocument(id) {
    let documentUrl = `${collectionUrl}/docs/${id}`;
    console.log(`Getting document:${id}`);
    console.log(`Collection url: ${collectionUrl}`);
    console.log(`Document url: ${documentUrl}`);
  client.readDocument(documentUrl, function(err, document){
          if (err) {
              return console.log(err);
          } else {
              console.log(document);
          }
      });
};

// creates the database if it doesn't exist
function getDatabase() {
    console.log(`Getting database:\n${dbConfig.databaseId}\n`);

    return new Promise((resolve, reject) => {
        client.readDatabase(databaseUrl, (err, result) => {
            if (err) {
                if (err.code == HttpStatusCodes.NOTFOUND) {
                    client.createDatabase(dbConfig.databaseId, (err, created) => {
                        if (err) reject(err)
                        else resolve(created);
                    });
                } else {
                    reject(err);
                }
            } else {
                resolve(result);
            }
        });
    });
}

function listDocuments(collLink, res){


   var querySpec = {
       query: 'SELECT * FROM root'
   };

//   querySpec).toArray(function (err, results) {
//                if (err) {
//                    callback(err);
//
//                } else {
//                    callback(null, results[0]);
//                }
//            });


  client.readDocuments(collectionUrl, querySpec).toArray(function(err, result) {
    if(err){
      res.json(err);
    }
    else{
      console.log(result);
      res.json(result);
    }
  });
}


console.log(getDatabase());

var id = '00001'
console.log(getDocument(id));

//() => getDocument(id);
// ROUTES for the API
// ======================================================
var router = express.Router();

router.get('/', function(req,res){
  res.json({message: 'Welcome to the Snake River Bowl API.'})
});

router.get('/test', function(req,res){
  //2.

  dbLink = 'dbs/' + dbConfig.databaseId;
  console.log(dbLink);

  collLink = dbLink + '/colls/' + dbConfig.collectionId;

  console.log('\n2. listDocuments in collection \'' + collLink + '\'');
  listDocuments(collLink,res);
});

router.post('/', function(req,res){
  console.log(req.body);

  client.createDocument(collectionUrl,req.body, function(err,created){
    if(err){
      return err
    }
    else{
      res.json(created);
    }
  });
});

router.put('/:itemID', function(req,res){
  console.log(req.body);
  console.log(req.params.itemID)

  var self = this;

  let documentUrl = `${collectionUrl}/docs/${req.params.itemID}`;
  console.log(`Getting document:${id}`);
  console.log(`Collection url: ${collectionUrl}`);
  console.log(`Document url: ${documentUrl}`);
  client.readDocument(documentUrl, function(err, document){
        if (err) {
            return console.log(err);
        } else {
          client.replaceDocument(document._self, req.body, function (err, replaced) {
              if (err) {
                  return err;

              } else {
                  return replaced;
              }
          });
        }
    });

});



// REGISTER Our ROUTES ----
// all of our routes will be prefixed with /API
app.use('/api', router);

// start the server
app.listen(port);
console.log('Server is started up on port: ' + port);
