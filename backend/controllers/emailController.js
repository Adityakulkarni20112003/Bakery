import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import orderModel from '../models/orderModel.js';
import userModel from '../models/userModel.js';
import productModel from '../models/productModel.js';

dotenv.config();

// Create transporter
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    },
    tls: {
        rejectUnauthorized: false
    }
});

// Test connection
transporter.verify((error, success) => {
    if (error) {
        console.log('Error connecting to email server:', error);
    } else {
        console.log('Connected to email server successfully!');
    }
});

export const sendOrderInvoice = async (req, res) => {
    try {
        const { orderId } = req.params;

        // Get order details with populated products
        const order = await orderModel.findById(orderId);
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Get user details
        const user = await userModel.findById(order.userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Get product details for order items
        const orderItemsWithProducts = await Promise.all(
            order.items.map(async (item) => {
                const product = await productModel.findById(item.productId);
                return {
                    ...item,
                    productName: product ? product.name : 'Unknown Product'
                };
            })
        );

        const invoiceHtml = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <title>Invoice for Order #${order._id}</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 0; padding: 20px; color: #333; }
                    .invoice-box { max-width: 800px; margin: auto; padding: 30px; border: 1px solid #eee; box-shadow: 0 0 10px rgba(0, 0, 0, 0.15); }
                    table { width: 100%; line-height: inherit; text-align: left; border-collapse: collapse; }
                    table td { padding: 5px; vertical-align: top; }
                    table tr.heading td { background: #eee; border-bottom: 1px solid #ddd; font-weight: bold; }
                    table tr.item td { border-bottom: 1px solid #eee; }
                    table tr.total td:nth-child(4) { border-top: 2px solid #eee; font-weight: bold; }
                </style>
            </head>
            <body>
                <div class="invoice-box">
                    <table>
                        <tr class="heading">
                            <td colspan="4">Order Invoice #${order._id}</td>
                        </tr>
                        <tr>
                            <td colspan="4">
                                <strong>Date:</strong> ${new Date(order.date * 1000).toLocaleDateString()}<br>
                                <strong>Customer:</strong> ${user.name}<br>
                                <strong>Email:</strong> ${user.email}<br>
                                <strong>Address:</strong> ${order.address ? Object.values(order.address).filter(Boolean).join(', ') : 'No address provided'}
                            </td>
                        </tr>
                        <tr class="heading">
                            <td>Item</td>
                            <td>Quantity</td>
                            <td>Price</td>
                            <td>Total</td>
                        </tr>
                        ${orderItemsWithProducts.map(item => `
                            <tr class="item">
                                <td>${item.productName || 'Unknown Product'}</td>
                                <td>${item.quantity}</td>
                                <td>₹${(item.price !== undefined ? item.price.toFixed(2) : 'N/A')}</td>
                                <td>₹${(item.price !== undefined && item.quantity !== undefined ? (item.price * item.quantity).toFixed(2) : 'N/A')}</td>
                            </tr>
                        `).join('')}
                        <tr class="total">
                            <td colspan="3"></td>
                            <td>Total: ₹${(
    (order.totalAmount !== undefined ? order.totalAmount : order.items.reduce((sum, item) => {
        if (item.price !== undefined && item.quantity !== undefined) {
            return sum + (item.price * item.quantity);
        }
        return sum;
    }, 0)
)).toFixed(2)}</td>
                        </tr>
                    </table>
                </div>
            </body>
            </html>
        `;

        const mailOptions = {
    from: `Bakery Orders <${process.env.EMAIL_USER}>`, // branded sender
    to: user.email,
    subject: `Order Invoice #${orderId}`,
    text: `Thank you for your order!\n\nOrder Invoice #${order._id}\nDate: ${new Date(order.date * 1000).toLocaleDateString()}\nCustomer: ${user.name}\nEmail: ${user.email}\nAddress: ${order.address ? Object.values(order.address).filter(Boolean).join(', ') : 'No address provided'}\n\nItems:\n${order.items.map(item => `${item.productName || 'Unknown Product'} x${item.quantity} - ₹${item.price !== undefined ? item.price.toFixed(2) : 'N/A'} each`).join('\n')}\nTotal: ₹${(order.totalAmount !== undefined ? order.totalAmount.toFixed(2) : order.items.reduce((sum, item) => { if (item.price !== undefined && item.quantity !== undefined) { return sum + (item.price * item.quantity); } return sum; }, 0).toFixed(2))}\n\nIf you have any questions, please contact us.`,
    html: `
        <h2>Thank you for your order!</h2>
        <p>Please find your invoice below.</p>
        ${invoiceHtml}
        <p>If you have any questions, please don't hesitate to contact us.</p>
    `,
    headers: {
        'X-Priority': '3',
        'X-Mailer': 'BakeryApp Mailer',
        'Reply-To': process.env.EMAIL_USER
    }
};

        const info = await transporter.sendMail(mailOptions);

        res.status(200).json({
            success: true,
            message: 'Invoice sent successfully',
            info
        });
    } catch (error) {
        console.error('Error sending invoice:', error); // Log the full error object
        res.status(500).json({
            success: false,
            message: 'Error sending invoice',
            error: error.message,
            fullError: error // Optionally send the full error in the response for debugging (remove in production)
        });
    }
};

export const sendEmail = async (req, res) => {
    try {
        const { to, subject, text, html } = req.body;

        // Validate required fields
        if (!to || !subject) {
            return res.status(400).json({
                success: false,
                message: 'Email and subject are required'
            });
        }

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to,
            subject,
            text,
            html
        };

        // Send email
        const info = await transporter.sendMail(mailOptions);

        res.status(200).json({
            success: true,
            message: 'Email sent successfully',
            info
        });
    } catch (error) {
        console.error('Error sending email:', error); // Log the full error object
        res.status(500).json({
            success: false,
            message: 'Error sending email',
            error: error.message,
            fullError: error // Optionally send the full error in the response for debugging (remove in production)
        });
    }
};
