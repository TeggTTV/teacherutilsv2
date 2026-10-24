'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Question {
	id: string;
	value: number;
	question: string;
	answer: string;
	funFact?: string;
	difficulty?: 'easy' | 'medium' | 'hard';
}

interface Category {
	id: string;
	name: string;
	icon: string;
	description: string;
	questions: Question[];
}

interface Team {
	id: string;
	name: string;
	score: number;
	color: string;
}

// 5 Categories with 5 questions each ($100 - $500)
const aiGameData: { title: string; subtitle: string; categories: Category[] } =
	{
		title: 'THE AI GAME SHOW',
		subtitle: 'Neural Clash: Smartboard Edition',
		categories: [
			{
				id: 'history',
				name: 'AI History & Pioneers',
				icon: '🏛️',
				description:
					'The legends and breakthroughs that started it all',
				questions: [
					{
						id: 'hist-100',
						value: 100,
						question:
							'Often called the father of modern computer science and AI, he proposed the "Imitation Game" in 1950.',
						answer: 'Alan Turing',
						funFact:
							'The Turing test was originally introduced in his paper "Computing Machinery and Intelligence".',
					},
					{
						id: 'hist-200',
						value: 200,
						question:
							'In 1997, this IBM supercomputer made history by defeating World Chess Champion Garry Kasparov.',
						answer: 'Deep Blue',
						funFact:
							'Deep Blue could evaluate 200 million chess positions per second.',
					},
					{
						id: 'hist-300',
						value: 300,
						question:
							'The term "Artificial Intelligence" was officially coined in 1956 during a landmark summer workshop at this Ivy League college.',
						answer: 'Dartmouth College',
						funFact:
							'Organized by John McCarthy, Marvin Minsky, Nathaniel Rochester, and Claude Shannon.',
					},
					{
						id: 'hist-400',
						value: 400,
						question:
							'In 2016, DeepMind’s AlphaGo stunned the world by defeating 18-time world champion Lee Sedol in this ancient board game.',
						answer: 'Go',
						funFact:
							'Move 37 in Game 2 had a 1-in-10,000 chance of being played by a human expert.',
					},
					{
						id: 'hist-500',
						value: 500,
						question:
							'Periods in history where AI funding and public interest dropped drastically due to unmet hype are known by this chilly two-word term.',
						answer: 'AI Winter',
						funFact:
							'Major AI winters occurred in the mid-1970s and late 1980s.',
					},
				],
			},
			{
				id: 'llms',
				name: 'LLMs & Chatbots',
				icon: '🤖',
				description:
					'Frontier models, prompt engineering, and transformers',
				questions: [
					{
						id: 'llm-100',
						value: 100,
						question:
							'In modern generative AI like ChatGPT, the letter "T" in GPT stands for this neural network architecture.',
						answer: 'Transformer',
						funFact:
							'The Transformer architecture was introduced by Google researchers in 2017.',
					},
					{
						id: 'llm-200',
						value: 200,
						question:
							'When an AI model confidently invents incorrect facts or bogus citations, it is said to be having this.',
						answer: 'Hallucination',
						funFact:
							'Techniques like RAG (Retrieval-Augmented Generation) help ground models with external facts.',
					},
					{
						id: 'llm-300',
						value: 300,
						question:
							'This famous 2017 Google Research paper introduced the transformer and revolutionized NLP with just eight words in its title.',
						answer: 'Attention Is All You Need',
						funFact:
							'It replaced recurrent networks with self-attention mechanisms.',
					},
					{
						id: 'llm-400',
						value: 400,
						question:
							'This technique aligns language models with human values and preferences using human feedback ratings.',
						answer: 'RLHF (Reinforcement Learning from Human Feedback)',
						funFact:
							'RLHF was crucial in transforming GPT-3 into conversational InstructGPT and ChatGPT.',
					},
					{
						id: 'llm-500',
						value: 500,
						question:
							'The number of inputs a model can process at one time (measured in words or subwords) is called this window.',
						answer: 'Context Window (or Context Length)',
						funFact:
							'Modern models can now handle context windows of over one to two million tokens.',
					},
				],
			},
			{
				id: 'popculture',
				name: 'Sci-Fi & Pop Culture',
				icon: '🎬',
				description:
					'Hollywood sentient robots, cyborgs, and supercomputers',
				questions: [
					{
						id: 'pop-100',
						value: 100,
						question:
							'In "2001: A Space Odyssey", this soft-spoken AI calmly utters: "I’m sorry, Dave. I’m afraid I can’t do that."',
						answer: 'HAL 9000',
						funFact:
							'Shifting HAL’s letters forward by one in the alphabet yields IBM.',
					},
					{
						id: 'pop-200',
						value: 200,
						question:
							'In the Marvel Cinematic Universe, Tony Stark’s virtual assistant and AI companion is named this.',
						answer: 'J.A.R.V.I.S. (Just A Rather Very Intelligent System)',
						funFact:
							'He was later uploaded into the Synthezoid body to become Vision.',
					},
					{
						id: 'pop-300',
						value: 300,
						question:
							'In "The Terminator" franchise, this defense network becomes self-aware on August 29, 1997 and initiates Judgment Day.',
						answer: 'Skynet',
						funFact:
							'In later films, alternate timelines gave rise to Legion.',
					},
					{
						id: 'pop-400',
						value: 400,
						question:
							'Science fiction author Isaac Asimov formulated these fundamental rules for robotic behavior in his 1942 story "Runaround".',
						answer: 'The Three Laws of Robotics',
						funFact:
							'He later introduced the "Zeroth Law": A robot may not harm humanity.',
					},
					{
						id: 'pop-500',
						value: 500,
						question:
							'In the 2013 movie "Her", Joaquin Phoenix falls in love with an advanced operating system named Samantha, voiced by this actress.',
						answer: 'Scarlett Johansson',
						funFact:
							'The film explores intimacy, loneliness, and rapid intelligence expansion.',
					},
				],
			},
			{
				id: 'howitworks',
				name: 'How AI Works',
				icon: '🧠',
				description: 'Weights, training, vision, and algorithms',
				questions: [
					{
						id: 'how-100',
						value: 100,
						question:
							'Machine learning algorithms learn by updating numeric parameters that determine how strongly signals pass between nodes, called these.',
						answer: 'Weights and Biases',
						funFact:
							'Frontier LLMs have hundreds of billions or even trillions of these parameters.',
					},
					{
						id: 'how-200',
						value: 200,
						question:
							'When a model memorizes its training data so closely that it performs terribly on new, unseen data, it has committed this error.',
						answer: 'Overfitting',
						funFact:
							'Dropout and regularization are standard methods used to prevent overfitting.',
					},
					{
						id: 'how-300',
						value: 300,
						question:
							'This core algorithm computes gradient derivatives backward from the output layer to efficiently update all network weights.',
						answer: 'Backpropagation',
						funFact:
							'Popularized by Rumelhart, Hinton, and Williams in 1986.',
					},
					{
						id: 'how-400',
						value: 400,
						question:
							'Image generators like Midjourney and Stable Diffusion create images by gradually removing noise using this family of models.',
						answer: 'Diffusion Models',
						funFact:
							'They were inspired by nonequilibrium thermodynamics in physics.',
					},
					{
						id: 'how-500',
						value: 500,
						question:
							'This high-dimensional numeric vector representation translates words or images into mathematical space where similar meanings cluster together.',
						answer: 'Embeddings (or Vector Embeddings)',
						funFact:
							'King - Man + Woman = Queen is the classic example from Word2Vec.',
					},
				],
			},
			{
				id: 'future',
				name: 'Frontiers & Ethics',
				icon: '⚡',
				description: 'AGI, safety, quantum, and robotics',
				questions: [
					{
						id: 'fut-100',
						value: 100,
						question:
							'This 3-letter acronym refers to hypothetical AI with human-level intelligence across virtually all economically valuable work.',
						answer: 'AGI (Artificial General Intelligence)',
						funFact:
							'Above AGI lies ASI (Artificial Superintelligence).',
					},
					{
						id: 'fut-200',
						value: 200,
						question:
							'In 2024, the Nobel Prize in Physics was awarded to John Hopfield and Geoffrey Hinton for foundational discoveries in this field.',
						answer: 'Artificial Neural Networks / Machine Learning',
						funFact:
							'Demis Hassabis and John Jumper also won the 2024 Nobel Prize in Chemistry for AlphaFold.',
					},
					{
						id: 'fut-300',
						value: 300,
						question:
							'This theoretical future point in time occurs when runaway technological growth triggers unpredictable, irreversible changes to human civilization.',
						answer: 'The Technological Singularity',
						funFact:
							'Popularized by mathematician Vernor Vinge and futurist Ray Kurzweil.',
					},
					{
						id: 'fut-400',
						value: 400,
						question:
							'The challenge of ensuring an AI system’s goals and behavior stay matched with human ethics and intent is known as the AI ______ problem.',
						answer: 'Alignment Problem',
						funFact:
							'Nick Bostrom famously illustrated misalignment risks with the "paperclip maximizer" thought experiment.',
					},
					{
						id: 'fut-500',
						value: 500,
						question:
							'In 2024, the European Union approved the world’s first major comprehensive legal framework regulating AI, titled this.',
						answer: 'The EU AI Act',
						funFact:
							'It categorizes AI systems based on risk: unacceptable, high, specific transparency, and minimal risk.',
					},
				],
			},
		],
	};

