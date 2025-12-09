import clientPromise from "@/lib/mongo";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const client = await clientPromise;
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
  }
}
