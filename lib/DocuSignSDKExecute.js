

var util = require("util")
	, fs = require('fs');

function noop() {
	return;
}

exports.docusign = function docusign(steps) {
	
	if(!(steps instanceof Array)) {
		steps = Array.prototype.slice.call(arguments);
	}

	
	return function(callback) {
		var index = 0, 
			length = steps.length;

		var chainComplete = typeof callback === 'function' ? callback : noop;
			
		function execLoop(runtimeData) {
			
			index++;

			if(index >= length) {
				chainComplete();
			} else {
				
				if (typeof steps[index].preRequest !== "undefined") {
					steps[index].preRequest(typeof runtimeData === "undefined" ? {} : runtimeData);
				}
				steps[index].executeCall(execLoop);
			}
		}

		if (typeof steps[index].preRequest !== "undefined") {
			steps[index].preRequest(typeof runtimeData == "undefined" ? {} : runtimeData);
		}

		
		steps[index].executeCall(execLoop)
	}
	
}

