import { MongoClient } from "mongodb";

const uri = process.env.MONGO_URL;
const options = {};

let clientPromise;

if (!uri) {
  // Guard against missing MONGO_URL during build or static analysis
  clientPromise = Promise.reject(new Error("Please define the MONGO_URL environment variable inside .env or .env.local"));
  clientPromise.catch(() => {});
} else {
  if (process.env.NODE_ENV === "development") {
    if (!global._mongoClientPromise) {
      const client = new MongoClient(uri, options);
      global._mongoClientPromise = client.connect();
    }
    clientPromise = global._mongoClientPromise;
  } else {
    const client = new MongoClient(uri, options);
    clientPromise = client.connect();
  }
}

export default clientPromise;

