// api/send-order.js - NO DEPENDENCIES REQUIRED
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { customer, cart, total } = req.body;

  // Validate required fields
  if (!customer || !cart || !total) {
    return res.status(400).json({ error: 'Missing required fields: customer, cart, total' });
  }

  if (!process.env.RESEND_API_KEY) {
    console.error('❌ RESEND_API_KEY not configured');
    return res.status(500).json({ error: 'Email service configuration error' });
  }

  // Debug log
  console.log('Order data:', JSON.stringify({ customer, total }));

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Sakwood Enterprise <no-reply@sakwoodenterprise.com>',
        to: 'ezekieltagoe20@gmail.com',
        subject: `🛒 New Order #${Date.now()} from ${customer.name}`,
        html: `
          <h2>🛒 New Order Received!</h2>
          <h3>Customer Details:</h3>
          <p><strong>Name:</strong> ${customer.name}</p>
          <p><strong>Phone:</strong> ${customer.phone}</p>
          <p><strong>Email:</strong> ${customer.email || 'Not provided'}</p>
          <p><strong>Address:</strong> ${customer.address}</p>
          
          <hr>
          <h3>Order Items:</h3>
          <ul>
            ${cart.map(item => `<li>${item.name} x ${item.qty} = ₵${(item.price * item.qty).toLocaleString()}</li>`).join('')}
          </ul>
          <h2>Total: <strong>₵${total.toLocaleString()}</strong></h2>
          <p><em>Payment: Cash on Delivery</em></p>
        `
      })
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Email sent successfully');
      res.status(200).json({ success: true, message: 'Order confirmed!' });
    } else {
      console.error('❌ Resend error:', data);
      res.status(500).json({ error: data.message || 'Email service error' });
    }
  } catch (error) {
    console.error('💥 API Error:', error);
    res.status(500).json({ error: 'Failed to process order. Please try again.' });
  }
}
