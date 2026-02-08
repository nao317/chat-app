'use server';

import { createClient } from './server';

// いいね機能
export async function toggleLike(postId: number) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
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
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
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
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
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
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    return { success: false, error: 'ログインが必要です' };
  }

  if (!comment.trim()) {
    return { success: false, error: 'コメントを入力してください' };
  }

  const { error } = await supabase
    .from('post')
    .insert({ 
      quote_of: postId, 
      user_id: user.id,
      comment
    });
  
  return { success: !error, error: error?.message };
}

// 返信機能
export async function createReply(parentPostId: number, comment: string) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    return { success: false, error: 'ログインが必要です' };
  }

  if (!comment.trim()) {
    return { success: false, error: 'コメントを入力してください' };
  }

  const { error } = await supabase
    .from('post')
    .insert({ 
      parent_post_id: parentPostId, 
      user_id: user.id,
      comment
    });
  
  return { success: !error, error: error?.message };
}

// フォロー機能
export async function toggleFollow(targetUserId: string) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
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
export async function getPostStats(postId: number) {
  const supabase = await createClient();
  
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
export async function getUserPostActions(postId: number, userId: string | null) {
  if (!userId) {
    return {
      isLiked: false,
      isBookmarked: false,
      isReposted: false,
    };
  }

  const supabase = await createClient();
  
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
export async function getFollowStatus(targetUserId: string, currentUserId: string | null) {
  if (!currentUserId) {
    return { isFollowing: false };
  }

  const supabase = await createClient();
  
  const { data } = await supabase
    .from('follow')
    .select('id')
    .eq('follower_id', currentUserId)
    .eq('following_id', targetUserId)
    .single();

  return { isFollowing: !!data };
}

// フォロワー数・フォロー中数を取得
export async function getFollowCounts(userId: string) {
  const supabase = await createClient();
  
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
