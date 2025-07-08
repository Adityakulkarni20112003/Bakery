import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import productModel from "../models/productModel.js";

// Placing Order with any payment method
const placedOrder = async (req, res) => {
    try {
        // Get user from authenticated user object
        const user = req.user;
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User not authenticated"
            });
        }
        
        // Get user ID, ensuring we use a consistent format
        const userId = user.id || user._id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Invalid user ID"
            });
        }
        
        const { items, amount, address, paymentMethod, payment } = req.body;
        
        console.log('Order request body:', JSON.stringify(req.body, null, 2));
        console.log('User object:', JSON.stringify(user, null, 2));
        
        // Validate required fields
        if (!items || !amount || !address) {
            return res.status(400).json({ 
                success: false, 
                message: "Missing required fields for order placement",
                details: {
                    items: !items,
                    amount: !amount,
                    address: !address
                }
            });
        }

        // Validate items array
        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Items must be a non-empty array"
            });
        }

        // Validate address fields
        const requiredAddressFields = ['street', 'city', 'state', 'postalCode', 'country'];
        const missingAddressFields = requiredAddressFields.filter(field => !address[field]);
        if (missingAddressFields.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Missing required address fields",
                details: missingAddressFields
            });
        }

        // Create order data
        const orderData = {
            userId: userId.toString(), // Ensure userId is a string
            items: items.map(item => ({
                productId: item.productId.toString(), // Ensure productId is a string
                quantity: Number(item.quantity),
                price: Number(item.price)
            })),
            amount: Number(amount),
            address: {
                street: address.street,
                city: address.city,
                state: address.state,
                postalCode: address.postalCode,
                country: address.country
            },
            paymentMethod: paymentMethod || "COD",
            payment: payment !== undefined ? Boolean(payment) : false,
            date: Date.now(),
            status: 'Order Placed'
        };

        console.log('Creating order with data:', JSON.stringify(orderData, null, 2));

        const newOrder = new orderModel(orderData);
        
        // Validate order data against schema
        const validationError = newOrder.validateSync();
        if (validationError) {
            console.error('Order validation error:', validationError);
            return res.status(400).json({
                success: false,
                message: "Order validation failed",
                errors: validationError.errors
            });
        }

        // Save the order
        const savedOrder = await newOrder.save();
        console.log('Order saved successfully:', savedOrder._id);

        // Clear the user's cart after successful order
        await userModel.findByIdAndUpdate(userId, { cartData: {} });

        // Return the order ID along with success message
        res.status(201).json({ 
            success: true, 
            message: "Order Placed Successfully",
            orderId: savedOrder._id 
        });
    } catch (error) {
        console.error('Error placing order:', error);
        // Send a more specific error message if available
        const errorMessage = error.message || "Failed to place order. Please try again.";
        res.status(500).json({ 
            success: false, 
            message: errorMessage,
            error: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

// All order Data for Admin panel
const allOrders = async (req, res) => {
    try {
        const orders = await orderModel.find({});
        res.json({ success: true, orders });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// User Order Data for Frontend
const userOrders = async (req, res) => {
    try {
        // Get user from the authenticated user object
        const user = req.user;

        if (!user) {
            return res.status(401).json({ success: false, message: 'User not authenticated' });
        }

        // Get all possible user ID formats
        const userId = user.id || user._id;
        
        if (!userId) {
            return res.status(401).json({ success: false, message: 'Invalid user ID' });
        }

        // Debug logs removed

        // Try to find orders with exact userId match
        let orders = await orderModel.find({ userId: userId });
        
        if (orders.length === 0) {
            // If no orders found, try with userId as string
            orders = await orderModel.find({ userId: userId.toString() });
        }
        
        // Enhance orders with product names
        const ordersWithProductNames = await Promise.all(orders.map(async (order) => {
            // Convert Mongoose document to plain object
            const orderObj = order.toObject();
            
            // Enhance each item with product name
            orderObj.items = await Promise.all(orderObj.items.map(async (item) => {
                try {
                    const product = await productModel.findById(item.productId);
                    return {
                        ...item,
                        productName: product ? product.name : 'Unknown Product'
                    };
                } catch (err) {
                    console.error(`Error fetching product ${item.productId}:`, err);
                    return {
                        ...item,
                        productName: 'Unknown Product'
                    };
                }
            }));
            
            return orderObj;
        }));
        
        // Send the enhanced orders to the client
        res.json({ success: true, orders: ordersWithProductNames });
    } catch (error) {
        console.error('Error in userOrders:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update Order Status for Admin panel
const updateStatus = async (req, res) => {
    try {
        const { orderId, status } = req.body;
        
        console.log(`Updating order status: orderId=${orderId}, status=${status}`);
        
        if (!orderId || !status) {
            return res.status(400).json({ 
                success: false, 
                message: "Order ID and status are required" 
            });
        }
        
        // Find the order first to make sure it exists
        const order = await orderModel.findById(orderId);
        if (!order) {
            return res.status(404).json({ 
                success: false, 
                message: "Order not found" 
            });
        }
        
        // Update the order status
        const updatedOrder = await orderModel.findByIdAndUpdate(
            orderId, 
            { status }, 
            { new: true } // Return the updated document
        );
        
        console.log('Order status updated successfully:', updatedOrder);
        
        res.json({ 
            success: true, 
            message: "Status Updated Successfully",
            order: updatedOrder
        });
    } catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Generate and download invoice for an order
const generateInvoice = async (req, res) => {
  try {
    const { orderId } = req.params;
    const user = req.user;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: "Order ID is required"
      });
    }

    // Find the order
    const order = await orderModel.findById(orderId);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }
    
    // Fetch product details for each item in the order
    const orderItemsWithNames = await Promise.all(order.items.map(async (item) => {
      try {
        const product = await productModel.findById(item.productId);
        return {
          ...item,
          productName: product ? product.name : 'Unknown Product'
        };
      } catch (err) {
        console.error(`Error fetching product ${item.productId}:`, err);
        return {
          ...item,
          productName: 'Unknown Product'
        };
      }
    }));

    // Check if the user is authorized to access this order
    // Allow if it's the user's own order or if the user is an admin
    const userId = user.id || user._id;
    const isAdmin = user.isAdmin;
    
    if (!isAdmin && order.userId !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to access this order"
      });
    }

    // Get user details for the invoice
    const userDetails = await userModel.findById(order.userId);
    if (!userDetails) {
      return res.status(404).json({
        success: false,
        message: "User details not found"
      });
    }

    // Generate the invoice HTML
    const invoiceHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Invoice for Order #${order._id}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            color: #333;
          }
          .invoice-box {
            max-width: 800px;
            margin: auto;
            padding: 30px;
            border: 1px solid #eee;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.15);
          }
          .invoice-box table {
            width: 100%;
            line-height: inherit;
            text-align: left;
            border-collapse: collapse;
          }
          .invoice-box table td {
            padding: 5px;
            vertical-align: top;
          }
          .invoice-box table tr.top table td {
            padding-bottom: 20px;
          }
          .invoice-box table tr.top table td.title {
            font-size: 45px;
            line-height: 45px;
            color: #333;
          }
          .invoice-box table tr.information table td {
            padding-bottom: 40px;
          }
          .invoice-box table tr.heading td {
            background: #eee;
            border-bottom: 1px solid #ddd;
            font-weight: bold;
          }
          .invoice-box table tr.details td {
            padding-bottom: 20px;
          }
          .invoice-box table tr.item td {
            border-bottom: 1px solid #eee;
          }
          .invoice-box table tr.item.last td {
            border-bottom: none;
          }
          .invoice-box table tr.total td:nth-child(4) {
            border-top: 2px solid #eee;
            font-weight: bold;
          }
          @media only screen and (max-width: 600px) {
            .invoice-box table tr.top table td {
              width: 100%;
              display: block;
              text-align: center;
            }
            .invoice-box table tr.information table td {
              width: 100%;
              display: block;
              text-align: center;
            }
          }
        </style>
      </head>
      <body>
        <div class="invoice-box">
          <table>
            <tr class="top">
              <td colspan="4">
                <table>
                  <tr>
                    <td class="title">
                      Bakery
                    </td>
                    <td style="text-align: right;">
                      Invoice #: ${order._id.toString().substring(0, 8)}<br>
                      Created: ${new Date(order.date).toLocaleDateString()}<br>
                      Due: ${new Date(order.date).toLocaleDateString()}
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr class="information">
              <td colspan="4">
                <table>
                  <tr>
                    <td>
                      Bakery, Inc.<br>
                      123 Bakery Street<br>
                      City, State ZIP
                    </td>
                    <td style="text-align: right;">
                      ${userDetails.name || 'Customer'}<br>
                      ${userDetails.email}<br>
                      ${order.address.street}<br>
                      ${order.address.city}, ${order.address.state} ${order.address.postalCode}<br>
                      ${order.address.country}
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr class="heading">
              <td>Payment Method</td>
              <td colspan="3">${order.paymentMethod.toUpperCase()}</td>
            </tr>
            <tr class="details">
              <td>Status</td>
              <td colspan="3">${order.payment ? 'Paid' : 'Pending'}</td>
            </tr>
            <tr class="heading">
              <td>Item</td>
              <td>Quantity</td>
              <td>Price</td>
              <td>Total</td>
            </tr>
            ${orderItemsWithNames.map(item => `
              <tr class="item">
                <td>${item.productName || 'Unknown Product'}</td>
                <td>${item.quantity}</td>
                <td>₹${item.price.toFixed(2)}</td>
                <td>₹${(item.price * item.quantity).toFixed(2)}</td>
              </tr>
            `).join('')}
            <tr class="total">
              <td colspan="3"></td>
              <td>Total: ₹${order.amount.toFixed(2)}</td>
            </tr>
          </table>
          <div style="margin-top: 30px; text-align: center; color: #888;">
            <p>Thank you for your business!</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Set the response headers for a downloadable HTML file
    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Content-Disposition', `attachment; filename="invoice-${order._id}.html"`);
    
    // Send the invoice HTML as the response
    res.send(invoiceHtml);

  } catch (error) {
    console.error('Error generating invoice:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate invoice',
      error: error.message
    });
  }
};

export { placedOrder, allOrders, userOrders, updateStatus, generateInvoice };
