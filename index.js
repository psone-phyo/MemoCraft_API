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
const auth = require('./routes/Authentication');

app.use(express.json());

app.use(cors({
    origin: "https://memo-craft-ten.vercel.app", // Explicitly allow your frontend origin
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }));
  
app.get('/', (req,res)=>{
    res.send("This is MemoCraft Note app API")
})

app.use('/api/auth', auth);
app.use('/api/notes/', authenticateToken, require('./routes/Note'));



app.listen(8000);
module.exports = app;