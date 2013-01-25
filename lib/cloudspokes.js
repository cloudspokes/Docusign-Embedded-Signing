
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
		    member.Country__c = 'United States';

		    // challenge 2026
		    // update member info here
		    var memberTextTabs = memberTabs.textTabs;
		    //console.log(memberTabs.textTabs);
		    // loop through text tabs and set member's fields
		    for(var i = 0; i < memberTextTabs.length; i++) {

		    	var thisName = memberTextTabs[i].name;
		    	var thisLabel = memberTextTabs[i].tabLabel;
		    	var thisValue = memberTextTabs[i].value;

		    	console.log(thisName + ' -> ' + thisLabel + ' -> ' + thisValue);

		    	if(thisLabel == 'Name') {
						var chunks = thisValue.split(' ');
		    		member.First_Name__c = chunks[0].trim();
		    		member.Last_Name__c = '';
		    		for(var j = 1; j < chunks.length; j++) {
							member.Last_Name__c += ' '+ chunks[j].trim();
		    		}
		    		member.Last_Name__c = member.Last_Name__c.trim();
		    	} else if (thisLabel == 'Address') {
						member.Address_Line1__c = thisValue;
		    	} else if (thisLabel == 'City') {
		    		member.City__c = thisValue.trim();
		    	} else if (thisLabel == 'State') {
		    		member.State__c = thisValue.trim();
		    	} else if (thisLabel == 'Zip') {
		    		member.Zip__c = thisValue.trim();
		    	} else if (thisLabel == 'Country') {
		    		member.Country__c = thisValue.trim();		    		
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