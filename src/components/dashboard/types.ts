export interface BoardColors {
	textColor: string;
	categoryTextColor: string;
	questionTextColor: string;
	tileBackground: string;
	tileBorder: string;
	tileHover: string;
	defaultTileBackground: string;
	categoryBackground: string;
	defaultTileImage: string;
	categoryBackgroundImage: string;
	tileOpacity: number;
}

export interface BoardTypography {
	fontFamily: string;
	categoryFontSize: string;
	questionFontSize: string;
	fontWeight: string;
	categoryFontWeight: string;
}

export interface BoardCustomizations {
	colors: BoardColors;
	typography: BoardTypography;
}

export interface SavedGame {
	id: string;
	title: string;
	description?: string;
	type: 'JEOPARDY';
	data: {
		gameTitle: string;
		categories: Category[];
		customValues: number[];
		displayImage?: string;
		boardBackground?: string;
		boardCustomizations?: BoardCustomizations;
	};
	isPublic: boolean;
	tags: string[];
	createdAt: string;
	updatedAt: string;
}

export interface PublicGame {
	id: string;
	title: string;
	description?: string;
	type: 'JEOPARDY';
	data: {
		gameTitle: string;
		categories: Category[];
		customValues: number[];
		displayImage?: string;
		boardBackground?: string;
		boardCustomizations?: BoardCustomizations;
	};
	isPublic: boolean;
	tags: string[];
	subject?: string;
	gradeLevel?: string;
	difficulty?: string;
	language: string;
	createdAt: string;
	updatedAt: string;
	publishedAt: string;
	author: {
		id: string;
		name: string;
		school?: string;
	};
	plays: number;
	downloads: number;
	saves: number;
	avgRating: number;
	ratingsCount: number;
	favoritesCount: number;
}

export interface Category {
	id: string;
	name: string;
	questions: Question[];
}

export interface Question {
	id: string;
	value: number;
	question: string;
	answer: string;
	isAnswered: boolean;
	media?: {
		type: 'image' | 'audio' | 'video';
		url: string;
		alt?: string;
	};
	timer?: number;
	difficulty?: 'easy' | 'medium' | 'hard';
}

export interface SidebarItem {
	id: string;
	label: string;
	icon: React.ReactNode;
	bgColor: string;
	textColor: string;
}

export interface MarketFilters {
	subject: string;
	gradeLevel: string;
	difficulty: string;
	sortBy: string;
}

export interface Template {
	id: string;
	title: string;
	description: string;
	type: 'JEOPARDY' | 'QUIZ' | 'WORD_GAME';
	data: Record<string, unknown>;
	previewImage?: string;
	tags: string[];
	difficulty?: string;
	gradeLevel?: string;
	subject?: string;
	templateDownloads?: Array<unknown>;
	downloads: number;
	rating: number;
	ratingCount: number;
	isFeatured: boolean;
	isPublic: boolean;
	createdAt: string;
	author: {
		id: string;
		name: string;
		username?: string;
	};
}
