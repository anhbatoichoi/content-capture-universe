
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Save, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SelectorSettings {
  article: string;
  title: string;
  content: string;
  images: string;
}

const defaultSelectors: SelectorSettings = {
  article: 'article, .article, .post, [class*="article"], [class*="post"], main',
  title: 'h1, .title, .headline, .article-title, .post-title',
  content: 'article p, .article p, .post p, .content p, [class*="article"] p, [class*="post"] p, main p',
  images: 'article img, .article img, .post img, [class*="article"] img, [class*="post"] img, main img'
};

const SettingsView = () => {
  const [selectors, setSelectors] = useState<SelectorSettings>(defaultSelectors);
  const { toast } = useToast();

  useEffect(() => {
    // Load saved selectors from storage
    const loadSettings = async () => {
      try {
        const storage = await chrome.storage.local.get('gtiContentSelectors');
        if (storage.gtiContentSelectors) {
          setSelectors(JSON.parse(storage.gtiContentSelectors));
        }
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    };

    loadSettings();
  }, []);

  const handleSelectorChange = (field: keyof SelectorSettings, value: string) => {
    setSelectors(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const saveSettings = async () => {
    try {
      await chrome.storage.local.set({
        gtiContentSelectors: JSON.stringify(selectors)
      });
      
      toast({
        title: "Settings saved",
        description: "Your custom CSS selectors have been saved.",
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Save failed",
        description: "Unable to save settings. Please try again.",
        variant: "destructive",
      });
    }
  };

  const resetSettings = () => {
    setSelectors(defaultSelectors);
    toast({
      title: "Settings reset",
      description: "CSS selectors have been reset to defaults.",
    });
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="text-gti-gold text-lg">CSS Selectors</CardTitle>
        <CardDescription>
          Customize how content is extracted
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-0">
        <ScrollArea className="h-[320px] px-4">
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="title-selector">Title Selector</Label>
              <Input
                id="title-selector"
                value={selectors.title}
                onChange={(e) => handleSelectorChange('title', e.target.value)}
                placeholder="h1, .title, .headline"
              />
              <p className="text-xs text-muted-foreground">
                CSS selector for article title
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="content-selector">Content Selector</Label>
              <Input
                id="content-selector"
                value={selectors.content}
                onChange={(e) => handleSelectorChange('content', e.target.value)}
                placeholder="article p, .content p"
              />
              <p className="text-xs text-muted-foreground">
                CSS selector for article paragraphs
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="images-selector">Images Selector</Label>
              <Input
                id="images-selector"
                value={selectors.images}
                onChange={(e) => handleSelectorChange('images', e.target.value)}
                placeholder="article img, .content img"
              />
              <p className="text-xs text-muted-foreground">
                CSS selector for article images
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="article-selector">Article Container Selector</Label>
              <Input
                id="article-selector"
                value={selectors.article}
                onChange={(e) => handleSelectorChange('article', e.target.value)}
                placeholder="article, .article, main"
              />
              <p className="text-xs text-muted-foreground">
                CSS selector for main article container
              </p>
            </div>
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="flex justify-between border-t p-2">
        <Button variant="outline" size="sm" onClick={resetSettings} className="gap-2">
          <RotateCcw className="w-3 h-3" />
          Reset
        </Button>
        <Button variant="default" size="sm" onClick={saveSettings} className="gap-2">
          <Save className="w-3 h-3" />
          Save Settings
        </Button>
      </CardFooter>
    </Card>
  );
};

export default SettingsView;
