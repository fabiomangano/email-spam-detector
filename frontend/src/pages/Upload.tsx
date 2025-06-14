import { Alert } from "@mantine/core";
import { useEmailUpload } from "../hooks/useEmailUpload";
import { EmailInputPanel } from "../components/EmailInputPanel";
import { ContentPanel } from "../components/ContentPanel";


function Upload() {
  const {
    textAreaValue,
    uploadedFile,
    parsedData,
    loading,
    activeTab,
    error,
    setTextAreaValue,
    setUploadedFile,
    setActiveTab,
    handleClear,
    handleUpload,
    handleParse,
    canParse,
  } = useEmailUpload();

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        gap: "20px",
        height: "100%",
        flexDirection: "column",
      }}
    >
      {error && (
        <Alert color="red" mb="md">
          {error}
        </Alert>
      )}
      
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: "20px",
          height: "100%",
        }}
      >
        <EmailInputPanel
          textAreaValue={textAreaValue}
          uploadedFile={uploadedFile}
          activeTab={activeTab}
          loading={loading}
          onTextChange={setTextAreaValue}
          onFileUpload={setUploadedFile}
          onTabChange={setActiveTab}
          onClear={handleClear}
          onUpload={handleUpload}
          onParse={handleParse}
          canParse={canParse}
        />
        
        <ContentPanel parsedData={parsedData} />
      </div>
    </div>
  );
}

export default Upload;
