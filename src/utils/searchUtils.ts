/**
 * 검색 유틸리티 함수 모음
 * - 다중 키워드(공백 분리) AND 검색 지원
 * - 검색어 토큰 추출 및 정규화
 */

/**
 * 검색어 문자열을 개별 단어 토큰 배열로 분리 및 정규화합니다.
 */
export function getSearchTokens(query: string): string[] {
  if (!query) return [];
  return query
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter((token) => token.length > 0);
}

/**
 * 여러 필드(targets) 중 모든 검색 토큰(AND 조건)이 하나 이상의 필드에 존재하는지 검사합니다.
 * @param targets 검색 대상 필드 문자열 목록 (예: [item.title, item.description, item.author])
 * @param query 검색어
 */
export function multiMatch(
  targets: (string | number | null | undefined)[],
  query: string
): boolean {
  const tokens = getSearchTokens(query);
  if (tokens.length === 0) return true;

  // 모든 타겟 문자열을 소문자로 변환하여 하나의 통합 검색 텍스트로 구성하거나 개별 검사
  const normalizedTargets = targets
    .filter((t): t is string | number => t !== null && t !== undefined)
    .map((t) => String(t).toLowerCase());

  if (normalizedTargets.length === 0) return false;

  const combined = normalizedTargets.join(" ");

  // 모든 토큰이 결합 텍스트에 포함되어야 함 (AND 검색)
  return tokens.every((token) => combined.includes(token));
}
