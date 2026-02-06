'use client';

import React, { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from '../auth.module.css';

export default function Signup() {
    const supabase = createClient();
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        const { error } = await supabase.auth.signUp({
            email,
            password,
        });
        if (error) { // エラーハンドリング
            alert(error.message);
            return;
        }
        router.refresh(); // サーバーコンポーネントにセッション変更を通知
        router.push("/"); // ホーム画面にリダイレクト
    };

    return (
        <div className={styles.container}>
            <form onSubmit={handleSignup} className={styles.form}>
                <h2 className={styles.title}>新規登録</h2>
                <div className={styles.inputGroup}>
                    <input
                        type="email"
                        placeholder="メールアドレス"
                        onChange={(e) => setEmail(e.target.value)}
                        className={styles.input}
                        required
                    />
                </div>
                <div className={styles.inputGroup}>
                    <input
                        type="password"
                        placeholder="パスワード"
                        onChange={(e) => setPassword(e.target.value)}
                        className={styles.input}
                        required
                    />
                </div>
                <button type="submit" className={styles.submitButton}>
                    登録
                </button>
                <div className={styles.link}>
                    すでにアカウントをお持ちの方は{" "}
                    <Link href="/login" className={styles.linkButton}>
                        ログイン
                    </Link>
                </div>
            </form>
        </div>
    );
}