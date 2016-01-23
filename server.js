var express = require("express");

var app = express();

app.use(express.static(__dirname + "/static"));

// app.set("views", __dirname + "/views");
// app.set("view engine", "ejs");

app.get("/", function(req, res) {
	console.log(req.url);
	res.redirect("/index.html");
})

var port = process.env.PORT || 1234;

var server = app.listen(port, function() {
	console.log("-------------------------------");
	console.log("-------------"+port+"--------------");	
	console.log("-------------------------------");
});

var io = require("socket.io").listen(server);
var users = {};

io.sockets.on('connection', function (socket) {
	console.log("New connection detected:", socket.id);

	//when a new user logs on, this event is triggered, the user's info is stored and then sent to all others
	socket.on("new_user", function (user_info) {
		console.log("newUser is:", user_info);
		var idString = socket.id.toString();
		users[idString] = {name: user_info.name, location: user_info.location};		
		socket.emit("sync_users", users);
		console.log("All users:", users);		
		socket.broadcast.emit("new_user_info", {id: idString, user_info: user_info});
	});

	//when a user moves, their location is updated and sent to all others
	socket.on("updated_location", function (data) {
		var id = socket.id.toString();
		console.log("Received location update for:", users[id]);
		users[id].location = data.newLocation;
		console.log("Updated location:", users[id].location);
		socket.broadcast.emit("user_moved", users[id]);
	})

	setInterval(function() {
		console.log("Syncing users");
		io.emit("sync_users", users);
	}, 15000);

})
