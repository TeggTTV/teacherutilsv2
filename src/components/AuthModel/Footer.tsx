'use client';

export default function Footer({
	isLogin,
	handleModeSwitch,
}: {
	isLogin: boolean;
	handleModeSwitch: (toSignIn: boolean) => void;
}) {
	return (
		<div className="mt-6 text-center text-sm text-gray-600">
			{isLogin ? (
				<>
					Don&apos;t have an account?{' '}
					<button
						onClick={() => handleModeSwitch(false)}
						className="text-blue-600 hover:text-blue-700 font-medium"
					>
						Sign up
					</button>
				</>
			) : (
				<>
					Already have an account?{' '}
					<button
						onClick={() => handleModeSwitch(true)}
						className="text-blue-600 hover:text-blue-700 font-medium"
					>
						Sign in
					</button>
				</>
			)}
		</div>
	);
}
