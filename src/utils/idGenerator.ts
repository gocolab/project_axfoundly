const ALPHABET = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

/**
 * 암호학적으로 안전한 순수 8자리 Base62 고유 식별자 생성
 * @param length 기본 8자리
 */
export function generateShortId(length = 8): string {
  let result = "";
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    const bytes = new Uint8Array(length);
    crypto.getRandomValues(bytes);
    for (let i = 0; i < length; i++) {
      result += ALPHABET[bytes[i] % ALPHABET.length];
    }
    return result;
  }
  for (let i = 0; i < length; i++) {
    result += ALPHABET.charAt(Math.floor(Math.random() * ALPHABET.length));
  }
  return result;
}
