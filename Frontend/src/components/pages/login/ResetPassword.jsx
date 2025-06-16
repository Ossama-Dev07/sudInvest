import React, { useState } from 'react';
import axios from 'axios';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Lock, Loader2, ArrowLeft, CheckCircle } from 'lucide-react';
import { toast } from "react-toastify";

const ResetPassword = () => {
    const { search } = useLocation();
    const navigate = useNavigate();
    const params = new URLSearchParams(search);
    const token = params.get('token');
    const email = params.get('email');

    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        // Client-side validation
        if (password !== passwordConfirmation) {
            toast.error('Les mots de passe ne correspondent pas', {
                position: "top-right",
                autoClose: 5000,
            });
            setLoading(false);
            return;
        }

        if (password.length < 8) {
            toast.error('Le mot de passe doit contenir au moins 8 caractères', {
                position: "top-right",
                autoClose: 5000,
            });
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
            
            // Success toast
            toast.success('Mot de passe réinitialisé avec succès ! Redirection vers la connexion...', {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
            
            // Redirect to login page after success
            setTimeout(() => navigate('/login'), 3000);
        } catch (err) {
            console.error('Reset password error:', err);
            
            let errorMessage = 'Une erreur s\'est produite lors de la réinitialisation';
            
            if (err.response?.data?.errors) {
                // Handle validation errors
                const errors = Object.values(err.response.data.errors).flat();
                errorMessage = errors.join(', ');
            } else if (err.response?.data?.error) {
                const error = err.response.data.error;
                
                // Translate common error messages
                if (error === 'Invalid reset token') {
                    errorMessage = 'Token de réinitialisation invalide ou expiré';
                } else if (error === 'Reset token has expired') {
                    errorMessage = 'Le lien de réinitialisation a expiré';
                } else if (error === 'User not found') {
                    errorMessage = 'Utilisateur non trouvé';
                } else if (error === 'Validation failed') {
                    errorMessage = 'Données de validation incorrectes';
                } else {
                    errorMessage = error;
                }
            } else if (err.response?.data?.details) {
                errorMessage = err.response.data.details;
            }
            
            toast.error(errorMessage, {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
        } finally {
            setLoading(false);
        }
    };

    // Check if we have valid token and email
    if (!token || !email) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full text-center">
                    <div className="mx-auto h-12 w-12 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                        <Lock className="h-6 w-6 text-red-600 dark:text-red-400" />
                    </div>
                    <h2 className="mt-6 text-3xl font-bold text-gray-900 dark:text-white">
                        Lien invalide
                    </h2>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        Ce lien de réinitialisation est invalide ou a expiré. Veuillez demander un nouveau lien.
                    </p>
                    <div className="mt-6">
                        <Link
                            to="/forgot-password"
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            Demander un nouveau lien
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                {/* Header */}
                <div className="text-center">
                    <div className="mx-auto h-12 w-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                        <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                    <h2 className="mt-6 text-3xl font-bold text-gray-900 dark:text-white">
                        Réinitialiser le mot de passe
                    </h2>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        Entrez votre nouveau mot de passe ci-dessous
                    </p>
                </div>

                {/* Form */}
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    {/* New Password */}
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Nouveau mot de passe
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                id="password"
                                name="password"
                                type={showPassword ? 'text' : 'password'}
                                autoComplete="new-password"
                                required
                                minLength="8"
                                className="relative block w-full pl-10 pr-10 py-3 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                placeholder="Minimum 8 caractères"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <button
                                type="button"
                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? (
                                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                ) : (
                                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Confirm Password */}
                    <div>
                        <label htmlFor="passwordConfirmation" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Confirmer le mot de passe
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                id="passwordConfirmation"
                                name="passwordConfirmation"
                                type={showPasswordConfirmation ? 'text' : 'password'}
                                autoComplete="new-password"
                                required
                                minLength="8"
                                className="relative block w-full pl-10 pr-10 py-3 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                placeholder="Répétez le mot de passe"
                                value={passwordConfirmation}
                                onChange={(e) => setPasswordConfirmation(e.target.value)}
                            />
                            <button
                                type="button"
                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                onClick={() => setShowPasswordConfirmation(!showPasswordConfirmation)}
                            >
                                {showPasswordConfirmation ? (
                                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                ) : (
                                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Réinitialisation...
                                </>
                            ) : (
                                'Réinitialiser le mot de passe'
                            )}
                        </button>
                    </div>

                    {/* Back to login */}
                    <div className="text-center">
                        <Link
                            to="/login"
                            className="inline-flex items-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 font-medium transition-colors duration-200"
                        >
                            <ArrowLeft className="h-4 w-4 mr-1" />
                            Retour à la connexion
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword;