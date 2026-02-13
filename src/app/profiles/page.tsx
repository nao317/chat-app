import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ProfileForm from "@/lib/components/profile/ProfileForm";
import styles from "../auth.module.css";

export default async function Profiles() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser().catch(() => ({ data: { user: null } }));

    if (!user) {
        redirect("/login");
    }

    let { data: profile, error } = await supabase
        .from("profile")
        .select("*")
        .eq("id", user.id)
        .single();

    // profileレコードが存在しない場合は作成
    if (error && error.code === 'PGRST116') {
        console.log("プロフィールが見つからないため、作成します");
        console.log("ユーザーID:", user.id);
        console.log("ユーザーemail:", user.email);
        
        const { error: insertError, data: insertData } = await supabase
            .from("profile")
            .insert({
                id: user.id,
                nickname: "名無し",
                intro: "",
                avatar_url: ""
            })
            .select();
        
        console.log("Insert結果:", { insertError, insertData });
        
        if (insertError) {
            console.error("Profile creation error:", insertError);
            return (
                <div className={styles.container}>
                    <div className={styles.form}>
                        <h2 className={styles.title}>エラー</h2>
                        <p>プロフィールの作成に失敗しました。</p>
                        <p>エラー: {insertError.message}</p>
                        <p>Supabaseのダッシュボードで以下を確認してください：</p>
                        <ul>
                            <li>profileテーブルのRLSポリシーがINSERTを許可しているか</li>
                            <li>ユーザーが認証されているか</li>
                        </ul>
                    </div>
                </div>
            );
        }
        
        profile = insertData?.[0] || null;
    } else if (error) {
        console.error("Profile fetch error:", error);
    }

    return (
        <div className={styles.container}>
            <ProfileForm profile={profile} userId={user.id} />
        </div>
    );
}