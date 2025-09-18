import { motion } from 'framer-motion';

interface BoardCustomizations {
  colors: {
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
  };
  typography: {
    fontFamily: string;
    categoryFontSize: string;
    questionFontSize: string;
    fontWeight: string;
    categoryFontWeight: string;
  };
}

interface Question {
  id: string;
  value: number;
  question: string;
  answer: string;
  isAnswered: boolean;
  media?: { type: 'image' | 'audio' | 'video'; url: string; alt?: string };
  timer?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
}

interface Category {
  id: string;
  name: string;
  questions: Question[];
}

interface GameBoardProps {
  categories: Category[];
  setCategories: (categories: Category[] | ((prev: Category[]) => Category[])) => void;
  boardCustomizations: BoardCustomizations;
  onQuestionClick: (categoryIndex: number, questionIndex: number) => void;
  onAddQuestion: (categoryIndex: number) => void;
  onUpdateCategory: (categoryIndex: number, name: string) => void;
}

export default function GameBoard({
  categories,
  setCategories,
  boardCustomizations,
  onQuestionClick,
  onAddQuestion,
  onUpdateCategory
}: GameBoardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.7 }}
      className="bg-white rounded-xl shadow-xl overflow-hidden border border-gray-100"
    >
      <div className="grid gap-1 p-4" style={{ gridTemplateColumns: `repeat(${Math.max(categories.length, 1)}, 1fr)` }}>
        {/* Category Headers */}
        {categories.map((category, categoryIndex) => (
          <div key={category.id} className="space-y-1">
            <div>
              <div className="relative group">
                <input
                  type="text"
                  value={category.name}
                  onChange={(e) => onUpdateCategory(categoryIndex, e.target.value)}
                  className="w-full p-4 text-center font-bold text-white border border-blue-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  style={{
                    backgroundColor: boardCustomizations.colors.categoryBackground,
                    color: boardCustomizations.colors.categoryTextColor,
                    opacity: boardCustomizations.colors.tileOpacity / 100
                  }}
                  placeholder={`Category ${categoryIndex + 1}`}
                />
                <div className="absolute -top-3 right-0 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                  {categories.length < 6 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const newCategory = {
                          id: `cat-${Date.now()}`,
                          name: '',
                          questions: [100, 200, 300, 400, 500].map((value, j) => ({
                            id: `q-${Date.now()}-${j}`,
                            value,
                            question: '',
                            answer: '',
                            isAnswered: false
                          }))
                        };
                        const newCategories = [...categories];
                        newCategories.splice(categoryIndex + 1, 0, newCategory);
                        setCategories(newCategories);
                      }}
                      className="p-1 rounded bg-green-500 text-white hover:bg-green-600"
                      title="Add category"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (categories.length < 6) {
                        const newCategory = {
                          ...category,
                          id: `cat-${Date.now()}`,
                          name: `${category.name} Copy`,
                          questions: category.questions.map(q => ({
                            ...q,
                            id: `q-${Date.now()}-${Math.random()}`,
                            question: '',
                            answer: ''
                          }))
                        };
                        const newCategories = [...categories];
                        newCategories.splice(categoryIndex + 1, 0, newCategory);
                        setCategories(newCategories);
                      }
                    }}
                    className="p-1 rounded bg-purple-500 text-white hover:bg-purple-600"
                    title="Duplicate category"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                    </svg>
                  </button>
                  {categories.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const newCategories = categories.filter((_, i) => i !== categoryIndex);
                        setCategories(newCategories);
                      }}
                      className="p-1 rounded bg-red-500 text-white hover:bg-red-600"
                      title="Remove category"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Questions */}
            {category.questions.map((question, questionIndex) => {
              const tileColor = boardCustomizations.colors.tileBackground;
              const tileImage = boardCustomizations.colors.defaultTileImage;

              return (
                <button
                  key={question.id}
                  onClick={() => onQuestionClick(categoryIndex, questionIndex)}
                  className="w-full p-6 text-center font-bold text-xl border border-gray-300 rounded transition-colors relative group overflow-hidden"
                  style={{
                    backgroundColor: question.question && question.answer ? boardCustomizations.colors.tileBackground : tileColor,
                    color: boardCustomizations.colors.questionTextColor,
                    borderColor: boardCustomizations.colors.tileBorder,
                    backgroundImage: tileImage ? `url(${tileImage})` : 'none',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    opacity: boardCustomizations.colors.tileOpacity / 100
                  }}
                >
                  <div className="flex flex-col items-center gap-1">
                    <span>${question.value}</span>

                    {/* Feature Indicators */}
                    <div className="flex gap-1 text-xs opacity-75">
                      {question.media && (
                        <span className="bg-purple-100 text-purple-600 px-1.5 py-0.5 rounded text-xs">
                          {question.media.type === 'image' && '🖼️'}
                          {question.media.type === 'audio' && '🎵'}
                          {question.media.type === 'video' && '🎬'}
                        </span>
                      )}
                      {question.timer && (
                        <span className="bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded text-xs">
                          ⏱️{question.timer}s
                        </span>
                      )}
                      {question.difficulty && (
                        <span className={`px-1.5 py-0.5 rounded text-xs ${
                          question.difficulty === 'easy' ? 'bg-green-100 text-green-600' :
                          question.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                          'bg-red-100 text-red-600'
                        }`}>
                          {question.difficulty === 'easy' && '🟢'}
                          {question.difficulty === 'medium' && '🟡'}
                          {question.difficulty === 'hard' && '🔴'}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Hover Preview */}
                  {(question.question || question.answer) && (
                    <>
                      <div className="absolute inset-0 bg-gray-900 opacity-0 group-hover:opacity-80 transition-opacity duration-200 rounded"></div>
                      <div className="absolute inset-0 text-white p-2 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-center text-sm z-10">
                        {question.question && (
                          <div className="mb-1">
                            <strong>Q:</strong> {question.question.slice(0, 50)}{question.question.length > 50 ? '...' : ''}
                          </div>
                        )}
                        {question.answer && (
                          <div>
                            <strong>A:</strong> {question.answer.slice(0, 50)}{question.answer.length > 50 ? '...' : ''}
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </button>
              );
            })}

            {/* Add Question Button */}
            {category.questions.length < 5 && (
              <button
                onClick={() => onAddQuestion(categoryIndex)}
                className="w-full p-4 border-2 border-dashed rounded text-gray-600 hover:text-blue-600 transition-colors"
                style={{
                  borderColor: '#d1d5db'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#3b82f6';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#d1d5db';
                }}
              >
                + Add Question
              </button>
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );
}