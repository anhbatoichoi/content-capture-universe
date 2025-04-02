
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area"; 
import { Copy, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ContentViewProps {
  content: {
    url?: string;
    title?: string;
    content?: string;
    timestamp?: string;
  } | null;
}

const ContentView = ({ content }: ContentViewProps) => {
  const { toast } = useToast();
  
  const copyContent = () => {
    if (!content) return;
    
    const textToCopy = `${content.title}\n\nSource: ${content.url}\n\n${content.content}`;
    navigator.clipboard.writeText(textToCopy);
    
    toast({
      title: "Copied to clipboard",
      description: "The article content has been copied to clipboard.",
    });
  };
  
  const downloadContent = () => {
    if (!content) return;
    
    const textToDownload = `${content.title}\n\nSource: ${content.url}\n\n${content.content}`;
    const blob = new Blob([textToDownload], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `${content.title.slice(0, 30).replace(/[^a-zA-Z0-9]/g, '_')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Downloaded",
      description: "The article content has been downloaded as a text file.",
    });
  };

  if (!content) {
    return (
      <Card className="h-full flex items-center justify-center text-center bg-muted/50">
        <CardContent>
          <p className="text-muted-foreground">
            Click "Extract Content" to capture text from the current page
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="text-gti-gold text-lg">
          {content.title || 'Extracted Text'}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-0">
        <ScrollArea className="h-[320px] px-4">
          <div className="space-y-4">
            {content.content ? (
              <p className="whitespace-pre-line">{content.content}</p>
            ) : (
              <p className="text-muted-foreground">No content found on this page.</p>
            )}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="flex justify-between border-t p-2">
        <Button variant="outline" size="sm" onClick={copyContent} className="gap-2">
          <Copy className="w-3 h-3" />
          Copy
        </Button>
        <Button variant="outline" size="sm" onClick={downloadContent} className="gap-2">
          <Download className="w-3 h-3" />
          Download
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ContentView;
