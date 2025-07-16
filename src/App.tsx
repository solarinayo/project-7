import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { PaymentProvider } from './contexts/PaymentContext';
import { AdminProvider } from './contexts/AdminContext';
import HomePage from './pages/HomePage';
import PaymentForm from './pages/PaymentForm';
import PaymentSuccess from './pages/PaymentSuccess';
// ❌ REMOVE THIS IMPORT
// import PaymentVerification from './pages/PaymentVerification'; 
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
// ... other imports

function App() {
  return (
    <PaymentProvider>
      <AdminProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/payment" element={<PaymentForm />} />
              {/* ❌ REMOVE THIS ROUTE */}
              {/* <Route path="/payment/verify" element={<PaymentVerification />} /> */}
              <Route path="/payment-success" element={<PaymentSuccess />} />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin" element={<AdminDashboard />} />
              {/* ... other routes */}
            </Routes>
          </div>
        </Router>
      </AdminProvider>
    </PaymentProvider>
  );
}

export default App;