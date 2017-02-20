/**
 * Created by rghosh on 2/19/2017.
 */

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

mongoose.connect('mongodb://localhost/itsdb', function(err) {
    if (err) { console.log(err) }
});


//var models  = require('../server/models');

var AccessorySchema = new Schema({
    name: String,
    description: String,
    retail_price: Number,
    sale_price: Number,
    promotion: Boolean,
    size: String,
    configuration: String,
    color: String,
    skuid: String,
    active: Boolean,
    picture: String,
    contract: String,
    store: String,
    details: {
        more_description: String,
        warranty: String,
        processor: String,
        vendor: String,
        store_num: String

    }
});


//var Accessory = models.accessory;
mongoose.model('Accessory', AccessorySchema);

var Accessory = mongoose.model('Accessory');

var e = new Accessory();


    e.name='Accessory 1';
    e.description='SAMSUNG High Quality HeadPhone';
    e.retail_price= 599.99;
    e.sale_price= 549.99;
    e.promotion= true;
    e.size= 'L';
    e.configuration= '16GB';
    e.color= 'Silver';
    e.skuid = '45-001';
    e.active= true;
    e.picture = 'https://rukminim1.flixcart.com/image/832/832/mobile/v/z/x/samsung-galaxy-on-nxt-sm-g610fzdgins-original-imaenkzvmnyf7sby.jpeg?q=7';

    e.contract= '2/2 Year contract';
    e.store='T-MOBILE';
    e.details.more_description='Accessory 1 details';
    e.details.warranty= '1 year';
    e.details.processor= 'Exynos 7870 Octa Core 1.6 GHz';
    e.details.vendor= 'Apple';
    e.details.store_num= 'USA-001';
/*
e.save(function(err,accessory) {
    console.log(accessory.id);
});*/
var sku='45';
Accessory.find({'skuid': {'$regex': sku} }, function (err, items) {
    if (err) throw err;
    // object of all the users
    console.log(items);
});

