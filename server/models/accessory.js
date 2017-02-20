
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

mongoose.connect('mongodb://localhost/itsdb', function(err) {
    if (err) { console.log(err) }
});


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


mongoose.model('Accessory', AccessorySchema);

var Accessory = mongoose.model('Accessory');
module.exports = Accessory;

