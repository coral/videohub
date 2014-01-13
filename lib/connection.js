"use strict";
var net = require("net");
var _ = require("underscore");

module.exports = function (vh) {
	vh.prototype.connected = false;

	vh.prototype.client = false;
	vh.prototype.disconnecting = false;
	vh.prototype.responseCode = false;
	vh.prototype.responseMessage = "";
	vh.prototype.response = "";
	vh.prototype.readyForNextCommand = true;
	vh.prototype.commandOnNext = false;
	vh.prototype.initialStatus = false;
	vh.prototype.endOfLine = require('os').EOL;

	// vh.connect
	// -----------
	// Connect to Videohub
	//
	// `vh.connect(host, port[, cb]);`
	//
	// or use `vh.connect();` after setting `vh.options`
	vh.prototype.connect = function (host, port, cb) {
		var self = this;
		self.commandQueue = [];

		if (typeof(host) != "string") {
			cb = port;
			port = host;
			host = false;
		}

		if (typeof(port) != "number") {
			cb = port;
			port = false;
		}

		if (typeof(cb) != "function") cb = false;

		if (host) self.options.host = host;
		if (port) self.options.port = port;

		if(self.options.reconnect && typeof(self.options.reconnectInterval) != "number") {
			self.options.reconnectInterval = 15;
		}

		self.disconnecting = false;

		var client = self.client = net.connect({port: self.options.port, host: self.options.host});

		client.on("connect", function () {
			self.log("Connected to", self.options.host, self.options.port);
			self.initialStatus = false;
			self.connected = true;

			if (cb) {
				cb();
				cb = false;
			}

			self.emit("connected");
		});

		client.on("error", function (err) {
			if (cb) {
				cb(err);
			}

			self.emit("connectionError", err);
			self.connected = false;
			if (!self.disconnecting && self.options.reconnect) {
				setTimeout(function(){ self.connect(); self.emit("reconnecting"); }, (self.options.reconnectInterval * 1000));
			}
		});

		client.on("reconnecting", function() {
			self.log("Reconnecting");
		});

		client.on("end", function () {
			self.log("Disconnected");
			self.emit("disconnected");
			self.connected = false;
			client = false;

			if (!self.disconnecting && self.options.reconnect) {
				setTimeout(function(){ self.connect(); self.emit("reconnecting"); }, (self.options.reconnectInterval * 1000));
			}
		});
		var i = 1;
		client.on("data", function (data) {
			var commandQueue = self.commandQueue;
			var listen = true;

			var finishedCommand = function (data) {


				if (commandQueue.length > 0) {
					self.client.write(commandQueue[0].cmd);
				} else {
					// queue is empty we are ready for another command
					self.readyForNextCommand = true;
				}
			};

			if(self.commandOnNext) {
		  		self.commandOnNext = false;
		  		var item = commandQueue.shift();
		  		finishedCommand(data.toString());
		  		
		  	} else if(data.toString().substr(0, 3) == "ACK") {
		  		self.commandOnNext = true;
		  	}

		  	if(data.toString().substr(0, 3) == "NAK") {
				// callback with error
				if (cb) {
					cb(new Error(self.responseMessage));
				}

				var item = commandQueue.shift();
				finishedCommand("NAK");

				return;
			}

		});
	};

	// vh.disconnect
	// --------------
	// Empties command queue and closes connection to Videohub
	vh.prototype.disconnect = function () {
		this.disconnecting = true;
		this.commandQueue = [];

		if (this.client && this.connected) {
			this.client.end();
		}
	};


	// vh.sendCommand
	// ---------------
	// Sends raw command to Videohub
	vh.prototype.sendCommand = function (command, cb) {
		var self = this;
		var commandQueue = self.commandQueue;

		if (typeof(cb) != "function") cb = false;

		// check for connection first
		if (!self.connected) {
			if (cb) {
				cb(new Error("Not connected"));
			}

			return false;
		}

		if (command.substr(-2) == "\n\n") {
			if (cb) {
				cb(new Error("Invalid command"));
			}

			return false;
		}

		command += "\n\n";

		commandQueue.push({cmd: command, cb: cb});

		if (self.readyForNextCommand) {
			self.readyForNextCommand = false;
			self.log("Send:",commandQueue[0].cmd.substr(0, commandQueue[0].cmd.length - 2));
			self.client.write(commandQueue[0].cmd);
			if (cb) {
				cb();
			}
		}
	};

	// vh.sendBatch
	// ---------------
	// Sends a batch of commands
	vh.prototype.sendBatch = function (batch, cb) {
		var self = this;
		var commandQueue = self.commandQueue;

		if (typeof(cb) != "function") cb = false;

		// check for connection first
		if (!self.connected) {
			if (cb) {
				cb(new Error("Not connected"));
			}

			return false;
		}

		_.each(batch, function(batchCommand){
			batchCommand += "\n\n";
			commandQueue.push({cmd: batchCommand, cb: cb});
		});
		
		if (self.readyForNextCommand) {
			self.readyForNextCommand = false;
			self.log("Send BATCH");
			self.client.write(commandQueue[0].cmd);
			if (cb) {
				cb();
			}
		}

	};
};
