'use client';

import React, { useState } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import styles from "@/app/auth.module.css";

type Props = {
  profile: any;
  userId: string;
};

export default function ProfileForm({ profile, userId }: Props) {
  const supabase = createClient();

  const [nickname, setNickname] = useState(profile?.nickname ?? "");
  const [intro, setIntro] = useState(profile?.intro ?? "");
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url ?? "");
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { error } = await supabase
      .from("profile")
      .update({
        nickname,
        intro,
        avatar_url: avatarUrl,
      })
      .eq("id", userId);

    if (error) {
      alert("エラー: " + error.message);
    } else {
      alert("保存しました！");
    }

    setIsLoading(false);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];
    const fileExt = file.name.split('.').pop();
    const filePath = `${userId}/avatar.${fileExt}`;

    setIsLoading(true);

    try {
      // まず既存のファイルを削除（エラーは無視）
      await supabase.storage.from("icon").remove([filePath]);

      // 新しいファイルをアップロード
      const { error: uploadError } = await supabase.storage
        .from("icon")
        .upload(filePath, file, { 
          cacheControl: '3600',
          upsert: true 
        });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        alert(`アップロード失敗: ${uploadError.message}`);
        return;
      }

      // 公開URLを取得
      const {
        data: { publicUrl },
      } = supabase.storage.from("icon").getPublicUrl(filePath);

      setAvatarUrl(publicUrl);
      alert("画像をアップロードしました！");
    } catch (error) {
      console.error("Unexpected error:", error);
      alert("予期しないエラーが発生しました");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSave} className={styles.form}>
      <h2 className={styles.title}>プロフィール編集</h2>

      {/* アバター表示 */}
      <div style={{ marginBottom: "20px", textAlign: "center" }}>
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt="avatar"
            width={100}
            height={100}
            style={{ borderRadius: "50%" }}
          />
        ) : (
          <div
            style={{
              width: 100,
              height: 100,
              borderRadius: "50%",
              background: "#ccc",
              margin: "0 auto",
            }}
          />
        )}

        <input 
          type="file" 
          accept="image/*" 
          onChange={handleUpload}
          disabled={isLoading}
          style={{ marginTop: "10px" }}
        />
      </div>

      <div className={styles.inputGroup}>
        <input
          type="text"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          placeholder="ニックネーム"
          className={styles.input}
          required
        />
      </div>

      <div className={styles.inputGroup}>
        <textarea
          value={intro}
          onChange={(e) => setIntro(e.target.value)}
          placeholder="自己紹介"
          className={styles.input}
          rows={4}
          style={{ resize: 'vertical', minHeight: '100px' }}
        />
      </div>

      <button
        type="submit"
        className={styles.submitButton}
        disabled={isLoading}
      >
        {isLoading ? "保存中..." : "保存"}
      </button>
    </form>
  );
}
