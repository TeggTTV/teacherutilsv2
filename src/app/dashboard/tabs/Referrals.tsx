'use client';

import { getApiUrl } from '@/lib/config';
import { User } from '@/types/user';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Modal from '@/components/Modal';

type Referral = { name: string; email: string; status: string };

interface ReferralsProps {
	user: User | null;
}

export default function Referrals({ user }: ReferralsProps) {
	const [currentPage, setCurrentPage] = useState(1);
	const [generating, setGenerating] = useState(false);
	const [referralLink, setReferralLink] = useState('');
	const [raffleTickets, setRaffleTickets] = useState(0);
	const [referrals, setReferrals] = useState<Referral[]>([]);
	const [users, setUsers] = useState<User[]>([]);
	const [referralRulesOpen, setReferralRulesOpen] = useState(false);

	const pageSize = 10;

	const handleGenerateReferral = async () => {
		setGenerating(true);
		try {
			if (!user) {
				setGenerating(false);
				return;
			}
			// If we already have a referral link, just use it
			// Otherwise, create a new referral link via API
			const res = await fetch(
				getApiUrl(`/api/users/${user.id}/referral-link`),
				{
					method: 'POST',
				}
			);
			if (res.ok) {
				const data = await res.json();
				if (data.code) {
					setReferralLink(
						`${window.location.origin}/?ref=${data.code}&register=1`
					);
				}
			}
		} catch {
			setReferralLink('');
		} finally {
			setGenerating(false);
		}
	};

	const copyToClipboard = async () => {
		try {
			await navigator.clipboard.writeText(referralLink);
			// Could add toast notification here
		} catch (err) {
			console.error('Failed to copy text: ', err);
		}
	};

	const openReferralRules = () => setReferralRulesOpen(true);
	const closeReferralRules = () => setReferralRulesOpen(false);

	useEffect(() => {
		const fetchReferralData = async () => {
			if (!user) return;
			try {
				const res = await fetch(
					getApiUrl(`/api/users/${user.id}/referrals`)
				);
				if (res.ok) {
					const data = await res.json();
					setReferralLink(
						data.data.referralLink
							? `${window.location.origin}/?ref=${data.data.referralLink}&register=1`
							: ''
					);
					setRaffleTickets(data.data.raffleTickets ?? 0);
					setReferrals(data.data.referrals ?? []);
				} else {
					setReferralLink('');
					setRaffleTickets(0);
					setReferrals([]);
				}
			} catch {
				setReferralLink('');
				setRaffleTickets(0);
				setReferrals([]);
			}
		};
		fetchReferralData();

		const fetchUsersWithTickets = async () => {
			try {
				const res = await fetch(getApiUrl('/api/users'));
				if (res.ok) {
					const data = await res.json();
					setUsers(data.data || []);
				} else {
					setUsers([]);
				}
			} catch {
				setUsers([]);
			}
		};
		fetchUsersWithTickets();
	}, [user]);

	return (
		<div className="space-y-8">
			{/* Header */}
			<div className="text-center">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					className="inline-block"
				>
					<h1 className="text-3xl font-bold text-gray-900 mb-2">
						Referral Program
					</h1>
					<p className="text-gray-600 mb-6">
						Invite friends and earn raffle tickets for amazing
						prizes!
					</p>
				</motion.div>
			</div>

			{/* Ticket Display */}
			<motion.div
				initial={{ opacity: 0, scale: 0.95 }}
				animate={{ opacity: 1, scale: 1 }}
				className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-8 border border-blue-200"
			>
				<div className="flex items-center justify-center gap-4">
					<div className="text-6xl">🎟️</div>
					<div className="text-center">
						<div className="text-5xl font-bold text-blue-900">
							{raffleTickets}
						</div>
						<div className="text-xl text-blue-700">
							{raffleTickets === 1
								? 'Raffle Ticket'
								: 'Raffle Tickets'}
						</div>
					</div>
				</div>
				<div className="mt-4 text-center">
					<p className="text-gray-600">
						The more tickets you have, the better your chances of
						winning!
					</p>
				</div>
			</motion.div>

			{/* Referral Link Section */}
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.1 }}
				className="bg-white rounded-lg shadow-lg p-6 border border-gray-200"
			>
				<h2 className="text-xl font-semibold text-gray-900 mb-4">
					Your Referral Link
				</h2>
				<p className="text-gray-600 mb-4">
					Share this link with friends to earn raffle tickets when
					they sign up!
				</p>

				<div className="flex gap-2 mb-4">
					<input
						type="text"
						value={referralLink}
						readOnly
						className="flex-1 px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 font-mono text-sm focus:ring-2 focus:ring-blue-400 focus:border-transparent"
						placeholder="Generate your referral link..."
					/>
					<button
						onClick={handleGenerateReferral}
						disabled={generating}
						className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 whitespace-nowrap"
					>
						{generating ? 'Generating...' : 'Generate'}
					</button>
				</div>

				{referralLink && (
					<button
						onClick={copyToClipboard}
						className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
					>
						📋 Copy to Clipboard
					</button>
				)}
			</motion.div>

			{/* How It Works */}
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.2 }}
				className="bg-blue-50 rounded-lg p-6 border border-blue-200"
			>
				<h3 className="text-lg font-semibold text-blue-900 mb-3">
					How the Raffle Works
				</h3>
				<p className="text-blue-800 text-sm leading-relaxed mb-4">
					For every friend you refer who registers and confirms their
					email, you earn <strong>1 raffle ticket</strong>. Each
					ticket increases your chances of winning in our next prize
					draw! The more tickets you have, the better your odds.
				</p>
				<button
					onClick={openReferralRules}
					className="text-blue-600 hover:text-blue-700 font-medium text-sm underline"
				>
					View Complete Rules
				</button>
			</motion.div>

			{/* Your Referrals */}
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.3 }}
				className="bg-white rounded-lg shadow-lg p-6 border border-gray-200"
			>
				<h3 className="text-xl font-semibold text-gray-900 mb-4">
					Your Referrals
				</h3>
				<div className="overflow-x-auto">
					<table className="min-w-full bg-white border border-gray-200 rounded-lg">
						<thead>
							<tr className="bg-gray-50">
								<th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
									Name
								</th>
								<th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
									Email
								</th>
								<th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
									Status
								</th>
							</tr>
						</thead>
						<tbody>
							{referrals.length === 0 ? (
								<tr>
									<td
										colSpan={3}
										className="px-4 py-8 text-center text-gray-500"
									>
										<div className="flex flex-col items-center">
											<div className="text-4xl mb-2">
												👥
											</div>
											<p>No referrals yet</p>
											<p className="text-sm">
												Start sharing your link to see
												referrals here!
											</p>
										</div>
									</td>
								</tr>
							) : (
								referrals
									.slice(
										(currentPage - 1) * pageSize,
										currentPage * pageSize
									)
									.map((ref, idx) => (
										<tr
											key={idx}
											className="border-t border-gray-100 hover:bg-gray-50"
										>
											<td className="px-4 py-3 text-gray-900">
												{ref.name}
											</td>
											<td className="px-4 py-3 text-gray-700">
												{ref.email}
											</td>
											<td className="px-4 py-3">
												{ref.status === 'approved' ? (
													<span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
														✅ Confirmed
													</span>
												) : (
													<span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-semibold">
														⏳ Pending
													</span>
												)}
											</td>
										</tr>
									))
							)}
						</tbody>
					</table>

					{/* Pagination */}
					{referrals.length > pageSize && (
						<div className="flex justify-center mt-4 gap-2">
							{Array.from({
								length: Math.ceil(referrals.length / pageSize),
							}).map((_, i) => (
								<button
									key={i}
									onClick={() => setCurrentPage(i + 1)}
									className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
										currentPage === i + 1
											? 'bg-blue-500 text-white'
											: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
									}`}
								>
									{i + 1}
								</button>
							))}
						</div>
					)}
				</div>
			</motion.div>

			{/* Leaderboard */}
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.4 }}
				className="bg-white rounded-lg shadow-lg p-6 border border-gray-200"
			>
				<h3 className="text-xl font-semibold text-gray-900 mb-4">
					🏆 Ticket Leaderboard
				</h3>
				<p className="text-gray-600 mb-4">
					See how you stack up against other users!
				</p>

				<div className="overflow-x-auto">
					<table className="min-w-full bg-white border border-gray-200 rounded-lg">
						<thead>
							<tr className="bg-gray-50">
								<th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
									Rank
								</th>
								<th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
									User
								</th>
								<th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
									Tickets
								</th>
							</tr>
						</thead>
						<tbody>
							{users.length === 0 ? (
								<tr>
									<td
										colSpan={3}
										className="px-4 py-8 text-center text-gray-500"
									>
										Loading leaderboard...
									</td>
								</tr>
							) : (
								users
									.sort(
										(a, b) =>
											(b.raffleTickets || 0) -
											(a.raffleTickets || 0)
									)
									.slice(0, 10) // Show top 10
									.map((userItem, idx) => {
										const isCurrentUser =
											userItem.id === user?.id;
										return (
											<tr
												key={idx}
												className={`border-t border-gray-100 ${
													isCurrentUser
														? 'bg-blue-50'
														: 'hover:bg-gray-50'
												}`}
											>
												<td className="px-4 py-3 text-gray-900">
													<div className="flex items-center">
														{idx + 1}
														{idx === 0 && (
															<span className="ml-1">
																🥇
															</span>
														)}
														{idx === 1 && (
															<span className="ml-1">
																🥈
															</span>
														)}
														{idx === 2 && (
															<span className="ml-1">
																🥉
															</span>
														)}
													</div>
												</td>
												<td className="px-4 py-3">
													<span
														className={`font-medium ${
															isCurrentUser
																? 'text-blue-900'
																: 'text-gray-900'
														}`}
													>
														{userItem.username ||
															'Anonymous'}
														{isCurrentUser && (
															<span className="ml-2 text-xs text-blue-600">
																(You)
															</span>
														)}
													</span>
												</td>
												<td className="px-4 py-3">
													<span
														className={`font-semibold ${
															isCurrentUser
																? 'text-blue-900'
																: 'text-gray-700'
														}`}
													>
														{userItem.raffleTickets ||
															0}
													</span>
												</td>
											</tr>
										);
									})
							)}
						</tbody>
					</table>
				</div>
			</motion.div>

			{/* Rules Modal */}
			<Modal
				isOpen={referralRulesOpen}
				onClose={closeReferralRules}
				maxWidth="lg"
			>
				<div className="p-6">
					<h2 className="text-2xl font-bold mb-4 text-gray-900">
						Referral Program Rules
					</h2>
					<ul className="list-disc pl-6 space-y-3 text-gray-700">
						<li>
							For every friend you refer who registers and
							confirms their email, you earn{' '}
							<strong>1 raffle ticket</strong>.
						</li>
						<li>
							If your referred friend refers someone else who also
							registers and confirms,
							<strong> you also get a ticket</strong>{' '}
							(multi-level/chain referrals).
						</li>
						<li>
							The more tickets you have, the higher your chances
							of winning in the next prize draw.
						</li>
						<li>
							Tickets are only awarded after the referred user
							confirms their email address.
						</li>
						<li>
							Check your referrals tab to see your current ticket
							count and referral status.
						</li>
						<li>
							Winners will be contacted via the email associated
							with their account.
						</li>
						<li>
							Prize draws will be held periodically. Details will
							be announced via email and the platform.
						</li>
						<li>
							Fraudulent referrals or attempts to game the system
							will result in ticket forfeiture.
						</li>
					</ul>
					<div className="mt-6 flex justify-end">
						<button
							onClick={closeReferralRules}
							className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors"
						>
							Got it!
						</button>
					</div>
				</div>
			</Modal>
		</div>
	);
}
