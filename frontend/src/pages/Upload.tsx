import { Alert, Container, Grid, Stack, Title, Text, Stepper } from "@mantine/core";
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

  return (
    <Container size="xl" h="100%" py="md">
      <Stack gap="lg" h="100%">
        {/* Header con titolo e stepper */}
        <Stack gap="md">
          <div>
            <Title order={1} size="h2" mb="xs">
              Email Security Analysis
            </Title>
            <Text c="dimmed" size="sm">
              Upload an email to analyze its security and detect potential threats
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
        
        {/* Layout principale responsive */}
        <Grid h="100%" style={{ flex: 1 }}>
          <Grid.Col span={{ base: 12, lg: 6 }} h="60vh">
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
          
          <Grid.Col span={{ base: 12, lg: 6 }} h="60vh">
            <ContentPanel 
              parsedData={parsedData}
              onAnalyze={handleAnalyze}
              analyzing={analyzing}
              canAnalyze={canAnalyze}
            />
          </Grid.Col>
        </Grid>
      </Stack>
    </Container>
  );
}

export default Upload;
