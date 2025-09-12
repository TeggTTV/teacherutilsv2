'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const faqs = [
    {
        question: "Is Compyy free to use?",
        answer: "Yes! Compyy offers a generous free tier that includes access to basic templates and features. Premium features are available with our Pro subscription, starting at $9.99/month."
    },
    {
        question: "Do I need technical skills to use Compyy?",
        answer: "Not at all! Our platform is designed to be user-friendly. If you can use PowerPoint, you can use Compyy to create engaging educational games."
    },
    {
        question: "Can I share games with other teachers?",
        answer: "Absolutely! You can easily share your games with colleagues through our teacher community marketplace or by sharing a direct link. Premium users can also create private sharing groups."
    },
    {
        question: "How do students access the games?",
        answer: "Students can access games through a simple link or code - no registration required. They can play on any device with a web browser, including smartphones and tablets."
    },
    {
        question: "What types of games can I create?",
        answer: "Compyy supports various game types including quiz shows, flashcards, memory games, word searches, crosswords, and more. Premium users get access to advanced game templates like escape rooms and interactive storytelling."
    },
    {
        question: "Can I track student progress?",
        answer: "Yes! Our basic analytics show participation rates and overall scores. Premium users get detailed insights including individual student performance, learning trends, and downloadable progress reports."
    },
    {
        question: "Is Compyy compatible with my school's LMS?",
        answer: "Yes! Compyy integrates with major Learning Management Systems including Google Classroom, Canvas, and Schoology. We also support single sign-on (SSO) for enterprise users."
    },
    {
        question: "What support options are available?",
        answer: "All users get access to our help center and community forums. Premium users receive priority email support, and enterprise customers get dedicated support managers."
    }
];

export default function Faq() {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    return (
        <div className="space-y-4">
            {faqs.map((faq, index) => (
                <div
                    key={index}
                    className="border border-gray-200 rounded-lg bg-white overflow-hidden"
                >
                    <button
                        className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 transition-colors duration-200"
                        onClick={() => setOpenIndex(openIndex === index ? null : index)}
                    >
                        <span className="text-lg font-semibold text-gray-900">{faq.question}</span>
                        <svg
                            className={`w-5 h-5 text-gray-500 transform transition-transform duration-200 ${
                                openIndex === index ? 'rotate-180' : ''
                            }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M19 9l-7 7-7-7"
                            />
                        </svg>
                    </button>
                    <AnimatePresence>
                        {openIndex === index && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                <div className="px-6 py-4 border-t border-gray-100">
                                    <p className="text-gray-600">{faq.answer}</p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            ))}
        </div>
    );
}
