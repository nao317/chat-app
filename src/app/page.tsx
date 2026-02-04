import Image from "next/image";
import styles from "./page.module.css";

import PostCard from "@/lib/components/post/PostCard";

export default function Home() {
  return (
    <div>
      <PostCard />
    </div>
  );
}
