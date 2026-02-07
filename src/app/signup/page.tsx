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
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
        });
        if (error) { // エラーハンドリング
            alert(error.message);
            return;
        }

        // ユーザー作成成功後、profileレコードを作成
        if (data.user) {
            console.log("プロフィールレコードを作成:", data.user.id);
            
            const { error: profileError, data: profileData } = await supabase
                .from("profile")
                .insert({
                    id: data.user.id,
                    nickname: "名無し",
                    intro: "",
                    avatar_url: ""
                })
                .select();
            
            console.log("プロフィール作成結果:", { profileError, profileData });
            
            if (profileError) {
                console.error("Profile creation error:", profileError);
                alert(`アカウントは作成されましたが、プロフィールの作成に失敗しました。\nログイン後に再度お試しください。\n\nエラー: ${profileError.message}`);
                // プロフィール作成に失敗してもログインページに進む
                router.push("/login");
                return;
            }
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
                        autoComplete="new-password"
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