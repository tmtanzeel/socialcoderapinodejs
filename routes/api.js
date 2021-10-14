const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Article = require('../models/article');
const User = require('../models/user');
const Post = require('../models/article');
const db = 'mongodb://tanzeel_123:mydbpass@cluster0-shard-00-00-znt38.mongodb.net:27017,cluster0-shard-00-01-znt38.mongodb.net:27017,cluster0-shard-00-02-znt38.mongodb.net:27017/test?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin&retryWrites=true&w=majority'
const jwt = require('jsonwebtoken');
const { MongoClient } = require("mongodb");
const client = new MongoClient(db);
const https = require("https");

mongoose.connect(db, { useNewUrlParser: true, useFindAndModify: false }, err => {
    if (err) {
        console.log('Error: ' + err);
    } else {
        console.log('Successfully connected to mongodb');
    }
})

router.get('/', function (req, res) {
    res.status(200).send("Server is up and running! Everything is working as expected!")
});


router.get('/articles', function (req, res) {
    console.log('Get request for all articles');
    Article.find({})
        .exec(function (err, article) {
            if (err) {
                console.log("Error retrieving articles");
            } else {
                res.json(article);
            }
        });
});

router.get('/articles/count', async function (req, res) {
    const result = await run();
    if (result > 0) {
        res.status(200).send("" + result);
    } else {
        res.status(500).send({ error: 'Error while fetching data' });
    }
});

async function run() {
    let estimate;
    try {
        await client.connect();

        const database = client.db("test");
        const movies = database.collection("articles");

        estimate = await movies.estimatedDocumentCount();
    } finally {
        await client.close();
    }
    return estimate;
}

router.get('/articles/:contributor', function (req, res) {
    console.log('Get request for all articles from a certain contributor');
    let Contributor = req.params.contributor;
    Article.find({ contributor: Contributor })
        .exec(function (err, article) {
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

router.post('/login', (req, res) => {
    let userData = req.body
    User.findOne({ email: userData.email }, (error, user) => {
        if (error) {
            console.log(error)
        } else {
            if (!user) {
                res.status(401).send('Invalid email')
            } else if (user.password !== userData.password) {
                res.status(401).send('Invalid password')
            } else {
                let payLoad = { subject: user._id };
                let token = jwt.sign(payLoad, 'secretKey');
                res.status(200).send({ token, userData, user });
            }
        }
    })
})

//For testing use on mongodb filter: {articleid: "3i9q6aw1v"}, userid: z0whc9r3o

router.post('/add-to-upvoters-list/:articleid/:userid', (req, res) => {
    Article.findOneAndUpdate({ articleid: req.params.articleid }, { $inc: { upvotes: 1 } }).then(opResult => console.log(opResult));
    Article.findOneAndUpdate({ articleid: req.params.articleid }, { $push: { upvoters: req.params.userid } }, (failure, success) => {
        if (success) {
            res.status(200).send("added as upvoter")
        }
        else {
            res.status(200).send("failed to add user as upvoter")
        }
    })
})

router.post('/contribute', verifyToken, (req, res) => {
    let userPost = req.body;
    let post = new Post(userPost);
    post.save((error, registeredPost) => {
        if (error) {
            console.log(error);
        } else {
            res.status(200).send(registeredPost);
        }
    })
})




router.delete('/delete/:id', verifyToken, (req, res) => {
    let articleId = req.params.id;
    console.log("to be deleted " + articleId);
    Article.deleteOne({ articleid: articleId }, (error, article) => {
        if (error) {
            console.log(error)
        } else {
            if (!article) {
                res.status(401).send('something went wrong')
            } else {
                console.log('successfully deleted');
                res.status(200).send('Deleted successfully!');
            }
        }
    })
})

function verifyToken(req, res, next) {
    if (!req.headers.authorization) {
        return res.status(401).send('Unauthorized request')
    }
    let token = req.headers.authorization.split(' ')[1]
    if (token === 'null') {
        return res.status(401).send('Unauthorized request')
    }
    let payload = jwt.verify(token, 'secretKey')
    if (!payload) {
        return res.status(401).send('Unauthorized request')
    }
    req.userId = payload.subject
    next()
}

module.exports = router;