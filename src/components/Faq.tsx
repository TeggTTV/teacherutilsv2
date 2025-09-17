'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const faqs = [
    {
        question: "Is Compyy free to use?",
        answer: "Yes! Compyy is a free-to-use platform that allows educators to create and share customizable games. For a monthly subscription, teachers will access premium features like other game types, styles, and templates. ",
        icon: "💰"
    },
    {
        question: "Do I need technical skills to use Compyy?",
        answer: "Compyy uses an intuitive UI to make sure that anyone can create engaging educational games without any design experience.",
        icon: "🎯"
    },
    // {
    //     question: "How do students access the games?",
    //     answer: "Students can access games through a simple link or code - no registration required. They can play on any device with a web browser, including smartphones and tablets.",
    //     icon: "📱"
    // },
    // {
    //     question: "What types of games can I create?",
    //     answer: "Compyy supports various game types including quiz shows, flashcards, memory games, word searches, crosswords, and more. Premium users get access to advanced game templates like escape rooms and interactive storytelling.",
    //     icon: "🎮"
    // }
];

export default function Faq() {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    return (
        <div>
            {/* Card Layout for Desktop/Tablet */}
            <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-2 gap-6">
                {faqs.map((faq, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        whileHover={{ y: -5 }}
                        className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-lg transition-all duration-300"
                    >
                        <div className="flex items-start space-x-4">
                            <div className="flex-shrink-0">
                                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <span className="text-2xl">{faq.icon}</span>
                                </div>
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                                    {faq.question}
                                </h3>
                                <p className="text-gray-600 leading-relaxed">
                                    {faq.answer}
                                </p>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Dropdown Layout for Mobile */}
            <div className="md:hidden space-y-4">
                {faqs.map((faq, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-300"
                    >
                        <motion.button
                            className="w-full px-6 py-5 text-left flex justify-between items-center hover:bg-gray-50 transition-all duration-200 rounded-xl"
                            onClick={() => setOpenIndex(openIndex === index ? null : index)}
                            whileTap={{ scale: 0.99 }}
                        >
                            <div className="flex items-center space-x-3">
                                <span className="text-xl">{faq.icon}</span>
                                <span className="text-lg font-semibold text-gray-900">{faq.question}</span>
                            </div>
                            
                            <motion.div
                                className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0"
                                animate={{
                                    rotate: openIndex === index ? 180 : 0,
                                    backgroundColor: openIndex === index ? '#3B82F6' : '#DBEAFE'
                                }}
                                transition={{ duration: 0.3 }}
                            >
                                <svg
                                    className={`w-4 h-4 transition-colors duration-300 ${
                                        openIndex === index ? 'text-white' : 'text-blue-600'
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
                            </motion.div>
                        </motion.button>
                        
                        <AnimatePresence>
                            {openIndex === index && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50">
                                        <motion.p
                                            className="text-gray-700 leading-relaxed"
                                            initial={{ y: -10, opacity: 0 }}
                                            animate={{ y: 0, opacity: 1 }}
                                            exit={{ y: -10, opacity: 0 }}
                                            transition={{ duration: 0.2, delay: 0.1 }}
                                        >
                                            {faq.answer}
                                        </motion.p>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
