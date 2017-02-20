var accessoryDao = require('../daos/AccessoryDao');  //RSG 02/12/2017 added this service
var JWT   = require('jsonwebtoken');
var decoded;
module.exports={

    findAllAccessories: function(request,response)  {
        accessoryDao.findAllAccessories(response);
    },

    findAccessoriesBySku: function(request,response)  {
        accessoryDao.findAccessoriesBySku(request,response);
    }

    /*  how to get user_id from the token
	 decoded = JWT.decode(request.headers.authorization,"admin");
	 var user_id = decoded.id;
	 */
};