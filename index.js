const express = require("express");
const exphbs = require("express-handlebars");
const path = require("path");
const methodOverride = require("method-override");
const redis = require("redis");
const log = require("./log");
const cors = require("cors");

const client = redis.createClient();
client.on("connect", () => {
	log("Connected to Redis...");
});
// log("hello world1");
const port = 3000;

const app = express();

app.use(cors());
app.use(express.json());

app.get("/:id", function (req, res, next) {
	log("#Get request...");
	// TEST: http://localhost:3000/add/user001
	const id = req.params.id;
	client.hgetall(id, (err, reply) => {
		// log("#Debugging", {err, reply});
		if (err) {
			const message = "No user found...";
			res.send(message);
			log(message, err, "\n");
		} else if (reply) {
			const message = "#Successfully fetched user...";
			res.send(reply);
			log(message, reply, "\n");
		}
		// next();//next call is NECESSARY if you don't send anything back and in that case earlier request reaming hanging in here.
	});
});

app.post("/add/:id", (req, res, next) => {
	// TEST: axios.post('http://localhost:3000/add/rehmankureshi889', {name: "Rehman Kureshi", email: "rehmankureshi889@gmail.com", phone: "8360267243"})
	const id = req.params.id;
	const {name, email, phone} = req.body;
	log("#Post request...");
	// log("#body", req.body);
	client.hmset(
		id,
		["name", name, "email", email, "phone", phone],
		(err, reply) => {
			// log("#Debugging delete route", {err, reply});
			if (err) {
				const message = "#Failed to create new user...";
				log(message, err, "\n");
				res.send("Can't create user.");
			} else if (reply) {
				let message = "#Successfully saved user to redis database...";
				log(message, err, "\n");
				res.send(message);
			} else {
				res.send("#Some error occured...");
			}
		}
	);
});

app.delete("/delete/:id", (req, res) => {
	// TEST: axios.delete('http://localhost:3000/delete/anujaggarwal')
	// log("got id as", req.params.id);
	client.del(req.params.id, (err, reply) => {
		if (err) {
			let message = "#Failed to delete user...";
			res.send(message);
			log(message, err);
		} else if (reply) {
			let message = "#Successfully deleted...";
			log(message, reply);
			res.send(message);
		} else {
			let message = "#Some error occured...";
			log(message, {err, reply});
			res.send(message);
		}
	});
});

app.listen(port, () => {
	console.log("Server started on port " + port);
});
