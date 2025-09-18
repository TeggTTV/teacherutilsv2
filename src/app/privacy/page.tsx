'use client';

import Link from 'next/link';

export default function PrivacyPage() {
	return (
		<div className="min-h-screen bg-gray-50">
			{/* Header */}
			<div className="bg-white shadow-sm border-b">
				<div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
					<div className="flex justify-between items-center">
						<div className="flex items-center gap-4">
							<Link
								href="/dashboard"
								className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
							>
								<svg
									className="w-5 h-5"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M15 19l-7-7 7-7"
									/>
								</svg>
								Back to Dashboard
							</Link>
							<div className="border-l pl-4">
								<h1 className="text-xl font-semibold text-gray-900">
									Privacy Policy
								</h1>
								<p className="text-sm text-gray-600">
									How we protect and use your information
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Hero Section */}
			<div className="bg-blue-600 text-white py-12">
				<div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
					<h2 className="text-3xl font-bold mb-4">Privacy Policy</h2>
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
							Introduction
						</h3>
						<p className="text-gray-700 leading-relaxed">
							At Compyy (&quot;we,&quot; &quot;our,&quot; or
							&quot;us&quot;), we are committed to protecting your
							privacy and ensuring the security of your personal
							information. This Privacy Policy explains how we
							collect, use, disclose, and safeguard your
							information when you use our educational game
							platform and related services.
						</p>
					</section>

					{/* Information We Collect */}
					<section>
						<h3 className="text-2xl font-bold text-gray-900 mb-4">
							Information We Collect
						</h3>
						<div className="space-y-4">
							<div>
								<h4 className="text-lg font-semibold text-gray-800 mb-2">
									Personal Information
								</h4>
								<p className="text-gray-700 leading-relaxed">
									We collect information you provide directly
									to us, including:
								</p>
								<ul className="list-disc list-inside text-gray-700 mt-2 space-y-1">
									<li>
										Name and email address when you create
										an account
									</li>
									<li>Profile information and preferences</li>
									<li>
										Educational content you create (games,
										questions, templates)
									</li>
									<li>
										Communications with our support team
									</li>
								</ul>
							</div>

							<div>
								<h4 className="text-lg font-semibold text-gray-800 mb-2">
									Usage Information
								</h4>
								<p className="text-gray-700 leading-relaxed">
									We automatically collect certain information
									about your use of our platform:
								</p>
								<ul className="list-disc list-inside text-gray-700 mt-2 space-y-1">
									<li>
										Device information (browser type,
										operating system)
									</li>
									<li>
										Usage patterns and feature interactions
									</li>
									<li>Log files and analytics data</li>
									<li>
										Cookies and similar tracking
										technologies
									</li>
								</ul>
							</div>
						</div>
					</section>

					{/* How We Use Your Information */}
					<section>
						<h3 className="text-2xl font-bold text-gray-900 mb-4">
							How We Use Your Information
						</h3>
						<p className="text-gray-700 leading-relaxed mb-4">
							We use the information we collect for the following
							purposes:
						</p>
						<ul className="list-disc list-inside text-gray-700 space-y-2">
							<li>
								Provide, maintain, and improve our educational
								platform
							</li>
							<li>Create and manage your user account</li>
							<li>
								Process and fulfill your requests for games and
								templates
							</li>
							<li>Send important updates about our services</li>
							<li>
								Provide customer support and respond to
								inquiries
							</li>
							<li>
								Analyze usage patterns to enhance user
								experience
							</li>
							<li>Ensure platform security and prevent fraud</li>
							<li>Comply with legal obligations</li>
						</ul>
					</section>

					{/* Information Sharing */}
					<section>
						<h3 className="text-2xl font-bold text-gray-900 mb-4">
							Information Sharing and Disclosure
						</h3>
						<p className="text-gray-700 leading-relaxed mb-4">
							We do not sell, trade, or rent your personal
							information to third parties. We may share your
							information in the following limited circumstances:
						</p>
						<ul className="list-disc list-inside text-gray-700 space-y-2">
							<li>
								<strong>Service Providers:</strong> With trusted
								third-party service providers who help us
								operate our platform
							</li>
							<li>
								<strong>Legal Compliance:</strong> When required
								by law or to protect our rights and users&apos;
								safety
							</li>
							<li>
								<strong>Business Transfers:</strong> In
								connection with a merger, acquisition, or sale
								of assets
							</li>
							<li>
								<strong>Public Content:</strong> Games and
								templates you choose to make public
							</li>
						</ul>
					</section>

					{/* Data Security */}
					<section>
						<h3 className="text-2xl font-bold text-gray-900 mb-4">
							Data Security
						</h3>
						<p className="text-gray-700 leading-relaxed">
							We implement appropriate technical and
							organizational security measures to protect your
							personal information against unauthorized access,
							alteration, disclosure, or destruction. This
							includes encryption, secure servers, and regular
							security assessments. However, no method of
							transmission over the internet is 100% secure.
						</p>
					</section>

					{/* Cookies and Tracking */}
					<section>
						<h3 className="text-2xl font-bold text-gray-900 mb-4">
							Cookies and Tracking Technologies
						</h3>
						<p className="text-gray-700 leading-relaxed">
							We use cookies and similar technologies to enhance
							your experience, remember your preferences, and
							analyze usage patterns. You can control cookie
							settings through your browser, though some features
							may not function properly if cookies are disabled.
						</p>
					</section>

					{/* Student Privacy */}
					<section>
						<h3 className="text-2xl font-bold text-gray-900 mb-4">
							Student Privacy Protection
						</h3>
						<p className="text-gray-700 leading-relaxed">
							We are committed to protecting student privacy in
							accordance with educational privacy laws such as
							FERPA and COPPA. We do not collect personal
							information from students without proper consent,
							and we never use student data for advertising or
							commercial purposes.
						</p>
					</section>

					{/* Your Rights */}
					<section>
						<h3 className="text-2xl font-bold text-gray-900 mb-4">
							Your Rights and Choices
						</h3>
						<p className="text-gray-700 leading-relaxed mb-4">
							You have the following rights regarding your
							personal information:
						</p>
						<ul className="list-disc list-inside text-gray-700 space-y-2">
							<li>
								<strong>Access:</strong> Request a copy of your
								personal information
							</li>
							<li>
								<strong>Correction:</strong> Update or correct
								your personal information
							</li>
							<li>
								<strong>Deletion:</strong> Request deletion of
								your personal information
							</li>
							<li>
								<strong>Portability:</strong> Receive your data
								in a structured format
							</li>
							<li>
								<strong>Opt-out:</strong> Unsubscribe from
								marketing communications
							</li>
						</ul>
						<p className="text-gray-700 leading-relaxed mt-4">
							To exercise these rights, please contact us at
							privacy@compyy.com.
						</p>
					</section>

					{/* Data Retention */}
					<section>
						<h3 className="text-2xl font-bold text-gray-900 mb-4">
							Data Retention
						</h3>
						<p className="text-gray-700 leading-relaxed">
							We retain your personal information for as long as
							necessary to provide our services, comply with legal
							obligations, resolve disputes, and enforce our
							agreements. When you delete your account, we will
							delete your personal information within 30 days,
							except where retention is required by law.
						</p>
					</section>

					{/* International Users */}
					<section>
						<h3 className="text-2xl font-bold text-gray-900 mb-4">
							International Users
						</h3>
						<p className="text-gray-700 leading-relaxed">
							If you are accessing our platform from outside the
							United States, please note that your information may
							be transferred to and processed in countries that
							may have different data protection laws than your
							jurisdiction.
						</p>
					</section>

					{/* Changes to Policy */}
					<section>
						<h3 className="text-2xl font-bold text-gray-900 mb-4">
							Changes to This Privacy Policy
						</h3>
						<p className="text-gray-700 leading-relaxed">
							We may update this Privacy Policy from time to time.
							We will notify you of any material changes by
							posting the updated policy on our website and
							updating the &quot;Last updated&quot; date. Your
							continued use of our platform after such changes
							constitutes acceptance of the updated policy.
						</p>
					</section>

					{/* Contact Information */}
					{/* <section>
						<h3 className="text-2xl font-bold text-gray-900 mb-4">
							Contact Us
						</h3>
						<p className="text-gray-700 leading-relaxed mb-4">
							If you have any questions about this Privacy Policy or our privacy practices, please contact us:
						</p>
						<div className="bg-gray-50 p-4 rounded-lg">
							<p className="text-gray-700">
								<strong>Email:</strong> privacy@compyy.com<br />
								<strong>Support:</strong> support@compyy.com<br />
								<strong>Address:</strong> [Your Company Address]
							</p>
						</div>
					</section> */}
				</div>

				{/* Back to Dashboard */}
				<div className="mt-8 text-center">
					<Link
						href="/dashboard"
						className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
					>
						Back to Dashboard
					</Link>
				</div>
			</div>
		</div>
	);
}
