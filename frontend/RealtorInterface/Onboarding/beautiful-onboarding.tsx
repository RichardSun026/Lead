import React, { useState } from 'react';
import { User, Mail, Phone, Calendar, Lock, ArrowRight, CheckCircle } from 'lucide-react';

export default function App() {
  const [step, setStep] = useState(1);
  const [info, setInfo] = useState({ firstName: '', lastName: '', email: '', phone: '' });
  const [realtor, setRealtor] = useState(null);
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleFirstSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      const mockData = {
        realtor_id: 'realtor_123',
        name: `${info.firstName} ${info.lastName}`.trim()
      };
      setRealtor(mockData);
      setIsLoading(false);
      setStep(2);
    }, 1500);
  };

  const handleCalendarLink = async () => {
    if (!realtor) return;
    setIsLoading(true);
    
    // Simulate calendar connection
    setTimeout(() => {
      setIsLoading(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    }, 1000);
  };

  const handleSecondSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    setTimeout(() => {
      setIsLoading(false);
      alert('🎉 Onboarding complete! Welcome aboard!');
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 flex items-center justify-center p-4">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
      </div>

      <div className="relative w-full max-w-md">
        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-white/80 text-sm font-medium">Step {step} of 2</span>
            <span className="text-white/60 text-sm">{step === 1 ? 'Personal Info' : 'Setup Complete'}</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-pink-400 to-purple-400 h-2 rounded-full transition-all duration-700 ease-out"
              style={{ width: `${(step / 2) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Main card */}
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 p-8 transform transition-all duration-500 hover:shadow-3xl">
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full mb-4">
                  <User className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-2">Welcome!</h2>
                <p className="text-white/70">Let's get you started with your account</p>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="First name"
                      value={info.firstName}
                      onChange={(e) => setInfo({ ...info, firstName: e.target.value })}
                      required
                      className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-pink-400/50 focus:border-transparent transition-all duration-300"
                    />
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Last name"
                      value={info.lastName}
                      onChange={(e) => setInfo({ ...info, lastName: e.target.value })}
                      required
                      className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-pink-400/50 focus:border-transparent transition-all duration-300"
                    />
                  </div>
                </div>

                <div className="relative">
                  <Mail className="absolute left-3 top-3.5 w-5 h-5 text-white/50" />
                  <input
                    type="email"
                    placeholder="Email address"
                    value={info.email}
                    onChange={(e) => setInfo({ ...info, email: e.target.value })}
                    required
                    className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl pl-12 pr-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-pink-400/50 focus:border-transparent transition-all duration-300"
                  />
                </div>

                <div className="relative">
                  <Phone className="absolute left-3 top-3.5 w-5 h-5 text-white/50" />
                  <input
                    type="text"
                    placeholder="Phone number"
                    value={info.phone}
                    onChange={(e) => setInfo({ ...info, phone: e.target.value })}
                    required
                    className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl pl-12 pr-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-pink-400/50 focus:border-transparent transition-all duration-300"
                  />
                </div>
              </div>

              <button
                onClick={handleFirstSubmit}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <>
                    <span>Continue</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-400 to-blue-400 rounded-full mb-4">
                  <Calendar className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-2">Almost Done!</h2>
                <p className="text-white/70">Connect your calendar to finish setup</p>
              </div>

              <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                <h3 className="text-lg font-semibold text-white mb-3">Connect Google Calendar</h3>
                <p className="text-white/60 text-sm mb-4">
                  Make sure you're logged into the correct Google account. If you encounter issues, try using an incognito window.
                </p>
                
                <button
                  type="button"
                  onClick={handleCalendarLink}
                  disabled={isLoading}
                  className="w-full bg-white/10 hover:bg-white/20 border border-white/20 text-white font-medium py-3 px-4 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 mb-4"
                >
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : showSuccess ? (
                    <>
                      <CheckCircle className="w-5 h-5 text-green-400" />
                      <span>Connected!</span>
                    </>
                  ) : (
                    <>
                      <Calendar className="w-5 h-5" />
                      <span>Connect Google Calendar</span>
                    </>
                  )}
                </button>

                <div className="border-t border-white/10 pt-4">
                  <p className="text-white/60 text-sm mb-3">
                    Set a temporary password to complete your setup
                  </p>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3.5 w-5 h-5 text-white/50" />
                    <input
                      type="password"
                      placeholder="Temporary password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl pl-12 pr-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-green-400/50 focus:border-transparent transition-all duration-300"
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={handleSecondSubmit}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    <span>Complete Setup</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-white/40 text-sm">
            Secure • Private • Professional
          </p>
        </div>
      </div>
    </div>
  );
}