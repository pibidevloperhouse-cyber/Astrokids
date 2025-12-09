import clientPromise from "@/lib/mongo";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const client = await clientPromise;
    const database = client.db("AstroKids");
    const collection = database.collection("childDetails");

    const data = await collection.find().toArray();

    return NextResponse.json(data, {
      status: 200,
    });
  } catch (error) {
    console.error("Error handling GET request:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
