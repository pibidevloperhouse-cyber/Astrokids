import { NextResponse } from "next/server";
import Razorpay from "razorpay";

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export async function POST(req) {
  const { amount, currency } = await req.json();

  try {
    const order = await razorpay.orders.create({
      amount: amount,
      currency: currency,
    });

    return NextResponse.json(order);
  } catch (e) {
    console.log(e);
    return NextResponse.json(
      { error: "Failed to create order", details: e.message || e },
      { status: 500 }
    );
  }
}
