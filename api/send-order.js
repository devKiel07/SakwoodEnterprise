import sgMail from "@sendgrid/mail";

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { customer, cart, total } = req.body;

  const message = `
New Order – Payment on Delivery

Customer Details:
Name: ${customer.name}
Phone: ${customer.phone}
Email: ${customer.email || "Not provided"}
Address: ${customer.address}

Order Items:
${cart
  .map(
    (item) =>
      `- ${item.name} (x${item.qty}) = GHS ${item.price * item.qty}`
  )
  .join("\n")}

Total: GHS ${total}
`;

  try {
    await sgMail.send({
      to: process.env.TO_EMAIL,          // YOU receive the order
      from: process.env.FROM_EMAIL,      // VERIFIED SendGrid sender
      replyTo: customer.email || process.env.FROM_EMAIL,
      subject: "🪵 New WoodCraft Door Order",
      text: message,
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false });
  }
}
