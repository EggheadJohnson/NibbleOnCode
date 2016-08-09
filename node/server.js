// node modules
var express = require('express'),
	bodyParser = require('body-parser'),
	MongoClient = require('mongodb').MongoClient,
	request = require('request'),
	ioredis = require('ioredis'),
    

	// app modules
	config = require('./util/config.js'),

	// initialize
	app = express()
		.use(bodyParser.urlencoded({extended: false}))
		.use(bodyParser.json())
		.use(express.query())
		// Allow CORS for dev
		.use(function (req, res, next) {
			res.header('Access-Control-Allow-Origin', '*');
			res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
			res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization,InstitutionID,userId,redislockkey');
			if ('OPTIONS' == req.method){
                res.sendStatus(200);
            }
            else {
                next();
            }
		})
		// test auth
		.get('/node/status',function(req, res, next){
			res.status(200).json({msg: "Node is running"});
		})
		.get('/node/checkRedis', function(req, res, next){

			var redis = new ioredis(),
				testKey = "testKey";
			redis.set(testKey, "isGood", "EX", 20);
			
			redis.get(testKey, function(err, result){
					res.status(200).json({
						msg: "Redis is running",
						testKey: result
					});
			})
			
		})
		.get('/node/checkMongo', function(req, res, next){
			var url = config.mongoURL;
			MongoClient.connect(url, function(err, db){
				var collection = db.collection('blogs');
			  // Find some documents 
				collection.find({}).toArray(function(err, docs) {
					console.log("Found the following records");
					console.log(docs);
					db.close();
				});
			})
			res.status(200).json({msg: "Mongo is running"});
		})
		.get('/node/validateRedisLock', function(req, res, next){
			var redis = new ioredis();
			console.log(req.headers);
			redis.get('redislockkey', function(err, result){
				if (result && req.headers.redislockkey === result) {
					
					res.status(200).json({
						msg: "Write permitted"
					});
				}
				else {
					res.status(403).json({
						msg: "Not permitted >:("
					});
				}
			});

		})
		.get('/node/getBlogInfo', function(req, res, next){
			var url = config.mongoURL;
			MongoClient.connect(url, function(err, db){
				//console.log(err);
				var collection = db.collection('blogs');
			  // Find some documents 
				collection.find({}).toArray(function(err, docs) {
					if (!err) {
						res.status(200).json({
							data: docs
						});
					}
					else {
						res.status(500).json({err: err});
					}
					db.close();
				});
			});
		})
		.get('/node/getTags/:fileName', function(req, res, next){
			var url = config.mongoURL;
			//console.log(req.params.fileName);
			MongoClient.connect(url, function(err, db){
				var collection = db.collection('blogs');
			  // Find some documents 
				collection.aggregate([
					{$match: {file: req.params.fileName}},
					{$project: {_id: 0, tags: 1}},
					{$unwind: "$tags"}, 
					{$group: {_id: "$tags", total: {$sum: 1}}}
				], function(err, result){
						res.status(200).json({
							data: result
						});
					}
				);
			})
		})
		.get('/node/getTags', function(req, res, next){
			var url = config.mongoURL;
			MongoClient.connect(url, function(err, db){
				var collection = db.collection('blogs');
			  // Find some documents 
				collection.aggregate([
					{$project: {_id: 0, tags: 1}},
					{$unwind: "$tags"}, 
					{$group: {_id: "$tags", total: {$sum: 1}}}
				], function(err, result){
						res.status(200).json({
							data: result
						});
					}
				);
			})
		})
		.get('/node/getTags2', function(req, res, next){
			var url = config.mongoURL;
			MongoClient.connect(url, function(err, db){
				var collection = db.collection('blogs'),
					tagsArray = [],
					tagsObject = {};
			  // Find some documents 
			  collection.find({}).toArray(function(err, docs) {
					if (!err) {
						docs.forEach(function(doc){
							tagsArray = tagsArray.concat(doc.tags);
						});
						tagsArray.forEach(function(tag){
							if (tagsObject[tag]) tagsObject[tag] += 1;
							else tagsObject[tag] = 1;
						})


						res.status(200).json({
							data: tagsObject
						});
					}
					else {
						res.status(500).json({err: err});
					}
					db.close();
				});
				
			})
		});


app.listen(3000);
console.log(Date());
console.log('EE Node running on port 3000')
