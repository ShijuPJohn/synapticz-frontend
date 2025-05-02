import React from "react";

export default function ConfirmModal({ message, onConfirm, onCancel }) {
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-80">
                <p className="text-gray-800 mb-4">{message}</p>
                <div className="flex justify-end space-x-3">
                    <button
                        onClick={onCancel}
                        className="px-4 py-1 text-sm text-gray-700 border border-gray-300 rounded hover:bg-gray-100"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-4 py-1 text-sm text-white bg-red-500 rounded hover:bg-red-600"
                    >
                        Remove
                    </button>
                </div>
            </div>
        </div>
    );
}
