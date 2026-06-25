import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { apiFetch } from "../lib/api";
import { 
  MapPin, 
  Calendar, 
  BookOpen, 
  Trophy, 
  MessageSquare,
  ChevronLeft,
  Loader2
} from "lucide-react";
import PostCard from "../components/ui/community/PostCard";

interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  avatarUrl?: string;
  role: string;
  bio?: string;
  location?: string;
  createdAt: string;
  communityPosts: any[];
  _count: {
    moduleProgresses: number;
    quizAttempts: number;
    communityPosts: number;
  };
}

export default function ProfilePage() {
  const { username } = useParams<{ username: string }>();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const data = await apiFetch(`/profiles/${username}`);
        setProfile(data.data);
      } catch (err: any) {
        setError(err.message || "User not found");
      } finally {
        setLoading(false);
      }
    };

    if (username) {
      fetchProfile();
    }
  }, [username]);

  if (loading) {
    return (
      <div className="pt-40 flex flex-col items-center justify-center min-h-[60vh] text-[var(--text-color)]">
        <Loader2 className="w-12 h-12 text-[var(--ae-blue)] animate-spin mb-4" />
        <p className="font-bold opacity-60">Traveling to @{username}'s world...</p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="pt-40 flex flex-col items-center justify-center min-h-[60vh] text-[var(--text-color)] px-6 text-center">
        <h2 className="text-3xl font-black mb-4">404 - Explorer Not Found</h2>
        <p className="mb-8 opacity-60 max-w-md">The user "@{username}" hasn't joined our universe yet or might have changed their handle.</p>
        <Link to="/community" className="ae-brand-button px-8 py-3 rounded-full text-white font-bold">
          Return to Community
        </Link>
      </div>
    );
  }

  const joinDate = new Date(profile.createdAt).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric"
  });

  return (
    <div className="pt-32 pb-20 px-6 min-h-screen ae-brand-page font-outfit">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <Link to="/community" className="inline-flex items-center gap-2 text-[var(--text-color)]/60 hover:text-[var(--ae-blue)] transition-all mb-8 font-bold group">
          <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          Back to Discussions
        </Link>

        {/* Profile Header Card */}
        <div className="ae-brand-card border border-[var(--ae-border)] rounded-[2.5rem] p-8 md:p-12 shadow-sm relative overflow-hidden mb-8">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--ae-blue)]/5 rounded-full -mr-32 -mt-32 blur-[80px]" />
          
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8 relative z-10">
            {/* Avatar */}
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-[var(--ae-blue)]/10 text-[var(--ae-blue)] flex items-center justify-center text-4xl font-black border-4 border-[var(--ae-blue)]/20 shadow-xl overflow-hidden shrink-0">
              {profile.avatarUrl ? (
                <img src={profile.avatarUrl} alt={profile.username} className="w-full h-full object-cover" />
              ) : (
                profile.firstName.charAt(0) + profile.lastName.charAt(0)
              )}
            </div>

            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-center gap-2 mb-2">
                <h1 className="text-3xl md:text-4xl font-black text-[var(--text-color)] italic">
                  {profile.firstName} {profile.lastName}
                </h1>
                {profile.role !== "STUDENT" && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-[var(--ae-blue)]/10 text-[var(--ae-blue)] text-xs font-black uppercase tracking-tighter w-fit mx-auto md:mx-0">
                    {profile.role}
                  </span>
                )}
              </div>
              <p className="text-[var(--ae-blue)] font-bold text-lg mb-4">@{profile.username}</p>
              
              <p className="text-[var(--text-color)]/70 text-lg leading-relaxed mb-6 max-w-2xl italic">
                {profile.bio || "No bio provided yet. Just a quiet learner in the A.E universe."}
              </p>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-[var(--text-color)]/50 text-sm font-bold">
                {profile.location && (
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4" /> {profile.location}
                  </div>
                )}
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" /> Joined {joinDate}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-12">
          <div className="ae-brand-card border border-[var(--ae-border)] rounded-2xl p-6 text-center shadow-sm">
            <div className="p-3 bg-indigo-500/10 text-indigo-500 rounded-xl w-fit mx-auto mb-3">
              <BookOpen className="w-6 h-6" />
            </div>
            <p className="text-2xl font-black italic">{profile._count.moduleProgresses}</p>
            <p className="text-[10px] uppercase font-black opacity-40">Modules Done</p>
          </div>
          
          <div className="ae-brand-card border border-[var(--ae-border)] rounded-2xl p-6 text-center shadow-sm">
            <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl w-fit mx-auto mb-3">
              <Trophy className="w-6 h-6" />
            </div>
            <p className="text-2xl font-black italic">{profile._count.quizAttempts}</p>
            <p className="text-[10px] uppercase font-black opacity-40">Quizzes Passed</p>
          </div>

          <div className="ae-brand-card border border-[var(--ae-border)] rounded-2xl p-6 text-center shadow-sm col-span-2 md:col-span-1">
            <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl w-fit mx-auto mb-3">
              <MessageSquare className="w-6 h-6" />
            </div>
            <p className="text-2xl font-black italic">{profile._count.communityPosts}</p>
            <p className="text-[10px] uppercase font-black opacity-40">Forum Posts</p>
          </div>
        </div>

        {/* Activity Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-[var(--ae-border)] pb-4">
            <h2 className="text-2xl font-black italic">Recent Activity</h2>
          </div>

          {profile.communityPosts.length > 0 ? (
            <div className="space-y-4">
              {profile.communityPosts.map(post => (
                <PostCard 
                  key={post.id} 
                  post={{...post, user: profile}} 
                  currentUser={null} // We don't necessarily need current user actions here
                />
              ))}
            </div>
          ) : (
            <div className="ae-brand-card border border-[var(--ae-border)] border-dashed rounded-3xl p-12 text-center">
              <p className="text-[var(--text-color)]/40 font-bold italic text-lg">No recent posts found in the community.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
