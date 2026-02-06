import styles from "./PostCard.module.css";
import Image from "next/image";

import { Heart } from "lucide-react";
import { MessageCircle } from "lucide-react";
import { Repeat2 } from "lucide-react";

type Props = {
  comment: string;
  nickname?: string;
  avatarUrl?: string | null;
  createdAt: string;
};

export default function PostCard({ comment, nickname, avatarUrl, createdAt }: Props) {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.userInfo}>
          <div className={styles.avatarContainer}>
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt="avatar"
                width={40}
                height={40}
                className={styles.avatar}
                unoptimized
              />
            ) : (
              <div className={styles.avatarPlaceholder}></div>
            )}
          </div>
          <div className={styles.userDetails}>
            <div className={styles.nickname}>{nickname ?? "名無し"}</div>
            <div className={styles.timestamp}>{new Date(createdAt).toLocaleString()}</div>
          </div>
        </div>
      </div>

      <div className={styles.body}>
        <p className={styles.comment}>{comment}</p>
      </div>

      <div className={styles.actions}>
        <button className={styles.action} aria-label="like"><Heart size={22} /></button>
        <button className={styles.action} aria-label="repeat"><Repeat2 size={22} /></button>
        <button className={styles.action} aria-label="reply"><MessageCircle size={22} /></button>
      </div>
    </div>
  );
}
