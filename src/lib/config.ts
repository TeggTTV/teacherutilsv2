// Environment configuration for API URLs
export const getBaseUrl = (): string => {
	const environment = process.env.NODE_ENV || 'development';
	const deploymentUrl = process.env.NEXT_PUBLIC_VERCEL_URL;
	const customUrl = process.env.NEXT_PUBLIC_CUSTOM_URL;

	// If we have a custom URL set (for production), use it
	if (customUrl) {
		// Remove any trailing slash and ensure proper protocol
		const cleanUrl = customUrl.replace(/\/+$/, '');
		return cleanUrl.startsWith('http') ? cleanUrl : `https://${cleanUrl}`;
	}

	// If we're in production and have a Vercel URL, use it
	if (environment === 'production' && deploymentUrl) {
		const cleanDeploymentUrl = deploymentUrl.replace(/\/+$/, '');
		return cleanDeploymentUrl.startsWith('http') ? cleanDeploymentUrl : `https://${cleanDeploymentUrl}`;
	}

	// For development, use localhost
	if (typeof window !== 'undefined') {
		return window.location.origin;
	}

	return 'http://localhost:3000';
};

export const getApiUrl = (endpoint: string): string => {
	const baseUrl = getBaseUrl();
	const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
	const fullUrl = `${baseUrl}${cleanEndpoint}`;
	
	// Debug logging for production issues
	if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
		console.log('getApiUrl debug:', {
			baseUrl,
			endpoint,
			cleanEndpoint,
			fullUrl,
			customUrl: process.env.NEXT_PUBLIC_CUSTOM_URL,
			deploymentUrl: process.env.NEXT_PUBLIC_VERCEL_URL
		});
	}
	
	return fullUrl;
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
