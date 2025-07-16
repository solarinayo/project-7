import React, { useState } from 'react';
import { usePayment } from '../contexts/PaymentContext';
import { useNavigate } from 'react-router-dom';
import StepIndicator from '../components/StepIndicator';
import StudentInfoStep from '../components/StudentInfoStep';
import CourseSelectionStep from '../components/CourseSelectionStep';
import PaymentSummaryStep from '../components/PaymentSummaryStep';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

const PaymentForm: React.FC = () => {
  const { currentStep, setCurrentStep } = usePayment();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      navigate('/');
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <StudentInfoStep />;
      case 2:
        return <CourseSelectionStep />;
      case 3:
        return <PaymentSummaryStep setIsSubmitting={setIsSubmitting} />;
      default:
        return <StudentInfoStep />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={handleBack}
              className="flex items-center text-gray-600 hover:text-gray-800 transition-colors duration-200"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-2" />
              Back
            </button>
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-800">Jekacode Bootcamp</h1>
              <p className="text-gray-600">Complete your enrollment</p>
            </div>
            <div className="w-16" /> {/* Spacer */}
          </div>

          {/* Step Indicator */}
          <StepIndicator />

          {/* Form Content */}
          <div className="bg-white rounded-xl shadow-lg p-8 mt-8">
            {renderStep()}
          </div>
        </div>
      </div>
      
      {/* Loading Overlay */}
      {isSubmitting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-700">Processing your payment...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentForm;