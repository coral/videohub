"use strict";

var events = require("events");
var util = require("util");
var _ = require("underscore");
var count = 0;

var vh = module.exports = function (host, port) {
	events.EventEmitter.call(this);

	this.options = _.extend({}, this.options);

	if (typeof(host) == "string") {
		this.options.host = host;
	} else if (typeof(host) == "object") {
		_.extend(this.options, host);
	}

	if (port) {
		this.options.port = port;
	}

	this.index = count++;
};

util.inherits(vh, events.EventEmitter);

vh.prototype.options = {
	reconnect: true,
	port: 9990,
	debug: false
};

vh.prototype.log = function () {
	if (!this.options.debug) return;

	var args = _.values(arguments);
	args.unshift("vh" + this.index + ":");

	console.log.apply(console, args);
};

// connection management and command queing
require("./lib/connection")(vh);

require("./lib/commands")(vh);