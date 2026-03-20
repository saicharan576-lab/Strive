import { supabase } from '../supabaseConfig';
import { getCachedUserProfile } from './userProfileService';

export interface CreatePostPayload {
  title: string;
  description: string;
  tags: string[];
}

export interface SupabasePost {
  id: string;
  username: string | null;
  avatar: string | null;
  thumbnail: string | null;
  title: string | null;
  description: string | null;
  likes: number;
  comments: number;
  tags: string[] | null;
  created_at: string;
  updated_at: string;
}

/**
 * Publishes a text post to Supabase posts table
 * @param payload - Post title, description, and tags
 * @returns The created post or null on failure
 */
export const createTextPost = async (
  payload: CreatePostPayload
): Promise<SupabasePost | null> => {
  try {
    // Get cached user profile for username and avatar
    const userProfile = await getCachedUserProfile();
    const username = userProfile?.Profile_name || userProfile?.User_name || 'Anonymous';
    const avatar = userProfile?.Profile_picture || null;

    console.log('📝 Publishing text post:', { title: payload.title, username });

    const { data, error } = await supabase
      .from('posts')
      .insert({
        username,
        avatar,
        thumbnail: null,
        title: payload.title,
        description: payload.description,
        tags: payload.tags,
        likes: 0,
        comments: 0,
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Error creating post:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      });
      throw error;
    }

    console.log('✅ Post published successfully:', data.id);
    return data;
  } catch (error) {
    console.error('Exception in createTextPost:', error);
    return null;
  }
};
