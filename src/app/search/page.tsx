'use client';

import { useState } from 'react';
import { searchUsers } from '@/lib/supabase/actions';
import styles from './search.module.css';
import { Search } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

type User = {
  user_id: string;
  nickname: string;
  avatar_url: string | null;
  bio: string | null;
};

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsSearching(true);
    setHasSearched(true);
    const result = await searchUsers(query);
    if (result.success) {
      setResults(result.users as User[]);
    }
    setIsSearching(false);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Search size={28} className={styles.headerIcon} />
        <h1 className={styles.title}>ユーザー検索</h1>
      </div>

      <form onSubmit={handleSearch} className={styles.searchForm}>
        <div className={styles.searchInputContainer}>
          <Search size={20} className={styles.searchIcon} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ユーザー名で検索..."
            className={styles.searchInput}
          />
        </div>
        <button type="submit" className={styles.searchButton} disabled={isSearching}>
          {isSearching ? '検索中...' : '検索'}
        </button>
      </form>

      <div className={styles.resultsContainer}>
        {isSearching ? (
          <div className={styles.loadingState}>
            <p>検索中...</p>
          </div>
        ) : !hasSearched ? (
          <div className={styles.emptyState}>
            <Search size={48} className={styles.emptyIcon} />
            <p>ユーザー名を入力して検索してください</p>
          </div>
        ) : results.length === 0 ? (
          <div className={styles.emptyState}>
            <Search size={48} className={styles.emptyIcon} />
            <p>ユーザーが見つかりませんでした</p>
          </div>
        ) : (
          results.map((user) => (
            <Link
              key={user.user_id}
              href={`/profile_show/${user.user_id}`}
              className={styles.userCard}
            >
              <div className={styles.userAvatar}>
                {user.avatar_url ? (
                  <Image
                    src={user.avatar_url}
                    alt={user.nickname}
                    width={50}
                    height={50}
                    className={styles.avatar}
                    unoptimized
                  />
                ) : (
                  <div className={styles.avatarPlaceholder}></div>
                )}
              </div>
              <div className={styles.userInfo}>
                <div className={styles.username}>{user.nickname}</div>
                {user.bio && <div className={styles.bio}>{user.bio}</div>}
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
