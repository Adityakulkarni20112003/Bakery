import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import { Eye, EyeOff, Coffee, User, ShieldCheck } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../services/api';

const Login: React.FC = () => {
  // Active tab state for signup/login
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  
  // Unified login form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginType, setLoginType] = useState<'user' | 'admin'>('user');
  
  // Signup form state
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSignupSubmitting, setIsSignupSubmitting] = useState(false);
  const [signupError, setSignupError] = useState('');
  
  const { login, adminLogin, error } = useAuth();
  const navigate = useNavigate();
  
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      if (loginType === 'admin') {
        console.log('Attempting admin login with:', { email, password });
        await adminLogin(email, password);
        console.log('Admin login successful, navigating to /admin');
        navigate('/admin');
      } else {
        await login(email, password);
        navigate('/dashboard');
      }
    } catch (err) {
      console.error(`${loginType === 'admin' ? 'Admin' : 'User'} login failed:`, err);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSignupSubmitting(true);
    setSignupError('');
    
    // Validate passwords match
    if (signupPassword !== signupConfirmPassword) {
      setSignupError('Passwords do not match');
      setIsSignupSubmitting(false);
      return;
    }
    
    // Validate password strength
    if (signupPassword.length < 8) {
      setSignupError('Password must be at least 8 characters long');
      setIsSignupSubmitting(false);
      return;
    }
    
    try {
      // Call signup API using api service
      const response = await api.post('/users/register', {
        name: signupName,
        email: signupEmail,
        password: signupPassword,
      });
      
      const { success, message } = response.data;
      
      if (!success) {
        throw new Error(message || 'Registration failed');
      }
      
      // Show success message
      toast.success('Registration successful! Please sign in.');
      
      // On successful signup, switch to login tab
      setActiveTab('login');
      // Pre-fill login form with signup credentials
      setEmail(signupEmail);
      setPassword('');
      
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Registration failed';
      setSignupError(errorMessage);
      toast.error(errorMessage);
      console.error('Signup failed:', err);
    } finally {
      setIsSignupSubmitting(false);
    }
  };
  
  // Clear any errors when switching tabs
  useEffect(() => {
    setSignupError('');
  }, [activeTab]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-cream py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-card">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Coffee size={32} className="text-primary-600" />
          </div>
          <h2 className="font-serif text-3xl font-bold text-gray-800">
            {activeTab === 'login' ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="mt-2 text-gray-600">
            {activeTab === 'login' ? 'Sign in to your account' : 'Fill in your details to get started'}
          </p>
        </div>
        

        
        {/* Tab navigation */}
        <div className="flex border-b border-gray-200 mb-6">
          <button
            className={`flex-1 py-2 px-4 text-center ${activeTab === 'login' ? 'border-b-2 border-primary-500 text-primary-600 font-medium' : 'text-gray-500'}`}
            onClick={() => setActiveTab('login')}
          >
            Sign In
          </button>
          <button
            className={`flex-1 py-2 px-4 text-center ${activeTab === 'signup' ? 'border-b-2 border-primary-500 text-primary-600 font-medium' : 'text-gray-500'}`}
            onClick={() => setActiveTab('signup')}
          >
            Sign Up
          </button>
        </div>
        
        {/* Login Form */}
        {activeTab === 'login' ? (
          <>
            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md">
                {error}
              </div>
            )}
            
            {/* Login Type Toggle */}
            <div className="flex mb-4 bg-gray-100 p-1 rounded-md">
              <button
                type="button"
                onClick={() => setLoginType('user')}
                className={`flex items-center justify-center flex-1 py-2 px-3 rounded ${loginType === 'user' ? 'bg-white shadow-sm' : 'text-gray-600'}`}
              >
                <User size={16} className="mr-2" />
                User
              </button>
              <button
                type="button"
                onClick={() => setLoginType('admin')}
                className={`flex items-center justify-center flex-1 py-2 px-3 rounded ${loginType === 'admin' ? 'bg-white shadow-sm' : 'text-gray-600'}`}
              >
                <ShieldCheck size={16} className="mr-2" />
                Admin
              </button>
            </div>
            
            <form className="space-y-6" onSubmit={handleLoginSubmit}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary-500 focus:outline-none focus:ring-primary-500"
                  placeholder={loginType === 'admin' ? 'Admin Email' : 'User Email'}
                />
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="relative mt-1">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary-500 focus:outline-none focus:ring-primary-500"
                    placeholder={loginType === 'admin' ? 'Admin Password' : 'User Password'}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff size={16} className="text-gray-400" />
                    ) : (
                      <Eye size={16} className="text-gray-400" />
                    )}
                  </button>
                </div>
              </div>
              
              <div>
                <div className="relative group rounded-lg overflow-hidden"> {/* Shine effect wrapper */}
                  <Button
                    type="submit"
                    variant="primary"
                    fullWidth
                    loading={isSubmitting}
                  >
                    {loginType === 'admin' ? 'Sign In as Admin' : 'Sign In'}
                  </Button>
                  <span className="absolute top-0 right-0 w-12 h-full bg-white/20 skew-x-[-20deg] transform translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-out pointer-events-none"></span>
                </div>
              </div>
            </form>
            
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <button 
                  onClick={() => setActiveTab('signup')} 
                  className="font-medium text-primary-600 hover:text-primary-500"
                >
                  Sign up
                </button>
              </p>
            </div>
          </>
        ) : (
          /* Sign Up Form */
          <>
            {signupError && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md">
                {signupError}
              </div>
            )}
            
            <form className="space-y-6" onSubmit={handleSignupSubmit}>
              <div>
                <label htmlFor="signupName" className="block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <input
                  id="signupName"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  value={signupName}
                  onChange={(e) => setSignupName(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary-500 focus:outline-none focus:ring-primary-500"
                />
              </div>
              
              <div>
                <label htmlFor="signupEmail" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  id="signupEmail"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary-500 focus:outline-none focus:ring-primary-500"
                />
              </div>
              
              <div>
                <label htmlFor="signupPassword" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="relative mt-1">
                  <input
                    id="signupPassword"
                    name="password"
                    type={showSignupPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    className="block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary-500 focus:outline-none focus:ring-primary-500"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowSignupPassword(!showSignupPassword)}
                  >
                    {showSignupPassword ? (
                      <EyeOff size={16} className="text-gray-400" />
                    ) : (
                      <Eye size={16} className="text-gray-400" />
                    )}
                  </button>
                </div>
              </div>
              
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Confirm Password
                </label>
                <div className="relative mt-1">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={signupConfirmPassword}
                    onChange={(e) => setSignupConfirmPassword(e.target.value)}
                    className="block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary-500 focus:outline-none focus:ring-primary-500"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={16} className="text-gray-400" />
                    ) : (
                      <Eye size={16} className="text-gray-400" />
                    )}
                  </button>
                </div>
              </div>
              
              <div>
                <div className="relative group rounded-lg overflow-hidden"> {/* Shine effect wrapper */}
                  <Button
                    type="submit"
                    variant="primary"
                    fullWidth
                    loading={isSignupSubmitting}
                  >
                    Create Account
                  </Button>
                  <span className="absolute top-0 right-0 w-12 h-full bg-white/20 skew-x-[-20deg] transform translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-out pointer-events-none"></span>
                </div>
              </div>
            </form>
            
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <button 
                  onClick={() => setActiveTab('login')} 
                  className="font-medium text-primary-600 hover:text-primary-500"
                >
                  Sign in
                </button>
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Login;