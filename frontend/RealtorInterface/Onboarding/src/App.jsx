import React, { useState } from 'react';
import {
  User,
  Mail,
  Phone,
  Calendar,
  ArrowRight,
  CheckCircle,
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
);

export default function App() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [info, setInfo] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    website: '',
    video: '',
  });
  const [realtor, setRealtor] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [calendarConnected, setCalendarConnected] = useState(false);
  const videoValid =
    info.video === '' || info.video.includes('player.vimeo.com');

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const redirectUrl = `${window.location.origin}/onboarding/`;
    console.log('signInWithOtp', { email, redirectUrl });

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectUrl },
    });

    if (error) console.error('signInWithOtp error', error);

    setIsLoading(false);
    setStep(2);
  };

  const handleInfoSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (info.video && !info.video.includes('player.vimeo.com')) {
      alert('Video link must be a player.vimeo.com URL');
      setIsLoading(false);
      return;
    }

    const { data: userData, error: userError } = await supabase.auth.getUser();
    console.log('getUser', { userData, userError });
    const user = userData?.user;
    if (!user) {
      alert('Please open the verification link sent to your email before continuing.');
      setIsLoading(false);
      return;
    }

    const res = await fetch('/api/realtor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: `${info.firstName} ${info.lastName}`.trim(),
        userId: user.id,
        websiteUrl: info.website,
        videoUrl: info.video,
      }),
    });
    console.log('realtor POST status', res.status);

    if (!res.ok) {
      alert('Failed to save your info. Please try again.');
      setIsLoading(false);
      return;
    }

    setRealtor({
      realtor_id: user.id,
      name: `${info.firstName} ${info.lastName}`.trim(),
      website_url: info.website,
      video_url: info.video,
    });
    setIsLoading(false);
    setStep(3);
  };

  const handleCalendarLink = async () => {
    if (!realtor) return;
    setIsLoading(true);

    // Simulate calendar connection
    setTimeout(() => {
      setIsLoading(false);
      setShowSuccess(true);
      setCalendarConnected(true);
      setTimeout(() => setShowSuccess(false), 2000);
    }, 1000);
  };

  const handleFinish = () => {
    window.location.href = '/console';
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
            <span className="text-white/80 text-sm font-medium">
              Step {step} of 3
            </span>
            <span className="text-white/60 text-sm">
              {step === 1
                ? 'Verify Email'
                : step === 2
                  ? 'Personal Info'
                  : 'Setup Complete'}
            </span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-pink-400 to-purple-400 h-2 rounded-full transition-all duration-700 ease-out"
              style={{ width: `${(step / 3) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Main card */}
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 p-8 transform transition-all duration-500 hover:shadow-3xl">
          {step === 1 && (
            <form className="space-y-6" onSubmit={handleEmailSubmit}>
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full mb-4">
                  <Mail className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-2">
                  Verify your email
                </h2>
                <p className="text-white/70">
                  We'll send you a link to confirm it
                </p>
              </div>

              <div className="relative">
                <Mail className="absolute left-3 top-3.5 w-5 h-5 text-white/50" />
                <input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl pl-12 pr-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-pink-400/50 focus:border-transparent transition-all duration-300"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <>
                    <span>Send Link</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>
          )}

          {step === 2 && (
            <form className="space-y-6" onSubmit={handleInfoSubmit}>
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full mb-4">
                  <User className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-2">
                  Tell us about yourself
                </h2>
                <p className="text-white/70">We just need a few details</p>
                <p className="text-white/60 text-sm mt-1">
                  Open the verification link sent to your email, then return here to continue.
                </p>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="First name"
                      value={info.firstName}
                      onChange={(e) =>
                        setInfo({ ...info, firstName: e.target.value })
                      }
                      required
                      className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-pink-400/50 focus:border-transparent transition-all duration-300"
                    />
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Last name"
                      value={info.lastName}
                      onChange={(e) =>
                        setInfo({ ...info, lastName: e.target.value })
                      }
                      required
                      className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-pink-400/50 focus:border-transparent transition-all duration-300"
                    />
                  </div>
                </div>

                <div className="relative">
                  <Phone className="absolute left-3 top-3.5 w-5 h-5 text-white/50" />
                  <input
                    type="text"
                    placeholder="Phone number"
                    value={info.phone}
                    onChange={(e) =>
                      setInfo({ ...info, phone: e.target.value })
                    }
                    required
                    className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl pl-12 pr-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-pink-400/50 focus:border-transparent transition-all duration-300"
                  />
                </div>

                <div className="relative">
                  <input
                    type="url"
                    placeholder="Website URL"
                    value={info.website}
                    onChange={(e) =>
                      setInfo({ ...info, website: e.target.value })
                    }
                    className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-pink-400/50 focus:border-transparent transition-all duration-300"
                  />
                </div>

                <div className="relative">
                  <input
                    type="url"
                    placeholder="Video link from player.vimeo.com"
                    value={info.video}
                    onChange={(e) =>
                      setInfo({ ...info, video: e.target.value })
                    }
                    className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-pink-400/50 focus:border-transparent transition-all duration-300"
                  />
                  <p className="text-xs text-white/60 mt-1">
                    Paste the share URL that begins with
                    {' '}<code>https://player.vimeo.com</code>
                  </p>
                  <p className="text-xs text-white/60 mt-1">
                    If you are unable to follow these instructions, please
                    email
                    {' '}<a
                      href="mailto:admin@myrealvaluation.com"
                      className="underline"
                    >
                      admin@myrealvaluation.com
                    </a>{' '}
                    and we will manually fix it for you.
                  </p>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || !videoValid}
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
            </form>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-400 to-blue-400 rounded-full mb-4">
                  <Calendar className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-2">
                  Almost Done!
                </h2>
                <p className="text-white/70">
                  Connect your calendar to finish setup
                </p>
              </div>

              <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                <h3 className="text-lg font-semibold text-white mb-3">
                  Connect Google Calendar
                </h3>
                <p className="text-white/60 text-sm mb-4">
                  Make sure you're logged into the correct Google account. If
                  you encounter issues, try using an incognito window.
                </p>

                <button
                  type="button"
                  onClick={handleCalendarLink}
                  disabled={isLoading || calendarConnected}
                  className="w-full bg-white/10 hover:bg-white/20 border border-white/20 text-white font-medium py-3 px-4 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 mb-4"
                >
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : calendarConnected || showSuccess ? (
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

              </div>

              <button
                onClick={handleFinish}
                disabled={isLoading || !calendarConnected}
                className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    <span>Finish Setup</span>
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
