# Jekacode Cohort Payment System

A comprehensive full-stack payment system for bootcamp enrollment with multi-step forms, installment payments, voucher management, and admin dashboard.

## 🚀 Features

### Frontend
- **Multi-step Payment Form**: Student info → Course selection → Payment summary
- **Dynamic Pricing**: Real-time price calculation based on course format and payment plan
- **Installment Support**: Full payment, 2x, and 3x installment options
- **Voucher System**: Discount code validation and application
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Smooth Animations**: Enhanced UX with micro-interactions

### Backend
- **Payment Processing**: Paystack integration for secure payments
- **Data Storage**: MongoDB for primary data, Google Sheets for backup
- **Email Notifications**: Automated emails for confirmations and reminders
- **Admin Authentication**: JWT-based admin access control
- **RESTful API**: Well-structured endpoints for all operations

### Admin Panel
- **Dashboard Analytics**: Revenue tracking, course breakdown, enrollment trends
- **Student Management**: View, filter, and manage all enrollments
- **Voucher Management**: Create, track, and manage discount codes
- **Bulk Operations**: Send emails to cohorts, export data
- **Real-time Updates**: Live payment status and progress tracking

## 🛠 Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS, React Router
- **Backend**: Node.js, Express.js, MongoDB, Mongoose
- **Payment**: Paystack API
- **Email**: Nodemailer with Gmail SMTP
- **Sheets**: Google Sheets API
- **Authentication**: JWT tokens
- **Deployment**: Ready for Vercel/Netlify (frontend) and Heroku/Railway (backend)

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- Gmail account for email notifications
- Paystack account for payment processing
- Google Cloud Console account for Sheets API

## 🔧 Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd jekacode-payment-system
```

### 2. Backend Setup

```bash
cd server
npm install
```

Create `.env` file in the server directory:

```env
# Application
NODE_ENV=development
PORT=5000

# Database
MONGODB_URI=mongodb://localhost:27017/jekacode
MONGODB_DB_NAME=jekacode

# Payment Gateway (Paystack)
PAYSTACK_SECRET_KEY=sk_test_your_paystack_secret_key_here
PAYSTACK_PUBLIC_KEY=pk_test_your_paystack_public_key_here

# Google Sheets Integration
GOOGLE_SHEETS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour Google Service Account Private Key\n-----END PRIVATE KEY-----\n"
GOOGLE_SHEETS_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
GOOGLE_SHEETS_SPREADSHEET_ID=your_google_sheets_spreadsheet_id

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=noreply@jekacode.com
ADMIN_EMAIL=admin@jekacode.com

# JWT Secret
JWT_SECRET=your-super-secure-jwt-secret-key-here

# Admin Credentials
ADMIN_PASSWORD=admin123
```

### 3. Frontend Setup

```bash
cd ..  # Back to root directory
npm install
```

Create `.env` file in the root directory:

```env
VITE_API_URL=http://localhost:5000/api
VITE_PAYSTACK_PUBLIC_KEY=pk_test_your_paystack_public_key_here
```

### 4. Database Setup

Start MongoDB locally or use MongoDB Atlas. The application will automatically create the required collections.

### 5. Google Sheets Setup (Optional)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google Sheets API
4. Create a Service Account
5. Download the JSON key file
6. Extract the `private_key` and `client_email` for your `.env` file
7. Create a Google Sheet and share it with the service account email
8. Copy the spreadsheet ID from the URL

### 6. Paystack Setup

1. Sign up at [Paystack](https://paystack.com/)
2. Get your test API keys from the dashboard
3. Add them to your `.env` files
4. Configure webhook URL: `https://your-backend-url/api/payments/webhook`

### 7. Email Setup

1. Enable 2-factor authentication on your Gmail account
2. Generate an App Password
3. Use the app password in your `.env` file

## 🚀 Running the Application

### Development Mode

1. Start the backend server:
```bash
cd server
npm run dev
```

2. Start the frontend development server:
```bash
cd ..  # Back to root
npm run dev
```

3. Access the application:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000
   - Admin Panel: http://localhost:5173/admin/login

### Production Mode

1. Build the frontend:
```bash
npm run build
```

2. Start the backend in production:
```bash
cd server
npm start
```

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/admin/login` - Admin login
- `GET /api/auth/verify` - Verify JWT token

### Payment Endpoints
- `POST /api/payments/validate-voucher` - Validate voucher code
- `POST /api/payments/calculate` - Calculate payment amount
- `POST /api/payments/initialize` - Initialize payment
- `POST /api/payments/verify` - Verify payment

### Student Management
- `GET /api/students` - Get all students (Admin)
- `GET /api/students/:id` - Get student by ID
- `PATCH /api/students/:id/status` - Update student status
- `POST /api/students/:id/send-email` - Send email to student
- `POST /api/students/bulk-email` - Send bulk email

### Voucher Management
- `GET /api/vouchers` - Get all vouchers (Admin)
- `POST /api/vouchers` - Create new voucher
- `PATCH /api/vouchers/:id` - Update voucher
- `DELETE /api/vouchers/:id` - Delete voucher

## 🎨 Course Configuration

The system supports 6 courses with different pricing:

| Course | Virtual Price | Physical Price |
|--------|---------------|----------------|
| Web Dev (Frontend) | ₦100,000 | ₦150,000 |
| Web Dev (Backend) | ₦150,000 | ₦200,000 |
| Cybersecurity | ₦200,000 | ₦250,000 |
| Web3 | ₦100,000 | ₦150,000 |
| Data Analysis | ₦200,000 | ₦250,000 |
| Product Design (UI/UX) | ₦150,000 | ₦180,000 |

## 💳 Payment Plans

- **Full Payment**: 100% upfront
- **Installment 2x**: 50% now, 50% later
- **Installment 3x**: 34% now, 33% later, 33% final

## 🔐 Admin Access

Default admin credentials:
- Password: `admin123`

Access the admin panel at `/admin/login`

## 🚀 Deployment

### Frontend (Vercel/Netlify)

1. Build the project: `npm run build`
2. Deploy the `dist` folder
3. Set environment variables in your hosting platform

### Backend (Heroku/Railway)

1. Create a new app on your hosting platform
2. Set all environment variables
3. Deploy the `server` directory
4. Ensure MongoDB connection is configured

### Environment Variables for Production

Update your environment variables for production:
- Change `NODE_ENV` to `production`
- Use production MongoDB URI
- Use production Paystack keys
- Update CORS origins in server configuration

## 🧪 Testing

Run tests:
```bash
# Backend tests
cd server
npm test

# Frontend tests
cd ..
npm test
```

## 📝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check connection string in `.env`

2. **Email Not Sending**
   - Verify Gmail app password
   - Check SMTP settings

3. **Paystack Integration Issues**
   - Verify API keys
   - Check webhook configuration

4. **Google Sheets Not Working**
   - Verify service account permissions
   - Check spreadsheet sharing settings

## 📄 License

This project is licensed under the MIT License.

## 🤝 Support

For support, email support@jekacode.com or create an issue in the repository.

---

Built with ❤️ for Jekacode Bootcamp