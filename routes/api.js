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

mongoose.connect(db, { useNewUrlParser: true, useFindAndModify: false }, err => {
    if (err) {
        console.log('Error: ' + err);
    } else {
        console.log('Successfully connected to mongodb');
    }
})

// github end point to fetch information about github/tmtanzeel only
router.get('/github', async function (req, res) {
    const options = {
        hostname: 'api.github.com',
        path: '/users/tmtanzeel',
        headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_8_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/29.0.1521.3 Safari/537.36'
        },
        OAuth: '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'
    }

    https.get(options, function (apiRes) {
        apiRes.pipe(res);
    }).on('error', (e) => {
        console.error(e);
        res.status(500).send('Something went wrong');
    });
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

router.post('/contribute', verifyToken, (req, res) => {
    console.log('Pushing new article');
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