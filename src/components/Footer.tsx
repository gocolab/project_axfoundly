import React from "react";
import { ExternalLink, Shield, FileText, Building2 } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full bg-[#05111f]/95 border-t border-brand-border/50 text-slate-400 py-3.5 px-4 sm:px-6 transition-colors">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-y-2.5 gap-x-4 text-xs font-sans">
        {/* Left: 회사 정보 및 사업자 등록 정보 한 줄 요약 */}
        <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-2.5 gap-y-1 text-slate-400">
          <span className="font-semibold text-slate-300">© 2026 AI로 창업하라</span>
          <span className="text-slate-600">|</span>
          <span>상호명: <strong className="font-medium text-slate-300">렉토메이트 (LectoMate)</strong></span>
          <span className="hidden sm:inline text-slate-600">|</span>
          <span>대표자: <span className="text-slate-300">오상훈</span></span>
          <span className="hidden sm:inline text-slate-600">|</span>
          <span>사업자등록번호: <span className="text-slate-300">634-62-00683</span></span>
          <span className="hidden lg:inline text-slate-600">|</span>
          <span className="hidden lg:inline">문의: <a href="mailto:mahau.master@gmail.com" className="text-slate-300 hover:text-brand-primary transition-colors">mahau.master@gmail.com</a></span>
        </div>

        {/* Right: 핵심 정책 링크 (회사소개 | 이용약관 | 개인정보처리방침) */}
        <div className="flex items-center gap-x-3 text-slate-300 shrink-0">
          <a
            href="https://www.lectomate.com/policy/company"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 hover:text-brand-primary hover:underline transition-colors py-0.5"
            title="회사소개 (새 창으로 이동)"
          >
            <Building2 size={12} className="text-brand-secondary" />
            <span>회사소개</span>
            <ExternalLink size={10} className="text-slate-500" />
          </a>
          <span className="text-slate-600">|</span>
          <a
            href="https://www.lectomate.com/policy/terms"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 hover:text-brand-primary hover:underline transition-colors py-0.5"
            title="이용약관 (새 창으로 이동)"
          >
            <FileText size={12} className="text-brand-secondary" />
            <span>이용약관</span>
            <ExternalLink size={10} className="text-slate-500" />
          </a>
          <span className="text-slate-600">|</span>
          <a
            href="https://www.lectomate.com/policy/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 hover:text-brand-primary font-medium hover:underline transition-colors py-0.5 text-brand-primary"
            title="개인정보처리방침 (새 창으로 이동)"
          >
            <Shield size={12} className="text-brand-primary" />
            <span>개인정보처리방침</span>
            <ExternalLink size={10} className="text-brand-primary/60" />
          </a>
        </div>
      </div>
    </footer>
  );
}
