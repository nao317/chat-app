'use client';

import React, { useState } from 'react';
import { createReply } from '@/lib/supabase/actions';
import { useRouter } from 'next/navigation';
import styles from './ReplyModal.module.css';
import { X } from 'lucide-react';

type Props = {
  postId: number;
  originalComment: string;
  originalAuthor: string;
  onClose: () => void;
};

export default function ReplyModal({ postId, originalComment, originalAuthor, onClose }: Props) {
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim() || isSubmitting) return;

    setIsSubmitting(true);
    const result = await createReply(postId, comment);
    
    if (result.success) {
      setComment('');
      onClose();
      router.refresh();
    } else {
      alert(result.error || '返信に失敗しました');
    }
    setIsSubmitting(false);
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>返信する</h2>
          <button className={styles.closeButton} onClick={onClose} aria-label="閉じる">
            <X size={24} />
          </button>
        </div>
        
        <div className={styles.originalPost}>
          <div className={styles.author}>@{originalAuthor}</div>
          <div className={styles.originalComment}>{originalComment}</div>
        </div>

        <form onSubmit={handleSubmit}>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="返信を入力..."
            className={styles.textarea}
            autoFocus
          />
          <div className={styles.buttonContainer}>
            <button
              type="submit"
              className={styles.submitButton}
              disabled={!comment.trim() || isSubmitting}
            >
              {isSubmitting ? '送信中...' : '返信する'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
