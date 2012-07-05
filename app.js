
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , http = require('http')
  , util = require('util')
  , io = require('socket.io')
  , connect = require('connect')
  , EventEmitter = require("events").EventEmitter
  , controller = new EventEmitter()
  , execute = require("./lib/DocuSignSDKExecute.js")
  , DocuSign = require("./lib/docusign.js")
  , fs = require("fs")
  , configData = fs.readFileSync("config.json", 'utf-8')
  , api = DocuSign.API(JSON.parse(configData));

var app = express();
var redisStore = require('connect-redis')(express);
var pRedisStore = new redisStore();

function p (a) {
  console.log(a);
}

app.configure(function(){
  app.set('port', process.env.PORT || 3001);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.cookieParser("supperDupper"));
  app.use(express.session({store: pRedisStore}));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});
 
app.configure('production', function () {
    var redisUrl = require('url').parse(process.env.REDISTOGO_URL),
        redisAuth = redisUrl.auth.split(':');  
    app.set('redisHost', redisUrl.hostname);
    app.set('redisPort', redisUrl.port);
    app.set('redisDb', redisAuth[0]);
    app.set('redisPass', redisAuth[1]);
}); 

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/', routes.root);
app.get('/sign/:userId/:userName/:docId/:email', routes.embeddedSigning);
app.get('/:userId', routes.embeddedSigningComplete);

var server = http.createServer(app);

server.listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});

var cloudSpokesIO = io.listen(server);

function p (a) {
  console.log (JSON.stringify(a, null,2));
}

var users = {};
var connections ={};

cloudSpokesIO.set ('authorization', function (data, accept) {
 var cookies = connect.utils.parseSignedCookie (data.headers.cookie)
  , supperDupper = cookies["supperDupper"];

  pRedisStore.load(supperDupper, function (err, sess) {
    if(err) return accept(err);
    data.session = sess;
    p (data);
    accept(null, true)
  })
})

cloudSpokesIO
  .sockets
    .on('connection', function (socket) {
      var hs = socket.handshake;
      socket
        .on('signingInfo', function(userId, userName, docId, email) {
          hs.userName = userId;
          connections[userId] = socket.id;
          users[socket.id] = socket;
          controller.emit ('login', userId, userName, docId, email);

          console.log ("(*************)")
          console.log ("users length " + Object.keys(users).length)
        })
        .on('disconnect', function () {
          delete users[socket.id];
          delete connections[hs.userName];

           console.log ("users length " + Object.keys(users).length)
        })
  });

controller
  .on('login', function(userId, userName, docId, email) {
    console.log('==== just triggered embedded signing for userId: ' + userId);
    console.log('==== just triggered embedded signing for userName: ' + userName);
    console.log('==== just triggered embedded signing doc: ' + docId);
    console.log('==== just triggered embedded signing email: ' + email);
    triggerEmbeddedSigning(userId, userName, docId, email);
  })
  .on('recipientUrl', function(inObj) {
      connections[inObj.user].emit('recipientUrl', inObj.data.url); 
  });


function triggerEmbeddedSigning(userId, userName, docId, email) {

  var id = userId;
  console.log('====triggerEmbeddedSigning userId: '+userId);

  var inTemplate = {
      "emailBlurb": "Please DocuSign your document."
      , "emailSubject": "CloudSpokes Member Tax Document for " + userName
      , "templateId": docId
      , "templateRoles": [{
            "email": email
            , "name": userName
            , "roleName": "RoleOne"
            , "clientUserId" : userName
          }] 
      ,"status": "sent"
  };

  var inRecipientView = {
    "authenticationMethod": "email"
    , "email": email
    , "returnUrl": ""
    , "userName": userName
    , "clientUserId": userName
  }

  execute.docusign([
    api.Login({callback: loginComplete})
    , api.createEnvelopeFromTemplate({ data: inTemplate, callback: parseCreateEnvelopeCaptive})
    , api.getRecipientView({callback: pushUrl, data: inRecipientView})
    ])();


  function loginComplete (arguments) {

    var root = this
      , responseStatus = arguments[0]
      , data = arguments[1]
      , next = arguments[2];

    root.basePath = JSON.parse(data).loginAccounts[0].baseUrl;

    next();
  }

  function parseCreateEnvelopeCaptive(arguments) {
    
    var root = this
      , responseStatus = arguments[0]
      , data = arguments[1]
      , next = arguments[2];

    data = JSON.parse(data);
    
    // pass the member's id back to through the data
    console.log('==== parseCreateEnvelopeCaptive for userId: ' + id);
    console.log('==== parseCreateEnvelopeCaptive for datea: ' + util.inspect(data));

    next({data: data, memberId: id});

  }

  function pushUrl(arguments) {
    
    var root = this
      , responseStatus = arguments[0]
      , data = arguments[1]
      , next = arguments[2];
    
    users[connections[id]].emit('recipientUrl', JSON.parse(data).url);
    next();
  }

}
