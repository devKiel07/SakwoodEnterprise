// api/send-order.js

const sgMail = require('@sendgrid/mail');

// Set SendGrid API key from environment variable
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { customer, cart, total } = req.body;

    if (!customer || !cart || !total) {
      return res.status(400).json({ error: 'Missing order information' });
    }

    // Compose email message
    const message = `
New WoodCraft Door Order

Customer Name: ${customer.name}
Email: ${customer.email}
Phone: ${customer.phone}
Address: ${customer.address}

Order Items:
${cart.map(item => `- ${item.name} (x${item.qty}) = GHS ${item.price * item.qty}`).join('\n')}

Total: GHS ${total}
`;

    // Send email
    await sgMail.send({
      to: process.env.TO_EMAIL,          // Your receiving email
      from: process.env.FROM_EMAIL,      // Verified SendGrid sender
      replyTo: customer.email || process.env.FROM_EMAIL,
      subject: '🪵 New WoodCraft Door Order',
      text: message,
    });

    // Return success
    return res.status(200).json({ message: 'Order submitted successfully' });
  } catch (error) {
    console.error('Error sending order:', error);
    return res.status(500).json({ error: 'Failed to submit order' });
  }
};
