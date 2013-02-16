/*
	Author : Tom Townsend @tomtowny

*/
var express = require('express');
var http = require('http');
var creds = require('./config').Credentials;
var client = require('twilio')(creds.sid,creds.authToken);
var Twiml = require('twilio').Twiml;
var app = express();
var shoppingList = [];
var oldMessage = 'No current list available.';

// configure express
app.configure(function(){
	app.use(express.bodyParser());
	app.use(app.router);
});

function sendList(){
// serve the list to the client
	var message = '';
	// loop over the shopping list to push the items to the message
	if(shoppingList.length == 0){
		message = oldMessage;
	}else{
		while(shoppingList.length != 0){
			message = message.concat(shoppingList.pop()+'\n');
		}
	}
	client.sendSms({to:creds.incoming,from:creds.outgoing,body:message},function(err, responseData){
		if(err){
			console.log(err);
		}else{
			console.log("Shopping list sent.");
			oldMessage = message;
			message = '';
		}
	});
}

app.post('/list', function(req,res){
	// handle the incoming items to add to the list
	var list = req.body.Body.split(',');
	if(list[0].toLowerCase().trim() == 'list'|| list.length == 0 || list[0] == ' '){
		sendList();
	}else{
		for(var i=0;i<list.length;i++){
			shoppingList.push(list[i].toLowerCase().trim());
		}
		console.log('Items added to the list.');
	}
});
console.log('Shopping list server currently running on port 3000 or the one you defined in the environment.');
app.listen(process.env.PORT || 3000);

