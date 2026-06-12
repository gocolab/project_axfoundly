import React from "react";
import { 
  Calendar, 
  Video, 
  Mic, 
  Clock, 
  Filter, 
  ArrowRight, 
  CheckCircle,
  HelpCircle,
  Search
} from "lucide-react";
import { B2BBootcamp, LiveScheduleItem } from "../types";

interface EventsTabProps {
  bootcamps: B2BBootcamp[];
  onRegisterBootcamp: (id: string) => void;
  searchText: string;
  setSearchText: (text: string) => void;
}

export default function EventsTab({ 
  bootcamps, 
  onRegisterBootcamp, 
  searchText, 
  setSearchText 
}: EventsTabProps) {
  
  const liveSchedules: LiveScheduleItem[] = [
    {
      id: "live-1",
      time: "오늘, 14:00 PST",
      title: "아키텍처 Q&A",
      speaker: "Dr. Aris Thorne",
      role: "Deep Learning Systems",
      type: "video",
      attendeesCount: 26,
      attendeeAvatars: [
        "https://lh3.googleusercontent.com/aida-public/AB6AXuDCpJ7fqzq1WO-MsHJKoZOqm-Y0-oQN3fHuVLuUE4eRLM5_LgfYd9S-3wW1fk4fnXOEz8yy7MJ-Y5lGGCjdAWBBReMxf5dA39KCsVkysLOOAPjX2gSwVWTvjax5ZG6kPDgarJrQFUnmw_JxjZ4P3m9aS1cv6vo2971XANy8c_68GxfDIPxvPQZbXJK6XUJonvZtwmz7DCRSdtHdLHBnsVp5aWrKXa9xgvd89Oi6na0pQfMQ8klEVETcQwg9Uc8GOxsK0_lREjEKd-KU",
        "https://lh3.googleusercontent.com/aida-public/AB6AXuCIxftLdCo2MB1OjB9NuGoda_hBRm9uQv1BBu1K65k9dOM-zRYIauvEGh9tGezmhhWf82g1aeZlZOMmOBSFYoVfi-SGYc_ZFjYL80wJW4C41fxRQDXgSH98GetUmaQfSPDxc2-KJKq01JjFIgTB-DxrybjCPo-3YOvnFMEljdbUbMR7hEpuBAc9z0MhCHE0nVxs6jwvZpnqxdyClX9bbFOZmlvXSG1dbKWWdOu6Ya7Uf78XwxlPtJRTGjGp8Te3ej6s1ZWGXXTZb32Z"
      ]
    },
    {
      id: "live-2",
      time: "내일, 09:00 PST",
      title: "데이터 파이프라인 워크숍",
      speaker: "Elena Rostova",
      role: "MLOps Expert",
      type: "audio",
      attendeesCount: 12,
      attendeeAvatars: []
    }
  ];

  // Filtering bootcamps based on search text
  const filteredBootcamps = bootcamps.filter((bootcamp) =>
    bootcamp.title.toLowerCase().includes(searchText.toLowerCase()) ||
    bootcamp.description.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6 animate-fadeIn">
      {/* Page Title Row */}
      <div className="flex flex-col gap-1">
        <h2 className="font-display text-4xl font-extrabold text-white tracking-tight">
          이벤트 & 챌린지
        </h2>
        <p className="text-[#c7c4d8] text-base max-w-2xl">
          성장을 가속화하세요. 고강도 부트캠프와 엘리트 피어 네트워크에 참여하세요.
        </p>
      </div>

      {/* Featured Banner (Hero) */}
      <div className="relative overflow-hidden rounded-2xl border border-brand-border glass-panel p-8 md:p-12 group glow-hover transition-all duration-300 ambient-shadow">
        {/* Gradients */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#122131]/90 via-[#0d1c2d]/95 to-[#122131]/90 z-0" />
        <div className="absolute -right-20 -top-20 w-96 h-96 bg-[#4f46e5] rounded-full mix-blend-screen filter blur-[100px] opacity-20 group-hover:opacity-30 transition-opacity duration-700" />
        
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-[#4edea3]/10 text-brand-tertiary border border-[#4edea3]/20 px-3 py-1 rounded-full text-xs font-bold font-display tag mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[#4edea3] pulse-indicator" />
            모집 중
          </div>
          
          <h3 className="font-display text-3xl md:text-4xl font-extrabold text-white tracking-tight mb-4 group-hover:text-brand-primary transition-colors">
            프로젝트 제네시스: 4주 완성 AI 배포 챌린지
          </h3>
          
          <p className="text-[#c7c4d8] text-base md:text-lg mb-6 leading-relaxed">
            실무에 즉시 투입 가능한 AI 에이전트를 처음부터 직접 구축, 배포 및 확장하세요. 
            티어 1 시니어 엔지니어의 멘토링과 전용 GPU 컴퓨팅 연산 토큰이 전면 할당됩니다.
          </p>

          <button 
            onClick={() => alert("프로젝트 제네시스 챌린지에 정상적으로 사전 접수되었습니다! (미션 연구실에서 상세 커리큘럼을 즉시 확인할 수 있습니다.)")}
            className="bg-[#4f46e5] hover:bg-[#c3c0ff] hover:text-[#131b2e] text-white font-semibold font-display text-sm py-2.5 px-6 rounded-lg transition-all flex items-center gap-2 active:scale-95 shadow-md shadow-brand-primary-container/20 cursor-pointer"
          >
            <span>참가 신청하기</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Left Column: Live Schedule (Spans 4 columns) */}
        <div className="md:col-span-4 flex flex-col gap-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#273647]/50">
            <h3 className="font-display text-xl font-bold text-white flex items-center gap-2">
              <Calendar size={18} className="text-[#4f46e5]" />
              <span>라이브 일정</span>
            </h3>
            <button 
              onClick={() => alert("캘린더 인테그레이션: 구글 캘린더 연동 프로토콜이 대기 중입니다.")}
              className="text-brand-primary hover:text-white transition-colors text-xs font-semibold flex items-center gap-1 cursor-pointer"
            >
              <span>캘린더 보기</span>
            </button>
          </div>

          <div className="glass-panel rounded-2xl p-4 flex flex-col gap-4">
            {liveSchedules.map((schedule) => (
              <div 
                key={schedule.id}
                className="bg-[#010f1f]/80 border border-brand-border/40 rounded-xl p-4 hover:border-[#4f46e5]/50 transition-colors cursor-pointer group"
                onClick={() => alert(`[${schedule.title}] 세션 라이브 오디오/비디오 채널에 참가하는 인터페이스입니다.`)}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="text-xs font-bold text-brand-primary block mb-1">
                      {schedule.time}
                    </span>
                    <h4 className="font-body text-sm font-semibold text-white group-hover:text-brand-primary transition-all">
                      {schedule.title}
                    </h4>
                  </div>
                  {schedule.type === "video" ? (
                    <Video size={16} className="text-[#c7c4d8] group-hover:text-brand-primary transition-colors" />
                  ) : (
                    <Mic size={16} className="text-[#c7c4d8] group-hover:text-brand-primary transition-colors" />
                  )}
                </div>

                <p className="text-xs text-[#c7c4d8]/80 font-mono mb-3">
                  {schedule.speaker} • {schedule.role}
                </p>

                <div className="flex items-center gap-2">
                  {schedule.attendeeAvatars.length > 0 ? (
                    <div className="flex -space-x-2">
                      {schedule.attendeeAvatars.map((av, index) => (
                        <img 
                          key={index}
                          alt="Attendee" 
                          className="w-6 h-6 rounded-full border border-brand-bg object-cover" 
                          src={av} 
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="w-6 h-1 bg-brand-border rounded" />
                  )}
                  <span className="text-xs text-[#c7c4d8]/60 font-mono">
                    {schedule.attendeesCount}명 참여 중
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Upcoming Bootcamps (Spans 8 columns) */}
        <div className="md:col-span-8 flex flex-col gap-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#273647]/50">
            <h3 className="font-display text-xl font-bold text-white flex items-center gap-2">
              <Clock size={18} className="text-brand-tertiary" />
              <span>진행 예정 부트캠프</span>
            </h3>
            
            {/* Filter / Search Bar embedded */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-brand-on-surface-variant" />
                <input 
                  type="text" 
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  placeholder="부트캠프 검색..."
                  className="bg-brand-surface-low border border-brand-border rounded-lg py-1 pl-8 pr-3 text-xs text-brand-on-surface focus:outline-none focus:border-brand-primary transition-colors"
                />
              </div>
              <button 
                onClick={() => { setSearchText(""); alert("검설 필터가 초기화되었습니다."); }}
                className="p-1.5 bg-brand-surface-high rounded border border-brand-border text-brand-on-surface hover:bg-brand-surface-highest transition-colors cursor-pointer"
                title="정렬 필터"
              >
                <Filter size={14} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredBootcamps.map((bootcamp) => (
              <div 
                key={bootcamp.id}
                className="glass-panel rounded-2xl overflow-hidden flex flex-col glow-hover transition-all duration-300 group shadow-md"
              >
                <div className="h-28 bg-[#1c2b3c] relative overflow-hidden flex items-center justify-center">
                  {/* Grid background texture */}
                  <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8cmVjdCB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSIjMGQxYzJkIj48L3JlY3Q+CjxwYXRoIGQ9Ik0wIDBMOCA4Wk04IDBMMCA4WiIgc3Ryb2tlPSIjMWMyYjNjIiBzdHJva2Utd2lkdGg9IjEiPjwvcGF0aD4KPC9zdmc+')] opacity-40 z-0" />
                  
                  {/* Glowing decorative shape */}
                  <div className="absolute -left-10 -bottom-10 w-24 h-24 bg-[#4f46e5]/10 rounded-full blur-xl z-0" />

                  <div className="absolute top-3 right-3 bg-[#051424]/80 backdrop-blur border border-brand-border px-2.5 py-1 rounded font-display text-xs text-[#d4e4fa] flex items-center gap-1.5 z-10 select-none">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-tertiary animate-pulse" />
                    <span>{bootcamp.startDate}</span>
                  </div>

                  <div className="relative z-10 text-center px-4">
                    <span className="font-display font-black text-2xl text-brand-primary select-none opacity-20 group-hover:opacity-40 transition-opacity">
                      Incubator Cohort
                    </span>
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col gap-3">
                  <h4 className="font-display text-lg font-bold text-white group-hover:text-brand-primary transition-colors leading-snug">
                    {bootcamp.title}
                  </h4>
                  <p className="text-[#c7c4d8] text-xs leading-relaxed flex-1">
                    {bootcamp.description}
                  </p>

                  <div className="pt-4 border-t border-[#273647]/40 flex items-center justify-between mt-2">
                    <div className="flex flex-col">
                      <span className="text-xs text-[#c7c4d8]/50 line-through">
                        ${bootcamp.originalPrice.toLocaleString()}
                      </span>
                      <span className="text-sm font-bold text-white">
                        ${bootcamp.discountedPrice.toLocaleString()}{" "}
                        <span className="text-[10px] text-[#c7c4d8]/70 font-normal">합계</span>
                      </span>
                    </div>

                    {bootcamp.isRegistered ? (
                      <div className="bg-[#4edea3]/10 text-[#4edea3] border border-[#4edea3]/30 text-xs px-3 py-2 rounded-lg font-bold flex items-center gap-1 select-none">
                        <CheckCircle size={12} />
                        <span>신청 완료</span>
                      </div>
                    ) : (
                      <button 
                        onClick={() => onRegisterBootcamp(bootcamp.id)}
                        className="bg-transparent border border-[#c3c0ff] hover:bg-[#4f46e5]/20 hover:text-white text-brand-primary text-xs font-semibold px-4 py-2 rounded-lg transition-all active:scale-95 cursor-pointer"
                      >
                        보증금 ${bootcamp.deposit}로 참여하기
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {filteredBootcamps.length === 0 && (
              <div className="col-span-2 py-12 text-center text-[#c7c4d8]/60 text-sm">
                일치하는 진행 예정 부트캠프가 없습니다.
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
