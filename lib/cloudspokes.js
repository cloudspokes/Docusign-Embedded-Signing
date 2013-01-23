
var nforce = require('nforce')
	, util = require("util")
	, cs = require("./cloudspokes.js");
	
var oauth;	

exports.updateMember = function(memberId, memberTabs) {

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

		    // challenge 2026
		    // update member info here
		    var memberTextTabs = memberTabs.textTabs;

		    // loop through text tabs and set member's fields
		    for(var i = 0; i < memberTextTabs.length; i++) {
		    	var label = memberTextTabs[i].tabLabel;
		    	var value = memberTextTabs[i].value; 

		    	console.log(label +' -> '+ value);

		    	// please do pairing here
		    	// please refer to this JSON output for tabs
		    	// https://gist.github.com/4599410

		    	/* 
		    	if(label == 'Name') {
		    		member.Name__c = value;
		    	} else if(label == 'Address') {
					member.Address__c = value;	
		    	} else if(label == 'CityStateZip') {
		    		// maybe split the string by comma?

		    		var chunks = value.split(',');
		    		member.City__c = chunks[0];
		    		member.State__c = chunks[1];
		    		member.Zip__c = chunks[2];
		    	}
	
		    	*/

		    }
		    
		    org.update(member, oauth, function(err, resp){
		      if(!err) console.log('Member successfully updated');
		    });

		});
	
	  }
	});
	
}