import re

with open("src/components/AdminDashboard.tsx", "r") as f:
    content = f.read()

# 1. Add Pagination import
if 'import Pagination' not in content:
    content = content.replace(
        'import {',
        'import Pagination from "./common/Pagination";\nimport {',
        1
    )

# 2. Replace memberSearch state with unified states
content = content.replace(
    'const [memberSearch, setMemberSearch] = React.useState("");',
    'const [searchQuery, setSearchQuery] = React.useState("");\n  const [currentPage, setCurrentPage] = React.useState(1);'
)

# 3. Add state reset on activeTab change
reset_effect_target = '''  React.useEffect(() => {
    if (selectedPanelItem) {
      setSelectedPanelItem(null);
      setIsClosing(false);
    }
  }, [activeTab]);'''
reset_effect_new = '''  React.useEffect(() => {
    setSearchQuery("");
    setCurrentPage(1);
    if (selectedPanelItem) {
      setSelectedPanelItem(null);
      setIsClosing(false);
    }
  }, [activeTab]);'''
content = content.replace(reset_effect_target, reset_effect_new)

# 4. Inject Pagination calculation logic before the return statement
pagination_logic = '''
  // --- Pagination Logic ---
  const itemsPerPage = 10;
  
  const filteredMembers = members.filter(
    (m) => m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
           m.email.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const totalMemberPages = Math.ceil(filteredMembers.length / itemsPerPage);
  const paginatedMembers = filteredMembers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const filteredCourses = pendingCourses.filter(
    (c) => c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
           c.instructor.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const totalCoursePages = Math.ceil(filteredCourses.length / itemsPerPage);
  const paginatedCourses = filteredCourses.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const filteredBoards = localBoards.filter(
    (b) => b.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const totalBoardPages = Math.ceil(filteredBoards.length / itemsPerPage);
  const paginatedBoards = filteredBoards.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const filteredLogs = sendLogs.filter(
    (l) => l.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
           l.target.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const totalLogPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const paginatedLogs = filteredLogs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const filteredPayments = payments.filter(
    (p) => (p.courseTitle || p.course || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
           (p.userId || p.user || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
           (p.id || "").toLowerCase().includes(searchQuery.toLowerCase())
  );
  const totalPaymentPages = Math.ceil(filteredPayments.length / itemsPerPage);
  const paginatedPayments = filteredPayments.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
'''

# Remove old filteredMembers
content = content.replace('''  const filteredMembers = members.filter(
    (m) => m.name.toLowerCase().includes(memberSearch.toLowerCase()) ||
           m.email.toLowerCase().includes(memberSearch.toLowerCase())
  );''', "")

content = content.replace('  return (\n    <div className="flex flex-col', pagination_logic + '\n  return (\n    <div className="flex flex-col')

# 5. Helper to create search+pagination UI
def get_search_ui(placeholder, total_pages_var, filtered_len_var):
    return f'''                <div className="flex flex-col xl:flex-row items-end xl:items-center gap-3 w-full xl:w-auto shrink-0 mb-4">
                  <div className="relative w-full xl:w-60">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-on-surface-variant" size={{14}} />
                    <input
                      type="text"
                      placeholder="{placeholder}"
                      value={{searchQuery}}
                      onChange={{(e) => setSearchQuery(e.target.value)}}
                      className="bg-brand-surface-low border border-brand-border rounded-lg py-1.5 pl-9 pr-4 text-xs text-white placeholder:text-brand-on-surface-variant/60 focus:outline-none focus:border-brand-primary transition-colors w-full"
                    />
                  </div>
                  {{{total_pages_var} > 1 && (
                    <div className="ml-auto">
                      <Pagination
                        currentPage={{currentPage}}
                        totalPages={{{total_pages_var}}}
                        onPageChange={{setCurrentPage}}
                        totalItems={{{filtered_len_var}}}
                        itemsPerPage={{itemsPerPage}}
                      />
                    </div>
                  )}}
                </div>'''

# a) Replace members search
old_member_search = '''                <div className="flex flex-col sm:flex-row gap-3 justify-between">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-on-surface-variant" size={14} />
                    <input
                      type="text"
                      placeholder="회원 검색..."
                      value={memberSearch}
                      onChange={(e) => setMemberSearch(e.target.value)}
                      className="bg-brand-surface-low border border-brand-border rounded-lg py-1.5 pl-9 pr-4 text-xs text-white placeholder:text-brand-on-surface-variant/60 focus:outline-none focus:border-brand-primary-container transition-colors w-full sm:w-64"
                    />
                  </div>
                  <span className="text-xs text-brand-on-surface-variant">총 {members.length}명</span>
                </div>'''
content = content.replace(old_member_search, get_search_ui("회원 검색...", "totalMemberPages", "filteredMembers.length"))
content = content.replace("filteredMembers.map((member)", "paginatedMembers.map((member)")

# b) Add courses search
content = content.replace(
    '''                  <p className="text-xs text-brand-on-surface-variant mt-0.5">강사가 개설 신청한 강의의 커리큘럼과 일정을 검토하여 승인 또는 반려합니다.</p>\n                </div>''',
    '''                  <p className="text-xs text-brand-on-surface-variant mt-0..</p>\n                </div>\n\n''' + get_search_ui("강의 검색...", "totalCoursePages", "filteredCourses.length")
)
content = content.replace("pendingCourses.length === 0", "filteredCourses.length === 0")
content = content.replace("pendingCourses.map((course)", "paginatedCourses.map((course)")

# c) Add boards search
content = content.replace(
    '''                  </button>\n                </div>\n\n                <div className="flex gap-5 items-start">''',
    '''                  </button>\n                </div>\n\n''' + get_search_ui("게시판 검색...", "totalBoardPages", "filteredBoards.length") + '''\n\n                <div className="flex gap-5 items-start">'''
)
# Note: we should only replace the first occurrence of localBoards.map in the boards tab
content = content.replace("localBoards.map((board)", "paginatedBoards.map((board)")

# d) Add crm search
content = content.replace(
    '''                <h3 className="text-xs font-bold text-brand-on-surface-variant mt-2">발송 로그</h3>\n                <div className="flex gap-5 items-start">''',
    '''                <h3 className="text-xs font-bold text-brand-on-surface-variant mt-2">발송 로그</h3>\n\n''' + get_search_ui("발송 로그 검색...", "totalLogPages", "filteredLogs.length") + '''\n\n                <div className="flex gap-5 items-start">'''
)
content = content.replace("sendLogs.map((log)", "paginatedLogs.map((log)")

# e) Add payments search
content = content.replace(
    '''                {/* 모의 결제 내역 */}\n                <div className="flex gap-5 items-start">''',
    '''                {/* 모의 결제 내역 */}\n\n''' + get_search_ui("결제 내역 검색...", "totalPaymentPages", "filteredPayments.length") + '''\n\n                <div className="flex gap-5 items-start">'''
)
content = content.replace("payments.length === 0", "filteredPayments.length === 0")
content = content.replace("payments.map((payment)", "paginatedPayments.map((payment)")

with open("src/components/AdminDashboard.tsx", "w") as f:
    f.write(content)
