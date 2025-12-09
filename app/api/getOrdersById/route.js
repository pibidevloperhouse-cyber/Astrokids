import clientPromise from "@/lib/mongo";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const client = await clientPromise;
    const database = client.db("AstroKids");
    const collection = database.collection("Orders");
    const orders = await collection
      .find({
        vendorId: vendorId,
      })
      .toArray();

    return NextResponse.json(orders, { status: 200 });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { message: "Error fetching orders" },
      { status: 500 }
    );
  }
}
