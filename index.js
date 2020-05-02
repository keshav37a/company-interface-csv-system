const express = require('express');
const path = require('path');
const expressLayouts = require('express-ejs-layouts');
const sassMiddleware = require('node-sass-middleware');
const db = require('./config/mongoose');

const port = 8000;
const app = new express();


app.use(expressLayouts);
app.set('layout extractStyles', true);
app.set('layout extractScripts', true);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded());
app.use('/', require('./routes/index'));

app.use(express.static('./assets'));

app.use(sassMiddleware({
    src: 'assets/scss',
    dest: 'assets/css',
    debug: true,
    outputStyle: 'extended',
    prefix: '/css'
}));

app.listen(port, function(err){
    if(err) { console.log(`${err}`); }

    console.log(`app up and running on port ${port}`);
})


