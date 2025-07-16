import React from 'react';
import { Link } from 'react-router-dom';
import { CodeBracketIcon, AcademicCapIcon, CreditCardIcon, ChartBarIcon } from '@heroicons/react/24/outline';

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-600 via-blue-600 to-indigo-800">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-8">
            <CodeBracketIcon className="h-16 w-16 text-white mr-4 animate-float" />
            <h1 className="text-6xl font-bold text-white">Jekacode</h1>
          </div>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            Transform your career with our comprehensive tech bootcamp programs. 
            Learn from industry experts and build real-world projects.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center hover:bg-white/20 transition-all duration-300">
            <AcademicCapIcon className="h-12 w-12 text-blue-200 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Expert Instructors</h3>
            <p className="text-blue-100">Learn from industry professionals with years of experience</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center hover:bg-white/20 transition-all duration-300">
            <CreditCardIcon className="h-12 w-12 text-green-200 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Flexible Payment</h3>
            <p className="text-blue-100">Choose from full payment or installment plans that work for you</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center hover:bg-white/20 transition-all duration-300">
            <ChartBarIcon className="h-12 w-12 text-purple-200 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Career Growth</h3>
            <p className="text-blue-100">94% of our graduates land jobs within 6 months</p>
          </div>
        </div>

        <div className="text-center">
          <Link
            to="/payment"
            className="inline-flex items-center px-8 py-4 bg-white text-[#02033e] font-semibold rounded-lg hover:bg-blue-50 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl border-2 border-white"
          >
            <CreditCardIcon className="h-6 w-6 mr-2 text-[#02033e]" />
            Start Your Journey
          </Link>
          
          <div className="mt-8">
            <Link
              to="/admin/login"
              className="text-blue-200 hover:text-white transition-colors duration-200"
            >
              Admin Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;