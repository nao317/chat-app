'use client';

import React, { useState } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import styles from "@/app/auth.module.css";

type Props = {
  profile: any;
  userId: string;
};

export default function ProfileForm({ profile, userId }: Props) {
  const supabase = createClient();
  const router = useRouter();

  const [nickname, setNickname] = useState(profile?.nickname ?? "");
  const [intro, setIntro] = useState(profile?.intro ?? "");
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url ?? "");
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    console.log("=== 保存処理開始 ===");
    console.log("ユーザーID:", userId);
    console.log("更新データ:", { nickname, intro, avatar_url: avatarUrl });

    // 単純なupdateを使用（プロフィールは必ず存在する前提）
    const { error, data } = await supabase
      .from("profile")
      .update({
        nickname,
        intro,
        avatar_url: avatarUrl,
      })
      .eq('id', userId)
      .select();

    console.log("保存レスポンス:", { error, data });

    setIsLoading(false);

    if (error) {
      console.error("Save error:", error);
      alert(`エラー: ${error.message}\n\nデータベースのRLSポリシーを確認してください。`);
      return;
    }

    if (!data || data.length === 0) {
      alert("プロフィールの更新に失敗しました。ページをリロードして再試行してください。");
      return;
    }

    console.log("保存成功:", data);
    alert("保存しました！");
    
    // プロフィール表示ページにリダイレクト
    router.push('/profile_show');
    router.refresh();
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];
    const fileExt = file.name.split('.').pop();
    const filePath = `${userId}/avatar.${fileExt}`;

    setIsLoading(true);

    try {
      console.log("=== 画像アップロード開始 ===");
      console.log("ファイルパス:", filePath);

      // まず既存のファイルを削除（エラーは無視）
      await supabase.storage.from("icon").remove([filePath]);

      // 新しいファイルをアップロード
      const { error: uploadError, data: uploadData } = await supabase.storage
        .from("icon")
        .upload(filePath, file, { 
          cacheControl: '3600',
          upsert: true 
        });

      console.log("アップロード結果:", { uploadError, uploadData });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        alert(`アップロード失敗: ${uploadError.message}`);
        return;
      }

      // 公開URLを取得
      const {
        data: { publicUrl },
      } = supabase.storage.from("icon").getPublicUrl(filePath);

      console.log("公開URL:", publicUrl);

      // キャッシュバスティングのためタイムスタンプを追加
      const urlWithTimestamp = `${publicUrl}?t=${Date.now()}`;

      // データベースに直接保存
      console.log("DB更新開始 - avatar_url:", publicUrl);
      
      // 単純なupdateを使用
      const { error: dbError, data: dbData } = await supabase
        .from("profile")
        .update({ avatar_url: publicUrl })
        .eq('id', userId)
        .select();

      console.log("DB更新結果:", { dbError, dbData });

      if (dbError) {
        console.error("DB update error:", dbError);
        alert(`保存失敗: ${dbError.message}`);
        return;
      }

      if (!dbData || dbData.length === 0) {
        alert("プロフィールの更新に失敗しました。");
        return;
      }

      setAvatarUrl(urlWithTimestamp);
      alert("画像をアップロードして保存しました！");
      
      // 画像のキャッシュをクリアするため少し待ってから更新
      setTimeout(() => {
        router.refresh();
      }, 500);
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
            unoptimized
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
