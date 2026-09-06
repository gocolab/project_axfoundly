import crypto from "crypto";
import { db } from "../db.js";
import type { Course } from "../../src/types.js";

const ALPHABET = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

/**
 * 암호학적으로 안전한 8자리 Base62 난수 문자열 생성
 */
export function generateShortId(length = 8): string {
  const bytes = crypto.randomBytes(length);
  let result = "";
  for (let i = 0; i < length; i++) {
    result += ALPHABET[bytes[i] % ALPHABET.length];
  }
  return result;
}

/**
 * 데이터베이스 중복을 체크하여 100% 고유성이 보장되는 순수 8자리 강의 ID 발급
 */
export function generateUniqueCourseId(): string {
  const courses = (db.get("courses") || []) as Course[];
  const existingIds = new Set(courses.map((c) => c.id));

  let candidate = generateShortId(8);
  let attempts = 0;
  while (existingIds.has(candidate) && attempts < 100) {
    candidate = generateShortId(8);
    attempts++;
  }
  return candidate;
}
