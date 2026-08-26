import { Router } from "express";
import { db } from "../db.js";
import type { CommonCode, CodeGroup } from "../../src/types.js";

const router = Router();

/**
 * GET /api/common/codes
 * 공통 코드 목록 조회
 * Query Params:
 *  - groups: 쉼표로 구분된 그룹 코드 목록 (예: INVESTMENT_STAGE,EMPLOYMENT_TYPE)
 *  - all: 'true'인 경우 비활성(isActive=false) 코드도 포함 (기본값: false)
 */
router.get("/codes", (req, res) => {
  try {
    const { groups, all } = req.query;
    let codes = db.get("commonCodes") || [];

    // 활성 상태 필터링 (all=true가 아니면 isActive=true만 반환)
    if (all !== "true") {
      codes = codes.filter((c) => c.isActive);
    }

    // 그룹 필터링
    if (groups && typeof groups === "string") {
      const groupList = groups.split(",").map((g) => g.trim().toUpperCase());
      codes = codes.filter((c) => groupList.includes(c.groupCode.toUpperCase()));
    }

    // 정렬: groupCode 오름차순 -> sortOrder 오름차순
    codes.sort((a, b) => {
      if (a.groupCode !== b.groupCode) {
        return a.groupCode.localeCompare(b.groupCode);
      }
      return (a.sortOrder || 0) - (b.sortOrder || 0);
    });

    res.json({ codes });
  } catch (error) {
    console.error("[Common Codes API] GET /codes error:", error);
    res.status(500).json({ error: "공통 코드 조회에 실패했습니다." });
  }
});

/**
 * GET /api/common/groups
 * 코드 그룹 목록 조회
 */
router.get("/groups", (req, res) => {
  try {
    const { all } = req.query;
    let groups = db.get("codeGroups") || [];

    if (all !== "true") {
      groups = groups.filter((g) => g.isActive);
    }

    res.json({ groups });
  } catch (error) {
    console.error("[Common Codes API] GET /groups error:", error);
    res.status(500).json({ error: "코드 그룹 조회에 실패했습니다." });
  }
});

/**
 * POST /api/common/codes
 * 신규 공통 코드 등록
 */
router.post("/codes", (req, res) => {
  try {
    const { groupCode, code, codeName, displayName, sortOrder, extraValue, isActive, isSystem } = req.body;

    if (!groupCode || !code || !codeName) {
      return res.status(400).json({ error: "groupCode, code, codeName은 필수 항목입니다." });
    }

    const currentCodes = db.get("commonCodes") || [];
    const normalizedGroupCode = groupCode.trim().toUpperCase();
    const normalizedCode = code.trim().toUpperCase();

    // 중복 체크
    const exists = currentCodes.some(
      (c) => c.groupCode.toUpperCase() === normalizedGroupCode && c.code.toUpperCase() === normalizedCode
    );
    if (exists) {
      return res.status(400).json({ error: "해당 그룹에 이미 존재하는 코드입니다." });
    }

    const newCode: CommonCode = {
      id: `cc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      groupCode: normalizedGroupCode,
      code: normalizedCode,
      codeName: codeName.trim(),
      displayName: displayName?.trim() || codeName.trim(),
      sortOrder: Number(sortOrder) || (currentCodes.length + 1),
      extraValue: extraValue || {},
      isActive: isActive !== undefined ? Boolean(isActive) : true,
      isSystem: Boolean(isSystem),
      createdAt: new Date().toISOString(),
    };

    db.update("commonCodes", (prev) => [...prev, newCode]);

    res.status(201).json({ code: newCode });
  } catch (error) {
    console.error("[Common Codes API] POST /codes error:", error);
    res.status(500).json({ error: "공통 코드 등록에 실패했습니다." });
  }
});

/**
 * PUT /api/common/codes/:id
 * 공통 코드 수정
 */
router.put("/codes/:id", (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const currentCodes = db.get("commonCodes") || [];

    const targetIndex = currentCodes.findIndex((c) => c.id === id);
    if (targetIndex === -1) {
      return res.status(404).json({ error: "해당 공통 코드를 찾을 수 없습니다." });
    }

    const target = currentCodes[targetIndex];
    const updatedCode: CommonCode = {
      ...target,
      ...updates,
      id: target.id, // ID 변경 방지
      groupCode: target.groupCode, // 그룹코드 변경 방지
    };

    db.update("commonCodes", (prev) =>
      prev.map((item) => (item.id === id ? updatedCode : item))
    );

    res.json({ code: updatedCode });
  } catch (error) {
    console.error("[Common Codes API] PUT /codes/:id error:", error);
    res.status(500).json({ error: "공통 코드 수정에 실패했습니다." });
  }
});

export default router;
