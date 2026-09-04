import { useState, useEffect, useCallback, useRef } from "react";

interface UrlPaginationOptions {
  pageKey?: string;
  queryKey?: string;
  defaultPage?: number;
  defaultQuery?: string;
}

/**
 * URL SearchParams와 동기화되는 페이지 및 검색어 상태 관리 훅
 * - 브라우저 뒤로가기/앞으로가기(popstate) 시 상태 자동 복원
 * - 페이지 번호 이동은 pushState로 히스토리 기록
 * - 검색어 변경은 replaceState를 활용하여 브라우저 히스토리 스택 오염 방지
 */
export function useUrlPagination(options: UrlPaginationOptions = {}) {
  const {
    pageKey = "page",
    queryKey = "q",
    defaultPage = 1,
    defaultQuery = "",
  } = options;

  const readFromUrl = useCallback(() => {
    if (typeof window === "undefined") {
      return { page: defaultPage, query: defaultQuery };
    }
    const params = new URLSearchParams(window.location.search);
    const rawPage = params.get(pageKey);
    const parsedPage = rawPage ? parseInt(rawPage, 10) : defaultPage;
    const validPage = isNaN(parsedPage) || parsedPage < 1 ? defaultPage : parsedPage;
    const parsedQuery = params.get(queryKey) ?? defaultQuery;
    return { page: validPage, query: parsedQuery };
  }, [pageKey, queryKey, defaultPage, defaultQuery]);

  const initial = readFromUrl();
  const [page, setPageState] = useState<number>(initial.page);
  const [query, setQueryState] = useState<string>(initial.query);

  const isInternalUpdate = useRef(false);

  // popstate (뒤로가기/앞으로가기) 이벤트 감지
  useEffect(() => {
    const handlePopState = () => {
      const current = readFromUrl();
      setPageState(current.page);
      setQueryState(current.query);
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [readFromUrl]);

  // 페이지 변경 함수 (pushState)
  const setPage = useCallback(
    (newPage: number | ((prev: number) => number)) => {
      setPageState((prev) => {
        const resolvedPage = typeof newPage === "function" ? newPage(prev) : newPage;
        const valid = Math.max(1, resolvedPage);
        if (valid === prev) return prev;

        if (typeof window !== "undefined") {
          const params = new URLSearchParams(window.location.search);
          if (valid === defaultPage) {
            params.delete(pageKey);
          } else {
            params.set(pageKey, String(valid));
          }

          const newSearch = params.toString();
          const newUrl = `${window.location.pathname}${newSearch ? `?${newSearch}` : ""}${window.location.hash}`;
          if (window.location.search !== (newSearch ? `?${newSearch}` : "")) {
            window.history.pushState(null, "", newUrl);
          }
        }
        return valid;
      });
    },
    [pageKey, defaultPage]
  );

  // 검색어 변경 함수 (replaceState)
  const setQuery = useCallback(
    (newQuery: string) => {
      setQueryState((prev) => {
        if (prev === newQuery) return prev;
        return newQuery;
      });

      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        const trimmed = newQuery.trim();

        if (!trimmed) {
          params.delete(queryKey);
        } else {
          params.set(queryKey, trimmed);
        }

        // 검색어가 바뀌면 페이지는 1페이지로 리셋
        params.delete(pageKey);
        setPageState(1);

        const newSearch = params.toString();
        const newUrl = `${window.location.pathname}${newSearch ? `?${newSearch}` : ""}${window.location.hash}`;
        window.history.replaceState(null, "", newUrl);
      }
    },
    [queryKey, pageKey]
  );

  return {
    page,
    setPage,
    query,
    setQuery,
  };
}