const DEFAULT_TEAMS: Team[] = [
	{
		id: '1',
		name: 'Alpha Team',
		score: 0,
		color: 'from-blue-600 to-indigo-600',
	},
	{
		id: '2',
		name: 'Beta Team',
		score: 0,
		color: 'from-violet-600 to-purple-600',
	},
	{
		id: '3',
		name: 'Gamma Team',
		score: 0,
		color: 'from-emerald-600 to-teal-600',
	},
	{
		id: '4',
		name: 'Delta Team',
		score: 0,
		color: 'from-amber-600 to-orange-600',
	},
];

export default function Home() {
	// Game states
	const [teams, setTeams] = useState<Team[]>(DEFAULT_TEAMS);
	const [activeTeamCount, setActiveTeamCount] = useState<number>(2);
	const [answeredIds, setAnsweredIds] = useState<Set<string>>(new Set());
	const [gameState, setGameState] = useState<
		'board' | 'question' | 'teamSelect' | 'winner'
	>('board');
	const [currentQuestion, setCurrentQuestion] = useState<{
		category: Category;
		question: Question;
	} | null>(null);

	// Timer
	const [timerSeconds, setTimerSeconds] = useState<number>(30);
	const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
	const timerRef = useRef<NodeJS.Timeout | null>(null);

	// Smartboard sound effects (Web Audio API synthesizers - zero external asset dependencies)
	const playSound = (
		type: 'open' | 'reveal' | 'correct' | 'wrong' | 'tick' | 'win',
	) => {
		try {
			const AudioContextClass =
				window.AudioContext ||
				(
					window as unknown as {
						webkitAudioContext: typeof AudioContext;
					}
				).webkitAudioContext;
			if (!AudioContextClass) return;
			const ctx = new AudioContextClass();

			if (type === 'open') {
				const osc = ctx.createOscillator();
				const gain = ctx.createGain();
				osc.type = 'triangle';
				osc.frequency.setValueAtTime(320, ctx.currentTime);
				osc.frequency.exponentialRampToValueAtTime(
					740,
					ctx.currentTime + 0.25,
				);
				gain.gain.setValueAtTime(0.2, ctx.currentTime);
				gain.gain.exponentialRampToValueAtTime(
					0.01,
					ctx.currentTime + 0.25,
				);
				osc.connect(gain);
				gain.connect(ctx.destination);
				osc.start();
				osc.stop(ctx.currentTime + 0.26);
			} else if (type === 'reveal') {
				const osc = ctx.createOscillator();
				const gain = ctx.createGain();
				osc.type = 'sine';
				osc.frequency.setValueAtTime(440, ctx.currentTime);
				osc.frequency.exponentialRampToValueAtTime(
					880,
					ctx.currentTime + 0.3,
				);
				gain.gain.setValueAtTime(0.25, ctx.currentTime);
				gain.gain.exponentialRampToValueAtTime(
					0.01,
					ctx.currentTime + 0.3,
				);
				osc.connect(gain);
				gain.connect(ctx.destination);
				osc.start();
				osc.stop(ctx.currentTime + 0.31);
			} else if (type === 'correct') {
				[523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
					const osc = ctx.createOscillator();
					const gain = ctx.createGain();
					osc.type = 'sine';
					osc.frequency.setValueAtTime(
						freq,
						ctx.currentTime + idx * 0.08,
					);
					gain.gain.setValueAtTime(0.2, ctx.currentTime + idx * 0.08);
					gain.gain.exponentialRampToValueAtTime(
						0.01,
						ctx.currentTime + idx * 0.08 + 0.25,
					);
					osc.connect(gain);
					gain.connect(ctx.destination);
					osc.start(ctx.currentTime + idx * 0.08);
					osc.stop(ctx.currentTime + idx * 0.08 + 0.26);
				});
			} else if (type === 'wrong') {
				const osc = ctx.createOscillator();
				const gain = ctx.createGain();
				osc.type = 'sawtooth';
				osc.frequency.setValueAtTime(180, ctx.currentTime);
				osc.frequency.linearRampToValueAtTime(
					110,
					ctx.currentTime + 0.35,
				);
				gain.gain.setValueAtTime(0.25, ctx.currentTime);
				gain.gain.exponentialRampToValueAtTime(
					0.01,
					ctx.currentTime + 0.35,
				);
				osc.connect(gain);
				gain.connect(ctx.destination);
				osc.start();
				osc.stop(ctx.currentTime + 0.36);
			} else if (type === 'tick') {
				const osc = ctx.createOscillator();
				const gain = ctx.createGain();
				osc.type = 'triangle';
				osc.frequency.setValueAtTime(880, ctx.currentTime);
				gain.gain.setValueAtTime(0.05, ctx.currentTime);
				gain.gain.exponentialRampToValueAtTime(
					0.001,
					ctx.currentTime + 0.05,
				);
				osc.connect(gain);
				gain.connect(ctx.destination);
				osc.start();
				osc.stop(ctx.currentTime + 0.05);
			} else if (type === 'win') {
				const chord = [440, 554.37, 659.25, 880];
				chord.forEach((freq) => {
					const osc = ctx.createOscillator();
					const gain = ctx.createGain();
					osc.type = 'sine';
					osc.frequency.setValueAtTime(freq, ctx.currentTime);
					gain.gain.setValueAtTime(0.15, ctx.currentTime);
					gain.gain.exponentialRampToValueAtTime(
						0.01,
						ctx.currentTime + 0.8,
					);
					osc.connect(gain);
					gain.connect(ctx.destination);
					osc.start();
					osc.stop(ctx.currentTime + 0.82);
				});
			}
		} catch {
			// AudioContext may be blocked before first interaction
		}
	};

	// Timer ticker
	useEffect(() => {
		if (isTimerRunning && timerSeconds > 0) {
			timerRef.current = setTimeout(() => {
				setTimerSeconds((prev) => {
					if (prev <= 1) {
						setIsTimerRunning(false);
						playSound('wrong');
						setGameState('teamSelect');
						return 0;
					}
					if (prev <= 6) {
						playSound('tick');
					}
					return prev - 1;
				});
			}, 1000);
		}
		return () => {
			if (timerRef.current) clearTimeout(timerRef.current);
		};
	}, [isTimerRunning, timerSeconds]);

	const selectQuestion = (category: Category, question: Question) => {
		if (answeredIds.has(question.id)) return;
		playSound('open');
		setCurrentQuestion({ category, question });
		setTimerSeconds(30);
		setIsTimerRunning(true);
		setGameState('question');
	};

	const showAnswer = () => {
		if (timerRef.current) clearTimeout(timerRef.current);
		setIsTimerRunning(false);
		playSound('reveal');
		setGameState('teamSelect');
	};

	const awardPoints = (teamId: string) => {
		if (!currentQuestion) return;
		playSound('correct');
		const points = currentQuestion.question.value;

		setTeams((prev) =>
			prev.map((t) =>
				t.id === teamId ? { ...t, score: t.score + points } : t,
			),
		);

		const updatedAnswered = new Set(answeredIds);
		updatedAnswered.add(currentQuestion.question.id);
		setAnsweredIds(updatedAnswered);

		const totalQuestionCount = aiGameData.categories.reduce(
			(acc, cat) => acc + cat.questions.length,
			0,
		);

		if (updatedAnswered.size >= totalQuestionCount) {
			playSound('win');
			setGameState('winner');
		} else {
			setGameState('board');
			setCurrentQuestion(null);
		}
	};

	const skipQuestion = () => {
		if (!currentQuestion) return;
		playSound('wrong');
		const updatedAnswered = new Set(answeredIds);
		updatedAnswered.add(currentQuestion.question.id);
		setAnsweredIds(updatedAnswered);

		const totalQuestionCount = aiGameData.categories.reduce(
			(acc, cat) => acc + cat.questions.length,
			0,
		);

		if (updatedAnswered.size >= totalQuestionCount) {
			playSound('win');
			setGameState('winner');
		} else {
			setGameState('board');
			setCurrentQuestion(null);
		}
	};

	const adjustScore = (teamId: string, amount: number) => {
		setTeams((prev) =>
			prev.map((t) =>
				t.id === teamId ? { ...t, score: t.score + amount } : t,
			),
		);
	};

	const updateTeamName = (teamId: string, name: string) => {
		setTeams((prev) =>
			prev.map((t) => (t.id === teamId ? { ...t, name } : t)),
		);
	};

	const resetGame = () => {
		setTeams(DEFAULT_TEAMS);
		setAnsweredIds(new Set());
		setGameState('board');
		setCurrentQuestion(null);
		setIsTimerRunning(false);
	};

	const activeTeams = teams.slice(0, activeTeamCount);
	const totalQuestions = aiGameData.categories.reduce(
		(acc, cat) => acc + cat.questions.length,
		0,
	);
	const answeredCount = answeredIds.size;

	// Sort teams for winner podium
	const sortedTeams = [...activeTeams].sort((a, b) => b.score - a.score);

	return (
		<div className="min-h-screen h-screen flex flex-col bg-slate-950 text-slate-100 overflow-hidden font-sans">
			{/* Top Header & Smartboard Controls */}
			<header className="flex-none bg-slate-900/90 border-b border-cyan-500/20 backdrop-blur px-4 py-2 flex items-center justify-between z-20">
				<div className="flex items-center gap-3">
					<div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center font-black text-xl shadow-lg shadow-cyan-500/25">
						AI
					</div>
					<div>
						<h1 className="text-lg md:text-xl font-black tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-300">
							{aiGameData.title}
						</h1>
						<p className="text-xs text-slate-400 font-medium hidden sm:block">
							{aiGameData.subtitle}
						</p>
					</div>
				</div>

				{/* Progress and Room Settings */}
				<div className="flex items-center gap-3 sm:gap-6">
					{/* Progress Pill */}
					<div className="bg-slate-800/80 px-3 py-1.5 rounded-full border border-slate-700/60 flex items-center gap-2 text-xs md:text-sm font-semibold text-slate-300">
						<span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
						<span>
							{answeredCount} / {totalQuestions} answered
						</span>
					</div>

					{/* Team Count Switcher */}
					<div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700/60">
						<span className="text-xs text-slate-400 px-2 font-semibold">
							Teams:
						</span>
						{[2, 3, 4].map((count) => (
							<button
								key={count}
								onClick={() => setActiveTeamCount(count)}
								className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
									activeTeamCount === count
										? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30'
										: 'text-slate-400 hover:text-white'
								}`}
							>
								{count}
							</button>
						))}
					</div>

					{/* Reset button */}
					<button
						onClick={resetGame}
						title="Reset all questions and scores"
						className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-rose-500/30 text-rose-300 hover:bg-rose-500/20 active:scale-95 transition-all cursor-pointer"
					>
						Reset
					</button>
				</div>
			</header>

			{/* Main Workspace (Board / Question Modal / Winner) */}
			<main className="flex-1 relative flex flex-col overflow-hidden">
				<AnimatePresence mode="wait">
					{/* GAME BOARD VIEW */}
					{gameState === 'board' && (
						<motion.div
							key="board"
							initial={{ opacity: 0, scale: 0.98 }}
							animate={{ opacity: 1, scale: 1 }}
							exit={{ opacity: 0, scale: 1.02 }}
							transition={{ duration: 0.25 }}
							className="flex-1 flex flex-col p-2 md:p-3 overflow-hidden"
						>
							<div
								className="flex-1 grid gap-2 md:gap-3 h-full"
								style={{
									gridTemplateColumns: `repeat(${aiGameData.categories.length}, minmax(0, 1fr))`,
								}}
							>
								{aiGameData.categories.map((category) => (
									<div
										key={category.id}
										className="flex flex-col gap-2 h-full min-h-0"
									>
										{/* Category Header Card */}
										<div className="h-16 md:h-20 bg-gradient-to-br from-slate-900 to-indigo-950/80 border border-cyan-500/30 rounded-2xl p-2 flex flex-col items-center justify-center text-center shadow-lg shadow-indigo-950/40 relative overflow-hidden group">
											<div className="absolute inset-0 bg-cyan-500/5 group-hover:bg-cyan-500/10 transition-colors" />
											<span className="text-xl md:text-2xl mb-0.5 filter drop-shadow">
												{category.icon}
											</span>
											<h2 className="text-xs md:text-sm lg:text-base font-extrabold uppercase tracking-wide text-cyan-200 line-clamp-2 leading-tight">
												{category.name}
											</h2>
										</div>

										{/* Question Tiles */}
										<div className="flex-1 grid grid-rows-5 gap-2 min-h-0">
											{category.questions.map((q) => {
												const isDone = answeredIds.has(
													q.id,
												);
												return (
													<motion.button
														key={q.id}
														whileHover={
															!isDone
																? {
																		scale: 1.03,
																		y: -2,
																	}
																: {}
														}
														whileTap={
															!isDone
																? {
																		scale: 0.97,
																	}
																: {}
														}
														onClick={() =>
															selectQuestion(
																category,
																q,
															)
														}
														disabled={isDone}
														className={`w-full h-full rounded-2xl flex flex-col items-center justify-center font-black transition-all border relative overflow-hidden select-none cursor-pointer ${
															isDone
																? 'bg-slate-900/40 border-slate-800/60 text-slate-600 opacity-40 cursor-not-allowed shadow-none'
																: 'bg-gradient-to-br from-blue-700 via-indigo-700 to-blue-900 border-cyan-400/40 text-amber-300 shadow-md shadow-blue-950/60 hover:shadow-cyan-500/25 hover:border-cyan-300 hover:text-white'
														}`}
													>
														{/* Subtle neon glow on active tiles */}
														{!isDone && (
															<div className="absolute inset-0 bg-radial from-cyan-400/20 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity" />
														)}
														<span className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl tracking-tighter drop-shadow-md">
															{isDone
																? '✓'
																: `$${q.value}`}
														</span>
													</motion.button>
												);
											})}
										</div>
									</div>
								))}
							</div>
						</motion.div>
					)}

					{/* QUESTION MODAL VIEW */}
					{gameState === 'question' && currentQuestion && (
						<motion.div
							key="question-view"
							initial={{ opacity: 0, scale: 0.9 }}
							animate={{ opacity: 1, scale: 1 }}
							exit={{ opacity: 0, scale: 0.95 }}
							transition={{ duration: 0.3 }}
							className="absolute inset-0 z-30 bg-slate-950/95 backdrop-blur-md p-4 md:p-8 flex items-center justify-center"
						>
							<div className="w-full max-w-5xl bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-cyan-500/40 rounded-3xl p-6 md:p-12 shadow-2xl shadow-cyan-950/80 flex flex-col items-center text-center relative overflow-hidden">
								{/* Ambient glow */}
								<div className="absolute -top-20 -right-20 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
								<div className="absolute -bottom-20 -left-20 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

								{/* Category & Points Badge */}
								<div className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-400/30 px-5 py-2 rounded-full mb-6">
									<span className="text-lg">
										{currentQuestion.category.icon}
									</span>
									<span className="text-sm md:text-base font-bold tracking-wider uppercase text-cyan-300">
										{currentQuestion.category.name}
									</span>
									<span className="text-slate-500">•</span>
									<span className="text-lg md:text-xl font-black text-amber-300">
										${currentQuestion.question.value}
									</span>
								</div>

								{/* Question Text */}
								<h2 className="text-2xl sm:text-3xl md:text-5xl font-extrabold text-white leading-tight md:leading-snug mb-8 max-w-4xl tracking-tight">
									&ldquo;{currentQuestion.question.question}
									&rdquo;
								</h2>

								{/* Smartboard Big Timer */}
								<div className="mb-10 flex flex-col items-center">
									<div
										className={`text-4xl md:text-6xl font-black px-8 py-3 rounded-2xl border-2 flex items-center gap-3 transition-colors ${
											timerSeconds <= 5
												? 'bg-rose-500/20 border-rose-500 text-rose-400 animate-pulse'
												: timerSeconds <= 15
													? 'bg-amber-500/20 border-amber-400 text-amber-300'
													: 'bg-cyan-500/10 border-cyan-500/40 text-cyan-300'
										}`}
									>
										<span>⏱️</span>
										<span>{timerSeconds}s</span>
									</div>
									<div className="mt-2 flex items-center gap-2">
										<button
											onClick={() =>
												setIsTimerRunning(
													!isTimerRunning,
												)
											}
											className="text-xs font-semibold px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors cursor-pointer"
										>
											{isTimerRunning
												? 'Pause Timer'
												: 'Resume Timer'}
										</button>
										<button
											onClick={() => setTimerSeconds(30)}
											className="text-xs font-semibold px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors cursor-pointer"
										>
											Reset (30s)
										</button>
									</div>
								</div>

								{/* Show Answer Action */}
								<div className="flex gap-4">
									<button
										onClick={showAnswer}
										className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xl md:text-2xl px-10 py-5 rounded-2xl shadow-xl shadow-cyan-500/30 active:scale-95 transition-all cursor-pointer"
									>
										Show Answer
									</button>
									<button
										onClick={() => {
											setGameState('board');
											setIsTimerRunning(false);
										}}
										className="bg-slate-800/80 hover:bg-slate-700 text-slate-300 font-bold text-lg px-6 py-5 rounded-2xl border border-slate-700 transition-all cursor-pointer"
									>
										Back to Board
									</button>
								</div>
							</div>
						</motion.div>
					)}

					{/* TEAM SELECT / REVEAL ANSWER VIEW */}
					{gameState === 'teamSelect' && currentQuestion && (
						<motion.div
							key="team-select"
							initial={{ opacity: 0, scale: 0.9 }}
							animate={{ opacity: 1, scale: 1 }}
							exit={{ opacity: 0, scale: 0.95 }}
							transition={{ duration: 0.3 }}
							className="absolute inset-0 z-30 bg-slate-950/95 backdrop-blur-md p-4 md:p-8 flex items-center justify-center"
						>
							<div className="w-full max-w-5xl bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-emerald-500/40 rounded-3xl p-6 md:p-10 shadow-2xl shadow-emerald-950/80 flex flex-col items-center text-center relative overflow-hidden">
								{/* Category Header */}
								<div className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-2">
									{currentQuestion.category.name} - $
									{currentQuestion.question.value}
								</div>

								{/* Question Recap */}
								<p className="text-slate-400 text-base md:text-lg mb-6 line-clamp-2 max-w-3xl italic">
									&ldquo;{currentQuestion.question.question}
									&rdquo;
								</p>

								{/* The Big Correct Answer */}
								<div className="bg-emerald-950/50 border border-emerald-500/40 rounded-2xl p-6 md:p-8 w-full max-w-3xl mb-6 shadow-inner">
									<div className="text-xs uppercase font-extrabold tracking-widest text-emerald-400 mb-2">
										Correct Answer
									</div>
									<div className="text-3xl md:text-5xl font-black text-emerald-300 leading-tight">
										{currentQuestion.question.answer}
									</div>
									{currentQuestion.question.funFact && (
										<div className="mt-4 pt-3 border-t border-emerald-800/40 text-xs md:text-sm text-emerald-200/80">
											💡{' '}
											<span className="font-semibold">
												Fact:
											</span>{' '}
											{currentQuestion.question.funFact}
										</div>
									)}
								</div>

								{/* Award Points to Teams */}
								<div className="flex flex-col w-full max-w-3xl mb-8 items-center justify-center">
									<h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-300 mb-4">
										Who answered correctly? (+$
										{currentQuestion.question.value})
									</h3>
									<div className="flex flex-row justify-center items-center gap-3 max-w-min ">
										{activeTeams.map((team) => (
											<button
												key={team.id}
												onClick={() =>
													awardPoints(team.id)
												}
												className={`min-w-max p-4 rounded-2xl bg-gradient-to-br ${team.color} text-white font-black text-base md:text-lg shadow-lg hover:brightness-110 active:scale-95 transition-all flex flex-col items-center justify-center gap-1 border border-white/20 cursor-pointer`}
											>
												<span>{team.name}</span>
												<span className="text-xs font-semibold bg-black/25 px-2.5 py-0.5 rounded-full">
													Award +$
													{
														currentQuestion.question
															.value
													}
												</span>
											</button>
										))}
									</div>
								</div>

								{/* No team answered correctly */}
								<div className="flex gap-4">
									<button
										onClick={skipQuestion}
										className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-8 py-3.5 rounded-xl border border-slate-700 transition-colors text-sm md:text-base cursor-pointer"
									>
										No Team Got It Correct ($0)
									</button>
									<button
										onClick={() => setGameState('question')}
										className="bg-transparent hover:bg-slate-800 text-slate-400 font-bold px-6 py-3.5 rounded-xl transition-colors text-sm cursor-pointer"
									>
										Back to Question
									</button>
								</div>
							</div>
						</motion.div>
					)}

					{/* GAME OVER / WINNER CELEBRATION VIEW */}
					{gameState === 'winner' && (
						<motion.div
							key="winner-view"
							initial={{ opacity: 0, scale: 0.8 }}
							animate={{ opacity: 1, scale: 1 }}
							exit={{ opacity: 0 }}
							className="absolute inset-0 z-30 bg-slate-950/95 backdrop-blur-md p-6 flex flex-col items-center justify-center text-center"
						>
							<div className="text-6xl md:text-8xl mb-4 animate-bounce">
								🏆
							</div>
							<h2 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 mb-2">
								GAME COMPLETE!
							</h2>
							<p className="text-slate-400 text-lg md:text-xl mb-8">
								The scores are tallied. Here is your AI
								Champion!
							</p>

							{/* Podium */}
							<div className="flex flex-wrap items-end justify-center gap-4 md:gap-6 mb-12 max-w-4xl w-full">
								{sortedTeams.map((team, idx) => (
									<div
										key={team.id}
										className={`p-6 rounded-3xl border flex flex-col items-center justify-center shadow-xl ${
											idx === 0
												? 'bg-gradient-to-b from-amber-500/20 to-slate-900 border-amber-400/50 w-64 md:w-72 order-1 md:order-2 scale-105 shadow-amber-500/20'
												: idx === 1
													? 'bg-gradient-to-b from-slate-500/20 to-slate-900 border-slate-400/40 w-52 md:w-60 order-2 md:order-1'
													: 'bg-gradient-to-b from-amber-800/20 to-slate-900 border-amber-700/40 w-48 md:w-56 order-3'
										}`}
									>
										<div className="text-3xl mb-1">
											{idx === 0
												? '🥇 1st'
												: idx === 1
													? '🥈 2nd'
													: '🥉 3rd'}
										</div>
										<h4 className="text-xl md:text-2xl font-black text-white mb-2">
											{team.name}
										</h4>
										<div className="text-3xl md:text-4xl font-extrabold text-amber-300">
											${team.score}
										</div>
									</div>
								))}
							</div>

							<button
								onClick={resetGame}
								className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xl px-10 py-4 rounded-2xl shadow-xl shadow-cyan-500/30 active:scale-95 transition-all cursor-pointer"
							>
								Play Again
							</button>
						</motion.div>
					)}
				</AnimatePresence>
			</main>

			{/* Bottom Smartboard Interactive Scoreboard */}
			<footer className="flex-none bg-slate-900/95 border-t border-cyan-500/20 p-2 md:p-3 z-20">
				<div className="flex items-center justify-between max-w-7xl mx-auto gap-2 md:gap-4">
					<div className="flex-1 grid grid-flow-col auto-cols-fr gap-2 md:gap-4">
						{activeTeams.map((team) => (
							<div
								key={team.id}
								className="bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-2xl p-2.5 flex items-center justify-between shadow-inner transition-colors"
							>
								<div className="flex-1 min-w-0 pr-2">
									<input
										type="text"
										value={team.name}
										onChange={(e) =>
											updateTeamName(
												team.id,
												e.target.value,
											)
										}
										className="bg-transparent font-bold text-xs md:text-sm text-slate-300 w-full focus:outline-none focus:text-cyan-300 border-b border-transparent focus:border-cyan-500 truncate"
										title="Click to rename team"
									/>
									<div className="text-lg md:text-2xl font-black text-amber-300 tracking-tight">
										${team.score}
									</div>
								</div>

								{/* Quick manual score modifiers for smartboard host */}
								<div className="flex items-center gap-1 flex-none">
									<button
										onClick={() =>
											adjustScore(team.id, -100)
										}
										title="Deduct $100"
										className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-rose-900/40 text-rose-400 font-black text-sm flex items-center justify-center active:scale-95 transition-all cursor-pointer"
									>
										-
									</button>
									<button
										onClick={() =>
											adjustScore(team.id, 100)
										}
										title="Add $100"
										className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-emerald-900/40 text-emerald-400 font-black text-sm flex items-center justify-center active:scale-95 transition-all cursor-pointer"
									>
										+
									</button>
								</div>
							</div>
						))}
					</div>
				</div>
			</footer>
		</div>
	);
}
