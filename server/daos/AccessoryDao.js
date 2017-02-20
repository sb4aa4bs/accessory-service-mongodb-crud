

var Accessory = require('../models/accessory');

var mongo = require('mongodb');


var Server = mongo.Server,
    Db = mongo.Db,
    BSON = mongo.BSONPure;

var server = new Server('localhost', 27017, {auto_reconnect: true});
db = new Db('itsdb', server);
db.open(function(err, db) {
    if(!err) {
        console.log('Employee Service up!');
    }
});

module.exports={

	/*
	 *  Get all accessories. Sends response from here
	 */
	findAllAccessories: function(reply){

            db.collection('accessories', function(err, collection) {
                collection.find({}).toArray(function(err, items) {
                    console.log('Sending all accessories with size : ' + items.length);
                    reply(items).code(200);
                });
            });
	},



    /*
     *  Find/Search accessory by criteria. Sends response from here
     *  Right now via sku
     *
     */
    findAccessoriesBySku: function (request,reply){
		var condition;
		var sku= request.params.sku;
		console.log('AccessoryDao : findAccessoriesBySku() called');
        Accessory.find({'skuid': {'$regex': sku}},function(err, itemsx) {
            reply(itemsx).code(200);
        });
    /*
        db.collection('accessories', function(err, collection) {
            collection.find({'skuid': {'$regex': sku}}).toArray(function(err, items) {
                console.log('Sending accessories with a match for ' + sku + ',with size : ' + items.length);
                console.log(items);

                reply(items).code(200);
            });
        });
        */
	}

};