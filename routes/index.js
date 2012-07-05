
var cs = require("../lib/cloudspokes.js");
/*
 * GET home page.
 */

exports.root = function(req, res) {
  res.render('root', { title: 'DocuSigning CloudSpokes Tax Forms' })
};

exports.embeddedSigning = function (req, res) {
	res.render ('embeddedSigning', { title: "DocuSign CloudSpokes Documents", data: req.params } );
}


exports.embeddedSigningComplete = function(req, res) {

  var userId = req.params.userId;
  console.log('request params: ' + JSON.stringify(req.params));
  var eventType = req['query']['event'];

  if (eventType === 'signing_complete') {
    //
    // jeff?: do you want to do anything if this fails?
    //
    cs.updateMember(userId);
    res.render('SigningComplete/success'
              , { title: "Signing Complete Success!", user: userId });
  } else {
    res.render('SigningComplete/fail'
              , { title: "Sign Documents"
                  , event: eventType});
  }
}