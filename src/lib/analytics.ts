// Google Analytics utility functions
declare global {
	interface Window {
		gtag?: (
			command: 'config' | 'event' | 'js' | 'set',
			targetId: string | Date,
			config?: Record<string, unknown>
		) => void;
	}
}

export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

// Track page views
export const pageview = (url: string) => {
	if (!GA_MEASUREMENT_ID || !window.gtag) return;

	window.gtag('config', GA_MEASUREMENT_ID, {
		page_location: url,
	});
};

// Track custom events
export const event = ({
	action,
	category,
	label,
	value,
}: {
	action: string;
	category: string;
	label?: string;
	value?: number;
}) => {
	if (!GA_MEASUREMENT_ID || !window.gtag) return;

	window.gtag('event', action, {
		event_category: category,
		event_label: label,
		value: value,
	});
};

// Pre-defined tracking functions for common actions
export const trackGamePlay = (gameId: string, gameTitle: string) => {
	event({
		action: 'play_game',
		category: 'engagement',
		label: `${gameTitle} (${gameId})`,
	});
};

export const trackGameCreation = (gameTitle: string) => {
	event({
		action: 'create_game',
		category: 'engagement',
		label: gameTitle,
	});
};

export const trackGameShare = (gameId: string, gameTitle: string) => {
	event({
		action: 'share_game',
		category: 'social',
		label: `${gameTitle} (${gameId})`,
	});
};

export const trackGameSave = (gameId: string, gameTitle: string) => {
	event({
		action: 'save_game',
		category: 'engagement',
		label: `${gameTitle} (${gameId})`,
	});
};

export const trackSearch = (searchTerm: string) => {
	event({
		action: 'search',
		category: 'engagement',
		label: searchTerm,
	});
};

export const trackSignup = () => {
	event({
		action: 'signup',
		category: 'user',
		label: 'user_registration',
	});
};

export const trackLogin = () => {
	event({
		action: 'login',
		category: 'user',
		label: 'user_login',
	});
};
