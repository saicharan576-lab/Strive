import { useCallback, useEffect, useState } from 'react';
import { Post } from '../_types/post';
import { supabase } from '../supabaseConfig';

export const usePosts = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPosts = useCallback(async (isRefreshing = false) => {
    try {
      if (isRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      console.log('🔄 Fetching posts from Supabase...');

      const { data, error: fetchError } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) {
        console.error('❌ Supabase error fetching posts:', {
          message: fetchError.message,
          details: fetchError.details,
          hint: fetchError.hint,
          code: fetchError.code,
        });
        
        // Provide helpful error messages based on error code
        if (fetchError.code === '42P01') {
          throw new Error('Posts table does not exist in Supabase. Please create the "posts" table in your Supabase database.');
        } else if (fetchError.code === '42501') {
          throw new Error('Permission denied. Please check your Row Level Security (RLS) policies in Supabase.');
        }
        
        throw fetchError;
      }

      console.log(`✅ Fetched ${data?.length || 0} posts successfully`);

      const postsData: Post[] = (data || []).map(post => ({
        id: post.id,
        username: post.username || 'Anonymous',
        avatar: post.avatar || 'A',
        thumbnail: post.thumbnail || '',
        title: post.title || 'Untitled',
        description: post.description,
        likes: post.likes || 0,
        comments: post.comments || 0,
        createdAt: post.created_at ? new Date(post.created_at) : new Date(),
        tags: post.tags,
      }));

      setPosts(postsData);
    } catch (err) {
      setError(err as Error);
      console.error('❌ Error fetching posts:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const refresh = useCallback(() => {
    fetchPosts(true);
  }, [fetchPosts]);

  return { posts, loading, error, refreshing, refresh };
};
