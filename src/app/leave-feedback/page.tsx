'use client';

import React, { useState } from 'react';

import { motion, AnimatePresence } from 'framer-motion';

const LeaveFeedback: React.FC = () => {
	const [feedback, setFeedback] = useState('');
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [submitStatus, setSubmitStatus] = useState<
		'idle' | 'success' | 'error'
	>('idle');

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsSubmitting(true);
		setSubmitStatus('idle');
		try {
			const res = await fetch('/api/feedback', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ feedback }),
			});
			if (res.ok) {
				setSubmitStatus('success');
				setFeedback('');
			} else {
				setSubmitStatus('error');
			}
		} catch {
			setSubmitStatus('error');
		}
		setIsSubmitting(false);
	};

	return (
		<div className="min-h-screen bg-gray-50">
			<div className="max-w-2xl mx-auto py-12 px-4">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5 }}
					className="bg-white rounded-lg shadow-md p-8"
				>
					<h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">
						Leave Feedback
					</h1>
					<p className="mb-6 text-gray-600 text-center">
						We value your feedback! Please let us know your
						thoughts, suggestions, or issues below.
					</p>
					<form onSubmit={handleSubmit} className="space-y-6">
						<div>
							<label
								htmlFor="feedback"
								className="block text-sm font-medium text-gray-700 mb-2"
							>
								Feedback *
							</label>
							<textarea
								id="feedback"
								className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
								rows={6}
								placeholder="Type your feedback here..."
								value={feedback}
								onChange={(e) => setFeedback(e.target.value)}
								required
								disabled={isSubmitting}
							/>
						</div>
						<div className="flex justify-end">
							<motion.button
								type="submit"
								disabled={
									isSubmitting || submitStatus === 'success'
								}
								className={`px-2 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium flex items-center justify-between min-w-[140px] ${
									isSubmitting ? 'disabled:bg-blue-400' : ''
								}`}
								whileHover={{
									scale:
										isSubmitting ||
										submitStatus === 'success'
											? 1
											: 1.05,
								}}
							>
								<AnimatePresence mode="wait">
									{isSubmitting && (
										<motion.div
											key="spinner"
											initial={{ opacity: 0, scale: 0.8 }}
											animate={{ opacity: 1, scale: 1 }}
											exit={{ opacity: 0, scale: 0.8 }}
											className="flex items-center justify-center"
										>
											<svg
												className="animate-spin h-5 w-5 mr-2 text-white"
												viewBox="0 0 24 24"
											>
												<circle
													className="opacity-25"
													cx="12"
													cy="12"
													r="10"
													stroke="currentColor"
													strokeWidth="4"
													fill="none"
												/>
												<path
													className="opacity-75"
													fill="currentColor"
													d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
												/>
											</svg>
											Submitting...
										</motion.div>
									)}
									{submitStatus === 'success' && (
										<motion.div
											key="check"
											initial={{ opacity: 0, scale: 0.8 }}
											animate={{ opacity: 1, scale: 1 }}
											exit={{ opacity: 0, scale: 0.8 }}
											className="w-full flex items-center justify-center"
										>
											Submitted!
										</motion.div>
									)}
									{submitStatus === 'error' && (
										<motion.div
											key="error"
											initial={{ opacity: 0, scale: 0.8 }}
											animate={{ opacity: 1, scale: 1 }}
											exit={{ opacity: 0, scale: 0.8 }}
											className="flex items-center gap-3 justify-center w-full"
										>
											{/* <span className="inline-flex items-center text-green-700 font-semibold">
												❌
											</span> */}
											Try Again
										</motion.div>
									)}
									{submitStatus === 'idle' &&
										!isSubmitting && (
											<motion.span
												key="text"
												initial={{ opacity: 0 }}
												animate={{ opacity: 1 }}
												exit={{ opacity: 0 }}
											>
												Submit Feedback
											</motion.span>
										)}
								</AnimatePresence>
							</motion.button>
						</div>
					</form>
					{submitStatus === 'success' && (
						<motion.div
							initial={{ opacity: 0, scale: 0.8 }}
							animate={{ opacity: 1, scale: 1 }}
							exit={{ opacity: 0, scale: 0.8 }}
							className="flex flex-col items-center justify-center mt-4"
						>
							<svg
								className="h-8 w-8 text-green-400 mb-2"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<motion.path
									initial={{ pathLength: 0 }}
									animate={{ pathLength: 1 }}
									transition={{ duration: 0.5 }}
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M5 13l4 4L19 7"
								/>
							</svg>
							<span className="text-green-700 font-medium">
								Feedback submitted!
							</span>
						</motion.div>
					)}
					{submitStatus === 'error' && (
						<motion.div
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							className="mt-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg text-center"
						>
							Sorry, there was an error submitting your feedback.
							Please try again.
						</motion.div>
					)}
				</motion.div>
			</div>
		</div>
	);
};

export default LeaveFeedback;
