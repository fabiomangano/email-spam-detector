import { useState } from "react";
import { useNavigate } from "react-router";
import type { ParsedData, TabType, PipelineResult } from "../types/email";
import { useAnalysis } from "../contexts/AnalysisContext";

interface UploadResponse {
  filename: string;
  message?: string;
}

const API_BASE_URL = "http://localhost:3000";

export function useEmailUpload() {
  const navigate = useNavigate();
  const { setAnalysisResult } = useAnalysis();
  
  const [textAreaValue, setTextAreaValue] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedFilename, setUploadedFilename] = useState<string | null>(null);
  const [parsedData, setParsedData] = useState<ParsedData | null>(null);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("gallery");
  const [error, setError] = useState<string | null>(null);

  const handleClear = () => {
    setTextAreaValue("");
    setUploadedFile(null);
    setUploadedFilename(null);
    setParsedData(null);
    setAnalysisResult(null);
    setError(null);
  };

  const handleUpload = async () => {
    if (!textAreaValue.trim() && !uploadedFile) {
      setError("Nessun contenuto da caricare.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let response: Response;
      
      if (activeTab === "messages" && uploadedFile) {
        const formData = new FormData();
        formData.append("file", uploadedFile);
        
        response = await fetch(`${API_BASE_URL}/upload/file`, {
          method: "POST",
          body: formData,
        });
      } else if (activeTab === "gallery" && textAreaValue.trim()) {
        response = await fetch(`${API_BASE_URL}/upload/text`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: textAreaValue }),
        });
      } else {
        throw new Error("Nessun contenuto valido da caricare.");
      }

      if (!response.ok) {
        throw new Error(`Errore HTTP: ${response.status}`);
      }

      const result: UploadResponse = await response.json();
      setUploadedFilename(result.filename);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Errore sconosciuto durante l'upload";
      setError(errorMessage);
      console.error("Errore upload:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleParse = async () => {
    if (!uploadedFilename) {
      setError("Nessun file disponibile da analizzare.");
      return;
    }

    setError(null);
    
    try {
      const response = await fetch(
        `${API_BASE_URL}/parse/${encodeURIComponent(uploadedFilename)}`
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData?.error || "Errore nel parsing");
      }
      
      const data: ParsedData = await response.json();
      setParsedData(data);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Errore sconosciuto durante il parsing";
      setError(errorMessage);
      console.error("Errore durante il parsing:", err);
    }
  };

  const handleAnalyze = async () => {
    if (!uploadedFilename) {
      setError("Nessun file disponibile da analizzare.");
      return;
    }

    setAnalyzing(true);
    setError(null);
    
    try {
      const response = await fetch(
        `${API_BASE_URL}/pipeline/${encodeURIComponent(uploadedFilename)}`
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData?.error || "Errore nell'analisi");
      }
      
      const data: PipelineResult = await response.json();
      
      // Salva i risultati nel context globale
      setAnalysisResult(data);
      
      // Imposta anche i dati di parsing se presenti
      if (data.details?.parsing) {
        setParsedData(data.details.parsing);
      }
      
      // Naviga alla pagina Risk per mostrare i risultati
      navigate('/risk');
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Errore sconosciuto durante l'analisi";
      setError(errorMessage);
      console.error("Errore durante l'analisi:", err);
    } finally {
      setAnalyzing(false);
    }
  };

  return {
    // State
    textAreaValue,
    uploadedFile,
    uploadedFilename,
    parsedData,
    loading,
    analyzing,
    activeTab,
    error,
    
    // Actions
    setTextAreaValue,
    setUploadedFile,
    setActiveTab,
    handleClear,
    handleUpload,
    handleParse,
    handleAnalyze,
    
    // Computed
    canParse: Boolean(uploadedFilename),
    canAnalyze: Boolean(uploadedFilename),
  };
}