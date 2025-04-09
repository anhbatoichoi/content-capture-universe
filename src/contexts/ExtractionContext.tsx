
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiService } from '../services/apiService';

interface Extraction {
  id: string;
  status: 'pending' | 'done' | 'failed';
  title: string;
  content?: string;
  error?: string;
  timestamp: Date;
}

interface ExtractionContextType {
  extractions: Extraction[];
  addExtraction: (url: string, title: string, source?: string) => Promise<void>;
  refreshStatus: (id: string) => Promise<void>;
  clearExtractions: () => void;
  selectedExtraction: Extraction | null;
  setSelectedExtraction: (extraction: Extraction | null) => void;
}

const ExtractionContext = createContext<ExtractionContextType | undefined>(undefined);

export const useExtraction = () => {
  const context = useContext(ExtractionContext);
  if (!context) {
    throw new Error('useExtraction must be used within an ExtractionProvider');
  }
  return context;
};

export const ExtractionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [extractions, setExtractions] = useState<Extraction[]>([]);
  const [selectedExtraction, setSelectedExtraction] = useState<Extraction | null>(null);
  const [pollingIds, setPollingIds] = useState<Record<string, NodeJS.Timeout>>({});
  
  // Load extractions from storage on mount
  useEffect(() => {
    const loadExtractions = async () => {
      try {
        const stored = await chrome.storage.local.get('extractions');
        if (stored.extractions) {
          const parsed = JSON.parse(stored.extractions);
          // Convert timestamp strings back to Date objects
          setExtractions(
            parsed.map((ext: any) => ({
              ...ext,
              timestamp: new Date(ext.timestamp),
              // Ensure all required fields have fallback values
              id: ext.id || `fallback-${Date.now()}-${Math.random()}`,
              status: ext.status || 'failed',
              title: ext.title || 'Untitled Extraction'
            }))
          );
        }
      } catch (error) {
        console.error('Failed to load extractions:', error);
      }
    };
    
    loadExtractions();
  }, []);
  
  // Save extractions to storage whenever they change
  useEffect(() => {
    if (extractions.length > 0) {
      chrome.storage.local.set({
        extractions: JSON.stringify(extractions)
      });
    }
  }, [extractions]);
  
  // Clear all polling intervals on unmount
  useEffect(() => {
    return () => {
      Object.values(pollingIds).forEach(clearInterval);
    };
  }, [pollingIds]);
  
  const startPolling = useCallback((id: string) => {
    // Clear any existing polling for this ID
    if (pollingIds[id]) {
      clearInterval(pollingIds[id]);
    }
    
    // Start polling every 10 seconds
    const intervalId = setInterval(() => {
      refreshStatus(id);
    }, 10000) as unknown as NodeJS.Timeout;
    
    setPollingIds(prev => ({
      ...prev,
      [id]: intervalId
    }));
    
    // Initial check right away
    refreshStatus(id);
  }, [pollingIds]);
  
  const stopPolling = useCallback((id: string) => {
    if (pollingIds[id]) {
      clearInterval(pollingIds[id]);
      setPollingIds(prev => {
        const newPolling = { ...prev };
        delete newPolling[id];
        return newPolling;
      });
    }
  }, [pollingIds]);
  
  const addExtraction = useCallback(async (url: string, title: string, source?: string) => {
    try {
      const response = await apiService.extractContent({ url, title, source });
      
      if (!response || !response.request_id) {
        throw new Error('Invalid response from API: missing request_id');
      }
      
      const newExtraction: Extraction = {
        id: response.request_id,
        status: response.status || 'pending',
        title: title || 'Untitled Extraction',
        timestamp: new Date(),
      };
      
      setExtractions(prev => [newExtraction, ...prev]);
      
      // Start polling for this extraction
      startPolling(newExtraction.id);
      
    } catch (error) {
      console.error('Failed to add extraction:', error);
      throw error;
    }
  }, [startPolling]);
  
  const refreshStatus = useCallback(async (id: string) => {
    try {
      if (!id) {
        console.error('Invalid extraction ID for status refresh');
        return;
      }
      
      const response = await apiService.checkStatus(id);
      
      setExtractions(prev => 
        prev.map(ext => 
          ext.id === id 
            ? { 
                ...ext, 
                status: response.status || ext.status, 
                content: response.content || ext.content,
                error: response.error || ext.error
              } 
            : ext
        )
      );
      
      // Update selected extraction if it's the one we're refreshing
      if (selectedExtraction && selectedExtraction.id === id) {
        setSelectedExtraction(prev => prev ? {
          ...prev,
          status: response.status || prev.status,
          content: response.content || prev.content,
          error: response.error || prev.error
        } : null);
      }
      
      // If status is no longer pending, stop polling
      if (response.status !== 'pending') {
        stopPolling(id);
      }
      
    } catch (error) {
      console.error('Failed to refresh extraction status:', error);
    }
  }, [stopPolling, selectedExtraction]);
  
  const clearExtractions = useCallback(() => {
    // Stop all polling
    Object.keys(pollingIds).forEach(stopPolling);
    setExtractions([]);
    setSelectedExtraction(null);
    chrome.storage.local.remove('extractions');
  }, [pollingIds, stopPolling]);
  
  const value = {
    extractions,
    addExtraction,
    refreshStatus,
    clearExtractions,
    selectedExtraction,
    setSelectedExtraction
  };
  
  return (
    <ExtractionContext.Provider value={value}>
      {children}
    </ExtractionContext.Provider>
  );
};
