import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { usePayment } from '../contexts/PaymentContext';

const PaymentVerification: React.FC = () => {
  const [status, setStatus] = useState('Verifying your payment...');
  const [error, setError] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const { submitPayment } = usePayment();

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const reference = query.get('reference');

    if (!reference) {
      setStatus('Error');
      setError('No payment reference found. Please contact support.');
      return;
    }

    const verifyAndEnroll = async () => {
      console.log(`✅ Verifying payment with reference: ${reference}`);
      const result = await submitPayment({ reference });

      if (result.success) {
        setStatus('Enrollment Complete!');
        setTimeout(() => {
          navigate('/payment-success');
        }, 2000);
      } else {
        setStatus('Verification Failed');
        setError('We could not confirm your payment. Please contact support with your transaction reference: ' + reference);
      }
    };

    verifyAndEnroll();
  }, [location, navigate, submitPayment]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center p-8 bg-white shadow-lg rounded-lg">
        <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-6"></div>
        <h1 className="text-2xl font-bold text-gray-800">{status}</h1>
        {error && <p className="text-red-500 mt-4">{error}</p>}
      </div>
    </div>
  );
};

export default PaymentVerification;