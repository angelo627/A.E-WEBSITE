import { Link } from "react-router-dom";
import { Pin, ThumbsUp, MessageSquare } from "lucide-react";
import { useState } from "react";
import { apiFetch } from "../../../lib/api";
import ReactMarkdown from "react-markdown";

export interface PostProps {
  post: {
    id: string;
    title?: string;
    content: string;
    isPinned: boolean;
    category: string;
    createdAt: string;
    user: {
      id: string;
      firstName: string;
      lastName: string;
      username: string;
      avatarUrl?: string;
      role: string;
    };
    _count: {
      comments: number;
      likes: number;
    };
    likes: { userId: string }[];
  };
  onUpdate?: () => void;
  currentUser?: any;
}

const CATEGORY_COLORS: Record<string, string> = {
  GENERAL: "bg-slate-500/10 text-slate-500 border-slate-500/20",
  QUESTION: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
  PROJECT_SHOWCASE: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  RESOURCE: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  OFF_TOPIC: "bg-rose-500/10 text-rose-500 border-rose-500/20",
};

const PostCard = ({ post, onUpdate, currentUser }: PostProps) => {
  const [isLiking, setIsLiking] = useState(false);
  
  const hasLiked = post.likes?.some(like => like.userId === currentUser?.id);

  const formattedDate = new Date(post.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (isLiking) return;
    try {
      setIsLiking(true);
      await apiFetch(`/community/${post.id}/like`, { method: "POST" });
      onUpdate?.();
    } catch (err) {
      console.error("Failed to like post", err);
    } finally {
      setIsLiking(false);
    }
  };

  const handlePin = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      await apiFetch(`/community/${post.id}/pin`, { method: "PATCH" });
      onUpdate?.();
    } catch (err) {
      console.error("Failed to pin post", err);
    }
  };

  return (
    <div className={`ae-brand-card border rounded-2xl p-6 shadow-sm hover:shadow-md transition-all mb-4 relative overflow-hidden ${post.isPinned ? "border-[var(--ae-blue)]/30 ring-1 ring-[var(--ae-blue)]/5" : "border-[var(--ae-border)]"}`}>
      {post.isPinned && (
        <div className="absolute top-0 right-0 z-10">
          <div className="bg-[var(--ae-blue)] text-white text-[10px] font-bold px-3 py-1 flex items-center gap-1 rounded-bl-xl shadow-sm">
            <Pin className="w-3 h-3 fill-current" /> PINNED
          </div>
        </div>
      )}

      <div className="flex items-start gap-4">
        {/* Author Avatar */}
        <Link to={`/profile/${post.user.username}`} className="shrink-0 group">
          <div className="w-12 h-12 rounded-full bg-[var(--ae-blue)]/10 text-[var(--ae-blue)] flex items-center justify-center font-bold text-xl overflow-hidden border border-[var(--ae-blue)]/20 shadow-sm group-hover:border-[var(--ae-blue)] transition-all">
            {post.user.avatarUrl ? (
              <img src={post.user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              post.user.firstName.charAt(0) + post.user.lastName.charAt(0)
            )}
          </div>
        </Link>

        {/* Post Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap pr-16 md:pr-0">
            <Link to={`/profile/${post.user.username}`} className="font-bold text-[var(--text-color)] text-[15px] hover:text-[var(--ae-blue)] transition-colors">
              {post.user.firstName} {post.user.lastName}
            </Link>
            
            {post.user.role === "ADMIN" || post.user.role === "SUPER_ADMIN" ? (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 font-bold uppercase tracking-wider">
                Admin
              </span>
            ) : null}

            <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold uppercase tracking-wider ${CATEGORY_COLORS[post.category] || CATEGORY_COLORS.GENERAL}`}>
              {post.category.replace("_", " ")}
            </span>

            <span className="text-[var(--text-color)]/50 text-xs ml-auto">
              {formattedDate}
            </span>
          </div>

          <Link to={`/community/${post.id}`} className="block group">
            {post.title && (
              <h3 className="text-lg font-bold text-[var(--text-color)] mb-2 group-hover:text-[var(--ae-blue)] transition-colors">
                {post.title}
              </h3>
            )}
            <div className="text-[var(--text-color)]/80 text-[15px] leading-relaxed markdown-content prose prose-sm max-w-none">
              <ReactMarkdown>{post.content}</ReactMarkdown>
            </div>
          </Link>

          {/* Action Footer */}
          <div className="mt-6 flex items-center gap-4 sm:gap-6 border-t border-[var(--ae-border)]/50 pt-4">
            <button 
              onClick={handleLike}
              disabled={isLiking}
              className={`flex items-center gap-2 text-sm transition-all hover:scale-105 active:scale-95 ${hasLiked ? "text-rose-500 font-bold" : "text-[var(--text-color)]/60 hover:text-rose-500"}`}
            >
              <ThumbsUp className={`w-5 h-5 ${hasLiked ? "fill-current" : ""}`} />
              <span className="font-medium">{post._count?.likes || 0}</span>
            </button>

            <Link 
              to={`/community/${post.id}`}
              className="flex items-center gap-2 text-sm text-[var(--text-color)]/60 hover:text-[var(--ae-blue)] transition-colors"
            >
              <MessageSquare className="w-5 h-5" />
              <span className="font-medium">{post._count?.comments || 0}</span>
            </Link>

            {(currentUser?.role === "ADMIN" || currentUser?.role === "SUPER_ADMIN") && (
              <button 
                onClick={handlePin}
                className={`ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                  post.isPinned 
                    ? "bg-[var(--ae-blue)] text-white shadow-sm" 
                    : "text-[var(--text-color)]/40 hover:bg-[var(--ae-blue)]/5 hover:text-[var(--ae-blue)]"
                }`}
                title={post.isPinned ? "Unpin Post" : "Pin Post"}
              >
                <Pin className={`w-4 h-4 ${post.isPinned ? "fill-current" : ""}`} />
                <span className="text-xs font-bold uppercase tracking-wider">
                  {post.isPinned ? "Pinned" : "Pin"}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostCard;
