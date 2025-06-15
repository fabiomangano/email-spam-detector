import {
  Alert,
  Grid,
  Stack,
  Title,
  Text,
  Stepper,
  Card,
  Flex,
  Group,
  Button,
} from "@mantine/core";
import { useEffect } from "react";
import "../stepper.css";
import { IconUpload, IconEye, IconShield } from "@tabler/icons-react";
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

  // Determina lo step attuale del workflow
  const getCurrentStep = () => {
    if (analyzing) return 2;
    if (analysisResult) return 2; // Se l'analisi è completata, mostra step 2 completato
    if (parsedData) return 1;
    if (textAreaValue.trim() || uploadedFile) return 0;
    return 0;
  };

  return (
    <div style={{ padding: "40px", height: "100%" }}>
      <Stack gap="lg">
        {/* Header con titolo e stepper */}
        <Stack gap="md">
          <div>
            <Title order={1} size="h2" mb="xs">
              Email Security Analysis
            </Title>
            <Text c="dimmed" size="sm">
              Upload an email to analyze its security and detect potential
              threats
            </Text>
          </div>

          <Stepper
            active={getCurrentStep()}
            size="sm"
            iconSize={32}
            completedIcon={<IconUpload size={18} />}
          >
            <Stepper.Step
              icon={<IconUpload size={18} />}
              label="Upload"
              description="Provide email content"
            />
            <Stepper.Step
              icon={<IconEye size={18} />}
              label="Parse"
              description="Extract email data"
            />
            <Stepper.Step
              icon={<IconShield size={18} />}
              label="Analyze"
              description="Security assessment"
            />
          </Stepper>
        </Stack>

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

        <Card py="sm">
          <Flex justify="space-between" align="center">
            <Title order={2} size="h3">
              Email
            </Title>
            <Group gap="sm">
              {parsedData && (
                <Button
                  variant="outline"
                  size="sm"
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
                size="sm"
                onClick={handleAnalyze}
                disabled={!canAnalyze}
                loading={analyzing}
                leftSection={<IconShield size={16} />}
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
        </Card>

        {/* Layout principale responsive */}
        <Grid h="100%" style={{ flex: 1 }}>
          <Grid.Col span={{ base: 12, lg: 6 }} h="63vh">
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
            />
          </Grid.Col>

          <Grid.Col span={{ base: 12, lg: 6 }} h="63vh">
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
