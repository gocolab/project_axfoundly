import React from "react";
import { 
  Beaker, 
  CalendarDays, 
  Boxes, 
  BookOpen, 
  User, 
  Settings, 
  HelpCircle, 
  Rocket, 
  Menu,
  X
} from "lucide-react";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onStartMission: () => void;
  xpPoints: number;
}

export default function Sidebar({ activeTab, setActiveTab, onStartMission, xpPoints }: SidebarProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  const menuItems = [
    { id: "laboratory", label: "내 연구실", icon: Beaker },
    { id: "events", label: "이벤트", icon: CalendarDays },
    { id: "assets", label: "에셋 공유", icon: Boxes },
    { id: "insights", label: "인사이트", icon: BookOpen },
  ];

  return (
    <>
      {/* Mobile Burger Trigger */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-brand-surface-high border border-brand-border rounded-lg text-brand-on-surface hover:text-brand-primary active:scale-95 transition-all"
        aria-label="Open Menu"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* SideNavBar Container */}
      <aside 
        className={`fixed inset-y-0 left-0 z-45 w-64 bg-brand-surface-low border-r border-[#273647]/50 p-6 flex flex-col gap-6 transform lg:transform-none lg:opacity-100 transition-all duration-300 ease-in-out
          ${isOpen ? "translate-x-0 opacity-100" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Brand Header */}
        <div className="mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-brand-surface-high border border-[#4f46e5]/40 flex items-center justify-center p-0.5">
              <img 
                alt="AI Builder Avatar" 
                className="w-full h-full object-cover rounded-full" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAKa_8h-dGvieDvT0ZiXE1cSTv3R6g0fB40_A2AQX_9iB-680xoQxldOUE-QMp_zq_eVCZnixvNK_oldjLi_zxVwlaLKDMsn7gbQxtS0YsEHavU5DpBUALmI7MfEW_LZ1KzTvlgIB8jd12Dx2JgPVahfXxq49zaqb6Om07ETnJigr5c38bylodZL1wF9OCWVxwpCIpJIRrhou4S32tlVQCiDrtRZcYsu2mZ1GteghnClu4meKMKEw6kAWppZYdDqjHCthCg0ySZYZDg"
              />
            </div>
            <div>
              <h1 className="font-display text-lg font-black tracking-tight text-white select-none">
                액셀러레이터 허브
              </h1>
              <p className="text-xs font-semibold text-brand-tertiary select-none">
                엘리트 멤버
              </p>
            </div>
          </div>
          
          <div className="mt-4 px-2 py-1.5 bg-[#0d1c2d]/90 border border-brand-border/40 rounded-lg flex items-center justify-between text-xs">
            <span className="text-[#c7c4d8]">누적 경험치:</span>
            <span className="font-mono font-bold text-brand-primary">{xpPoints.toLocaleString()} XP</span>
          </div>
        </div>

        {/* Start Mission CTA */}
        <button 
          onClick={() => {
            onStartMission();
            setIsOpen(false);
          }}
          className="w-full bg-[#4f46e5] text-brand-on-surface font-semibold text-sm py-2.5 px-4 rounded-xl hover:bg-[#c3c0ff] hover:text-[#131b2e] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(79,70,229,0.3)] hover:shadow-[0_0_20px_rgba(79,70,229,0.5)] cursor-pointer"
        >
          <Rocket size={16} />
          <span>미션 시작</span>
        </button>

        {/* Tab Navigation */}
        <nav className="flex-1 flex flex-col gap-1.5 overflow-y-auto pt-2">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 active:scale-[0.98] cursor-pointer
                  ${isActive 
                    ? "bg-[#4f46e5]/90 text-brand-on-surface shadow-sm font-semibold border-l-4 border-brand-primary" 
                    : "text-brand-on-surface-variant hover:text-brand-on-surface hover:bg-[#1c2b3c]/80"
                  }
                `}
              >
                <IconComponent size={18} className={isActive ? "text-brand-primary" : "text-brand-on-surface-variant"} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Footer Settings & Support */}
        <div className="mt-auto border-t border-brand-border/40 pt-4 flex flex-col gap-1.5">
          <button 
            onClick={() => {
              setActiveTab("laboratory");
              setIsOpen(false);
              setTimeout(() => {
                const element = document.getElementById("ai-mentor-section");
                element?.scrollIntoView({ behavior: "smooth" });
              }, 100);
            }}
            className="flex items-center gap-3 px-4 py-2 text-xs text-brand-on-surface-variant hover:text-brand-on-surface transition-colors cursor-pointer"
          >
            <Settings size={14} />
            <span>설정</span>
          </button>
          
          <a 
            href="#"
            onClick={(e) => {
              e.preventDefault();
              alert("액셀러레이터 기술 조력 팀에 문의할 수 있는 지원 데스크가 활성화되었습니다. (Support Ticket #NEXUS-01)");
            }}
            className="flex items-center gap-3 px-4 py-2 text-xs text-brand-on-surface-variant hover:text-brand-on-surface transition-colors"
          >
            <HelpCircle size={14} />
            <span>고객 지원</span>
          </a>
        </div>
      </aside>

      {/* Backdrop for mobile */}
      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)}
          className="lg:hidden fixed inset-0 bg-[#010f1f]/80 backdrop-blur-sm z-40 transition-opacity duration-300"
        />
      )}
    </>
  );
}
