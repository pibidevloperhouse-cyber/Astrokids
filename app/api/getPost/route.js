import clientPromise from "@/lib/mongo";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");

    if (!slug) {
      return NextResponse.json(
        { message: "Slug is required" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const database = client.db("AstroKids");
    const collection = database.collection("blogs");

    const blog = await collection.findOne({ slug });

    if (!blog) {
      return NextResponse.json({ message: "Blog not found" }, { status: 404 });
    }

    return NextResponse.json(blog, { status: 200 });
  } catch (error) {
    console.error("Error fetching blog post:", error);
    return NextResponse.json(
      { message: "Error fetching blog post" },
      { status: 500 }
    );
  }
}
