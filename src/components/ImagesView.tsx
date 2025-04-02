
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Download, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ImagesViewProps {
  images: string[];
}

const ImagesView = ({ images }: ImagesViewProps) => {
  const { toast } = useToast();
  
  const downloadImage = async (imageUrl: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      const filename = imageUrl.split('/').pop() || 'image.jpg';
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Downloaded",
        description: "Image downloaded successfully.",
      });
    } catch (error) {
      console.error('Error downloading image:', error);
      toast({
        title: "Download failed",
        description: "Unable to download this image.",
        variant: "destructive",
      });
    }
  };

  if (images.length === 0) {
    return (
      <Card className="h-full flex items-center justify-center text-center bg-muted/50">
        <CardContent>
          <p className="text-muted-foreground">
            No images found on the current page
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="text-gti-gold text-lg">
          Found {images.length} {images.length === 1 ? 'image' : 'images'}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-0">
        <ScrollArea className="h-[320px]">
          <div className="p-4 grid grid-cols-2 gap-4">
            {images.map((image, index) => (
              <div key={index} className="relative group">
                <div className="bg-card rounded-md overflow-hidden aspect-square relative">
                  <img 
                    src={image} 
                    alt={`Image ${index + 1}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className="h-8 w-8" 
                      onClick={() => downloadImage(image)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className="h-8 w-8" 
                      onClick={() => window.open(image, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="border-t p-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => {
            const a = document.createElement('a');
            a.href = images[0];
            a.target = '_blank';
            a.click();
          }}
          className="w-full gap-2"
        >
          <ExternalLink className="w-3 h-3" />
          Open First Image in New Tab
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ImagesView;
