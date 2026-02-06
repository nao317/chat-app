import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ProfileForm from "@/lib/components/profile/ProfileForm";
import styles from "../auth.module.css";

export default async function Profiles() {
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
            <ProfileForm profile={profile} userId={user.id} />
        </div>
    );
}