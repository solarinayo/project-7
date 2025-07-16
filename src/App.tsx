import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { PaymentProvider } from './contexts/PaymentContext';
import { AdminProvider } from './contexts/AdminContext';
import HomePage from './pages/HomePage';
import PaymentForm from './pages/PaymentForm';
import AdminDashboard from './pages/AdminDashboard';
import StudentManagement from './pages/StudentManagement';
import VoucherManagement from './pages/VoucherManagement';
import AdminManagement from './pages/AdminManagement';
import PaymentSuccess from './pages/PaymentSuccess';
import AdminLogin from './pages/AdminLogin';

function App() {
  return (
    <PaymentProvider>
      <AdminProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/payment" element={<PaymentForm />} />
              <Route path="/payment-success" element={<PaymentSuccess />} />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/students" element={<StudentManagement />} />
              <Route path="/admin/vouchers" element={<VoucherManagement />} />
              <Route path="/admin/admins" element={<AdminManagement />} />
            </Routes>
          </div>
        </Router>
      </AdminProvider>
    </PaymentProvider>
  );
}

export default App;