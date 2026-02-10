// api/send-order.js - COMPLETE REPLACEMENT
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { customer, cart, total } = req.body;

  // Install Resend: npm install resend (run locally)
  const { Resend } = await import('resend');
  const resend = new Resend(process.env.RESEND_API_KEY);

  const cartItems = cart.map(item => 
    `<li>${item.name} x ${item.qty} - ₵${item.price * item.qty}</li>`
  ).join('');

  try {
    await resend.emails.send({
      from: 'Sakwood Enterprise <no-reply@sakwoodenterprise.com>',
      to: 'sakwoodenterprise@gmail.com',
      subject: `🛒 New Order from ${customer.name}`,
      html: `
        <h2>New Order Received!</h2>
        <p><strong>Name:</strong> ${customer.name}</p>
        <p><strong>Phone:</strong> ${customer.phone}</p>
        <p><strong>Email:</strong> ${customer.email || 'Not provided'}</p>
        <p><strong>Address:</strong> ${customer.address}</p>
        <hr>
        <h3>Order Items:</h3>
        <ul>${cartItems}</ul>
        <h3>Total: <strong>₵${total}</strong></h3>
        <hr>
        <p>Payment: Cash on Delivery</p>
      `
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Resend error:', error);
    res.status(500).json({ error: 'Failed to send email' });
  }
}
