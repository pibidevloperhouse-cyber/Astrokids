import clientPromise from "@/lib/mongo";

import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const client = await clientPromise;
    const database = client.db("AstroKids");
    const collection = database.collection("childDetails");

    const { orderId } = await request.json();

    const user = await collection
      .aggregate([
        { $unwind: "$childDetails" },
        { $match: { "childDetails.orderId": orderId } },
      ])
      .toArray();

    if (user.length > 0) {
      const date = new Date(user[0].childDetails.addedAt);
      const today = new Date();
      const diffTime = Math.abs(today - date);
      if (user[0].childDetails.isChange) {
        return NextResponse.json(
          { message: "Child details already changed" },
          { status: 400 }
        );
      } else if (diffTime > 10800000) {
        return NextResponse.json(
          { message: "Cannot change child details after 3 hours" },
          { status: 400 }
        );
      } else {
        return NextResponse.json(user[0], {
          status: 200,
        });
      }
    } else {
      return NextResponse.json({ message: "Order not found" }, { status: 400 });
    }
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
