import {
  Alert,
  Stack,
  Title,
  Text,
  Flex,
  Group,
  Button,
  Modal,
} from "@mantine/core";
import { useEffect, useState } from "react";
import { IconShield, IconCloudUpload } from "@tabler/icons-react";
import { useEmailUpload } from "../hooks/useEmailUpload";
import { EmailInputPanel } from "../components/EmailInputPanel";
import { ContentPanel } from "../components/ContentPanel";
import { MetadataPanel } from "../components/MetadataPanel";
import { useAnalysis } from "../contexts/AnalysisContext";

function Upload() {
  const { analysisResult } = useAnalysis();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const {
    textAreaValue,
    uploadedFile,
    parsedData,
    loading,
    analyzing,
    activeTab,
    error,
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
    canParse,
    canAnalyze,
  } = useEmailUpload();

  // Ripristina parsedData se esiste analysisResult ma parsedData è null
  useEffect(() => {
    if (analysisResult?.details?.parsing && !parsedData) {
      setParsedData(analysisResult.details.parsing);
    }
  }, [analysisResult, parsedData, setParsedData]);

  return (
    <div style={{ padding: "20px", paddingBottom: "80px", height: "100vh", display: "flex", flexDirection: "column" }}>
      <Stack gap="lg" style={{ flex: 1, height: 0 }}>
        {/* Header con titolo e azioni */}
        <Flex justify="space-between" align="center" mb="lg">
          <div>
            <Title order={1} size="h2" mb="xs">
              Email Security Analysis
            </Title>
            <Text c="dimmed" size="sm">
              Upload an email to analyze its security and detect potential threats
            </Text>
          </div>
          
          <Group gap="sm">
            {parsedData && (
              <Button
                variant="outline"
                color="red"
                size="xs"
                onClick={handleFullClear}
                styles={{
                  root: {
                    borderColor: "#ef4444",
                    color: "#ef4444",
                    backgroundColor: "#ffffff",
                    "&:disabled": {
                      backgroundColor: "#ffffff !important",
                      borderColor: "#e5e5e5 !important",
                      color: "#a3a3a3 !important",
                    },
                    "&[dataDisabled]": {
                      backgroundColor: "#ffffff !important",
                      borderColor: "#e5e5e5 !important",
                      color: "#a3a3a3 !important",
                    },
                  },
                }}
              >
                New Analysis
              </Button>
            )}
            <Button
              variant="outline"
              color="gray"
              size="xs"
              onClick={() => setIsModalOpen(true)}
              leftSection={<IconCloudUpload size={14} />}
              styles={{
                root: {
                  borderColor: "#262626",
                  color: "#262626",
                  backgroundColor: "#ffffff",
                  "&:hover": {
                    backgroundColor: "#f9fafb",
                  },
                },
              }}
            >
              Upload
            </Button>
            <Button
              variant="filled"
              color="green"
              size="xs"
              onClick={handleAnalyze}
              disabled={!canAnalyze}
              loading={analyzing}
              leftSection={<IconShield size={14} />}
              styles={{
                root: {
                  backgroundColor: "#262626",
                  color: "#ffffff",
                  "&:disabled": {
                    backgroundColor: "#f5f5f5 !important",
                    borderColor: "#e5e5e5 !important",
                    color: "#a3a3a3 !important",
                  },
                },
              }}
            >
              {analyzing ? "Analyzing..." : "Analyze"}
            </Button>
          </Group>
        </Flex>

        {/* Alert per errori */}
        {error && (
          <Alert
            variant="filled"
            title="Error"
            withCloseButton
            onClose={() => setError(null)}
            styles={{
              root: {
                backgroundColor: "#ef4444",
                borderColor: "#ef4444",
              },
              title: {
                color: "#ffffff",
              },
              body: {
                color: "#ffffff",
              },
              closeButton: {
                color: "#ffffff",
                '&:hover': {
                  backgroundColor: "#dc2626",
                },
              },
            }}
          >
            {error}
          </Alert>
        )}

        {/* Content Area with Email Card and Metadata */}
        <div style={{ flex: 1, height: 0, display: "flex", gap: "16px" }}>
          {/* Email Card - 3/4 Width */}
          <div style={{ width: "75%" }}>
            <ContentPanel
              parsedData={parsedData}
              onAnalyze={handleAnalyze}
              analyzing={analyzing}
              canAnalyze={canAnalyze}
              onParse={handleParse}
              canParse={canParse}
            />
          </div>
          
          {/* Metadata Card - 1/4 Width */}
          <div style={{ width: "25%" }}>
            <MetadataPanel
              parsedData={parsedData}
              uploadedFile={uploadedFile}
              textAreaValue={textAreaValue}
            />
          </div>
        </div>

        {/* Modal per Input Panel */}
        <Modal
          opened={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Email Input"
          size="xl"
          centered
          styles={{
            body: {
              padding: 0,
            },
            header: {
              paddingBottom: "16px",
            },
          }}
          style={{
            maxHeight: "70vh",
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
            onUpload={async () => {
              const filename = await handleUpload();
              if (filename) {
                await handleParse(filename);
              }
              setIsModalOpen(false);
            }}
            onParse={handleParse}
            canParse={canParse}
          />
        </Modal>
      </Stack>
    </div>
  );
}

export default Upload;
