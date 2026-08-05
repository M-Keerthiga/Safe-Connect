import type { Post, Profile } from '../lib/supabase';

// Sample users for the feed
export const sampleProfiles: Profile[] = [
  {
    id: 'sample-1',
    full_name: 'Emma Watson',
    username: 'emma_reads',
    avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop',
    phone: null,
    bio: 'Book lover | Coffee enthusiast | Always exploring',
    safe_word: null,
    emergency_pin: null,
    created_at: new Date().toISOString(),
  },
  {
    id: 'sample-2',
    full_name: 'Sophie Chen',
    username: 'sophie_captures',
    avatar_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop',
    phone: null,
    bio: 'Photographer | Dog mom | Adventure seeker',
    safe_word: null,
    emergency_pin: null,
    created_at: new Date().toISOString(),
  },
  {
    id: 'sample-3',
    full_name: 'Maya Patel',
    username: 'maya_creates',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop',
    phone: null,
    bio: 'UX Designer | City dweller | Weekend hiker',
    safe_word: null,
    emergency_pin: null,
    created_at: new Date().toISOString(),
  },
  {
    id: 'sample-4',
    full_name: 'Luna Martinez',
    username: 'luna_exploring',
    avatar_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop',
    phone: null,
    bio: 'Travel blogger | Food lover | Sunset chaser',
    safe_word: null,
    emergency_pin: null,
    created_at: new Date().toISOString(),
  },
  {
    id: 'sample-5',
    full_name: 'Aria Kim',
    username: 'aria_codes',
    avatar_url: 'https://images.unsplash.com/photo-1488426822026-3ee34a7d66df?w=150&h=150&fit=crop',
    phone: null,
    bio: 'Software engineer | Yoga | Cat person',
    safe_word: null,
    emergency_pin: null,
    created_at: new Date().toISOString(),
  },
];

// Sample post images from Pexels (stock photos)
const sampleImages = [
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df6?w=600&h=600&fit=crop', // mountains
  'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=600&h=600&fit=crop', // lake
  'https://images.unsplash.com/photo-1476514525534-97fa0958e350?w=600&h=600&fit=crop', // forest
  'https://images.unsplash.com/photo-1440342359743-62f0cf3221e2?w=600&h=600&fit=crop', // sunset beach
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=600&fit=crop', // city lights
  'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=600&h=600&fit=crop', // starry sky
  'https://images.unsplash.com/photo-1504893524553-b855bce32c67?w=600&h=600&fit=crop', // cafe
  'https://images.unsplash.com/photo-1517457373958-a7be2e4f8a6f?w=600&h=600&fit=crop', // workspace
];

// Sample posts with realistic content
export const samplePosts: Post[] = [
  {
    id: 'post-1',
    user_id: 'sample-1',
    content: 'Finally found the perfect reading spot in this little cafe. Nothing beats a good book and great coffee on a rainy day.',
    location: 'The Cozy Corner Cafe, Brooklyn',
    created_at: new Date(Date.now() - 1000 * 60 * 23).toISOString(), // 23 mins ago
    profiles: sampleProfiles[0],
    images: [sampleImages[6]],
    likes_count: 247,
    comments_count: 18,
    is_liked: false,
  },
  {
    id: 'post-2',
    user_id: 'sample-2',
    content: 'Golden hour never disappoints. Captured this beautiful moment during today\'s hike.',
    location: 'Mountain View Trail, Colorado',
    created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45 mins ago
    profiles: sampleProfiles[1],
    images: [sampleImages[0]],
    likes_count: 892,
    comments_count: 43,
    is_liked: true,
  },
  {
    id: 'post-3',
    user_id: 'sample-3',
    content: 'Weekend well spent! Sometimes you just need to escape the city and breathe some fresh mountain air.',
    location: 'Blue Ridge Mountains',
    created_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // 2 hours ago
    profiles: sampleProfiles[2],
    images: [sampleImages[2]],
    likes_count: 534,
    comments_count: 29,
    is_liked: false,
  },
  {
    id: 'post-4',
    user_id: 'sample-4',
    content: 'Sunset watching never gets old. Grateful for moments like these.',
    location: 'Santa Monica Beach, LA',
    created_at: new Date(Date.now() - 1000 * 60 * 180).toISOString(), // 3 hours ago
    profiles: sampleProfiles[3],
    images: [sampleImages[3]],
    likes_count: 1203,
    comments_count: 67,
    is_liked: true,
  },
  {
    id: 'post-5',
    user_id: 'sample-5',
    content: 'Late night coding session complete! Finally pushed that new feature. Time for some well-deserved rest.',
    location: 'San Francisco, CA',
    created_at: new Date(Date.now() - 1000 * 60 * 360).toISOString(), // 6 hours ago
    profiles: sampleProfiles[4],
    images: [sampleImages[7]],
    likes_count: 156,
    comments_count: 12,
    is_liked: false,
  },
  {
    id: 'post-6',
    user_id: 'sample-1',
    content: 'Life is better with mountains and good company. Weekend adventures are the best kind.',
    location: 'Aspen, Colorado',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    profiles: sampleProfiles[0],
    images: [sampleImages[1]],
    likes_count: 678,
    comments_count: 34,
    is_liked: false,
  },
  {
    id: 'post-7',
    user_id: 'sample-2',
    content: 'Under the stars. These are the moments that remind you how beautiful life can be.',
    location: 'Joshua Tree, California',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(), // 26 hours ago
    profiles: sampleProfiles[1],
    images: [sampleImages[5]],
    likes_count: 1456,
    comments_count: 89,
    is_liked: true,
  },
];

// Sample stories data
export const sampleStories = [
  { id: '1', username: 'emma_reads', hasStory: true, isViewed: false },
  { id: '2', username: 'sophie_captures', hasStory: true, isViewed: false },
  { id: '3', username: 'maya_creates', hasStory: true, isViewed: true },
  { id: '4', username: 'luna_exploring', hasStory: true, isViewed: false },
  { id: '5', username: 'aria_codes', hasStory: true, isViewed: true },
  { id: '6', username: 'julia_art', hasStory: true, isViewed: false },
  { id: '7', username: 'nina_travels', hasStory: true, isViewed: false },
];
