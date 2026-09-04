import React from "react";
import type { CommonCode } from "../types";
import { api } from "../lib/api";

// 전역 인메모리 캐시 (불필요한 반복 네트워크 요청 방지)
let globalCodesCache: CommonCode[] | null = null;
let pendingFetchPromise: Promise<CommonCode[]> | null = null;

export const clearCommonCodesCache = () => {
  globalCodesCache = null;
};

export function useCommonCodes(groups?: string[]) {
  // groups 배열 참조 변경으로 인한 무한 렌더링 방지 (원시 문자열 키로 정규화)
  const groupsKey = groups ? [...groups].sort().join(",") : "";
  const groupsList = React.useMemo(() => (groupsKey ? groupsKey.split(",") : undefined), [groupsKey]);

  const [codes, setCodes] = React.useState<CommonCode[]>(() => {
    if (!globalCodesCache) return [];
    if (!groupsList || groupsList.length === 0) return globalCodesCache;
    return globalCodesCache.filter((c) => groupsList.includes(c.groupCode));
  });
  const [loading, setLoading] = React.useState<boolean>(!globalCodesCache);

  const fetchCodes = React.useCallback(async (force = false) => {
    if (!force && globalCodesCache) {
      const filtered = groupsList && groupsList.length > 0
        ? globalCodesCache.filter((c) => groupsList.includes(c.groupCode))
        : globalCodesCache;
      setCodes((prev) => {
        if (prev.length === filtered.length && prev.every((item, idx) => item.code === filtered[idx].code)) {
          return prev;
        }
        return filtered;
      });
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      if (!pendingFetchPromise || force) {
        pendingFetchPromise = api.getCommonCodes().then((res) => {
          globalCodesCache = res.codes || [];
          return globalCodesCache;
        });
      }
      const allCodes = await pendingFetchPromise;
      const filtered = groupsList && groupsList.length > 0
        ? allCodes.filter((c) => groupsList.includes(c.groupCode))
        : allCodes;
      setCodes((prev) => {
        if (prev.length === filtered.length && prev.every((item, idx) => item.code === filtered[idx].code)) {
          return prev;
        }
        return filtered;
      });
    } catch (err) {
      console.error("[useCommonCodes] 로드 실패:", err);
    } finally {
      setLoading(false);
      pendingFetchPromise = null;
    }
  }, [groupsKey]);

  React.useEffect(() => {
    fetchCodes();
  }, [fetchCodes]);

  const getCodesByGroup = React.useCallback(
    (groupCode: string, onlyActive = true): CommonCode[] => {
      const source = globalCodesCache || codes;
      return source
        .filter((c) => c.groupCode.toUpperCase() === groupCode.toUpperCase() && (!onlyActive || c.isActive))
        .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
    },
    [codes]
  );

  const getDisplayName = React.useCallback(
    (groupCode: string, codeOrName: string, fallback?: string): string => {
      const groupCodes = getCodesByGroup(groupCode, false);
      const match = groupCodes.find(
        (c) => c.code.toUpperCase() === codeOrName.toUpperCase() || c.codeName === codeOrName || c.displayName === codeOrName
      );
      return match ? match.displayName || match.codeName : fallback || codeOrName;
    },
    [getCodesByGroup]
  );

  const getBadgeClass = React.useCallback(
    (groupCode: string, codeOrName: string): string => {
      const groupCodes = getCodesByGroup(groupCode, false);
      const match = groupCodes.find(
        (c) => c.code.toUpperCase() === codeOrName.toUpperCase() || c.codeName === codeOrName || c.displayName === codeOrName
      );
      const badgeColor = (match?.extraValue as any)?.badgeColor || (match?.extraValue as any)?.tagColor;

      switch (badgeColor) {
        case "amber":
          return "bg-amber-500/20 text-amber-300 border-amber-500/40";
        case "emerald":
          return "bg-emerald-500/20 text-emerald-300 border-emerald-500/40";
        case "blue":
          return "bg-blue-500/20 text-blue-300 border-blue-500/40";
        case "purple":
          return "bg-purple-500/20 text-purple-300 border-purple-500/40";
        case "teal":
          return "bg-teal-500/20 text-teal-300 border-teal-500/40";
        case "rose":
          return "bg-rose-500/20 text-rose-300 border-rose-500/40";
        case "cyan":
          return "bg-cyan-500/20 text-cyan-300 border-cyan-500/40";
        case "yellow":
          return "bg-yellow-500/20 text-yellow-300 border-yellow-500/40";
        case "slate":
          return "bg-slate-500/20 text-slate-300 border-slate-500/40";
        default:
          return "bg-brand-primary/20 text-brand-primary border-brand-primary/30";
      }
    },
    [getCodesByGroup]
  );

  return {
    codes,
    loading,
    refetch: () => fetchCodes(true),
    getCodesByGroup,
    getDisplayName,
    getBadgeClass,
  };
}
