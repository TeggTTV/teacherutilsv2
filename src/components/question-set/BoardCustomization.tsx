import { motion } from 'framer-motion';
import Image from 'next/image';

interface Category {
  id: string;
  name: string;
  questions: Question[];
}

interface Question {
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

interface BoardColors {
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

interface BoardTypography {
  fontFamily: string;
  categoryFontSize: string;
  questionFontSize: string;
  fontWeight: string;
  categoryFontWeight: string;
}

interface BoardCustomizations {
  colors: BoardColors;
  typography: BoardTypography;
}

interface GameTemplate {
  id: string;
  title: string;
  description?: string;
  data: {
    title: string;
    displayImage?: string;
    boardBackground?: string;
    boardCustomizations?: BoardCustomizations;
    categories: Category[];
    colors: BoardColors;
    typography: BoardTypography;
    gameSettings: {
      timer: number;
      allowSkip: boolean;
      showAnswerAfterReveal: boolean;
      backgroundImage?: string;
      backgroundOpacity: number;
    };
  };
  isPublic?: boolean;
  createdAt?: string;
}

interface BoardCustomizationProps {
  sidePreviewMode: boolean;
  setSidePreviewMode: (mode: boolean) => void;
  activeCustomizationTab: string;
  setActiveCustomizationTab: (tab: string) => void;
  displayImage: string;
  setDisplayImage: (image: string) => void;
  boardBackground: string;
  setBoardBackground: (background: string) => void;
  boardCustomizations: BoardCustomizations;
  setBoardCustomizations: (customizations: BoardCustomizations | ((prev: BoardCustomizations) => BoardCustomizations)) => void;
  imageModal: {
    isOpen: boolean;
    type: 'display' | 'board' | 'defaultTile' | 'categoryImage' | null;
    currentValue: string;
  };
  setImageModal: (modal: {
    isOpen: boolean;
    type: 'display' | 'board' | 'defaultTile' | 'categoryImage' | null;
    currentValue: string;
  }) => void;
  showTemplateModal: boolean;
  setShowTemplateModal: (show: boolean) => void;
  userTemplates: GameTemplate[];
  loadingTemplates: boolean;
  applyTemplate: (template: GameTemplate) => void;
}

export default function BoardCustomization({
  sidePreviewMode,
  setSidePreviewMode,
  activeCustomizationTab,
  setActiveCustomizationTab,
  displayImage,
  setDisplayImage,
  boardBackground,
  setBoardBackground,
  boardCustomizations,
  setBoardCustomizations,
  // imageModal,
  setImageModal,
  // showTemplateModal,
  setShowTemplateModal,
  userTemplates,
  loadingTemplates,
  applyTemplate
}: BoardCustomizationProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="mb-8 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden"
    >
      <div className="p-8 pb-0">
        <div className="flex justify-between items-center mb-6">
          <motion.h3
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-2xl font-bold text-gray-900 flex items-center gap-3"
          >
            <span>🎨</span>
            Board Customization
          </motion.h3>

          {/* Side Preview Toggle */}
          <button
            onClick={() => setSidePreviewMode(!sidePreviewMode)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              sidePreviewMode
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-8 0V7m8 0V7" />
            </svg>
            {sidePreviewMode ? 'Hide Preview' : 'Side Preview'}
          </button>
        </div>

        {/* Category Tabs */}
        <div className="flex gap-1 mb-6 border-b">
          {[
            { id: 'images', label: '🖼️ Images', icon: '🖼️' },
            { id: 'colors', label: '🎨 Colors', icon: '🎨' },
            { id: 'typography', label: '📝 Typography', icon: '📝' },
            { id: 'templates', label: '📄 Templates', icon: '📄' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveCustomizationTab(tab.id)}
              className={`px-4 py-2 rounded-t-lg font-medium text-sm transition-colors border-b-2 ${
                activeCustomizationTab === tab.id
                  ? 'bg-blue-100 text-blue-700 border-blue-500'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50 border-transparent'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label.split(' ')[1]}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content - Split Layout Support */}
      <div className={`${sidePreviewMode ? 'flex gap-6' : ''}`}>
        {/* Left Panel - Tab Content */}
        <div className={`px-6 pb-6 ${sidePreviewMode ? 'w-1/2' : 'w-full'}`}>
          {/* Images Tab */}
          {activeCustomizationTab === 'images' && (
            <div className={`grid grid-cols-1 ${sidePreviewMode ? '' : 'md:grid-cols-2'} gap-6`}>
              {/* Display Image Section */}
              <div className="space-y-3">
                <h4 className="font-medium text-gray-700 flex items-center gap-2">
                  <span>🖼️</span>
                  Set Display Image
                </h4>
                <p className="text-sm text-gray-600">
                  Customize the background image shown on your game card
                </p>

                <div className="relative">
                  {/* Preview */}
                  <div className="w-full h-32 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center mb-3 overflow-hidden">
                    {displayImage ? (
                      <Image
                        src={displayImage}
                        alt="Display image preview"
                        width={200}
                        height={128}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                    ) : (
                      <div className="text-center">
                        <div className="text-3xl mb-2">🎯</div>
                        <span className="text-gray-500 text-sm">Default Image</span>
                      </div>
                    )}
                    {displayImage && (
                      <div className="hidden text-center">
                        <div className="text-3xl mb-2">❌</div>
                        <span className="text-gray-500 text-sm">Invalid Image</span>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => setImageModal({
                      isOpen: true,
                      type: 'display',
                      currentValue: displayImage
                    })}
                    className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <span>📷</span>
                    {displayImage ? 'Change Display Image' : 'Add Display Image'}
                  </button>

                  {displayImage && (
                    <button
                      onClick={() => setDisplayImage('')}
                      className="w-full mt-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors text-sm"
                    >
                      Remove Image
                    </button>
                  )}
                </div>
              </div>

              {/* Board Background Section */}
              <div className="space-y-3">
                <h4 className="font-medium text-gray-700 flex items-center gap-2">
                  <span>🌄</span>
                  Game Board Background
                </h4>
                <p className="text-sm text-gray-600">
                  Set a background image for the game board during gameplay
                </p>

                <div className="relative">
                  {/* Preview */}
                  <div className="w-full h-32 bg-gray-900 rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center mb-3 overflow-hidden relative">
                    {boardBackground ? (
                      <>
                        <Image
                          src={boardBackground}
                          alt="Board background preview"
                          width={200}
                          height={128}
                          className="w-full h-full object-cover opacity-30"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.parentElement?.querySelector('.error-fallback')?.classList.remove('hidden');
                          }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="bg-blue-600 text-white px-3 py-1 rounded text-sm">Jeopardy Board</div>
                        </div>
                      </>
                    ) : (
                      <div className="text-center">
                        <div className="bg-blue-600 text-white px-3 py-1 rounded text-sm mb-2">Jeopardy Board</div>
                        <span className="text-gray-400 text-xs">Default Background</span>
                      </div>
                    )}
                    {boardBackground && (
                      <div className="error-fallback absolute inset-0 hidden items-center justify-center">
                        <div className="text-center">
                          <div className="text-2xl mb-1">❌</div>
                          <span className="text-gray-400 text-xs">Invalid Image</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => setImageModal({
                      isOpen: true,
                      type: 'board',
                      currentValue: boardBackground
                    })}
                    className="w-full px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <span>🎮</span>
                    {boardBackground ? 'Change Board Background' : 'Add Board Background'}
                  </button>

                  {boardBackground && (
                    <button
                      onClick={() => setBoardBackground('')}
                      className="w-full mt-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors text-sm"
                    >
                      Remove Background
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Colors Tab */}
          {activeCustomizationTab === 'colors' && (
            <div className="space-y-6">
              <div className={`grid grid-cols-1 ${sidePreviewMode ? '' : 'md:grid-cols-2 lg:grid-cols-3'} gap-4`}>
                {/* Text Colors */}
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-700">Text Colors</h4>

                  <div className="space-y-2">
                    <label className="block text-sm text-gray-600">Category Text Color</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={boardCustomizations.colors.categoryTextColor}
                        onChange={(e) => setBoardCustomizations(prev => ({
                          ...prev,
                          colors: { ...prev.colors, categoryTextColor: e.target.value }
                        }))}
                        className="w-12 h-8 rounded border border-gray-300"
                      />
                      <span className="text-sm text-gray-600">{boardCustomizations.colors.categoryTextColor}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm text-gray-600">Question Text Color</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={boardCustomizations.colors.questionTextColor}
                        onChange={(e) => setBoardCustomizations(prev => ({
                          ...prev,
                          colors: { ...prev.colors, questionTextColor: e.target.value }
                        }))}
                        className="w-12 h-8 rounded border border-gray-300"
                      />
                      <span className="text-sm text-gray-600">{boardCustomizations.colors.questionTextColor}</span>
                    </div>
                  </div>
                </div>

                {/* Background Colors */}
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-700">Background Colors</h4>

                  <div className="space-y-2">
                    <label className="block text-sm text-gray-600">Category Background</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={boardCustomizations.colors.categoryBackground}
                        onChange={(e) => setBoardCustomizations(prev => ({
                          ...prev,
                          colors: { ...prev.colors, categoryBackground: e.target.value }
                        }))}
                        className="w-12 h-8 rounded border border-gray-300"
                      />
                      <span className="text-sm text-gray-600">{boardCustomizations.colors.categoryBackground}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm text-gray-600">Tile Background</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={boardCustomizations.colors.tileBackground}
                        onChange={(e) => setBoardCustomizations(prev => ({
                          ...prev,
                          colors: { ...prev.colors, tileBackground: e.target.value }
                        }))}
                        className="w-12 h-8 rounded border border-gray-300"
                      />
                      <span className="text-sm text-gray-600">{boardCustomizations.colors.tileBackground}</span>
                    </div>
                  </div>
                </div>

                {/* Border & Effects */}
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-700">Border & Effects</h4>

                  <div className="space-y-2">
                    <label className="block text-sm text-gray-600">Tile Border</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={boardCustomizations.colors.tileBorder}
                        onChange={(e) => setBoardCustomizations(prev => ({
                          ...prev,
                          colors: { ...prev.colors, tileBorder: e.target.value }
                        }))}
                        className="w-12 h-8 rounded border border-gray-300"
                      />
                      <span className="text-sm text-gray-600">{boardCustomizations.colors.tileBorder}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm text-gray-600">Tile Hover Color</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={boardCustomizations.colors.tileHover}
                        onChange={(e) => setBoardCustomizations(prev => ({
                          ...prev,
                          colors: { ...prev.colors, tileHover: e.target.value }
                        }))}
                        className="w-12 h-8 rounded border border-gray-300"
                      />
                      <span className="text-sm text-gray-600">{boardCustomizations.colors.tileHover}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm text-gray-600">Tile Opacity</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min="10"
                        max="100"
                        step="5"
                        value={boardCustomizations.colors.tileOpacity}
                        onChange={(e) => setBoardCustomizations(prev => ({
                          ...prev,
                          colors: { ...prev.colors, tileOpacity: parseInt(e.target.value) }
                        }))}
                        className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                      <span className="text-sm text-gray-600 font-medium min-w-[3rem]">{boardCustomizations.colors.tileOpacity}%</span>
                    </div>
                    <p className="text-xs text-gray-500">Controls the transparency of all tiles (affects readability)</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Typography Tab */}
          {activeCustomizationTab === 'typography' && (
            <div className="space-y-6">
              <div className={`grid grid-cols-1 ${sidePreviewMode ? '' : 'md:grid-cols-2'} gap-6`}>
                {/* Font Settings */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-700">Font Settings</h4>

                  <div className="space-y-2">
                    <label className="block text-sm text-gray-600">Font Family</label>
                    <select
                      value={boardCustomizations.typography.fontFamily}
                      onChange={(e) => setBoardCustomizations(prev => ({
                        ...prev,
                        typography: { ...prev.typography, fontFamily: e.target.value }
                      }))}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="Inter, sans-serif">Inter</option>
                      <option value="Arial, sans-serif">Arial</option>
                      <option value="Georgia, serif">Georgia</option>
                      <option value="Times New Roman, serif">Times New Roman</option>
                      <option value="Helvetica, sans-serif">Helvetica</option>
                      <option value="Verdana, sans-serif">Verdana</option>
                      <option value="Courier New, monospace">Courier New</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm text-gray-600">Font Weight</label>
                    <select
                      value={boardCustomizations.typography.fontWeight}
                      onChange={(e) => setBoardCustomizations(prev => ({
                        ...prev,
                        typography: { ...prev.typography, fontWeight: e.target.value }
                      }))}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="300">Light</option>
                      <option value="400">Normal</option>
                      <option value="500">Medium</option>
                      <option value="600">Semi-bold</option>
                      <option value="700">Bold</option>
                      <option value="800">Extra-bold</option>
                    </select>
                  </div>
                </div>

                {/* Font Sizes */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-700">Font Sizes</h4>

                  <div className="space-y-2">
                    <label className="block text-sm text-gray-600">Category Font Size</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min="12"
                        max="24"
                        value={boardCustomizations.typography.categoryFontSize}
                        onChange={(e) => setBoardCustomizations(prev => ({
                          ...prev,
                          typography: { ...prev.typography, categoryFontSize: e.target.value }
                        }))}
                        className="flex-1"
                      />
                      <span className="text-sm text-gray-600 w-12">{boardCustomizations.typography.categoryFontSize}px</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm text-gray-600">Question Font Size</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min="10"
                        max="20"
                        value={boardCustomizations.typography.questionFontSize}
                        onChange={(e) => setBoardCustomizations(prev => ({
                          ...prev,
                          typography: { ...prev.typography, questionFontSize: e.target.value }
                        }))}
                        className="flex-1"
                      />
                      <span className="text-sm text-gray-600 w-12">{boardCustomizations.typography.questionFontSize}px</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm text-gray-600">Category Font Weight</label>
                    <select
                      value={boardCustomizations.typography.categoryFontWeight}
                      onChange={(e) => setBoardCustomizations(prev => ({
                        ...prev,
                        typography: { ...prev.typography, categoryFontWeight: e.target.value }
                      }))}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="400">Normal</option>
                      <option value="500">Medium</option>
                      <option value="600">Semi-bold</option>
                      <option value="700">Bold</option>
                      <option value="800">Extra-bold</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Typography Preview */}
              <div className="mt-6 p-4 border rounded-lg bg-gray-50">
                <h5 className="font-medium text-gray-700 mb-3">Typography Preview</h5>
                <div className="space-y-2">
                  <div
                    className="p-3 bg-blue-600 text-white rounded text-center"
                    style={{
                      fontFamily: boardCustomizations.typography.fontFamily,
                      fontSize: `${boardCustomizations.typography.categoryFontSize}px`,
                      fontWeight: boardCustomizations.typography.categoryFontWeight
                    }}
                  >
                    Sample Category
                  </div>
                  <div
                    className="p-2 bg-gray-200 rounded text-center"
                    style={{
                      fontFamily: boardCustomizations.typography.fontFamily,
                      fontSize: `${boardCustomizations.typography.questionFontSize}px`,
                      fontWeight: boardCustomizations.typography.fontWeight
                    }}
                  >
                    $400
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Templates Tab */}
          {activeCustomizationTab === 'templates' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-8"
            >
              {/* Save as Template Button */}
              <div className="flex justify-between items-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">Save Current Design as Template</h3>
                  <p className="text-sm text-gray-600">Share your customizations with the community</p>
                </div>
                <motion.button
                  onClick={() => setShowTemplateModal(true)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  <span>Save as Template</span>
                </motion.button>
              </div>

              {/* User Templates Section */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Your Templates</h4>

                {loadingTemplates ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : userTemplates && userTemplates.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {userTemplates.map((template) => (
                      <motion.div
                        key={template.id}
                        className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer"
                        whileHover={{ scale: 1.02 }}
                        onClick={() => applyTemplate(template)}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h5 className="font-semibold text-gray-900 line-clamp-1">{template.title}</h5>
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                            {template.isPublic ? 'Public' : 'Private'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{template.description}</p>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>Created {template.createdAt ? new Date(template.createdAt).toLocaleDateString() : 'Unknown'}</span>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200 transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              applyTemplate(template);
                            }}
                          >
                            Apply
                          </motion.button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.6, delay: 0.1 }}
                      className="max-w-md mx-auto px-4"
                    >
                      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-10 h-10 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
                        </svg>
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-4 leading-tight">No Templates Yet</h3>
                      <p className="text-gray-600 mb-6 text-lg leading-relaxed">
                        You haven&apos;t saved any templates yet. Create your first template by customizing your game and clicking &quot;Save as Template&quot; above.
                      </p>
                      <div className="space-y-4 text-left bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-xl border border-gray-200">
                        <p className="text-base font-semibold text-gray-900">Templates will include:</p>
                        <ul className="text-gray-700 space-y-3 text-base leading-relaxed">
                          <li className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                            <span>Your custom color schemes</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                            <span>Background images</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                            <span>Typography settings</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                            <span>Board customizations</span>
                          </li>
                        </ul>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2 mt-6">
                        <button
                          onClick={() => window.open('/dashboard?tab=market', '_blank')}
                          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition-colors inline-flex items-center justify-center space-x-2 text-sm"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.293 2.293c-.63.63-.184 1.707.707 1.707H19M17 21a2 2 0 100-4 2 2 0 000 4zM9 21a2 2 0 100-4 2 2 0 000 4z" />
                          </svg>
                          <span>Browse Market</span>
                        </button>
                        <button
                          onClick={() => setActiveCustomizationTab('images')}
                          className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors inline-flex items-center justify-center space-x-2 text-sm"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                          </svg>
                          <span>Customize Manually</span>
                        </button>
                      </div>
                    </motion.div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </div>

        {/* Right Panel - Side Preview (only shown when sidePreviewMode is true) */}
        {sidePreviewMode && (
          <div className="w-1/2 px-6 pb-6 border-l">
            <div className="sticky top-6">
              <h4 className="font-medium text-gray-700 mb-4 flex items-center gap-2">
                <span>👁️</span>
                Live Preview
              </h4>

              {/* Live Board Preview */}
              <div
                id="board-preview-capture"
                className="rounded-lg border-2 border-gray-200 p-3"
                style={{
                  backgroundImage: boardBackground ? `url(${boardBackground})` : 'none',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat'
                }}
              >
                <div className="grid gap-1" style={{
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gridTemplateRows: 'auto repeat(5, 1fr)'
                }}>
                  {/* Category Headers */}
                  {[1, 2, 3, 4].map((catIndex) => (
                    <div
                      key={`side-cat-${catIndex}`}
                      className="text-center font-bold p-2 rounded relative overflow-hidden text-xs"
                      style={{
                        backgroundColor: boardCustomizations.colors.categoryBackground,
                        color: boardCustomizations.colors.categoryTextColor,
                        backgroundImage: boardCustomizations.colors.categoryBackgroundImage ? `url("${boardCustomizations.colors.categoryBackgroundImage}")` : 'none',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        opacity: boardCustomizations.colors.tileOpacity / 100,
                        fontFamily: boardCustomizations.typography.fontFamily,
                        fontSize: `${Math.max(10, parseInt(boardCustomizations.typography.categoryFontSize) - 2)}px`,
                        fontWeight: boardCustomizations.typography.categoryFontWeight
                      }}
                    >
                      <span style={{
                        textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
                        position: 'relative',
                        zIndex: 1
                      }}>
                        Category {catIndex}
                      </span>
                    </div>
                  ))}

                  {/* Question Tiles */}
                  {[100, 200, 300, 400, 500].map((value, rowIndex) => (
                    [1, 2, 3, 4].map((colIndex) => {
                      const tileColor = boardCustomizations.colors.tileBackground;
                      const tileImage = boardCustomizations.colors.defaultTileImage;

                      return (
                        <div
                          key={`side-preview-${rowIndex}-${colIndex}`}
                          className="text-center font-bold p-2 rounded flex items-center justify-center relative overflow-hidden text-xs"
                          style={{
                            backgroundColor: tileColor,
                            color: boardCustomizations.colors.questionTextColor,
                            borderColor: boardCustomizations.colors.tileBorder,
                            backgroundImage: tileImage ? `url("${tileImage}")` : 'none',
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            opacity: boardCustomizations.colors.tileOpacity / 100,
                            fontFamily: boardCustomizations.typography.fontFamily,
                            fontSize: `${Math.max(8, parseInt(boardCustomizations.typography.questionFontSize) - 2)}px`,
                            fontWeight: boardCustomizations.typography.fontWeight,
                            minHeight: '32px'
                          }}
                        >
                          <span style={{
                            textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
                            position: 'relative',
                            zIndex: 1
                          }}>
                            ${value}
                          </span>
                        </div>
                      );
                    })
                  )).flat()}
                </div>
              </div>

              {/* Preview Info */}
              {/* <div className="mt-3 p-3 bg-gray-50 rounded-lg border text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="font-medium text-gray-600">Opacity:</span>
                    <p className="text-gray-800">{boardCustomizations.colors.tileOpacity}%</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Font:</span>
                    <p className="text-gray-800">{boardCustomizations.typography.fontFamily.split(',')[0]}</p>
                  </div>
                </div>
              </div> */}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}