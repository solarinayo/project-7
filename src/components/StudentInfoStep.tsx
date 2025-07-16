import React, { useState } from 'react';
import { usePayment } from '../contexts/PaymentContext';
import { ArrowRightIcon, CheckIcon } from '@heroicons/react/24/outline';

// --- STABLE COMPONENT DEFINITIONS (Fixes typing/focus issue) ---

const InputField = ({ 
  label, 
  type = 'text', 
  value, 
  onChange, 
  placeholder, 
  required = false, 
  error, 
  name,
  focusedField,
  setFocusedField 
}: any) => (
  <div className="space-y-3 animate-slide-in-up">
    <label className="block text-sm font-bold text-gray-800 tracking-wide">
      {label} {required && <span className="text-red-500 animate-pulse">*</span>}
    </label>
    <div className="relative group">
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        onFocus={() => setFocusedField(name)}
        onBlur={() => setFocusedField('')}
        className={`w-full px-4 py-4 border-2 rounded-2xl transition-all duration-300 text-base font-medium placeholder-gray-400
          ${error 
            ? 'border-red-400 bg-red-50 focus:border-red-500 focus:ring-4 focus:ring-red-500/20 shadow-lg' 
            : focusedField === name
              ? 'border-blue-500 bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-500/20 shadow-lg transform scale-105'
              : 'border-gray-200 bg-gray-50/50 hover:border-blue-300 hover:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 hover:shadow-md'
          } focus:outline-none backdrop-blur-sm`}
        placeholder={placeholder}
        required={required}
      />
      {focusedField === name && !error && (
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
          <div className="w-3 h-3 bg-blue-500 rounded-full animate-ping"></div>
        </div>
      )}
      {value && !error && focusedField !== name && (
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
          <CheckIcon className="w-5 h-5 text-green-500" />
        </div>
      )}
    </div>
    {error && (
      <div className="flex items-center space-x-2 text-red-600 text-sm animate-slide-in-up bg-red-50 p-3 rounded-xl border border-red-200">
        <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
        <span className="font-semibold">{error}</span>
      </div>
    )}
  </div>
);

