
var nforce = require('nforce')
	, util = require("util")
	, cs = require("./cloudspokes.js");
	
var oauth;	

exports.updateMember = function(memberId) {

	var org = nforce.createConnection({
	  clientId: process.env.DATABASEDOTCOM_CLIENT_ID,
	  clientSecret: process.env.DATABASEDOTCOM_CLIENT_SECRET,
	  redirectUri: process.env.DATABASEDOTCOM_REDIRECT_URI,
	  apiVersion: 'v24.0',  // optional, defaults to v24.0
	  environment: process.env.DATABASEDOTCOM_ENVIRONMENT  // optional, sandbox or production, production default
	});

	org.authenticate({ username: process.env.SFDC_USERNAME, password: process.env.SFDC_PASSWORD }, function(err, resp){
	  if(err) {
	    console.log('Error: ' + err.message);
	  } else {
	    oauth = resp;
		
		console.log('memberId: '+memberId);
		org.query('select id, name from member__c where id = \''+memberId+'\'', oauth, function(err, resp){

		    var member = resp.records[0];
		    member.Paperwork_Received__c = 'Paper Work Received';
		    member.Paperwork_Year__c = new Date().getFullYear();

		    org.update(member, oauth, function(err, resp){
		      if(!err) console.log('Member successfully updated');
		    });
			
			// console.log('resp: ' + util.inspect(resp));
		});
	
	  }
	});
	
}