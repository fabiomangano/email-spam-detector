import { useNavigate } from "react-router";
import type { PipelineResult, ParsedData } from "../types/email";
import { useAnalysis } from "../contexts/AnalysisContext";

interface UploadResponse {
  filename: string;
  message?: string;
}

const API_BASE_URL = "http://localhost:3000/api";

export function useEmailUpload() {
  const navigate = useNavigate();
  const { 
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
  } = useAnalysis();

  const handleClear = () => {
    setTextAreaValue("");
    setUploadedFile(null);
    setUploadedFilename(null);
    setParsedData(null);
    setError(null);
  };

  const handleFullClear = () => {
    setTextAreaValue("");
    setUploadedFile(null);
    setUploadedFilename(null);
    setParsedData(null);
    setAnalysisResult(null);
    setError(null);
    setLoading(false);
    setAnalyzing(false);
  };

  const handleUpload = async () => {
    if (!textAreaValue.trim() && !uploadedFile) {
      setError("Nessun contenuto da caricare.");
      return null;
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
      return result.filename;
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Errore sconosciuto durante l'upload";
      setError(errorMessage);
      console.error("Errore upload:", err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const handleParse = async (filename?: string) => {
    const fileToUse = filename || uploadedFilename;
    if (!fileToUse) {
      setError("Nessun file disponibile da analizzare.");
      return;
    }

    setError(null);
    
    try {
      const response = await fetch(
        `${API_BASE_URL}/parse/${encodeURIComponent(fileToUse)}`
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

      console.log('response', response)
      
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
      
      // Naviga alla pagina Report per mostrare i risultati
      navigate('/report');
      
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
    setError,
    setParsedData,
    handleClear,
    handleFullClear,
    handleUpload,
    handleParse,
    handleAnalyze,
    
    // Computed
    canParse: Boolean(uploadedFilename),
    canAnalyze: Boolean(parsedData && !error),
  };
}