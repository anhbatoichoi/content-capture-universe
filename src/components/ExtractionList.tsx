
import React from 'react';
import { useExtraction } from '@/contexts/ExtractionContext';
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, CheckCircle, AlertCircle, Trash } from "lucide-react";
import { cn } from "@/lib/utils";

const ExtractionList: React.FC = () => {
  const { extractions, setSelectedExtraction, clearExtractions } = useExtraction();

  if (extractions.length === 0) {
    return (
      <Card className="h-full flex items-center justify-center text-center bg-muted/50">
        <CardContent className="pt-6">
          <p className="text-muted-foreground">
            No extractions yet. Click "Extract Content" to begin.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <CardContent className="flex-1 p-3 overflow-hidden">
        <div className="flex justify-between mb-2">
          <h3 className="text-sm font-medium">Recent Extractions</h3>
          {extractions.length > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-7 px-2" 
              onClick={clearExtractions}
            >
              <Trash className="h-3.5 w-3.5 mr-1" />
              <span className="text-xs">Clear All</span>
            </Button>
          )}
        </div>
        <ScrollArea className="h-[calc(100%-28px)]">
          <div className="space-y-2">
            {extractions.map(extraction => (
              <Button
                key={extraction.id}
                variant="outline"
                className={cn(
                  "w-full justify-start text-left h-auto p-3",
                  extraction.status === 'done' ? 'hover:border-secondary hover:bg-secondary/10' : '',
                  extraction.status === 'failed' ? 'hover:border-destructive hover:bg-destructive/10' : ''
                )}
                onClick={() => extraction.status === 'done' ? setSelectedExtraction(extraction) : null}
                disabled={extraction.status === 'pending'}
              >
                <div className="flex items-start gap-2 w-full">
                  <div className="mt-0.5">
                    {extraction.status === 'pending' && (
                      <div className="animate-spin">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                      </div>
                    )}
                    {extraction.status === 'done' && (
                      <CheckCircle className="h-4 w-4 text-secondary" />
                    )}
                    {extraction.status === 'failed' && (
                      <AlertCircle className="h-4 w-4 text-destructive" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-xs truncate">{extraction.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(extraction.timestamp).toLocaleTimeString()}
                    </div>
                    {extraction.status === 'pending' && (
                      <div className="w-full bg-muted rounded-full h-1 mt-2 overflow-hidden">
                        <div className="bg-primary h-1 rounded-full animate-pulse"></div>
                      </div>
                    )}
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default ExtractionList;
