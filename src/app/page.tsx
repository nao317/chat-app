import Image from "next/image";
import styles from "./page.module.css";

import PostCard from "@/lib/components/post/PostCard";
import PostForm from "@/lib/components/post/PostForm";
import { createClient } from "@/lib/supabase/server";

type PostWithAuthor = {
  id: number;
  comment: string;
  created_at: string;
  author: {
    nickname: string;
    avatar_url: string | null;
  } | null;
};

export default async function Home() {
  const supabase = await createClient();

  const { data: posts, error } = await supabase
    .from("post")
    .select(`
      id,
      comment,
      created_at,
      author:profile!post_user_id_fkey (
        nickname,
        avatar_url
      )
    `)
    .order("created_at", { ascending: false })
    .returns<PostWithAuthor[]>();

  if (error) {
    console.error(error);
  }

  return (
    <div className={styles.container}>
      <PostForm />
      <div className={styles.postsContainer}>
        {posts?.map((post) => (
          <PostCard
            key={post.id}
            comment={post.comment}
            nickname={post.author?.nickname ?? "名無し"}
            avatarUrl={post.author?.avatar_url}
            createdAt={post.created_at}
          />
        ))}
      </div>
    </div>
  );
}
