import { MongoClient } from "mongodb";
import { NextResponse } from "next/server";

const uri = process.env.MONGO_URL;
const client = new MongoClient(uri);

export async function GET() {
  try {
    await client.connect();
    const database = client.db("AstroKids");
    const collection = database.collection("blogs");
    const blogs = await collection.find().sort({ createdAt: -1 }).toArray();

    return NextResponse.json(blogs, { status: 200 });
  } catch (error) {
    console.error("Error fetching blog posts:", error);
    return NextResponse.json(
      { message: "Error fetching blog posts" },
      { status: 500 }
    );
  } finally {
    await client.close();
  }
}
