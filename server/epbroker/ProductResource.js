/**
 * Created by prokarma on 2/14/2017.
 */

/**
 * Created by prokarma on 2/14/2017.
 */

var httprequest = require('request');
var base_uri = 'http://ec2-35-164-110-172.us-west-2.compute.amazonaws.com:9080';
//var base_uri = 'http://localhost:9080';
//var auth_token = '4cf0a4e2-36c8-474e-97a0-860e3589fb51';
var auth_token = '101810c4-409e-433c-a359-b106267cb6c8';


module.exports={


    /*
     *  Get all products from ELASTIC PATH. Sends response from here
     */
    findAllProducts: function(reply){

    },



    /*
     *  Get product by id from ELASTIC PATH. We might pull other child objects too
     */
    getProductById: function (request,reply){
        var id=request.params.id;
        console.log('ProductResource: getProductById() with object id: ' + id );
        var response = {'message': 'getProductById..','error': 0};
        // TODO: RSG call ELASTIC PATH
        module.exports.getItem(id,'mobee',function(data){
            reply(data).code(200);
        });

    },


    searchProductByKeyword: function (request,reply) {
        var keyword=request.params.keyword;
        console.log('ProductResource: searchProductByKeyWord() with object keyword: ' + keyword );
        var response = {'message': 'getProductById..','error': 0};
        var i=0;
        module.exports.searchEPItems(keyword, 'mobee', function (data) {
            //RSG reply(response).code(200);
            i++;
            //console.log('Date response returned from call back : ' + data);
            if (i===5) reply(data).code(200);
        });
    },

    searchEPItems:function (searchString, storeId,callback) {

        var productList = [];
        //console.log('searchItems..........');
        var requestData = {
            'keywords': searchString, 'page-size': '5'
        };
        httprequest(base_uri + '/cortex/searches/' + storeId + '/keywords/items?followlocation',
            {
                json: true, body: requestData, method: 'POST',
                headers: {'Authorization': 'bearer ' + auth_token, 'Content-type': 'application/json'}
            },
            function (err, res, body) {
                if (err) {console.log('Cannot communicate to ELASTIC PATH');return;}
                var items = body.links;
                for (var item in items) {
                    var obj = items[item];
                    var type = obj.type;
                    //console.log('type..........' + type);
                    if (type === 'elasticpath.items.item') {
                        var uri = obj.uri;
                        if (uri.indexOf('/items/mobee/') > -1) {
                            var uriArray = uri.split('/');
                            var itemId = uriArray[3];
                            module.exports.getItem(itemId, 'mobee', function (product) {
                                productList.push(product);
                                callback(productList);


                            });

                        }
                    }
                }
            });
    },
    getItem : function (itemId, storeId, callback) {

        console.log('Starting getItem..........');
        var Product = {};

        Product['itemId'] = itemId;

        httprequest(base_uri + '/cortex/availabilities/items/' + storeId + '/' + itemId,
            {
                json: true, method: 'GET',
                headers: {'Authorization': 'bearer ' + auth_token, 'Content-type': 'application/json'}
            },
            function (err, res, body) {
                Product['availability'] = body['state'];
                // Display Name of Item

                httprequest(base_uri + '/cortex/itemdefinitions/' + storeId + '/' + itemId,
                    {
                        json: true, method: 'GET',
                        headers: {'Authorization': 'bearer ' + auth_token, 'Content-type': 'application/json'}
                    },
                    function (err, res, body) {
                        Product['display-name'] = body['display-name'];
                        // Code of Item

                        httprequest(base_uri + '/cortex/lookups/items/' + storeId + '/' + itemId,
                            {
                                json: true, method: 'GET',
                                headers: {'Authorization': 'bearer ' + auth_token, 'Content-type': 'application/json'}
                            },
                            function (err, res, body) {
                                Product['code'] = body['code'];

                                // Price of Item

                                httprequest(base_uri + '/cortex/prices/items/' + storeId + '/' + itemId,
                                    {
                                        json: true, method: 'GET',
                                        headers: {
                                            'Authorization': 'bearer ' + auth_token,
                                            'Content-type': 'application/json'
                                        }
                                    },
                                    function (err, res, body) {
                                        Product['purchase-price'] = body['purchase-price'];  //TODO RSG parse this array list , get the object with the american price
                                        Product['list-price'] = body['list-price'];          //TODO RSG parse this array list , get the object with the american price
                                        //console.log('\tProduct=' + Product['code'] + ',itemid=' + Product['itemId'] + ',price=' + Product['list-price']);
                                        callback(Product);

                                    });
                            });
                    });
            });
    }
};


