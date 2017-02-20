var request = require('request');
var JWT = require('jsonwebtoken');
var decoded;
var base_uri = 'http://ec2-35-164-110-172.us-west-2.compute.amazonaws.com:9080';
var auth_token = 'a1d2fa48-caf2-4b46-9fc6-a3c73130568c';//'db73a79d-4a9b-42fc-ac22-3ec929d14b02';
module.exports = {

    addItemToCart: function (request, reply) {
        //var cart_id = request.payload.cart_id;
        var item_id = request.payload.item_id;
        var nitems = request.payload.nitems;
        console.log('Cart Dao: add item with item_id=' + item_id + ',quantity =' + nitems);
        //console.log('Cart Dao: getCart() for card_id : ' + cart_id);
        module.exports.addEPItemToCart(auth_token, item_id, nitems, reply);
    },

    updateItemInCart: function (request, reply) {
        var item_id = request.payload.item_id;
        var updatedNumberOfItems = request.payload.updatedNumberOfItems;
        console.log('Cart Dao: update() with object item_id=' + item_id + ', Updated quantity=' + updatedNumberOfItems);
        var response = {'message': 'Cart update successful..', 'error': 0};
        module.exports.updateEPItemInCart(auth_token, item_id, updatedNumberOfItems, reply);
    },

    deleteItemFromCart: function (request, reply) {
        var cart_id = request.payload.cart_id;
        var item_id = request.payload.item_id;
        console.log('Cart Dao: delete() with object cart_id: ' + cart_id + 'item_id=' + item_id);
        var response = {'message': 'Cart delete successful..', 'error': 0};
        // TODO: RSG Cart.delete(cart_id,item_id);
        reply(response).code(200);
    },

    /*
     *  id of the cart needs to be passed as a query, in our case it is a auth-token
     */
    getCart: function (reply) {
        console.log('Cart Dao: getCart() for id : ' + auth_token);
        // make call to ELASTIC PATH
        module.exports.getEPCart(auth_token, function (data) {
            reply(data).code(200);
            console.log('Reply' + JSON.stringify(data));
        });
    },

    /*
     *  ELASTIC PATH ADD item to a cart. Sends response from here
     */
    addEPItemToCart: function (auth_token, itemId, numberOfItems, callback) {
        var message = 'ELASTIC PATH addCart failure!!!';
        var response = {'message': message, 'error': 500};

        request({
            headers: {
                'Authorization': 'bearer ' + auth_token,
                'Accept': 'application/json'
            },
            uri: base_uri + '/cortex/carts/mobee/default/lineitems/items/mobee/' + itemId + '?followlocation',
            method: 'POST',
            json: {quantity: numberOfItems}
        }, function (err, res, body) {
            if (err) {
                callback(response.code(500));
                console.log(message);
            }
            else {
                console.log(body);
                console.log(body.links);
                console.log(body.quantity);
                console.log('ELASTIC PATH addCart() success..');
                callback(body).code(200);
            }
        });
    },

    /*
     *  Get current cart with auth_token from ELASTIC PATH
     */
    getEPCart: function (auth_token, callback) {
        var productList = [];
        var cart = {};

        request({
            headers: {
                'Authorization': 'bearer ' + auth_token,
                'Accept': 'application/json'
            },
            uri: base_uri + '/cortex/carts/mobee/default?zoom=total',
            method: 'GET'
        }, function (err, res, body) {
            console.log(body);
            var default_cart = JSON.parse(body);
            console.log('Default Cart:' + default_cart);
            console.log(default_cart["total-quantity"]);
            console.log(default_cart["self"]);
            console.log(default_cart["links"]);
            var cart_total = default_cart["_total"];
            var cart_cost = cart_total[0].cost;
            cart['total'] = cart_cost[0].amount;
            var lineItemsLink;
            var uriSplitArray = default_cart["self"].uri.split('/');
            var extCartId = uriSplitArray[3];
            var cartId = extCartId.substring(0, extCartId.lastIndexOf("?"));
            console.log(cartId);
            cart['id'] = cartId;
            var cart_links_array = default_cart["links"];
            for (var i = 0; i < cart_links_array.length; i++) {
                if (cart_links_array[i].rel == 'lineitems') {
                    lineItemsLink = cart_links_array[i].href;
                    console.log('Line Items Link from Cart:' + lineItemsLink);
                    break;
                }
            }
            console.log('Attempting to get line items');
            request({
                headers: {
                    'Authorization': 'bearer ' + auth_token,
                    'Accept': 'application/json'
                },
                uri: lineItemsLink + '?zoom=element',
                method: 'GET'
            }, function (err, res, body) {
                if (err) {
                    console.log('Failed to get line items in the cart!!!');
                    return;
                }
                console.log('Succesful, body:' + body);
                var cart_lineitems = JSON.parse(body);
                console.log(cart_lineitems["self"]);
                console.log(cart_lineitems["links"]);
                console.log('LineItemsDetails:' + '\n' + cart_lineitems["_element"]);
                if (cart_lineitems["_element"] == null) {
                    cart['items'] = [];
                    callback(cart);
                } else {
                    var lineItemsZoom = cart_lineitems["_element"];

                    for (var i = 0; i < lineItemsZoom.length; i++) {
                        var lineItemDetails = lineItemsZoom[i];
                        var lineItemDetailLinks = lineItemDetails['links'];
                        for (var detailLink in lineItemDetailLinks) {
                            var itemIdUri = lineItemDetailLinks[detailLink].uri;
                            console.log('Item ID URI:' + itemIdUri);
                            if (lineItemDetailLinks[detailLink].rel == 'item' && itemIdUri.indexOf('/items/mobee/') > -1) {
                                var uriArray = itemIdUri.split('/');
                                var itemId = uriArray[3];
                                console.log(itemId);
                                module.exports.getItem(auth_token, itemId, 'mobee', function (product) {
                                    productList.push(product);
                                    console.log(product);
                                    cart['items'] = productList;
                                    callback(cart);
                                });
                                console.log(productList + '\n');
                                break;
                            }
                        }
                    }
                }
            });
        });
    },


    /*
     *  update EP Item Into Cart
     */
    updateEPItemInCart: function (auth_token, itemId, updatedNumberOfItems, callback) {
        request({
                headers: {
                    'Authorization': 'bearer ' + auth_token,
                    'Accept': 'application/json'
                },
                uri: base_uri + '/cortex/carts/mobee/default?',
                method: 'GET'
            }, function (err, res, body) {
                if (err) {
                    console.log('Failed getting default cart.');
                    return;
                }
                console.log(body);
                var default_cart = JSON.parse(body);
                console.log(default_cart["total-quantity"]);
                console.log(default_cart["self"]);
                console.log(default_cart["links"]);
                var lineItemsLink;
                var cart_links_array = default_cart["links"];
                var text = "";
                var i;
                for (i = 0; i < cart_links_array.length; i++) {
                    if (cart_links_array[i].rel == 'lineitems') {
                        lineItemsLink = cart_links_array[i].href;
                        console.log('Line Items Link from Cart:' + lineItemsLink);
                        break;
                    }
                }
                console.log('Attempting to get line items');
                request({
                    headers: {
                        'Authorization': 'bearer ' + auth_token,
                        'Accept': 'application/json'
                    },
                    uri: lineItemsLink + '?zoom=element',
                    method: 'GET'
                }, function (err, res, body) {
                    if (err) {
                        console.log('Failed to get line items in the cart!!!');
                        return;
                    }
                    console.log('Succesful, body:' + body);
                    var cart_lineitems = JSON.parse(body);
                    console.log(cart_lineitems["self"]);
                    console.log(cart_lineitems["links"]);
                    console.log('LineItemsDetails:' + '\n' + cart_lineitems["_element"]);
                    var lineItemsZoom = cart_lineitems["_element"];

                    var line_items_links_array = cart_lineitems["links"];
                    var lineItemLinkToUpdate;
                    var text = "";
                    var i;
                    for (i = 0; i < lineItemsZoom.length; i++) {
                        var lineItemDetails = lineItemsZoom[i];
                        var lineItemDetailLinks = lineItemDetails['links'];
                        for (var detailLink in lineItemDetailLinks) {
                            var itemIdUri = JSON.stringify(lineItemDetailLinks[detailLink].uri);
                            if (lineItemDetailLinks[detailLink].rel == 'item' && itemIdUri.indexOf(itemId) > -1) {
                                lineItemLinkToUpdate = lineItemDetails['self'].href;
                                console.log(lineItemLinkToUpdate + '\n');
                                break;
                            }
                        }
                    }

                    request({
                        headers: {
                            'Authorization': 'bearer ' + auth_token,
                            'Accept': 'application/json'
                        },
                        uri: lineItemLinkToUpdate,
                        method: 'PUT',
                        json: {quantity: updatedNumberOfItems}
                    }, function (err, res, body) {
                        if (err) {
                            callback('Failed updating cart!!!').code(500);
                            console.log('Failed to update cart!!!');
                            return;
                        } else {
                            console.log(body);
                            console.log('Successfully updated quantity.');
                            callback('Successfully updated quantity.').code(200);
                        }
                    });
                });
            }
        )
    },


    /*
     *  Get brand new access token from ELASTIC PATH
     */
    getNewAccessToken: function (reply) {
        var message = 'ELASTIC PATH getNewAccessToken() failure!!!';
        var response = {'message': message, 'error': 500};

        request.post(base_uri + '/cortex/oauth2/tokens', {
            form: {
                grant_type: 'password',
                role: 'PUBLIC',
                scope: 'mobee',
                username: '',
                password: ''
            }
        }, function (err, res, body) {
            if (err) {
                reply(response.code(500));
                console.log(message);
            }
            else {
                console.log(body);
                var auth_res = JSON.parse(body);
                response = auth_res.access_token;
                console.log('ELASTIC PATH getNewAccessToken() success..');
                reply(response).code(200);
            }
        });
    },

    getItem: function (auth_token, itemId, storeId, callback) {

        console.log('Starting getItem..........');
        var Product = {};

        Product['itemId'] = itemId;

        request(base_uri + '/cortex/availabilities/items/' + storeId + '/' + itemId,
            {
                json: true, method: 'GET',
                headers: {'Authorization': 'bearer ' + auth_token, 'Content-type': 'application/json'}
            },
            function (err, res, body) {
                Product['availability'] = body['state'];
                // Display Name of Item

                request(base_uri + '/cortex/itemdefinitions/' + storeId + '/' + itemId,
                    {
                        json: true, method: 'GET',
                        headers: {'Authorization': 'bearer ' + auth_token, 'Content-type': 'application/json'}
                    },
                    function (err, res, body) {
                        Product['display-name'] = body['display-name'];
                        // Code of Item

                        request(base_uri + '/cortex/lookups/items/' + storeId + '/' + itemId,
                            {
                                json: true, method: 'GET',
                                headers: {'Authorization': 'bearer ' + auth_token, 'Content-type': 'application/json'}
                            },
                            function (err, res, body) {
                                Product['code'] = body['code'];

                                // Price of Item

                                request(base_uri + '/cortex/prices/items/' + storeId + '/' + itemId,
                                    {
                                        json: true, method: 'GET',
                                        headers: {
                                            'Authorization': 'bearer ' + auth_token,
                                            'Content-type': 'application/json'
                                        }
                                    },
                                    function (err, res, body) {
                                        Product['purchase-price'] = body['purchase-price'];
                                        Product['list-price'] = body['list-price'];
                                        callback(Product);

                                    });
                            });
                    });
            });
    }
};