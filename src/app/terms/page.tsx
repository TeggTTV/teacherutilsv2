"use client";
import Link from 'next/link';

// export const metadata: Metadata = {
// 	title: 'Terms of Service | Compyy.',
// 	description:
// 		'Terms and conditions for using Compyy, including user responsibilities, content ownership, privacy, and more.',
// };

export default function TermsPage() {
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
									Terms of Service
								</h1>
								<p className="text-sm text-gray-600">
									Terms and conditions for using our platform
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Hero Section */}
			<div className="bg-blue-600 text-white py-12">
				<div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
					<h2 className="text-3xl font-bold mb-4">
						Terms of Service
					</h2>
					<p className="text-xl opacity-90">
						Last updated: September 18, 2025
					</p>
				</div>
			</div>

			{/* Main Content */}
			<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
				<div className="bg-white rounded-lg shadow-md p-8 space-y-8">
					
					{/* Agreement */}
					<section>
						<h3 className="text-2xl font-bold text-gray-900 mb-4">
							Agreement to Terms
						</h3>
						<p className="text-gray-700 leading-relaxed">
							By accessing and using Compyy (&quot;the Service,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
						</p>
					</section>

					{/* Description of Service */}
					<section>
						<h3 className="text-2xl font-bold text-gray-900 mb-4">
							Description of Service
						</h3>
						<p className="text-gray-700 leading-relaxed">
							Compyy is an educational platform that allows teachers and educators to create, customize, and play interactive games for educational purposes. Our service includes game creation tools, templates, sharing features, and classroom management capabilities.
						</p>
					</section>

					{/* User Accounts */}
					<section>
						<h3 className="text-2xl font-bold text-gray-900 mb-4">
							User Accounts and Registration
						</h3>
						<div className="space-y-4">
							<p className="text-gray-700 leading-relaxed">
								To access certain features of our service, you must create an account. By creating an account, you agree to:
							</p>
							<ul className="list-disc list-inside text-gray-700 space-y-2">
								<li>Provide accurate, current, and complete information during registration</li>
								<li>Maintain and update your information to keep it accurate and current</li>
								<li>Maintain the security of your password and accept all risks of unauthorized access</li>
								<li>Notify us immediately of any unauthorized use of your account</li>
								<li>Be responsible for all activities that occur under your account</li>
							</ul>
							<p className="text-gray-700 leading-relaxed">
								You may not use another person&apos;s account without permission, create false identities, or use our service for any illegal or unauthorized purpose.
							</p>
						</div>
					</section>

					{/* Acceptable Use */}
					<section>
						<h3 className="text-2xl font-bold text-gray-900 mb-4">
							Acceptable Use Policy
						</h3>
						<div className="space-y-4">
							<p className="text-gray-700 leading-relaxed">
								You agree to use our service only for lawful educational purposes. You may not:
							</p>
							<ul className="list-disc list-inside text-gray-700 space-y-2">
								<li>Upload, post, or transmit any content that is illegal, harmful, threatening, abusive, harassing, or offensive</li>
								<li>Violate any intellectual property rights of others</li>
								<li>Attempt to gain unauthorized access to our systems or other users&apos; accounts</li>
								<li>Use our service to distribute spam, malware, or other harmful content</li>
								<li>Interfere with or disrupt our service or servers</li>
								<li>Use automated tools to access our service without permission</li>
								<li>Share inappropriate content with minors or in educational settings</li>
							</ul>
						</div>
					</section>

					{/* Content and Intellectual Property */}
					<section>
						<h3 className="text-2xl font-bold text-gray-900 mb-4">
							Content and Intellectual Property
						</h3>
						<div className="space-y-4">
							<div>
								<h4 className="text-lg font-semibold text-gray-800 mb-2">
									Your Content
								</h4>
								<p className="text-gray-700 leading-relaxed">
									You retain ownership of all educational content you create using our platform. By using our service, you grant us a non-exclusive, royalty-free license to host, store, and display your content as necessary to provide the service.
								</p>
							</div>
							
							<div>
								<h4 className="text-lg font-semibold text-gray-800 mb-2">
									Our Content
								</h4>
								<p className="text-gray-700 leading-relaxed">
									All content provided by Compyy, including templates, designs, logos, and software, remains our property and is protected by intellectual property laws. You may not copy, modify, or redistribute our content without permission.
								</p>
							</div>

							<div>
								<h4 className="text-lg font-semibold text-gray-800 mb-2">
									Public Content
								</h4>
								<p className="text-gray-700 leading-relaxed">
									When you make content public or share it with the community, you grant other users the right to use, adapt, and share that content for educational purposes, while you retain original ownership.
								</p>
							</div>
						</div>
					</section>

					{/* Privacy and Data */}
					<section>
						<h3 className="text-2xl font-bold text-gray-900 mb-4">
							Privacy and Data Protection
						</h3>
						<p className="text-gray-700 leading-relaxed">
							Your privacy is important to us. Our collection and use of personal information is governed by our Privacy Policy. We are committed to protecting student privacy and complying with applicable educational privacy laws such as FERPA and COPPA.
						</p>
					</section>

					{/* Educational Use */}
					<section>
						<h3 className="text-2xl font-bold text-gray-900 mb-4">
							Educational Use and Student Safety
						</h3>
						<p className="text-gray-700 leading-relaxed mb-4">
							Our platform is designed for educational use. Teachers and educators using our service with students agree to:
						</p>
						<ul className="list-disc list-inside text-gray-700 space-y-2">
							<li>Supervise student use of the platform appropriately</li>
							<li>Ensure content shared with students is age-appropriate and educationally relevant</li>
							<li>Comply with their institution&apos;s technology and privacy policies</li>
							<li>Not collect unnecessary personal information from students</li>
							<li>Report any inappropriate content or behavior through our reporting system</li>
						</ul>
					</section>

					{/* Service Availability */}
					<section>
						<h3 className="text-2xl font-bold text-gray-900 mb-4">
							Service Availability and Modifications
						</h3>
						<p className="text-gray-700 leading-relaxed">
							We strive to provide reliable service, but we cannot guarantee 100% uptime. We reserve the right to modify, suspend, or discontinue any part of our service at any time. We will provide reasonable notice of significant changes when possible.
						</p>
					</section>

					{/* Termination */}
					<section>
						<h3 className="text-2xl font-bold text-gray-900 mb-4">
							Account Termination
						</h3>
						<div className="space-y-4">
							<p className="text-gray-700 leading-relaxed">
								You may terminate your account at any time by contacting us or using the account deletion feature in your profile settings.
							</p>
							<p className="text-gray-700 leading-relaxed">
								We may suspend or terminate your account if you violate these terms, engage in harmful behavior, or for other legitimate business reasons. We will provide notice when possible, except in cases involving security concerns or legal requirements.
							</p>
							<p className="text-gray-700 leading-relaxed">
								Upon termination, your right to use the service will cease immediately. We may retain certain information as required by law or for legitimate business purposes.
							</p>
						</div>
					</section>

					{/* Disclaimers and Limitations */}
					<section>
						<h3 className="text-2xl font-bold text-gray-900 mb-4">
							Disclaimers and Limitations of Liability
						</h3>
						<p className="text-gray-700 leading-relaxed mb-4">
							Our service is provided &quot;as is&quot; and &quot;as available&quot; without warranties of any kind. We do not guarantee that our service will be error-free, secure, or continuously available.
						</p>
						<p className="text-gray-700 leading-relaxed">
							To the maximum extent permitted by law, we shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of our service, even if we have been advised of the possibility of such damages.
						</p>
					</section>

					{/* Indemnification */}
					<section>
						<h3 className="text-2xl font-bold text-gray-900 mb-4">
							Indemnification
						</h3>
						<p className="text-gray-700 leading-relaxed">
							You agree to indemnify and hold harmless Compyy and its affiliates from any claims, damages, losses, or expenses arising from your use of our service, violation of these terms, or infringement of any rights of others.
						</p>
					</section>

					{/* Governing Law */}
					<section>
						<h3 className="text-2xl font-bold text-gray-900 mb-4">
							Governing Law and Dispute Resolution
						</h3>
						<p className="text-gray-700 leading-relaxed">
							These terms shall be governed by and construed in accordance with the laws of [Your Jurisdiction]. Any disputes arising from these terms or your use of our service will be resolved through binding arbitration, except where prohibited by law.
						</p>
					</section>

					{/* Contact and Support */}
					<section>
						<h3 className="text-2xl font-bold text-gray-900 mb-4">
							Contact and Support
						</h3>
						<p className="text-gray-700 leading-relaxed">
							We provide customer support to help you use our platform effectively. For educational content issues, technical problems, or account questions, please contact our support team.
						</p>
					</section>

					{/* Changes to Terms */}
					<section>
						<h3 className="text-2xl font-bold text-gray-900 mb-4">
							Changes to These Terms
						</h3>
						<p className="text-gray-700 leading-relaxed">
							We may update these terms from time to time. We will notify users of material changes by email or through our platform. Your continued use of our service after such changes constitutes acceptance of the updated terms.
						</p>
					</section>
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