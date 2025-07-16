import React from 'react';
import { useNavigate } from 'react-router-dom';
import { usePayment } from '../contexts/PaymentContext';
import { courses } from '../data/courses'; 
import { 
  ArrowLeftIcon, 
  CreditCardIcon,
  CheckCircleIcon,
  UserIcon,
  AcademicCapIcon,
  CalendarIcon,
  MapPinIcon,
  TagIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';

interface PaymentSummaryStepProps {
  setIsSubmitting: (submitting: boolean) => void;
}

const PaymentSummaryStep: React.FC<PaymentSummaryStepProps> = ({ setIsSubmitting }) => {
  const { 
    paymentData, 
    setCurrentStep, 
    initializePayment, 
    submitPayment,
    totalAmount,
    discountAmount,
    finalAmount,
    currentPayment 
  } = usePayment();
  const navigate = useNavigate();

  const selectedCourse = courses.find(c => c.id === paymentData.courseId);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(amount);
  };
  
  // ✅ FIX: The complete success handler
  const handleSuccess = async (response: any) => {
    const result = await submitPayment(response);
    
    if (result.success) {
      // Navigate to the success page on a successful enrollment
      navigate('/payment-success');
    } else {
      alert('There was an issue saving your enrollment details. Please contact support.');
    }
    // This is crucial to hide the preloader regardless of the outcome
    setIsSubmitting(false);
  };

  const handleClose = () => {
    console.log('Paystack modal closed by user.');
    setIsSubmitting(false);
  };

  const handlePayment = () => {
    if (!paymentData.email || !paymentData.fullName) {
        alert("Full Name and Email are required to proceed.");
        return;
    }
    setIsSubmitting(true);
    initializePayment(handleSuccess, handleClose);
  };

  const SummaryCard = ({ icon: Icon, title, value, highlight = false }: any) => (
    <div className={`p-4 rounded-xl border transition-all duration-300 ${
      highlight 
        ? 'border-blue-300 bg-blue-50' 
        : 'border-gray-200 bg-white hover:border-blue-200'
    }`}>
      <div className="flex items-center space-x-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
          highlight ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
        }`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="font-semibold text-gray-800">{value}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <CreditCardIcon className="h-12 w-12 mx-auto text-blue-600 mb-4" />
        <h2 className="text-3xl font-bold text-gray-800">Payment Summary</h2>
        <p className="text-gray-500 mt-2">Please review your enrollment details carefully.</p>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-700 flex items-center"><UserIcon className="w-5 h-5 mr-2 text-blue-500" />Student Info</h3>
            <SummaryCard icon={UserIcon} title="Full Name" value={paymentData.fullName || 'N/A'} />
            <SummaryCard icon={UserIcon} title="Email" value={paymentData.email || 'N/A'} />
        </div>
        <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-700 flex items-center"><AcademicCapIcon className="w-5 h-5 mr-2 text-green-500" />Course Info</h3>
            <SummaryCard icon={AcademicCapIcon} title="Course" value={selectedCourse?.name || 'N/A'} highlight />
            <SummaryCard icon={MapPinIcon} title="Format" value={paymentData.classFormat === 'virtual' ? 'Virtual' : 'Physical'} />
            <SummaryCard icon={CalendarIcon} title="Cohort" value={paymentData.cohort || 'N/A'} />
        </div>
      </div>

      {/* Payment Breakdown */}
      <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center"><CurrencyDollarIcon className="w-5 h-5 mr-2 text-purple-500" />Payment Breakdown</h3>
        <div className="space-y-3 text-base">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Course Price:</span>
            <span className="font-medium text-gray-800">{formatCurrency(totalAmount)}</span>
          </div>
          {discountAmount > 0 && (
            <div className="flex justify-between items-center text-green-600">
              <span className="flex items-center text-gray-600"><TagIcon className="w-4 h-4 mr-2"/>Voucher ({paymentData.voucherCode})</span>
              <span className="font-medium">-{formatCurrency(discountAmount)}</span>
            </div>
          )}
          <hr className="my-2"/>
          <div className="flex justify-between items-center text-xl font-bold text-gray-800">
            <span>Final Amount:</span>
            <span>{formatCurrency(finalAmount)}</span>
          </div>
          <div className="flex justify-between items-center py-3 px-4 bg-blue-100 rounded-lg text-2xl font-bold text-blue-700">
            <span>Amount to Pay Now:</span>
            <span>{formatCurrency(currentPayment)}</span>
          </div>
        </div>
      </div>
      
      {/* Navigation */}
      <div className="flex justify-between items-center pt-6">
        <button type="button" onClick={() => setCurrentStep(2)} className="px-8 py-3 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition-colors">
          <ArrowLeftIcon className="h-5 w-5 inline-block mr-2" />Back
        </button>
        <button onClick={handlePayment} className="px-8 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors transform hover:scale-105 shadow-lg">
          <CheckCircleIcon className="h-5 w-5 inline-block mr-2" />
          Complete Payment
        </button>
      </div>
    </div>
  );
};

export default PaymentSummaryStep;