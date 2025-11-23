import { useState, useEffect } from "react";
import { Plus, Search } from "lucide-react";
import type { ShortUrl } from "../types";
import { ShortUrlsTable } from "../components/ShortUrlsTable";
import { CreateModal } from "../components/CreateModal";
import { EditModal } from "../components/EditModal";
import { DeleteModal } from "../components/DeleteModal";
import { useDebounce } from "../hooks/useDebounce";
import { API_BASE_URL } from "../utils/contants";
import toast, { Toaster } from "react-hot-toast";

export function ShortUrlsPage() {
  const [urls, setUrls] = useState<ShortUrl[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingUrl, setEditingUrl] = useState<ShortUrl | null>(null);
  const [deletingUrl, setDeletingUrl] = useState<ShortUrl | null>(null);

  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  const fetchUrls = async (query?: string) => {
    try {
      setIsLoading(true);
      const url = query ? `${API_BASE_URL}/api/shorturls?q=${encodeURIComponent(query)}` : `${API_BASE_URL}/api/shorturls`;

      const response = await fetch(url);
      if (!response.ok) {
        let errBody = null;
        try {
          errBody = await response.json();
        } catch (e) {
          console.log("JSON ERROR", e);
        }
        const msg = (errBody && (errBody.error || errBody.message)) || "Failed to fetch URLs";
        toast.error(msg);
        return;
      }

      const data = await response.json();
      setUrls(data);
    } catch (error) {
      console.error("Error fetching URLs:", error);
      toast.error((error as Error)?.message || "Error fetching URLs");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUrls(debouncedSearchQuery);
  }, [debouncedSearchQuery]);

  const handleCreate = async (targetUrl: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/shorturls`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: targetUrl }),
      });

      if (!response.ok) {
        let errBody = null;
        try {
          errBody = await response.json();
        } catch (e) {
          console.log("JSON ERROR", e);
        }
        const msg = (errBody && (errBody.error || errBody.message)) || "Failed to create short URL";
        toast.error(msg);
        return;
      }

      toast.success("Short URL created");
      await fetchUrls(debouncedSearchQuery);
    } catch (error) {
      console.error("Error creating short URL:", error);
      toast.error((error as Error)?.message || "Error creating short URL");
    }
  };

  const handleEdit = async (targetUrl: string) => {
    if (!editingUrl) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/shorturls/${editingUrl.code}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: targetUrl }),
      });

      if (!response.ok) {
        let errBody = null;
        try {
          errBody = await response.json();
        } catch (e) {
          console.log("JSON ERROR", e);
        }
        const msg = (errBody && (errBody.error || errBody.message)) || "Failed to update short URL";
        toast.error(msg);
        return;
      }

      toast.success("Short URL updated");
      await fetchUrls(debouncedSearchQuery);
    } catch (error) {
      console.error("Error updating short URL:", error);
      toast.error((error as Error)?.message || "Error updating short URL");
    }
  };

  const handleDelete = async () => {
    if (!deletingUrl) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/shorturls/${deletingUrl.code}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        let errBody = null;
        try {
          errBody = await response.json();
        } catch (e) {
          console.log("JSON ERROR", e);
        }
        const msg = (errBody && (errBody.error || errBody.message)) || "Failed to delete short URL";
        toast.error(msg);
        return;
      }

      toast.success("Short URL deleted");
      await fetchUrls(debouncedSearchQuery);
    } catch (error) {
      console.error("Error deleting short URL:", error);
      toast.error((error as Error)?.message || "Error deleting short URL");
    }
  };

  const handleRowClick = (code: string) => {
    window.location.href = `/codes/${code}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Short URLs</h1>
          <p className="mt-2 text-gray-600">Manage your shortened URLs</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by code or target URL..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
          >
            <Plus size={20} />
            <span>Create Short URL</span>
          </button>
        </div>

        <div className="bg-white rounded-lg shadow">
          {isLoading ? (
            <div className="p-8 text-center text-gray-500">Loading...</div>
          ) : (
            <ShortUrlsTable urls={urls} onEdit={setEditingUrl} onDelete={setDeletingUrl} onRowClick={handleRowClick} />
          )}
        </div>
      </div>

      <CreateModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} onSubmit={handleCreate} />

      <EditModal
        isOpen={!!editingUrl}
        onClose={() => setEditingUrl(null)}
        onSubmit={handleEdit}
        currentUrl={editingUrl?.url || ""}
      />

      <DeleteModal
        isOpen={!!deletingUrl}
        onClose={() => setDeletingUrl(null)}
        onConfirm={handleDelete}
        code={deletingUrl?.code || ""}
      />
      <Toaster />
    </div>
  );
}
