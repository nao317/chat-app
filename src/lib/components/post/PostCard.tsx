'use client';

import { useState } from 'react';
import styles from "./PostCard.module.css";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from 'next/navigation';

import { Heart, MessageCircle, Repeat2, Bookmark, Quote } from "lucide-react";
import { toggleLike, toggleBookmark, createRepost } from '@/lib/supabase/actions';
import ReplyModal from './ReplyModal';
import QuoteModal from './QuoteModal';

type Props = {
  postId: number;
  comment: string;
  nickname?: string;
  avatarUrl?: string | null;
  createdAt: string;
  userId?: string;
  likeCount?: number;
  repostCount?: number;
  replyCount?: number;
  bookmarkCount?: number;
  isLiked?: boolean;
  isBookmarked?: boolean;
  isReposted?: boolean;
  replyToNickname?: string;
  replyToUserId?: string;
  quotedPost?: {
    comment: string;
    nickname: string;
    userId: string;
  } | null;
};

export default function PostCard({ 
  postId,
  comment, 
  nickname, 
  avatarUrl, 
  createdAt, 
  userId,
  likeCount = 0,
  repostCount = 0,
  replyCount = 0,
  bookmarkCount = 0,
  isLiked: initialIsLiked = false,
  isBookmarked: initialIsBookmarked = false,
  isReposted: initialIsReposted = false,
  replyToNickname,
  replyToUserId,
  quotedPost,
}: Props) {
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [isBookmarked, setIsBookmarked] = useState(initialIsBookmarked);
  const [isReposted, setIsReposted] = useState(initialIsReposted);
  const [likes, setLikes] = useState(likeCount);
  const [reposts, setReposts] = useState(repostCount);
  const [bookmarks, setBookmarks] = useState(bookmarkCount);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [showRepostMenu, setShowRepostMenu] = useState(false);
  const router = useRouter();

  const handleLike = async () => {
    const result = await toggleLike(postId);
    if (result.success) {
      setIsLiked(result.isLiked!);
      setLikes(prev => result.isLiked ? prev + 1 : prev - 1);
    } else {
      alert(result.error || 'いいねに失敗しました');
    }
  };

  const handleBookmark = async () => {
    const result = await toggleBookmark(postId);
    if (result.success) {
      setIsBookmarked(result.isBookmarked!);
      setBookmarks(prev => result.isBookmarked ? prev + 1 : prev - 1);
    } else {
      alert(result.error || 'ブックマークに失敗しました');
    }
  };

  const handleRepost = async () => {
    const result = await createRepost(postId);
    if (result.success) {
      setIsReposted(result.isReposted!);
      setReposts(prev => result.isReposted ? prev + 1 : prev - 1);
      setShowRepostMenu(false);
      router.refresh();
    } else {
      alert(result.error || 'リポストに失敗しました');
    }
  };

  const handleQuote = () => {
    setShowRepostMenu(false);
    setShowQuoteModal(true);
  };

  return (
    <>
      <div className={styles.card}>
        {replyToNickname && replyToUserId && (
          <div className={styles.replyInfo}>
            <MessageCircle size={14} />
            <Link href={`/profile_show/${replyToUserId}`} className={styles.replyLink}>
              @{replyToNickname}への返信
            </Link>
          </div>
        )}
        <div className={styles.header}>
          <div className={styles.userInfo}>
            {userId ? (
              <Link href={`/profile_show/${userId}`} className={styles.avatarContainer}>
                {avatarUrl ? (
                  <Image
                    src={avatarUrl}
                    alt="avatar"
                    width={40}
                    height={40}
                    className={styles.avatar}
                    unoptimized
                  />
                ) : (
                  <div className={styles.avatarPlaceholder}></div>
                )}
              </Link>
            ) : (
              <div className={styles.avatarContainer}>
                {avatarUrl ? (
                  <Image
                    src={avatarUrl}
                    alt="avatar"
                    width={40}
                    height={40}
                    className={styles.avatar}
                    unoptimized
                  />
                ) : (
                  <div className={styles.avatarPlaceholder}></div>
                )}
              </div>
            )}
            <div className={styles.userDetails}>
              {userId ? (
                <Link href={`/profile_show/${userId}`} className={styles.nicknameLink}>
                  <div className={styles.nickname}>{nickname ?? "名無し"}</div>
                </Link>
              ) : (
                <div className={styles.nickname}>{nickname ?? "名無し"}</div>
              )}
              <div className={styles.timestamp}>{new Date(createdAt).toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })}</div>
            </div>
          </div>
        </div>

        <div className={styles.body}>
          <Link href={`/post/${postId}`} className={styles.postLink}>
            <p className={styles.comment}>{comment}</p>
            
            {quotedPost && (
              <div className={styles.quotedPost}>
                <div className={styles.quotedHeader}>
                  <Link href={`/profile_show/${quotedPost.userId}`} className={styles.quotedNickname}>
                    @{quotedPost.nickname}
                  </Link>
                </div>
                <p className={styles.quotedComment}>{quotedPost.comment}</p>
              </div>
            )}
          </Link>
        </div>

        <div className={styles.actions}>
          <button 
            className={`${styles.action} ${isLiked ? styles.liked : ''}`} 
            onClick={handleLike}
            aria-label="like"
          >
            <Heart size={20} fill={isLiked ? 'currentColor' : 'none'} />
            {likes > 0 && <span className={styles.count}>{likes}</span>}
          </button>

          <div className={styles.repostContainer}>
            <button 
              className={`${styles.action} ${isReposted ? styles.reposted : ''}`} 
              onClick={() => setShowRepostMenu(!showRepostMenu)}
              aria-label="repost"
            >
              <Repeat2 size={20} />
              {reposts > 0 && <span className={styles.count}>{reposts}</span>}
            </button>
            {showRepostMenu && (
              <div className={styles.repostMenu}>
                <button onClick={handleRepost} className={styles.menuItem}>
                  <Repeat2 size={18} />
                  <span>{isReposted ? 'リポストを取り消す' : 'リポスト'}</span>
                </button>
                <button onClick={handleQuote} className={styles.menuItem}>
                  <Quote size={18} />
                  <span>引用</span>
                </button>
              </div>
            )}
          </div>

          <button 
            className={styles.action} 
            onClick={() => setShowReplyModal(true)}
            aria-label="reply"
          >
            <MessageCircle size={20} />
            {replyCount > 0 && <span className={styles.count}>{replyCount}</span>}
          </button>

          <button 
            className={`${styles.action} ${isBookmarked ? styles.bookmarked : ''}`} 
            onClick={handleBookmark}
            aria-label="bookmark"
          >
            <Bookmark size={20} fill={isBookmarked ? 'currentColor' : 'none'} />
            {bookmarks > 0 && <span className={styles.count}>{bookmarks}</span>}
          </button>
        </div>
      </div>

      {showReplyModal && (
        <ReplyModal
          postId={postId}
          originalComment={comment}
          originalAuthor={nickname ?? '名無し'}
          onClose={() => setShowReplyModal(false)}
        />
      )}

      {showQuoteModal && (
        <QuoteModal
          postId={postId}
          originalComment={comment}
          originalAuthor={nickname ?? '名無し'}
          onClose={() => setShowQuoteModal(false)}
        />
      )}
    </>
  );
}
