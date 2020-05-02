const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/company_interface_csv_system');

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'Error connecting to MongoDB'));

db.once('open', function(){
    console.log('successfully connected to database :: MongoDB');
})

module.exports = db;