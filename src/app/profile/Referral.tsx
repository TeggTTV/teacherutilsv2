import { getApiUrl } from '@/lib/config';
import { User } from '@/types/user';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import Modal from '@/components/Modal';

type Referral = { name: string; email: string; status: string };

export default function Refferal({ user }: { user: User }) {
	const [currentPage, setCurrentPage] = useState(1);
	const [generating, setGenerating] = useState(false);
	const [referralLink, setReferralLink] = useState('');
	const [raffleTickets, setRaffleTickets] = useState(0);
	const [referrals, setReferrals] = useState<Referral[]>([]);

	const [users, setUsers] = useState<User[]>([]);

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

	const [referralRulesOpen, setReferralRulesOpen] = useState(false);
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
		<div className="mt-8 pt-8 border-t">
			<h3 className="text-lg font-semibold text-gray-900 mb-4">
				Referrals
			</h3>
			<div className="flex items-center gap-2 min-w-[180px] justify-center">
				<div className="w-min h-min rounded-lg flex items-center justify-center text-[100px] font-bold text-blue-900">
					🎟️
				</div>
				<span className="text-[60px] font-bold text-blue-900">
					{raffleTickets}
				</span>
				<span className="text-2xl text-blue-700 self-end-safe relative bottom-13">
					{raffleTickets > 1 ? 'tickets' : 'ticket'}
				</span>
			</div>
			<div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
				<div className="flex flex-1 gap-2">
					<input
						type="text"
						value={referralLink}
						readOnly
						className="w-full px-3 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-gray-50 text-gray-900 font-mono text-sm"
					/>
					<button
						onClick={handleGenerateReferral}
						disabled={generating}
						className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-r-lg transition-colors disabled:opacity-50"
					>
						{generating ? 'Generating...' : 'Generate'}
					</button>
				</div>
			</div>
			<div className="overflow-x-auto">
				<table className="min-w-full bg-white border border-gray-200 rounded-lg">
					<thead>
						<tr className="bg-blue-50">
							<th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
								Name
							</th>
							<th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
								Email
							</th>
							<th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
								Status
							</th>
						</tr>
					</thead>
					<tbody>
						{referrals.length === 0 ? (
							<tr>
								<td
									colSpan={3}
									className="px-4 py-6 text-center text-gray-400"
								>
									Nothing here yet
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
										className="border-t border-gray-100"
									>
										<td className="px-4 py-2 text-gray-900">
											{ref.name}
										</td>
										<td className="px-4 py-2 text-gray-700">
											{ref.email}
										</td>
										<td className="px-4 py-2">
											{ref.status === 'approved' ? (
												<span className="inline-flex items-center gap-1 text-green-700 font-semibold">
													Approved{' '}
													<span className="text-lg">
														✅
													</span>
												</span>
											) : (
												<span className="inline-flex items-center gap-1 text-yellow-700 font-semibold">
													Awaiting email confirmation{' '}
													<span className="text-lg">
														⏳
													</span>
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
								className={`px-3 py-1 rounded ${
									currentPage === i + 1
										? 'bg-blue-500 text-white font-bold'
										: 'bg-gray-100 text-gray-700'
								}`}
							>
								{i + 1}
							</button>
						))}
					</div>
				)}
				{/* Raffle Description */}
				<div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-900 text-sm">
					<strong>How the Raffle Works:</strong> For every friend you
					refer who registers and confirms their email, you earn 1
					raffle ticket. Each ticket increases your chances of winning
					in our next prize draw! The more tickets you have, the
					better your odds. Check back after your friends confirm
					their emails to see your updated ticket count. View the{' '}
					<span
						onClick={openReferralRules}
						className="cursor-pointer text-blue-500 underline"
					>
						Rules
					</span>
					.
				</div>
				<Modal
					isOpen={referralRulesOpen}
					onClose={closeReferralRules}
					maxWidth="lg"
				>
					<div className="text-xl font-bold mb-2">Raffle Rules</div>
					<ul className="list-disc pl-5 space-y-2 text-gray-800">
						<li>
							For every friend you refer who registers and
							confirms their email, you earn{' '}
							<b>1 raffle ticket</b>.
						</li>
						<li>
							If your referred friend refers someone else who also
							registers and confirms, <b>you also get a ticket</b>{' '}
							(multi-level/chain referrals).
						</li>
						<li>
							The more tickets you have, the higher your chances
							of winning in the next prize draw.
						</li>
						<li>
							Tickets are only awarded after the referred user
							confirms their email.
						</li>
						<li>
							Check your profile to see your current ticket count
							and referral status.
						</li>
						<li>
							Winners will be contacted via the email associated
							with their account.
						</li>
					</ul>
					<button
						onClick={closeReferralRules}
						className="mt-6 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
					>
						Close
					</button>
				</Modal>
			</div>
			<table className="mt-6 min-w-full bg-white border border-gray-200 rounded-lg">
				<thead>
					<tr className="bg-blue-50">
						<th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
							Name
						</th>
						<th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
							Ticket Count
						</th>
					</tr>
				</thead>
				<tbody>
					{users.length === 0 ? (
						<tr>
							<td
								colSpan={3}
								className="px-4 py-6 text-center text-gray-400"
							>
								Nothing here yet
							</td>
						</tr>
					) : (
						users
							.slice(
								(currentPage - 1) * pageSize,
								currentPage * pageSize
							)
							.sort(
								(a, b) =>
									(b.raffleTickets || 0) -
									(a.raffleTickets || 0)
							)
							.map((ref, idx) => (
								<tr
									key={idx}
									className="border-t border-gray-100"
								>
									<td className="px-4 py-2 text-gray-900">
										{ref.username}
									</td>
									<td className="px-4 py-2 text-gray-700">
										{ref.raffleTickets}
									</td>
								</tr>
							))
					)}
				</tbody>
			</table>
		</div>
	);
}
