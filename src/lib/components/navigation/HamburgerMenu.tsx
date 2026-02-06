'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import styles from './HamburgerMenu.module.css';

type Props = {
  nickname: string | null;
  avatarUrl: string | null;
  isLoggedIn: boolean;
};

export default function HamburgerMenu({ nickname, avatarUrl, isLoggedIn }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  const handleNavigation = (path: string) => {
    if (!isLoggedIn && (path === '/profile_show' || path === '/profiles' || path === '/')) {
      closeMenu();
      router.push('/login');
      return;
    }
    closeMenu();
    router.push(path);
  };

  return (
    <>
      {/* ハンバーガーボタン */}
      <button 
        className={styles.hamburgerButton} 
        onClick={toggleMenu}
        aria-label="メニューを開く"
      >
        <div className={`${styles.bar} ${isOpen ? styles.barOpen1 : ''}`}></div>
        <div className={`${styles.bar} ${isOpen ? styles.barOpen2 : ''}`}></div>
        <div className={`${styles.bar} ${isOpen ? styles.barOpen3 : ''}`}></div>
      </button>

      {/* オーバーレイ */}
      {isOpen && (
        <div 
          className={styles.overlay} 
          onClick={closeMenu}
        ></div>
      )}

      {/* サイドメニュー */}
      <div className={`${styles.sideMenu} ${isOpen ? styles.sideMenuOpen : ''}`}>
        <div className={styles.menuContent}>
          {/* ユーザー情報 */}
          <div className={styles.userInfo}>
            {isLoggedIn ? (
              <>
                <div className={styles.avatarContainer}>
                  {avatarUrl ? (
                    <Image
                      src={avatarUrl}
                      alt="avatar"
                      width={60}
                      height={60}
                      className={styles.avatar}
                      unoptimized
                    />
                  ) : (
                    <div className={styles.avatarPlaceholder}></div>
                  )}
                </div>
                <p className={styles.nickname}>{nickname || "名無し"}</p>
              </>
            ) : (
              <>
                <div className={styles.avatarContainer}>
                  <div className={styles.avatarPlaceholder}></div>
                </div>
                <p className={styles.nickname}>ゲスト</p>
              </>
            )}
          </div>

          {/* メニューリンク */}
          <nav className={styles.nav}>
            {isLoggedIn ? (
              <>
                <button 
                  className={styles.menuItem}
                  onClick={() => handleNavigation('/profile_show')}
                >
                  <span className={styles.menuIcon}>👤</span>
                  プロフィールを見る
                </button>
                <button 
                  className={styles.menuItem}
                  onClick={() => handleNavigation('/profiles')}
                >
                  <span className={styles.menuIcon}>✏️</span>
                  プロフィールを編集
                </button>
                <button 
                  className={styles.menuItem}
                  onClick={() => handleNavigation('/')}
                >
                  <span className={styles.menuIcon}>🏠</span>
                  タイムライン
                </button>
              </>
            ) : (
              <>
                <button 
                  className={styles.menuItem}
                  onClick={() => handleNavigation('/login')}
                >
                  <span className={styles.menuIcon}>🔑</span>
                  ログイン
                </button>
                <button 
                  className={styles.menuItem}
                  onClick={() => handleNavigation('/signup')}
                >
                  <span className={styles.menuIcon}>📝</span>
                  新規登録
                </button>
              </>
            )}
          </nav>
        </div>
      </div>
    </>
  );
}
