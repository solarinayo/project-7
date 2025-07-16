import React from 'react';
import { useNavigate } from 'react-router-dom';
import { usePayment } from '../contexts/PaymentContext';
import { courses } from '../data/courses'; 
import { ArrowLeftIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
// Other icon imports...

interface PaymentSummaryStepProps {
  setIsSubmitting: (submitting: boolean) => void;
}

const PaymentSummaryStep: React.FC<PaymentSummaryStepProps> = ({ setIsSubmitting }) => {
  const { 
    paymentData, 
    setCurrentStep, 
    initializePayment, 
    submitPayment,
    currentPayment 
  } = usePayment();
  const navigate = useNavigate();

  const selectedCourse = courses.find(c => c.id === paymentData.courseId);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency', currency: 'NGN', minimumFractionDigits: 0
    }).format(amount);
  };
  
  // ✅ FIX: This function is now guaranteed to be called on success.
  const handleSuccess = async (response: any) => {
    console.log('Paystack transaction successful. Ref:', response.reference);
    const result = await submitPayment(response);
    
    if (result.success) {
      console.log('Backend enrollment successful. Redirecting to receipt page...');
      navigate('/payment-success');
    } else {
      alert('Your payment was accepted, but there was an error saving your enrollment. Please contact support and provide this reference: ' + response.reference);
    }
    // This ensures the preloader always stops.
    setIsSubmitting(false);
  };

  const handleClose = () => {
    console.log('Payment cancelled by user.');
    setIsSubmitting(false);
  };

  const handlePayment = () => {
    if (!paymentData.email || !paymentData.fullName) {
      alert("Please ensure your Full Name and Email are filled out in Step 1.");
      return;
    }
    setIsSubmitting(true);
    initializePayment(handleSuccess, handleClose);
  };

  // ... (Your preferred UI for the payment summary)
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-800">Payment Summary</h2>
        <p className="text-gray-500 mt-2">Confirm your details before paying.</p>
      </div>
      <div className="bg-gray-50 rounded-lg p-6 border border-gray-200 space-y-3">
        <div className="flex justify-between">
          <span>Student:</span>
          <span className="font-medium">{paymentData.fullName}</span>
        </div>
        <div className="flex justify-between">
          <span>Course:</span>
          <span className="font-medium">{selectedCourse?.name}</span>
        </div>
        <hr/>
        <div className="flex justify-between text-2xl font-bold text-blue-700">
          <span>Amount to Pay Now:</span>
          <span>{formatCurrency(currentPayment)}</span>
        </div>
      </div>
      <div className="flex justify-between items-center pt-6">
        <button type="button" onClick={() => setCurrentStep(2)} className="px-8 py-3 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300">
          <ArrowLeftIcon className="h-5 w-5 inline-block mr-2" />Back
        </button>
        <button onClick={handlePayment} className="px-8 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 shadow-lg">
          <CheckCircleIcon className="h-5 w-5 inline-block mr-2" />
          Complete Payment
        </button>
      </div>
    </div>
  );
};

export default PaymentSummaryStep;