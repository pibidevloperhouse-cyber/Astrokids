import clientPromise from "@/lib/mongo";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const {
      title,
      slug,
      type,
      image,
      content,
      createdAt,
      metaTitle,
      metaDescription,
    } = await request.json();

    if (
      !title ||
      !slug ||
      !content ||
      !image ||
      !metaTitle ||
      !metaDescription
    ) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const database = client.db("AstroKids");
    const collection = database.collection("blogs");

    const existingBlog = await collection.findOne({ slug });
    if (existingBlog) {
      return NextResponse.json(
        { message: "Blog with this slug already exists" },
        { status: 409 }
      );
    }

    await collection.insertOne({
      title,
      metaTitle,
      metaDescription,
      image,
      slug,
      type: type || 1,
      content,
      createdAt: createdAt || new Date(),
    });

    return NextResponse.json(
      { message: "Blog post added successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error adding blog post:", error);
    return NextResponse.json(
      { message: "Error adding blog post" },
      { status: 500 }
    );
  }
}
