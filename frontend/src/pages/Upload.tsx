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
import { IconUpload, IconEye, IconShield } from "@tabler/icons-react";
import { useEmailUpload } from "../hooks/useEmailUpload";
import { EmailInputPanel } from "../components/EmailInputPanel";
import { ContentPanel } from "../components/ContentPanel";

function Upload() {
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
    handleClear,
    handleFullClear,
    handleUpload,
    handleParse,
    handleAnalyze,
    canParse,
    canAnalyze,
  } = useEmailUpload();

  // Determina lo step attuale del workflow
  const getCurrentStep = () => {
    if (analyzing) return 2;
    if (parsedData) return 1;
    if (textAreaValue.trim() || uploadedFile) return 0;
    return 0;
  };

  const canClear =
    (activeTab === "gallery" && textAreaValue.trim() !== "") ||
    (activeTab === "messages" && uploadedFile !== null);

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
          <Alert color="red" title="Error" withCloseButton onClose={() => {}}>
            {error}
          </Alert>
        )}

        <Card py="sm">
          <Flex justify="space-between" align="center">
            <Title order={2} size="h3">
              Email
            </Title>
            <Group gap="sm">
              <Button
                variant="subtle"
                color="gray"
                size="sm"
                onClick={handleClear}
                disabled={!canClear}
              >
                Clear
              </Button>
              {parsedData && (
                <Button
                  variant="subtle"
                  color="red"
                  size="sm"
                  onClick={handleFullClear}
                >
                  New Analysis
                </Button>
              )}
              <Button
                variant="gradient"
                gradient={{ from: "red", to: "orange" }}
                size="sm"
                onClick={handleAnalyze}
                disabled={!canAnalyze}
                loading={analyzing}
                leftSection={<IconShield size={16} />}
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
