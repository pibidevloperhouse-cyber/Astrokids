import clientPromise from "@/lib/mongo";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { email, name, dob, time, place, gender, number, plan } =
      await request.json();

    const client = await clientPromise;
    const database = client.db("AstroKids");
    const requestCollection = database.collection("requestDetails");

    const requestUser = await requestCollection.findOne({ email });

    if (requestUser) {
      await requestCollection.updateOne(
        { email },
        {
          $push: {
            childDetails: {
              name,
              dob,
              time,
              place,
              gender,
              number,
              plan,
              addedAt: new Date(),
            },
          },
        }
      );
    } else {
      await requestCollection.insertOne({
        email,
        childDetails: [
          {
            name,
            dob,
            time,
            place,
            gender,
            number,
            addedAt: new Date(),
          },
        ],
      });
    }

    return NextResponse.json(
      { message: "Child details added successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error checking child details:", error);
    return NextResponse.json(
      { message: "Error checking child details" },
      { status: 500 }
    );
  }
}
