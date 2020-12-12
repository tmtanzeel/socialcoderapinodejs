const express = require('express');
const bodyParser = require('body-parser');

const app = express();

const api = require('./routes/api');
const cors = require('cors');

app.use(bodyParser.json());

app.use(function(req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', 'https://firefly-camp.azurewebsites.net/');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});

app.use('/api', api);
app.get('/', function(req, res) {
    res.send('Server is up and running!');
})

app.listen((process.env.PORT), function() {
    console.log('Server listening on heroku environment port');
});