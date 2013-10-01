var mongo = require("mongodb");
var host = "127.0.0.1";
var port = mongo.Connection.DEFAULT_PORT;


//function getUser(id, callback) {



var db = new mongo.Db("nodetest",new mongo.Server(host,port,{}));
db.open(function(error){
	console.log("Connected to mongodb on " + host + ":" + port);

	db.collection("users",function(error, collection){
		
		//returns all
		// collection.find(function(){
		// 	console.log("Found all records");
		// })

		collection.find({
			id:id
		},function(error,cursor){
			cursor.toArray(function(error,users){
				if (users.length == 0){
					console.log("found no users");
					//callback(false);
				} else {
					console.log("found ", users[0]);
					//callback(users[0]);
				}
			});
			
		});
	});
});

//}


// getUser(1,function(user) {
// 	if (!user){
// 		console.log("found no users");
// 	} else {
// 		console.log("found ", user);
// 	}
// })

// getUser(2,function(user) {
// 	if (!user){
// 		console.log("found no users");
// 	} else {
// 		console.log("found ", user);
// 	}
// })

// getUser(3,function(user) {
// 	if (!user){
// 		console.log("found no users");
// 	} else {
// 		console.log("found ", user);
// 	}
// })