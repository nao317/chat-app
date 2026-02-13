'use server';

import { createClient } from './server';

// いいね機能
export async function toggleLike(postId: number) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser().catch(() => ({ data: { user: null } }));
  
  if (!user) {
    return { success: false, error: 'ログインが必要です' };
  }

  // 既存のいいねを確認
  const { data: existingLike } = await supabase
    .from('like')
    .select('id')
    .eq('post_id', postId)
    .eq('user_id', user.id)
    .single();

  if (existingLike) {
    // いいねを削除
    const { error } = await supabase
      .from('like')
      .delete()
      .eq('post_id', postId)
      .eq('user_id', user.id);
    
    return { success: !error, isLiked: false, error: error?.message };
  } else {
    // いいねを追加
    const { error } = await supabase
      .from('like')
      .insert({ post_id: postId, user_id: user.id });
    
    return { success: !error, isLiked: true, error: error?.message };
  }
}

// ブックマーク機能
export async function toggleBookmark(postId: number) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser().catch(() => ({ data: { user: null } }));
  
  if (!user) {
    return { success: false, error: 'ログインが必要です' };
  }

  // 既存のブックマークを確認
  const { data: existingBookmark } = await supabase
    .from('bookmark')
    .select('id')
    .eq('post_id', postId)
    .eq('user_id', user.id)
    .single();

  if (existingBookmark) {
    // ブックマークを削除
    const { error } = await supabase
      .from('bookmark')
      .delete()
      .eq('post_id', postId)
      .eq('user_id', user.id);
    
    return { success: !error, isBookmarked: false, error: error?.message };
  } else {
    // ブックマークを追加
    const { error } = await supabase
      .from('bookmark')
      .insert({ post_id: postId, user_id: user.id });
    
    return { success: !error, isBookmarked: true, error: error?.message };
  }
}

// リポスト機能
export async function createRepost(postId: number) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser().catch(() => ({ data: { user: null } }));
  
  if (!user) {
    return { success: false, error: 'ログインが必要です' };
  }

  // 既存のリポストを確認
  const { data: existingRepost } = await supabase
    .from('post')
    .select('id')
    .eq('repost_of', postId)
    .eq('user_id', user.id)
    .single();

  if (existingRepost) {
    // リポストを削除
    const { error } = await supabase
      .from('post')
      .delete()
      .eq('id', existingRepost.id);
    
    return { success: !error, isReposted: false, error: error?.message };
  } else {
    // リポストを作成
    const { error } = await supabase
      .from('post')
      .insert({ 
        repost_of: postId, 
        user_id: user.id,
        comment: null
      });
    
    return { success: !error, isReposted: true, error: error?.message };
  }
}

// 引用リポスト機能
export async function createQuotePost(postId: number, comment: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser().catch(() => ({ data: { user: null } }));
  
  if (!user) {
    return { success: false, error: 'ログインが必要です' };
  }

  if (!comment.trim()) {
    return { success: false, error: 'コメントを入力してください' };
  }

  // 元の投稿のis_privateを取得
  const { data: originalPost } = await supabase
    .from('post')
    .select('is_private, user_id')
    .eq('id', postId)
    .single();

  // 限定ポストの場合、権限チェック
  if (originalPost?.is_private) {
    const mutualFollowIds = await getMutualFollowIds(user.id, supabase);
    const hasAccess = originalPost.user_id === user.id || mutualFollowIds.includes(originalPost.user_id);
    
    if (!hasAccess) {
      return { success: false, error: 'この投稿を引用する権限がありません' };
    }
  }

  const { error } = await supabase
    .from('post')
    .insert({ 
      quote_of: postId, 
      user_id: user.id,
      comment,
      is_private: originalPost?.is_private || false
    });
  
  return { success: !error, error: error?.message };
}

// 返信機能
export async function createReply(parentPostId: number, comment: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser().catch(() => ({ data: { user: null } }));
  
  if (!user) {
    return { success: false, error: 'ログインが必要です' };
  }

  if (!comment.trim()) {
    return { success: false, error: 'コメントを入力してください' };
  }

  // 元の投稿のis_privateを取得
  const { data: parentPost } = await supabase
    .from('post')
    .select('is_private, user_id')
    .eq('id', parentPostId)
    .single();

  // 限定ポストの場合、権限チェック
  if (parentPost?.is_private) {
    const mutualFollowIds = await getMutualFollowIds(user.id, supabase);
    const hasAccess = parentPost.user_id === user.id || mutualFollowIds.includes(parentPost.user_id);
    
    if (!hasAccess) {
      return { success: false, error: 'この投稿に返信する権限がありません' };
    }
  }

  const { error } = await supabase
    .from('post')
    .insert({ 
      parent_post_id: parentPostId, 
      user_id: user.id,
      comment,
      is_private: parentPost?.is_private || false
    });
  
  return { success: !error, error: error?.message };
}

