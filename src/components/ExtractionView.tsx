
import React from 'react';
import { useExtraction } from '@/contexts/ExtractionContext';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Copy, Download, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const ExtractionView: React.FC = () => {
  const { selectedExtraction, setSelectedExtraction } = useExtraction();
  const { toast } = useToast();

  // Safeguard against null selectedExtraction
  if (!selectedExtraction) {
    return null;
  }

  const copyContent = () => {
    if (selectedExtraction.content) {
      navigator.clipboard.writeText(selectedExtraction.content);
      toast({
        title: "Copied to clipboard",
        description: "The markdown content has been copied to clipboard.",
      });
    }
  };

  const downloadContent = () => {
    if (selectedExtraction.content) {
      const blob = new Blob([selectedExtraction.content], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `${selectedExtraction.title?.slice(0, 30).replace(/[^a-zA-Z0-9]/g, '_') || 'extracted_content'}.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Downloaded",
        description: "The content has been downloaded as a markdown file.",
      });
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2 flex flex-row items-center space-y-0">
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 mr-2"
          onClick={() => setSelectedExtraction(null)}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <CardTitle className="text-secondary text-lg">
          {selectedExtraction.title || 'Untitled Extraction'}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-0">
        <ScrollArea className="h-[320px] px-4">
          <div className="space-y-4 markdown-content">
            {selectedExtraction.content ? (
              <pre className="whitespace-pre-line">{selectedExtraction.content}</pre>
            ) : (
              <p className="text-muted-foreground">No content available.</p>
            )}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="flex justify-between border-t p-2">
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={copyContent} className="gap-2">
            <Copy className="w-3 h-3" />
            Copy
          </Button>
          <Button variant="outline" size="sm" onClick={downloadContent} className="gap-2">
            <Download className="w-3 h-3" />
            Download
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default ExtractionView;
