const express = require('express');
const bodyParser = require('body-parser');

const port = (process.env.PORT);
const app = express();

const api = require('./routes/api');
const cors = require('cors');

app.use(bodyParser.json());
app.use(cors());

app.use('/api', api);
app.get('/', function(req, res) {
    res.send('Server is up and running!');
})

app.listen((process.env.PORT), function() {
    console.log('Server listening on PORT ' + port)
});