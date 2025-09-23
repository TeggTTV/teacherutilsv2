'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

interface TemplateDownloadButtonProps {
	templateId: string;
	onDownload: (templateId: string) => Promise<void>;
	onUse: (templateId: string) => void;
}

type ButtonState = 'download' | 'loading' | 'downloaded' | 'use';

export default function TemplateDownloadButton({ 
	templateId, 
	onDownload, 
	onUse 
}: TemplateDownloadButtonProps) {
	const [state, setState] = useState<ButtonState>('download');

	const handleClick = async () => {
		if (state === 'download') {
			setState('loading');
			try {
				await onDownload(templateId);
				setState('downloaded');
				
				// After 500ms, change to "Use Template"
				setTimeout(() => {
					setState('use');
				}, 500);
			} catch (error) {
				console.error('Download failed:', error);
				setState('download');
			}
		} else if (state === 'use') {
			onUse(templateId);
		}
	};

	const getButtonContent = () => {
		switch (state) {
			case 'download':
				return (
					<>
						<svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
						</svg>
						Download
					</>
				);
			case 'loading':
				return (
					<>
						<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
						Downloading...
					</>
				);
			case 'downloaded':
				return (
					<>
						<motion.svg 
							className="w-4 h-4 mr-2 text-green-500" 
							fill="currentColor" 
							viewBox="0 0 20 20"
							initial={{ scale: 0 }}
							animate={{ scale: 1 }}
							transition={{ type: "spring", stiffness: 500, damping: 30 }}
						>
							<path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
						</motion.svg>
						Downloaded
					</>
				);
			case 'use':
				return (
					<>
						<svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
						</svg>
						Use Template
					</>
				);
		}
	};

	const getButtonColor = () => {
		switch (state) {
			case 'download':
				return 'bg-blue-500 hover:bg-blue-600 text-white';
			case 'loading':
				return 'bg-blue-500 text-white cursor-not-allowed';
			case 'downloaded':
				return 'bg-green-600 text-white cursor-default';
			case 'use':
				return 'bg-purple-600 hover:bg-purple-700 text-white';
		}
	};

	return (
		<motion.button
			onClick={handleClick}
			disabled={state === 'loading' || state === 'downloaded'}
			className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center justify-center ${getButtonColor()}`}
			whileHover={state !== 'loading' && state !== 'downloaded' ? { scale: 1.02 } : {}}
			whileTap={state !== 'loading' && state !== 'downloaded' ? { scale: 0.98 } : {}}
		>
			{getButtonContent()}
		</motion.button>
	);
}