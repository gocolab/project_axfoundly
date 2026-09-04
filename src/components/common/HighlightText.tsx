import React from "react";
import { getSearchTokens } from "../../utils/searchUtils";

interface HighlightTextProps {
  text: string;
  query?: string;
  highlightClassName?: string;
  className?: string;
}

/**
 * 정규식 특수문자를 안전하게 이스케이프합니다.
 */
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export default function HighlightText({
  text,
  query = "",
  highlightClassName = "bg-brand-primary/20 text-brand-primary font-semibold px-0.5 rounded",
  className = "",
}: HighlightTextProps) {
  if (!text) return null;

  const tokens = getSearchTokens(query);
  if (tokens.length === 0) {
    return <span className={className}>{text}</span>;
  }

  // 검색 토큰들을 정규식 패턴으로 합성 (OR 그룹)
  const pattern = new RegExp(`(${tokens.map(escapeRegExp).join("|")})`, "gi");
  const parts = text.split(pattern);

  return (
    <span className={className}>
      {parts.map((part, index) => {
        const isMatch = tokens.some((token) => token.toLowerCase() === part.toLowerCase());
        return isMatch ? (
          <mark key={index} className={highlightClassName}>
            {part}
          </mark>
        ) : (
          <React.Fragment key={index}>{part}</React.Fragment>
        );
      })}
    </span>
  );
}
