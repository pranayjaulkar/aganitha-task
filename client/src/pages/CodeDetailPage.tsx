import { useState, useEffect } from "react";
import { ArrowLeft, Copy, Check } from "lucide-react";
import type { ShortUrl } from "../types";
import { API_BASE_URL } from "../utils/contants";
import { useNavigate } from "react-router";
import toast from "react-hot-toast";

export function CodeDetailPage() {
  const [url, setUrl] = useState<ShortUrl | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState("");
  const navigate = useNavigate();

  const shortenedUrl = `${import.meta.env.PROD ? "https" : "http"}://${
    import.meta.env.PROD ? window.location.hostname : "localhost:5000"
  }/${url?.code || ""}`;

  const code = window.location.pathname.split("/codes/")[1];

  useEffect(() => {
    const fetchUrlDetails = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`${API_BASE_URL}/api/shorturls/${code}`);
        if (!response.ok) throw new Error("Failed to fetch URL details");
        const data = await response.json();
        setUrl(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load URL details");
      } finally {
        setIsLoading(false);
      }
    };

    if (code) {
      fetchUrlDetails();
    }
  }, [code]);

  const formatDate = (date: string | null) => {
    if (!date) return "Never";
    return new Date(date).toLocaleString();
  };

  const handleBack = () => {
    navigate("/");
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    toast.success("Copied!");
    setTimeout(() => setCopied(""), 1000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (error || !url) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || "URL not found"}</p>
          <button onClick={handleBack} className="text-blue-600 hover:text-blue-700 underline">
            Back to list
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 relative">
      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Back to list</span>
        </button>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-blue-600 px-6 py-4">
            <h1 className="text-2xl font-bold text-white">Short URL Details</h1>
          </div>

          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <h2 className="text-sm font-medium text-gray-600 mb-2">Code</h2>
                <p className="text-xl font-mono text-blue-600">{url.code}</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h2 className="text-sm font-medium text-gray-600 mb-2">Click Count</h2>
                <p className="text-3xl font-bold text-gray-900">{url.clicks}</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h2 className="text-sm font-medium text-gray-600 mb-2">Target URL</h2>
              <div className="flex items-center gap-5 break-all text-blue-600 hover:text-blue-700">
                <a href={url.url} target="_blank" rel="noopener noreferrer" className="break-all">
                  {url.url}
                </a>

                {copied === "url" ? (
                  <Check
                    size={16}
                    className="cursor-pointer text-green-600"
                    onClick={() => handleCopy(url.url, "url")}
                  />
                ) : (
                  <Copy size={16} className="cursor-pointer" onClick={() => handleCopy(url.url, "url")} />
                )}
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h2 className="text-sm font-medium text-gray-600 mb-2">Shortened URL</h2>
              <div className="flex items-center gap-5 break-all text-blue-600 hover:text-blue-700">
                <a href={shortenedUrl} target="_blank" rel="noopener noreferrer" className="break-all">
                  {shortenedUrl}
                </a>

                {copied === "short" ? (
                  <Check
                    size={16}
                    className="cursor-pointer text-green-600"
                    onClick={() => handleCopy(shortenedUrl, "short")}
                  />
                ) : (
                  <Copy size={16} className="cursor-pointer" onClick={() => handleCopy(shortenedUrl, "short")} />
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <h2 className="text-sm font-medium text-gray-600 mb-2">Created At</h2>
                <p className="text-gray-900">{formatDate(url.createdAt)}</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h2 className="text-sm font-medium text-gray-600 mb-2">Last Updated At</h2>
                <p className="text-gray-900">{formatDate(url.updatedAt)}</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 md:col-span-2">
                <h2 className="text-sm font-medium text-gray-600 mb-2">Last Clicked At</h2>
                <p className="text-gray-900">{formatDate(url.lastClickedAt)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
