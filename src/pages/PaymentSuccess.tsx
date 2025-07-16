import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { usePayment } from '../contexts/PaymentContext';
import { CheckCircleIcon, PrinterIcon } from '@heroicons/react/24/outline';

const PaymentSuccess: React.FC = () => {
  const { paymentData, courses } = usePayment();

  useEffect(() => {
    console.log('Payment successful. Displaying receipt for:', paymentData);
  }, [paymentData]);

  const selectedCourse = courses.find(c => c.id === paymentData.courseId);
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getCurrentDateTime = () => {
    const now = new Date();
    return {
      date: now.toLocaleDateString('en-GB'),
      time: now.toLocaleTimeString('en-GB', { hour12: false })
    };
  };

  const { date, time } = getCurrentDateTime();
  const transactionId = `JKC${Date.now().toString().slice(-8)}`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4 animate-bounce">
            <CheckCircleIcon className="h-10 w-10 text-green-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Payment Successful!</h1>
          <p className="text-gray-600">Your enrollment has been confirmed</p>
        </div>

        <div id="receipt" className="bg-white shadow-lg" style={{ fontFamily: 'monospace' }}>
          <div className="text-center border-b-2 border-dashed border-gray-300 p-6">
            <div className="text-2xl font-bold mb-2">JEKACODE</div>
            <div className="text-sm text-gray-600 mb-1">BOOTCAMP ENROLLMENT</div>
            <div className="text-sm text-gray-600">Lagos, Nigeria</div>
          </div>

          <div className="p-6 space-y-2 text-sm">
            <div className="flex justify-between"><span>DATE:</span><span>{date}</span></div>
            <div className="flex justify-between"><span>TIME:</span><span>{time}</span></div>
            <div className="flex justify-between"><span>TXN ID:</span><span>{transactionId}</span></div>
          </div>

          <div className="border-t border-dashed border-gray-300"></div>

          <div className="p-6 space-y-2 text-sm">
            <div className="font-bold mb-3">STUDENT INFORMATION</div>
            <div className="flex justify-between"><span>NAME:</span><span className="text-right max-w-[150px] break-words">{paymentData.fullName?.toUpperCase()}</span></div>
            <div className="flex justify-between"><span>EMAIL:</span><span className="text-right max-w-[150px] break-words text-xs">{paymentData.email}</span></div>
            <div className="flex justify-between"><span>PHONE:</span><span>{paymentData.phone}</span></div>
          </div>

          <div className="border-t border-dashed border-gray-300"></div>

          <div className="p-6 space-y-2 text-sm">
            <div className="font-bold mb-3">COURSE DETAILS</div>
            <div className="flex justify-between"><span>COURSE:</span><span className="text-right max-w-[150px] break-words">{selectedCourse?.name.toUpperCase()}</span></div>
            <div className="flex justify-between"><span>FORMAT:</span><span>{paymentData.classFormat?.toUpperCase()}</span></div>
            <div className="flex justify-between"><span>COHORT:</span><span>{paymentData.cohort?.toUpperCase()}</span></div>
            <div className="flex justify-between"><span>PLAN:</span><span>{paymentData.paymentPlan === 'full' ? 'FULL PAYMENT' : `INSTALLMENT ${paymentData.paymentPlan?.split('_')[1]}X`}</span></div>
          </div>

          <div className="border-t border-dashed border-gray-300"></div>

          <div className="p-6 space-y-2 text-sm">
            <div className="font-bold mb-3">PAYMENT BREAKDOWN</div>
            <div className="flex justify-between"><span>COURSE PRICE:</span><span>{formatCurrency(paymentData.totalAmount)}</span></div>
            {paymentData.voucherCode && (<div className="flex justify-between"><span>VOUCHER ({paymentData.voucherCode}):</span><span>-{formatCurrency(paymentData.discountAmount)}</span></div>)}
            <div className="border-t border-gray-300 my-2"></div>
            <div className="flex justify-between font-bold"><span>TOTAL AMOUNT:</span><span>{formatCurrency(paymentData.finalAmount)}</span></div>
            <div className="flex justify-between font-bold text-lg"><span>AMOUNT PAID:</span><span>{formatCurrency(paymentData.currentPayment)}</span></div>
            {paymentData.paymentPlan !== 'full' && (<div className="flex justify-between text-red-600"><span>BALANCE DUE:</span><span>{formatCurrency(paymentData.finalAmount - paymentData.currentPayment)}</span></div>)}
          </div>

          <div className="border-t border-dashed border-gray-300"></div>

          <div className="p-6 text-center">
            <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-bold mb-4">✓ PAYMENT SUCCESSFUL</div>
          </div>
        </div>

        <div className="flex justify-center space-x-4 mt-6">
          <button onClick={handlePrint} className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all duration-200">
            <PrinterIcon className="h-4 w-4 mr-2" />
            Print Receipt
          </button>
          <Link to="/" className="flex items-center px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all duration-200">
            Back to Home
          </Link>
        </div>
      </div>

      <style>
        {`
          @media print {
            body * {
              visibility: hidden;
            }
            #receipt, #receipt * {
              visibility: visible;
            }
            #receipt {
              position: absolute;
              left: 0;
              top: 0;
              width: 100% !important;
              max-width: none !important;
              box-shadow: none !important;
              border: none !important;
            }
            .no-print {
              display: none;
            }
          }
        `}
      </style>
    </div>
  );
};

export default PaymentSuccess;