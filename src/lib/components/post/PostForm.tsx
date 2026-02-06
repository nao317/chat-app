'use client';

import React, { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import styles from './PostForm.module.css';

export default function PostForm() {
    const [comment, setComment] = useState("");
    const supabase = createClient();
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!comment.trim()) return;
        await supabase.from("post").insert({
            comment,
        });
        setComment("");
    };
    return (
        <form onSubmit={handleSubmit} className={styles.form}>
            <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="投稿しよう！　例）おなかすいた！"
                className={styles.textarea}
            />

            <div className={styles.buttonContainer}>
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