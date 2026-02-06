'use client';

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import styles from "@/app/auth.module.css";

type Props = {
    profile: any;
    userId: string;
};

export default function ProfileForm({ profile, userId }: Props) {
    const supabase = createClient();
    const [nickname, setNickname] = useState(profile?.nickname ?? "");
    const [intro, setIntro] = useState(profile?.intro ?? "");
    const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url ?? "");
    const [isLoading, setIsLoading] = useState(false);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        
        try {
            const { error } = await supabase
                .from("profile")
                .update({
                    nickname,
                    intro,
                    avatar_url: avatarUrl,
                })
                .eq("id", userId);
            
            if (error) {
                alert("エラー: " + error.message);
            } else {
                alert("変更を正常に保存しました");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSave} className={styles.form}>
            <h2 className={styles.title}>プロフィール編集</h2>
            <div className={styles.inputGroup}>
                <input
                    type="text"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    placeholder="ニックネーム"
                    className={styles.input}
                    required
                />
            </div>
            <div className={styles.inputGroup}>
                <input
                    type="text"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    placeholder="アバターURL"
                    className={styles.input}
                />
            </div>
            <div className={styles.inputGroup}>
                <textarea
                    value={intro}
                    onChange={(e) => setIntro(e.target.value)}
                    placeholder="自己紹介"
                    className={styles.input}
                    rows={4}
                    style={{ resize: 'vertical', minHeight: '100px' }}
                />
            </div>
            <button 
                type="submit" 
                className={styles.submitButton}
                disabled={isLoading}
            >
                {isLoading ? "保存中..." : "保存"}
            </button>
        </form>
    );
}
