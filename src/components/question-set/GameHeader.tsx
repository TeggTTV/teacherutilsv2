import Link from 'next/link';
import { motion } from 'framer-motion';

interface GameHeaderProps {
  gameTitle: string;
  setGameTitle: (title: string) => void;
  savedGameId: string | null;
  autoSaveStatus: 'idle' | 'saving' | 'saved' | 'error';
  lastAutoSave: Date | null;
  validationErrors: string[];
  saveError: string | null;
  saveSuccess: boolean;
  completionStats: {
    categories: number;
    questions: number;
    totalPossible: number;
  };
  onSaveGame: () => void;
  onResetGame: () => void;
}

export default function GameHeader({
  gameTitle,
  setGameTitle,
  savedGameId,
  autoSaveStatus,
  lastAutoSave,
  validationErrors,
  saveError,
  saveSuccess,
  completionStats,
  onSaveGame,
  onResetGame
}: GameHeaderProps) {
  return (
    <>
      {/* Debug Panel */}
      <div className="bg-yellow-50 border-b border-yellow-200 p-2">
        <div className="max-w-7xl mx-auto px-4 text-sm text-yellow-800 font-mono">
          <strong>🐛 Debug:</strong> Categories: {completionStats.categories} |
          Questions: {completionStats.questions} |
          Total Possible: {completionStats.totalPossible}
        </div>
      </div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white shadow-lg border-b border-gray-100"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="space-y-6">
            {/* Top row - Title and navigation */}
            <div className="flex items-center gap-4 min-w-0">
              <Link
                href="/dashboard"
                className="flex items-center gap-2 text-gray-600 hover:text-gray-800 flex-shrink-0"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span className="hidden sm:inline">Back to Dashboard</span>
              </Link>
              <div className="border-l pl-4 flex items-center gap-3 min-w-0 flex-1">
                <input
                  type="text"
                  value={gameTitle}
                  onChange={(e) => setGameTitle(e.target.value)}
                  placeholder="Enter game title..."
                  className="bg-transparent text-lg sm:text-xl font-semibold border-none outline-none focus:ring-0 text-gray-900 min-w-0 flex-1"
                />
                {savedGameId && (
                  <div className="flex items-center gap-2 px-2 py-1 bg-green-100 border border-green-300 rounded-full flex-shrink-0">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs font-medium text-green-700 hidden sm:inline">Saved</span>
                  </div>
                )}
              </div>
            </div>

            {/* Status and actions row */}
            <div className="flex items-center justify-between gap-3 flex-wrap">
              {/* Status indicators */}
              <div className="flex items-center gap-2 flex-wrap">
                {/* Auto-save Status */}
                {autoSaveStatus === 'saving' && (
                  <div className="flex items-center gap-2 px-2 py-1 bg-blue-100 border border-blue-300 rounded-full">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-spin"></div>
                    <span className="text-xs font-medium text-blue-700">Auto-saving...</span>
                  </div>
                )}
                {autoSaveStatus === 'saved' && savedGameId && (
                  <div className="flex items-center gap-2 px-2 py-1 bg-green-100 border border-green-300 rounded-full">
                    <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-xs font-medium text-green-700 hidden sm:inline">
                      Auto-saved {lastAutoSave && new Intl.DateTimeFormat('en-US', {
                        hour: '2-digit',
                        minute: '2-digit'
                      }).format(lastAutoSave)}
                    </span>
                  </div>
                )}
                {autoSaveStatus === 'error' && (
                  <div className="flex items-center gap-2 px-2 py-1 bg-red-100 border border-red-300 rounded-full">
                    <svg className="w-3 h-3 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span className="text-xs font-medium text-red-700 hidden sm:inline">Auto-save failed</span>
                  </div>
                )}

                {/* Validation Status */}
                {validationErrors.length > 0 && (
                  <div className="flex items-center gap-2 px-2 py-1 bg-yellow-100 border border-yellow-300 rounded-full">
                    <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.694-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <span className="text-xs font-medium text-yellow-700">{validationErrors.length} issues</span>
                  </div>
                )}

                {/* Game Ready Indicator */}
                {validationErrors.length === 0 && completionStats.questions >= 5 && (
                  <div className="flex items-center gap-2 px-2 py-1 bg-green-100 border border-green-300 rounded-full">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-xs font-medium text-green-700 hidden sm:inline">Ready to play!</span>
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-3">
                {/* Reset button */}
                <button
                  onClick={onResetGame}
                  className="px-4 sm:px-6 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors flex-shrink-0"
                >
                  Reset Game
                </button>

                {/* Save button */}
                <button
                  onClick={onSaveGame}
                  disabled={saveSuccess}
                  className="px-4 sm:px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                >
                  {saveSuccess ? 'Saved!' : 'Save Game'}
                </button>
              </div>
            </div>

            {/* Error and Success Messages - Full width on their own row */}
            {(saveError || saveSuccess) && (
              <div className="w-full">
                {saveError && (
                  <div className="px-3 py-2 bg-red-100 border border-red-300 rounded-lg text-red-700 text-sm">
                    {saveError}
                  </div>
                )}
                {saveSuccess && (
                  <div className="px-3 py-2 bg-green-100 border border-green-300 rounded-lg text-green-700 text-sm">
                    ✓ Game saved successfully! Redirecting...
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </>
  );
}