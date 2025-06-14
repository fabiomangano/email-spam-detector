import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { PipelineResult, ParsedData, TabType } from '../types/email';

interface AnalysisContextType {
  analysisResult: PipelineResult | null;
  setAnalysisResult: (result: PipelineResult | null) => void;
  // Upload state
  textAreaValue: string;
  setTextAreaValue: (value: string) => void;
  uploadedFile: File | null;
  setUploadedFile: (file: File | null) => void;
  uploadedFilename: string | null;
  setUploadedFilename: (filename: string | null) => void;
  parsedData: ParsedData | null;
  setParsedData: (data: ParsedData | null) => void;
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  error: string | null;
  setError: (error: string | null) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  analyzing: boolean;
  setAnalyzing: (analyzing: boolean) => void;
}

const AnalysisContext = createContext<AnalysisContextType | undefined>(undefined);

export function AnalysisProvider({ children }: { children: ReactNode }) {
  const [analysisResult, setAnalysisResult] = useState<PipelineResult | null>(null);
  
  // Upload state
  const [textAreaValue, setTextAreaValue] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedFilename, setUploadedFilename] = useState<string | null>(null);
  const [parsedData, setParsedData] = useState<ParsedData | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>("gallery");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  return (
    <AnalysisContext.Provider value={{ 
      analysisResult, 
      setAnalysisResult,
      textAreaValue,
      setTextAreaValue,
      uploadedFile,
      setUploadedFile,
      uploadedFilename,
      setUploadedFilename,
      parsedData,
      setParsedData,
      activeTab,
      setActiveTab,
      error,
      setError,
      loading,
      setLoading,
      analyzing,
      setAnalyzing
    }}>
      {children}
    </AnalysisContext.Provider>
  );
}

export function useAnalysis() {
  const context = useContext(AnalysisContext);
  if (context === undefined) {
    throw new Error('useAnalysis must be used within an AnalysisProvider');
  }
  return context;
}