// フォロー機能
export async function toggleFollow(targetUserId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser().catch(() => ({ data: { user: null } }));
  
  if (!user) {
    return { success: false, error: 'ログインが必要です' };
  }

  if (user.id === targetUserId) {
    return { success: false, error: '自分自身をフォローできません' };
  }

  // 既存のフォローを確認
  const { data: existingFollow } = await supabase
    .from('follow')
    .select('id')
    .eq('follower_id', user.id)
    .eq('following_id', targetUserId)
    .single();

  if (existingFollow) {
    // フォローを解除
    const { error } = await supabase
      .from('follow')
      .delete()
      .eq('follower_id', user.id)
      .eq('following_id', targetUserId);
    
    return { success: !error, isFollowing: false, error: error?.message };
  } else {
    // フォローを追加
    const { error } = await supabase
      .from('follow')
      .insert({ 
        follower_id: user.id, 
        following_id: targetUserId 
      });
    
    return { success: !error, isFollowing: true, error: error?.message };
  }
}

// 投稿の統計情報を取得
export async function getPostStats(postId: number, supabaseClient?: any) {
  const supabase = supabaseClient || await createClient();
  
  // いいね数
  const { count: likeCount } = await supabase
    .from('like')
    .select('*', { count: 'exact', head: true })
    .eq('post_id', postId);
  
  // リポスト数（repost_of）
  const { count: repostCount } = await supabase
    .from('post')
    .select('*', { count: 'exact', head: true })
    .eq('repost_of', postId);
  
  // 引用数（quote_of）
  const { count: quoteCount } = await supabase
    .from('post')
    .select('*', { count: 'exact', head: true })
    .eq('quote_of', postId);
  
  // 返信数（parent_post_id）
  const { count: replyCount } = await supabase
    .from('post')
    .select('*', { count: 'exact', head: true })
    .eq('parent_post_id', postId);
  
  // ブックマーク数
  const { count: bookmarkCount } = await supabase
    .from('bookmark')
    .select('*', { count: 'exact', head: true })
    .eq('post_id', postId);

  return {
    likeCount: likeCount || 0,
    repostCount: (repostCount || 0) + (quoteCount || 0),
    replyCount: replyCount || 0,
    bookmarkCount: bookmarkCount || 0,
  };
}

// ユーザーの投稿へのアクション状態を取得
export async function getUserPostActions(postId: number, userId: string | null, supabaseClient?: any) {
  if (!userId) {
    return {
      isLiked: false,
      isBookmarked: false,
      isReposted: false,
    };
  }

  const supabase = supabaseClient || await createClient();
  
  // いいね状態
  const { data: likeData } = await supabase
    .from('like')
    .select('id')
    .eq('post_id', postId)
    .eq('user_id', userId)
    .single();
  
  // ブックマーク状態
  const { data: bookmarkData } = await supabase
    .from('bookmark')
    .select('id')
    .eq('post_id', postId)
    .eq('user_id', userId)
    .single();
  
  // リポスト状態
  const { data: repostData } = await supabase
    .from('post')
    .select('id')
    .eq('repost_of', postId)
    .eq('user_id', userId)
    .single();

  return {
    isLiked: !!likeData,
    isBookmarked: !!bookmarkData,
    isReposted: !!repostData,
  };
}

// フォロー状態を取得
export async function getFollowStatus(targetUserId: string, currentUserId: string | null, supabaseClient?: any) {
  if (!currentUserId) {
    return { isFollowing: false };
  }

  const supabase = supabaseClient || await createClient();
  
  const { data } = await supabase
    .from('follow')
    .select('id')
    .eq('follower_id', currentUserId)
    .eq('following_id', targetUserId)
    .single();

  return { isFollowing: !!data };
}

// フォロワー数・フォロー中数を取得
export async function getFollowCounts(userId: string, supabaseClient?: any) {
  const supabase = supabaseClient || await createClient();
  
  // フォロワー数
  const { count: followerCount } = await supabase
    .from('follow')
    .select('*', { count: 'exact', head: true })
    .eq('following_id', userId);
  
  // フォロー中数
  const { count: followingCount } = await supabase
    .from('follow')
    .select('*', { count: 'exact', head: true })
    .eq('follower_id', userId);

  return {
    followerCount: followerCount || 0,
    followingCount: followingCount || 0,
  };
}

// 相互フォローのユーザーIDリストを取得
export async function getMutualFollowIds(userId: string, supabaseClient?: any) {
  const supabase = supabaseClient || await createClient();
  
  // 自分がフォローしているユーザー
  const { data: following } = await supabase
    .from('follow')
    .select('following_id')
    .eq('follower_id', userId);
  
  // 自分をフォローしているユーザー
  const { data: followers } = await supabase
    .from('follow')
    .select('follower_id')
    .eq('following_id', userId);
  
  if (!following || !followers) return [];
  
  const followingIds = new Set(following.map((f: any) => f.following_id));
  const followerIds = followers.map((f: any) => f.follower_id);
  
  // 相互フォローのユーザーIDを抽出
  const mutualIds = followerIds.filter((id: any) => followingIds.has(id));
  
  return mutualIds;
}

