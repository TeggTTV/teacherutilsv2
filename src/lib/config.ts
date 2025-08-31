// Environment configuration for API URLs
export const getBaseUrl = (): string => {
	const environment = process.env.NODE_ENV || 'development';
	const deploymentUrl = process.env.NEXT_PUBLIC_VERCEL_URL;
	const customUrl = process.env.NEXT_PUBLIC_CUSTOM_URL;

	// If we have a custom URL set (for production), use it
	if (customUrl) {
		return customUrl.startsWith('http') ? customUrl : `https://${customUrl}`;
	}

	// If we're in production and have a Vercel URL, use it
	if (environment === 'production' && deploymentUrl) {
		return `https://${deploymentUrl}`;
	}

	// For development, use localhost
	if (typeof window !== 'undefined') {
		return window.location.origin;
	}

	return 'http://localhost:3000';
};

export const getApiUrl = (endpoint: string): string => {
	const baseUrl = getBaseUrl();
	return `${baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
};

// Alternative approach using environment key like you mentioned
export const getApiUrlByEnv = (endpoint: string): string => {
	const envKey = process.env.NEXT_PUBLIC_ENV_KEY || 'local';
	
	let baseUrl: string;
	
	switch (envKey) {
		case 'local':
		case 'development':
			baseUrl = 'http://localhost:3000';
			break;
		case 'production':
		case 'prod':
			// Use your production URL here
			baseUrl = process.env.NEXT_PUBLIC_PRODUCTION_URL || 'https://your-app.vercel.app';
			break;
		case 'staging':
			baseUrl = process.env.NEXT_PUBLIC_STAGING_URL || 'https://staging-your-app.vercel.app';
			break;
		default:
			baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
	}
	
	return `${baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
};
