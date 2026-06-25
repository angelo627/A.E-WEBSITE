import { useState, useEffect } from "react";
import { useAuth } from "../context/useAuth";
import { apiFetch } from "../lib/api";
import PostCard from "../components/ui/community/PostCard";
import type { PostProps } from "../components/ui/community/PostCard";
import { Link } from "react-router-dom";
import { Lock } from "lucide-react";

const CommunityPage = () => {
  const { isLoggedIn, user } = useAuth();
  const [posts, setPosts] = useState<PostProps["post"][]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostCategory, setNewPostCategory] = useState("GENERAL");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const CATEGORIES = [
    { id: "GENERAL", label: "General", emoji: "💬" },
    { id: "QUESTION", label: "Questions", emoji: "❓" },
    { id: "PROJECT_SHOWCASE", label: "Projects", emoji: "🚀" },
    { id: "RESOURCE", label: "Resources", emoji: "📚" },
    { id: "OFF_TOPIC", label: "Off-Topic", emoji: "☕" },
  ];

  useEffect(() => {
    if (isLoggedIn) {
      fetchPosts();
    }
  }, [isLoggedIn, selectedCategory]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const url = selectedCategory 
        ? `/community?category=${selectedCategory}` 
        : "/community";
      const data = await apiFetch(url);
      setPosts(data.posts);
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
        body: JSON.stringify({ 
          content: newPostContent,
          category: newPostCategory
        }),
      });
      // If we are filtering, and the new post doesn't match, maybe don't show it immediately
      // or just refresh. Here we just add it to top.
      setPosts([data.post, ...posts]);
      setNewPostContent("");
      setNewPostCategory("GENERAL");
    } catch (err: any) {
      alert(err.message || "Failed to create post");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="pt-32 pb-20 min-h-screen bg-[var(--bg-color)] flex items-center justify-center px-4 relative">
        <div className="absolute inset-0 overflow-hidden pointer-events-none flex justify-center">
          <div className="w-[800px] h-[500px] bg-[var(--ae-blue)]/5 blur-[120px] rounded-full translate-y-[-20%]"></div>
        </div>
        
        <div className="text-center ae-brand-card p-10 sm:p-14 rounded-[2rem] border border-[var(--ae-border)] max-w-2xl w-full shadow-2xl relative z-10 bg-[var(--bg-color)]/80 backdrop-blur-xl">
          <div className="w-20 h-20 bg-[var(--bg-color)] rounded-full mx-auto flex items-center justify-center mb-8 shadow-sm border border-[var(--ae-border)]">
            <Lock className="w-8 h-8 text-[var(--ae-blue)]" strokeWidth={1.5} />
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-[var(--text-color)] mb-5 tracking-tight">Access Restricted</h2>
          <p className="text-[var(--text-color)]/70 mb-10 text-lg leading-relaxed max-w-lg mx-auto">
            The AE Discovery Circle is an exclusive hub for verified members to collaborate, share ideas, and grow together. 
            Log in to participate in the conversation.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/login" className="ae-brand-button text-white px-8 py-3.5 rounded-full font-bold shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all w-full sm:w-auto">
              Login to Access
            </Link>
            <Link to="/signup" className="px-8 py-3.5 rounded-full font-bold border border-[var(--ae-border)] text-[var(--text-color)] hover:bg-[var(--text-color)]/5 transition-all w-full sm:w-auto">
              Apply for Membership
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
            
            <div className="flex flex-wrap gap-2 mb-4">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setNewPostCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all flex items-center gap-1.5 ${
                    newPostCategory === cat.id 
                      ? "bg-[var(--ae-blue)] text-white border-[var(--ae-blue)] shadow-sm" 
                      : "bg-[var(--bg-color)] text-[var(--text-color)]/60 border-[var(--ae-border)] hover:border-[var(--ae-blue)]/30"
                  }`}
                >
                  <span>{cat.emoji}</span>
                  {cat.label}
                </button>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-t border-[var(--ae-border)] pt-4">
              <div className="text-xs text-[var(--text-color)]/50 break-all max-w-[200px] sm:max-w-none">
                Post as <span className="font-bold text-[var(--ae-blue)]">@{user?.username}</span>
              </div>
              <button 
                type="submit"
                disabled={isSubmitting || !newPostContent.trim()}
                className="ae-brand-button text-white px-6 py-2.5 rounded-full font-bold shadow-md hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 w-full sm:w-auto justify-center"
              >
                {isSubmitting ? "Posting..." : "Post to Community"}
              </button>
            </div>
          </form>
        </div>

        {/* Category Filters */}
        <div className="flex overflow-x-auto pb-4 gap-2 mb-8 items-center scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 rounded-full text-sm font-bold border transition-all whitespace-nowrap ${
              selectedCategory === null 
                ? "bg-[var(--ae-blue)] text-white border-[var(--ae-blue)]" 
                : "bg-transparent text-[var(--text-color)]/60 border-[var(--ae-border)] hover:bg-[var(--text-color)]/5"
            }`}
          >
            All Posts
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-full text-sm font-bold border transition-all whitespace-nowrap ${
                selectedCategory === cat.id 
                  ? "bg-[var(--ae-blue)] text-white border-[var(--ae-blue)]" 
                  : "bg-transparent text-[var(--text-color)]/60 border-[var(--ae-border)] hover:bg-[var(--text-color)]/5"
              }`}
            >
              {cat.label}
            </button>
          ))}
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
              <PostCard 
                key={post.id} 
                post={post} 
                currentUser={user}
                onUpdate={fetchPosts}
              />
            ))
          )}
        </div>

      </div>
    </div>
  );
};

export default CommunityPage;
