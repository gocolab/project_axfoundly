/**
 * 스마트 공유 유틸리티
 * - 모바일/지원 브라우저: navigator.share() 네이티브 공유 다이얼로그 호출
 * - PC/미지원 환경: navigator.clipboard.writeText() 클립보드 복사 및 레거시 execCommand fallback
 */

export interface ShareOptions {
  title: string;
  text?: string;
  url?: string;
  onSuccess?: () => void;
  onError?: (err: unknown) => void;
}

export async function shareContent({
  title,
  text,
  url = typeof window !== "undefined" ? window.location.href : "",
  onSuccess,
  onError,
}: ShareOptions): Promise<void> {
  if (typeof window === "undefined") return;

  const shareData: ShareData = {
    title,
    ...(text ? { text } : {}),
    url,
  };

  // 1. 모바일 및 Web Share API 지원 브라우저
  if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
    try {
      await navigator.share(shareData);
      onSuccess?.();
      return;
    } catch (err: unknown) {
      // 사용자가 공유 창을 닫거나 취소한 경우 (AbortError) 무시
      if (err instanceof Error && err.name === "AbortError") {
        return;
      }
      console.warn("Web Share API failed, falling back to clipboard:", err);
    }
  }

  // 2. Clipboard API 클립보드 복사
  if (navigator.clipboard && navigator.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(url);
      onSuccess?.();
      return;
    } catch (err: unknown) {
      console.warn("navigator.clipboard.writeText failed:", err);
    }
  }

  // 3. 레거시 execCommand 복사 Fallback
  try {
    const textArea = document.createElement("textarea");
    textArea.value = url;
    textArea.style.position = "fixed";
    textArea.style.left = "-999999px";
    textArea.style.top = "-999999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand("copy");
    document.body.removeChild(textArea);

    if (successful) {
      onSuccess?.();
      return;
    }
    throw new Error("execCommand copy failed");
  } catch (err) {
    console.error("All copy/share methods failed:", err);
    onError?.(err);
  }
}
