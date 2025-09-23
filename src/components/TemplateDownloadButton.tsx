import { useState } from 'react';
import { motion } from 'framer-motion';

interface TemplateDownloadButtonProps {
    templateId: string;
    onDownload: () => Promise<void> | void;
}

export default function TemplateDownloadButton({ templateId, onDownload }: TemplateDownloadButtonProps) {
    const [downloadState, setDownloadState] = useState<'idle' | 'loading' | 'downloaded' | 'use'>('idle');

    const handleDownload = async () => {
        if (downloadState === 'use') {
            // Redirect to create new game with template
            window.location.href = `/create/question-set?template=${templateId}`;
            return;
        }

        setDownloadState('loading');
        
        try {
            await onDownload();
            setDownloadState('downloaded');
            
            // After 0.5 seconds, change to "Use Template" button
            setTimeout(() => {
                setDownloadState('use');
            }, 500);
        } catch (error) {
            console.error('Download failed:', error);
            setDownloadState('idle');
        }
    };

    const getButtonText = () => {
        switch (downloadState) {
            case 'loading':
                return 'Downloading...';
            case 'downloaded':
                return '✓ Downloaded';
            case 'use':
                return 'Use Template';
            default:
                return 'Download Template';
        }
    };

    const getButtonStyles = () => {
        switch (downloadState) {
            case 'loading':
                return 'bg-blue-400 cursor-not-allowed';
            case 'downloaded':
                return 'bg-green-600 text-white';
            case 'use':
                return 'bg-purple-600 hover:bg-purple-700 text-white';
            default:
                return 'bg-blue-500 hover:bg-blue-600 text-white';
        }
    };

    return (
        <motion.button
            onClick={handleDownload}
            disabled={downloadState === 'loading'}
            className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${getButtonStyles()}`}
            whileHover={downloadState !== 'loading' ? { scale: 1.02 } : {}}
            whileTap={downloadState !== 'loading' ? { scale: 0.98 } : {}}
        >
            <div className="flex items-center justify-center">
                {downloadState === 'loading' && (
                    <motion.div
                        className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    />
                )}
                {downloadState === 'downloaded' && (
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="mr-2"
                    >
                        ✓
                    </motion.div>
                )}
                {getButtonText()}
            </div>
        </motion.button>
    );
}