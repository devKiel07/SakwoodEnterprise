// api/send-order.js
import { Resend } from 'resend';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { customer, cart, total } = req.body;

    // Use Resend (Vercel-recommended, free 3k emails/month) [web:13][web:16]
    const resend = new Resend(process.env.RESEND_API_KEY);
    
    const cartHTML = cart.map(item => 
      `<li>${item.name} - $${item.price.toFixed(2)} x ${item.quantity}</li>`
    ).join('');
    
    await resend.emails.send({
      from: 'Orders <no-reply@sakwoodenterprise.com>',
      to: 'ezekieltagoe20@gmail.com',
      subject: `New Order from ${customer.name}`,
      html: `<p><strong>Name:</strong> ${customer.name}</p>
             <p><strong>Phone:</strong> ${customer.phone}</p>
             <h3>Order Items:</h3>
             <ul>${cartHTML}</ul>
             <p><strong>Total:</strong> $${total.toFixed(2)}</p>`
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Email send error:', error);
    res.status(500).json({ error: 'Failed to send order email' });
  }
}
