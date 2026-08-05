import { useState, useRef, useCallback } from 'react';
import { Heart, MessageCircle, Send, MoreHorizontal, Home, Search, PlusSquare, User, Bookmark, Smile } from 'lucide-react';
import type { Profile, Post, Canary } from '../lib/supabase';
import { supabase } from '../lib/supabase';
import { detectCanary } from '../lib/canaryEngine';
import { executeMultiAgentPipeline, type LocationContext } from '../lib/agentPipeline';
import { samplePosts, sampleStories } from '../data/mockData';
import { formatDistanceToNow } from 'date-fns';

interface CovertFeedProps {
  onAuthClick: () => void;
  isAuthenticated: boolean;
  onPostCreated: (postId: string) => void;
  profile: Profile | null;
  onSecretGesture?: () => void;
  showOnboarding?: () => void;
}

export function CovertFeed({
  onAuthClick,
  isAuthenticated,
  onPostCreated,
  profile,
  onSecretGesture,
}: CovertFeedProps) {
  const [posts, setPosts] = useState<Post[]>(isAuthenticated ? [] : samplePosts);
  const [newPostContent, setNewPostContent] = useState('');
  const [posting, setPosting] = useState(false);
  const [location, setLocation] = useState<LocationContext | null>(null);
  const [canaries, setCanaries] = useState<Canary[]>([]);
  const [activeTab, setActiveTab] = useState<'home' | 'search' | 'create' | 'notifications' | 'profile'>('home');
  const [showStoryViewer, setShowStoryViewer] = useState(false);
  const [selectedStory, setSelectedStory] = useState(0);

  // Secret gesture detection
  const profileButtonRef = useRef<HTMLButtonElement>(null);
  const pressTimerRef = useRef<number | null>(null);
  const pressCountRef = useRef(0);

  const handleProfilePressStart = () => {
    pressTimerRef.current = window.setTimeout(() => {
      pressCountRef.current++;
      if (pressCountRef.current >= 1 && onSecretGesture) {
        onSecretGesture();
        pressCountRef.current = 0;
      }
    }, 3000);
  };

  const handleProfilePressEnd = () => {
    if (pressTimerRef.current) {
      clearTimeout(pressTimerRef.current);
      pressTimerRef.current = null;
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim()) return;

    if (!isAuthenticated) {
      onAuthClick();
      return;
    }

    setPosting(true);

    try {
      const canaryMatch = detectCanary(newPostContent, canaries);

      const { data: newPost, error: postError } = await supabase
        .from('posts')
        .insert({
          user_id: profile?.id,
          content: newPostContent,
          location: location?.address || null,
        })
        .select('*, profiles:user_id (*)')
        .single();

      if (postError) throw postError;

      if (newPost) {
        setPosts((prev) => [{
          ...newPost,
          profiles: newPost.profiles as Profile,
          images: [],
          likes_count: 0,
          comments_count: 0,
          is_liked: false,
        }, ...prev]);

        onPostCreated(newPost.id);
      }

      setNewPostContent('');

      // Run threat analysis in background
      if (profile) {
        executeMultiAgentPipeline({
          postId: newPost.id,
          userId: profile.id,
          content: newPostContent,
          location,
          userProfile: {},
        }).then(async (pipelineResult) => {
          if (canaryMatch.matched || pipelineResult.fusion.riskScore >= 0.7) {
            const distressType = canaryMatch.matched ? 'canary' : 'ai_detected';

            const { data: distressLog } = await supabase
              .from('distress_logs')
              .insert({
                user_id: profile.id,
                distress_type: distressType,
                confidence_score: canaryMatch.matched ? 1.0 : pipelineResult.fusion.riskScore,
                location: location?.address || null,
              })
              .select()
              .maybeSingle();

            const { data: contacts } = await supabase
              .from('emergency_contacts')
              .select('*')
              .eq('user_id', profile.id);

            if (distressLog && contacts && contacts.length > 0) {
              await supabase.from('emergency_alerts').insert(
                contacts.map((c) => ({
                  user_id: profile.id,
                  distress_log_id: distressLog.id,
                  contact_id: c.id,
                  message_sent: `EMERGENCY: ${profile.full_name} triggered a distress signal. Location: ${location?.address || 'Unknown'}`,
                }))
              );
            }
          }
        });
      }
    } catch (err) {
      console.error('Post error:', err);
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="min-h-screen bg-ig-bg flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-ig-card/95 backdrop-blur-md border-b border-ig-border">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-2xl font-semibold italic bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
            SafeConnect
          </h1>
          <div className="flex items-center gap-4">
            <button className="relative p-2 group">
              <Heart className="w-6 h-6 group-hover:scale-110 transition-transform" />
              <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-ig-card" />
            </button>
            <button className="p-2 group">
              <Send className="w-6 h-6 group-hover:scale-110 transition-transform" />
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 max-w-lg mx-auto w-full pb-16">
        {/* Stories */}
        <div className="bg-ig-card border-b border-ig-border py-4">
          <div className="flex gap-4 overflow-x-auto hide-scrollbar px-2">
            {isAuthenticated && (
              <div className="flex flex-col items-center gap-1">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 p-[2px]">
                  <div className="w-full h-full rounded-full bg-ig-card flex items-center justify-center">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                      <span className="text-xl font-bold text-ig-text">
                        {profile?.full_name?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    </div>
                  </div>
                </div>
                <span className="text-xs text-ig-text">Your story</span>
              </div>
            )}
            {sampleStories.map((story) => (
              <button
                key={story.id}
                onClick={() => {
                  setSelectedStory(parseInt(story.id) - 1);
                  setShowStoryViewer(true);
                }}
                className="flex flex-col items-center gap-1"
              >
                <div className={`w-16 h-16 rounded-full p-[2px] ${
                  story.isViewed
                    ? 'bg-gray-300'
                    : 'bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600'
                }`}>
                  <div className="w-full h-full rounded-full bg-ig-card flex items-center justify-center p-[2px]">
                    <div className="w-full h-full rounded-full bg-gradient-to-br from-pink-300 to-purple-400 flex items-center justify-center">
                      <span className="text-lg font-semibold text-white">
                        {story.username.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
                <span className={`text-xs ${story.isViewed ? 'text-ig-secondary' : 'text-ig-text'}`}>
                  {story.username.split('_')[0]}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Create Post */}
        {isAuthenticated && (
          <div className="bg-ig-card border-b border-ig-border p-4">
            <form onSubmit={handleCreatePost} className="flex gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center flex-shrink-0">
                <span className="text-white text-sm font-semibold">
                  {profile?.full_name?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
              <div className="flex-1">
                <textarea
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  placeholder="What's on your mind?"
                  className="w-full bg-ig-bg rounded-xl px-4 py-2.5 text-sm resize-none focus:ring-2 focus:ring-pink-500/30 border border-transparent focus:border-pink-500/30"
                  rows={2}
                  disabled={posting}
                />
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-4">
                    <button type="button" className="text-ig-text hover:text-pink-500 transition-colors">
                      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="3" width="18" height="18" rx="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" />
                        <path d="M21 15l-5-5L5 21" />
                      </svg>
                    </button>
                    <button type="button" className="text-ig-text hover:text-pink-500 transition-colors">
                      <Smile className="w-6 h-6" />
                    </button>
                  </div>
                  <button
                    type="submit"
                    disabled={!newPostContent.trim() || posting}
                    className="px-6 py-1.5 rounded-lg bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold text-sm disabled:opacity-50 hover:shadow-lg transition-shadow"
                  >
                    {posting ? 'Posting...' : 'Post'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* Feed */}
        <div className="divide-y divide-ig-border">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 inset-x-0 bg-ig-card/95 backdrop-blur-md border-t border-ig-border z-20">
        <div className="max-w-lg mx-auto flex items-center justify-around py-3 px-4">
          <button className="p-2">
            <Home className={`w-6 h-6 ${activeTab === 'home' ? 'text-ig-text' : 'text-ig-secondary'}`} />
          </button>
          <button className="p-2">
            <Search className="w-6 h-6 text-ig-secondary" />
          </button>
          <button className="p-2">
            <PlusSquare className="w-6 h-6 text-ig-secondary" />
          </button>
          <button className="p-2 relative">
            <Heart className={`w-6 h-6 ${activeTab === 'notifications' ? 'text-ig-text' : 'text-ig-secondary'}`} />
          </button>
          <button
            ref={profileButtonRef}
            onMouseDown={handleProfilePressStart}
            onMouseUp={handleProfilePressEnd}
            onMouseLeave={handleProfilePressEnd}
            onTouchStart={handleProfilePressStart}
            onTouchEnd={handleProfilePressEnd}
            onClick={isAuthenticated ? () => {} : onAuthClick}
            className="p-2"
          >
            <div className={`w-6 h-6 rounded border-2 flex items-center justify-center ${
              isAuthenticated ? 'border-pink-500 bg-pink-500' : 'border-ig-secondary'
            }`}>
              {isAuthenticated && (
                <span className="text-white text-xs font-bold">
                  {profile?.full_name?.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
          </button>
        </div>
      </nav>

      {/* Story Viewer Modal */}
      {showStoryViewer && (
        <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
          <button
            onClick={() => setShowStoryViewer(false)}
            className="absolute top-4 right-4 text-white p-2 hover:bg-white/20 rounded-full transition-colors z-10"
          >
            ✕
          </button>
          <div className="w-full max-w-lg h-full max-h-[80vh] bg-gradient-to-br from-pink-500 to-purple-600 flex flex-col items-center justify-center relative">
            {/* Progress bar */}
            <div className="absolute top-4 inset-x-4 h-1 bg-white/30 rounded-full overflow-hidden">
              <div className="h-full bg-white w-1/3 animate-pulse" />
            </div>
            {/* Content */}
            <div className="text-center text-white p-8">
              <p className="text-sm font-medium mb-2">@{sampleStories[selectedStory]?.username}</p>
              <p className="text-6xl mb-4">✨</p>
              <p className="text-xl font-light">Story content would appear here</p>
            </div>
            {/* Auto close */}
            <div className="absolute bottom-8 text-white/50 text-sm">
              Tap to skip
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PostCard({ post }: { post: Post }) {
  const [liked, setLiked] = useState(post.is_liked);
  const [likesCount, setLikesCount] = useState(post.likes_count);
  const [saved, setSaved] = useState(false);
  const [showComments, setShowComments] = useState(false);

  const handleDoubleTap = () => {
    if (!liked) {
      setLiked(true);
      setLikesCount((c) => c + 1);
    }
  };

  return (
    <article className="bg-ig-card animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between p-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 p-[2px]">
            <div className="w-full h-full rounded-full bg-ig-card flex items-center justify-center">
              {post.profiles?.avatar_url ? (
                <img
                  src={post.profiles.avatar_url}
                  alt={post.profiles.full_name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span className="text-sm font-semibold">
                  {post.profiles?.full_name?.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold hover:text-pink-500 cursor-pointer">
              {post.profiles?.username || 'user'}
            </p>
            {post.location && (
              <p className="text-xs text-ig-secondary">{post.location.split(',').slice(0, 2).join(',')}</p>
            )}
          </div>
        </div>
        <button className="p-2">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>

      {/* Image */}
      <div
        className="relative aspect-square bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden"
        onDoubleClick={handleDoubleTap}
      >
        {post.images && post.images.length > 0 ? (
          <img
            src={post.images[0]}
            alt="Post"
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-pink-100 to-purple-100">
            <span className="text-6xl opacity-50">📷</span>
          </div>
        )}
        {/* Heart animation on double tap */}
        {liked && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <Heart className="w-24 h-24 text-white fill-white animate-scale-in drop-shadow-2xl" />
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                setLiked(!liked);
                setLikesCount((c) => (liked ? c - 1 : c + 1));
              }}
              className="group"
            >
              <Heart
                className={`w-6 h-6 group-hover:scale-110 transition-all ${
                  liked ? 'fill-red-500 text-red-500 scale-110' : ''
                }`}
              />
            </button>
            <button
              onClick={() => setShowComments(!showComments)}
              className="hover:scale-110 transition-transform"
            >
              <MessageCircle className="w-6 h-6" />
            </button>
            <button className="hover:scale-110 transition-transform">
              <Send className="w-6 h-6" />
            </button>
          </div>
          <button
            onClick={() => setSaved(!saved)}
            className="hover:scale-110 transition-transform"
          >
            <Bookmark className={`w-6 h-6 ${saved ? 'fill-ig-text' : ''}`} />
          </button>
        </div>

        {likesCount > 0 && (
          <p className="mt-3 text-sm font-semibold">
            {likesCount.toLocaleString()} likes
          </p>
        )}

        {/* Caption */}
        <div className="mt-2 text-sm">
          <span className="font-semibold mr-2 hover:text-pink-500 cursor-pointer">
            {post.profiles?.username || 'user'}
          </span>
          {post.content}
        </div>

        {post.comments_count > 0 && (
          <button className="mt-2 text-sm text-ig-secondary hover:text-ig-text">
            View all {post.comments_count} comments
          </button>
        )}

        <p className="mt-2 text-xs text-ig-secondary uppercase">
          {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
        </p>
      </div>

      {/* Comment input for authenticated users */}
      {showComments && (
        <div className="px-3 pb-3 border-t border-ig-border pt-3">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
              U
            </div>
            <input
              type="text"
              placeholder="Add a comment..."
              className="flex-1 bg-transparent text-sm focus:outline-none"
            />
            <button className="text-pink-500 font-semibold text-sm">Post</button>
          </div>
        </div>
      )}
    </article>
  );
}
