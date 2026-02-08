'use client';

import { useState } from 'react';
import PostCard from "@/lib/components/post/PostCard";
import PostForm from "@/lib/components/post/PostForm";
import TimelineTabs from "@/lib/components/timeline/TimelineTabs";
import styles from "./page.module.css";

type Post = {
  id: number;
  comment: string;
  created_at: string;
  user_id: string;
  is_private: boolean;
  author?: {
    nickname: string;
    avatar_url: string | null;
  } | null;
  likeCount: number;
  repostCount: number;
  replyCount: number;
  bookmarkCount: number;
  isLiked: boolean;
  isBookmarked: boolean;
  isReposted: boolean;
  parent_post?: {
    user_id: string;
    author?: {
      nickname: string;
    } | null;
  } | null;
  quoted_post?: {
    comment: string;
    user_id: string;
    author?: {
      nickname: string;
    } | null;
  } | null;
  reposted_post?: {
    id: number;
    comment: string;
    user_id: string;
    created_at: string;
    author: {
      nickname: string;
      avatar_url: string | null;
    } | null;
  } | null;
};

type Props = {
  initialPosts: Post[];
};

export default function TimelineClient({ initialPosts }: Props) {
  const [activeTab, setActiveTab] = useState<'global' | 'private'>('global');

  const filteredPosts = initialPosts.filter(post => {
    if (activeTab === 'global') {
      return !post.is_private;
    } else {
      return post.is_private;
    }
  });

  return (
    <div className={styles.container}>
      <PostForm />
      <TimelineTabs activeTab={activeTab} onTabChange={setActiveTab} />
      <div className={styles.postsContainer}>
        {filteredPosts.length === 0 ? (
          <div className={styles.emptyState}>
            <p>
              {activeTab === 'global' 
                ? '投稿がまだありません' 
                : '限定ポストがありません'}
            </p>
          </div>
        ) : (
          filteredPosts.map((post) => (
            <PostCard
              key={post.id}
              postId={post.id}
              comment={post.comment}
              nickname={post.author?.nickname ?? "名無し"}
              avatarUrl={post.author?.avatar_url}
              createdAt={post.created_at}
              userId={post.user_id}
              likeCount={post.likeCount}
              repostCount={post.repostCount}
              replyCount={post.replyCount}
              bookmarkCount={post.bookmarkCount}
              isLiked={post.isLiked}
              isBookmarked={post.isBookmarked}
              isReposted={post.isReposted}
              replyToNickname={post.parent_post?.author?.nickname}
              replyToUserId={post.parent_post?.user_id}
              quotedPost={post.quoted_post ? {
                comment: post.quoted_post.comment,
                nickname: post.quoted_post.author?.nickname ?? "名無し",
                userId: post.quoted_post.user_id,
              } : undefined}
              repostedPost={post.reposted_post ? {
                id: post.reposted_post.id,
                comment: post.reposted_post.comment,
                nickname: post.reposted_post.author?.nickname ?? "名無し",
                avatarUrl: post.reposted_post.author?.avatar_url || null,
                userId: post.reposted_post.user_id,
                createdAt: post.reposted_post.created_at,
              } : undefined}
            />
          ))
        )}
      </div>
    </div>
  );
}
