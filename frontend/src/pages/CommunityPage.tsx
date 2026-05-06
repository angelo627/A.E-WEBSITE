import { useState, useEffect } from "react";
import { useAuth } from "../../context/useAuth";
import { apiFetch } from "../../lib/api";
import PostCard, { PostProps } from "../components/ui/community/PostCard";
import { Link, Navigate } from "react-router-dom";

const CommunityPage = () => {
  const { isLoggedIn, user } = useAuth();
  const [posts, setPosts] = useState<PostProps["post"][]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [newPostContent, setNewPostContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isLoggedIn) {
      fetchPosts();
    }
  }, [isLoggedIn]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const data = await apiFetch("/community/v1"); // wait, the backend route is actually /api/v1 is appended. Let's check backend routes... No, apiRouter mounts on /api so /community is sufficient. Wait, backend index.ts says `apiRouter.use("/community", communityRoutes);`. No `v1`. So endpoint is just `/community`.
      const data2 = await apiFetch("/community");
      setPosts(data2.posts);
    } catch (err: any) {
      setError(err.message || "Failed to load community feed");
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim()) return;

    try {
      setIsSubmitting(true);
      const data = await apiFetch("/community", {
        method: "POST",
        body: JSON.stringify({ content: newPostContent }),
      });
      setPosts([data.post, ...posts]);
      setNewPostContent("");
    } catch (err: any) {
      alert(err.message || "Failed to create post");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="pt-32 pb-20 min-h-screen bg-[var(--bg-color)] flex items-center justify-center px-4">
        <div className="text-center ae-brand-card p-12 rounded-3xl border border-[var(--ae-border)] max-w-lg w-full shadow-lg">
          <div className="w-20 h-20 bg-[var(--bg-color)] rounded-full mx-auto flex items-center justify-center text-4xl mb-6 shadow-sm border border-[var(--ae-border)]">
            🔒
          </div>
          <h2 className="text-3xl font-bold text-[var(--test-color)] mb-4">Members Only</h2>
          <p className="text-[var(--text-color)]/70 mb-8">
            The AE Discovery Circle Community is an exclusive space for verified members. Please log in to join the conversation.
          </p>
          <div className="flex gap-4 justify-center">
            <Link to="/login" className="ae-brand-button text-white px-8 py-3 rounded-full font-bold shadow-md hover:shadow-xl transition-all">
              Login to Access
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-20 min-h-screen bg-[var(--bg-color)] text-[var(--text-color)] transition-colors duration-300">
      <div className="max-w-3xl mx-auto px-4 md:px-6">
        
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-3 tracking-tight text-[var(--ae-blue)]">
            Community Discussions
          </h1>
          <p className="text-[var(--text-color)]/70 text-lg">
            Share ideas, ask questions, and connect with other members.
          </p>
        </div>

        {/* Create Post Section */}
        <div className="ae-brand-card border border-[var(--ae-border)] rounded-2xl p-6 shadow-sm mb-8">
          <form onSubmit={handleCreatePost}>
            <textarea
              className="w-full bg-[var(--bg-color)] border border-[var(--ae-border)] rounded-xl p-4 text-[var(--text-color)] placeholder:text-[var(--text-color)]/40 focus:outline-none focus:ring-2 focus:ring-[var(--ae-blue)]/50 transition-all resize-none mb-4"
              rows={3}
              placeholder={`What's on your mind, ${user?.firstName}?`}
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              disabled={isSubmitting}
            />
            <div className="flex justify-between items-center">
              <div className="text-xs text-[var(--text-color)]/50">
                Formatting support (Markdown) coming soon!
              </div>
              <button 
                type="submit"
                disabled={isSubmitting || !newPostContent.trim()}
                className="ae-brand-button text-white px-6 py-2 rounded-full font-bold shadow-md hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSubmitting ? "Posting..." : "Post to Community"}
              </button>
            </div>
          </form>
        </div>

        {/* Community Feed */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold mb-6 text-[var(--text-color)]/90 border-b border-[var(--ae-border)] pb-2">Recent Activity</h2>
          
          {loading ? (
            <div className="flex justify-center p-12">
              <div className="w-10 h-10 border-4 border-[var(--ae-blue)]/30 border-t-[var(--ae-blue)] rounded-full animate-spin"></div>
            </div>
          ) : error ? (
            <div className="ae-brand-card border border-red-500/20 p-8 rounded-xl text-center text-red-500">
              {error}
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center p-12 ae-brand-card border border-[var(--ae-border)] rounded-2xl">
              <span className="text-4xl mb-4 block">👋</span>
              <h3 className="text-xl font-bold mb-2">It's quiet in here...</h3>
              <p className="text-[var(--text-color)]/60">Be the first to say hello to the community!</p>
            </div>
          ) : (
            posts.map(post => (
              <PostCard key={post.id} post={post} />
            ))
          )}
        </div>

      </div>
    </div>
  );
};

export default CommunityPage;
