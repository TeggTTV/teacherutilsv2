// No 'use client' so we can use metadata export

import Header from '@/components/Header';
import Link from 'next/link';

export const metadata = {
	title: 'Cookie Policy | Compyy',
	description:
		'How Compyy uses cookies and tracking technologies to improve your experience.',
	alternates: {
		canonical: 'https://compyy.org/cookies',
	},
	openGraph: {
		url: 'https://compyy.org/cookies',
		title: 'Cookie Policy | Compyy',
		description:
			'How Compyy uses cookies and tracking technologies to improve your experience.',
		images: [
			{
				url: 'https://compyy.org/Compyy%20Logo%20Icon.png',
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
		title: 'Cookie Policy | Compyy',
		description:
			'How Compyy uses cookies and tracking technologies to improve your experience.',
		images: ['https://compyy.org/Compyy%20Logo%20Icon.png'],
		site: '@compyy',
		creator: '@compyy',
	},
};

export default function CookiesPage() {
	return (
		<div className="min-h-screen bg-gray-50">
			{/* Header */}
			<Header>
				<div className="border-l pl-4">
					<h1 className="text-xl font-semibold text-gray-900">
						Cookie Policy
					</h1>
					<p className="text-sm text-gray-600">
						How we use cookies and tracking technologies
					</p>
				</div>
			</Header>

			{/* Hero Section */}
			<div className="bg-blue-600 text-white py-12">
				<div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
					<h2 className="text-3xl font-bold mb-4">Cookie Policy</h2>
					<p className="text-xl opacity-90">
						Last updated: September 18, 2025
					</p>
				</div>
			</div>

			{/* Main Content */}
			<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
				<div className="bg-white rounded-lg shadow-md p-8 space-y-8">
					{/* Introduction */}
					<section>
						<h3 className="text-2xl font-bold text-gray-900 mb-4">
							What Are Cookies?
						</h3>
						<p className="text-gray-700 leading-relaxed">
							Cookies are small text files that are stored on your
							computer or mobile device when you visit our
							website. They help us provide you with a better
							experience by remembering your preferences and
							understanding how you use our educational platform.
						</p>
					</section>

					{/* How We Use Cookies */}
					<section>
						<h3 className="text-2xl font-bold text-gray-900 mb-4">
							How We Use Cookies
						</h3>
						<p className="text-gray-700 leading-relaxed mb-4">
							We use cookies for several important purposes:
						</p>
						<ul className="list-disc list-inside text-gray-700 space-y-2">
							<li>
								<strong>Authentication:</strong> To keep you
								logged in to your account securely
							</li>
							<li>
								<strong>Preferences:</strong> To remember your
								settings and customizations
							</li>
							<li>
								<strong>Analytics:</strong> To understand how
								our platform is used and improve it
							</li>
							<li>
								<strong>Performance:</strong> To ensure our
								website loads quickly and functions properly
							</li>
							<li>
								<strong>Security:</strong> To protect against
								fraud and unauthorized access
							</li>
						</ul>
					</section>

					{/* Types of Cookies */}
					<section>
						<h3 className="text-2xl font-bold text-gray-900 mb-4">
							Types of Cookies We Use
						</h3>
						<div className="space-y-6">
							<div>
								<h4 className="text-lg font-semibold text-gray-800 mb-2">
									Essential Cookies
								</h4>
								<p className="text-gray-700 leading-relaxed">
									These cookies are necessary for our website
									to function properly. They enable core
									functionality such as security, network
									management, and accessibility. Without these
									cookies, our services cannot be provided.
								</p>
								<div className="mt-3 p-3 bg-gray-50 rounded">
									<p className="text-sm text-gray-600">
										<strong>Examples:</strong>{' '}
										Authentication tokens, session
										management, security preferences
									</p>
								</div>
							</div>

							<div>
								<h4 className="text-lg font-semibold text-gray-800 mb-2">
									Analytics Cookies
								</h4>
								<p className="text-gray-700 leading-relaxed">
									These cookies help us understand how
									visitors interact with our website by
									collecting and reporting information
									anonymously. This helps us improve our
									platform and user experience.
								</p>
								<div className="mt-3 p-3 bg-gray-50 rounded">
									<p className="text-sm text-gray-600">
										<strong>Examples:</strong> Google
										Analytics, page views, time spent on
										site, popular features
									</p>
								</div>
							</div>

							<div>
								<h4 className="text-lg font-semibold text-gray-800 mb-2">
									Functional Cookies
								</h4>
								<p className="text-gray-700 leading-relaxed">
									These cookies allow us to remember choices
									you make and provide enhanced, more personal
									features. They may be set by us or by
									third-party providers whose services we use.
								</p>
								<div className="mt-3 p-3 bg-gray-50 rounded">
									<p className="text-sm text-gray-600">
										<strong>Examples:</strong> Theme
										preferences, language settings,
										dashboard layouts, recently used
										templates
									</p>
								</div>
							</div>

							<div>
								<h4 className="text-lg font-semibold text-gray-800 mb-2">
									Performance Cookies
								</h4>
								<p className="text-gray-700 leading-relaxed">
									These cookies collect information about how
									you use our website, such as which pages you
									visit most often, and if you get error
									messages from web pages. All information is
									aggregated and anonymous.
								</p>
								<div className="mt-3 p-3 bg-gray-50 rounded">
									<p className="text-sm text-gray-600">
										<strong>Examples:</strong> Load times,
										error tracking, feature usage statistics
									</p>
								</div>
							</div>
						</div>
					</section>

					{/* Third-Party Cookies */}
					<section>
						<h3 className="text-2xl font-bold text-gray-900 mb-4">
							Third-Party Cookies
						</h3>
						<p className="text-gray-700 leading-relaxed mb-4">
							We may also use third-party services that set
							cookies on our behalf. These services help us
							provide better functionality and analyze usage:
						</p>
						<div className="space-y-4">
							<div className="border border-gray-200 rounded p-4">
								<h4 className="font-semibold text-gray-800 mb-2">
									Google Analytics
								</h4>
								<p className="text-gray-700 text-sm">
									Helps us understand user behavior and
									improve our platform. You can opt out at any
									time through your browser settings or
									Google&apos;s opt-out tools.
								</p>
							</div>
							<div className="border border-gray-200 rounded p-4">
								<h4 className="font-semibold text-gray-800 mb-2">
									Authentication Providers
								</h4>
								<p className="text-gray-700 text-sm">
									When you log in using third-party services,
									they may set their own cookies to maintain
									your authentication state.
								</p>
							</div>
						</div>
					</section>

					{/* Managing Cookies */}
					<section>
						<h3 className="text-2xl font-bold text-gray-900 mb-4">
							How to Manage Cookies
						</h3>
						<div className="space-y-4">
							<div>
								<h4 className="text-lg font-semibold text-gray-800 mb-2">
									Browser Settings
								</h4>
								<p className="text-gray-700 leading-relaxed mb-3">
									You can control and manage cookies through
									your browser settings. Here&apos;s how to do
									it in popular browsers:
								</p>
								<div className="space-y-2 text-sm text-gray-700">
									<div>
										<strong>Chrome:</strong> Settings &gt;
										Privacy and security &gt; Cookies and
										other site data
									</div>
									<div>
										<strong>Firefox:</strong> Settings &gt;
										Privacy &amp; Security &gt; Cookies and
										Site Data
									</div>
									<div>
										<strong>Safari:</strong> Preferences
										&gt; Privacy &gt; Cookies and website
										data
									</div>
									<div>
										<strong>Edge:</strong> Settings &gt;
										Cookies and site permissions &gt;
										Cookies and site data
									</div>
								</div>
							</div>

							<div>
								<h4 className="text-lg font-semibold text-gray-800 mb-2">
									Our Cookie Consent
								</h4>
								<p className="text-gray-700 leading-relaxed">
									When you first visit our website,
									you&apos;ll see a cookie consent banner. You
									can accept or decline non-essential cookies
									at any time. Essential cookies cannot be
									disabled as they are necessary for the
									website to function.
								</p>
							</div>
						</div>
					</section>

					{/* Impact of Disabling Cookies */}
					<section>
						<h3 className="text-2xl font-bold text-gray-900 mb-4">
							What Happens If You Disable Cookies?
						</h3>
						<p className="text-gray-700 leading-relaxed mb-4">
							If you choose to disable cookies, some features of
							our platform may not work as intended:
						</p>
						<ul className="list-disc list-inside text-gray-700 space-y-2">
							<li>You may need to log in every time you visit</li>
							<li>
								Your preferences and settings won&apos;t be
								remembered
							</li>
							<li>
								Some interactive features may not function
								properly
							</li>
							<li>
								We won&apos;t be able to improve your experience
								based on usage patterns
							</li>
						</ul>
					</section>

					{/* Student Privacy */}
					<section>
						<h3 className="text-2xl font-bold text-gray-900 mb-4">
							Student Privacy and Cookies
						</h3>
						<p className="text-gray-700 leading-relaxed">
							We are committed to protecting student privacy. We
							do not use cookies to collect personal information
							from students for advertising purposes. Our use of
							cookies in educational settings is limited to
							essential functionality and improving the learning
							experience.
						</p>
					</section>

					{/* Updates to Policy */}
					<section>
						<h3 className="text-2xl font-bold text-gray-900 mb-4">
							Updates to This Cookie Policy
						</h3>
						<p className="text-gray-700 leading-relaxed">
							We may update this Cookie Policy from time to time
							to reflect changes in our practices or applicable
							laws. We will notify you of any significant changes
							by posting the updated policy on our website and
							updating the &quot;Last updated&quot; date.
						</p>
					</section>

					{/* More Information */}
					<section>
						<h3 className="text-2xl font-bold text-gray-900 mb-4">
							More Information
						</h3>
						<p className="text-gray-700 leading-relaxed mb-4">
							For more information about how we protect your
							privacy, please read our:
						</p>
						<div className="flex flex-wrap gap-4">
							<Link
								href="/privacy"
								className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
							>
								Privacy Policy
							</Link>
							<Link
								href="/terms"
								className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
							>
								Terms of Service
							</Link>
							<Link
								href="/cookies"
								className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
							>
								Cookie Policy
							</Link>
						</div>
					</section>
				</div>

				{/* Back to Dashboard */}
				<div className="mt-8 text-center">
					<Link
						href="/dashboard"
						className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
					>
						Back to Dashboard
					</Link>
				</div>
			</div>
		</div>
	);
}
