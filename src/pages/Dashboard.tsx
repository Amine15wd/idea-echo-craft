
import { useState } from "react";
import { Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarProvider } from "@/components/ui/sidebar";
import { Mic, Library, Sparkles, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import CreateTabs from "@/components/dashboard/CreateTabs";
import LibraryView from "@/components/dashboard/LibraryView";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState<'create' | 'library'>('create');
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("Successfully signed out");
    } catch (error) {
      toast.error("Error signing out");
    }
  };

  const menuItems = [{
    id: 'create' as const,
    title: 'Create',
    icon: Mic,
    description: 'Record or type content'
  }, {
    id: 'library' as const,
    title: 'Library',
    icon: Library,
    description: 'View past pitches'
  }];

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <Sidebar className="w-64 border-r-2 border-border/40 bg-slate-950">
          <SidebarHeader className="p-6 border-b-2 border-border/40">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-foreground">PitchPal AI</h1>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
            </div>
          </SidebarHeader>
          
          <SidebarContent className="p-4 flex-1">
            <SidebarMenu>
              {menuItems.map(item => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton 
                    onClick={() => setActiveTab(item.id)} 
                    className={`w-full justify-start p-4 rounded-xl transition-all duration-200 ${
                      activeTab === item.id 
                        ? 'bg-primary/10 text-primary border border-primary/20' 
                        : 'hover:bg-muted/50 text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <item.icon className="w-5 h-5 mr-3" />
                    <div className="text-left">
                      <div className="font-medium">{item.title}</div>
                      <div className="text-xs opacity-70">{item.description}</div>
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>

          <div className="p-4 border-t border-border/40">
            <SidebarMenuButton 
              onClick={handleSignOut}
              className="w-full justify-start p-4 rounded-xl transition-all duration-200 hover:bg-red-500/10 text-muted-foreground hover:text-red-500"
            >
              <LogOut className="w-5 h-5 mr-3" />
              <div className="text-left">
                <div className="font-medium">Sign Out</div>
                <div className="text-xs opacity-70">Leave dashboard</div>
              </div>
            </SidebarMenuButton>
          </div>
        </Sidebar>

        <main className="flex-1 overflow-auto">
          {activeTab === 'create' && <CreateTabs />}
          {activeTab === 'library' && <LibraryView />}
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;
