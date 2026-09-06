import React from "react";
import {
  Settings,
  Plus,
  Edit,
  Trash2,
  Sparkles,
  X,
} from "lucide-react";
import type { CodeGroup, CommonCode } from "../../types";
import { api } from "../../lib/api";
import { useToast } from "../common/Toast";
import { clearCommonCodesCache } from "../../hooks/useCommonCodes";

export default function AdminCommonCodesTab() {
  const toast = useToast();

  const [codeGroups, setCodeGroups] = React.useState<CodeGroup[]>([]);
  const [commonCodes, setCommonCodes] = React.useState<CommonCode[]>([]);
  const [selectedGroupCode, setSelectedGroupCode] = React.useState<string>("COURSE_CATEGORY");
  const [loading, setLoading] = React.useState(true);

  // Modals state
  const [showCodeModal, setShowCodeModal] = React.useState(false);
  const [editingCode, setEditingCode] = React.useState<CommonCode | null>(null);
  const [showGroupModal, setShowGroupModal] = React.useState(false);
  const [editingGroup, setEditingGroup] = React.useState<CodeGroup | null>(null);

  const loadData = React.useCallback(async () => {
    try {
      setLoading(true);
      const [gRes, cRes] = await Promise.all([api.getCodeGroups(), api.getCommonCodes()]);
      const groups = gRes.groups || [];
      setCodeGroups(groups);
      setCommonCodes(cRes.codes || []);
      if (groups.length > 0 && (!selectedGroupCode || !groups.some(g => g.groupCode === selectedGroupCode))) {
        setSelectedGroupCode(groups[0].groupCode);
      }
    } catch (err) {
      console.error("Failed to load common codes", err);
    } finally {
      setLoading(false);
    }
  }, [selectedGroupCode]);

  React.useEffect(() => {
    loadData();
  }, []);

  const currentGroup = codeGroups.find((g) => g.groupCode === selectedGroupCode);
  const currentCodes = commonCodes
    .filter((c) => c.groupCode === selectedGroupCode)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-brand-surface-low/60 p-5 rounded-2xl border border-brand-border/40">
        <div>
          <h3 className="font-display text-lg font-bold text-white flex items-center gap-2">
            <Settings className="text-brand-primary" size={20} />
            공통 코드 관리 (Common Code Management)
          </h3>
          <p className="text-xs text-brand-on-surface-variant mt-1">
            강의 카테고리, IR 분야, 결제/정산 등 시스템 전반의 공통 분류 코드를 무중단으로 관리하고 뱃지 색상을 설정합니다.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setEditingGroup(null);
              setShowGroupModal(true);
            }}
            className="px-3.5 py-2 bg-brand-surface-high hover:bg-brand-surface-highest text-white rounded-xl text-xs font-bold border border-brand-border/60 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Plus size={14} /> 새 그룹 추가
          </button>
          <button
            onClick={() => {
              setEditingCode(null);
              setShowCodeModal(true);
            }}
            className="px-3.5 py-2 bg-gradient-to-r from-brand-primary-container to-brand-secondary text-white rounded-xl text-xs font-bold hover:opacity-90 transition-opacity flex items-center gap-1.5 cursor-pointer shadow-lg shadow-brand-primary/20"
          >
            <Plus size={14} /> 새 코드 등록
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Code Groups List */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-white">코드 그룹 목록 ({codeGroups.length})</span>
          </div>

          <div className="space-y-2">
            {codeGroups.map((group) => {
              const count = commonCodes.filter((c) => c.groupCode === group.groupCode).length;
              const isSelected = selectedGroupCode === group.groupCode;
              return (
                <div
                  key={group.groupCode}
                  onClick={() => setSelectedGroupCode(group.groupCode)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? "bg-brand-primary-container/20 border-brand-primary text-white shadow-md"
                      : "bg-brand-card border-brand-border/40 hover:border-brand-border text-brand-on-surface-variant hover:bg-brand-surface-low"
                  }`}
                >
                  <div className="min-w-0 flex-1 pr-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-xs font-bold truncate ${isSelected ? "text-brand-primary" : "text-white"}`}>
                        {group.groupName}
                      </span>
                      {group.isSystem && (
                        <span className="px-1.5 py-0.5 text-[9px] font-mono bg-purple-500/20 text-purple-300 rounded border border-purple-500/30">
                          시스템
                        </span>
                      )}
                      {!group.isActive && (
                        <span className="px-1.5 py-0.5 text-[9px] bg-red-500/20 text-red-300 rounded border border-red-500/30">
                          비활성
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] font-mono text-brand-on-surface-variant/80 mt-0.5 truncate">
                      {group.groupCode}
                    </div>
                    {group.description && (
                      <div className="text-[11px] text-brand-on-surface-variant/70 mt-1 line-clamp-1">
                        {group.description}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-brand-surface-high text-brand-on-surface-variant">
                      {count}개
                    </span>
                    {!group.isSystem && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingGroup(group);
                          setShowGroupModal(true);
                        }}
                        className="text-brand-on-surface-variant hover:text-white p-1 rounded hover:bg-brand-surface-high cursor-pointer transition-colors"
                        title="그룹 수정"
                      >
                        <Edit size={12} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Codes inside selected group */}
        <div className="lg:col-span-8 space-y-4">
          {currentGroup ? (
            <div className="glass-panel border border-brand-border/60 rounded-2xl p-5 shadow-lg space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-3 border-b border-brand-border/40">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-display font-bold text-base text-white">{currentGroup.groupName}</h4>
                    <span className="text-xs font-mono text-brand-primary bg-brand-primary/10 px-2 py-0.5 rounded-lg border border-brand-primary/20">
                      {currentGroup.groupCode}
                    </span>
                  </div>
                  {currentGroup.description && (
                    <p className="text-xs text-brand-on-surface-variant mt-1">{currentGroup.description}</p>
                  )}
                </div>
                <button
                  onClick={() => {
                    setEditingCode(null);
                    setShowCodeModal(true);
                  }}
                  className="px-3 py-1.5 bg-brand-primary/20 text-brand-primary hover:bg-brand-primary/30 border border-brand-primary/40 rounded-xl text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Plus size={13} /> 이 그룹에 코드 추가
                </button>
              </div>

              {currentCodes.length === 0 ? (
                <div className="text-center py-12 text-brand-on-surface-variant text-xs">
                  등록된 공통 코드가 없습니다. 새 코드를 등록해보세요.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-brand-on-surface-variant">
                    <thead>
                      <tr className="border-b border-brand-border/40 text-brand-on-surface-variant/80">
                        <th className="py-2.5 px-3 font-semibold w-12 text-center">순서</th>
                        <th className="py-2.5 px-3 font-semibold">코드 키</th>
                        <th className="py-2.5 px-3 font-semibold">코드명 / 표시명</th>
                        <th className="py-2.5 px-3 font-semibold">뱃지 미리보기</th>
                        <th className="py-2.5 px-3 font-semibold text-center">상태</th>
                        <th className="py-2.5 px-3 font-semibold text-right">관리</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-border/20">
                      {currentCodes.map((codeItem) => {
                        const badgeColor =
                          (codeItem.extraValue as any)?.badgeColor ||
                          (codeItem.extraValue as any)?.tagColor ||
                          "blue";

                        const getBadgeStyle = (color: string) => {
                          switch (color) {
                            case "amber": return "bg-amber-500/20 text-amber-300 border-amber-500/40";
                            case "emerald": return "bg-emerald-500/20 text-emerald-300 border-emerald-500/40";
                            case "blue": return "bg-blue-500/20 text-blue-300 border-blue-500/40";
                            case "purple": return "bg-purple-500/20 text-purple-300 border-purple-500/40";
                            case "teal": return "bg-teal-500/20 text-teal-300 border-teal-500/40";
                            case "rose": return "bg-rose-500/20 text-rose-300 border-rose-500/40";
                            case "cyan": return "bg-cyan-500/20 text-cyan-300 border-cyan-500/40";
                            case "yellow": return "bg-yellow-500/20 text-yellow-300 border-yellow-500/40";
                            case "slate": return "bg-slate-500/20 text-slate-300 border-slate-500/40";
                            default: return "bg-brand-primary/20 text-brand-primary border-brand-primary/30";
                          }
                        };

                        return (
                          <tr key={codeItem.id} className="hover:bg-brand-surface-low/50 transition-colors">
                            <td className="py-3 px-3 text-center font-mono font-bold text-white/80">
                              {codeItem.sortOrder}
                            </td>
                            <td className="py-3 px-3 font-mono font-semibold text-white">
                              {codeItem.code}
                            </td>
                            <td className="py-3 px-3">
                              <div className="font-semibold text-white">{codeItem.displayName || codeItem.codeName}</div>
                              {codeItem.codeName !== codeItem.displayName && (
                                <div className="text-[10px] text-brand-on-surface-variant/70 font-mono">기본: {codeItem.codeName}</div>
                              )}
                            </td>
                            <td className="py-3 px-3">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${getBadgeStyle(badgeColor)}`}>
                                {codeItem.displayName || codeItem.codeName}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-center">
                              <button
                                onClick={async () => {
                                  try {
                                    const updated = await api.updateCommonCode(codeItem.id, { isActive: !codeItem.isActive });
                                    setCommonCodes((prev) =>
                                      prev.map((c) => (c.id === codeItem.id ? updated.code : c))
                                    );
                                    clearCommonCodesCache();
                                    toast.success("상태 변경", `[${codeItem.displayName}] 상태가 변경되었습니다.`);
                                  } catch (err: any) {
                                    toast.error("오류", err?.message || "상태 변경에 실패했습니다.");
                                  }
                                }}
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold cursor-pointer transition-colors ${
                                  codeItem.isActive
                                    ? "bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/40"
                                    : "bg-red-500/20 text-red-300 hover:bg-red-500/30 border border-red-500/40"
                                }`}
                              >
                                {codeItem.isActive ? "사용중" : "비활성"}
                              </button>
                            </td>
                            <td className="py-3 px-3 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => {
                                    setEditingCode(codeItem);
                                    setShowCodeModal(true);
                                  }}
                                  className="p-1 text-brand-on-surface-variant hover:text-white hover:bg-brand-surface-high rounded cursor-pointer transition-colors"
                                  title="수정"
                                >
                                  <Edit size={12} />
                                </button>
                                {!codeItem.isSystem && (
                                  <button
                                    onClick={async () => {
                                      const ok = await toast.confirm({
                                        title: "코드 삭제 확인",
                                        message: `정말로 [${codeItem.displayName || codeItem.codeName}] 코드를 삭제하시겠습니까?`,
                                        confirmText: "삭제",
                                      });
                                      if (!ok) return;

                                      try {
                                        await api.deleteCommonCode(codeItem.id);
                                        setCommonCodes((prev) => prev.filter((c) => c.id !== codeItem.id));
                                        clearCommonCodesCache();
                                        toast.success("코드 삭제 완료", "성공적으로 삭제되었습니다.");
                                      } catch (err: any) {
                                        toast.error("오류", err?.message || "코드 삭제 중 오류가 발생했습니다.");
                                      }
                                    }}
                                    className="p-1 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded cursor-pointer transition-colors"
                                    title="삭제"
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : (
            <div className="glass-panel rounded-2xl p-12 text-center text-brand-on-surface-variant text-sm">
              왼쪽에서 코드 그룹을 선택해주세요.
            </div>
          )}
        </div>
      </div>

      {/* ──────── Code Create / Edit Modal ──────── */}
      {showCodeModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-brand-surface/80 backdrop-blur-md p-4 animate-fadeIn">
          <div className="glass-panel-heavy rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 border border-brand-border/60">
            <div className="flex justify-between items-center pb-2 border-b border-brand-border/40">
              <h3 className="font-display text-base font-bold text-white flex items-center gap-2">
                <Sparkles size={16} className="text-brand-primary" />
                {editingCode ? "공통 코드 수정" : "신규 공통 코드 등록"}
              </h3>
              <button
                onClick={() => setShowCodeModal(false)}
                className="text-brand-on-surface-variant hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const form = e.currentTarget;
                const formData = new FormData(form);
                const groupCode = (formData.get("groupCode") as string) || selectedGroupCode;
                const code = (formData.get("code") as string).trim().toUpperCase();
                const codeName = (formData.get("codeName") as string).trim();
                const displayName = (formData.get("displayName") as string).trim() || codeName;
                const sortOrder = Number(formData.get("sortOrder")) || 1;
                const badgeColor = (formData.get("badgeColor") as string) || "blue";
                const isActive = formData.get("isActive") === "on";

                try {
                  if (editingCode) {
                    const updated = await api.updateCommonCode(editingCode.id, {
                      codeName,
                      displayName,
                      sortOrder,
                      extraValue: { ...((editingCode.extraValue as any) || {}), badgeColor },
                      isActive,
                    });
                    setCommonCodes((prev) => prev.map((c) => (c.id === editingCode.id ? updated.code : c)));
                    toast.success("코드 수정 완료", `[${displayName}] 코드가 수정되었습니다.`);
                  } else {
                    const created = await api.createCommonCode({
                      groupCode,
                      code,
                      codeName,
                      displayName,
                      sortOrder,
                      extraValue: { badgeColor },
                      isActive,
                      isSystem: false,
                    });
                    setCommonCodes((prev) => [...prev, created.code]);
                    toast.success("코드 등록 완료", `[${displayName}] 코드가 새로 등록되었습니다.`);
                  }
                  clearCommonCodesCache();
                  setShowCodeModal(false);
                } catch (err: any) {
                  toast.error("저장 실패", err?.message || "코드 저장 중 오류가 발생했습니다.");
                }
              }}
              className="space-y-3.5 text-xs"
            >
              <div>
                <label className="text-white font-semibold block mb-1">소속 코드 그룹</label>
                <input
                  type="text"
                  name="groupCode"
                  defaultValue={editingCode ? editingCode.groupCode : selectedGroupCode}
                  disabled={Boolean(editingCode)}
                  className="w-full bg-brand-surface-low border border-brand-border rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none disabled:opacity-60"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-white font-semibold block mb-1">코드 키 (상수 영문)</label>
                  <input
                    type="text"
                    name="code"
                    placeholder="예: ONLINE, AI_ML"
                    defaultValue={editingCode?.code || ""}
                    disabled={Boolean(editingCode)}
                    className="w-full bg-brand-surface-low border border-brand-border rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-brand-primary disabled:opacity-60 uppercase"
                    required
                  />
                </div>
                <div>
                  <label className="text-white font-semibold block mb-1">표시 순서</label>
                  <input
                    type="number"
                    name="sortOrder"
                    defaultValue={editingCode?.sortOrder ?? (currentCodes.length + 1)}
                    className="w-full bg-brand-surface-low border border-brand-border rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-brand-primary"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-white font-semibold block mb-1">코드 기본명 (영문/한글)</label>
                <input
                  type="text"
                  name="codeName"
                  placeholder="예: 온라인 실시간"
                  defaultValue={editingCode?.codeName || ""}
                  className="w-full bg-brand-surface-low border border-brand-border rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-brand-primary"
                  required
                />
              </div>

              <div>
                <label className="text-white font-semibold block mb-1">화면 표시명 (UI 레이블)</label>
                <input
                  type="text"
                  name="displayName"
                  placeholder="예: 실시간 온라인 강의"
                  defaultValue={editingCode?.displayName || ""}
                  className="w-full bg-brand-surface-low border border-brand-border rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-brand-primary"
                />
                <span className="text-[10px] text-brand-on-surface-variant mt-0.5 block">비워두면 기본명이 사용됩니다.</span>
              </div>

              <div>
                <label className="text-white font-semibold block mb-1">뱃지 테마 색상</label>
                <select
                  name="badgeColor"
                  defaultValue={(editingCode?.extraValue as any)?.badgeColor || "blue"}
                  className="w-full bg-brand-surface-low border border-brand-border rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-brand-primary"
                >
                  <option value="blue">Blue (기본 파랑)</option>
                  <option value="emerald">Emerald (초록 / 활성)</option>
                  <option value="purple">Purple (보라 / AI)</option>
                  <option value="amber">Amber (주황 / 대기)</option>
                  <option value="teal">Teal (청록)</option>
                  <option value="cyan">Cyan (하늘색)</option>
                  <option value="rose">Rose (분홍)</option>
                  <option value="yellow">Yellow (노랑)</option>
                  <option value="slate">Slate (회색)</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isCodeActiveCheck"
                  name="isActive"
                  defaultChecked={editingCode ? editingCode.isActive : true}
                  className="rounded border-brand-border text-brand-primary focus:ring-0 cursor-pointer"
                />
                <label htmlFor="isCodeActiveCheck" className="text-white font-medium cursor-pointer select-none">
                  코드 활성화 (Active)
                </label>
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCodeModal(false)}
                  className="flex-1 py-2.5 border border-brand-border text-white rounded-xl hover:bg-brand-surface-high transition-colors cursor-pointer text-xs"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-gradient-to-r from-brand-primary-container to-brand-secondary text-white font-bold rounded-xl hover:opacity-90 transition-opacity cursor-pointer text-xs"
                >
                  저장
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ──────── Group Create / Edit Modal ──────── */}
      {showGroupModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-brand-surface/80 backdrop-blur-md p-4 animate-fadeIn">
          <div className="glass-panel-heavy rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 border border-brand-border/60">
            <div className="flex justify-between items-center pb-2 border-b border-brand-border/40">
              <h3 className="font-display text-base font-bold text-white flex items-center gap-2">
                <Settings size={16} className="text-brand-primary" />
                {editingGroup ? "코드 그룹 수정" : "신규 코드 그룹 생성"}
              </h3>
              <button
                onClick={() => setShowGroupModal(false)}
                className="text-brand-on-surface-variant hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const form = e.currentTarget;
                const formData = new FormData(form);
                const groupCode = (formData.get("groupCode") as string).trim().toUpperCase();
                const groupName = (formData.get("groupName") as string).trim();
                const description = (formData.get("description") as string).trim();
                const isActive = formData.get("isActive") === "on";

                try {
                  if (editingGroup) {
                    const updated = await api.updateCodeGroup(editingGroup.groupCode, {
                      groupName,
                      description,
                      isActive,
                    });
                    setCodeGroups((prev) =>
                      prev.map((g) => (g.groupCode === editingGroup.groupCode ? updated.group : g))
                    );
                    toast.success("그룹 수정 완료", `[${groupName}] 그룹 정보가 수정되었습니다.`);
                  } else {
                    const created = await api.createCodeGroup({
                      groupCode,
                      groupName,
                      description,
                      isActive,
                      isSystem: false,
                    });
                    setCodeGroups((prev) => [...prev, created.group]);
                    setSelectedGroupCode(created.group.groupCode);
                    toast.success("그룹 생성 완료", `[${groupName}] 그룹이 생성되었습니다.`);
                  }
                  setShowGroupModal(false);
                } catch (err: any) {
                  toast.error("저장 실패", err?.message || "그룹 저장 중 오류가 발생했습니다.");
                }
              }}
              className="space-y-3.5 text-xs"
            >
              <div>
                <label className="text-white font-semibold block mb-1">그룹 코드 (Group Code)</label>
                <input
                  type="text"
                  name="groupCode"
                  placeholder="예: COURSE_FORMAT, NOTIFICATION_TYPE"
                  defaultValue={editingGroup?.groupCode || ""}
                  disabled={Boolean(editingGroup)}
                  className="w-full bg-brand-surface-low border border-brand-border rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-brand-primary disabled:opacity-60 uppercase"
                  required
                />
              </div>

              <div>
                <label className="text-white font-semibold block mb-1">그룹명 (Group Name)</label>
                <input
                  type="text"
                  name="groupName"
                  placeholder="예: 강의 수업 방식, 알림 유형"
                  defaultValue={editingGroup?.groupName || ""}
                  className="w-full bg-brand-surface-low border border-brand-border rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-brand-primary"
                  required
                />
              </div>

              <div>
                <label className="text-white font-semibold block mb-1">그룹 설명</label>
                <textarea
                  name="description"
                  placeholder="이 코드 그룹의 용도와 설명을 입력하세요."
                  defaultValue={editingGroup?.description || ""}
                  className="w-full bg-brand-surface-low border border-brand-border rounded-xl p-3 text-white text-xs focus:outline-none focus:border-brand-primary h-20 resize-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isGroupActiveCheck"
                  name="isActive"
                  defaultChecked={editingGroup ? editingGroup.isActive : true}
                  className="rounded border-brand-border text-brand-primary focus:ring-0 cursor-pointer"
                />
                <label htmlFor="isGroupActiveCheck" className="text-white font-medium cursor-pointer select-none">
                  그룹 활성화 (Active)
                </label>
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowGroupModal(false)}
                  className="flex-1 py-2.5 border border-brand-border text-white rounded-xl hover:bg-brand-surface-high transition-colors cursor-pointer text-xs"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-gradient-to-r from-brand-primary-container to-brand-secondary text-white font-bold rounded-xl hover:opacity-90 transition-opacity cursor-pointer text-xs"
                >
                  저장
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
