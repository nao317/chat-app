'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './HamburgerMenu.module.css';

type Props = {
  nickname: string;
  avatarUrl: string | null;
};

export default function HamburgerMenu({ nickname, avatarUrl }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
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
            <div className={styles.avatarContainer}>
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt="avatar"
                  width={60}
                  height={60}
                  className={styles.avatar}
                />
              ) : (
                <div className={styles.avatarPlaceholder}></div>
              )}
            </div>
            <p className={styles.nickname}>{nickname}</p>
          </div>

          {/* メニューリンク */}
          <nav className={styles.nav}>
            <Link 
              href="/profile_show" 
              className={styles.menuItem}
              onClick={closeMenu}
            >
              <span className={styles.menuIcon}>👤</span>
              プロフィールを見る
            </Link>
            <Link 
              href="/profiles" 
              className={styles.menuItem}
              onClick={closeMenu}
            >
              <span className={styles.menuIcon}>✏️</span>
              プロフィールを編集
            </Link>
            <Link 
              href="/" 
              className={styles.menuItem}
              onClick={closeMenu}
            >
              <span className={styles.menuIcon}>🏠</span>
              タイムライン
            </Link>
          </nav>
        </div>
      </div>
    </>
  );
}
