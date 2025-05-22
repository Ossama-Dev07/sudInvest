import React, { useState } from 'react';
import axios from 'axios';

const ForgotPassword = () => {
    const [email_utilisateur, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post('http://localhost:8000/api/forgot-password', { email_utilisateur  });
            setMessage(response.data.message);
            setError('');
        } catch (err) {
            console.log(err)
            setError(err.response.data.error);
            setMessage('');
        }
    };

    return (
        <div>
            <h2>Forgot Password</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="email"
                    placeholder="Enter your email"
                    value={email_utilisateur}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <button type="submit">Send Reset Link</button>
            </form>
            {message && <div>{message}</div>}
            {error && <div>{error}</div>}
        </div>
    );
};

export default ForgotPassword;
