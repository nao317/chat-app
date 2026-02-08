import Image from "next/image";
import styles from "./page.module.css";

import { getTimelinePosts } from "@/lib/supabase/actions";
import TimelineClient from "./TimelineClient";

export default async function Home() {
  // 初回30件の投稿を取得
  const result = await getTimelinePosts(0, 30);
  const initialPosts = result.posts || [];
  const hasMore = result.hasMore || false;

  return (
    <TimelineClient initialPosts={initialPosts} initialHasMore={hasMore} />
  );
}
