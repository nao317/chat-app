'use client';

import { useState } from 'react';
import { Globe, Lock } from 'lucide-react';
import styles from './TimelineTabs.module.css';

type Props = {
  activeTab: 'global' | 'private';
  onTabChange: (tab: 'global' | 'private') => void;
};

export default function TimelineTabs({ activeTab, onTabChange }: Props) {
  return (
    <div className={styles.tabs}>
      <button
        className={`${styles.tab} ${activeTab === 'global' ? styles.active : ''}`}
        onClick={() => onTabChange('global')}
      >
        <Globe size={20} />
        <span>グローバル</span>
      </button>
      <button
        className={`${styles.tab} ${activeTab === 'private' ? styles.active : ''}`}
        onClick={() => onTabChange('private')}
      >
        <Lock size={20} />
        <span>限定ポスト</span>
      </button>
    </div>
  );
}
