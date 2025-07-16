import React, { useState } from 'react';
import { usePayment } from '../contexts/PaymentContext';
import { ArrowRightIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { CheckIcon } from '@heroicons/react/24/solid';
import { 
  CodeBracketIcon, 
  ServerIcon, 
  ShieldCheckIcon, 
  CurrencyDollarIcon,
  ChartBarIcon,
  PaintBrushIcon,
  ComputerDesktopIcon,
  BuildingOfficeIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';

const CourseSelectionStep: React.FC = () => {
  const { paymentData, updatePaymentData, setCurrentStep, courses, validateVoucher } = usePayment();
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showErrors, setShowErrors] = useState(false);
  const [agreedToPolicy, setAgreedToPolicy] = useState(false);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    
    if (!paymentData.classFormat) {
      newErrors.classFormat = 'Please select a class format (Virtual or Physical)';
    }
    if (!paymentData.courseId) {
      newErrors.courseId = 'Please select a course you want to enroll in';
    }
    if (!paymentData.cohort) {
      newErrors.cohort = 'Please select your preferred cohort start date';
    }
    if (!paymentData.paymentPlan) {
      newErrors.paymentPlan = 'Please select how you want to pay';
    }
    if (!agreedToPolicy) {
      newErrors.policy = 'You must read and agree to the Student Policy to continue';
    }
    
    setErrors(newErrors);
    setShowErrors(true);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setShowErrors(false);
      setCurrentStep(3);
    } else {
      // Scroll to first error
      const firstErrorElement = document.querySelector('.error-field');
      if (firstErrorElement) {
        firstErrorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  const handleBack = () => {
    setCurrentStep(1);
  };

  const selectedCourse = courses.find(c => c.id === paymentData.courseId);
  const coursePrice = selectedCourse ? (
    paymentData.classFormat === 'virtual' ? selectedCourse.virtualPrice : selectedCourse.physicalPrice
  ) : 0;

  const cohorts = [
    'August 2024',
    'September 2024',
    'October 2024',
    'November 2024',
    'December 2024',
    'January 2025',
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getCourseIcon = (courseId: string) => {
    const iconProps = { className: "h-8 w-8" };
    switch (courseId) {
      case 'frontend':
        return <CodeBracketIcon {...iconProps} />;
      case 'backend':
        return <ServerIcon {...iconProps} />;
      case 'cybersecurity':
        return <ShieldCheckIcon {...iconProps} />;
      case 'web3':
        return <CurrencyDollarIcon {...iconProps} />;
      case 'data_analysis':
        return <ChartBarIcon {...iconProps} />;
      case 'ui_ux':
        return <PaintBrushIcon {...iconProps} />;
      default:
        return <CodeBracketIcon {...iconProps} />;
    }
  };

  const getCourseGradient = (courseId: string) => {
    const gradients = {
      'frontend': 'from-blue-400 to-blue-600',
      'backend': 'from-green-400 to-green-600',
      'cybersecurity': 'from-red-400 to-red-600',
      'web3': 'from-yellow-400 to-yellow-600',
      'data_analysis': 'from-purple-400 to-purple-600',
      'ui_ux': 'from-pink-400 to-pink-600',
    };
    return gradients[courseId as keyof typeof gradients] || 'from-gray-400 to-gray-600';
  };

  const getPaymentPlanDescription = () => {
    switch (paymentData.paymentPlan) {
      case 'full':
        return 'Full Payment';
      case 'installment_2':
        return '2x Installments (50% now, 50% later)';
      case 'installment_3':
        return '3x Installments (34% now, 33% later, 33% final)';
      default:
        return '';
    }
  };

  const getFormatIcon = (format: string) => {
    if (format === 'virtual') {
      return <ComputerDesktopIcon className="h-6 w-6" />;
    } else {
      return <MapPinIcon className="h-6 w-6" />;
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Course Selection</h2>
        <p className="text-gray-600">Choose your learning path and preferences</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Class Format */}
        <div>
          <label className="block text-lg font-semibold text-gray-800 mb-4">
            Class Format
          </label>
          <div className="grid grid-cols-2 gap-6">
            {['virtual', 'physical'].map((format) => (
              <label
                key={format}
                className={`relative flex items-center justify-center p-6 border-2 rounded-2xl cursor-pointer transition-all duration-300 hover:shadow-lg ${
                  paymentData.classFormat === format
                    ? 'border-[#02033e] bg-[#02033e]/10 shadow-xl'
                    : `border-gray-200 hover:border-[#02033e]/30 bg-white ${
                        showErrors && errors.classFormat ? 'border-red-300 bg-red-50' : ''
                      }`
                }`}
              >
                <input
                  type="radio"
                  name="classFormat"
                  value={format}
                  checked={paymentData.classFormat === format}
                  onChange={(e) => {
                    updatePaymentData({ classFormat: e.target.value as 'virtual' | 'physical' });
                    setErrors(prev => ({ ...prev, classFormat: '' }));
                    setShowErrors(false);
                  }}
                  className="sr-only"
                />
                <div className="flex flex-col items-center space-y-3">
                  <div className={`p-4 rounded-full transition-all duration-300 ${
                    paymentData.classFormat === format 
                      ? 'bg-[#02033e] text-white shadow-lg' 
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {getFormatIcon(format)}
                  </div>
                  <span className="text-xl font-semibold capitalize text-gray-800">{format}</span>
                  <span className="text-sm text-gray-500">
                    {format === 'virtual' ? 'Learn from anywhere' : 'In-person classes'}
                  </span>
                  {paymentData.classFormat === format && (
                    <CheckIcon className="h-6 w-6 text-[#02033e]" />
                  )}
                </div>
              </label>
            ))}
          </div>
          {showErrors && errors.classFormat && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg error-field">
              <p className="text-red-600 text-sm font-medium flex items-center">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.classFormat}
              </p>
            </div>
          )}
        </div>

        {/* Course Selection */}
        <div>
          <label className="block text-lg font-semibold text-gray-800 mb-4">
            Course of Interest
          </label>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <label
                key={course.id}
                className={`relative cursor-pointer transition-all duration-300 hover:shadow-xl ${
                  paymentData.courseId === course.id ? 'shadow-xl' : ''
                } ${
                  showErrors && errors.courseId && !paymentData.courseId ? 'ring-2 ring-red-300' : ''
                }`}
              >
                <input
                  type="radio"
                  name="courseId"
                  value={course.id}
                  checked={paymentData.courseId === course.id}
                  onChange={(e) => {
                    updatePaymentData({ courseId: e.target.value });
                    setErrors(prev => ({ ...prev, courseId: '' }));
                    setShowErrors(false);
                  }}
                  className="sr-only"
                />
                
                {/* Course Card */}
                <div className={`bg-gradient-to-br ${getCourseGradient(course.id)} rounded-2xl p-6 text-white relative overflow-hidden`}>
                  {/* Background Pattern */}
                  <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
                    <div className="w-full h-full bg-white rounded-full transform translate-x-8 -translate-y-8"></div>
                  </div>
                  
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4 relative z-10">
                    <div className="flex items-center space-x-3">
                      <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                        {getCourseIcon(course.id)}
                      </div>
                      <div>
                        <h3 className="font-bold text-lg leading-tight">{course.name}</h3>
                        <p className="text-white/80 text-sm">Professional Track</p>
                      </div>
                    </div>
                    {paymentData.courseId === course.id && (
                      <div className="bg-white/20 rounded-full p-2 backdrop-blur-sm">
                        <CheckIcon className="h-5 w-5" />
                      </div>
                    )}
                  </div>

                  {/* Course Tags */}
                  <div className="flex flex-wrap gap-2 mb-4 relative z-10">
                    <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-medium backdrop-blur-sm">
                      {paymentData.classFormat === 'virtual' ? 'Remote' : 'On-site'}
                    </span>
                    <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-medium backdrop-blur-sm">
                     {paymentData.classFormat === 'virtual' ? 'Learn from anywhere' : 'In-person classes - ONLY FOR ABEOKUTA RESIDENTS'}
                    </span>
                  </div>

                  {/* Price Display - Only for selected course */}
                  {paymentData.courseId === course.id && paymentData.classFormat && (
                    <div className="relative z-10">
                      <div className="bg-white/20 rounded-xl p-4 backdrop-blur-sm">
                        <div className="text-center">
                          <div className="text-3xl font-bold">
                            {formatCurrency(paymentData.classFormat === 'virtual' ? course.virtualPrice : course.physicalPrice)}
                          </div>
                          <div className="text-sm opacity-80 capitalize">
                            {paymentData.classFormat} format
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
               {paymentData.classFormat === 'physical' && (
                  <div className="mt-2 flex items-center justify-center text-xs text-orange-600 bg-orange-50 px-3 py-1 rounded-full">
                    <MapPinIcon className="h-3 w-3 mr-1" />
                    Abeokuta Location Only
                  </div>
                )}
              </label>
            ))}
          </div>
          {showErrors && errors.courseId && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg error-field">
              <p className="text-red-600 text-sm font-medium flex items-center">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.courseId}
              </p>
            </div>
          )}
        </div>

        {/* Cohort Selection */}
        <div>
          <label className="block text-lg font-semibold text-gray-800 mb-4">
            Cohort (Start Month)
          </label>
          <select
            value={paymentData.cohort}
            onChange={(e) => {
              updatePaymentData({ cohort: e.target.value });
              setErrors(prev => ({ ...prev, cohort: '' }));
              setShowErrors(false);
            }}
            className={`w-full px-6 py-4 border-2 rounded-xl focus:ring-2 focus:ring-[#02033e] focus:border-transparent transition-all duration-200 text-lg ${
              showErrors && errors.cohort ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
          >
            <option value="">Select your preferred cohort</option>
            {cohorts.map((cohort) => (
              <option key={cohort} value={cohort}>
                {cohort}
              </option>
            ))}
          </select>
          {showErrors && errors.cohort && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg error-field">
              <p className="text-red-600 text-sm font-medium flex items-center">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.cohort}
              </p>
            </div>
          )}
        </div>

        {/* Payment Plan */}
        <div>
          <label className="block text-lg font-semibold text-gray-800 mb-4">
            Payment Plan
          </label>
          <div className="space-y-4">
            {[
              { 
                value: 'full', 
                label: 'Full Payment', 
                description: 'Pay the complete amount now',
                badge: 'Most Popular',
                discount: '5% Discount'
              },
              { 
                value: 'installment_2', 
                label: 'Installment 2x', 
                description: '50% now, 50% in 30 days',
                badge: 'Flexible'
              },
              { 
                value: 'installment_3', 
                label: 'Installment 3x', 
                description: '34% now, 33% monthly for 2 months',
                badge: 'Easy'
              },
            ].map((plan) => (
              <label
                key={plan.value}
                className={`flex items-center p-6 border-2 rounded-xl cursor-pointer transition-all duration-300 hover:shadow-lg ${
                  paymentData.paymentPlan === plan.value
                    ? 'border-[#02033e] bg-[#02033e]/10 shadow-xl'
                    : 'border-gray-200 hover:border-[#02033e]/30 bg-white'
                }`}
              >
                <input
                  type="radio"
                  name="paymentPlan"
                  value={plan.value}
                  checked={paymentData.paymentPlan === plan.value}
                  onChange={(e) => {
                    updatePaymentData({ paymentPlan: e.target.value as any });
                    setErrors(prev => ({ ...prev, paymentPlan: '' }));
                    setShowErrors(false);
                  }}
                  className="sr-only"
                />
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center space-x-4">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      paymentData.paymentPlan === plan.value 
                        ? 'border-[#02033e] bg-[#02033e]' 
                        : 'border-gray-300'
                    }`}>
                      {paymentData.paymentPlan === plan.value && (
                        <CheckIcon className="h-4 w-4 text-white" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center space-x-3">
                        <span className="font-semibold text-lg">{plan.label}</span>
                        <span className="px-3 py-1 bg-[#02033e] text-white text-xs rounded-full">
                          {plan.badge}
                        </span>
                        {plan.discount && (
                          <span className="px-3 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                            {plan.discount}
                          </span>
                        )}
                      </div>
                      <div className="text-gray-600 mt-1">{plan.description}</div>
                    </div>
                  </div>
                </div>
              </label>
            ))}
          </div>
          {showErrors && errors.paymentPlan && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg error-field">
              <p className="text-red-600 text-sm font-medium flex items-center">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.paymentPlan}
              </p>
            </div>
          )}
        </div>

        {/* Voucher Code */}
        <div>
          <label className="block text-lg font-semibold text-gray-800 mb-4">
            Voucher Code (Optional)
          </label>
          <div className="flex space-x-4">
            <input
              type="text"
              value={paymentData.voucherCode}
              onChange={(e) => updatePaymentData({ voucherCode: e.target.value.toUpperCase() })}
              className="flex-1 px-6 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-[#02033e] focus:border-transparent transition-all duration-200 text-lg"
              placeholder="Enter voucher code for discount"
            />
            {paymentData.voucherCode && (
              <div className="flex items-center px-4">
                {validateVoucher(paymentData.voucherCode) ? (
                  <div className="flex items-center space-x-2 text-green-600">
                    <CheckIcon className="h-6 w-6" />
                    <span className="font-medium">Valid!</span>
                  </div>
                ) : (
                  <span className="text-red-500 font-medium">Invalid code</span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Selected Course Price Display */}
        {selectedCourse && paymentData.classFormat && (
          <div className="bg-gradient-to-r from-[#02033e]/10 to-blue-50 p-8 rounded-2xl border border-[#02033e]/20 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full transform translate-x-8 -translate-y-8"></div>
            
            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Course Price Preview</h3>
              
              {/* Price Display with Discount Preview */}
              <div className="space-y-2">
                {paymentData.voucherCode && validateVoucher(paymentData.voucherCode) && (
                  <div className="text-2xl text-gray-500 line-through">
                    {formatCurrency(coursePrice)}
                  </div>
                )}
                
                <div className="text-4xl font-bold text-[#02033e]">
                  {paymentData.voucherCode && validateVoucher(paymentData.voucherCode) 
                    ? formatCurrency(coursePrice - (coursePrice * (vouchers[paymentData.voucherCode]?.discount || 0)))
                    : formatCurrency(coursePrice)
                  }
                </div>
                
                {paymentData.voucherCode && validateVoucher(paymentData.voucherCode) && (
                  <div className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                    <span className="mr-1">🎉</span>
                    {Math.round((vouchers[paymentData.voucherCode]?.discount || 0) * 100)}% Discount Applied
                  </div>
                )}
              </div>
              
              <p className="text-gray-600 capitalize">
                {selectedCourse.name} - {paymentData.classFormat} format
              </p>
              
              {/* Payment Plan Preview */}
              {paymentData.paymentPlan !== 'full' && (
                <div className="mt-4 p-4 bg-white/50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">Payment Plan: {getPaymentPlanDescription()}</p>
                  <div className="text-lg font-semibold text-[#02033e]">
                    First Payment: {formatCurrency(
                      paymentData.paymentPlan === 'installment_2' 
                        ? Math.round((paymentData.voucherCode && validateVoucher(paymentData.voucherCode) 
                            ? coursePrice - (coursePrice * (vouchers[paymentData.voucherCode]?.discount || 0))
                            : coursePrice) * 0.5)
                        : Math.round((paymentData.voucherCode && validateVoucher(paymentData.voucherCode) 
                            ? coursePrice - (coursePrice * (vouchers[paymentData.voucherCode]?.discount || 0))
                            : coursePrice) * 0.34)
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Student Policy Agreement */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            Student Policy
          </h3>
          
          <div className="mb-4">
            <p className="text-gray-700 mb-3">
              Students are advised to read Pluralcode's Student policy in order to be fully informed about standards and policies of the institution. You can read more by clicking the link below.
            </p>
            
            <a
              href="https://pluralcode.academy/student-policy"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm font-medium"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Read Student Policy
            </a>
          </div>
          
          <label className={`flex items-start space-x-3 cursor-pointer p-4 border-2 rounded-lg transition-all duration-200 ${
            agreedToPolicy 
              ? 'border-blue-300 bg-blue-50' 
              : showErrors && errors.policy 
                ? 'border-red-300 bg-red-50' 
                : 'border-gray-200 bg-white hover:border-blue-200'
          }`}>
            <input
              type="checkbox"
              checked={agreedToPolicy}
              onChange={(e) => {
                setAgreedToPolicy(e.target.checked);
                if (e.target.checked) {
                  setErrors(prev => ({ ...prev, policy: '' }));
                  setShowErrors(false);
                }
              }}
              className="mt-1 w-5 h-5 text-blue-600 border-2 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div className="flex-1">
              <span className="text-gray-800 font-medium">
                By checking this box, you have read and agreed with Pluralcode's student policy.
              </span>
              {showErrors && errors.policy && (
                <div className="mt-2 p-2 bg-red-100 border border-red-200 rounded text-red-600 text-sm">
                  {errors.policy}
                </div>
              )}
            </div>
          </label>
        </div>
        {/* Navigation Buttons */}
        <div className="flex justify-between pt-8">
          <button
            type="button"
            onClick={handleBack}
            className="flex items-center px-8 py-4 bg-gray-500 text-white font-semibold rounded-xl hover:bg-gray-600 transition-all duration-200 shadow-lg"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Back
          </button>
          <button
            type="submit"
            className={`flex items-center px-8 py-4 font-semibold rounded-xl transition-all duration-200 shadow-lg ${
              !paymentData.courseId || !paymentData.cohort || !agreedToPolicy
                ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                : 'bg-[#02033e] text-white hover:bg-[#02033e]/90'
            }`}
          >
            Continue to Payment
            <ArrowRightIcon className="h-5 w-5 ml-2" />
          </button>
        </div>
        
        {/* Summary of missing fields */}
        {showErrors && Object.keys(errors).length > 0 && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <h4 className="text-red-800 font-medium mb-2 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              Please complete the following required fields:
            </h4>
            <ul className="text-red-700 text-sm space-y-1">
              {Object.entries(errors).map(([field, message]) => (
                <li key={field}>• {message}</li>
              ))}
            </ul>
          </div>
        )}
      </form>
    </div>
  );
};

export default CourseSelectionStep;