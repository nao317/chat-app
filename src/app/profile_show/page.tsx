import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function ProfileShow() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser().catch(() => ({ data: { user: null } }));

    if (!user) {
        redirect("/login");
    }

    // 自分のプロフィールページにリダイレクト
    redirect(`/profile_show/${user.id}`);
}
