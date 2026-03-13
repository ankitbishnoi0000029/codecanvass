import nodemailer from "nodemailer";
import EmailTemplate from "../../../components/sections/email";
export async function POST(req) {
  try {
    const email = await req.json();
  //  await console.log(email);

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: '🎉 Successfully Subscribed!',
      html: EmailTemplate(email),
    };

    await transporter.sendMail(mailOptions);

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ success: false, error });
  }
}