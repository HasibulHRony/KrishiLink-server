require('dotenv').config()
const express = require('express')
const app = express()
const { MongoClient, ServerApiVersion } = require('mongodb');
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

        app.post('/added-crops', async (req, res) => {
            const newCrop = req.body;
            const result = await allProductCollection.insertOne(newCrop);
            res.send(result)
        })


        app.get("/added-crops", async (req, res) => {
            const result = await allProductCollection.find().toArray();
            res.send(result)
        })

        app.get("/my-posts", async (req, res) => {
            const email = req.query.email;
            console.log(email)
            const query = {
                "owner.ownerEmail": email
            };
            const result = await allProductCollection.find(query).toArray();
            console.log(result)
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
