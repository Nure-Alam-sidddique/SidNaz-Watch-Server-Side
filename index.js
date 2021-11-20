const express = require('express');
const app = express();
const cors = require('cors');
const port = process.env.PORT || 5000;
require("dotenv").config();
const ObjectId = require('mongodb').ObjectId;
const { MongoClient } = require("mongodb");  // monogodb Connection require
const admin = require("firebase-admin");

// middleWare
app.use(express.json());
app.use(cors());

// JWT Token
const serviceAccount = require('./sidnaz-watch-house-60806-firebase-adminsdk.json');
  admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
async function verifyToken(req, res, next) {
  if (req.headers?.authorization?.startsWith('Bearer  ')) {
    const token = req.headers.authorization.split('  ')[1];
    try {
      const decodedUser = await admin.auth().verifyIdToken(token);
      req.decodedEmail = decodedUser.email;
      
    }
    catch {
      
    }
  }
  next();
}
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

      //  Product Add to DataBase by Post Method
      app.post('/products', async (req, res) => {
        const product = req.body;
        console.log(product);
        const addProduct = await watchCollection.insertOne(product);
        res.json(addProduct);
        
    })
    //  Delete Single Product form database
      app.delete("/products/:id", async (req, res) => {
        const productId = req.params.id;
        const query = { _id: ObjectId(productId) };
        const productDelete = await watchCollection.deleteOne(query);
        res.json(productDelete);
      })
      // Single Prduct Update
      app.put('/products/:id', async (req, res) => {
        const productId = req.params.id;
        const product = req.body;
        console.log(productId);
        console.log(product);
        const filter = { _id: ObjectId(productId) };
        const options = { upsert: true };
        const updateDocs = { $set: product}
        const updateDate = await watchCollection.updateOne(filter, updateDocs, options);
        console.log(updateDate);
        res.json(updateDate);
  
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
        app.get('/orders', async(req,res)=>{
          const cursor = orderCollection.find({});
          const customerOrders = await cursor.toArray();
          res.json(customerOrders);
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

      //  Single User Get Method for checking  Admin Role or Not ! 
      app.get('/users/:email', async (req, res) => {
        const email = req.params.email;
        const query = { email: email };
        const singleUser = await userCollection.findOne(query);
        let isAdmin = false;
        if (singleUser?.role ==="admin") {
          isAdmin = true;
        }
        res.json({admin: isAdmin})
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
        // console.log(updatedUser)
      })

      // Admin Post Method create Admin
      app.put('/users/admin', verifyToken, async (req, res) => {
        const user = req.body;
        // console.log('put', req.headers);
        // console.log('put', req.decodedEmail);
        const requester = req.decodedEmail;
        if (requester) {
          const requesterAccount = await userCollection.findOne({ email: requester });
          if (requesterAccount.role === 'admin') {
             const filter = { email: user.email };
             const updateDoc = { $set: { role: "admin" } };
             const sendData = await userCollection.updateOne(filter, updateDoc);
             res.json(sendData);
             console.log(sendData);
          }
        }
        else {
          res.status(403).json({ message: 'You do not have access to make Admin' });
        }
       
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

// https://quiet-springs-91793.herokuapp.com/



