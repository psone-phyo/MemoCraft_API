const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userScheme = new Schema({
    username: String,
    email: String,
    password: String,
    created_at: { type: Date, default: new Date().getTime() }
})

module.exports = mongoose.model("User", userScheme);