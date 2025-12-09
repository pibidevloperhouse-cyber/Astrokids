import clientPromise from "@/lib/mongo";
import { NextResponse } from "next/server";

export async function DELETE(request) {
  try {
    const { slug } = await request.json();

    if (!slug) {
      return NextResponse.json(
        { message: "Slug is required" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const database = client.db("AstroKids");
    const collection = database.collection("blogs");

    const result = await collection.deleteOne({ slug });

    if (result.deletedCount === 1) {
      return NextResponse.json(
        { message: "Blog deleted successfully" },
        { status: 200 }
      );
    } else {
      return NextResponse.json({ message: "Blog not found" }, { status: 404 });
    }
  } catch (error) {
    console.error("Error deleting blog:", error);
    return NextResponse.json(
      { message: "Error deleting blog" },
      { status: 500 }
    );
  }
}
