import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area"; 
import { Copy, Download, Code } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useExtraction } from '@/contexts/ExtractionContext';
import ExtractionList from './ExtractionList';
import ExtractionView from './ExtractionView';

interface ContentViewProps {
  content: {
    url?: string;
    title?: string;
    content?: string;
    htmlContent?: string; // Original HTML content from tiptap
    formattedContent?: string; // Markdown-formatted content
    timestamp?: string;
    source?: string;
  } | null;
}

const ContentView = ({ content }: ContentViewProps) => {
  const { toast } = useToast();
  const [showMarkdown, setShowMarkdown] = useState(true);
  const { selectedExtraction } = useExtraction();
  
  // Show extraction view if an extraction is selected
  if (selectedExtraction) {
    return <ExtractionView />;
  }
  
  const copyContent = () => {
    if (!content) return;
    
    const textToCopy = showMarkdown && content.formattedContent 
      ? content.formattedContent 
      : `${content.title}\n\nSource: ${content.url}\n\n${content.content}`;
      
    navigator.clipboard.writeText(textToCopy);
    
    toast({
      title: "Copied to clipboard",
      description: `The ${showMarkdown ? 'markdown' : 'article'} content has been copied to clipboard.`,
    });
  };
  
  const downloadContent = () => {
    if (!content) return;
    
    const textToDownload = showMarkdown && content.formattedContent 
      ? content.formattedContent 
      : `${content.title}\n\nSource: ${content.url}\n\n${content.content}`;
      
    const blob = new Blob([textToDownload], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `${content.title?.slice(0, 30).replace(/[^a-zA-Z0-9]/g, '_') || 'extracted_content'}.${showMarkdown ? 'md' : 'txt'}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Downloaded",
      description: `The content has been downloaded as a ${showMarkdown ? 'markdown' : 'text'} file.`,
    });
  };

  const toggleFormat = () => {
    setShowMarkdown(!showMarkdown);
  };

  // Otherwise show the extraction list or content
  if (!content) {
    return <ExtractionList />;
  }

  // Determine what content to display
  const displayContent = content.source === 'tiptap' && showMarkdown
    ? content.formattedContent || content.content
    : content.content;

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="text-gti-gold text-lg">
          {content.title || 'Extracted Text'}
        </CardTitle>
        {content.source === 'tiptap' && (
          <div className="text-xs text-muted-foreground">
            Content extracted from Tiptap editor
          </div>
        )}
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-0">
        <ScrollArea className="h-[320px] px-4">
          <div className="space-y-4">
            {displayContent ? (
              <p className="whitespace-pre-line">{displayContent}</p>
            ) : (
              <p className="text-muted-foreground">No content found on this page.</p>
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
        
        {content.source === 'tiptap' && (
          <Button 
            variant={showMarkdown ? "secondary" : "outline"} 
            size="sm" 
            onClick={toggleFormat} 
            className="gap-2"
          >
            <Code className="w-3 h-3" />
            {showMarkdown ? "Markdown" : "Plain Text"}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default ContentView;
