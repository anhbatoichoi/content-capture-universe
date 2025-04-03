
import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { BookOpen, Image, Settings, Copy, Download, Zap } from "lucide-react";
import Header from './components/Header';
import ContentView from './components/ContentView';
import ImagesView from './components/ImagesView';
import SettingsView from './components/SettingsView';
import SidebarNav from './components/SidebarNav';
import { htmlToMarkdown } from './utils/markdownConverter';

interface ExtractedContent {
  url: string;
  title: string;
  content: string;
  rawText?: string;
  images: string[];
  timestamp: string;
  source?: string;
}

const App = () => {
  const [activeTab, setActiveTab] = useState('text');
  const [isExtracting, setIsExtracting] = useState(false);
  const [content, setContent] = useState<ExtractedContent | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const { toast } = useToast();

  const extractContent = async () => {
    try {
      setIsExtracting(true);
      
      // Get the active tab
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      const activeTab = tabs[0];
      
      if (!activeTab.id) {
        throw new Error('No active tab found');
      }

      // Send message to content script
      const response = await chrome.tabs.sendMessage(activeTab.id, { action: 'extractContent' });
      
      if (response) {
        // If the content comes from tiptap, convert HTML to markdown
        if (response.source === 'tiptap') {
          response.formattedContent = htmlToMarkdown(response.content);
          // Keep the original HTML too
          response.htmlContent = response.content;
          // Update the content property to contain the markdown
          response.content = response.formattedContent;
        }
        
        setContent(response);
        toast({
          title: "Content extracted!",
          description: `Found ${response.images.length} images and extracted content from ${response.source === 'tiptap' ? 'tiptap editor' : 'standard article'}`,
        });
      } else {
        throw new Error('No response from content script');
      }
    } catch (error) {
      console.error('Error extracting content:', error);
      toast({
        title: "Extraction failed",
        description: "Unable to extract content from this page. Try refreshing or checking your selectors.",
        variant: "destructive",
      });
    } finally {
      setIsExtracting(false);
    }
  };

  useEffect(() => {
    // Check if we can extract content when side panel opens
    const checkIfContentScriptLoaded = async () => {
      try {
        const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
        const activeTab = tabs[0];
        
        if (activeTab.id && activeTab.url && !activeTab.url.startsWith('chrome://')) {
          // Try to send a test message to see if content script is loaded
          try {
            const response = await chrome.tabs.sendMessage(activeTab.id, { action: 'ping' });
            if (response?.status === 'ok') {
              // Content script is loaded, we can extract content
              extractContent();
            }
          } catch (error) {
            console.log('Content script not loaded yet');
          }
        }
      } catch (error) {
        console.error('Error checking content script:', error);
      }
    };

    checkIfContentScriptLoaded();
  }, []);

  return (
    <div className="flex h-screen w-full">
      <SidebarNav 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
      />
      
      <div className="flex flex-col flex-1 h-full overflow-hidden">
        <Header />
        
        <main className="flex-1 p-4 overflow-hidden flex flex-col">
          <Button 
            onClick={extractContent} 
            className="w-full mb-4 gap-2" 
            size="lg"
            disabled={isExtracting}
          >
            {isExtracting ? (
              <>Loading<span className="animate-pulse">...</span></>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                Extract Content
              </>
            )}
          </Button>

          <div className="flex-1 overflow-hidden">
            {activeTab === "text" && (
              <ContentView content={content} />
            )}
            
            {activeTab === "images" && (
              <ImagesView images={content?.images || []} />
            )}
            
            {activeTab === "settings" && (
              <SettingsView />
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