const SelectField = ({ 
  label, 
  value, 
  onChange, 
  options, 
  placeholder, 
  error, 
  name,
  focusedField,
  setFocusedField 
}: any) => (
  <div className="space-y-3 animate-slide-in-up">
    <label className="block text-sm font-bold text-gray-800 tracking-wide">{label}</label>
    <div className="relative group">
      <select
        name={name}
        value={value}
        onChange={onChange}
        onFocus={() => setFocusedField(name)}
        onBlur={() => setFocusedField('')}
        className={`w-full px-4 py-4 border-2 rounded-2xl transition-all duration-300 text-base font-medium appearance-none bg-white cursor-pointer
          ${error ? 'border-red-400 bg-red-50 focus:border-red-500 focus:ring-4 focus:ring-red-500/20 shadow-lg' : focusedField === name ? 'border-blue-500 focus:border-blue-600 focus:ring-4 focus:ring-blue-500/20 shadow-lg transform scale-105' : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 hover:shadow-md'} focus:outline-none backdrop-blur-sm`}
      >
        <option value="" className="text-gray-400">{placeholder}</option>
        {options.map((option: string) => (<option key={option} value={option} className="text-gray-800 font-medium">{option}</option>))}
      </select>
      <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
        <svg className={`w-5 h-5 transition-all duration-300 ${focusedField === name ? 'text-blue-500 rotate-180' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
      </div>
      {value && !error && <div className="absolute right-12 top-1/2 transform -translate-y-1/2 pointer-events-none"><CheckIcon className="w-5 h-5 text-green-500" /></div>}
    </div>
    {error && (
      <div className="flex items-center space-x-2 text-red-600 text-sm animate-slide-in-up bg-red-50 p-3 rounded-xl border border-red-200">
        <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
        <span className="font-semibold">{error}</span>
      </div>
    )}
  </div>
);


// --- MAIN COMPONENT ---

const StudentInfoStep: React.FC = () => {
  const { paymentData, updatePaymentData, setCurrentStep } = usePayment();
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [focusedField, setFocusedField] = useState<string>('');

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!paymentData.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!paymentData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(paymentData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!paymentData.phone.trim()) newErrors.phone = 'Phone number is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setCurrentStep(2);
    }
  };

  const achievements = ['High School', 'Diploma', 'Bachelor\'s Degree', 'Master\'s Degree', 'PhD', 'Professional Certificate'];
  const ageRanges = ['16-20', '21-25', '26-30', '31-35', '36-40', '41+'];
  const nigerianStates = ['Lagos', 'Abuja', 'Kano', 'Ibadan', 'Port Harcourt', 'Benin City', 'Kaduna', 'Maiduguri', 'Zaria', 'Aba', 'Jos', 'Ilorin', 'Oyo', 'Enugu', 'Abeokuta', 'Sokoto', 'Onitsha', 'Warri'];

  return (
    <div className="space-y-8">
      <div className="text-center animate-fade-in-scale">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-3xl mb-6 shadow-lg">
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
        </div>
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-3 tracking-tight">Student Information</h2>
        <p className="text-gray-600 text-lg sm:text-xl font-medium">Let's get to know you better</p>
        <div className="w-32 h-1.5 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mx-auto mt-6"></div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          <InputField label="Full Name" name="fullName" value={paymentData.fullName} onChange={(e: any) => { updatePaymentData({ fullName: e.target.value }); setErrors(prev => ({ ...prev, fullName: '' })); }} placeholder="Enter your full name" required error={errors.fullName} focusedField={focusedField} setFocusedField={setFocusedField} />
          <InputField label="Email Address" name="email" type="email" value={paymentData.email} onChange={(e: any) => { updatePaymentData({ email: e.target.value }); setErrors(prev => ({ ...prev, email: '' })); }} placeholder="Enter your email address" required error={errors.email} focusedField={focusedField} setFocusedField={setFocusedField} />
          
          {/* Corrected Phone Number Input */}
          <div className="space-y-3 animate-slide-in-up">
            <label className="block text-sm font-bold text-gray-800 tracking-wide">Phone Number <span className="text-red-500">*</span></label>
            <div className="relative group">
              <div className={`flex items-center w-full border-2 rounded-2xl transition-all duration-300 ${errors.phone ? 'border-red-400 bg-red-50 focus-within:border-red-500 focus-within:ring-2 focus-within:ring-red-200' : focusedField === 'phone' ? 'border-blue-500 bg-white ring-2 ring-blue-200' : 'border-gray-200 bg-gray-50/50 hover:border-blue-300'}`}>
                <div className="flex items-center space-x-2 pl-4 pr-3 pointer-events-none">
                  <div className="w-7 h-5 rounded-sm overflow-hidden border border-gray-300"><div className="h-full flex"><div className="w-1/3 h-full bg-green-600"></div><div className="w-1/3 h-full bg-white"></div><div className="w-1/3 h-full bg-green-600"></div></div></div>
                  <span className="text-gray-700 font-semibold text-base">+234</span>
                  <div className="w-px h-6 bg-gray-300"></div>
                </div>
                <input type="tel" name="phone" value={paymentData.phone} onChange={(e) => { updatePaymentData({ phone: e.target.value }); setErrors(prev => ({ ...prev, phone: '' })); }} onFocus={() => setFocusedField('phone')} onBlur={() => setFocusedField('')} className="flex-grow py-4 pr-12 text-base font-medium placeholder-gray-400 focus:outline-none bg-transparent" placeholder="808 777 5678" required />
              </div>
              {focusedField === 'phone' && !errors.phone && <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none"><div className="w-3 h-3 bg-blue-500 rounded-full animate-ping"></div></div>}
              {paymentData.phone && !errors.phone && focusedField !== 'phone' && <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none"><CheckIcon className="w-5 h-5 text-green-500" /></div>}
            </div>
            {errors.phone && (<div className="flex items-center space-x-2 text-red-600 text-sm animate-slide-in-up bg-red-50 p-3 rounded-xl border border-red-200"><svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg><span className="font-semibold">{errors.phone}</span></div>)}
          </div>

          <SelectField label="Highest Academic Achievement" name="achievement" value={paymentData.highestAchievement} onChange={(e: any) => updatePaymentData({ highestAchievement: e.target.value })} options={achievements} placeholder="Select your achievement" focusedField={focusedField} setFocusedField={setFocusedField} />
          <SelectField label="Age Range" name="ageRange" value={paymentData.ageRange} onChange={(e: any) => updatePaymentData({ ageRange: e.target.value })} options={ageRanges} placeholder="Select your age range" focusedField={focusedField} setFocusedField={setFocusedField} />
          <SelectField label="State" name="state" value={paymentData.state} onChange={(e: any) => updatePaymentData({ state: e.target.value })} options={nigerianStates} placeholder="Select your state" focusedField={focusedField} setFocusedField={setFocusedField} />
        </div>

        <div className="flex items-center justify-center space-x-3 py-6">
          <div className="w-12 h-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"></div>
          <div className="w-12 h-3 bg-gray-200 rounded-full"></div>
          <div className="w-12 h-3 bg-gray-200 rounded-full"></div>
        </div>
        
        <div className="flex flex-col sm:flex-row justify-end items-center gap-4 pt-8">
          <button type="submit" disabled={!paymentData.fullName || !paymentData.email || !paymentData.phone} className={`group relative inline-flex items-center justify-center overflow-hidden px-8 py-4 font-bold rounded-2xl transition-all duration-300 transform shadow-lg text-lg w-full sm:w-auto 
            ${!paymentData.fullName || !paymentData.email || !paymentData.phone 
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
              // --- REWRITTEN BUTTON STYLES ---
              : 'text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 hover:scale-105'
            }`}>
            <span className="mr-3">Continue</span>
            <ArrowRightIcon className="h-6 w-6 transition-transform duration-300 transform group-hover:translate-x-2" />
          </button>
        </div>

        {paymentData.fullName && paymentData.email && paymentData.phone && (
          <div className="flex items-center justify-center space-x-3 text-green-700 animate-slide-in-up bg-green-100 p-4 rounded-2xl border border-green-200">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center"><CheckIcon className="w-5 h-5 text-white" /></div>
            <span className="font-bold text-lg">Ready to continue!</span>
          </div>
        )}
      </form>
    </div>
  );
};

export default StudentInfoStep;