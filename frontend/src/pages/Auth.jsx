import React, {
  useEffect,
  useState,
} from 'react';

import {
  Eye,
  EyeOff,
  FileText,
  Check,
  AlertTriangle,
  Briefcase,
  User,
} from 'lucide-react';

import {
  useNavigate,
  Link,
} from 'react-router-dom';

import { useAuth } from '../context/AuthContext';

import api from '../services/api';


// ============================================================
// AUTH COMPONENT
// ============================================================

const Auth = () => {
  const navigate = useNavigate();

  const {
    login,
    verifyLoginOtp,
    register,
  } = useAuth();


  // ==========================================================
  // BASIC STATE
  // ==========================================================

  const [mode, setMode] =
    useState('login');

  const [role, setRole] =
    useState('tenant');

  const [pwVisible, setPwVisible] =
    useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });


  // ==========================================================
  // REGISTRATION OTP STATE
  // ==========================================================

  const [otp, setOtp] =
    useState('');

  const [otpSent, setOtpSent] =
    useState(false);

  const [otpVerified, setOtpVerified] =
    useState(false);


  // ==========================================================
  // LOGIN OTP STATE
  // ==========================================================

  const [loginOtpSent, setLoginOtpSent] =
    useState(false);

  const [loginOtp, setLoginOtp] =
    useState('');

  const [loginOtpLoading, setLoginOtpLoading] =
    useState(false);


  // ==========================================================
  // COMMON OTP STATE
  // ==========================================================

  const [otpLoading, setOtpLoading] =
    useState(false);

  const [resendTimer, setResendTimer] =
    useState(0);


  // ==========================================================
  // GENERAL STATE
  // ==========================================================

  const [error, setError] =
    useState('');

  const [success, setSuccess] =
    useState('');

  const [loading, setLoading] =
    useState(false);


  const isLogin =
    mode === 'login';


  // ==========================================================
  // OTP RESEND TIMER
  // ==========================================================

  useEffect(() => {
    if (resendTimer <= 0) {
      return;
    }

    const timer =
      setInterval(() => {
        setResendTimer(
          (previous) =>
            previous - 1
        );
      }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, [resendTimer]);


  // ==========================================================
  // HANDLE INPUT CHANGE
  // ==========================================================

  const handleChange = (e) => {
    const {
      name,
      value,
    } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError('');
    setSuccess('');


    // If email changes,
    // invalidate OTP state.
    if (
      name === 'email' &&
      value.trim().toLowerCase() !==
        formData.email
          .trim()
          .toLowerCase()
    ) {
      setOtpSent(false);
      setOtpVerified(false);
      setOtp('');

      setLoginOtpSent(false);
      setLoginOtp('');

      setResendTimer(0);
    }
  };


  // ==========================================================
  // MODE CHANGE
  // ==========================================================

  const handleModeChange = (
    newMode
  ) => {
    setMode(newMode);

    setError('');
    setSuccess('');

    setOtp('');
    setOtpSent(false);
    setOtpVerified(false);

    setLoginOtp('');
    setLoginOtpSent(false);

    setOtpLoading(false);
    setLoginOtpLoading(false);

    setLoading(false);

    setResendTimer(0);

    setFormData({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    });
  };


  // ==========================================================
  // VALIDATE EMAIL
  // ==========================================================

  const validateEmail = (
    email
  ) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      .test(email);
  };


  // ==========================================================
  // VALIDATE REGISTRATION
  // ==========================================================

  const validateRegistration =
    () => {
      const name =
        formData.name.trim();

      const email =
        formData.email
          .trim()
          .toLowerCase();

      const password =
        formData.password;

      const confirmPassword =
        formData.confirmPassword;


      // ------------------------------------------------------
      // NAME
      // ------------------------------------------------------

      if (!name) {
        setError(
          'Please enter your full name.'
        );

        return false;
      }

      if (name.length < 2) {
        setError(
          'Name must contain at least 2 characters.'
        );

        return false;
      }

      if (
        !/^[A-Za-z ]+$/.test(name)
      ) {
        setError(
          'Name can contain only letters and spaces.'
        );

        return false;
      }


      // ------------------------------------------------------
      // EMAIL
      // ------------------------------------------------------

      if (!email) {
        setError(
          'Please enter your email address.'
        );

        return false;
      }

      if (!validateEmail(email)) {
        setError(
          'Please enter a valid email address.'
        );

        return false;
      }


      // ------------------------------------------------------
      // PASSWORD
      // ------------------------------------------------------

      if (!password) {
        setError(
          'Please enter a password.'
        );

        return false;
      }

      if (password.length < 8) {
        setError(
          'Password must be at least 8 characters.'
        );

        return false;
      }

      if (!/[A-Z]/.test(password)) {
        setError(
          'Password must contain at least one uppercase letter.'
        );

        return false;
      }

      if (!/[a-z]/.test(password)) {
        setError(
          'Password must contain at least one lowercase letter.'
        );

        return false;
      }

      if (!/[0-9]/.test(password)) {
        setError(
          'Password must contain at least one number.'
        );

        return false;
      }

      if (
        !/[!@#$%^&*(),.?":{}|<>_\-+=;']/.
          test(password)
      ) {
        setError(
          'Password must contain at least one special character.'
        );

        return false;
      }


      // ------------------------------------------------------
      // CONFIRM PASSWORD
      // ------------------------------------------------------

      if (
        password !== confirmPassword
      ) {
        setError(
          'Passwords do not match.'
        );

        return false;
      }

      return true;
    };


  // ==========================================================
  // SEND REGISTRATION OTP
  // ==========================================================

  const handleSendOTP =
    async () => {
      setError('');
      setSuccess('');


      // Validate registration
      if (!validateRegistration()) {
        return;
      }


      try {
        setOtpLoading(true);


        const email =
          formData.email
            .trim()
            .toLowerCase();


        const response =
          await api.post(
            '/auth/send-otp',
            {
              email,
            }
          );


        setOtpSent(true);
        setOtpVerified(false);
        setOtp('');

        setResendTimer(60);


        setSuccess(
          response.data?.message ||
            'Verification OTP has been sent to your email.'
        );

      } catch (err) {
        console.error(
          'Send registration OTP error:',
          err.response?.data ||
            err.message
        );

        setError(
          err.response?.data?.message ||
            'Unable to send OTP. Please try again.'
        );

      } finally {
        setOtpLoading(false);
      }
    };


  // ==========================================================
  // VERIFY REGISTRATION OTP
  // ==========================================================

  const handleVerifyOTP =
    async () => {
      setError('');
      setSuccess('');


      if (!otp) {
        setError(
          'Please enter the OTP.'
        );

        return;
      }


      if (!/^\d{6}$/.test(otp)) {
        setError(
          'OTP must be exactly 6 digits.'
        );

        return;
      }


      try {
        setOtpLoading(true);


        const email =
          formData.email
            .trim()
            .toLowerCase();


        const response =
          await api.post(
            '/auth/verify-otp',
            {
              email,
              otp,
            }
          );


        if (
          response.data?.verified
        ) {
          setOtpVerified(true);

          setSuccess(
            'Email verified successfully. You can now create your account.'
          );
        }

      } catch (err) {
        console.error(
          'Verify registration OTP error:',
          err.response?.data ||
            err.message
        );

        setOtpVerified(false);

        setError(
          err.response?.data?.message ||
            'Invalid OTP. Please try again.'
        );

      } finally {
        setOtpLoading(false);
      }
    };


  // ==========================================================
  // SEND LOGIN OTP
  // ==========================================================

  const handleSendLoginOTP =
    async () => {
      setError('');
      setSuccess('');


      const email =
        formData.email
          .trim()
          .toLowerCase();

      const password =
        formData.password;


      // ------------------------------------------------------
      // EMAIL
      // ------------------------------------------------------

      if (!email) {
        setError(
          'Please enter your email address.'
        );

        return;
      }

      if (!validateEmail(email)) {
        setError(
          'Please enter a valid email address.'
        );

        return;
      }


      // ------------------------------------------------------
      // PASSWORD
      // ------------------------------------------------------

      if (!password) {
        setError(
          'Please enter your password.'
        );

        return;
      }


      try {
        setLoginOtpLoading(true);


        const response =
          await login(
            email,
            password
          );


        setLoginOtpSent(true);
        setLoginOtp('');

        setResendTimer(60);


        setSuccess(
          response?.message ||
            'Login OTP has been sent to your email.'
        );

      } catch (err) {
        console.error(
          'Login OTP error:',
          err.response?.data ||
            err.message
        );

        setError(
          err.response?.data?.message ||
            'Invalid email or password.'
        );

      } finally {
        setLoginOtpLoading(false);
      }
    };


  // ==========================================================
  // VERIFY LOGIN OTP
  // ==========================================================

  const handleVerifyLoginOTP =
    async () => {
      setError('');
      setSuccess('');


      if (!loginOtp) {
        setError(
          'Please enter the login OTP.'
        );

        return;
      }


      if (
        !/^\d{6}$/.test(loginOtp)
      ) {
        setError(
          'OTP must be exactly 6 digits.'
        );

        return;
      }


      try {
        setLoginOtpLoading(true);


        const email =
          formData.email
            .trim()
            .toLowerCase();


        const loggedInUser =
          await verifyLoginOtp(
            email,
            loginOtp
          );


        // ----------------------------------------------------
        // ROLE BASED NAVIGATION
        // ----------------------------------------------------

        if (
          loggedInUser?.role ===
          'admin'
        ) {
          navigate(
            '/admin',
            {
              replace: true,
            }
          );

        } else if (
          loggedInUser?.role ===
          'landlord'
        ) {
          navigate(
            '/landlord',
            {
              replace: true,
            }
          );

        } else {
          navigate(
            '/dashboard',
            {
              replace: true,
            }
          );
        }

      } catch (err) {
        console.error(
          'Verify login OTP error:',
          err.response?.data ||
            err.message
        );

        setError(
          err.response?.data?.message ||
            err.message ||
            'Invalid OTP. Please try again.'
        );

      } finally {
        setLoginOtpLoading(false);
      }
    };


  // ==========================================================
  // MAIN AUTH HANDLER
  // ==========================================================

  const handleAuth =
    async (e) => {
      e.preventDefault();

      setError('');
      setSuccess('');


      // ======================================================
      // LOGIN
      // ======================================================

      if (isLogin) {

        // If OTP has NOT been sent,
        // send login OTP.
        if (!loginOtpSent) {
          await handleSendLoginOTP();
          return;
        }


        // If OTP has already been sent,
        // verify login OTP.
        await handleVerifyLoginOTP();

        return;
      }


      // ======================================================
      // REGISTRATION
      // ======================================================

      // Validate registration
      if (!validateRegistration()) {
        return;
      }


      // OTP must be verified
      if (!otpVerified) {
        setError(
          'Please verify your email with OTP before creating your account.'
        );

        return;
      }


      setLoading(true);


      try {
        await register(
          formData.name.trim(),

          formData.email
            .trim()
            .toLowerCase(),

          formData.password,

          role
        );


        setSuccess(
          'Account created successfully. You can now log in.'
        );


        // Switch to login
        setMode('login');


        // Reset OTP
        setOtp('');
        setOtpSent(false);
        setOtpVerified(false);

        setLoginOtp('');
        setLoginOtpSent(false);

        setResendTimer(0);


        // Keep email so user does not
        // need to type it again.
        setFormData({
          name: '',

          email:
            formData.email
              .trim()
              .toLowerCase(),

          password: '',

          confirmPassword: '',
        });

      } catch (err) {
        console.error(
          'Registration error:',
          err.response?.data ||
            err.message
        );

        setError(
          err.response?.data?.message ||
            err.message ||
            'Unable to create account. Please try again.'
        );

      } finally {
        setLoading(false);
      }
    };


  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="min-h-screen w-full flex items-stretch font-sans bg-paper">

      {/* =====================================================
          LEFT PANEL
      ====================================================== */}

      <div className="hidden lg:flex w-[46%] relative flex-col justify-between py-12 px-14 overflow-hidden bg-gradient-to-b from-ink-dark to-[#101a2e]">

        <div className="absolute top-[-10%] left-[15%] w-[900px] h-[500px] bg-[radial-gradient(ellipse_at_center,rgba(201,162,75,0.10),transparent_60%)] pointer-events-none">
        </div>


        <div
          className="absolute inset-0 opacity-[0.045] pointer-events-none"
          style={{
            backgroundImage:
              'repeating-linear-gradient(to bottom, transparent, transparent 27px, var(--color-gold) 28px)',
          }}
        >
        </div>


        <div className="relative z-10 flex items-center gap-3">

          <Link
            to="/"
            className="w-11 h-11 rounded border border-gold flex items-center justify-center bg-gold/5 shadow-[0_0_0_4px_rgba(201,162,75,0.05)]"
          >
            <span className="font-serif font-bold text-gold text-lg">
              S
            </span>
          </Link>


          <span className="font-sans text-[15px] tracking-[0.18em] uppercase text-[#EDEBE3] font-semibold">
            SmartLease{' '}
            <span className="text-gold">
              AI
            </span>
          </span>

        </div>


        <div className="relative z-10 mt-9">

          <p className="text-[12.5px] uppercase tracking-[0.16em] text-text-muted mb-4 font-medium">
            What we read, so you don't have to
          </p>


          <div className="bg-paper-card rounded-lg p-6 shadow-[0_24px_48px_-20px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.4)] animate-in slide-in-from-bottom-4 duration-700">

            <div className="flex items-center justify-between mb-4">

              <span className="text-[11px] uppercase tracking-[0.1em] text-[#8A7658] font-mono font-medium">
                § 4.2 — Security Deposit
              </span>

              <FileText className="w-4 h-4 text-[#8A7658]" />

            </div>


            <p className="text-[15px] leading-[1.68] text-[#2A2620] font-serif mb-0">
              "The Tenant forfeits the full deposit for any early termination, regardless of cause, and Landlord may withhold additional sums at sole discretion."
            </p>


            <div className="mt-5 flex items-start gap-2.5 rounded px-3.5 py-3 bg-risk-red-bg border-l-[2.5px] border-[#C1443C]">

              <AlertTriangle className="w-4 h-4 text-[#C1443C] mt-0.5 shrink-0" />

              <div>

                <p className="text-[12.5px] font-semibold text-[#C1443C] mb-1">
                  High-risk clause flagged
                </p>

                <p className="text-xs leading-relaxed text-[#6B4F49] mb-0">
                  "Sole discretion" removes your right to dispute withholding. Ask for a defined deduction list.
                </p>

              </div>

            </div>

          </div>


          <p className="text-[12.5px] leading-[1.65] text-text-faint max-w-[380px] mt-5">
            Every agreement you upload is read clause by clause — summarized in plain language, checked for risk, and ready to answer your questions.
          </p>

        </div>


        <div className="relative z-10 flex items-center gap-9 pt-8 border-t border-border/20 mt-10">

          <div>

            <p className="text-[21px] text-[#EDEBE3] font-serif font-medium m-0">
              12,400+
            </p>

            <p className="text-[11.5px] tracking-[0.02em] text-text-muted mt-1">
              agreements analyzed
            </p>

          </div>


          <div>

            <p className="text-[21px] text-[#EDEBE3] font-serif font-medium m-0">
              2 roles
            </p>

            <p className="text-[11.5px] tracking-[0.02em] text-text-muted mt-1">
              tenant · landlord
            </p>

          </div>

        </div>

      </div>


      {/* =====================================================
          RIGHT PANEL
      ====================================================== */}

      <div className="flex-1 flex items-center justify-center p-12 bg-paper bg-[radial-gradient(ellipse_700px_400px_at_85%_0%,rgba(201,162,75,0.05),transparent_60%)]">

        <div className="w-full max-w-[400px] animate-in slide-in-from-bottom-4 duration-500 fade-in">


          {/* MOBILE LOGO */}

          <div className="flex lg:hidden items-center gap-2.5 mb-10">

            <Link
              to="/"
              className="w-9 h-9 rounded bg-gold/10 flex items-center justify-center"
            >
              <span className="font-serif font-bold text-gold text-lg">
                S
              </span>
            </Link>

            <span className="text-sm tracking-[0.16em] uppercase text-ink font-semibold">
              SmartLease{' '}
              <b className="text-gold-deep font-semibold">
                AI
              </b>
            </span>

          </div>


          {/* MODE SWITCH */}

          <div className="flex items-center gap-6 mb-8 border-b border-border">

            <button
              type="button"
              className={`pb-3 text-[14.5px] font-sans transition-colors relative ${
                isLogin
                  ? 'text-ink font-semibold'
                  : 'text-text-faint font-medium hover:text-ink'
              }`}
              onClick={() =>
                handleModeChange('login')
              }
            >
              Log in

              {isLogin && (
                <span className="absolute left-0 right-0 bottom-[-1px] h-[2px] bg-gold rounded-sm">
                </span>
              )}

            </button>


            <button
              type="button"
              className={`pb-3 text-[14.5px] font-sans transition-colors relative ${
                !isLogin
                  ? 'text-ink font-semibold'
                  : 'text-text-faint font-medium hover:text-ink'
              }`}
              onClick={() =>
                handleModeChange('register')
              }
            >
              Create account

              {!isLogin && (
                <span className="absolute left-0 right-0 bottom-[-1px] h-[2px] bg-gold rounded-sm">
                </span>
              )}

            </button>

          </div>


          {/* HEADING */}

          <div className="mb-8 transition-opacity duration-200">

            <h1 className="text-[27px] leading-[1.25] text-ink font-serif font-medium mb-1.5">

              {isLogin
                ? loginOtpSent
                  ? 'Verify your login'
                  : 'Welcome back'
                : 'Set up your account'}

            </h1>


            <p className="text-[14px] text-text-muted m-0">

              {isLogin
                ? loginOtpSent
                  ? 'Enter the OTP sent to your email address.'
                  : 'Sign in to review your agreements.'
                : "A few details, and you're reading clearly in minutes."}

            </p>

          </div>


          {/* ERROR */}

          {error && (
            <div className="mb-5 rounded border border-red-300 bg-red-50 px-3.5 py-3 text-[13px] text-red-700">
              {error}
            </div>
          )}


          {/* SUCCESS */}

          {success && (
            <div className="mb-5 rounded border border-green-300 bg-green-50 px-3.5 py-3 text-[13px] text-green-700">
              {success}
            </div>
          )}


          {/* =================================================
              FORM
          ================================================== */}

          <form
            onSubmit={handleAuth}
            className="flex flex-col gap-[19px]"
          >


            {/* =================================================
                REGISTRATION NAME
            ================================================== */}

            {!isLogin && (

              <div className="animate-in fade-in duration-300">

                <label className="block text-xs uppercase tracking-[0.08em] text-text-muted mb-1.5 font-semibold">
                  Full name
                </label>


                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 text-[14.5px] text-ink bg-white border border-border rounded-[3px] outline-none transition-all focus:border-gold focus:ring-[3px] focus:ring-gold/20 placeholder:text-text-faint"
                  placeholder="Priya Sharma"
                  required
                />

              </div>

            )}


            {/* =================================================
                EMAIL
            ================================================== */}

            <div>

              <label className="block text-xs uppercase tracking-[0.08em] text-text-muted mb-1.5 font-semibold">
                Email address
              </label>


              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                disabled={
                  isLogin &&
                  loginOtpSent
                }
                className="w-full px-3.5 py-2.5 text-[14.5px] text-ink bg-white border border-border rounded-[3px] outline-none transition-all focus:border-gold focus:ring-[3px] focus:ring-gold/20 placeholder:text-text-faint disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="you@example.com"
                required
              />

            </div>


            {/* =================================================
                PASSWORD
            ================================================== */}

            <div>

              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs uppercase tracking-[0.08em] text-text-muted font-semibold m-0">
                  Password
                </label>
                {isLogin && (
                  <Link to="/forgot-password" className="text-xs text-gold-deep hover:text-ink font-semibold">
                    Forgot password?
                  </Link>
                )}
              </div>


              <div className="relative">

                <input
                  type={
                    pwVisible
                      ? 'text'
                      : 'password'
                  }
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={
                    isLogin &&
                    loginOtpSent
                  }
                  className="w-full px-3.5 py-2.5 pr-10 text-[14.5px] text-ink bg-white border border-border rounded-[3px] outline-none transition-all focus:border-gold focus:ring-[3px] focus:ring-gold/20 placeholder:text-text-faint disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="At least 8 characters"
                  required
                />


                <button
                  type="button"
                  onClick={() =>
                    setPwVisible(
                      !pwVisible
                    )
                  }
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-faint hover:text-ink p-1 rounded transition-colors"
                >

                  {pwVisible ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}

                </button>

              </div>

            </div>


            {/* =================================================
                CONFIRM PASSWORD
            ================================================== */}

            {!isLogin && (

              <div className="animate-in fade-in duration-300">

                <label className="block text-xs uppercase tracking-[0.08em] text-text-muted mb-1.5 font-semibold">
                  Confirm password
                </label>


                <input
                  type="password"
                  name="confirmPassword"
                  value={
                    formData.confirmPassword
                  }
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 text-[14.5px] text-ink bg-white border border-border rounded-[3px] outline-none transition-all focus:border-gold focus:ring-[3px] focus:ring-gold/20 placeholder:text-text-faint"
                  placeholder="Re-enter password"
                  required
                />

              </div>

            )}


            {/* =================================================
                PASSWORD REQUIREMENTS
            ================================================== */}

            {!isLogin &&
              formData.password && (

                <div className="rounded border border-border bg-[#fafafa] px-3 py-2.5 text-[11.5px] text-text-muted -mt-2">

                  <p className="font-semibold mb-1">
                    Password must contain:
                  </p>


                  <p>
                    {formData.password.length >= 8
                      ? '✓'
                      : '○'}{' '}
                    At least 8 characters
                  </p>


                  <p>
                    {/[A-Z]/.test(
                      formData.password
                    )
                      ? '✓'
                      : '○'}{' '}
                    One uppercase letter
                  </p>


                  <p>
                    {/[a-z]/.test(
                      formData.password
                    )
                      ? '✓'
                      : '○'}{' '}
                    One lowercase letter
                  </p>


                  <p>
                    {/[0-9]/.test(
                      formData.password
                    )
                      ? '✓'
                      : '○'}{' '}
                    One number
                  </p>


                  <p>
                    {/[!@#$%^&*(),.?":{}|<>_\-+=;']/.test(
                      formData.password
                    )
                      ? '✓'
                      : '○'}{' '}
                    One special character
                  </p>

                </div>

              )}


            {/* =================================================
                ROLE
            ================================================== */}

            {!isLogin && (

              <div className="animate-in fade-in duration-300">

                <span className="block text-xs uppercase tracking-[0.08em] text-text-muted mb-1.5 font-semibold">
                  I am a
                </span>


                <div className="grid grid-cols-2 gap-2">


                  {/* TENANT */}

                  <button
                    type="button"
                    onClick={() =>
                      setRole('tenant')
                    }
                    className={`flex flex-col items-center gap-1.5 py-3 px-1 rounded-[3px] border bg-white transition-colors ${
                      role === 'tenant'
                        ? 'border-gold bg-gold/10'
                        : 'border-border hover:border-gold-soft'
                    }`}
                  >

                    <User
                      className={`w-4 h-4 ${
                        role === 'tenant'
                          ? 'text-gold-deep'
                          : 'text-text-faint'
                      }`}
                    />

                    <span
                      className={`text-xs ${
                        role === 'tenant'
                          ? 'text-ink font-semibold'
                          : 'text-text-faint font-medium'
                      }`}
                    >
                      Tenant
                    </span>

                  </button>


                  {/* LANDLORD */}

                  <button
                    type="button"
                    onClick={() =>
                      setRole('landlord')
                    }
                    className={`flex flex-col items-center gap-1.5 py-3 px-1 rounded-[3px] border bg-white transition-colors ${
                      role === 'landlord'
                        ? 'border-gold bg-gold/10'
                        : 'border-border hover:border-gold-soft'
                    }`}
                  >

                    <Briefcase
                      className={`w-4 h-4 ${
                        role === 'landlord'
                          ? 'text-gold-deep'
                          : 'text-text-faint'
                      }`}
                    />

                    <span
                      className={`text-xs ${
                        role === 'landlord'
                          ? 'text-ink font-semibold'
                          : 'text-text-faint font-medium'
                      }`}
                    >
                      Landlord
                    </span>

                  </button>

                </div>

              </div>

            )}


            {/* =================================================
                REGISTRATION OTP
            ================================================== */}

            {!isLogin && (

              <div className="animate-in fade-in duration-300">

                <label className="block text-xs uppercase tracking-[0.08em] text-text-muted mb-1.5 font-semibold">
                  Email verification
                </label>


                {!otpSent ? (

                  <button
                    type="button"
                    onClick={
                      handleSendOTP
                    }
                    disabled={
                      otpLoading
                    }
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-3 bg-white border border-gold text-gold-deep hover:bg-gold/10 disabled:opacity-60 disabled:cursor-not-allowed text-[13.5px] font-semibold rounded-[3px] transition-all"
                  >

                    {otpLoading
                      ? 'Sending OTP...'
                      : 'Send verification OTP'}

                  </button>

                ) : (

                  <div className="space-y-2.5">

                    <div className="flex gap-2">

                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        value={otp}
                        onChange={(e) => {

                          const value =
                            e.target.value
                              .replace(
                                /\D/g,
                                ''
                              )
                              .slice(
                                0,
                                6
                              );

                          setOtp(value);

                          setError('');
                          setSuccess('');

                        }}
                        disabled={
                          otpVerified
                        }
                        className="flex-1 min-w-0 px-3.5 py-2.5 text-[14.5px] tracking-[0.25em] text-center text-ink bg-white border border-border rounded-[3px] outline-none transition-all focus:border-gold focus:ring-[3px] focus:ring-gold/20"
                        placeholder="000000"
                      />


                      <button
                        type="button"
                        onClick={
                          handleVerifyOTP
                        }
                        disabled={
                          otpLoading ||
                          otpVerified
                        }
                        className="px-4 py-2.5 bg-ink text-paper-card text-[13px] font-semibold rounded-[3px] disabled:opacity-60 disabled:cursor-not-allowed"
                      >

                        {otpLoading
                          ? 'Checking...'
                          : otpVerified
                            ? 'Verified'
                            : 'Verify'}

                      </button>

                    </div>


                    {/* VERIFIED */}

                    {otpVerified && (

                      <div className="flex items-center gap-2 rounded border border-green-300 bg-green-50 px-3 py-2 text-[12.5px] text-green-700">

                        <Check className="w-4 h-4" />

                        <span>
                          Email verified successfully
                        </span>

                      </div>

                    )}


                    {/* RESEND */}

                    {!otpVerified && (

                      <div className="flex items-center justify-between">

                        <p className="text-[11.5px] text-text-faint m-0">
                          OTP expires in 5 minutes
                        </p>


                        <button
                          type="button"
                          onClick={
                            handleSendOTP
                          }
                          disabled={
                            otpLoading ||
                            resendTimer > 0
                          }
                          className="text-[11.5px] font-semibold text-gold-deep hover:text-ink disabled:text-text-faint disabled:cursor-not-allowed"
                        >

                          {resendTimer > 0
                            ? `Resend in ${resendTimer}s`
                            : 'Resend OTP'}

                        </button>

                      </div>

                    )}

                  </div>

                )}

              </div>

            )}


            {/* =================================================
                LOGIN OTP
            ================================================== */}

            {isLogin &&
              loginOtpSent && (

                <div className="animate-in fade-in duration-300">

                  <label className="block text-xs uppercase tracking-[0.08em] text-text-muted mb-1.5 font-semibold">
                    Login verification
                  </label>


                  <div className="space-y-2.5">

                    <div className="flex gap-2">

                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        value={loginOtp}
                        onChange={(e) => {

                          const value =
                            e.target.value
                              .replace(
                                /\D/g,
                                ''
                              )
                              .slice(
                                0,
                                6
                              );

                          setLoginOtp(value);

                          setError('');
                          setSuccess('');

                        }}
                        className="flex-1 min-w-0 px-3.5 py-2.5 text-[14.5px] tracking-[0.25em] text-center text-ink bg-white border border-border rounded-[3px] outline-none transition-all focus:border-gold focus:ring-[3px] focus:ring-gold/20"
                        placeholder="000000"
                        autoFocus
                      />


                      <button
                        type="submit"
                        disabled={
                          loginOtpLoading
                        }
                        className="px-4 py-2.5 bg-ink text-paper-card text-[13px] font-semibold rounded-[3px] disabled:opacity-60 disabled:cursor-not-allowed"
                      >

                        {loginOtpLoading
                          ? 'Checking...'
                          : 'Verify'}

                      </button>

                    </div>


                    <div className="flex items-center justify-between">

                      <p className="text-[11.5px] text-text-faint m-0">
                        OTP expires in 5 minutes
                      </p>


                      <button
                        type="button"
                        onClick={
                          handleSendLoginOTP
                        }
                        disabled={
                          loginOtpLoading ||
                          resendTimer > 0
                        }
                        className="text-[11.5px] font-semibold text-gold-deep hover:text-ink disabled:text-text-faint disabled:cursor-not-allowed"
                      >

                        {resendTimer > 0
                          ? `Resend in ${resendTimer}s`
                          : 'Resend OTP'}

                      </button>

                    </div>

                  </div>

                </div>

              )}


            {/* =================================================
                FORGOT PASSWORD
            ================================================== */}

            {isLogin &&
              !loginOtpSent && (

                <div className="flex justify-end -mt-2">

                  <Link
                    to="/forgot-password"
                    className="text-[12.5px] text-[#8A7658] hover:text-gold-deep transition-colors"
                  >
                    Forgot password?
                  </Link>

                </div>

              )}


            {/* =================================================
                SUBMIT BUTTON
            ================================================== */}

            {(!isLogin ||
              !loginOtpSent) && (

              <button
                type="submit"
                disabled={
                  loading ||
                  otpLoading ||
                  (!isLogin &&
                    !otpVerified)
                }
                className="w-full flex items-center justify-center gap-2 p-[13px] bg-ink hover:bg-ink-dark disabled:opacity-60 disabled:cursor-not-allowed text-paper-card text-[14.5px] font-semibold rounded-[3px] mt-1 transition-all active:scale-[0.99] group"
              >

                {loading ||
                loginOtpLoading ||
                otpLoading

                  ? isLogin
                    ? 'Sending OTP...'
                    : 'Creating account...'

                  : isLogin
                    ? 'Continue'
                    : otpVerified
                      ? 'Create account'
                      : 'Verify email first'}


                {!loading &&
                  !loginOtpLoading &&
                  !otpLoading && (

                    <Check className="w-4 h-4 text-paper-card group-hover:translate-x-0.5 transition-transform" />

                  )}

              </button>

            )}

          </form>


          {/* =================================================
              LOGIN OTP BACK BUTTON
          ================================================== */}

          {isLogin &&
            loginOtpSent && (

              <button
                type="button"
                onClick={() => {

                  setLoginOtpSent(
                    false
                  );

                  setLoginOtp('');

                  setResendTimer(0);

                  setError('');

                  setSuccess('');

                }}
                className="w-full mt-4 text-[12.5px] text-text-faint hover:text-ink transition-colors"
              >
                ← Change email or password
              </button>

            )}


          {/* =================================================
              BOTTOM SWITCH
          ================================================== */}

          <p className="text-center text-[13px] text-text-faint mt-7">

            {isLogin
              ? 'New to SmartLease AI? '
              : 'Already have an account? '}


            <button
              type="button"
              onClick={() =>
                handleModeChange(
                  isLogin
                    ? 'register'
                    : 'login'
                )
              }
              className="text-gold-deep font-semibold hover:text-ink transition-colors bg-transparent border-none p-0"
            >

              {isLogin
                ? 'Create an account'
                : 'Log in'}

            </button>

          </p>

        </div>

      </div>

    </div>
  );
};


export default Auth;