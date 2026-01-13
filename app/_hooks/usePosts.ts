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

      const { data, error: fetchError } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

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
      console.error('Error fetching posts:', err);
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
