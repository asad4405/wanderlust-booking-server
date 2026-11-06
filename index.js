import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { MongoClient, ObjectId } from 'mongodb';
import { createRemoteJWKSet, jwtVerify } from 'jose';

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());

const client = new MongoClient(process.env.MONGODB_URL);
let cachedDb = null;

async function connectToMongoDB() {
    if (cachedDb) return cachedDb;
    await client.connect();
    cachedDb = client.db('wanderlust');
    return cachedDb;
}

const verifyToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).send({ message: "Unauthorized" });
        }
        const token = authHeader.split(" ")[1];

        if (!token) {
            return res.status(401).send({ message: "Unauthorized" });
        }

        const JWKS = createRemoteJWKSet(new URL(`${process.env.CLIENT_URL}/api/auth/jwks`));
        await jwtVerify(token, JWKS);
        next(); 
    } catch (error) {
        console.error("Token Verification Error:", error.message);
        return res.status(401).send({ message: "Invalid token" });
    }
};

app.get('/', (req, res) => {
    res.send({ message: 'Server is running' });
});

app.post('/add-destination', async (req, res) => {
    const db = await connectToMongoDB();
    const destinationCollection = db.collection('destination');
    const data = req.body;
    const result = await destinationCollection.insertOne(data);
    res.send(result);
});

app.get('/destinations', async (req, res) => {
    const db = await connectToMongoDB();
    const destinationCollection = db.collection('destination');
    const result = await destinationCollection.find().toArray();
    res.send(result);
});

app.get('/destination/:id', verifyToken, async (req, res) => {
    const db = await connectToMongoDB();
    const destinationCollection = db.collection('destination');
    const id = req.params.id;
    const query = { _id: new ObjectId(id) };
    const result = await destinationCollection.findOne(query);
    res.send(result);
});

app.patch('/destination/:id', verifyToken, async (req, res) => {
    const db = await connectToMongoDB();
    const destinationCollection = db.collection('destination');
    const id = req.params.id;
    const query = { _id: new ObjectId(id) };
    const updatedData = req.body;
    delete updatedData._id;
    const updateDoc = {
        $set: updatedData
    };
    const result = await destinationCollection.updateOne(query, updateDoc);
    res.send(result);
});

app.delete('/destination/:id', verifyToken, async (req, res) => {
    const db = await connectToMongoDB();
    const destinationCollection = db.collection('destination');
    const id = req.params.id;
    const query = { _id: new ObjectId(id) };
    const result = await destinationCollection.deleteOne(query);
    res.send(result);
});

app.post('/booking', async (req, res) => {
    const db = await connectToMongoDB();
    const bookingCollection = db.collection('bookings');
    const data = req.body;
    const result = await bookingCollection.insertOne(data);
    res.send(result);
});

app.get('/my-bookings/:email', verifyToken, async (req, res) => {
    const db = await connectToMongoDB();
    const bookingCollection = db.collection('bookings');
    const { email } = req.params;
    const result = await bookingCollection.find({ email: email }).toArray();
    res.send(result);
});

app.delete('/my-bookings/:id', verifyToken, async (req, res) => {
    const db = await connectToMongoDB();
    const bookingCollection = db.collection('bookings');
    const { id } = req.params;
    const result = await bookingCollection.deleteOne({ _id: new ObjectId(id) });
    res.send(result);
});

if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Server running. Port:${PORT}`);
    });
}

export default app;