import { useState, useEffect } from "react";
import { useParams, Link, useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { apiFetch } from "../lib/api";

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string;
    role: string;
  };
}

interface PostDetails {
  id: string;
  title?: string;
  content: string;
  createdAt: string;
  userId: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string;
    role: string;
  };
  comments: Comment[];
}

const PostDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isLoggedIn } = useAuth();
  
  const [post, setPost] = useState<PostDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isLoggedIn && id) {
      fetchPost();
    }
  }, [isLoggedIn, id]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      const data = await apiFetch(`/community/${id}`);
      setPost(data.post);
    } catch (err: any) {
      setError(err.message || "Failed to load post");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !post) return;

    try {
      setIsSubmitting(true);
      const data = await apiFetch(`/community/${post.id}/comments`, {
        method: "POST",
        body: JSON.stringify({ content: newComment }),
      });
      setPost({
        ...post,
        comments: [...post.comments, data.comment]
      });
      setNewComment("");
    } catch (err: any) {
      alert(err.message || "Failed to post comment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePost = async () => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    try {
      await apiFetch(`/community/${post?.id}`, { method: "DELETE" });
      navigate("/community");
    } catch (err: any) {
      alert(err.message || "Failed to delete post");
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!window.confirm("Are you sure you want to delete this comment?")) return;
    try {
      await apiFetch(`/community/comments/${commentId}`, { method: "DELETE" });
      setPost(prev => prev ? {
        ...prev,
        comments: prev.comments.filter(c => c.id !== commentId)
      } : null);
    } catch (err: any) {
      alert(err.message || "Failed to delete comment");
    }
  };

  if (!isLoggedIn) {
     return <Navigate to="/login" />;
  }

  if (loading) {
    return (
      <div className="pt-32 pb-20 min-h-screen bg-[var(--bg-color)] flex justify-center p-12">
        <div className="w-10 h-10 border-4 border-[var(--ae-blue)]/30 border-t-[var(--ae-blue)] rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="pt-32 pb-20 min-h-screen bg-[var(--bg-color)] px-4">
        <div className="max-w-3xl mx-auto ae-brand-card p-8 rounded-xl border border-red-500/20 text-center text-red-500">
          <h2 className="text-xl font-bold mb-4">{error || "Post not found"}</h2>
          <Link to="/community" className="text-[var(--ae-blue)] hover:underline">
            &larr; Back to Community
          </Link>
        </div>
      </div>
    );
  }

  const formattedDate = new Date(post.createdAt).toLocaleDateString("en-US", {
    month: "long", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit"
  });

  const canDeletePost = user && (user.id === post.userId || user.role === "ADMIN" || user.role === "SUPER_ADMIN");

  return (
    <div className="pt-32 pb-20 min-h-screen bg-[var(--bg-color)] text-[var(--text-color)] transition-colors duration-300">
      <div className="max-w-3xl mx-auto px-4 md:px-6">
        
        {/* Back Link */}
        <Link to="/community" className="inline-flex items-center text-[var(--text-color)]/60 hover:text-[var(--ae-blue)] transition-colors mb-6 font-medium">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Back to Discussions
        </Link>

        {/* Original Post */}
        <div className="ae-brand-card border border-[var(--ae-border)] rounded-2xl p-6 md:p-8 shadow-sm mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-14 h-14 shrink-0 rounded-full bg-[var(--ae-blue)]/10 text-[var(--ae-blue)] flex items-center justify-center font-bold text-2xl overflow-hidden border border-[var(--ae-blue)]/20">
              {post.user.avatarUrl ? (
                <img src={post.user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                post.user.firstName.charAt(0) + post.user.lastName.charAt(0)
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-lg text-[var(--text-color)]">
                      {post.user.firstName} {post.user.lastName}
                    </span>
                    {(post.user.role === "ADMIN" || post.user.role === "SUPER_ADMIN") && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 font-bold uppercase tracking-wider">Admin</span>
                    )}
                  </div>
                  <div className="text-[var(--text-color)]/50 text-sm mt-0.5">{formattedDate}</div>
                </div>
                
                {canDeletePost && (
                  <button 
                    onClick={handleDeletePost}
                    title="Delete Post" 
                    className="text-red-500/50 hover:text-red-500 p-2 hover:bg-red-500/10 rounded-full transition-all"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                )}
              </div>
            </div>
          </div>

          {post.title && (
            <h1 className="text-2xl md:text-3xl font-bold text-[var(--text-color)] mb-4">{post.title}</h1>
          )}
          <p className="text-[var(--text-color)]/90 text-[16px] md:text-lg leading-relaxed whitespace-pre-wrap">
            {post.content}
          </p>
        </div>

        {/* Comments Section */}
        <div className="mb-4">
          <h3 className="font-bold text-xl mb-6 flex items-center gap-2">
            Comments
            <span className="bg-[var(--ae-blue)]/10 text-[var(--ae-blue)] px-2.5 py-0.5 rounded-full text-sm">{post.comments.length}</span>
          </h3>

          <div className="space-y-4 mb-8">
            {post.comments.length === 0 ? (
              <div className="text-center p-8 ae-brand-card border border-[var(--ae-border)] border-dashed rounded-xl opacity-70">
                <p>No comments yet. Be the first to reply!</p>
              </div>
            ) : (
              post.comments.map((comment) => {
                const canDeleteComment = user && (user.id === comment.user.id || user.role === "ADMIN" || user.role === "SUPER_ADMIN");
                const commentDate = new Date(comment.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"});

                return (
                  <div key={comment.id} className="ae-brand-card border border-[var(--ae-border)] rounded-xl p-5 shadow-sm ml-4 md:ml-12 relative before:absolute before:left-[-1rem] before:top-8 before:w-4 before:h-px before:bg-[var(--ae-border)] md:before:left-[-3rem] md:before:w-12">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 shrink-0 rounded-full bg-[var(--bg-color)] text-[var(--text-color)] flex items-center justify-center font-bold text-sm overflow-hidden border border-[var(--ae-border)]">
                        {comment.user.avatarUrl ? (
                          <img src={comment.user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                          comment.user.firstName.charAt(0) + comment.user.lastName.charAt(0)
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center mb-1">
                          <div className="flex items-baseline gap-2">
                            <span className="font-bold text-[15px]">{comment.user.firstName} {comment.user.lastName}</span>
                            <span className="text-[var(--text-color)]/50 text-xs">{commentDate}</span>
                          </div>
                          {canDeleteComment && (
                             <button onClick={() => handleDeleteComment(comment.id)} className="text-red-500/50 hover:text-red-500 hover:bg-red-500/10 p-1 rounded transition-all">
                               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                             </button>
                          )}
                        </div>
                        <p className="text-[var(--text-color)]/80 text-[15px] whitespace-pre-wrap">{comment.content}</p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Add Comment Form */}
          <div className="ml-4 md:ml-12 ae-brand-card border border-[var(--ae-border)] rounded-xl p-5 relative before:absolute before:left-[-1rem] before:top-8 before:w-4 before:h-px before:bg-[var(--ae-border)] md:before:left-[-3rem] md:before:w-12">
            <form onSubmit={handleCreateComment}>
              <textarea
                className="w-full bg-[var(--bg-color)] border border-[var(--ae-border)] rounded-lg p-3 text-[15px] text-[var(--text-color)] placeholder:text-[var(--text-color)]/40 focus:outline-none focus:ring-2 focus:ring-[var(--ae-blue)]/50 transition-all resize-none mb-3"
                rows={2}
                placeholder={`Reply to ${post.user.firstName}...`}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                disabled={isSubmitting}
              />
              <div className="flex justify-end">
                <button 
                  type="submit"
                  disabled={isSubmitting || !newComment.trim()}
                  className="bg-[var(--ae-blue)] text-white px-5 py-1.5 rounded-full font-bold text-sm shadow hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Replying..." : "Reply"}
                </button>
              </div>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
};

export default PostDetailsPage;
