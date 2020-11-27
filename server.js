const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const api = require('./routes/api');
const port = process.env.PORT || 8080;
const app = express();


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use('/api', api);
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist/application/index.html'));
});
app.listen(port, function() {
    console.log('server running on localhost:' + port);
});