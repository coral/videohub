module.exports = function (vh) {
	// ---
	// vh.route
	// ---
	// routes stuff
	
	vh.prototype.route = function (output, input) {
		var cmd = "VIDEO OUTPUT ROUTING: \n"
		var values = output + " " + input + " ";
		self.sendCommand(cmd + values, cb);
	};

	vh.prototype.batchRoute = function (batchArray) {
		var cmd = "VIDEO OUTPUT ROUTING: \n"
		var values = output + " " + input + " ";
		self.sendCommand(cmd + values, cb);
	};

}