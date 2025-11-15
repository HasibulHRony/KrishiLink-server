require('dotenv').config()
const express = require('express')
const app = express()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors')
const port = process.env.PORT || 3000;


const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@practicecluster1.opxblvd.mongodb.net/?appName=PracticeCluster1`;

//middleWar
app.use(cors())
app.use(express.json())


const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});


async function run() {
    try {
        await client.connect();
        const db = client.db("krishi-link-db")
        const allProductCollection = db.collection('all_products')
        const allUserCollection = db.collection('users')
        const allInterestCollection = db.collection('users_interests')

        app.get("/search", async (req, res) => {
            const search_input = req.query.search
            const result = await allProductCollection.find({ name: { $regex: search_input, $options: "i" } }).toArray()
            res.send(result)
        })


        app.patch("/all_products/:id", async (req, res) => {
            const id = req.params.id;
            const { pricePerUnit, quantity } = req.body;
            const result = await allProductCollection.updateOne(
                { _id: new ObjectId(id) },
                {
                    $set: {
                        pricePerUnit: pricePerUnit,
                        quantity: quantity
                    }
                }
            );
            res.send(result);
        });

        app.post("/users_interests", async (req, res) => {
            const newInterest = req.body;
            newInterest.createdAt = new Date();
            const result = await allInterestCollection.insertOne(newInterest)
            res.send(result)
        })

        app.get("/users_interests", async (req, res) => {
            const email = req.query.usersEmail;
            
            const query = {
                usersEmail: email
            };
            const result = await allInterestCollection.find(query).sort({createdAt: -1}).toArray();
            res.send(result)
        })


        app.delete('/all_products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await allProductCollection.deleteOne(query)
            res.send(result)
        })

        app.patch("/all_products/:id/interests", async (req, res) => {
            const id = req.params.id;
            const newInterest = req.body;
            const query = { _id: new ObjectId(id) }
            const update = {
                $push: {
                    interest: newInterest
                }
            }
            const result = await allProductCollection.updateOne(query, update)
            res.send(result)

        })

        app.post('/users', async (req, res) => {
            const newUser = req.body;
            const email = req.body.email;
            const query = { email: email };

            const existingUser = await allUserCollection.findOne(query);

            if (existingUser) {
                res.send({ message: 'user already exists.' })
            }
            else {
                const result = await allUserCollection.insertOne(newUser)
                res.send(result)
            }

        })


        app.get('/products-details/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await allProductCollection.findOne(query);
            res.send(result);
        })

        app.post('/added-crops', async (req, res) => {
            const newCrop = req.body;
            newCrop.pricePerUnit = Number(req.body.pricePerUnit)
            newCrop.quantity = Number(req.body.quantity)
            newCrop.createdAt = new Date();
            const result = await allProductCollection.insertOne(newCrop);
            res.send(result)
        })


        app.get("/added-crops", async (req, res) => {
            const result = await allProductCollection.find().toArray();
            res.send(result)
        })

        app.get("/my-posts", async (req, res) => {
            const email = req.query.email;
            const query = {
                "owner.ownerEmail": email
            };
            const result = await allProductCollection.find(query).toArray();
            res.send(result)
        })


        app.get("/latest-posts", async (req, res) => {
            const result = await allProductCollection.find().sort({ createdAt: -1 }).limit(6).toArray();

            res.send(result)

        })



        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('Hello World!')
})






app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
