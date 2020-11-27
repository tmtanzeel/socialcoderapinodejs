const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Article = require('../models/article');
const db = 'mongodb://tanzeel_123:mydbpass@cluster0-shard-00-00-znt38.mongodb.net:27017,cluster0-shard-00-01-znt38.mongodb.net:27017,cluster0-shard-00-02-znt38.mongodb.net:27017/test?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin&retryWrites=true&w=majority'
const jwt = require('jsonwebtoken');

mongoose.connect(db, { useNewUrlParser: true, useFindAndModify: false }, err => {
    if (err) {
        console.log('Error: ' + err);
    } else {
        console.log('Successfully connected to mongodb');
    }
})

router.get('/articles', function(req, res) {
    console.log('Get request for all articles');
    Article.find({})
        .exec(function(err, article) {
            if (err) {
                console.log("Error retrieving articles");
            } else {
                res.json(article);
            }
        });
});


router.get('/fetchback/:id', (req, res) => {
    let articleId = req.params.id;
    Article.findOne({ articleid: articleId }, (error, article) => {
        if (error) {
            console.log(error)
        } else {
            if (!article) {
                res.status(401).send('Something went wrong!')
            } else {
                res.json(article);
            }
        }
    })
})

module.exports = router;