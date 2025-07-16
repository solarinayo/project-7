import React, { createContext, useContext, useState, useMemo } from 'react';
import { usePaystackPayment } from 'react-paystack';
import { courses, Course } from '../data/courses';

// --- INTERFACES & INITIAL DATA (No changes needed) ---
interface PaymentData {
  applicantId?: string;
  fullName: string;
  email: string;
  phone: string;
  highestAchievement: string;
  ageRange: string;
  country: string;
  state: string;
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
  submitPayment: (paystackResponse: any) => Promise<{ success: boolean; data?: any }>;
  initializePayment: (onSuccess: (response: any) => void, onClose: () => void) => void;
  totalAmount: number;
  discountAmount: number;
  finalAmount: number;
  currentPayment: number;
}

const PaymentContext = createContext<PaymentContextType | undefined>(undefined);

const initialPaymentData: PaymentData = {
  fullName: '', email: '', phone: '', highestAchievement: '', ageRange: '',
  country: 'Nigeria', state: 'Lagos', classFormat: 'virtual', courseId: 'frontend',
  cohort: 'August 2024', paymentPlan: 'full', voucherCode: '',
};

export const PaymentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [paymentData, setPaymentData] = useState<PaymentData>(initialPaymentData);
  
  const vouchers = {
    'WELCOME20': { discount: 0.2, used: false },
    'STUDENT15': { discount: 0.15, used: false },
  };

  const updatePaymentData = (data: Partial<PaymentData>) => {
    setPaymentData(prev => ({ ...prev, ...data }));
  };
  
  const { totalAmount, discountAmount, finalAmount, currentPayment } = useMemo(() => {
    const course = courses.find(c => c.id === paymentData.courseId);
    if (!course) return { totalAmount: 0, discountAmount: 0, finalAmount: 0, currentPayment: 0 };
    const basePrice = paymentData.classFormat === 'virtual' ? course.virtualPrice : course.physicalPrice;
    let discount = 0;
    const voucher = vouchers[paymentData.voucherCode as keyof typeof vouchers];
    if (paymentData.voucherCode && voucher && !voucher.used) {
      discount = basePrice * voucher.discount;
    }
    const final = basePrice - discount;
    let current = final;
    if (paymentData.paymentPlan === 'installment_2') current = Math.round(final * 0.5);
    else if (paymentData.paymentPlan === 'installment_3') current = Math.round(final * 0.34);
    return { totalAmount: basePrice, discountAmount: discount, finalAmount: final, currentPayment: current };
  }, [paymentData.courseId, paymentData.classFormat, paymentData.paymentPlan, paymentData.voucherCode]);

  const validateVoucher = (code: string): boolean => !!(vouchers[code] && !vouchers[code].used);

  const submitPayment = async (paystackResponse: any): Promise<{ success: boolean; data?: any }> => {
    const courseName = courses.find(c => c.id === paymentData.courseId)?.name || 'Unknown Course';
    const fullPaymentDetails = {
        ...paymentData, courseName, totalAmount, discountAmount,
        finalAmount, currentPayment, paystackReference: paystackResponse.reference,
    };
    try {
      console.log('✅ Submitting enrollment data to server:', JSON.stringify(fullPaymentDetails, null, 2));
      const response = await fetch(`${import.meta.env.VITE_API_URL}/students/enroll`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fullPaymentDetails),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Enrollment failed.');
      console.log('✅ Enrollment successful:', result);
      updatePaymentData({ applicantId: result.student.applicantId });
      return { success: true, data: result.student };
    } catch (error) {
      console.error("❌ Payment submission error:", error);
      return { success: false };
    }
  };
  
  // ✅ FIX: The Paystack config is now stable. It no longer includes a 'reference' key,
  // which was being regenerated and causing the hook to become unstable.
  const paystackConfig = {
    email: paymentData.email,
    amount: Math.round(currentPayment * 100),
    publicKey: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || '',
    metadata: {
        name: paymentData.fullName,
        phone: paymentData.phone,
        course: courses.find(c => c.id === paymentData.courseId)?.name || 'N/A'
    }
  };

  const paystackHook = usePaystackPayment(paystackConfig);

  const initializePayment = (onSuccess: (response: any) => void, onClose: () => void) => {
    if (!paystackConfig.publicKey) {
        alert("Payment gateway is not configured. Please contact support.");
        onClose();
        return;
    }
    if (!paystackConfig.email) {
        alert("Email is required to make a payment. Please go back to Step 1.");
        onClose();
        return;
    }
    paystackHook(onSuccess, onClose);
  };

  return (
    <PaymentContext.Provider value={{
      currentStep, setCurrentStep, paymentData, updatePaymentData,
      courses, vouchers, validateVoucher, submitPayment, initializePayment,
      totalAmount, discountAmount, finalAmount, currentPayment,
    }}>
      {children}
    </PaymentContext.Provider>
  );
};

export const usePayment = () => {
  const context = useContext(PaymentContext);
  if (!context) throw new Error('usePayment must be used within an AdminProvider');
  return context;
};