import Listing from '../../model/listingModel/index.js';
import nodemailer from 'nodemailer';

const sendConfirmationEmail = async (email, userName, confirmedBooking) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASS,
      },
    });

    const emailTemplate = `
      <html>
        <head>
          <style>
            .container {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              color: #333;
              max-width: 600px;
              margin: auto;
              border: 1px solid #ddd;
              border-radius: 8px;
              overflow: hidden;
              box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            }
            .header {
              background-color: #007bff;
              color: white;
              text-align: center;
              padding: 20px;
            }
            .footer {
              background-color: #f8f9fa;
              text-align: center;
              padding: 15px;
              font-size: 12px;
              color: #555;
            }
            .body {
              padding: 20px;
              line-height: 1.6;
            }
            .body p {
              margin: 10px 0;
            }
            .button {
              display: inline-block;
              margin: 20px 0;
              background-color: #007bff;
              color: white;
              padding: 10px 20px;
              text-decoration: none;
              font-weight: bold;
              border-radius: 4px;
            }
            .button:hover {
              background-color: #0056b3;
            }
            .details-table {
              width: 100%;
              border-collapse: collapse;
              margin: 20px 0;
            }
            .details-table th, .details-table td {
              border: 1px solid #ddd;
              padding: 10px;
              text-align: left;
            }
            .details-table th {
              background-color: #f2f2f2;
            }
            .logo {
              max-width: 150px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <img class="logo" src="${process.env.LOGO_URL || 'https://via.placeholder.com/150'}" alt="Company Logo" />
              <h2>Booking Confirmation</h2>
            </div>
            <div class="body">
              <p>Dear ${userName || 'Valued Guest'},</p>
              <p>Thank you for choosing our platform for your stay. We are delighted to confirm your booking with the following details:</p>
              <table class="details-table">
                <tr>
                  <th>Listing Title</th>
                  <td>${confirmedBooking.listingId.title}</td>
                </tr>
                <tr>
                  <th>Start Date</th>
                  <td>${new Date(confirmedBooking.startDate).toLocaleDateString()}</td>
                </tr>
                <tr>
                  <th>End Date</th>
                  <td>${new Date(confirmedBooking.endDate).toLocaleDateString()}</td>
                </tr>
                <tr>
                  <th>Guest Capacity</th>
                  <td>${confirmedBooking.guestCapacity}</td>
                </tr>
                <tr>
                  <th>Total Price</th>
                  <td>$${confirmedBooking.totalPrice}</td>
                </tr>
              </table>
              <p>We hope you have an unforgettable experience. If you have any questions or need assistance, feel free to contact us.</p>
              <a href="https://airbnb-frontend-vert.vercel.app/user/trips" class="button">View Your Booking</a>
              <p>Warm regards,</p>
              <p><strong>The Rental Company Team</strong></p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} Rental Company. All rights reserved.</p>
              <p><a href="https://airbnb-frontend-vert.vercel.app/" style="color: #007bff; text-decoration: none;">Visit our website</a></p>
            </div>
          </div>
        </body>
      </html>
    `;

    const mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: 'Booking Confirmation - Thank You for Choosing Us!',
      html: emailTemplate,
    };

    await transporter.sendMail(mailOptions);
    console.log('Confirmation email sent to:', email);
  } catch (error) {
    console.error('Error sending email:', error.message);
  }
};

export default sendConfirmationEmail;
