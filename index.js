import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { MongoClient, ObjectId } from 'mongodb';

const app = express();
const PORT = process.env.PORT || 8000;

// middleware
app.use(cors());
app.use(express.json());

const client = new MongoClient(`${process.env.MONGODB_URL}`);

export async function connectToMongoDB() {
    try {
        await client.connect();
        return client;
    } catch (err) {
        console.dir(err);
    }
}

const connectedClient = await connectToMongoDB();
const db = connectedClient.db('wanderlust');
const destinationCollection = db.collection('destination');

app.get('/', (req, res) => {
    res.send({ message: 'Server is running' });
});

app.post('/add-destination', async(req,res) => {
    const data = req.body;
    const result = await destinationCollection.insertOne(data);
    res.send(result);
});

app.get('/destinations', async(req,res) => {
    const result = await destinationCollection.find().toArray();
    res.send(result);
});

app.get('/destination/:id', async(req,res) => {
    const id = req.params.id;
    const query = {_id: new ObjectId(id)};
    const result = await destinationCollection.findOne(query);
    res.send(result);
});

app.patch('/destination/:id', async(req,res) => {
    const id = req.params.id;
    const query = { _id: new ObjectId(id) };
    const updatedData = req.body;

    const updateDoc = {
        $set: updatedData
    };

    const result = await destinationCollection.updateOne(query, updateDoc);
    res.send(result);
});

app.delete('/destination/:id', async (req, res) => {
    const id = req.params.id;
    const query = { _id: new ObjectId(id) };
    const result = await destinationCollection.deleteOne(query);
    res.send(result);
    
});
app.listen(PORT, () => {
    console.log(`Server running. Port:${PORT}`);
})
