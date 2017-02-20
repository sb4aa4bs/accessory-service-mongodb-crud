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
var Accessory = mongoose.model('Accessory');
var e = new Accessory();
e.name='iPhone 6s Leather Case'; // #2 "name"
e.description='iPhone 6s  - suggested Accessories - iPhone 6s Leather Case'; // #3 "ACCESSORIESTYPE"+"name"
e.retail_price= 45.00 // #4
e.sale_price= 45.00;
e.promotion= true;
e.size= '';
e.configuration= '';
e.color= 'Saddle Brown'; // #5
e.skuid = '45-001';
e.active= true;
e.picture = 'MKXT2_AV1_ROSEGLD.png'; // #1 "Image"
e.contract= '2/2 Year contract';
e.store='T-MOBILE';
e.details.more_description='Quality you can trust, from a company that cares. High quality synthetic leather we use, ' +
    'soft and durable. Vintage look distressed leather with rub pattern design, ' +
    'protects your iPhone 6s / iPhone 6 against accidental moisture, collision, scratch'; // #6
e.details.warranty= '1 year';
e.details.processor= '';
e.details.vendor= 'Apple';
e.details.store_num= 'USA-001';
e.save(function(err,accessory) {
    console.log("Inserted Accessory ID :::: " +accessory.id);
});
var sku='45-001';
Accessory.find({'skuid': {'$regex': sku} }, function (err, items) {
    if (err) throw err;
    // object of all the users
    console.log("ITEMS :::: " +items);
});