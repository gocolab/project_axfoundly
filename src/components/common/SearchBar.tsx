import React, { useState, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;
  className?: string;
  inputClassName?: string;
  dataTestId?: string;
  enableShortcut?: boolean;
  autoFocus?: boolean;
}

export default function SearchBar({
  value,
  onChange,
  placeholder = "검색어를 입력하세요...",
  debounceMs = 250,
  className = "",
  inputClassName = "",
  dataTestId,
  enableShortcut = true,
  autoFocus = false,
}: SearchBarProps) {
  const [innerValue, setInnerValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);
  const isUserTyping = useRef(false);

  // 부모 value가 외부에서 변경되었을 때 로컬 상태 동기화
  useEffect(() => {
    if (!isUserTyping.current) {
      setInnerValue(value);
    }
  }, [value]);

  // 디바운스 타이머 처리
  useEffect(() => {
    if (!isUserTyping.current) return;

    const timer = setTimeout(() => {
      onChange(innerValue);
      isUserTyping.current = false;
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [innerValue, debounceMs, onChange]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    isUserTyping.current = true;
    setInnerValue(e.target.value);
  };

  const handleClear = () => {
    isUserTyping.current = false;
    setInnerValue("");
    onChange("");
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      handleClear();
    } else if (e.key === "Enter") {
      // 엔터 입력 시 디바운스 대기 없이 즉시 반영
      isUserTyping.current = false;
      onChange(innerValue);
    }
  };

  // 단축키 '/' 감지 (다른 입력 필드 활성 시 제외)
  useEffect(() => {
    if (!enableShortcut) return;

    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === "/" && document.activeElement !== inputRef.current) {
        const tagName = document.activeElement?.tagName.toLowerCase();
        const isEditable = (document.activeElement as HTMLElement)?.isContentEditable;
        if (tagName !== "input" && tagName !== "textarea" && tagName !== "select" && !isEditable) {
          e.preventDefault();
          inputRef.current?.focus();
        }
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [enableShortcut]);

  return (
    <div className={`relative flex items-center ${className}`}>
      <Search
        className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-on-surface-variant/70 pointer-events-none"
        size={14}
      />
      <input
        ref={inputRef}
        type="text"
        role="searchbox"
        aria-label={placeholder}
        data-testid={dataTestId}
        value={innerValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className={`w-full bg-brand-surface-low border border-brand-border rounded-lg py-1.5 pl-9 pr-12 text-xs text-white placeholder:text-brand-on-surface-variant/60 focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/40 transition-all ${inputClassName}`}
      />
      <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
        {innerValue ? (
          <button
            type="button"
            onClick={handleClear}
            className="p-1 text-brand-on-surface-variant hover:text-white rounded-md hover:bg-brand-surface-high transition-colors cursor-pointer"
            title="검색어 지우기 (Esc)"
            aria-label="검색어 지우기"
          >
            <X size={12} />
          </button>
        ) : (
          enableShortcut && (
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] text-brand-on-surface-variant/50 border border-brand-border/40 rounded bg-brand-surface-high font-mono select-none">
              /
            </kbd>
          )
        )}
      </div>
    </div>
  );
}
