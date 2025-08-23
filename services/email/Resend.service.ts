import PqrCreationEmail from "@/emails/templates/pqr-creation";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendPQRCreationEmail(
  email: string,
  name: string,
  subject: string,
  pqrNumber: string,
  creationDate: string,
  pqrLink: string
) {
  const { data, error } = await resend.emails.send({
    from: "noresponder@quejate.com.co",
    to: [email],
    subject: subject,
    react: PqrCreationEmail({
      userName: name,
      pqrNumber: pqrNumber,
      creationDate: creationDate,
      pqrLink: pqrLink,
    }),
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
