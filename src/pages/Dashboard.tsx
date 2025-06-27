import { useState } from "react";
import { Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarProvider } from "@/components/ui/sidebar";
import { Mic, Library, Sparkles } from "lucide-react";
import Create from "@/components/dashboard/Create";
import LibraryView from "@/components/dashboard/LibraryView";
const Dashboard = () => {
  const [activeTab, setActiveTab] = useState<'create' | 'library'>('create');
  const menuItems = [{
    id: 'create' as const,
    title: 'Create',
    icon: Mic,
    description: 'Record new pitch'
  }, {
    id: 'library' as const,
    title: 'Library',
    icon: Library,
    description: 'View past pitches'
  }];
  return <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <Sidebar className="w-64 border-r border-border/20 bg-slate-950">
          <SidebarHeader className="p-6 border-b border-border/20">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary-foreground" />
              </div>
              <h1 className="text-lg font-bold text-foreground">PitchPal AI</h1>
            </div>
          </SidebarHeader>
          
          <SidebarContent className="p-4">
            <SidebarMenu>
              {menuItems.map(item => <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton onClick={() => setActiveTab(item.id)} className={`w-full justify-start p-4 rounded-xl transition-all duration-200 ${activeTab === item.id ? 'bg-primary/10 text-primary border border-primary/20' : 'hover:bg-muted/50 text-muted-foreground hover:text-foreground'}`}>
                    <item.icon className="w-5 h-5 mr-3" />
                    <div className="text-left">
                      <div className="font-medium">{item.title}</div>
                      <div className="text-xs opacity-70">{item.description}</div>
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>)}
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>

        <main className="flex-1 overflow-auto">
          {activeTab === 'create' && <Create />}
          {activeTab === 'library' && <LibraryView />}
        </main>
      </div>
    </SidebarProvider>;
};
export default Dashboard;