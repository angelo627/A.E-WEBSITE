import { useState, useEffect } from "react";
import { apiFetch } from "../../lib/api";
import { Plus, Trash2, ToggleLeft, ToggleRight, Megaphone, Calendar } from "lucide-react";

interface Announcement {
  id: string;
  title: string;
  message: string;
  isActive: boolean;
  expiresAt: string | null;
  createdAt: string;
}

const ManageAnnouncements = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  
  // Form state
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [expiresAt, setExpiresAt] = useState("");

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const data = await apiFetch("/announcements");
      setAnnouncements(data.announcements);
    } catch (err) {
      console.error("Failed to fetch announcements:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiFetch("/announcements", {
        method: "POST",
        body: JSON.stringify({ title, message, expiresAt: expiresAt || undefined }),
      });
      setTitle("");
      setMessage("");
      setExpiresAt("");
      setIsAdding(false);
      fetchAnnouncements();
    } catch (err) {
      alert("Failed to create announcement");
    }
  };

  const handleToggleActive = async (announcement: Announcement) => {
    try {
      await apiFetch(`/announcements/${announcement.id}`, {
        method: "PATCH",
        body: JSON.stringify({ isActive: !announcement.isActive }),
      });
      fetchAnnouncements();
    } catch (err) {
      alert("Failed to update announcement");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this announcement?")) return;
    try {
      await apiFetch(`/announcements/${id}`, { method: "DELETE" });
      fetchAnnouncements();
    } catch (err) {
      alert("Failed to delete announcement");
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Megaphone className="text-[var(--ae-blue)]" />
            Manage Announcements
          </h1>
          <p className="text-sm text-[var(--app-muted-text)]">Create and manage site-wide banners.</p>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="ae-brand-button px-4 py-2 flex items-center gap-2 text-sm"
        >
          {isAdding ? "Cancel" : <><Plus size={18} /> New Announcement</>}
        </button>
      </div>

      {isAdding && (
        <div className="ae-brand-card p-6 rounded-2xl mb-8 animate-in fade-in slide-in-from-top-4 duration-300">
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-sm font-bold mb-1">Banner Title</label>
              <input 
                type="text"
                required
                placeholder="e.g. Cohort 3 Registration Open"
                className="w-full bg-[var(--app-soft-surface)] border border-[var(--app-soft-border)] rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-[var(--ae-blue)]/50"
                value={title}
                onChange={e => setTitle(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">Detailed Message</label>
              <textarea 
                required
                placeholder="The short text that members will see..."
                className="w-full bg-[var(--app-soft-surface)] border border-[var(--app-soft-border)] rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-[var(--ae-blue)]/50 resize-none"
                rows={2}
                value={message}
                onChange={e => setMessage(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1 flex items-center gap-2">
                <Calendar size={16} /> Expiry Date (Optional)
              </label>
              <input 
                type="datetime-local"
                className="w-full bg-[var(--app-soft-surface)] border border-[var(--app-soft-border)] rounded-xl px-4 py-2.5 outline-none"
                value={expiresAt}
                onChange={e => setExpiresAt(e.target.value)}
              />
            </div>
            <div className="flex justify-end pt-2">
              <button 
                type="submit"
                className="bg-[var(--ae-blue)] text-white px-8 py-2.5 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all"
              >
                Publish Announcement
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center p-12">
            <div className="w-8 h-8 border-4 border-[var(--ae-blue)]/20 border-t-[var(--ae-blue)] rounded-full animate-spin"></div>
          </div>
        ) : announcements.length === 0 ? (
          <div className="text-center p-12 border-2 border-dashed border-[var(--ae-border)] rounded-2xl opacity-60">
            No announcements created yet.
          </div>
        ) : (
          announcements.map((ann) => (
            <div key={ann.id} className={`ae-brand-card p-5 rounded-2xl flex items-center justify-between gap-6 ${!ann.isActive ? 'opacity-60 bg-gray-50' : ''}`}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-lg truncate">{ann.title}</h3>
                  {!ann.isActive && <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-200 text-gray-500 font-bold uppercase">Inactive</span>}
                </div>
                <p className="text-sm text-[var(--app-muted-text)] line-clamp-1">{ann.message}</p>
                <div className="flex items-center gap-4 mt-2 text-[10px] text-[var(--app-subtle-text)] font-medium">
                  <span>Created: {new Date(ann.createdAt).toLocaleDateString()}</span>
                  {ann.expiresAt && <span className="text-orange-500">Expires: {new Date(ann.expiresAt).toLocaleString()}</span>}
                </div>
              </div>

              <div className="flex items-center gap-2 grow-0 shrink-0">
                <button 
                  onClick={() => handleToggleActive(ann)}
                  className={`p-2 rounded-xl transition-colors ${ann.isActive ? 'text-green-500 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-100'}`}
                  title={ann.isActive ? "Deactivate" : "Activate"}
                >
                  {ann.isActive ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
                </button>
                <button 
                  onClick={() => handleDelete(ann.id)}
                  className="p-2 text-red-400 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                  title="Delete"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ManageAnnouncements;
