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
      <div>
        <strong>{nickname ?? "名無し"}</strong>
        <p>{comment}</p>
        <small>{new Date(createdAt).toLocaleString()}</small>
      </div>

      <div className={styles.actions}>
        <button aria-label="like"><Heart size={22} /></button>
        <button aria-label="repeat"><Repeat2 size={22} /></button>
        <button aria-label="reply"><MessageCircle size={22} /></button>
      </div>
    </div>
  );
}
