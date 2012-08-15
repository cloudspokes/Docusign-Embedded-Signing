
var   util = require('util')
	, fs = require('fs')
	, https = require('https')
	, ds = require('./docuSignObj.js');	

exports.API = function(configData) {
	
	var root = {}
		, httpOptions =configData.httpOptions
		, credsString = "<DocuSignCredentials> <Username>"+process.env.DOCUSIGN_USERNAME+"</Username> <Password>"+process.env.DOCUSIGN_PASSWORD+"</Password> <IntegratorKey>"+process.env.DOCUSIGN_INTEGRATOR_KEY+"</IntegratorKey> </DocuSignCredentials>";

	// override the host from the config
	httpOptions.host = process.env.DOCUSIGN_HOST;

	var Login = function (spec) {

		var that = ds.DocuSignObj (spec, root);
		that.options = JSON.parse (JSON.stringify (httpOptions));
		that.options.method = "GET";
		that.options.path = "/restapi/v2/login_information";
		that.options.headers["X-DocuSign-Authentication"] = credsString;

		console.log("*******MY Options****")
		console.log (JSON.stringify (that.options));
		return that;
	}


	var createEnvelopeFromTemplate = function(spec) {

		//console.log('==== createEnvelopeFromTemplate for userName: ' + spec.userName);
		//console.log('==== createEnvelopeFromTemplate doc: ' + spec.docId);

		var that = ds.DocuSignObj(spec, root);
		that.options = JSON.parse (JSON.stringify (httpOptions));
		that.options.headers["X-DocuSign-Authentication"] = credsString;
		that.requestBody = null;

		that.preRequest = function(inObj) {
				that.options.method = "POST";
				that.options.path = root.basePath + "/envelopes";
				that.requestBody = spec.data;

				console.log ( JSON.stringify(that.requestBody, null, 2));
		}


		return that;
	}


	var getRecipientView = function(spec) {

		var that = ds.DocuSignObj(spec, root);
		
		that.options = JSON.parse (JSON.stringify (httpOptions));
		that.options.headers["X-DocuSign-Authentication"] = credsString;
		that.options.method = "POST"
		, that.requestBody = spec.data;


		that.preRequest = function(inObj) {
			
			var data = inObj.data;

			if(data && data.envelopeId) {
				that.options.path = root.basePath + "/envelopes/" + data.envelopeId + "/views/recipient"
				that.requestBody.returnUrl = process.env.CONFIG_URL_BASE + "/embeddedComplete/" + inObj.memberId + "/" + data.envelopeId;
			}

			console.log (util.inspect (that.requestBody));
			console.log(util.inspect(that.options));

		}

		return that;
	}

	var getEnvelopeRecipientsIncludingTabs = function(spec) {
		var that = ds.DocuSignObj(spec, root);
	
		that.options = JSON.parse (JSON.stringify (httpOptions));
		that.options.headers["X-DocuSign-Authentication"] = credsString;
		that.options.method = "GET";

		var spec = spec;
		that.preRequest = function(inObj) {
			
			var data = spec.data;

			if(data && data.envelopeId) {
				that.options.path = root.basePath + "/envelopes/" + data.envelopeId + "/recipients?include_tabs=true";
			}

			console.log(util.inspect(that.options));

		}

		return that;
	}

	return { "Login" : Login
				, "createEnvelopeFromTemplate": createEnvelopeFromTemplate
				, "getRecipientView" : getRecipientView
				, "getEnvelopeRecipientsIncludingTabs" : getEnvelopeRecipientsIncludingTabs
			};

};
