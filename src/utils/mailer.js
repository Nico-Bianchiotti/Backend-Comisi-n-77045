import nodemailer from "nodemailer";

let transporter;

/**
 * Crea el transporter de Nodemailer una sola vez (patrón singleton simple)
 * y lo reutiliza en los envíos siguientes. Las credenciales SIEMPRE salen
 * de variables de entorno, nunca hardcodeadas.
 */
const getTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: Number(process.env.MAIL_PORT),
      secure: Number(process.env.MAIL_PORT) === 465,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });
  }
  return transporter;
};

/**
 * Envía un email. Se usa principalmente para confirmar inscripciones.
 * @param {{ to: string, subject: string, html: string }} options
 */
export const sendMail = async ({ to, subject, html }) => {
  const transport = getTransporter();

  return transport.sendMail({
    from: process.env.MAIL_FROM,
    to,
    subject,
    html,
  });
};
