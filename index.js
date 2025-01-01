require("dotenv").config();
const config = require("./config.json")
const mongoose = require("mongoose");
mongoose.connect(config.connectionString);

const User= require('./models/User.model')

const express = require('express');
const cors = require('cors');   
const app = express();


const { authenticateToken} = require("./utils")

const {query,body, matchedData, validationResult} = require("express-validator");
const routes = require('./routes/Authentication');

app.use(express.json());

app.use(cors(
    { origin: "*" }
));

app.use('/api/', routes);

app.get('/users', async(req, res) => {
    const users = await User.find();
    res.json(users);
})

app.listen(8000);
module.exports = app;