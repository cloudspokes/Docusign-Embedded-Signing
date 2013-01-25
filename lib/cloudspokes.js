
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
		var query = 'select id, name from member__c where id = \''+memberId+'\'';
		org.query(query, oauth, function(err, resp){
			console.log(resp);

		    var member = resp.records[0];
		    member.Paperwork_Received__c = 'Paper Work Received';
		    member.Paperwork_Year__c = new Date().getFullYear();

		    // challenge 2026
		    // update member info here
		    var memberTextTabs = memberTabs.textTabs;

		    console.log(memberTabs.textTabs);

		    // loop through text tabs and set member's fields
		    for(var i = 0; i < memberTextTabs.length; i++) {
		    	var label = memberTextTabs[i].tabLabel;
		    	var value = memberTextTabs[i].value; 

		    	console.log(label +' -> '+ value);

		    	// tabs 2 fields pairing here
		    	// please refer to this JSON output for tabs - https://gist.github.com/4599410

		    	if(label == 'Name') { // First_Name__c and Last_Name__c
		    		var chunks = value.split(' ');

		    		member.First_Name__c = chunks[0].trim();

		    		member.Last_Name__c = '';
		    		for(var i = 1; i < chunks.length; i++) {
						member.Last_Name__c += ' '+ chunks[i].trim();
		    		}
		    	} else if(label == 'Address') { // Address_Line1__c
					member.Address_Line1__c = value;	
		    	} else if(label == 'CityStateZip') {
		    		// maybe split the string by comma?

		    		var chunks = value.split(',');

		    		if(chunks[0]) member.City__c = chunks[0].trim();
		    		if(chunks[1]) member.State__c = chunks[1].trim();
		    		if(chunks[2]) member.Zip__c = chunks[2].trim();
		    	}

		    }
		    console.log(member);

		    org.update(member, oauth, function(err, resp){
		      if(!err) console.log('Member successfully updated');
		    });

		});
	
	  }
	});
	
}