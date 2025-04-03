
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { BookOpen, Image, Settings, PanelLeft, PanelRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

const SidebarNav = ({ activeTab, setActiveTab, isCollapsed, setIsCollapsed }: SidebarNavProps) => {
  const navItems = [
    { id: "text", label: "Text", icon: BookOpen },
    { id: "images", label: "Images", icon: Image },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className={cn(
      "h-full flex flex-col bg-card border-r border-border transition-all duration-300",
      isCollapsed ? "w-14" : "w-48"
    )}>
      <div className="flex items-center justify-between p-3 border-b border-border">
        {!isCollapsed && <h2 className="text-xs font-medium text-secondary">GTI Capture</h2>}
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="ml-auto"
        >
          {isCollapsed ? <PanelRight className="h-4 w-4" /> : <PanelLeft className="h-4 w-4" />}
        </Button>
      </div>
      
      <div className="flex-1 py-3 overflow-auto">
        <nav className="space-y-1 px-2">
          {navItems.map((item) => (
            <Button
              key={item.id}
              variant={activeTab === item.id ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start",
                isCollapsed ? "px-2" : "px-3"
              )}
              onClick={() => setActiveTab(item.id)}
            >
              <item.icon className="h-4 w-4 mr-2" />
              {!isCollapsed && <span>{item.label}</span>}
            </Button>
          ))}
        </nav>
      </div>
      
      <div className="p-3 border-t border-border">
        <div className={cn(
          "text-xs text-muted-foreground",
          isCollapsed ? "hidden" : "block"
        )}>
          GTI Research
        </div>
      </div>
    </div>
  );
};

export default SidebarNav;
