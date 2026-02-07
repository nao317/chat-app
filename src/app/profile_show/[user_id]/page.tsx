import { createClient } from "@/lib/supabase/server";
import Image from "next/image";
import Link from "next/link";
import styles from "../profileShow.module.css";

type Props = {
    params: Promise<{
        user_id: string;
    }>;
};

export default async function ProfileShow({ params }: Props) {
    const supabase = await createClient();
    const { user_id } = await params;

    // 現在ログインしているユーザーを取得
    const {
        data: { user: currentUser },
    } = await supabase.auth.getUser();

    // プロフィールを取得（ログインしていなくても閲覧可能）
    const { data: profile, error } = await supabase
        .from("profile")
        .select("*")
        .eq("id", user_id)
        .single();

    if (error || !profile) {
        return (
            <div className={styles.container}>
                <div className={styles.profileCard}>
                    <h2 className={styles.title}>プロフィールが見つかりません</h2>
                    <p>指定されたユーザーのプロフィールは存在しません。</p>
                    <Link href="/" className={styles.editButton}>
                        ホームに戻る
                    </Link>
                </div>
            </div>
        );
    }

    // キャッシュバスティングのためタイムスタンプを追加
    const avatarUrl = profile?.avatar_url 
        ? `${profile.avatar_url}?t=${Date.now()}` 
        : null;

    // 自分のプロフィールかどうかを判定
    const isOwnProfile = currentUser?.id === user_id;

    return (
        <div className={styles.container}>
            <div className={styles.profileCard}>
                <h2 className={styles.title}>
                    {isOwnProfile ? "マイプロフィール" : "プロフィール"}
                </h2>
                
                {/* アバター表示 */}
                <div className={styles.avatarContainer}>
                    {avatarUrl ? (
                        <Image
                            src={avatarUrl}
                            alt="avatar"
                            width={120}
                            height={120}
                            className={styles.avatar}
                            unoptimized
                        />
                    ) : (
                        <div className={styles.avatarPlaceholder} />
                    )}
                </div>

                {/* ニックネーム */}
                <div className={styles.infoSection}>
                    <label className={styles.label}>ニックネーム</label>
                    <div className={styles.content}>
                        {profile?.nickname || "未設定"}
                    </div>
                </div>

                {/* 自己紹介 */}
                <div className={styles.infoSection}>
                    <label className={styles.label}>自己紹介</label>
                    <div className={styles.content}>
                        {profile?.intro || "未設定"}
                    </div>
                </div>

                {/* 編集ボタン（自分のプロフィールの場合のみ表示） */}
                {isOwnProfile && (
                    <Link href="/profiles" className={styles.editButton}>
                        プロフィールを編集
                    </Link>
                )}
            </div>
        </div>
    );
}
