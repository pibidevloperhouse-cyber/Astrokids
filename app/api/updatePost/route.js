import { MongoClient, ObjectId } from "mongodb";
import { NextResponse } from "next/server";

export async function PUT(request) {
  try {
    const {
      title,
      slug,
      type,
      content,
      createdAt,
      metaTitle,
      metaDescription,
      _id,
    } = await request.json();

    if (!title || !slug || !content) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const database = client.db("AstroKids");
    const collection = database.collection("blogs");

    const result = await collection.updateOne(
      { _id: new ObjectId(String(_id)) },
      {
        $set: {
          title,
          slug,
          type,
          content,
          createdAt,
          metaTitle,
          metaDescription,
        },
      }
    );

    if (result.matchedCount === 1) {
      return NextResponse.json(
        { message: "Blog updated successfully" },
        { status: 200 }
      );
    } else {
      return NextResponse.json({ message: "Blog not found" }, { status: 404 });
    }
  } catch (error) {
    console.error("Error updating blog:", error);
    return NextResponse.json(
      { message: "Error updating blog" },
      { status: 500 }
    );
  }
}
