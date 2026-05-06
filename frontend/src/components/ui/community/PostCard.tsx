import { Link } from "react-router-dom";

export interface PostProps {
  post: {
    id: string;
    title?: string;
    content: string;
    createdAt: string;
    user: {
      id: string;
      firstName: string;
      lastName: string;
      avatarUrl?: string;
      role: string;
    };
    _count: {
      comments: number;
    };
  };
}

const PostCard = ({ post }: PostProps) => {
  const formattedDate = new Date(post.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="ae-brand-card border border-[var(--ae-border)] rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow mb-4">
      <div className="flex items-start gap-4">
        {/* Author Avatar */}
        <div className="w-12 h-12 shrink-0 rounded-full bg-[var(--ae-blue)]/10 text-[var(--ae-blue)] flex items-center justify-center font-bold text-xl overflow-hidden border border-[var(--ae-blue)]/20">
          {post.user.avatarUrl ? (
            <img src={post.user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            post.user.firstName.charAt(0) + post.user.lastName.charAt(0)
          )}
        </div>

        {/* Post Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="font-bold text-[var(--text-color)] text-[15px]">
              {post.user.firstName} {post.user.lastName}
            </span>
            {post.user.role === "ADMIN" || post.user.role === "SUPER_ADMIN" ? (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 font-bold uppercase tracking-wider">
                Admin
              </span>
            ) : null}
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
            <p className="text-[var(--text-color)]/80 text-[15px] leading-relaxed whitespace-pre-wrap">
              {post.content}
            </p>
          </Link>

          {/* Action Footer */}
          <div className="mt-4 flex items-center gap-6">
            <Link 
              to={`/community/${post.id}`}
              className="flex items-center gap-2 text-sm text-[var(--text-color)]/60 hover:text-[var(--ae-blue)] transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span className="font-medium">{post._count?.comments || 0} Comments</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostCard;
