import {
  Alert,
  Grid,
  Stack,
  Title,
  Text,
  Flex,
  Group,
  Button,
} from "@mantine/core";
import { useEffect } from "react";
import { IconShield } from "@tabler/icons-react";
import { useEmailUpload } from "../hooks/useEmailUpload";
import { EmailInputPanel } from "../components/EmailInputPanel";
import { ContentPanel } from "../components/ContentPanel";
import { useAnalysis } from "../contexts/AnalysisContext";

function Upload() {
  const { analysisResult } = useAnalysis();
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
                    "&[data-disabled]": {
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
              variant="filled"
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
            variant="outline"
            title="Error"
            withCloseButton
            onClose={() => setError(null)}
            styles={{
              root: {
                borderColor: "#ef4444",
                backgroundColor: "transparent",
              },
              title: {
                color: "#ef4444",
              },
              body: {
                color: "#ef4444",
              },
              closeButton: {
                color: "#ef4444",
                '&:hover': {
                  backgroundColor: "#fef2f2",
                },
              },
            }}
          >
            {error}
          </Alert>
        )}

        {/* Layout con sidebar Input a sinistra e Content centrale */}
        <Grid style={{ flex: 1, height: 0 }}>
          <Grid.Col span={{ base: 12, lg: 3 }} style={{ display: "flex" }}>
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
          </Grid.Col>

          <Grid.Col span={{ base: 12, lg: 9 }} style={{ display: "flex" }}>
            <ContentPanel
              parsedData={parsedData}
              onAnalyze={handleAnalyze}
              analyzing={analyzing}
              canAnalyze={canAnalyze}
              onParse={handleParse}
              canParse={canParse}
            />
          </Grid.Col>
        </Grid>
      </Stack>
    </div>
  );
}

export default Upload;
