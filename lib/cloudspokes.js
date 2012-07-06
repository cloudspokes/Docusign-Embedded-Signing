
var nforce = require('nforce')
	, util = require("util")
	, cs = require("./cloudspokes.js");
	
var oauth;	

exports.updateMember = function(memberId) {

	var org = nforce.createConnection({
	  clientId: process.env.DATABASEDOTCOM_CLIENT_ID,
	  clientSecret: process.env.DATABASEDOTCOM_CLIENT_SECRET,
	  redirectUri: process.env.CONFIG_URL_BASE + '/oauth/_callback',
	  apiVersion: 'v24.0',  // optional, defaults to v24.0
	  environment: process.env.DATABASEDOTCOM_ENVIRONMENT  // optional, sandbox or production, production default
	});

	org.authenticate({ username: process.env.SFDC_USERNAME, password: process.env.SFDC_PASSWORD }, function(err, resp){
	  if(err) {
	    console.log('Error for '+memberId+': ' + err.message);
	  } else {
	    oauth = resp;
		
		console.log('Updating memberId: '+memberId);
		org.query('select id, name from member__c where id = \''+memberId+'\'', oauth, function(err, resp){

		    var member = resp.records[0];
		    member.Paperwork_Received__c = 'Paper Work Received';
		    member.Paperwork_Year__c = new Date().getFullYear();

		    org.update(member, oauth, function(err, resp){
		      if(!err) console.log('Member successfully updated');
		    });

		});
	
	  }
	});
	
}