import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Loader2 } from 'lucide-react';
import { toast } from "react-toastify";

const ForgotPassword = () => {
    const [email_utilisateur, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await axios.post('http://localhost:8000/api/forgot-password', { 
                email_utilisateur 
            });
            
            // Success toast
            toast.success('Lien de réinitialisation envoyé avec succès ! Vérifiez votre email.', {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
            navigate('/login');
            // Clear the email field
            setEmail('');
        } catch (err) {
            console.log('Error details:', err);
            
            let errorMessage = 'Une erreur inattendue s\'est produite';
            
            // Handle different types of errors
            if (err.code === 'ERR_NETWORK' || err.code === 'ERR_CONNECTION_REFUSED') {
                errorMessage = 'Impossible de se connecter au serveur. Vérifiez que le serveur Laravel fonctionne.';
            } else if (err.response?.data?.error) {
                // Translate common error messages
                const error = err.response.data.error;
                if (error === 'User not found') {
                    errorMessage = 'Aucun utilisateur trouvé avec cette adresse email.';
                } else if (error === 'Invalid email format') {
                    errorMessage = 'Format d\'email invalide.';
                } else {
                    errorMessage = error;
                }
            } else if (err.response?.data?.errors) {
                // Handle validation errors
                const errors = Object.values(err.response.data.errors).flat();
                errorMessage = errors.join(', ');
            } else if (err.message) {
                errorMessage = err.message;
            }
            
            // Error toast
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

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                {/* Header */}
                <div className="text-center">
                    <div className="mx-auto h-12 w-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                        <Mail className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h2 className="mt-6 text-3xl font-bold text-gray-900 dark:text-white">
                        Mot de passe oublié ?
                    </h2>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        Pas de problème ! Entrez votre email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
                    </p>
                </div>

                {/* Form */}
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="email" className="sr-only">
                            Adresse email
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Mail className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                className="relative block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                                placeholder="Votre adresse email"
                                value={email_utilisateur}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Envoi en cours...
                                </>
                            ) : (
                                'Envoyer le lien de réinitialisation'
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

export default ForgotPassword;