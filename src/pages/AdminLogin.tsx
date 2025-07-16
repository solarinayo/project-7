import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '../contexts/AdminContext';
import { LockClosedIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

const AdminLogin: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginMode, setLoginMode] = useState<'legacy' | 'username'>('username');
  const [error, setError] = useState('');
  const { login, loginWithUsername } = useAdmin();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    let success = false;
    if (loginMode === 'legacy') {
      success = login(password);
    } else {
      success = loginWithUsername(username, password);
    }
    
    if (success) {
      navigate('/admin');
    } else {
      setError(loginMode === 'legacy' ? 'Invalid password. Please try again.' : 'Invalid username or password. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-600 to-blue-600 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <LockClosedIcon className="h-12 w-12 text-primary-600 animate-float" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Admin Login</h1>
          <p className="text-gray-600">Enter your password to access the admin panel</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-center mb-4">
            <div className="bg-gray-100 p-1 rounded-lg">
              <button
                type="button"
                onClick={() => setLoginMode('username')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  loginMode === 'username' 
                    ? 'bg-white text-primary-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Username Login
              </button>
              <button
                type="button"
                onClick={() => setLoginMode('legacy')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  loginMode === 'legacy' 
                    ? 'bg-white text-primary-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Legacy Login
              </button>
            </div>
          </div>

          {loginMode === 'username' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent transition-all duration-200"
                placeholder="Enter your username"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent transition-all duration-200"
                placeholder="Enter admin password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? (
                  <EyeSlashIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="text-red-600 text-sm text-center">{error}</div>
          )}

          <button
            type="submit"
            className="w-full px-4 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-all duration-200 transform hover:scale-105"
          >
            Login
          </button>
        </form>

        <div className="mt-8 text-center">
          <div className="bg-gray-100 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">Demo Credentials:</p>
            <div className="space-y-2">
              <div>
                <p className="text-xs text-gray-500">Username Login:</p>
                <p className="text-sm font-mono bg-gray-200 px-2 py-1 rounded">superadmin / admin123</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Legacy Login:</p>
                <p className="text-sm font-mono bg-gray-200 px-2 py-1 rounded">admin123</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;