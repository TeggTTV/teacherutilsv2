'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

export default function NewsletterForm() {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');

        try {
            const response = await fetch('/api/newsletter', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (response.ok) {
                setStatus('success');
                setMessage('Successfully subscribed to the newsletter!');
                setEmail('');
            } else {
                setStatus('error');
                setMessage(data.error || 'Something went wrong. Please try again.');
            }
        } catch {
            setStatus('error');
            setMessage('Something went wrong. Please try again.');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    required
                />
            </div>
            
            <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={status === 'loading'}
                className={`w-full px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-200 shadow-lg hover:shadow-xl
                    ${status === 'loading' 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
            >
                {status === 'loading' ? 'Sending...' : 'Subscribe'}
            </motion.button>

            {message && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`text-center p-2 rounded ${
                        status === 'success' ? 'text-green-600' : 'text-red-600'
                    }`}
                >
                    {message}
                </motion.div>
            )}
        </form>
    );
}