// リポスト情報を取得
export async function getRepostedPostInfo(repostOfId: number | null, supabaseClient?: any) {
  if (!repostOfId) return null;
  
  const supabase = supabaseClient || await createClient();
  
  const { data } = await supabase
    .from("post")
    .select(`
      id,
      comment,
      user_id,
      created_at,
      is_private,
      author:profile!post_user_id_fkey (
        nickname,
        avatar_url
      )
    `)
    .eq("id", repostOfId)
    .single();
    
  return data;
}

// ユーザー検索
export async function searchUsers(query: string) {
  const supabase = await createClient();
  
  if (!query.trim()) {
    return { success: true, users: [] };
  }
  
  const { data: users, error } = await supabase
    .from('profile')
    .select('id, nickname, avatar_url, intro')
    .ilike('nickname', `%${query}%`)
    .limit(20);
  
  if (error) {
    return { success: false, error: error.message, users: [] };
  }
  
  // idをuser_idに、introをbioにマッピング
  const mappedUsers = (users || []).map(user => ({
    user_id: user.id,
    nickname: user.nickname,
    avatar_url: user.avatar_url,
    bio: user.intro
  }));
  
  return { success: true, users: mappedUsers };
}

// タイムライン投稿取得（ページネーション対応）
export async function getTimelinePosts(offset: number = 0, limit: number = 30) {
  const supabase = await createClient();
  
  // 現在のユーザーを取得（エラーは無視）
  const { data: { user } } = await supabase.auth.getUser().catch(() => ({ data: { user: null } }));

  // 相互フォローのユーザーIDを取得
  const mutualFollowIds = user ? await getMutualFollowIds(user.id, supabase) : [];

  const { data: posts, error } = await supabase
    .from("post")
    .select(`
      id,
      comment,
      created_at,
      user_id,
      parent_post_id,
      quote_of,
      repost_of,
      is_private,
      author:profile!post_user_id_fkey (
        nickname,
        avatar_url
      )
    `)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error(error);
    return { success: false, posts: [], hasMore: false };
  }

  // 親投稿情報取得
  async function getParentPostInfo(parentPostId: number | null) {
    if (!parentPostId) return null;
    
    const { data } = await supabase
      .from("post")
      .select(`
        user_id,
        is_private,
        author:profile!post_user_id_fkey (
          nickname
        )
      `)
      .eq("id", parentPostId)
      .single();
      
    // 親投稿が限定投稿の場合、権限チェック
    if (data?.is_private) {
      if (!user) return null;
      const isMutual = mutualFollowIds.includes(data.user_id) || data.user_id === user.id;
      if (!isMutual) return null;
    }
      
    return data;
  }

  // 引用投稿情報取得
  async function getQuotedPostInfo(quotedPostId: number | null) {
    if (!quotedPostId) return null;
    
    const { data } = await supabase
      .from("post")
      .select(`
        comment,
        user_id,
        is_private,
        author:profile!post_user_id_fkey (
          nickname
        )
      `)
      .eq("id", quotedPostId)
      .single();
      
    // 引用元が限定投稿の場合、権限チェック
    if (data?.is_private) {
      if (!user) return null;
      const isMutual = mutualFollowIds.includes(data.user_id) || data.user_id === user.id;
      if (!isMutual) return null;
    }
      
    return data;
  }

  // 各投稿の統計情報とユーザーアクションを取得
  const postsWithStats = await Promise.all(
    (posts || []).map(async (post: any) => {
      // 限定ポストで相互フォローでない場合はスキップ
      if (post.is_private && user) {
        const isMutual = mutualFollowIds.includes(post.user_id) || post.user_id === user.id;
        if (!isMutual) {
          return null;
        }
      } else if (post.is_private && !user) {
        // ログインしていない場合は限定ポストを表示しない
        return null;
      }

      const stats = await getPostStats(post.id, supabase);
      const userActions = await getUserPostActions(post.id, user?.id || null, supabase);
      const parentPost = await getParentPostInfo(post.parent_post_id);
      const quotedPost = await getQuotedPostInfo(post.quote_of);
      const repostedPost = await getRepostedPostInfo(post.repost_of, supabase);
      
      // リポスト元が限定投稿の場合、権限チェック
      let normalizedRepostedPost = null;
      if (repostedPost) {
        if (repostedPost.is_private) {
          if (user) {
            const isMutual = mutualFollowIds.includes(repostedPost.user_id) || repostedPost.user_id === user.id;
            if (isMutual) {
              normalizedRepostedPost = {
                ...repostedPost,
                author: Array.isArray(repostedPost.author) ? repostedPost.author[0] : repostedPost.author
              };
            }
          }
          // ログインしていない場合はnull
        } else {
          normalizedRepostedPost = {
            ...repostedPost,
            author: Array.isArray(repostedPost.author) ? repostedPost.author[0] : repostedPost.author
          };
        }
      }
      
      return {
        ...post,
        ...stats,
        ...userActions,
        parent_post: parentPost,
        quoted_post: quotedPost,
        reposted_post: normalizedRepostedPost,
      };
    })
  );

  // nullを除外
  const filteredPosts = postsWithStats.filter(post => post !== null);

  // 次のページがあるかチェック（取得した件数がlimitと同じなら次がある可能性）
  const hasMore = posts.length === limit;

  return { success: true, posts: filteredPosts, hasMore };
}
