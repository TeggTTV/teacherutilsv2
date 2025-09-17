import Modal from './Modal';

interface UnsubscribeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    isLoading: boolean;
}

export default function UnsubscribeModal({ isOpen, onClose, onConfirm, isLoading }: UnsubscribeModalProps) {
    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Unsubscribe from Newsletter
            </h3>
            <p className="text-gray-600 mb-6">
                Are you sure you want to unsubscribe from our newsletter? You&apos;ll no longer receive updates about new features and educational resources.
            </p>
            <div className="flex justify-end gap-3">
                <button
                    onClick={onClose}
                    disabled={isLoading}
                    className="px-4 py-2 text-gray-600 hover:text-gray-700 font-medium disabled:opacity-50"
                >
                    Cancel
                </button>
                <button
                    onClick={onConfirm}
                    disabled={isLoading}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 font-medium"
                >
                    {isLoading ? (
                        <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Unsubscribing...
                        </>
                    ) : (
                        'Unsubscribe'
                    )}
                </button>
            </div>
        </Modal>
    );
}
