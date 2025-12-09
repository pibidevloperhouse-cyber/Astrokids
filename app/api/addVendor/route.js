import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import clientPromise from "@/lib/mongo";

export async function POST(request) {
  try {
    const data = await request.json();

    const client = await clientPromise;
    const db = client.db("AstroKids");
    const collection = db.collection("Vendors");

    const existingUser = await collection.findOne({ email: data.email });
    if (existingUser) {
      return NextResponse.json(
        { message: "Vendor already exists" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    data.password = hashedPassword;
    delete data.confirmPassword;

    const result = await collection.insertOne(data);

    delete data.password;

    const vendor = {
      id: result.insertedId,
      ...data,
    };

    return NextResponse.json(vendor, { status: 201 });
  } catch (error) {
    console.error("Error adding vendor:", error);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}
