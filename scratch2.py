import re

with open("src/components/AdminDashboard.tsx", "r") as f:
    content = f.read()

# 1. Remove mt-[92px]
content = content.replace("mt-[92px] ", "")

# 2. Extract renderDetailPanel
detail_panel_match = re.search(r'\{/\* Inline Right Detail Panel.*?\{selectedPanelItem && \((.*?)\n          \)\}', content, re.DOTALL)
if detail_panel_match:
    detail_panel = detail_panel_match.group(1)
    
    new_render_func = f'''
  const renderDetailPanel = () => {{
    if (!selectedPanelItem) return null;
    return (
{detail_panel}
    );
  }};
'''
    # Insert renderDetailPanel before the first useEffect that handles payments
    content = content.replace('  React.useEffect(() => {\n    if (activeTab === "payments") {', new_render_func + '\n  React.useEffect(() => {\n    if (activeTab === "payments") {')
    
    # Remove the original detail panel
    content = content.replace(detail_panel_match.group(0), '')

# 3. Restructure right content area
content = content.replace(
    '{/* ── 우측 콘텐츠 영역 (Master-Detail Split View Container) ── */}\n        <div className="flex-1 min-w-0 flex gap-5 items-start">\n          {/* Main Master Content (Tables / Lists) */}\n          <div className={`transition-all duration-300 ease-out min-w-0 ${selectedPanelItem ? "flex-1" : "w-full"}`}>',
    '{/* ── 우측 콘텐츠 영역 ── */}\n        <div className="flex-1 min-w-0 flex flex-col gap-5 items-start">\n          {/* Main Master Content (Tables / Lists) */}\n          <div className="w-full">'
)

# 4. For each tab, inject the flex container around the table
def wrap_tab(content, table_div_pattern, closing_pattern):
    match = re.search(table_div_pattern, content)
    if not match: return content
    
    table_str = match.group(0)
    replacement = f'''<div className="flex gap-5 items-start">
                  <div className={{`transition-all duration-300 ease-out min-w-0 ${{selectedPanelItem ? "flex-1" : "w-full"}}`}}>
                    {table_str}'''
    content = content.replace(table_str, replacement, 1)
    
    # Replace closing pattern
    closing_replacement = closing_pattern.replace(
        '                </div>\n              </div>',
        '                  </div>\n                  {renderDetailPanel()}\n                </div>\n              </div>'
    )
    content = content.replace(closing_pattern, closing_replacement, 1)
    return content

content = wrap_tab(content, 
    r'<div className="bg-brand-card border border-brand-border/60 rounded-xl overflow-hidden">\n\s*<div className={`grid \${selectedPanelItem \? "grid-cols-4 gap-2" : "grid-cols-8 gap-1"}', 
    '                  ))}\n                </div>\n              </div>\n            )}\n\n            {/* ── 강의/콘텐츠 관리 ── */}')

content = wrap_tab(content, 
    r'\{pendingCourses\.length === 0 \? \(', 
    '                  ))}\n                </div>\n              </div>\n            )}\n\ */}')n            {/* ── 게시판 관리 ─

content = wrap_tab(content, 
    r'<div className="bg-brand-card border border-brand-border/60 rounded-xl overflow-hidden">\n\s*<div className={`grid \${selectedPanelItem \? "grid-cols-4 gap-2" : "grid-cols-7 gap-2"} px-5 py-2 bg-brand-surface-low border-b border-brand-border/30 text-\[9px\]', 
    '                  ))}\n                </div>\n              </div>\n            )}\n\n            {/* ── 알림/마케팅 CRM ── */}')

content = wrap_tab(content, 
    r'<div className="bg-brand-card border border-brand-border/60 rounded-xl overflow-hidden">\n\s*<div className={`grid \${selectedPanelItem \? "grid-cols-4 gap-2" : "grid-cols-7 gap-2"} px-5 py-2 bg-brand-surface-low border-b border-brand-border/30 text-\[9px\]', 
    '                  ))}\n                </div>\n              </div>\n            )}\n\n            {/* ── 결제 관리 ── */}')

content = wrap_tab(content, 
    r'<div className="bg-brand-card border border-brand-border/60 rounded-xl overflow-hidden">\n\s*<div className={`grid \${selectedPanelItem \? "grid-cols-4 gap-2" : "grid-cols-7 gap-2"} px-5 py-2\.5', 
    '                  ))}\n                  )} \n                </div>\n              </div>\n            )}\n\n            {/* Create Board Modal */}')


# Note: The CRM tab and Boards tab both use similar grids. Let's fix wrapping CRM by checking if it worked, or we can just do string replacements.

with open("src/components/AdminDashboard.tsx", "w") as f:
    f.write(content)
