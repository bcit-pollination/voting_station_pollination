// import mongoose
const mongoose = require('mongoose');
const express = require('express');
const app = express();
const port = 3000

const MongoClient = require('mongodb').MongoClient
const mongoHost = '127.0.0.1';
const userName = ''
const userPassword = ''
const mongoPort = 27017
const dbName = 'pollination'
const collectionName = 'questions'
const bodyParser = require('body-parser')

// define 'Schema' as the 'mongoose.Schema'
const Schema = mongoose.Schema;

let votable = false


app.use(bodyParser.urlencoded({ extended: true }))
// parse application/json
app.use(bodyParser.json())


// import schema
// const { Question } = require('./models/question_schema')

// default mongoose conn:
const mongoDB = 'mongodb://127.0.0.1/pollination';
mongoose.connect(mongoDB);


mongoose.Promise = global.Promise;

// default connection
const db = mongoose.connection;



// Vote Schema :
const VoteSchema = new Schema({
    voting_token: String,
    location: String,
    time_stamp: Date,
    voter_first_name: String,
    voter_last_name: String,
    question_num: Number,
    choices: [
        {
            question_id: Number,
            option_id: Number,
            order_position: Number,
        }
    ]
}, { collection: 'votes' })

// what is a vote? I think the variable name can be more intuitive.
const Vote = mongoose.model('Vote', VoteSchema);


// app.get('/getQuestion/:id', function (req, res) {
//     let question_id = req.params.id;
//     (Question).findOne({question_num: question_id},(err,oneQuestion)=>{
//         if (err) console.error(err);
//         res.send(oneQuestion);
//     }) 
// });

// app.get('/getQuestions2', function (req, res) {
//     console.log('getQuestions')
//     db.collection('questions',(err,collection)=>{
//         collection.find({}).toArray(a=>{
//             console.log(a)
//         })
//     })

//     Question.findOne({},(err,questions)=>{
//         if (err) console.error(err);
//         console.log(questions)
//         res.send(questions);
//     }) 
// });

async function addVote(voteVal){

    let vote_to_add = new Vote(voteVal)
    vote_to_add.save((err, doc) => {
        console.log('saving vote_to_add')
        err && console.log(err);
        console.log(doc)
        return;
    });

};

async function verifyVotingToken(query_target) {
    let collection_name = 'voting_users'

    return new Promise(async (resolve, reject) => {
        await MongoClient.connect(`mongodb://${mongoHost}:${mongoPort}/`
            , function (err, db) {
                if (err) throw err;
                var dbo = db.db(`${dbName}`);
                dbo.collection(collection_name).find({
                    voting_token: query_target
                }).toArray(function (err, result) {
                    if (err) throw err;

                    console.log('result=======')
                    console.log(result)
                    console.log('result=======')

                    //FIXME: if it is not a user, the vote must not proceed.
                    if (result.length != 0) {
                        console.log(result);
                        console.log('votable!!!')
                        votable = true
                    }
                    else {
                        console.log(result);
                        console.log('not votable!!!')
                        votable = false
                    }

                    db.close();
                    resolve(votable)
                });
            });
    })
}

app.get('/getQuestions', function (req, res) {
    console.log('getQuestions')

    // fetch questions from DB
    // MongoClient.connect(`mongodb://${userName}:${userPassword}@${mongoHost}:${mongoPort}/`
    MongoClient.connect(`mongodb://${mongoHost}:${mongoPort}/`
        , function (err, db) {
            if (err) throw err;
            var dbo = db.db(`${dbName}`);
            dbo.collection(collectionName).find({}).toArray(function (err, result) {
                if (err) throw err;
                console.log(result);
                db.close();
                res.send(result)
            });

        });

});

app.post('/postVotes', async function (req, res) {
    console.log('postVotes')

    console.log('votable??????')
    let p = verifyVotingToken()

    p.then(votable=>{
        console.log(votable)


        if (votable) {
            let vote = req.body.obj
            console.log(req.body.obj)
    
            //Placed vote adding in an async function at the top.
            addVote(vote);
        }
        else {
            res.send("You Are Not Allowed To Vote!")
        }
    })
 

});

app.post('/allowVote', function (req, res) {
    console.log('allow vote?')

    let query_target = req.body.voting_token
    votable = verifyVotingToken(query_target)
    // votable = true
    console.log(votable)
});

app.post('/disableVote', function (req, res) {
    console.log('allow vote?')

    votable = false
    console.log(votable)
    // votable = true
});



app.listen(port, () => console.log(`Example app listening on port ${port}!`))