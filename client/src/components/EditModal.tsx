import { useState, useEffect } from "react";
import { Modal } from "./Modal";

interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (targetUrl: string) => Promise<void>;
  currentUrl: string;
}

export function EditModal({ isOpen, onClose, onSubmit, currentUrl }: EditModalProps) {
  const [targetUrl, setTargetUrl] = useState(currentUrl);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [urlChange, setUrlChange] = useState({ old: "", new: "" });

  useEffect(() => {
    setTargetUrl(currentUrl);
    setUrlChange({ new: currentUrl, old: currentUrl });
  }, [currentUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!targetUrl.trim()) {
      setError("Target URL is required");
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit(targetUrl);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update short URL");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Short URL">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="editTargetUrl" className="block text-sm font-medium text-gray-700 mb-1">
            Target URL
          </label>
          <input
            id="editTargetUrl"
            type="url"
            value={targetUrl}
            onChange={(e) => {
              setTargetUrl(e.target.value);
              setUrlChange((prev) => ({ ...prev, new: e.target.value }));
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="https://example.com"
            disabled={isSubmitting}
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            disabled={urlChange.new === urlChange.old || isSubmitting}
          >
            {isSubmitting ? "Updating..." : "Update"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
