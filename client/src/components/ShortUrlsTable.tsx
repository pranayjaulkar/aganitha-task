import { Edit2, Trash2 } from "lucide-react";
import type { ShortUrl } from "../types";

interface ShortUrlsTableProps {
  urls: ShortUrl[];
  onEdit: (url: ShortUrl) => void;
  onDelete: (url: ShortUrl) => void;
  onRowClick: (code: string) => void;
}

export function ShortUrlsTable({ urls, onEdit, onDelete, onRowClick }: ShortUrlsTableProps) {
  const formatDate = (date: string | null) => {
    if (!date) return "Never";
    return new Date(date).toLocaleString();
  };

  const handleActionClick = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    action();
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
              Target URL
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Code</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Clicks</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
              Last Clicked At
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
              Created At
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {urls.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                No short URLs found
              </td>
            </tr>
          ) : (
            urls.map((url) => (
              <tr
                key={url.id}
                onClick={() => onRowClick(url.code)}
                className="hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <td className="px-4 py-3 text-sm text-gray-900 max-w-xs truncate">{url.url}</td>
                <td className="px-4 py-3 text-sm font-mono text-blue-600">{url.code}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{url.clicks}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{formatDate(url.lastClickedAt)}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{formatDate(url.createdAt)}</td>
                <td className="px-4 py-3 text-sm text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={(e) => handleActionClick(e, () => onEdit(url))}
                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      title="Edit"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={(e) => handleActionClick(e, () => onDelete(url))}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
