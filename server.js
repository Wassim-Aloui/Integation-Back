require("dotenv").config();
var express = require("express");
const cors = require('cors');
var app = express();
var db = require("./db");
const route = require("./routes/route");
const stdRoute = require("./routes/studentRoute");
const teamRoute = require('./routes/teamRoute');
const tuteurRoute = require('./routes/tuteurRoute');
const salleRoute =require('./routes/salleRoute');




// Enable CORS for all routes
app.use(cors());


app.use(express.json());
app.use(express.urlencoded({ extended: false }));


app.use("/user", route);
app.use("/student", stdRoute);
app.use("/team", teamRoute);
app.use("/tuteur", tuteurRoute);
app.use("/salle", salleRoute);




var server = require("http").createServer(app).listen(3000);