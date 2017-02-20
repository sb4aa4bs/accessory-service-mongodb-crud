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
e.name='For Samsung Galaxy S7 edge  - suggested Accessories'; // #2 "name"
e.description='For Samsung Galaxy S7 edge  - suggested Accessories - SamsungGalaxy_Case.jpg'; // #3 "ACCESSORIESTYPE"+"name"
e.retail_price= 29.99 // #4
e.sale_price= 29.99;
e.promotion= true;
e.size= '';
e.configuration= '';
e.color= 'Grey, White, Red, Black'; // #5
e.skuid = '49-003'; // #6 AUTO INCREMENT BY 1
e.active= true;
e.picture = 'http://ec2-35-164-110-172.us-west-2.compute.amazonaws.com/ez2transfer-clientapp/assets/img/SamsungGalaxy_Case.jpg'; // #1 "Image"
e.contract= '2/2 Year contract';
e.store='T-MOBILE';
e.details.more_description='Classic Design: With its tailored fit and high-end look & feel, the Envoy shifts seamlessly from the workplace to a night out'; // #6
e.details.warranty= '1 year';
e.details.processor= '';
e.details.vendor= 'SAMSUNG';
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