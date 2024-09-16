'use client';

import React, { useState } from 'react';
import emailjs from 'emailjs-com'; // Import EmailJS

interface Email {
  to_name: string;
  to_email: string;
  verification_code: string;
}

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [step, setStep] = useState(1);
  const [message, setMessage] = useState('');

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    try {
      // Generate a verification code
      const code = Math.floor(100000 + Math.random() * 900000).toString();

      // Send the verification code via EmailJS
      await emailjs.send(
        'service_z6qxmlh',
        'template_o2119na',
        {
          to_name: email, // If you want to include the recipient's name
          to_email: email, // The recipient's email
          verification_code: code, // The verification code
        },
        'qDBD9imQ9K6DerRPP'
      );

      // Save the code in state or your database
      localStorage.setItem('verificationCode', code);

      setMessage('Verification code sent to your email.');
      setStep(2);
    } catch (error) {
      setMessage('An error occurred while sending the verification code.');
    }
  };

  const handleVerificationSubmit = async (e) => {
    e.preventDefault();
    const savedCode = localStorage.getItem('verificationCode');
    if (verificationCode !== savedCode) {
      setMessage('Verification code is incorrect.');
      return;
    }
    setStep(3);
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessage('Passwords do not match');
      return;
    }

    try {
      const response = await fetch(
        'http://localhost:3002/api/auth/reset-password',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, newPassword }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message);
        setNewPassword('');
        setConfirmPassword('');
        setVerificationCode('');
        window.location.href = 'http://localhost:3000/auth/Home';
      } else {
        setMessage(data.message);
      }
    } catch (error) {
      setMessage('An error occurred while resetting the password.');
    }
  };
  return (
    <div className="flex justify-center gap-20 items-center min-h-screen p-32 bg-blue-300">
      <div className="text-black font-bold text-3xl">No Worries!!</div>
      <div className="w-full max-w-md">
        <form
          className="relative w-96 bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg border border-opacity-30 border-white shadow-lg-white p-6 rounded-lg"
          onSubmit={
            step === 1
              ? handleEmailSubmit
              : step === 2
              ? handleVerificationSubmit
              : handlePasswordSubmit
          }
        >
          <h2 className="text-2xl font-bold mb-4 text-center">
            {step === 1
              ? 'Forgot Password?'
              : step === 2
              ? 'Enter Verification Code'
              : 'Reset Your Password'}
          </h2>
          <h3 className="pb-4 text-center">
            {step === 1
              ? 'Please enter your email below correctly.'
              : step === 2
              ? 'Please enter the verification code sent to your email.'
              : 'Enter and confirm your new password.'}
          </h3>
          {step === 1 ? (
            <>
              <div className="mb-2  text-center">
                <label
                  className="mb-2 text-sm font-medium text-gray-700 mr-10"
                  htmlFor="email"
                >
                  Email
                </label>
                <input
                  className="p-2 border border-gray-300 rounded-lg mb-4"
                  placeholder="example@gmail.com"
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <button className="w-full p-2 bg-orange-500 text-white rounded-lg">
                  Send Verification Code
                </button>
              </div>
            </>
          ) : step === 2 ? (
            <>
              <div className="mb-2  text-center">
                <label
                  className="mb-2 text-sm font-medium text-gray-700 mr-10"
                  htmlFor="verification-code"
                >
                  Verification Code
                </label>
                <input
                  className="p-2 border border-gray-300 rounded-lg mb-4"
                  placeholder="Enter Verification Code"
                  type="text"
                  id="verification-code"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                />
                <button className="w-full p-2 bg-orange-500 text-white rounded-lg">
                  Verify Code
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="mb-2 text-center">
                <div className="mb-4">
                  <label
                    className="mb-2 text-sm font-medium text-gray-700"
                    htmlFor="new-password"
                  >
                    New Password
                  </label>
                  <input
                    className="p-2 border border-gray-300 rounded-lg w-full"
                    placeholder="New Password"
                    type="password"
                    id="new-password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
                <div className="mb-4">
                  <label
                    className="mb-2 text-sm font-medium text-gray-700"
                    htmlFor="confirm-password"
                  >
                    Confirm Password
                  </label>
                  <input
                    className="p-2 border border-gray-300 rounded-lg w-full"
                    placeholder="Confirm Password"
                    type="password"
                    id="confirm-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
                <button className="w-full p-2 bg-orange-500 text-white rounded-lg">
                  Reset Password
                </button>
              </div>
            </>
          )}
          {message && (
            <p className="text-center text-green-500 mt-4">{message}</p>
          )}
        </form>
      </div>
    </div>
  );
}

export default ForgotPassword;
