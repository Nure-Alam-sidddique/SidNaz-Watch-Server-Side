const express = require('express');
const app = express();
const cors = require('cors');
const port = process.env.PORT || 5000;
require("dotenv").config();
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
        const database = client.db("sidnazWatch");
        const watchCollection = database.collection('product');
        console.log("connection database Successfully");
        
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