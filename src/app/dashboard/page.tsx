import { Suspense } from 'react';
// Import our new modular components
import DashboardContent from './DashboardContent';

export default function Dashboard() {
	return (
		<Suspense
			fallback={
				<div className="flex justify-center items-center h-64">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
				</div>
			}
		>
			<DashboardContent />
		</Suspense>
	);
}
