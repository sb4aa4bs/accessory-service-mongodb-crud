var aguid = require('aguid');
//var redisClient = require('redis-connection')();
var models =require('../models');
var JWT   = require('jsonwebtoken');
var server = require('../../server');
/*redisClient.set('redis', 'working');
redisClient.get('redis', function (rediserror, reply) {
    /!* istanbul ignore if *!/
    if(rediserror) {
        console.log(rediserror);
    }
    console.log('redis is ' +reply.toString()); // confirm we can access redis
});*/

module.exports={
    login:function(request,reply){
        console.log(request.payload.username);
        models.user.find({
            where:{username:request.payload.username,
                password:request.payload.password
            }
        }).then(function(res){
            console.log(res.dataValues.id);
            var session = {
                valid: true, // this will be set to false when the person logs out
                session_id: aguid(),// a random session id
                id:res.dataValues.id,
                username:res.dataValues.username,
                exp: new Date().getTime() + 55 * 60 * 1000 // expires in 55 minutes time
            };
            // create the session in Redis
            //TODO RSG 12/07/2016 redisClient.set(session.session_id, JSON.stringify(session));
            var token = JWT.sign(session, 'admin'); // synchronous
            reply(token);
        }).catch(function(error)
        {
        });
    },
    logout:function(request,reply){
        var decoded = JWT.decode(request.headers.authorization,
            "admin");
        /*var session;
        redisClient.get(decoded.session_id, function(rediserror, redisreply) {
            /!* istanbul ignore if *!/
            if(rediserror) {
                console.log(rediserror);
            }
            session = JSON.parse(redisreply);
            console.log(' - - - - - - SESSION - - - - - - - -');
            console.log(session);
            // update the session to no longer valid:
            session.valid = false;
            session.ended = new Date().getTime();
            // create the session in Redis
            console.log(session);
            redisClient.set(session.session_id, JSON.stringify(session));
            var token = JWT.sign(session, 'admin');
            console.log("Logout Token",token);
            reply("200");
        });*/
        reply("200");
    },
    createUser:function (request,reply) {
        models.user.create(request.payload).then(function(newUser){
            reply(newUser);
        }).catch(function(error){
                console.error('Authentication: createUser() ERROR : ' + error);
                reply(error);

        });
    }
};













