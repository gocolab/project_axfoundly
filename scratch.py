import re

with open("src/components/AdminDashboard.tsx", "r") as f:
    content = f.read()

# 1. Add isClosing state and auto-close logic
content = content.replace(
    '  const [selectedPanelItem, setSelectedPanelItem]',
    '  const [isClosing, setIsClosing] = React.useState(false);\n  const [selectedPanelItem, setSelectedPanelItem]'
)
content = content.replace(
    '  React.useEffect(() => {\n    setLocalBoards(boards);\n  }, [boards]);',
    '''  React.useEffect(() => {
    setLocalBoards(boards);
  }, [boards]);

  React.useEffect(() => {
    if (selectedPanelItem) {
      setSelectedPanelItem(null);
      setIsClosing(false);
    }
  }, [activeTab]);

  const handleCloseDetail = () => {
    setIsClosing(true);
    setTimeout(() => {
      setSelectedPanelItem(null);
      setIsClosing(false);
    }, 300);
  };'''
)

# 2. Extract renderDetailPanel
detail_panel_match = re.search(r'\{/\* Inline Right Detail Panel.*?\{selectedPanelItem && \((.*?)\n          \)\}', content, re.DOTALL)
if detail_panel_match:
    detail_panel = detail_panel_match.group(1)
    
    # Replace onClick={() => setSelectedPanelItem(null)} with handleCloseDetail
    detail_panel = detail_panel.replace('onClick={() => setSelectedPanelItem(null)}', 'onClick={handleCloseDetail}')
    
    # Update animations
    detail_panel = detail_panel.replace('animate-slideInFromRight', '${isClosing ? "animate-slideOutToRight" : "animate-slideInFromRight"}')
    detail_panel = detail_panel.replace('className="w-80', 'className={`w-80')
    detail_panel = detail_panel.replace('sticky top-20"', 'sticky top-20`}')

    new_render_func = f'''
  const renderDetailPanel = () => {{
    if (!selectedPanelItem) return null;
    return (
{detail_panel}
    );
  }};
'''
    content = content.replace('  React.useEffect(() => {\n    if (activeTab === "payments") {', new_render_func + '\n  React.useEffect(() => {\n    if (activeTab === "payments") {')
    
    # Remove the original detail panel
    content = content.replace(detail_panel_match.group(0), '')

# 3. Restructure right content area
# From:
#         {/* ── 우측 콘텐츠 영역 (Master-Detail Split View Container) ── */}
#         <div className="flex-1 min-w-0 flex gap-5 items-start">
#           {/* Main Master Content (Tables / Lists) */}
#           <div className={`transition-all duration-300 ease-out min-w-0 ${selectedPanelItem ? "flex-1" : "w-full"}`}>

# To:
#         {/* ── 우 콘텐츠 영역 ── */}
#         <div className="flex-1 min-w-0 flex flex-col gap-5 items-start">
#           {/* Main Master Content (Tables / Lists) */}
#           <div className="w-full">
content = content.replace(
    '{/* ── 우측 콘텐츠 영역 (Master-Detail Split View Container) ── */}\n        <div className="flex-1 min-w-0 flex gap-5 items-start">\n          {/* Main Master Content (Tables / Lists) */}\n          <div className={`transition-all duration-300 ease-out min-w-0 ${selectedPanelItem ? "flex-1" : "w-full"}`}>',
    '{/* ── 우측 콘텐츠 영역 ── */}\n        <div className="flex-1 min-w-0 flex flex-col gap-5 items-start">\n          {/* Main Master Content (Tables / Lists) */}\n          <div className="w-full">'
)

# 4. For each tab, inject the flex container around the table
def wrap_tab(content, tab_name, table_div_pattern):
    # Find the table start
    match = re.search(table_div_pattern, content)
    if not match: return content
    
    table_str = match.group(0)
    replacement = f'''<div className="flex gap-5 items-start">
                  <div className={{`transition-all duration-300 ease-out min-w-0 ${{selectedPanelItem ? "flex-1" : "w-full"}}`}}>
                    {table_str}'''
    content = content.replace(table_str, replacement, 1)
    
    # Find the end of the tab (the </div> before the next tab)
    # We'll just look for the end of the map or similar block
    # Actually, it's easier to find the end of the tab block by looking for "</div>\n              </div>\n            )}\n"
    # and replace with "</div></div>{renderDetailPanel()}</div></div>)}
    return content

content = wrap_tab(content, 'members', r'<div className="bg-brand-card border border-brand-border/60 rounded-xl overflow-hidden">\n\s*<div className={`grid \${selectedPanelItem \? "grid-cols-4 gap-2" : "grid-cols-8 gap-1"}')
content = wrap_tab(content, 'courses', r'\{pendingCourses\.length === 0 \? \(')
content = wrap_tab(content, 'boards', r'<div className="bg-brand-card border border-brand-border/60 rounded-xl overflow-hidden">\n\s*<div className={`grid \${selectedPanelItem \? "grid-cols-4 gap-2" : "grid-cols-7 gap-2"}')
content = wrap_tab(content, 'crm', r'<div className="bg-brand-card border border-brand-border/60 rounded-xl overflow-hidden">\n\s*<div className={`grid \${selectedPanelItem \? "grid-cols-4 gap-2" : "grid-cols-7 gap-2"}')
content = wrap_tab(content, 'payments', r'<div className="bg-brand-card border border-brand-border/60 rounded-xl overflow-hidden">\n\s*<div className={`grid \${selectedPanelItem \? "grid-cols-4 gap-2" : "grid-cols-7 gap-2"}')

# Now append the closing tags
content = content.replace(
    '                  ))}\n                </div>\n              </div>\n            )}\n\n            {/* ── 강의/콘텐츠 관리 ── */}',
    '                  ))}\n                    </div>\n                  </div>\n                  {renderDetailPanel()}\n                </div>\n              </div>\n            )}\n\n            {/* ── 강의/콘텐츠 관리 ── */}'
)
content = content.replace(
    '                  ))}\n                </div>\n              </div>\n            )}\n\ */}',n            {/* ── 알림/마케팅 CRM 
    '                  ))}\n                    </div>\n                  </div>\n                  {renderDetailPanel()}\n                </div>\n              </div>\n            )}\n\n            {/* ── 알림/마케팅 CRM ── */}'
)
content = content.replace(
    '                  ))}\n                </div>\n              </div>\n            )}\n\n            {/* ── 결제 관리 탭 ── */}',
    '                  ))}\n                    </div>\n                  </div>\n                  {renderDetailPanel()}\n                </div>\n              </div>\n            )}\n\n            {/* ── 결제  탭 ── */}'
)
content = content.replace(
    '                  ))}\n                </div>\n              </div>\n            )}\n\n            {/* Create Board Modal */}',
    '                  ))}\n                    </div>\n                  </div>\n                  {renderDetailPanel()}\n                </div>\n              </div>\n            )}\n\n            {/* Create Board Modal */}'
)
content = content.replace(
    '                  </div>\n                </div>\n              </div>\n            )}\n\n            {/* ── 게시판 관 ── */}',
    '                  </div>\n                  </div>\n                  {renderDetailPanel()}\n                </div>\n              </div>\n            )}\n\ */}'n            {/* ── 게시판 관리 ─
)


with open("src/components/AdminDashboard.tsx", "w") as f:
    f.write(content)
