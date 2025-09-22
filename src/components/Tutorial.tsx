import React, { useEffect, useRef, useState } from 'react';

interface TutorialStep {
	selector: string; // CSS selector for the target element
	title: string;
	description: string;
}

interface TutorialProps {
	steps: TutorialStep[];
	open: boolean;
	onClose: () => void;
	initialStep?: number;
}

const Tutorial: React.FC<TutorialProps> = ({
	steps,
	open,
	onClose,
	initialStep = 0,
}) => {
	const [current, setCurrent] = useState(initialStep);
	const [position, setPosition] = useState<{
		top: number;
		left: number;
	} | null>(null);
	const [direction, setDirection] = useState<'next' | 'prev' | null>(null);
	const windowRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!open) return;
		const step = steps[current];
		const el = document.querySelector(step.selector) as HTMLElement;
		if (el) {
			const rect = el.getBoundingClientRect();
			setPosition({
				top: rect.top + window.scrollY + rect.height + 8,
				left: rect.left + window.scrollX,
			});
		} else {
			setPosition(null);
		}
	}, [current, open, steps]);

	useEffect(() => {
		if (!open) setCurrent(initialStep);
	}, [open, initialStep]);

	if (!open) return null;

	const step = steps[current];

	return (
		<div className="fixed inset-0 z-[1000] pointer-events-none">
			{/* Overlay */}
			<div
				className="fixed inset-0 bg-black/50 pointer-events-auto"
				onClick={onClose}
			/>
			{/* Tutorial window */}
			<div
				ref={windowRef}
				className={`absolute bg-white rounded-lg shadow-lg p-6 w-80 transition-transform duration-500 pointer-events-auto ${
					direction === 'next'
						? 'animate-fly-in-right'
						: direction === 'prev'
						? 'animate-fly-in-left'
						: ''
				}`}
				style={
					position
						? { top: position.top, left: position.left }
						: {
								top: '40%',
								left: '50%',
								transform: 'translate(-50%, -50%)',
						  }
				}
			>
				<h3 className="font-bold text-lg mb-2">{step.title}</h3>
				<p className="mb-4 text-sm text-gray-700">{step.description}</p>
				<div className="flex justify-between">
					<button
						className="px-3 py-1 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 transition"
						onClick={() => {
							setDirection('prev');
							setTimeout(
								() => setCurrent((c) => Math.max(0, c - 1)),
								100
							);
						}}
						disabled={current === 0}
					>
						Previous
					</button>
					<button
						className="px-3 py-1 rounded bg-blue-500 primary text-white hover:bg-blue-600 transition"
						onClick={() => {
							setDirection('next');
							setTimeout(
								() =>
									setCurrent((c) =>
										Math.min(steps.length - 1, c + 1)
									),
								100
							);
						}}
						disabled={current === steps.length - 1}
					>
						Next
					</button>
				</div>
				<button
					className="absolute top-2 right-2 text-gray-400 hover:text-gray-700"
					onClick={onClose}
					aria-label="Close tutorial"
				>
					×
				</button>
			</div>
			<style jsx global>{`
				@keyframes fly-in-right {
					0% {
						transform: translateX(100vw);
						opacity: 0;
					}
					100% {
						transform: translateX(0);
						opacity: 1;
					}
				}
				@keyframes fly-in-left {
					0% {
						transform: translateX(-100vw);
						opacity: 0;
					}
					100% {
						transform: translateX(0);
						opacity: 1;
					}
				}
				.animate-fly-in-right {
					animation: fly-in-right 0.5s;
				}
				.animate-fly-in-left {
					animation: fly-in-left 0.5s;
				}
			`}</style>
		</div>
	);
};

export type { TutorialStep };
export default Tutorial;
