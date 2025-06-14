import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { PipelineResult } from '../types/email';

interface AnalysisContextType {
  analysisResult: PipelineResult | null;
  setAnalysisResult: (result: PipelineResult | null) => void;
}

const AnalysisContext = createContext<AnalysisContextType | undefined>(undefined);

export function AnalysisProvider({ children }: { children: ReactNode }) {
  const [analysisResult, setAnalysisResult] = useState<PipelineResult | null>(null);

  return (
    <AnalysisContext.Provider value={{ analysisResult, setAnalysisResult }}>
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