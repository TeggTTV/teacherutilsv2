import withBundleAnalyzer from '@next/bundle-analyzer';

/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	poweredByHeader: false,
	compress: true,
	images: {
		formats: ['image/avif', 'image/webp'],
	},
	devIndicators: false
};

export default withBundleAnalyzer({
	enabled: process.env.ANALYZE === 'true',
})(nextConfig);
