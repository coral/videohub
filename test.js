var Videohub = require("./");
var async = require("async");
var _ = require("underscore");

videohub = new Videohub({
	host: "10.76.255.137",
	debug: true
});

videohub.connect(function () {
	console.log("lol");

});

videohub.on("connected", function() {
	console.log("con");
	//

	setTimeout(function(){

			var com = [];
	for(var i = 0; i < 72; i++) {
		com.push("VIDEO OUTPUT ROUTING: \n " + i + " 4")
	 //videohub.sendCommand("VIDEO OUTPUT ROUTING: \n " + i + " 2");
  	}
  	videohub.sendBatch(com);

	},3000);


});