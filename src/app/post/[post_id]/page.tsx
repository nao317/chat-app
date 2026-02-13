import { createClient } from "@/lib/supabase/server";
import PostCard from "@/lib/components/post/PostCard";
import { getPostStats, getUserPostActions, getRepostedPostInfo, getMutualFollowIds } from "@/lib/supabase/actions";
import styles from "./postDetail.module.css";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

type Props = {
  params: Promise<{
    post_id: string;
  }>;
};

type PostWithAuthor = {
  id: number;
  comment: string;
  created_at: string;
  user_id: string;
  parent_post_id: number | null;
  quote_of: number | null;
  repost_of: number | null;
  is_private: boolean;
  author: Array<{
    nickname: string;
    avatar_url: string | null;
  }>;
};

async function getParentPostInfo(supabase: any, parentPostId: number | null) {
  if (!parentPostId) return null;
  
  const { data } = await supabase
    .from("post")
    .select(`
      id,
      comment,
      created_at,
      user_id,
      is_private,
      author:profile!post_user_id_fkey (
        nickname,
        avatar_url
      )
    `)
    .eq("id", parentPostId)
    .single();
    
  return data;
}

async function getQuotedPostInfo(supabase: any, quotedPostId: number | null) {
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
    
  return data;
}

export default async function PostDetail({ params }: Props) {
  const supabase = await createClient();
  const { post_id } = await params;

  // 現在のユーザーを取得
  const { data: { user } } = await supabase.auth.getUser().catch(() => ({ data: { user: null } }));

  // 相互フォローのユーザーIDを取得（後で使用）
  const mutualFollowIds = user ? await getMutualFollowIds(user.id, supabase) : [];

  // メイン投稿を取得
  const { data: post, error } = await supabase
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
    .eq("id", post_id)
    .single();

  if (error || !post) {
    return (
      <div className={styles.container}>
        <div className={styles.errorCard}>
          <h2>投稿が見つかりません</h2>
          <Link href="/" className={styles.backLink}>
            <ArrowLeft size={20} />
            ホームに戻る
          </Link>
        </div>
      </div>
    );
  }

  // 限定ポストの権限チェック
  if (post.is_private) {
    if (!user) {
      return (
        <div className={styles.container}>
          <div className={styles.errorCard}>
            <h2>この投稿は限定公開です</h2>
            <p>この投稿を表示するにはログインが必要です。</p>
            <Link href="/login" className={styles.backLink}>
              <ArrowLeft size={20} />
              ログインする
            </Link>
          </div>
        </div>
      );
    }

    // 相互フォローチェック
    const hasAccess = post.user_id === user.id || mutualFollowIds.includes(post.user_id);

    if (!hasAccess) {
      return (
        <div className={styles.container}>
          <div className={styles.errorCard}>
            <h2>この投稿を表示する権限がありません</h2>
            <p>この投稿は限定公開されています。</p>
            <Link href="/" className={styles.backLink}>
              <ArrowLeft size={20} />
              ホームに戻る
            </Link>
          </div>
        </div>
      );
    }
  }

  // 返信を取得（再帰的に取得）
  const { data: replies } = await supabase
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
    .eq("parent_post_id", post_id)
    .order("created_at", { ascending: true })
    .returns<PostWithAuthor[]>();

  // 親投稿と引用投稿情報を取得
  const parentPost = await getParentPostInfo(supabase, post.parent_post_id);
  const quotedPost = await getQuotedPostInfo(supabase, post.quote_of);
  const repostedPost = await getRepostedPostInfo(post.repost_of, supabase);
  
  // 親投稿が限定投稿の場合、権限チェック
  let validParentPost = parentPost;
  if (parentPost?.is_private) {
    if (!user) {
      validParentPost = null;
    } else {
      const hasAccessToParent = parentPost.user_id === user.id || mutualFollowIds.includes(parentPost.user_id);
      if (!hasAccessToParent) {
        validParentPost = null;
      }
    }
  }
  
  // 引用元が限定投稿の場合、権限チェック
  let validQuotedPost = quotedPost;
  if (quotedPost?.is_private) {
    if (!user) {
      validQuotedPost = null;
    } else {
      const hasAccessToQuote = quotedPost.user_id === user.id || mutualFollowIds.includes(quotedPost.user_id);
      if (!hasAccessToQuote) {
        validQuotedPost = null;
      }
    }
  }
  
  // リポスト元が限定投稿の場合、権限チェック
  let normalizedRepostedPost = null;
  if (repostedPost) {
    if (repostedPost.is_private) {
      if (user) {
        const hasAccessToRepost = repostedPost.user_id === user.id || mutualFollowIds.includes(repostedPost.user_id);
        if (hasAccessToRepost) {
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

  // 統計情報とユーザーアクションを取得
  const postStats = await getPostStats(post.id, supabase);
  const postActions = await getUserPostActions(post.id, user?.id || null, supabase);

  const repliesWithStats = await Promise.all(
    (replies || []).map(async (reply) => {
      const stats = await getPostStats(reply.id, supabase);
      const actions = await getUserPostActions(reply.id, user?.id || null, supabase);
      const replyQuotedPost = await getQuotedPostInfo(supabase, reply.quote_of);
      const replyRepostedPost = await getRepostedPostInfo(reply.repost_of, supabase);
      
      // 引用元が限定投稿の場合、権限チェック
      let validQuotedPost = replyQuotedPost;
      if (replyQuotedPost?.is_private) {
        if (!user) {
          validQuotedPost = null;
        } else {
          const hasAccessToQuote = replyQuotedPost.user_id === user.id || mutualFollowIds.includes(replyQuotedPost.user_id);
          if (!hasAccessToQuote) {
            validQuotedPost = null;
          }
        }
      }
      
      // リポスト元が限定投稿の場合、権限チェック
      let normalizedReplyRepostedPost = null;
      if (replyRepostedPost) {
        if (replyRepostedPost.is_private) {
          if (user) {
            const hasAccessToRepost = replyRepostedPost.user_id === user.id || mutualFollowIds.includes(replyRepostedPost.user_id);
            if (hasAccessToRepost) {
              normalizedReplyRepostedPost = {
                ...replyRepostedPost,
                author: Array.isArray(replyRepostedPost.author) ? replyRepostedPost.author[0] : replyRepostedPost.author
              };
            }
          }
        } else {
          normalizedReplyRepostedPost = {
            ...replyRepostedPost,
            author: Array.isArray(replyRepostedPost.author) ? replyRepostedPost.author[0] : replyRepostedPost.author
          };
        }
      }
      
      return { ...reply, ...stats, ...actions, quoted_post: validQuotedPost, reposted_post: normalizedReplyRepostedPost };
    })
  );

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Link href="/" className={styles.backButton}>
          <ArrowLeft size={24} />
        </Link>
        <h1 className={styles.title}>投稿</h1>
      </div>

      {validParentPost && (
        <div className={styles.parentPostSection}>
          <div className={styles.threadLine}></div>
          <PostCard
            postId={validParentPost.id}
            comment={validParentPost.comment}
            nickname={validParentPost.author?.[0]?.nickname ?? "名無し"}
            avatarUrl={validParentPost.author?.[0]?.avatar_url}
            createdAt={validParentPost.created_at}
            userId={validParentPost.user_id}
            likeCount={0}
            repostCount={0}
            replyCount={0}
            bookmarkCount={0}
            isLiked={false}
            isBookmarked={false}
            isReposted={false}
          />
        </div>
      )}

      <div className={styles.mainPost}>
        <PostCard
          postId={post.id}
          comment={post.comment}
          nickname={post.author?.[0]?.nickname ?? "名無し"}
          avatarUrl={post.author?.[0]?.avatar_url}
          createdAt={post.created_at}
          userId={post.user_id}
          likeCount={postStats.likeCount}
          repostCount={postStats.repostCount}
          replyCount={postStats.replyCount}
          bookmarkCount={postStats.bookmarkCount}
          isLiked={postActions.isLiked}
          isBookmarked={postActions.isBookmarked}
          isReposted={postActions.isReposted}
          replyToNickname={validParentPost?.author?.[0]?.nickname}
          replyToUserId={validParentPost?.user_id}
          quotedPost={validQuotedPost ? {
            comment: validQuotedPost.comment,
            nickname: validQuotedPost.author?.nickname ?? "名無し",
            userId: validQuotedPost.user_id,
          } : undefined}
          repostedPost={normalizedRepostedPost ? {
            id: normalizedRepostedPost.id,
            comment: normalizedRepostedPost.comment,
            nickname: normalizedRepostedPost.author?.nickname ?? "名無し",
            avatarUrl: normalizedRepostedPost.author?.avatar_url || null,
            userId: normalizedRepostedPost.user_id,
            createdAt: normalizedRepostedPost.created_at,
          } : undefined}
        />
      </div>

      {repliesWithStats.length > 0 && (
        <div className={styles.repliesSection}>
          <h2 className={styles.repliesTitle}>返信 ({repliesWithStats.length})</h2>
          <div className={styles.repliesContainer}>
            {repliesWithStats.map((reply) => (
              <PostCard
                key={reply.id}
                postId={reply.id}
                comment={reply.comment}
                nickname={reply.author?.[0]?.nickname ?? "名無し"}
                avatarUrl={reply.author?.[0]?.avatar_url}
                createdAt={reply.created_at}
                userId={reply.user_id}
                likeCount={reply.likeCount}
                repostCount={reply.repostCount}
                replyCount={reply.replyCount}
                bookmarkCount={reply.bookmarkCount}
                isLiked={reply.isLiked}
                isBookmarked={reply.isBookmarked}
                isReposted={reply.isReposted}
                quotedPost={reply.quoted_post ? {
                  comment: reply.quoted_post.comment,
                  nickname: reply.quoted_post.author?.nickname ?? "名無し",
                  userId: reply.quoted_post.user_id,
                } : undefined}
                repostedPost={reply.reposted_post ? {
                  id: reply.reposted_post.id,
                  comment: reply.reposted_post.comment,
                  nickname: reply.reposted_post.author?.nickname ?? "名無し",
                  avatarUrl: reply.reposted_post.author?.avatar_url || null,
                  userId: reply.reposted_post.user_id,
                  createdAt: reply.reposted_post.created_at,
                } : undefined}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
