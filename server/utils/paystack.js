const axios = require('axios');

const PAYSTACK_BASE_URL = 'https://api.paystack.co';

const paystackApi = axios.create({
  baseURL: PAYSTACK_BASE_URL,
  headers: {
    'Authorization': `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
    'Content-Type': 'application/json'
  }
});

const initializePayment = async (paymentData) => {
  try {
    const response = await paystackApi.post('/transaction/initialize', {
      email: paymentData.email,
      amount: paymentData.amount * 100, // Convert to kobo
      currency: 'NGN',
      reference: paymentData.reference,
      callback_url: `${process.env.VITE_APP_URL}/payment-success`,
      metadata: {
        student_id: paymentData.studentId,
        course_id: paymentData.courseId,
        payment_plan: paymentData.paymentPlan
      }
    });

    return response.data;
  } catch (error) {
    console.error('Paystack initialization error:', error.response?.data || error.message);
    throw new Error('Payment initialization failed');
  }
};

const verifyPayment = async (reference) => {
  try {
    const response = await paystackApi.get(`/transaction/verify/${reference}`);
    return response.data;
  } catch (error) {
    console.error('Paystack verification error:', error.response?.data || error.message);
    throw new Error('Payment verification failed');
  }
};

const createPlan = async (planData) => {
  try {
    const response = await paystackApi.post('/plan', {
      name: planData.name,
      interval: planData.interval, // monthly, quarterly, etc.
      amount: planData.amount * 100, // Convert to kobo
      currency: 'NGN'
    });

    return response.data;
  } catch (error) {
    console.error('Paystack plan creation error:', error.response?.data || error.message);
    throw new Error('Plan creation failed');
  }
};

const createSubscription = async (subscriptionData) => {
  try {
    const response = await paystackApi.post('/subscription', {
      customer: subscriptionData.customer,
      plan: subscriptionData.plan,
      authorization: subscriptionData.authorization
    });

    return response.data;
  } catch (error) {
    console.error('Paystack subscription error:', error.response?.data || error.message);
    throw new Error('Subscription creation failed');
  }
};

module.exports = {
  initializePayment,
  verifyPayment,
  createPlan,
  createSubscription
};