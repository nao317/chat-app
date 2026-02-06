import styles from "./PostCard.module.css";

import { Heart } from "lucide-react";
import { MessageCircle } from "lucide-react";
import { Repeat2 } from "lucide-react";

type Props = {
  comment: string;
  nickname?: string;
  createdAt: string;
};

export default function PostCard({ comment, nickname, createdAt }: Props) {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.nickname}>{nickname ?? "名無し"}</div>
        <div className={styles.timestamp}>{new Date(createdAt).toLocaleString()}</div>
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
