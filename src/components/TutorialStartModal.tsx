import React from 'react';
import Modal from './Modal';

interface TutorialStartModalProps {
	open: boolean;
	onStart: () => void;
	onSkip: () => void;
}

const TutorialStartModal: React.FC<TutorialStartModalProps> = ({
	open,
	onStart,
	onSkip,
}) => {
	return (
		<Modal isOpen={open} onClose={onSkip} maxWidth="sm">
			<div className="p-6 text-center">
				<h2 className="text-2xl font-bold mb-4">
					Welcome to the Tutorial!
				</h2>
				<p className="mb-6">
					Would you like a quick walkthrough on how to create and play
					your first game?
				</p>
				<div className="flex justify-center gap-4">
					<button
						className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
						onClick={onStart}
					>
						Start Tutorial
					</button>
					<button
						className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 transition"
						onClick={onSkip}
					>
						Skip
					</button>
				</div>
			</div>
		</Modal>
	);
};

export default TutorialStartModal;
