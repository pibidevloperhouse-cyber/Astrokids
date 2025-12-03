import { MongoClient } from "mongodb";
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import path from "path";
import fs from "fs";

const uri = process.env.MONGO_URL;
const client = new MongoClient(uri);

export async function POST(request) {
  try {
    await client.connect();
    const database = client.db("AstroKids");
    const collection = database.collection("childDetails");

    const {
      email,
      name,
      dob,
      time,
      place,
      gender,
      number,
      lat,
      lon,
      timezone,
      orderId,
      plan,
    } = await request.json();

    const result = await collection.updateOne(
      { "childDetails.orderId": orderId },
      {
        $set: {
          "childDetails.$.name": name,
          "childDetails.$.dob": dob,
          "childDetails.$.time": time,
          "childDetails.$.place": place,
          "childDetails.$.gender": gender,
          "childDetails.$.number": number,
          "childDetails.$.lat": lat,
          "childDetails.$.lon": lon,
          "childDetails.$.timezone": timezone,
          "childDetails.$.isChange": true,
        },
      }
    );

    const plans = [
      "Starter Parenting",
      "Pro Parenting",
      "Ultimate Parenting",
      "Master Parenting",
    ];

    const logo = fs.readFileSync(
      path.join("public", "images", "new", "logo1.png")
    );
    const signature = fs.readFileSync(
      path.join("public", "images", "new", "logo.png")
    );
    const planImage = fs.readFileSync(
      path.join("public", "images", `book-cover${plans.indexOf(plan)}.png`)
    );

    try {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
          user: process.env.USER,
          pass: process.env.PASS,
        },
      });

      const info = await transporter.sendMail({
        from: {
          name: "admin@AstroKids",
          address: process.env.USER,
        },
        to: email,
        subject: "Child Details Updated",
        text: `You will recieve the report of your child within 6 hours`,

        html: `<div style="max-width:600px;margin:0 auto;padding:0;font-family:Arial, sans-serif;background:#fff;">

  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td style="background-color:#210535;padding:20px;text-align:center;">
        <img 
          src="cid:logo" 
          style="width:160px;display:block;" 
          alt="AstroKids"
        />
      </td>
    </tr>
  </table>

  <table width="100%" cellpadding="0" cellspacing="0" style="padding:20px;">
    <tr>
      <td style="font-size:15px;color:#000;">

        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>

            <td width="60%" valign="top">
              <h2 style="margin:0 0 10px 0;">Dear User,</h2>
              <p style="margin:0;">Your changes are noted!</p>
              <p>
                ${name} details are updated, and we're thrilled to begin creating your Child Personalized Astrology Report.
              </p>
            </td>

            <td width="40%" align="right" valign="top">
              <img 
                src="cid:planImage"
                width="160"
                style="display:block;border-radius:6px;"
                alt="Astrology"
              />
            </td>

          </tr>
        </table>

        <h3 style="margin-top:25px;">
          Your Order ID : ${orderId}
        </h3>

        <p>
          Your report will be ready within 12 to 24 hours. Here's what you can look
          forward to:
        </p>

        <ul>
          <li>Personalized Astrology Insights & Parenting Tips</li>
          <li>Discover Your Child's Astrological Blueprint</li>
          <li>Supporting Strengths, Talents & Emotional Growth</li>
          <li>Empowering You to Raise a Happy, Successful Child!</li>
        </ul>

        <h3 style="margin-top:25px;">
          Your Updated Child Details
        </h3>

        <table width="100%" cellpadding="5" cellspacing="0" style="border-collapse:collapse;">
          <tr>
            <td width="35%"><strong>Name</strong></td>
            <td>${name}</td>
          </tr>
          <tr>
            <td><strong>DOB</strong></td>
            <td>${dob}</td>
          </tr>
          <tr>
            <td><strong>Birth Time</strong></td>
            <td>${time}</td>
          </tr>
          <tr>
            <td><strong>Place</strong></td>
            <td>${place}</td>
          </tr>
          <tr>
            <td><strong>Gender</strong></td>
            <td>${gender}</td>
          </tr>
        </table>

        <p style="margin-top:20px;">
          You'll receive your report in your inbox shortly. If you have any questions,
          feel free to contact us.
        </p>

        <div style="margin-top:50px;">
          <p>Warm regards,</p>

          <img 
            src="cid:signature" 
            width="110" 
            style="display:block;margin-bottom:5px;" 
            alt="Signature"
          />

          <p><strong>The AstroKids Team</strong></p>
          <p>support@astrokids.ai</p>

          <a 
            href="https://astrokids.ai/" 
            style="color:#000;text-decoration:none;"
          >
            astrokids.ai
          </a>
        </div>

      </td>
    </tr>
  </table>
</div>
`,
        attachments: [
          { filename: "logo.png", content: logo, cid: "logo" },
          { filename: "signature.png", content: signature, cid: "signature" },
          { filename: "planImage.png", content: planImage, cid: "planImage" },
        ],
      });
    } catch (err) {
      console.log(err);
    }

    return NextResponse.json(
      { message: "Document updated successfully" },
      {
        status: 200,
      }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
