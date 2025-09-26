import ForgotPasswordForm from './ForgotPasswordForm';

export const metadata = {
	title: 'Forgot Password | Compyy',
	description:
		'Reset your password on Compyy. Enter your email to receive a password reset link and regain access to your account.',
	type: 'website',
	alternates: {
		canonical: 'https://compyy.org/forgot-password',
	},
	openGraph: {
		url: 'https://compyy.org/forgot-password',
		title: 'Forgot Password | Compyy',
		description:
			'Reset your password on Compyy. Enter your email to receive a password reset link and regain access to your account.',
		images: [
			{
				url: 'https://compyy.org/Compyy%20Logo%20w%20Text.png',
				width: 800,
				height: 600,
				alt: 'Compyy Logo',
				type: 'image/png',
			},
		],
		siteName: 'Compyy',
	},
	twitter: {
		card: 'summary_large_image',
		title: 'Forgot Password | Compyy',
		description:
			'Reset your password on Compyy. Enter your email to receive a password reset link and regain access to your account.',
		images: ['https://compyy.org/Compyy%20Logo%20Icon.png'],
		site: '@compyy',
		creator: '@compyy',
	},
};

export default function ForgotPasswordPage() {
	return (
		<div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
			<div className="sm:mx-auto sm:w-full sm:max-w-md">
				<div className="text-center">
					<h2 className="mt-6 text-3xl font-bold text-gray-900">
						Reset your password
					</h2>
					<p className="mt-2 text-sm text-gray-600">
						Enter your email address and we&apos;ll send you a link
						to reset your password.
					</p>
				</div>
			</div>

			<ForgotPasswordForm />
		</div>
	);
}
