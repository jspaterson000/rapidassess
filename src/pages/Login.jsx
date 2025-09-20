import React, { useState } from 'react';
import { User } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ClipboardCheck, Loader2, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { logger } from '@/lib/logger';

export default function LoginPage({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showRegister, setShowRegister] = useState(false);
  const [registerData, setRegisterData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    phone: ''
  });

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await User.login({ email, password });
      logger.auditLog('successful_login', { email });
      onLoginSuccess();
    } catch (error) {
      console.error('Login failed:', error);
      setError(error.message || 'Invalid email or password. Please try again.');
      logger.error('Login failed', { email, error: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (registerData.password !== registerData.confirmPassword) {
        throw new Error('Passwords do not match');
      }

      await User.register({
        email: registerData.email,
        password: registerData.password,
        fullName: registerData.fullName,
        phone: registerData.phone
      });

      logger.auditLog('successful_registration', { email: registerData.email });
      
      // Auto-login after registration
      await User.login({ 
        email: registerData.email, 
        password: registerData.password 
      });
      
      onLoginSuccess();
    } catch (error) {
      console.error('Registration failed:', error);
      setError(error.message || 'Registration failed. Please try again.');
      logger.error('Registration failed', { email: registerData.email, error: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterInputChange = (field, value) => {
    setRegisterData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white shadow-lg border-slate-200/80">
        <CardHeader className="text-center space-y-4 pb-6">
          <div className="w-16 h-16 bg-slate-800 rounded-xl flex items-center justify-center mx-auto shadow-lg">
            <ClipboardCheck className="w-8 h-8 text-white" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-slate-800">
              {showRegister ? 'Create Account' : 'Welcome to RapidAssess'}
            </CardTitle>
            <p className="text-slate-500 mt-2">
              {showRegister ? 'Sign up for a new account' : 'Sign in to your account to continue'}
            </p>
          </div>
        </CardHeader>
        
        <CardContent>
          {!showRegister ? (
            // Login Form
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-700 font-medium">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="h-11 bg-slate-50 border-slate-200"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-700 font-medium">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    className="h-11 bg-slate-50 border-slate-200 pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-11 w-10 text-slate-400 hover:text-slate-600"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <Button
                type="submit"
                disabled={isLoading || !email || !password}
                className="w-full h-11 bg-slate-800 hover:bg-slate-900 text-white font-medium"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>

              <div className="text-center">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowRegister(true)}
                  className="text-slate-600 hover:text-slate-800"
                >
                  Don't have an account? Sign up
                </Button>
              </div>
            </form>
          ) : (
            // Registration Form
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reg-fullName" className="text-slate-700 font-medium">
                  Full Name
                </Label>
                <Input
                  id="reg-fullName"
                  type="text"
                  value={registerData.fullName}
                  onChange={(e) => handleRegisterInputChange('fullName', e.target.value)}
                  placeholder="Enter your full name"
                  required
                  className="h-11 bg-slate-50 border-slate-200"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reg-email" className="text-slate-700 font-medium">
                  Email Address
                </Label>
                <Input
                  id="reg-email"
                  type="email"
                  value={registerData.email}
                  onChange={(e) => handleRegisterInputChange('email', e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="h-11 bg-slate-50 border-slate-200"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reg-phone" className="text-slate-700 font-medium">
                  Phone Number (Optional)
                </Label>
                <Input
                  id="reg-phone"
                  type="tel"
                  value={registerData.phone}
                  onChange={(e) => handleRegisterInputChange('phone', e.target.value)}
                  placeholder="Enter your phone number"
                  className="h-11 bg-slate-50 border-slate-200"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="reg-password" className="text-slate-700 font-medium">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="reg-password"
                    type={showPassword ? 'text' : 'password'}
                    value={registerData.password}
                    onChange={(e) => handleRegisterInputChange('password', e.target.value)}
                    placeholder="Create a password (min 8 characters)"
                    required
                    minLength={8}
                    className="h-11 bg-slate-50 border-slate-200 pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-11 w-10 text-slate-400 hover:text-slate-600"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reg-confirmPassword" className="text-slate-700 font-medium">
                  Confirm Password
                </Label>
                <Input
                  id="reg-confirmPassword"
                  type="password"
                  value={registerData.confirmPassword}
                  onChange={(e) => handleRegisterInputChange('confirmPassword', e.target.value)}
                  placeholder="Confirm your password"
                  required
                  className="h-11 bg-slate-50 border-slate-200"
                />
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <Button
                type="submit"
                disabled={isLoading || !registerData.email || !registerData.password || !registerData.fullName}
                className="w-full h-11 bg-slate-800 hover:bg-slate-900 text-white font-medium"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  'Create Account'
                )}
              </Button>

              <div className="text-center">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowRegister(false)}
                  className="text-slate-600 hover:text-slate-800"
                >
                  Already have an account? Sign in
                </Button>
              </div>
            </form>
          )}

          {!showRegister && (
            <div className="mt-6 pt-6 border-t border-slate-200">
              <div className="space-y-3 text-sm">
                <p className="text-center text-slate-500 font-medium">Demo Accounts:</p>
                <div className="space-y-2 bg-slate-50 p-3 rounded-lg">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Admin:</span>
                    <span className="font-mono text-slate-800">admin@rapidassess.com / admin123</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Manager:</span>
                    <span className="font-mono text-slate-800">manager@rapidassess.com / manager123</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Assessor:</span>
                    <span className="font-mono text-slate-800">assessor1@rapidassess.com / assessor123</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}