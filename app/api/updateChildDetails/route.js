import clientPromise from "@/lib/mongo";

export async function PUT(request) {
  const { email, isChecked, orderId } = await request.json();

  try {
    const client = await clientPromise;
    const database = client.db("AstroKids");
    const collection = database.collection("childDetails");

    const updateResult = await collection.updateOne(
      { email: email, "childDetails.orderId": orderId },
      {
        $set: {
          "childDetails.$.isChecked": isChecked,
        },
      }
    );

    if (updateResult.matchedCount === 0) {
      return new Response("Child not found", { status: 404 });
    }

    return new Response("Child status updated successfully", { status: 200 });
  } catch (error) {
    console.error("Error updating child status:", error);
    return new Response("Error updating child status", { status: 500 });
  }
}
