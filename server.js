var Hapi        = require('hapi');
var hapiAuthJWT = require('hapi-auth-jwt2');
var inert=require('inert');
var vision=require('vision');

var accessoryroutes=require('./server/controllers/accessoryroutes');

/*
 var redisClient = require('redis-connection')();
 redisClient.set('redis', 'working');
 redisClient.get('redis', function (rediserror, reply) {
 if(rediserror) {
 console.log(rediserror);
 }
 console.log('redis is ' +reply.toString()); // confirm we can access redis
 });
 */
// bring your own validation function
var validate = function (decoded, request, callback) {

    console.log("server long token",decoded);
    return callback(null, true);   //TODO: RSG 12/07/2016 change later

    redisClient.get(decoded.session_id, function (rediserror, reply) {
        console.log("reply",reply);

        if(rediserror) {
            console.log(rediserror);
        }
        var session;
        if(reply ) {
            session = JSON.parse(reply);
            console.log("sesion expier",session.exp,"In date ",new Date(session.exp));
            console.log("current time expier",new Date());
            console.log()
            if(session.exp>new Date().getTime() && session.valid === true )
            {

                console.log("before",new Date(session.exp));
                session.exp= new Date().getTime() + 55 * 60 * 1000; // expires in 2 minutes time
                console.log("after add",new Date(session.exp));
                //// RSG 12/07/2106 redisClient.set(session.session_id, JSON.stringify(session));
                console.log(session);
                return callback(rediserror, true);
            }
            else
            {
                // update the session to no longer valid:
                session.valid = false;
                session.ended = new Date().getTime();
                // RSG 12/07/2106 redisClient.set(session.session_id, JSON.stringify(session));
                console.log(' - - - - - - SESSION expire - - - - - - - -')
                console.log(session);
                return callback(rediserror, false);
            }

        }
        else { // unable to find session in redis ... reply is null
            return callback(rediserror, false);
        }

        /*if (session.valid === true) {
         return callback(rediserror, true);
         }
         else {
         return callback(rediserror, false);
         }*/
    });
};





var server = new Hapi.Server();
server.connection({port:4000, routes: {cors: true}});

// First make sure we have a loopback ping test ready
server.route({
    method: 'GET',
    path: '/ping',
    handler: function (request, reply) {
        console.log('ping received');
        reply('ok\n').code(200);
    }
});
server.register([
    {
        // register logging plugins
        register: require('good'),
        options: {
            reporters: {
                console: [
                    {
                        module: 'good-squeeze',
                        name: 'Squeeze',
                        args: [{response: '*', log: '*'}]
                    },
                    {
                        module: 'good-console'
                    },
                    'stdout'
                ]
            }
        }
    },
    {
        register: hapiAuthJWT
    },
    {
        register: inert
    },
    {
        register: vision
    },
    {
        register: require('hapi-swagger')
    },
    {
        register: require('hapijs-status-monitor')
    }


    //hapiAuthJWT, inert,vision,require('hapi-swagger'),require('hapijs-status-monitor')
],function (err) {
    server.auth.strategy('jwt', 'jwt',
        { key: 'admin',  validateFunc: validate,
            verifyOptions: { algorithms: [ 'HS256' ] }
        });
    //verifyOptions: { ignoreExpiration: false }
    /* server.inject({ method: 'GET', url: '/sendMailtoOwner' }, function (res) {

     /!*expect(res.result).to.be.an.object();
     expect(res.result.response.toString()).to.contain('<p>NODEMAILER</p>');*!/

     // done();
     });*/

    server.route(accessoryroutes);

});

server.start(function(){
    server.log(['debug'], 'server running at:'+server.info.uri);
}); // uncomment this to run the server directly



/*exports.closeServer = function () {
 server.close();
 };*/
module.exports=server;
module.exports.closeit=function () {
    server.stop();
};
