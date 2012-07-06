
var   util = require('util')
	, fs = require('fs')
	, https = require('https');


var DocuSignObj = function(spec, root) {

	var that = {}
		that.root = root || {};


	that.preRequest = function() {

	};

	that.postRequest = function(res, data, next) {

		if(res && res.headers && res.headers["content-type"].indexOf('json') >= 0) {
			console.log (util.inspect (JSON.parse (data) ) );
		} else {
			console.log (data);
		}
	
		if (spec && spec.callback) {
			spec.callback.call (that.root, arguments);
		} else {
			next (JSON.parse(data));
		}

	};

	that.executeCall = function (callback) {
		console.log(JSON.stringify(that.options, null, 2));
		

		var apiCall = https.request (that.options, function (response) {

			if (!that.encodingType) {
				response.setEncoding('utf-8');
			} else {
				response.setEncoding(that.encodingType);
			}

			var body = '';

			response
				.on('data', function(data) {
					body += data;
				}).on('end', function() {

					that.postRequest({ 
										headers: response.headers
										, statusCode : response.statusCode
									 }
									 , body
									 , callback);

				}).on('error', function(e) {

					console.log(util.inspect(e));
				});
		});

		var reqBodyStr = '';

		if (that.options.method === "POST"
			&& that.requestBody)
		{
			
			reqBodyStr = typeof that.requestBody === 'object' 
							? JSON.stringify(that.requestBody)
							: that.requestBody;

			//
			// check request content-type: options: multipart/form-data or json
			// if multipart/form-data -> create the multipart/form-data request
			// else simply send the request string				
			//
			
			var boundary = null;

			if (boundary = that.options.headers["Content-Type"].match(/boundary=(.*)/)) {

				//var buffer = fs.readFileSync('test1.pdf');
				
				var multiReqStream = "\r\n--" + boundary[1] 
									+ "\r\nContent-Type: application/json"
									+ "\r\nContent-Disposition: form-data"
									+ "\r\n\r\n"
									+ reqBodyStr
									+ "\r\n";

				// var multiPart = [];

				// for(that.requestBody)

				// 					+= '--myboundary';
				// 					+= '\r\nContent-Type: application/pdf';
				// 					+= '\r\nContent-Disposition: file; filename=”test1.pdf"; documentid=1';
				// 					+= '\r\n\r\n';
			

			} else {

				that.options.headers["Content-Length"] = Buffer.byteLength(reqBodyStr);
				apiCall.write(reqBodyStr);
			
			}
		}

		console.log(util.inspect(that.options.path));
		apiCall.end();
		// if(that.requestBody) { 

		// 		console.log(typeof self.requestBody);

		// 		requestBodyStr = typeof self.requestBody === 'Object' 
		// 						? JSON.stringify(self.requestBody)
		// 						: self.requestBody;

		// 		self.options["Content-Length"] = Buffer.byteLength(requestBodyStr) + buffer.length + Buffer.byteLength(end);

		// 		// if(typeof self.requestBody === 'Object') {

		// 		// 	requestBodyStr = JSON.stringify(self.requestBody);
		// 		// 	self.options["Content-Length"] = Buffer.byteLength(requestBodyStr);
		// 		// } else if(typeof self.requestBody === "String") {
		// 		// 	re
		// 		// 	self.options["Content-Length"] = Buffer.byteLength(requestBodyStr);
		// 		// }
		// }
		

		// if(requestBodyStr) {
		// 	apiCall.write(requestBodyStr);
		// 	apiCall.write(buffer);
		// 	apiCall.write(end);
		// }

		
	};

	return that;
};

exports.DocuSignObj = DocuSignObj;
