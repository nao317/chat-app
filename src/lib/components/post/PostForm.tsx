'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import styles from './PostForm.module.css';
import { Globe, Lock } from 'lucide-react';

export default function PostForm() {
    const [comment, setComment] = useState("");
    const [isPrivate, setIsPrivate] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);
    const supabase = createClient();
    const router = useRouter();

    useEffect(() => {
        // 現在のユーザーIDを取得
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser().catch(() => ({ data: { user: null } }));
            setUserId(user?.id || null);
        };
        getUser();
    }, [supabase]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!comment.trim()) return;
        
        if (!userId) {
            alert("ログインしてください");
            router.push("/login");
            return;
        }

        const { error } = await supabase.from("post").insert({
            comment,
            user_id: userId,
            is_private: isPrivate,
        });

        if (error) {
            console.error("投稿エラー:", error);
            alert("投稿に失敗しました");
            return;
        }

        setComment("");
        router.refresh(); // タイムラインを更新
    };
    return (
        <form onSubmit={handleSubmit} className={styles.form}>
            <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="投稿しよう！　例）おなかすいた！"
                className={styles.textarea}
            />

            <div className={styles.controls}>
                <div className={styles.privacyToggle}>
                    <button
                        type="button"
                        className={`${styles.privacyButton} ${!isPrivate ? styles.active : ''}`}
                        onClick={() => setIsPrivate(false)}
                    >
                        <Globe size={18} />
                        <span>公開</span>
                    </button>
                    <button
                        type="button"
                        className={`${styles.privacyButton} ${isPrivate ? styles.active : ''}`}
                        onClick={() => setIsPrivate(true)}
                    >
                        <Lock size={18} />
                        <span>限定</span>
                    </button>
                </div>

                <button
                    type="submit"
                    className={styles.submitButton}
                    disabled={!comment.trim()}
                >
                    投稿する
                </button>
            </div>
        </form>
    );
}