import React, { createContext, useContext, useState, useMemo } from 'react';
import { usePaystackPayment } from 'react-paystack';

interface Course {
  id: string;
  name: string;
  virtualPrice: number;
  physicalPrice: number;
}

// These values are no longer needed in the state itself
interface PaymentData {
  // Step 1 - Student Info
  fullName: string;
  email: string;
  phone: string;
  highestAchievement: string;
  ageRange: string;
  country: string;
  state: string;
  
  // Step 2 - Course Selection
  classFormat: 'virtual' | 'physical';
  courseId: string;
  cohort: string;
  paymentPlan: 'full' | 'installment_2' | 'installment_3';
  voucherCode: string;
}

interface PaymentContextType {
  currentStep: number;
  setCurrentStep: (step: number) => void;
  paymentData: PaymentData;
  updatePaymentData: (data: Partial<PaymentData>) => void;
  courses: Course[];
  vouchers: { [key: string]: { discount: number; used: boolean } };
  validateVoucher: (code: string) => boolean;
  submitPayment: () => Promise<boolean>;
  initializePayment: (onSuccess: () => void, onClose: () => void) => void;
  // Expose the calculated values
  totalAmount: number;
  discountAmount: number;
  finalAmount: number;
  currentPayment: number;
}

const PaymentContext = createContext<PaymentContextType | undefined>(undefined);

export const courses: Course[] = [
  { id: 'frontend', name: 'Web Dev (Frontend)', virtualPrice: 100000, physicalPrice: 150000 },
  { id: 'backend', name: 'Web Dev (Backend)', virtualPrice: 150000, physicalPrice: 200000 },
  { id: 'cybersecurity', name: 'Cybersecurity', virtualPrice: 200000, physicalPrice: 250000 },
  { id: 'web3', name: 'Web3', virtualPrice: 100000, physicalPrice: 150000 },
  { id: 'data_analysis', name: 'Data Analysis', virtualPrice: 200000, physicalPrice: 250000 },
  { id: 'ui_ux', name: 'Product Design (UI/UX)', virtualPrice: 150000, physicalPrice: 180000 },
];

const initialPaymentData: PaymentData = {
  fullName: '',
  email: '',
  phone: '',
  highestAchievement: '',
  ageRange: '',
  country: 'Nigeria',
  state: 'Lagos',
  classFormat: 'virtual',
  courseId: 'frontend',
  cohort: 'August 2024',
  paymentPlan: 'full',
  voucherCode: '',
};

export const PaymentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [paymentData, setPaymentData] = useState<PaymentData>(initialPaymentData);
  const [transactionRef] = useState((new Date()).getTime().toString());
  
  const vouchers = {
    'WELCOME20': { discount: 0.2, used: false },
    'STUDENT15': { discount: 0.15, used: false },
    'EARLY10': { discount: 0.1, used: false },
    'NEWSTUDENT': { discount: 0.25, used: false },
    'EARLYBIRD': { discount: 0.3, used: false },
  };

  const updatePaymentData = (data: Partial<PaymentData>) => {
    setPaymentData(prev => ({ ...prev, ...data }));
  };
  
  // ✅ FIX: Calculate derived state with useMemo instead of useEffect
  const { totalAmount, discountAmount, finalAmount, currentPayment } = useMemo(() => {
    const course = courses.find(c => c.id === paymentData.courseId);
    if (!course) return { totalAmount: 0, discountAmount: 0, finalAmount: 0, currentPayment: 0 };

    const basePrice = paymentData.classFormat === 'virtual' ? course.virtualPrice : course.physicalPrice;
    
    let discount = 0;
    if (paymentData.voucherCode && vouchers[paymentData.voucherCode] && !vouchers[paymentData.voucherCode].used) {
      discount = basePrice * vouchers[paymentData.voucherCode].discount;
    }

    const final = basePrice - discount;
    
    let current = final;
    if (paymentData.paymentPlan === 'installment_2') {
      current = Math.round(final * 0.5);
    } else if (paymentData.paymentPlan === 'installment_3') {
      current = Math.round(final * 0.34);
    }
    
    return {
        totalAmount: basePrice,
        discountAmount: discount,
        finalAmount: final,
        currentPayment: current
    };
  }, [paymentData.courseId, paymentData.classFormat, paymentData.paymentPlan, paymentData.voucherCode]);

  const validateVoucher = (code: string): boolean => {
    return !!(vouchers[code] && !vouchers[code].used);
  };

  const submitPayment = async (): Promise<boolean> => {
    const fullPaymentDetails = {
        ...paymentData,
        totalAmount,
        discountAmount,
        finalAmount,
        currentPayment
    };
    
    console.log("Saving payment data to localStorage...", fullPaymentDetails);
    const existingPayments = JSON.parse(localStorage.getItem('payments') || '[]');
    const newPayment = {
      id: Date.now().toString(),
      ...fullPaymentDetails,
      createdAt: new Date().toISOString(),
      status: 'completed',
    };
    
    existingPayments.push(newPayment);
    localStorage.setItem('payments', JSON.stringify(existingPayments));
    
    if (paymentData.voucherCode && vouchers[paymentData.voucherCode]) {
      vouchers[paymentData.voucherCode].used = true;
    }
    
    return true;
  };
  
  const paystackConfig = useMemo(() => ({
    reference: transactionRef,
    email: paymentData.email,
    amount: Math.round(currentPayment * 100), // Amount in kobo
    publicKey: process.env.REACT_APP_PAYSTACK_PUBLIC_KEY || 'YOUR_PAYSTACK_PUBLIC_KEY',
  }), [transactionRef, paymentData.email, currentPayment]);

  const paystackHook = usePaystackPayment(paystackConfig);

  const initializePayment = (onSuccess: () => void, onClose: () => void) => {
    paystackHook(onSuccess, onClose);
  };

  return (
    <PaymentContext.Provider value={{
      currentStep,
      setCurrentStep,
      paymentData,
      updatePaymentData,
      courses,
      vouchers,
      validateVoucher,
      submitPayment,
      initializePayment,
      totalAmount,
      discountAmount,
      finalAmount,
      currentPayment,
    }}>
      {children}
    </PaymentContext.Provider>
  );
};

export const usePayment = () => {
  const context = useContext(PaymentContext);
  if (context === undefined) {
    throw new Error('usePayment must be used within a PaymentProvider');
  }
  return context;
};