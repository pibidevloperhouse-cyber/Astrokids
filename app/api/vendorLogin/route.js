import clientPromise from "@/lib/mongo";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    const client = await clientPromise;
    const db = client.db("AstroKids");
    const collection = db.collection("Vendors");

    const existingUser = await collection.findOne({ email });

    if (!existingUser) {
      return NextResponse.json(
        { message: "Vendor does not exist" },
        { status: 404 }
      );
    }

    const passwordMatch = await bcrypt.compare(password, existingUser.password);
    if (!passwordMatch) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      );
    }
    return NextResponse.json({ vendor: existingUser }, { status: 200 });
  } catch (error) {
    console.error("Error adding vendor:", error);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}
