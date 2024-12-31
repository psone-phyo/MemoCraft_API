require("dotenv").config();
const config = require("./config.json")
const mongoose = require("mongoose");
mongoose.connect(config.connectionString);

const User= require('./models/User.model')

const express = require('express');
const cors = require('cors');   
const app = express();

const jwt = require("jsonwebtoken");
const { authenticateToken} = require("./utils")

const {query, matchedData, validationResult} = require("express-validator");
app.use(express.json());

app.use(cors(
    { origin: "*" }
));

app.get('/', (req, res) => {
    res.json({ message: 'Hello World' });   
});

app.post('/create-user', async (req, res)=>{
    const {username,email,password} = req.body;
    if (!username || !email || !password) return res.status(401).json({ error: 'Missing required fields1' });

    const isUser = await User.findOne({email: email});

    if(isUser) return res.status(401).json({ error: 'Missing required fields2' });

    const user = new User({
        username: username,
        email: email,
        password: password,
    });

    await user.save();

    const Token = jwt.sign({user}, process.env.ACCESS_KEY_SECRET, {expiresIn: "1h"});

    return res.status(201).json(
        {
            data: user,
            Token: Token
        }
    )
})

app.get('/users', async(req, res) => {
    const users = await User.find();
    res.json(users);
})

app.listen(8000);
module.exports = app;