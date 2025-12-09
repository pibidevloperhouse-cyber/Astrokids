import clientPromise from "@/lib/mongo";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const client = await clientPromise;
    const database = client.db("AstroKids");
    const collection = database.collection("Products");
    const products = await collection
      .find({
        vendorId: vendorId,
      })
      .toArray();

    return NextResponse.json(products, { status: 200 });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { message: "Error fetching products" },
      { status: 500 }
    );
  }
}
