// Tutorial steps for the main onboarding flow
// Each step has a selector (CSS), title, and description
import type { TutorialStep } from '@/components/Tutorial';

const onboardingTutorialSteps: TutorialStep[] = [
	{
		selector: '#dashboard-link',
		title: 'Go to Dashboard',
		description:
			'Click here to access your dashboard, where you can manage and create your games.',
	},
	{
		selector: '#my-sets-tab',
		title: 'My Sets',
		description:
			'This tab shows all the games you have created. Let’s make your first one!',
	},
	{
		selector: '#create-game-btn',
		title: 'Create a Game',
		description:
			'Click here to start creating a new game. You can choose from different game types.',
	},
	{
		selector: '#jeopardy-option',
		title: 'Choose Jeopardy',
		description:
			'Select the Jeopardy game type to create a classic quiz game.',
	},
	{
		selector: '#game-title-input',
		title: 'Enter Game Title',
		description: 'Give your game a catchy title so you can find it later.',
	},
	{
		selector: '#category-0',
		title: 'First Category',
		description:
			'Enter the name for your first category. Categories group your questions.',
	},
	{
		selector: '#question-0-0',
		title: 'First Question',
		description: 'Write your first question and answer for this category.',
	},
	{
		selector: '#close-modal-btn',
		title: 'Close Question Modal',
		description:
			'Once you’re done, close the question modal to return to the board.',
	},
	{
		selector: '#save-game-btn',
		title: 'Save Game',
		description:
			'Click save to store your new game. You can edit it later if needed.',
	},
	{
		selector: '#incomplete-toggle',
		title: 'Incomplete Games',
		description:
			'Toggle to view games that are not yet finished. Let’s play your new game!',
	},
	{
		selector: '#start-game-btn',
		title: 'Start Game',
		description: 'Click here to start playing your game.',
	},
	{
		selector: '#start-game-confirm',
		title: 'Confirm Start',
		description: 'Confirm you want to start the game. Get ready!',
	},
	{
		selector: '#question-cell-0-0',
		title: 'Select First Question',
		description:
			'Click the first question in your first category to begin.',
	},
	{
		selector: '#show-answer-btn',
		title: 'Show Answer',
		description:
			'Reveal the answer to the question. You can keep track of scores as you play.',
	},
	{
		selector: '#exit-dashboard-btn',
		title: 'Exit to Dashboard',
		description:
			'When you’re done, exit to return to your dashboard. You’ve completed the tutorial!',
	},
];

export default onboardingTutorialSteps;
