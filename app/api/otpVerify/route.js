import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import crypto from "crypto";

export async function POST(request) {
  const { email } = await request.json();

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

    const OTP = Math.floor(1000 + Math.random() * 9000);

    const encryptionKey = process.env.ENCRYPTION_KEY;
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(
      "aes-256-cbc",
      Buffer.from(encryptionKey, "hex"),
      iv
    );
    let encryptedOTP = cipher.update(OTP.toString());
    encryptedOTP = Buffer.concat([encryptedOTP, cipher.final()]);

    const encryptedData = `${iv.toString("hex")}:${encryptedOTP.toString(
      "hex"
    )}`;

    const info = await transporter.sendMail({
      from: {
        name: "admin@AstroKids",
        address: process.env.USER,
      },
      to: email,
      subject: "Otp Email Verification",
      text: `Your Otp for the verification:${OTP}`,

      html: `<div style="
        margin: auto;
        width: 100vw;
        max-width: 600px;
        padding-top: 20px;
        position: relative;
      ">
        <div style="
          position: absolute;
          top: 0;
          left: 0;
          z-index: 0;
          width: 100vw;

          height: 100%;
          max-width: 600px;
          background: red;
          opacity: 0.18;
        "></div>
        <div style="z-index: 10; color: black; opacity: 1">
            <div style="
            width: 100%;
            margin-top: 40px;
            background-color: #210535;
          ">
                <img src="https://drive.usercontent.google.com/download?id=1MB_IKZo35iEaSzUCaZCqYT9XU39IKh8h" alt="logo"
                    style="width: 40%; aspect-ratio: 16 / 9; margin: 0 auto" />
            </div>
        </div>
        <div style="padding: 0 20px">
            <div style="width: 100%; ">
                <h1>Dear Parents,</h1>
                <h3>Here is your OTP. Astro Kids wants to ensure that your child's report is sent to the correct email ID without any hassles</h3>
            </div>
            <div style="color:#210535; font-size:larger;">
                <p>Your One Time Password <strong>(OTP)</strong> is</p>
            </div>
            <div
                style="width:150px; height: 30x; border: 2px solid blueviolet;padding: 10px; text-align: center; font-size: large; font-weight: bold ; ">
                ${OTP}</div>

            <div style="color:#210535; font-size:larger;">
                <p>The OTP will expire in ten minutes if not used. <br>
                    If you have not made this request.please contact our customer support immediately .<br><br>
                    Thank You,<br>
                    AstroKids Team
                </p>
            </div>
            <div style="margin-top: 70px">
                <p style="font-size: 20px">warm regards,</p>
                <img src="https://drive.usercontent.google.com/download?id=1MB_IKZo35iEaSzUCaZCqYT9XU39IKh8h"
                    alt="signature" width="100px" />
                <p>The Astrokids Team</p>
                <a>support@astrokids.ai</a>
                <a href="https://astrokids.ai/" style="
              display: block;
              color: black;
              text-decoration: none;
              margin: 10 0px;
            ">astrokids.ai</a>
            </div>
        </div>
    </div>`,
    });

    return NextResponse.json({ message: encryptedData }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: `Error ${err}` }, { status: 500 });
  }
}
