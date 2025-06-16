import React, { useState } from 'react';
import axios from 'axios';

const ForgotPassword = () => {
    const [email_utilisateur, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');

        try {
            const response = await axios.post('http://localhost:8000/api/forgot-password', { 
                email_utilisateur 
            });
            setMessage(response.data.message);
            setError('');
        } catch (err) {
            console.log('Error details:', err);
            
            // Handle different types of errors
            if (err.code === 'ERR_NETWORK' || err.code === 'ERR_CONNECTION_REFUSED') {
                setError('Cannot connect to server. Make sure Laravel server is running on http://localhost:8000');
            } else if (err.response?.data?.error) {
                setError(err.response.data.error);
            } else if (err.response?.data?.errors) {
                // Handle validation errors
                const errors = Object.values(err.response.data.errors).flat();
                setError(errors.join(', '));
            } else if (err.message) {
                setError(err.message);
            } else {
                setError('An unexpected error occurred');
            }
            setMessage('');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md mx-auto p-6">
            <h2 className="text-2xl font-bold text-center mb-6">Forgot Password</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <input
                        type="email"
                        placeholder="Enter your email"
                        value={email_utilisateur}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                
                <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? 'Sending...' : 'Send Reset Link'}
                </button>
            </form>
            
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

export default ForgotPassword;