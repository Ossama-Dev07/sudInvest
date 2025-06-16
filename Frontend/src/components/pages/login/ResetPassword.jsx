import React, { useState } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';

const ResetPassword = () => {
    const { search } = useLocation();
    const navigate = useNavigate();
    const params = new URLSearchParams(search);
    const token = params.get('token');
    const email = params.get('email');

    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');

        // Validate passwords match
        if (password !== passwordConfirmation) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        // Validate password length
        if (password.length < 8) {
            setError('Password must be at least 8 characters long');
            setLoading(false);
            return;
        }

        try {
            const response = await axios.post('http://localhost:8000/api/reset-password', {
                token,
                email,
                password,
                password_confirmation: passwordConfirmation,
            });
            
            setMessage(response.data.message);
            setError('');
            
            // Redirect to login page after success
            setTimeout(() => navigate('/login'), 3000);
        } catch (err) {
            console.error('Reset password error:', err);
            
            if (err.response?.data?.errors) {
                // Handle validation errors
                const errors = Object.values(err.response.data.errors).flat();
                setError(errors.join(', '));
            } else if (err.response?.data?.error) {
                setError(err.response.data.error);
            } else if (err.response?.data?.details) {
                setError(err.response.data.details);
            } else {
                setError('An error occurred while resetting password');
            }
            setMessage('');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md mx-auto p-6">
            <h2 className="text-2xl font-bold text-center mb-6">Reset Password</h2>
            
            {!token || !email ? (
                <div className="text-red-500 text-center">
                    Invalid reset link. Please request a new password reset.
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <input
                            type="password"
                            placeholder="New Password (min 8 characters)"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength="8"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    
                    <div>
                        <input
                            type="password"
                            placeholder="Confirm New Password"
                            value={passwordConfirmation}
                            onChange={(e) => setPasswordConfirmation(e.target.value)}
                            required
                            minLength="8"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Resetting...' : 'Reset Password'}
                    </button>
                </form>
            )}
            
            {message && (
                <div className="mt-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
                    {message}
                </div>
            )}
            
            {error && (
                <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                    {error}
                </div>
            )}
        </div>
    );
};

export default ResetPassword;