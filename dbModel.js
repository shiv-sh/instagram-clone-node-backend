const mongoose  = require("mongoose");

const instance = mongoose.Schema({
    caption: String,
    username: String,
    image: String,
    comments:[]
});

module.exports = mongoose.model('posts', instance);
