import Image from 'next/image';
import Modal from '@/components/Modal';

interface ImageModalState {
  isOpen: boolean;
  type: 'display' | 'board' | 'defaultTile' | 'categoryImage' | null;
  currentValue: string;
}

interface ImageUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageModal: ImageModalState;
  setImageModal: (modal: ImageModalState) => void;
  onSaveImage: (type: 'display' | 'board' | 'defaultTile' | 'categoryImage', value: string) => void;
}

export default function ImageUploadModal({
  isOpen,
  onClose,
  imageModal,
  setImageModal,
  onSaveImage
}: ImageUploadModalProps) {
  const getModalTitle = () => {
    switch (imageModal.type) {
      case 'display':
        return 'Set Display Image';
      case 'board':
        return 'Set Board Background';
      case 'defaultTile':
        return 'Set Default Tile Background Image';
      case 'categoryImage':
        return 'Set Category Background Image';
      default:
        return 'Upload Image';
    }
  };

  const getModalIcon = () => {
    switch (imageModal.type) {
      case 'display':
        return '🖼️';
      case 'defaultTile':
        return '🔲';
      case 'categoryImage':
        return '📋';
      case 'board':
        return '🌄';
      default:
        return '📷';
    }
  };

  const getTipsText = () => {
    switch (imageModal.type) {
      case 'display':
        return 'This image appears on your game card';
      case 'board':
        return 'This background shows behind the game board during play';
      case 'defaultTile':
        return 'This image will be the default background for all question tiles';
      case 'categoryImage':
        return 'This image will be the background for category headers';
      default:
        return 'Choose an appropriate image for your game';
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="md"
    >
      <div className="space-y-4">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl">{getModalIcon()}</span>
          <h2 className="text-xl font-semibold">{getModalTitle()}</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Image URL
            </label>
            <input
              type="url"
              value={imageModal.currentValue}
              onChange={(e) => setImageModal({ ...imageModal, currentValue: e.target.value })}
              placeholder="https://example.com/image.jpg"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              Enter a direct link to an image (JPG, PNG, GIF, WebP)
            </p>
          </div>

          {/* Image Preview */}
          {imageModal.currentValue && (
            <div className="border rounded-lg p-3">
              <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
              <div className="w-full h-40 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                <Image
                  src={imageModal.currentValue}
                  alt="Image preview"
                  width={300}
                  height={160}
                  className="max-w-full max-h-full object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                  }}
                />
                <div className="hidden text-center text-gray-500">
                  <div className="text-2xl mb-2">❌</div>
                  <span className="text-sm">Unable to load image</span>
                </div>
              </div>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <h4 className="font-medium text-blue-800 mb-2">💡 Tips:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Use high-quality images for best results</li>
              <li>• Recommended size: 400x300 pixels or larger</li>
              <li>• Make sure the image URL is publicly accessible</li>
              <li>• {getTipsText()}</li>
            </ul>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (imageModal.type) {
                onSaveImage(imageModal.type, imageModal.currentValue);
              }
              onClose();
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Save Image
          </button>
        </div>
      </div>
    </Modal>
  );
}