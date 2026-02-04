import styles from "./PostCard.module.css";

import { Heart } from "lucide-react";
import { MessageCircle } from "lucide-react";
import { Repeat2 } from "lucide-react";

export default function PostCard() {
    return (
        <div className={styles.card}>
            <div className={styles.body}>
                <div className={styles.actions}>
                    <button className={styles.actions} aria-label="like"><Heart size={22}/></button>
                    <button className={styles.actions} aria-label="repeat"><Repeat2 size={22}/></button>
                    <button className={styles.actions} aria-label="reply"><MessageCircle size={22}/></button>
                </div>
            </div>
        </div>
    );
}
