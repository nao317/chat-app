'use client';

import { useState } from 'react';
import { toggleFollow } from '@/lib/supabase/actions';
import { useRouter } from 'next/navigation';
import styles from './FollowButton.module.css';

type Props = {
  targetUserId: string;
  initialIsFollowing: boolean;
  initialFollowerCount: number;
};

export default function FollowButton({ 
  targetUserId, 
  initialIsFollowing,
  initialFollowerCount 
}: Props) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [followerCount, setFollowerCount] = useState(initialFollowerCount);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleFollowToggle = async () => {
    setIsLoading(true);
    const result = await toggleFollow(targetUserId);
    
    if (result.success) {
      setIsFollowing(result.isFollowing!);
      setFollowerCount(prev => result.isFollowing ? prev + 1 : prev - 1);
    } else {
      alert(result.error || 'フォロー操作に失敗しました');
    }
    setIsLoading(false);
  };

  return (
    <div className={styles.container}>
      <div className={styles.stats}>
        <span className={styles.count}>{followerCount}</span>
        <span className={styles.label}>フォロワー</span>
      </div>
      <button
        onClick={handleFollowToggle}
        disabled={isLoading}
        className={`${styles.followButton} ${isFollowing ? styles.following : ''}`}
      >
        {isLoading ? '処理中...' : (isFollowing ? 'フォロー中' : 'フォローする')}
      </button>
    </div>
  );
}
