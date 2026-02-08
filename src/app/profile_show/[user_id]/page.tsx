import { createClient } from "@/lib/supabase/server";
import Image from "next/image";
import Link from "next/link";
import styles from "../profileShow.module.css";
import FollowButton from "@/lib/components/profile/FollowButton";
import { getFollowStatus, getFollowCounts } from "@/lib/supabase/actions";

type Props = {
    params: Promise<{
        user_id: string;
    }>;
};

export default async function ProfileShow({ params }: Props) {
    const supabase = await createClient();
    const { user_id } = await params;

    // 現在ログインしているユーザーを取得（エラーは無視）
    const {
        data: { user: currentUser },
    } = await supabase.auth.getUser().catch(() => ({ data: { user: null } }));

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

    // アバターURLをそのまま使用
    const avatarUrl = profile?.avatar_url || null;

    // 自分のプロフィールかどうかを判定
    const isOwnProfile = currentUser?.id === user_id;

    // フォロー状態とフォロワー数を取得
    const followStatus = await getFollowStatus(user_id, currentUser?.id || null, supabase);
    const followCounts = await getFollowCounts(user_id, supabase);

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

                {/* フォローボタン（他人のプロフィールの場合のみ表示） */}
                {!isOwnProfile && currentUser && (
                    <FollowButton
                        targetUserId={user_id}
                        initialIsFollowing={followStatus.isFollowing}
                        initialFollowerCount={followCounts.followerCount}
                    />
                )}

                {/* フォロワー・フォロー中統計（自分のプロフィールの場合） */}
                {isOwnProfile && (
                    <div className={styles.followStats}>
                        <div className={styles.statItem}>
                            <span className={styles.statCount}>{followCounts.followerCount}</span>
                            <span className={styles.statLabel}>フォロワー</span>
                        </div>
                        <div className={styles.statItem}>
                            <span className={styles.statCount}>{followCounts.followingCount}</span>
                            <span className={styles.statLabel}>フォロー中</span>
                        </div>
                    </div>
                )}

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
