var net = require('net');
var listen = false;
var client = net.connect({host: "10.76.255.137", port: 9990},
    function() { //'connect' listener
  console.log('client connected');
  setTimeout(function(){
  	listen = true;
  	for(var i = 0; i < 71; i++) {
  	 client.write("VIDEO OUTPUT ROUTING: \n " + i + " 2 \n\n");
  	 console.log("lol");
  	}
  },3000);
 
  
});

client.on('data', function(data) {
  	if(data.toString().substr(0, 3) == "ACK") {
  		//SUCCESS
  	}

  	if(data.toString().substr(0, 3) == "NAK") {
  		//FAIL
  	}

  	if(listen) {
	  	if(data.toString().substr(0, 21) == "VIDEO OUTPUT ROUTING:") {
			console.log("OUTPUT: " + data.toString().substr(22, 1));
			console.log("INPUT: " + data.toString().substr(24, 1));
	  	}
  	}
});
client.on('end', function() {
  console.log('client disconnected');
});