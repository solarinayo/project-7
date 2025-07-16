import React from 'react';
import { useNavigate } from 'react-router-dom';
import { usePayment } from '../contexts/PaymentContext';
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
  const { paymentData, setCurrentStep, courses, initializePayment, submitPayment } = usePayment();
  const navigate = useNavigate();

  const selectedCourse = courses.find(c => c.id === paymentData.courseId);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleSuccess = async () => {
    console.log('Payment successful via Paystack!');
    await submitPayment();
    setIsSubmitting(false);
    navigate('/payment-success');
  };

  const handleClose = () => {
    console.log('Paystack modal closed by user.');
    setIsSubmitting(false);
  };

  const handlePayment = () => {
    if (!paymentData.email) {
        alert("Email is required to proceed with payment.");
        return;
    }
    setIsSubmitting(true);
    initializePayment(handleSuccess, handleClose);
  };

  const SummaryCard = ({ icon: Icon, title, value, highlight = false }: any) => (
    <div className={`p-4 rounded-2xl border-2 transition-all duration-300 ${
      highlight 
        ? 'border-blue-500 bg-blue-50 shadow-glow' 
        : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-medium'
    }`}>
      <div className="flex items-center space-x-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
          highlight ? 'gradient-primary' : 'bg-gray-100'
        } shadow-medium`}>
          <Icon className={`w-5 h-5 ${highlight ? 'text-white' : 'text-gray-600'}`} />
        </div>
        <div>
          <p className="text-sm text-gray-600 font-medium">{title}</p>
          <p className={`font-bold ${highlight ? 'text-blue-700' : 'text-gray-800'}`}>{value}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="text-center animate-fade-in-scale">
        <div className="inline-flex items-center justify-center w-20 h-20 gradient-success rounded-3xl mb-6 shadow-glow-lg animate-float">
          <CreditCardIcon className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-3 tracking-tight">Payment Summary</h2>
        <p className="text-gray-600 text-lg sm:text-xl font-medium">Review your enrollment details</p>
        <div className="w-32 h-1.5 gradient-success rounded-full mx-auto mt-6 animate-gradient"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="glass-effect rounded-3xl p-6 border border-white/20 shadow-large">
            <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <UserIcon className="w-6 h-6 mr-3 text-blue-500" />
              Student Information
            </h3>
            <div className="space-y-4">
              <SummaryCard icon={UserIcon} title="Full Name" value={paymentData.fullName || 'N/A'} />
              <SummaryCard icon={UserIcon} title="Email" value={paymentData.email || 'N/A'} />
              <SummaryCard icon={UserIcon} title="Phone" value={paymentData.phone ? `+234 ${paymentData.phone}` : 'N/A'} />
              <SummaryCard icon={MapPinIcon} title="State" value={paymentData.state || 'N/A'} />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-effect rounded-3xl p-6 border border-white/20 shadow-large">
            <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <AcademicCapIcon className="w-6 h-6 mr-3 text-green-500" />
              Course Details
            </h3>
            <div className="space-y-4">
              <SummaryCard icon={AcademicCapIcon} title="Course" value={selectedCourse?.name || 'N/A'} highlight />
              <SummaryCard icon={MapPinIcon} title="Format" value={paymentData.classFormat === 'virtual' ? 'Virtual Classes' : 'Physical Classes'} />
              <SummaryCard icon={CalendarIcon} title="Cohort" value={paymentData.cohort || 'N/A'} />
              <SummaryCard icon={CreditCardIcon} title="Payment Plan" value={paymentData.paymentPlan === 'full' ? 'Full Payment' : `${paymentData.paymentPlan.split('_')[1]} Installments`} />
            </div>
          </div>
        </div>
      </div>

      <div className="glass-effect rounded-3xl p-6 sm:p-8 border border-white/20 shadow-large animate-slide-in-up">
        <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
          <CurrencyDollarIcon className="w-6 h-6 mr-3 text-purple-500" />
          Payment Breakdown
        </h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center py-3 border-b border-gray-200">
            <span className="text-gray-600 font-medium">Course Price</span>
            <span className="text-xl font-bold text-gray-800">{formatCurrency(paymentData.totalAmount)}</span>
          </div>
          {paymentData.voucherCode && (
            <div className="flex justify-between items-center py-3 border-b border-gray-200">
              <div className="flex items-center space-x-2">
                <TagIcon className="w-5 h-5 text-green-500" />
                <span className="text-green-600 font-medium">Voucher ({paymentData.voucherCode})</span>
              </div>
              <span className="text-xl font-bold text-green-600">-{formatCurrency(paymentData.discountAmount)}</span>
            </div>
          )}
          <div className="flex justify-between items-center py-4 bg-blue-50 rounded-2xl px-4 border-2 border-blue-200">
            <span className="text-blue-800 font-bold text-lg">Final Amount</span>
            <span className="text-2xl font-bold text-blue-700">{formatCurrency(paymentData.finalAmount)}</span>
          </div>
          <div className="flex justify-between items-center py-4 bg-green-50 rounded-2xl px-4 border-2 border-green-200">
            <span className="text-green-800 font-bold text-lg">{paymentData.paymentPlan === 'full' ? 'Amount to Pay Now' : 'First Payment'}</span>
            <span className="text-3xl font-bold text-green-700">{formatCurrency(paymentData.currentPayment)}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-8">
        <button type="button" onClick={() => setCurrentStep(2)} className="flex items-center px-8 py-4 text-gray-600 hover:text-gray-800 hover:bg-white/70 rounded-2xl transition-all duration-300 font-semibold shadow-medium hover:shadow-large transform hover:scale-105 w-full sm:w-auto">
          <ArrowLeftIcon className="h-6 w-6 mr-3" />
          Back
        </button>
        <button onClick={handlePayment} className="group relative overflow-hidden px-8 py-4 font-bold rounded-2xl transition-all duration-300 transform shadow-large text-lg w-full sm:w-auto btn-success hover:shadow-glow-lg animate-glow hover:scale-105">
          <div className="flex items-center justify-center">
            <CheckCircleIcon className="h-6 w-6 mr-3 group-hover:animate-bounce-gentle" />
            <span>Complete Payment - {formatCurrency(paymentData.currentPayment)}</span>
          </div>
          <div className="absolute inset-0 bg-white/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </button>
      </div>
    </div>
  );
};

export default PaymentSummaryStep;