import React from 'react';
import { usePayment } from '../contexts/PaymentContext';
import { CheckIcon } from '@heroicons/react/24/solid';

const StepIndicator: React.FC = () => {
  const { currentStep } = usePayment();

  const steps = [
    { number: 1, title: 'Student Info', description: 'Your personal information' },
    { number: 2, title: 'Course Selection', description: 'Choose your program' },
    { number: 3, title: 'Payment', description: 'Complete your payment' },
  ];

  return (
    <div className="flex items-center justify-center">
      {steps.map((step, index) => (
        <div key={step.number} className="flex items-center">
          {/* Step Circle */}
          <div className="flex flex-col items-center">
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                step.number < currentStep
                  ? 'bg-green-500 border-green-500 text-white'
                  : step.number === currentStep
                  ? 'bg-purple-600 border-purple-600 text-white'
                  : 'bg-gray-100 border-gray-300 text-gray-400'
              }`}
            >
              {step.number < currentStep ? (
                <CheckIcon className="h-6 w-6" />
              ) : (
                <span className="font-semibold">{step.number}</span>
              )}
            </div>
            <div className="mt-2 text-center">
              <div
                className={`font-medium text-sm ${
                  step.number <= currentStep ? 'text-gray-800' : 'text-gray-400'
                }`}
              >
                {step.title}
              </div>
              <div className="text-xs text-gray-500">{step.description}</div>
            </div>
          </div>

          {/* Connector Line */}
          {index < steps.length - 1 && (
            <div
              className={`w-20 h-0.5 mx-4 mt-[-20px] transition-all duration-300 ${
                step.number < currentStep ? 'bg-green-500' : 'bg-gray-300'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
};

export default StepIndicator;