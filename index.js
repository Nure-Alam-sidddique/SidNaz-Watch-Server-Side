const express = require('express');
const app = express();
const cors = require('cors');
const port = process.env.PORT || 5000;
require("dotenv").config();
const ObjectId = require('mongodb').ObjectId;
const { MongoClient } = require("mongodb");  // monogodb Connection require

// middleWare
app.use(express.json());
app.use(cors());

//  Database Connection uri
const uri =
  `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.zrqkd.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
    try {
        await client.connect();
        const database = client.db("SidnazWatch");
      const watchCollection = database.collection('products');
      const userCollection = database.collection('users');
      const orderCollection = database.collection('orders');
      const reviewCollection = database.collection('reviews');
        // console.log("connection database Successfully");
        //  Request GET API METHOD
      app.get('/products', async (req, res) => {
        const cusrsor = watchCollection.find({});
        const products = await cusrsor.toArray();
        res.json(products);
      })
      //  single Product Search 
      app.get('/products/:id', async (req,res) => {
        const id = req.params.id;
        const query = { _id:ObjectId(id) };
        const singleProudct = await watchCollection.findOne(query);
        res.json(singleProudct);
      })

      //  Post Order
      app.post('/placeOrders', async (req, res) => {
        const order = req.body;
        const placeOrder = await orderCollection.insertOne(order);
        res.json(placeOrder);
      })
      app.get('/placeOrders', async (req, res) => {
        const email = req.query.email;
        const query = { email: email };
        const cursor = orderCollection.find(query);
        const myorders = await cursor.toArray();
        res.json(myorders);
      })

       // Review Get Method
      app.get('/review', async (req, res) => {
        const cursor = reviewCollection.find({});
        const getReview = await cursor.toArray();
        res.json(getReview);
      })

      //  REview Post 
      app.post('/review', async (req, res) => {
        const review = req.body;
        const userReview = await reviewCollection.insertOne(review);
        res.json(userReview);
      })

      // Delete Orders
      app.delete('/placeOrders/:id', async (req, res) => {
        const orderId = req.params.id;
        const query = { _id: ObjectId(orderId) };
        const orderDelete = await orderCollection.deleteOne(query);
        res.json(orderDelete);
      })

      // User Post Method
      app.post('/users', async (req, res) => {
        const user = req.body;
        console.log(user);
        const sendToDatabase = await userCollection.insertOne(user);
        // console.log(sendToDatabase);
        res.json(sendToDatabase);
      })

      //  User get Method
      app.get('/users', async (req, res) => {
        const cursor = userCollection.find({});
        const FindUser = await cursor.toArray();
        res.json(FindUser);
      })

      // Update method user 
      app.put('/users', async(req,res)=>{
        const user = req.body;
        // console.log(user);
        const filter = { email: user.email };
        const options = { upsert: true };
        const updateDoc = {
          $set:{ 
            email: user.email,
            displayName: user.displayName
           }
        };
        const updatedUser = await userCollection.updateOne(filter, updateDoc, options);
        res.json(updatedUser);
        // console.log(updatedUser);

      })

    }
    finally {
        // await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Hello , Welcome to sidnaz watch house');
})

app.listen(port, () => {
  console.log(`Sidnaz Dimond House Server Running ${port}`)
})