import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";
import clientPromise from "@/lib/mongo";

export async function POST(request) {
  try {
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

    if (!email || !name || !dob || !time || !place || !gender) {
      return new Response("Missing fields", { status: 400 });
    }

    const client = await clientPromise;
    const database = client.db("AstroKids");
    const collection = database.collection("childDetails");

    const user = await collection.findOne({ email });

    if (user) {
      user.childDetails.map(async (child) => {
        if (child.name == name) {
          return new Response("Child already exist", { status: 400 });
        } else {
          await collection.updateOne(
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
                  lat,
                  lon,
                  timezone,
                  plan,
                  addedAt: new Date(),
                  isChecked: false,
                  orderId: orderId,
                  isChange: false,
                },
              },
            }
          );
        }
      });
    } else {
      await collection.insertOne({
        email,
        childDetails: [
          {
            name,
            dob,
            time,
            place,
            gender,
            number,
            lat,
            lon,
            timezone,
            plan,
            addedAt: new Date(),
            isChecked: false,
            orderId: orderId,
            isChange: false,
          },
        ],
      });
    }
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
        subject: "Payment Successful",
        text: `You will recieve the report of your child within 6 hours`,

        html: `<div style="max-width:600px;margin:0 auto;padding:0;font-family:Arial, sans-serif;background:#fff;">

  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td style="background-color:#210535;padding:20px;text-align:center;">
        <img src="cid:logo" style="width:140px;display:block;" />
      </td>
    </tr>
  </table>

  <table width="100%" cellpadding="0" cellspacing="0" style="padding:20px;">
    <tr>
      <td style="font-size:16px;color:#000;">

        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td width="65%" valign="top">
              <h2 style="margin:0 0 10px 0;">Dear User,</h2>
              <p style="margin:0;">
                Thank you for your purchase!
              </p>
              <p>
                Your payment has been successfully received and we're thrilled to begin creating your Personalized Child Astrology Report.
              </p>
            </td>

            <td width="35%" align="right">
              <img src="cid:planImage" width="150" style="display:block;border-radius:6px;" />
            </td>
          </tr>
        </table>

        <h3 style="margin-top:25px;">Your Order ID : ${orderId}</h3>

        <p>
          Your report will be ready within 12 to 24 hours. Here's what you can
          look forward to:
        </p>

        <ul>
          <li>Personalized Astrology Insights & Parenting Tips</li>
          <li>Discover Your Child's Astrological Blueprint</li>
          <li>Supporting Strengths, Talents & Emotional Growth</li>
          <li>Empowering You to Raise a Happy, Successful Child!</li>
        </ul>

        <h3 style="margin-top:25px;">Important Note: You can edit your details</h3>

        <table width="100%" cellpadding="4">
          <tr><td><strong>Name:</strong></td><td>${name}</td></tr>
          <tr><td><strong>DOB:</strong></td><td>${dob}</td></tr>
          <tr><td><strong>Birth Time:</strong></td><td>${time}</td></tr>
          <tr><td><strong>Place:</strong></td><td>${place}</td></tr>
          <tr><td><strong>Gender:</strong></td><td>${gender}</td></tr>
        </table>

        <div style="text-align:center;margin-top:20px;">
          <a href="https://www.astrokids.ai/child-details?paymentEdit=true&orderId=${orderId}"
             style="background:#210535;color:white;padding:12px 24px;
             text-decoration:none;border-radius:6px;display:inline-block;">
            Edit Details
          </a>
        </div>

        <div style="margin-top:50px;">
          <p style="margin-bottom:8px;">Warm regards,</p>
          <img src="cid:signature" width="110" style="display:block;margin-bottom:5px;" />
          <p><strong>The AstroKids Team</strong></p>
          <p>support@astrokids.ai</p>
          <a href="https://astrokids.ai" style="color:#000;text-decoration:none;">
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
    return new Response("Child details added successfully", { status: 200 });
  } catch (error) {
    console.error("Error adding child details:", error);
    return new Response("Internal server error", { status: 500 });
  }
}
