import Image from 'next/image';
import Modal from '@/components/Modal';

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

interface EditingQuestion {
  categoryIndex: number;
  questionIndex: number;
  question: Question;
}

interface QuestionEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingQuestion: EditingQuestion | null;
  updateQuestion: (
    categoryIndex: number,
    questionIndex: number,
    field: 'question' | 'answer' | 'media' | 'timer' | 'difficulty',
    value: string | number | { type: 'image' | 'audio' | 'video'; url: string; alt?: string } | undefined
  ) => void;
}

export default function QuestionEditorModal({
  isOpen,
  onClose,
  editingQuestion,
  updateQuestion
}: QuestionEditorModalProps) {
  if (!editingQuestion) return null;

  const { categoryIndex, questionIndex, question } = editingQuestion;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="2xl"
    >
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-900">
            Edit Question: Category {categoryIndex + 1} - ${question.value}
          </h3>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Question
            </label>
            <textarea
              value={question.question}
              onChange={(e) => {
                updateQuestion(categoryIndex, questionIndex, 'question', e.target.value);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              placeholder="Enter your question..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Answer
            </label>
            <textarea
              value={question.answer}
              onChange={(e) => {
                updateQuestion(categoryIndex, questionIndex, 'answer', e.target.value);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              placeholder="Enter the answer..."
            />
          </div>

          {/* Media Support */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Media (Optional)
            </label>
            <div className="space-y-3">
              <div className="flex gap-2">
                <select
                  value={question.media?.type || ''}
                  onChange={(e) => {
                    const type = e.target.value as 'image' | 'audio' | 'video' | '';
                    if (type) {
                      updateQuestion(categoryIndex, questionIndex, 'media', {
                        type,
                        url: question.media?.url || '',
                        alt: question.media?.alt || ''
                      });
                    } else {
                      updateQuestion(categoryIndex, questionIndex, 'media', undefined);
                    }
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">No Media</option>
                  <option value="image">🖼️ Image</option>
                  <option value="audio">🎵 Audio</option>
                  <option value="video">🎬 Video</option>
                </select>

                {question.media && (
                  <input
                    type="url"
                    value={question.media.url}
                    onChange={(e) => {
                      updateQuestion(categoryIndex, questionIndex, 'media', {
                        ...question.media!,
                        url: e.target.value
                      });
                    }}
                    placeholder="Enter media URL..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                )}
              </div>

              {question.media?.type === 'image' && question.media.url && (
                <div className="border rounded-lg p-2">
                  <Image
                    src={question.media.url}
                    alt={question.media.alt || 'Question media'}
                    width={300}
                    height={128}
                    className="max-w-full h-32 object-cover rounded"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              )}

              {question.media?.type === 'audio' && question.media.url && (
                <div className="border rounded-lg p-2">
                  <audio controls className="w-full">
                    <source src={question.media.url} />
                    <p>Your browser does not support the audio element.</p>
                  </audio>
                </div>
              )}

              {question.media?.type === 'video' && question.media.url && (
                <div className="border rounded-lg p-2">
                  <video controls className="w-full max-h-40">
                    <source src={question.media.url} />
                    <p>Your browser does not support the video element.</p>
                  </video>
                </div>
              )}

              {question.media?.type === 'image' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Alt Text (Optional)
                  </label>
                  <input
                    type="text"
                    value={question.media.alt || ''}
                    onChange={(e) => {
                      const currentMedia = question.media;
                      if (currentMedia) {
                        updateQuestion(categoryIndex, questionIndex, 'media', {
                          ...currentMedia,
                          alt: e.target.value
                        });
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Describe the image..."
                  />
                </div>
              )}
            </div>
          </div>

          {/* Advanced Options */}
          <div className="border-t pt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Advanced Options</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Custom Timer (seconds)
                </label>
                <input
                  type="number"
                  value={question.timer || ''}
                  onChange={(e) => {
                    const timer = e.target.value ? parseInt(e.target.value) : undefined;
                    updateQuestion(categoryIndex, questionIndex, 'timer', timer);
                  }}
                  min="5"
                  max="300"
                  placeholder="30"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="mt-1 text-xs text-gray-500">
                  How long players have to answer this question
                </p>
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Difficulty Level
                </label>
                <select
                  value={question.difficulty || 'medium'}
                  onChange={(e) => {
                    const difficulty = e.target.value as 'easy' | 'medium' | 'hard';
                    updateQuestion(categoryIndex, questionIndex, 'difficulty', difficulty);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="easy">🟢 Easy</option>
                  <option value="medium">🟡 Medium</option>
                  <option value="hard">🔴 Hard</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Save & Close
          </button>
        </div>
      </div>
    </Modal>
  );
}