const express = require('express')
const cors = require('cors')
const jwt = require('jsonwebtoken')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()

const app = express()
const port = process.env.PORT || 5000

// middleware
app.use(cors())
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.ddhvpui.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

// function verifyJWT(req, res, next) {
//     const authHeader = req.headers.authorization
//     if (!authHeader) {
//         res.status(401).send({ message: 'unauthorized access' })
//     }
//     const token = authHeader.split(' ')[1]
//     jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
//         if (err) {
//             res.status(401).send({ message: 'unauthorized access' })
//         }
//         req.decoded = decoded
//         next()
//     })
// }

async function run() {
    try {
        const serviceCollection = client.db('dentalWhiz').collection('services')
        const reviewsCollection = client.db('dentalWhiz').collection('reviews')

        // jwt token
        // app.post('/jwt', (req, res) => {
        //     const user = req.body
        //     const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' })
        //     res.send({ token })
        // })



        // get Homeservices
        app.get('/services', async (req, res) => {
            const query = {};
            const cursor = serviceCollection.find(query)
            const services = await cursor.toArray()
            res.send(services)
        })
        // add new service
        app.post('/services', async (req, res) => {
            const newService = req.body
            const result = await serviceCollection.insertOne(newService)
            res.send(result)
        })
        // get service by id
        app.get('/services/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const service = await serviceCollection.findOne(query)
            res.send(service)
        })

        // get reviews
        app.get('/reviews', async (req, res) => {
            let query = {}
            const cursor = reviewsCollection.find(query).sort({ time: -1 })
            const reviews = await cursor.toArray()
            res.send(reviews)
        })

        app.get('/reviews/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const review = await reviewsCollection.findOne(query)
            res.send(review)
        })

        app.post('/reviews', async (req, res) => {
            const review = req.body
            const result = await reviewsCollection.insertOne(review)
            res.send(result)
        })

        app.put('/reviews/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const newReview = req.body
            const option = { upsert: true }
            const updatedReview = {
                $set: {
                    review: newReview.review,
                }
            }
            const result = await reviewsCollection.updateOne(query, updatedReview, option)
            res.send(result)
        }
        )


        app.delete('/reviews/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const result = await reviewsCollection.deleteOne(query)
            res.send(result)
        })


    }
    finally {

    }
}

run().catch(err => alert("There is an error:", err))

app.get('/', (req, res) => {
    res.send('dental whiz Running')
})

app.listen(port, () => {
    console.log(`server running ${port}`)
})