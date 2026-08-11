---
name: vibe-coding-guide
description: |
  바이브 코딩(vibe coding) 시 반드시 참조해야 하는 프로젝트 에이전트 가이드.
  코드 작성, 설계, 기능 구현 등 모든 개발 작업 전에 이 스킬이 지정하는 문서를 읽고 따른다.
---

# Vibe Coding Guide — 「AI로 창업하라」 플랫폼

## 필수 참조 문서

**코드를 작성하기 전에 반드시 아래 문서를 읽고 따라야 합니다.**

1. **진입점**: [`docs/agent/AGENT_GUIDE.md`](file:///apps/project_launch_bizs/docs/agent/AGENT_GUIDE.md)
   - 이 문서가 전체 문서 세트의 진입점이며, 개발 규칙·인터뷰 절차·개발 시작 조건을 정의합니다.
2. **업무 정의**: [`docs/bizs/biz_flows.md`](file:///apps/project_launch_bizs/docs/bizs/biz_flows.md)
   - 플랫폼의 비즈니스 모델·기능 구성·개발 로드맵을 정의합니다.

## 워크플로우

1. **작업 시작 전**: `docs/agent/AGENT_GUIDE.md`를 읽어 문서 세트 구조와 현재 결정 상태를 파악한다.
2. **설계 결정이 필요한 경우**: `rules/` 폴더의 해당 문서에서 ✅/❓ 상태를 확인한다.
   - ❓ 미결정 항목이 있으면 **코드를 작성하지 않고** 사용자에게 질문한다.
3. **기능 구현 전**: 해당 기능의 API 명세(`specs/10_API_SPEC.md`), 화면 설계(`specs/11_SCREEN_SPEC.md`)를 먼저 작성하고 사용자 확인을 받는다.
4. **코드 작성 후**: 문서와 코드가 일치하는지 확인한다. 불일치 시 문서를 먼저 수정한다.

## 핵심 원칙

- **문서 → 코드 순서**: 설계 변경이 필요하면 문서를 먼저 수정하고, 코드를 문서에 맞춘다.
- **결정 변경 시**: `99_DECISIONS.md`에 변경 이력을 남긴다.
- **업무 정의 참조**: 기능 범위·우선순위 판단 시 `docs/bizs/biz_flows.md`를 기준으로 한다.
