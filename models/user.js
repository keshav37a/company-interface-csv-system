const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email:{
        type: String,
        unique: true,
        required: true
    },
    password:{
        type: String,
        required: true
    },
    name:{
        type:String,
        required: true
    },
}, {
    timestamps : true
});

//creating and exporting our schema
const UserItem = mongoose.model('users', userSchema);
module.exports = UserItem;