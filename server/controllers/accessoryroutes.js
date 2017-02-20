var accessoryservice = require('../services/accessoryservice');  //RSG 02/13/2017 added a service
var Joi= require('joi');
module.exports=[
    {
        method: 'GET',
        path: '/accessories',
        config: {
            auth: false,
            handler: accessoryservice.findAllAccessories,
            description: 'Get all accessories',
            notes: 'Returns all the accessories from the database',
            tags: ['api'],
            plugins: {
                'hapi-swagger': {
                    responseMessages: [
                        {code: 400, message: 'Bad Request'},
                        {code: 500, message: 'Internal server error'}
                    ]
                }
            }
        }
    },
    {
        method: 'GET',
        path: '/accessories/{sku}',
        config: {
            auth: false,
            handler: accessoryservice.findAccessoriesBySku,
            description: 'Get all accessories matching a sku',
            notes: 'Returns all the accessories from the database matching a sku',
            tags: ['api'],
            plugins: {
                'hapi-swagger': {
                    responseMessages: [
                        {code: 400, message: 'Bad Request'},
                        {code: 500, message: 'Internal server error'}
                    ]
                }
            },
            validate:{
                params:{
                    sku:Joi.string().required()
                }
            }
        }
    }

];