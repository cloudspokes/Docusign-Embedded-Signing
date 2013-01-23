
var cs = require("../lib/cloudspokes.js");


var execute = require("./../lib/DocuSignSDKExecute.js")
  , DocuSign = require("./../lib/docusign.js")
  , fs = require("fs")
  , configData = fs.readFileSync("./config.json", 'utf-8')
  , api = DocuSign.API(JSON.parse(configData));

/*
 * GET home page.
 */

exports.root = function(req, res) {
  res.render('root', { title: 'DocuSigning CloudSpokes Tax Forms' })
};

exports.embeddedSigning = function (req, res) {
  console.log("embedded signing");
  console.log(req.params)
  res.render ('embeddedSigning', { title: "DocuSign CloudSpokes Documents", data: req.params } );
}


exports.embeddedSigningComplete = function(req, res) {

  var userId = req.params.userId;
  console.log('request params: ' + JSON.stringify(req.params));
  var eventType = req['query']['event'];
  console.log('===== eventType:'+eventType);

  console.log(req.params);

  if (eventType === 'signing_complete') {
    //
    // jeff?: do you want to do anything if this fails?
    //

    // challenge 2026
    // moved inside processGetEnvelope and extended the function
    // cs.updateMember(userId);
    res.render('SigningComplete/success'
              , { title: "Signing Complete Success!", user: userId });

    var inObj = {
      envelopeId : req.params.envelopeId
    };

    execute.docusign([
      api.Login({callback: loginComplete})
      , api.getEnvelopeRecipientsIncludingTabs({ data: inObj, callback: processGetEnvelope})
      ])();

  } else if (eventType == 'decline') {
    res.render('SigningComplete/fail'
              , { title: "Sign Documents"
                  , event: eventType});
  } else {
    res.render('SigningComplete/cancel'
              , { title: "Sign Documents"
                  , event: eventType});
  }

  //
  // arguments[0] gives ResponseObject
  // arguments[0][0] response Headers & statusCode 
  // arguments[0][1] responsebody as string
  //
  function processGetEnvelope(arguments) {

    // challenge 2026
    // pass userTabs
    var userTabs = arguments[1].replace(/(\r\n|\n|\r)/gm,"");    
    cs.updateMember(userId, JSON.parse(userTabs).signers[0].tabs);
  }
  
  function loginComplete (arguments) {

    var root = this
      , responseStatus = arguments[0]
      , data = arguments[1]
      , next = arguments[2];

    root.basePath = JSON.parse(data).loginAccounts[0].baseUrl;

    next();
  }
}