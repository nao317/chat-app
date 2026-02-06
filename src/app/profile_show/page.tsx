import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import styles from "./profileShow.module.css";

export default async function ProfileShow() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const { data: profile } = await supabase
        .from("profile")
        .select("*")
        .eq("id", user.id)
        .single();

    return (
        <div className={styles.container}>
            <div className={styles.profileCard}>
                <h2 className={styles.title}>プロフィール</h2>
                
                {/* アバター表示 */}
                <div className={styles.avatarContainer}>
                    {profile?.avatar_url ? (
                        <Image
                            src={profile.avatar_url}
                            alt="avatar"
                            width={120}
                            height={120}
                            className={styles.avatar}
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

                {/* 編集ボタン */}
                <Link href="/profiles" className={styles.editButton}>
                    プロフィールを編集
                </Link>
            </div>
        </div>
    );
}
