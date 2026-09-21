import nodemailer from 'nodemailer';

function formatDateTime(dateString) {
  if (!dateString) return 'Not provided';
  const date = new Date(dateString);
  if (isNaN(date)) return dateString;

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';

  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  const strHours = String(hours).padStart(2, '0');

  return `${day}-${month}-${year} ${strHours}:${minutes} ${ampm}`;
}

export async function POST(req) {
  try {
    const data = await req.json();
    const { name, email, phone, poojaTime, details, templeName, serviceType } = data;

    if (!name || !email || !poojaTime) {
      return new Response(JSON.stringify({ success: false, error: 'Missing required fields' }), { status: 400 });
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.USER,
        pass: process.env.PASS
      }
    });

    const mailOptions = {
      from: process.env.USER,
      to: 'pibi.devloperhouse@gmail.com', // Send to the admin
      subject: `New Temple Booking: ${serviceType} at ${templeName}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; border: 1px solid #eaeaea; border-radius: 10px;">
            <h2 style="color: #f97316;">New Temple Booking Request</h2>
            <p><strong>Service:</strong> ${serviceType}</p>
            <p><strong>Temple:</strong> ${templeName}</p>
            <hr style="border: 0; border-top: 1px solid #eaeaea; margin: 20px 0;" />
            <h3 style="color: #333;">Customer Details:</h3>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
            <p><strong>Preferred Time:</strong> ${formatDateTime(poojaTime)}</p>
            <p><strong>Additional Details:</strong></p>
            <p style="background-color: #f9f9f9; padding: 10px; border-radius: 5px;">${details || 'None provided'}</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);

    return new Response(JSON.stringify({ success: true, message: 'Email sent successfully!' }), { status: 200 });
  } catch (error) {
    console.error("Error sending email:", error);
    return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500 });
  }
}
