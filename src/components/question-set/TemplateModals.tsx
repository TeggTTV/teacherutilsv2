import { motion } from 'framer-motion';
import Link from 'next/link';
import Modal from '@/components/Modal';

interface TemplateForm {
  title: string;
  description: string;
  type: 'theme' | 'layout' | 'complete';
}

interface TemplateModalsProps {
  showTemplateModal: boolean;
  setShowTemplateModal: (show: boolean) => void;
  templateForm: TemplateForm;
  setTemplateForm: (form: TemplateForm | ((prev: TemplateForm) => TemplateForm)) => void;
  templateSaving: boolean;
  saveAsTemplate: () => void;
  showTemplateSuccessModal: boolean;
  setShowTemplateSuccessModal: (show: boolean) => void;
  templateSaveError: string | null;
  setTemplateSaveError: (error: string | null) => void;
}

export default function TemplateModals({
  showTemplateModal,
  setShowTemplateModal,
  templateForm,
  setTemplateForm,
  templateSaving,
  saveAsTemplate,
  showTemplateSuccessModal,
  setShowTemplateSuccessModal,
  templateSaveError,
  setTemplateSaveError
}: TemplateModalsProps) {
  return (
    <>
      {/* Template Save Modal */}
      {showTemplateModal && (
        <Modal isOpen={showTemplateModal} onClose={() => setShowTemplateModal(false)}>
          <div className="max-w-md mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Save as Template</h2>
                <p className="text-sm text-gray-600">Share your design with the community</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="template-title" className="block text-sm font-medium text-gray-700 mb-2">
                  Template Title *
                </label>
                <input
                  id="template-title"
                  type="text"
                  value={templateForm.title}
                  onChange={(e) => setTemplateForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., Math Quiz Blue Theme"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="template-description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  id="template-description"
                  value={templateForm.description}
                  onChange={(e) => setTemplateForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe your template design and what makes it special..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>

              <div>
                <label htmlFor="template-type" className="block text-sm font-medium text-gray-700 mb-2">
                  Template Type
                </label>
                <select
                  id="template-type"
                  value={templateForm.type}
                  onChange={(e) => setTemplateForm(prev => ({ ...prev, type: e.target.value as 'theme' | 'layout' | 'complete' }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="theme">Theme (Colors & Styling Only)</option>
                  <option value="layout">Layout (Structure + Categories/Questions)</option>
                  <option value="complete">Complete (Everything + Categories/Questions)</option>
                </select>
                <div className="mt-2 text-xs text-gray-600">
                  {templateForm.type === 'theme' && (
                    <p>• Saves: Colors, fonts, backgrounds, styling<br/>• Does NOT save: Categories, questions, answers</p>
                  )}
                  {templateForm.type === 'layout' && (
                    <p>• Saves: All styling + categories, questions, and answers<br/>• Perfect for reusing game content</p>
                  )}
                  {templateForm.type === 'complete' && (
                    <p>• Saves: Everything including all styling, categories, questions, and answers<br/>• Complete template for full reuse</p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowTemplateModal(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveAsTemplate}
                disabled={!templateForm.title.trim() || !templateForm.description.trim() || templateSaving}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {templateSaving && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                )}
                <span>{templateSaving ? 'Saving...' : 'Save Template'}</span>
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Template Success Modal */}
      {showTemplateSuccessModal && (
        <Modal isOpen={showTemplateSuccessModal} onClose={() => setShowTemplateSuccessModal(false)} maxWidth="md">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              >
                <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </motion.div>
            </div>
            <motion.h3
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xl font-semibold text-gray-900 mb-2"
            >
              Awesome! Template Saved! 🎉
            </motion.h3>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-gray-600 mb-6"
            >
              Your template has been saved to your private library. You can share it to the market from your dashboard whenever you&apos;re ready!
            </motion.p>
            <div className="flex justify-center gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowTemplateSuccessModal(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                Continue Creating
              </motion.button>
              <Link href="/dashboard?tab=my-templates">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center space-x-2"
                >
                  <span>View My Templates</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </motion.button>
              </Link>
            </div>
          </div>
        </Modal>
      )}

      {/* Template Error Modal */}
      {templateSaveError && (
        <Modal isOpen={!!templateSaveError} onClose={() => setTemplateSaveError(null)} maxWidth="md">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
              <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Oops! Something went wrong</h3>
            <p className="text-gray-600 mb-6">{templateSaveError}</p>
            <button
              onClick={() => setTemplateSaveError(null)}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              Try Again
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}