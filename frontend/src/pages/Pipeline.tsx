import React, { useState, useEffect } from 'react';
import {
  Container,
  Title,
  Card,
  Group,
  Button,
  Stack,
  NumberInput,
  Text,
  Divider,
  Grid,
  Alert,
  LoadingOverlay,
  Tabs,
  ScrollArea,
  ActionIcon,
  Tooltip,
  Flex,
  ThemeIcon,
  FileInput,
  Badge,
} from '@mantine/core';
import { IconSettings, IconDeviceFloppy, IconRestore, IconInfoCircle, IconBrain, IconUpload, IconFileZip, IconProgress, IconPlayerPlay, IconCheck, IconX } from '@tabler/icons-react';

interface SpamDetectionConfig {
  scoring: {
    riskLevels: {
      low: number;
      medium: number;
    };
    weights: {
      technical: number;
      nlp: number;
    };
  };
  technical: {
    penalties: {
      bodyLength: { short: number; veryShort: number };
      links: { excessive: number; highRatio: number };
      images: { excessive: number; heavy: number };
      tracking: { hasTrackingPixel: number };
      attachments: { hasAttachments: number; excessive: number };
      authentication: { spfFail: number; spfSoftfail: number; dkimFail: number; dmarcFail: number };
      domains: { excessive: number; externalExcessive: number };
      headers: { replyToDiffers: number; missingDate: number; excessiveReceived: number; suspiciousXMailer: number };
      sender: { fromNameSuspicious: number; fromDomainDisposable: number; sentToMultiple: number };
      campaign: { campaignIdentifier: number; feedbackLoopHeader: number };
      text: { uppercaseExcessive: number; excessiveExclamations: number; urgencyWords: number; electionTerms: number };
      obfuscation: { obfuscatedText: number; linkDisplayMismatch: number; shortenedUrls: number; encodedUrls: number };
      mime: { mixedContentTypes: number; nestedMultipart: number; boundaryAnomaly: number; fakeMultipartAlternative: number };
      spam: { financialPromises: number; nonStandardPorts: number; suspiciousDomains: number; mailingListSpam: number; spammySubject: number; suspiciousFromName: number; repeatedLinks: number };
    };
    thresholds: {
      bodyLength: { short: number; veryShort: number };
      links: { excessive: number; highRatio: number };
      images: { excessive: number; heavyCount: number; heavyTextLimit: number };
      domains: { excessive: number; externalExcessive: number };
      headers: { excessiveReceived: number };
      text: { uppercaseRatio: number; linkToImageRatio: number };
      mime: { boundaryMaxLength: number };
    };
  };
  nlp: {
    multipliers: {
      toxicity: number;
      sentiment: { negative: number; positive: number };
      spamWords: number;
    };
    thresholds: {
      toxicity: { low: number; medium: number };
      sentiment: { negative: number; positive: number };
      spamWordRatio: number;
    };
  };
}

const Pipeline: React.FC = () => {
  const [config, setConfig] = useState<SpamDetectionConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  
  // Model training state
  const [spamFile, setSpamFile] = useState<File | null>(null);
  const [hamFile, setHamFile] = useState<File | null>(null);
  
  // Handle file uploads with notifications
  const handleSpamFileChange = (file: File | null) => {
    setSpamFile(file);
    if (file) {
      setNotification({ type: 'success', message: `Spam file uploaded: ${file.name}` });
    }
  };
  
  const handleHamFileChange = (file: File | null) => {
    setHamFile(file);
    if (file) {
      setNotification({ type: 'success', message: `Ham file uploaded: ${file.name}` });
    }
  };
  const [isTraining, setIsTraining] = useState(false);
  const [trainingStatus, setTrainingStatus] = useState<'idle' | 'uploading' | 'training' | 'completed' | 'error'>('idle');
  const [trainingMessage, setTrainingMessage] = useState('');

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const response = await fetch('/api/config');
      if (!response.ok) throw new Error('Failed to load configuration');
      const data = await response.json();
      setConfig(data);
    } catch (error) {
      setNotification({ type: 'error', message: 'Failed to load configuration' });
    } finally {
      setLoading(false);
    }
  };

  const saveConfig = async () => {
    if (!config) return;

    setSaving(true);
    try {
      const response = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
      }
      
      setNotification({ type: 'success', message: 'Configuration saved successfully' });
    } catch (error) {
      setNotification({ type: 'error', message: 'Failed to save configuration' });
    } finally {
      setSaving(false);
    }
  };

  const resetConfig = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/config/reset', { method: 'POST' });
      if (!response.ok) throw new Error('Failed to reset configuration');
      await loadConfig();
      setNotification({ type: 'success', message: 'Configuration reset to default values' });
    } catch (error) {
      setNotification({ type: 'error', message: 'Failed to reset configuration' });
    }
  };

  const updateConfig = (path: string, value: number) => {
    if (!config) return;
    
    const newConfig = { ...config };
    const keys = path.split('.');
    let current: any = newConfig;
    
    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]];
    }
    
    current[keys[keys.length - 1]] = value;
    setConfig(newConfig);
  };

  // Model training functions
  const startTraining = async () => {

    setIsTraining(true);
    setTrainingStatus('uploading');
    setTrainingMessage('Starting training process...');

    try {
      const formData = new FormData();
      if (spamFile) formData.append('spam_file', spamFile);
      if (hamFile) formData.append('ham_file', hamFile);

      const response = await fetch('/api/train-model', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to start training');
      }

      const result = await response.json();
      const trainingId = result.training_id;

      // Start polling for progress
      pollTrainingProgress(trainingId);

    } catch (error) {
      setTrainingStatus('error');
      setTrainingMessage('Failed to start training');
      setIsTraining(false);
    }
  };

  const pollTrainingProgress = async (trainingId: string) => {
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/train-model/status/${trainingId}`);
        if (!response.ok) throw new Error('Failed to get training status');
        
        const status = await response.json();
        console.log('Training status received:', status); // Debug log
        
        setTrainingMessage(status.message || 'Training in progress...');
        
        if (status.status === 'completed') {
          setTrainingStatus('completed');
          setTrainingMessage('Model training completed successfully!');
          setIsTraining(false);
          clearInterval(pollInterval);
        } else if (status.status === 'error') {
          setTrainingStatus('error');
          setTrainingMessage(status.error || 'Training failed');
          setIsTraining(false);
          clearInterval(pollInterval);
        }
      } catch (error) {
        setTrainingStatus('error');
        setTrainingMessage('Failed to get training status');
        setIsTraining(false);
        clearInterval(pollInterval);
      }
    }, 500); // Poll every 500ms for better responsiveness
  };

  const resetTraining = () => {
    setSpamFile(null);
    setHamFile(null);
    setIsTraining(false);
    setTrainingStatus('idle');
    setTrainingMessage('');
    setNotification({ type: 'success', message: 'Training data cleared' });
  };

  const getTrainingStatusBadge = () => {
    switch (trainingStatus) {
      case 'idle':
        return <Badge color="gray" variant="light">Ready</Badge>;
      case 'uploading':
        return <Badge color="blue" variant="light">Uploading</Badge>;
      case 'training':
        return <Badge color="yellow" variant="light">Training</Badge>;
      case 'completed':
        return <Badge color="green" variant="light">Completed</Badge>;
      case 'error':
        return <Badge color="red" variant="light">Error</Badge>;
      default:
        return <Badge color="gray" variant="light">Unknown</Badge>;
    }
  };

  if (loading) {
    return (
      <Container size="lg" style={{ position: 'relative', minHeight: '400px' }}>
        <LoadingOverlay visible />
      </Container>
    );
  }

  if (!config) {
    return (
      <Container size="lg">
        <Title order={2}>Configuration</Title>
        <Text color="red">Failed to load configuration</Text>
      </Container>
    );
  }

  return (
    <Container size="lg">
      <style>
        {`
          .config-tabs [data-active] {
            background-color: #262626 !important;
            color: #ffffff !important;
            border: 1px solid #262626 !important;
            font-weight: 600 !important;
          }
          .config-tabs .mantine-Tabs-tab:not([data-active]) {
            background-color: #ffffff !important;
            color: #525252 !important;
            border: 1px solid #d4d4d4 !important;
            font-weight: 500 !important;
          }
          .config-tabs .mantine-Tabs-tab:hover:not([data-active]) {
            background-color: #f5f5f5 !important;
          }
        `}
      </style>
      <Flex justify="space-between" align="center" mb="xl">
        <Group gap="md" align="flex-start">
          <ThemeIcon
            size={48}
            radius="md"
            color="green"
            style={{
              backgroundColor: 'var(--mantine-color-green-0)',
              color: 'var(--mantine-color-green-6)',
            }}
          >
            <IconSettings size={24} />
          </ThemeIcon>
          <div>
            <Title order={1} size="h2" mb="xs">
              Pipeline Configuration
            </Title>
            <Text c="dimmed" size="sm">
              Configure spam detection pipeline parameters, thresholds, and scoring weights
            </Text>
          </div>
        </Group>
        <Group gap="sm">
          <Button
            variant="outline"
            color="red"
            size="xs"
            leftSection={<IconRestore size={14} />}
            onClick={resetConfig}
            styles={{
              root: {
                borderColor: "#ef4444",
                color: "#ef4444",
                backgroundColor: "#ffffff",
                "&:hover": {
                  backgroundColor: "#fef2f2",
                },
              },
            }}
          >
            Reset to Default
          </Button>
          <Button
            variant="filled"
            size="xs"
            leftSection={<IconDeviceFloppy size={14} />}
            onClick={saveConfig}
            loading={saving}
            styles={{
              root: {
                backgroundColor: "#262626",
                color: "#ffffff",
                "&:hover": {
                  backgroundColor: "#404040",
                },
              },
            }}
          >
            Save Configuration
          </Button>
        </Group>
      </Flex>

      {notification && (
        <Alert
          variant="light"
          title={notification.type === 'success' ? 'Success' : 'Error'}
          withCloseButton
          onClose={() => setNotification(null)}
          mb="md"
          styles={{
            root: {
              backgroundColor: notification.type === 'success' ? '#f0fdf4' : '#fef2f2',
              borderColor: notification.type === 'success' ? '#22c55e' : '#ef4444',
              borderWidth: '1px',
              borderStyle: 'solid',
            },
            title: {
              color: notification.type === 'success' ? '#15803d' : '#dc2626',
            },
            body: {
              color: notification.type === 'success' ? '#166534' : '#991b1b',
            },
            closeButton: {
              color: notification.type === 'success' ? '#15803d' : '#dc2626',
              '&:hover': {
                backgroundColor: notification.type === 'success' ? '#dcfce7' : '#fee2e2',
              },
            },
          }}
        >
          {notification.message}
        </Alert>
      )}

      <Tabs 
        defaultValue="scoring"
        variant="pills"
        className="config-tabs"
      >
        <Tabs.List mb="md">
          <Tabs.Tab value="scoring">Scores & Thresholds</Tabs.Tab>
          <Tabs.Tab value="technical">Technical Penalties</Tabs.Tab>
          <Tabs.Tab value="thresholds">Technical Thresholds</Tabs.Tab>
          <Tabs.Tab value="nlp">NLP Configuration</Tabs.Tab>
          <Tabs.Tab value="training" leftSection={<IconBrain size={16} />}>Model Training</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="scoring">
          <Card withBorder>
            <Card.Section withBorder inheritPadding py="xs">
              <Group justify="space-between">
                <Text fw={500}>Score Configuration</Text>
                <Tooltip label="Configure weights for final score calculation and risk thresholds">
                  <ActionIcon variant="subtle" size="sm">
                    <IconInfoCircle size={16} />
                  </ActionIcon>
                </Tooltip>
              </Group>
            </Card.Section>

            <Stack gap="md" mt="md">
              <Text size="sm" fw={500}>Module Weights (must sum to 1.0)</Text>
              <Grid>
                <Grid.Col span={6}>
                  <NumberInput
                    label="Technical Module Weight"
                    value={config.scoring.weights.technical}
                    onChange={(value) => updateConfig('scoring.weights.technical', value as number)}
                    min={0}
                    max={1}
                    step={0.1}
                    precision={1}
                  />
                </Grid.Col>
                <Grid.Col span={6}>
                  <NumberInput
                    label="NLP Module Weight"
                    value={config.scoring.weights.nlp}
                    onChange={(value) => updateConfig('scoring.weights.nlp', value as number)}
                    min={0}
                    max={1}
                    step={0.1}
                    precision={1}
                  />
                </Grid.Col>
              </Grid>

              <Divider />

              <Text size="sm" fw={500}>Risk Level Thresholds</Text>
              <Grid>
                <Grid.Col span={6}>
                  <NumberInput
                    label="Low Risk Threshold"
                    value={config.scoring.riskLevels.low}
                    onChange={(value) => updateConfig('scoring.riskLevels.low', value as number)}
                    min={0}
                    max={1}
                    step={0.1}
                    precision={1}
                    description="Below this threshold = low risk"
                  />
                </Grid.Col>
                <Grid.Col span={6}>
                  <NumberInput
                    label="Medium Risk Threshold"
                    value={config.scoring.riskLevels.medium}
                    onChange={(value) => updateConfig('scoring.riskLevels.medium', value as number)}
                    min={0}
                    max={1}
                    step={0.1}
                    precision={1}
                    description="Above this threshold = high risk"
                  />
                </Grid.Col>
              </Grid>
            </Stack>
          </Card>
        </Tabs.Panel>

        <Tabs.Panel value="technical">
          <ScrollArea style={{ height: 'calc(100vh - 300px)' }}>
            <Stack gap="md">
              {Object.entries(config.technical.penalties).map(([category, penalties]) => (
                <Card key={category} withBorder>
                  <Card.Section withBorder inheritPadding py="xs">
                    <Text fw={500} tt="capitalize">{category.replace(/([A-Z])/g, ' $1').trim()}</Text>
                  </Card.Section>

                  <Grid mt="md">
                    {Object.entries(penalties as Record<string, number>).map(([penalty, value]) => (
                      <Grid.Col key={penalty} span={6}>
                        <NumberInput
                          label={penalty.replace(/([A-Z])/g, ' $1').trim()}
                          value={value}
                          onChange={(newValue) => updateConfig(`technical.penalties.${category}.${penalty}`, newValue as number)}
                          min={0}
                          max={10}
                          step={1}
                        />
                      </Grid.Col>
                    ))}
                  </Grid>
                </Card>
              ))}
            </Stack>
          </ScrollArea>
        </Tabs.Panel>

        <Tabs.Panel value="thresholds">
          <ScrollArea style={{ height: 'calc(100vh - 300px)' }}>
            <Stack gap="md">
              {Object.entries(config.technical.thresholds).map(([category, thresholds]) => (
                <Card key={category} withBorder>
                  <Card.Section withBorder inheritPadding py="xs">
                    <Text fw={500} tt="capitalize">{category.replace(/([A-Z])/g, ' $1').trim()}</Text>
                  </Card.Section>

                  <Grid mt="md">
                    {Object.entries(thresholds as Record<string, number>).map(([threshold, value]) => (
                      <Grid.Col key={threshold} span={6}>
                        <NumberInput
                          label={threshold.replace(/([A-Z])/g, ' $1').trim()}
                          value={value}
                          onChange={(newValue) => updateConfig(`technical.thresholds.${category}.${threshold}`, newValue as number)}
                          min={0}
                          step={threshold.includes('Ratio') ? 0.01 : 1}
                          precision={threshold.includes('Ratio') ? 2 : 0}
                        />
                      </Grid.Col>
                    ))}
                  </Grid>
                </Card>
              ))}
            </Stack>
          </ScrollArea>
        </Tabs.Panel>

        <Tabs.Panel value="nlp">
          <ScrollArea style={{ height: 'calc(100vh - 300px)' }}>
            <Stack gap="md">
              <Card withBorder>
                <Card.Section withBorder inheritPadding py="xs">
                  <Text fw={500}>NLP Multipliers</Text>
                </Card.Section>

                <Grid mt="md">
                  <Grid.Col span={4}>
                    <NumberInput
                      label="Toxicity Multiplier"
                      value={config.nlp.multipliers.toxicity}
                      onChange={(value) => updateConfig('nlp.multipliers.toxicity', value as number)}
                      min={0}
                      step={0.1}
                      precision={1}
                    />
                  </Grid.Col>
                  <Grid.Col span={4}>
                    <NumberInput
                      label="Negative Sentiment"
                      value={config.nlp.multipliers.sentiment.negative}
                      onChange={(value) => updateConfig('nlp.multipliers.sentiment.negative', value as number)}
                      min={0}
                      step={0.1}
                      precision={1}
                    />
                  </Grid.Col>
                  <Grid.Col span={4}>
                    <NumberInput
                      label="Positive Sentiment"
                      value={config.nlp.multipliers.sentiment.positive}
                      onChange={(value) => updateConfig('nlp.multipliers.sentiment.positive', value as number)}
                      min={0}
                      step={0.1}
                      precision={1}
                    />
                  </Grid.Col>
                  <Grid.Col span={4}>
                    <NumberInput
                      label="Spam Words"
                      value={config.nlp.multipliers.spamWords}
                      onChange={(value) => updateConfig('nlp.multipliers.spamWords', value as number)}
                      min={0}
                      step={0.1}
                      precision={1}
                    />
                  </Grid.Col>
                </Grid>
              </Card>

              <Card withBorder>
                <Card.Section withBorder inheritPadding py="xs">
                  <Text fw={500}>NLP Thresholds</Text>
                </Card.Section>

                <Grid mt="md">
                  <Grid.Col span={6}>
                    <NumberInput
                      label="Low Toxicity Threshold"
                      value={config.nlp.thresholds.toxicity.low}
                      onChange={(value) => updateConfig('nlp.thresholds.toxicity.low', value as number)}
                      min={0}
                      max={1}
                      step={0.1}
                      precision={1}
                    />
                  </Grid.Col>
                  <Grid.Col span={6}>
                    <NumberInput
                      label="Medium Toxicity Threshold"
                      value={config.nlp.thresholds.toxicity.medium}
                      onChange={(value) => updateConfig('nlp.thresholds.toxicity.medium', value as number)}
                      min={0}
                      max={1}
                      step={0.1}
                      precision={1}
                    />
                  </Grid.Col>
                  <Grid.Col span={6}>
                    <NumberInput
                      label="Negative Sentiment Threshold"
                      value={config.nlp.thresholds.sentiment.negative}
                      onChange={(value) => updateConfig('nlp.thresholds.sentiment.negative', value as number)}
                      min={-1}
                      max={1}
                      step={0.1}
                      precision={1}
                    />
                  </Grid.Col>
                  <Grid.Col span={6}>
                    <NumberInput
                      label="Positive Sentiment Threshold"
                      value={config.nlp.thresholds.sentiment.positive}
                      onChange={(value) => updateConfig('nlp.thresholds.sentiment.positive', value as number)}
                      min={-1}
                      max={1}
                      step={0.1}
                      precision={1}
                    />
                  </Grid.Col>
                  <Grid.Col span={6}>
                    <NumberInput
                      label="Spam Word Ratio Threshold"
                      value={config.nlp.thresholds.spamWordRatio}
                      onChange={(value) => updateConfig('nlp.thresholds.spamWordRatio', value as number)}
                      min={0}
                      max={1}
                      step={0.01}
                      precision={2}
                    />
                  </Grid.Col>
                </Grid>
              </Card>
            </Stack>
          </ScrollArea>
        </Tabs.Panel>

        <Tabs.Panel value="training">
          <Stack gap="lg">
            {/* Training Status Card */}
            <Card withBorder>
              <Card.Section withBorder inheritPadding py="xs">
                <Text fw={500}>Model Training Status</Text>
              </Card.Section>
              <Stack gap="md" p="lg">
                {isTraining && (
                  <Group justify="center" align="center" gap="sm">
                    <Text size="sm" fw={500} c="blue">
                      Status: {trainingMessage || 'Training in progress...'}
                    </Text>
                  </Group>
                )}
                {!isTraining && trainingStatus === 'idle' && (
                  <Text size="sm" c="dimmed" ta="center">
                    Ready to start model training. Optionally upload new training data or use existing datasets.
                  </Text>
                )}
                {!isTraining && trainingStatus === 'completed' && (
                  <Group justify="center">
                    <IconCheck size={24} color="green" />
                    <Text size="sm" c="green" fw={500}>
                      Model training completed successfully!
                    </Text>
                  </Group>
                )}
                {!isTraining && trainingStatus === 'error' && (
                  <Group justify="center">
                    <IconX size={24} color="red" />
                    <Text size="sm" c="red" fw={500}>
                      Training failed: {trainingMessage}
                    </Text>
                  </Group>
                )}
              </Stack>
            </Card>

            {/* File Upload Cards */}
            <Grid>
              <Grid.Col span={6}>
                <Card withBorder>
                  <Card.Section withBorder inheritPadding py="xs">
                    <Group>
                      <IconFileZip size={20} color="red" />
                      <Text fw={500}>Spam Emails</Text>
                    </Group>
                  </Card.Section>
                  <Stack gap="md" p="lg">
                    <FileInput
                      label="Upload Spam Training Data"
                      description="ZIP file containing spam email samples"
                      placeholder="Select ZIP file..."
                      accept=".zip"
                      value={spamFile}
                      onChange={handleSpamFileChange}
                      leftSection={<IconUpload size={16} />}
                      disabled={isTraining}
                      styles={{
                        input: {
                          borderColor: spamFile ? '#22c55e' : undefined,
                        },
                      }}
                    />
                    {spamFile && (
                      <Group gap="xs">
                        <IconCheck size={16} color="green" />
                        <Text size="sm" c="green">
                          {spamFile.name} ({(spamFile.size / 1024 / 1024).toFixed(1)} MB)
                        </Text>
                      </Group>
                    )}
                  </Stack>
                </Card>
              </Grid.Col>

              <Grid.Col span={6}>
                <Card withBorder>
                  <Card.Section withBorder inheritPadding py="xs">
                    <Group>
                      <IconFileZip size={20} color="green" />
                      <Text fw={500}>Ham Emails</Text>
                    </Group>
                  </Card.Section>
                  <Stack gap="md" p="lg">
                    <FileInput
                      label="Upload Ham Training Data"
                      description="ZIP file containing legitimate email samples"
                      placeholder="Select ZIP file..."
                      accept=".zip"
                      value={hamFile}
                      onChange={handleHamFileChange}
                      leftSection={<IconUpload size={16} />}
                      disabled={isTraining}
                      styles={{
                        input: {
                          borderColor: hamFile ? '#22c55e' : undefined,
                        },
                      }}
                    />
                    {hamFile && (
                      <Group gap="xs">
                        <IconCheck size={16} color="green" />
                        <Text size="sm" c="green">
                          {hamFile.name} ({(hamFile.size / 1024 / 1024).toFixed(1)} MB)
                        </Text>
                      </Group>
                    )}
                  </Stack>
                </Card>
              </Grid.Col>
            </Grid>

            {/* Training Controls */}
            <Card withBorder>
              <Card.Section withBorder inheritPadding py="xs">
                <Group justify="space-between">
                  <Text fw={500}>Training Controls</Text>
                  <Tooltip label="Start model training with uploaded data">
                    <ActionIcon variant="subtle" size="sm">
                      <IconInfoCircle size={16} />
                    </ActionIcon>
                  </Tooltip>
                </Group>
              </Card.Section>
              <Group justify="space-between" p="lg">
                <Text size="sm" c="dimmed">
                  Start the model training process. Upload new email datasets if available, or use existing data.
                  Training is asynchronous and progress will be monitored automatically.
                </Text>
                <Group gap="sm">
                  <Button
                    variant="outline"
                    color="gray"
                    size="sm"
                    onClick={resetTraining}
                    disabled={isTraining}
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
                    Reset
                  </Button>
                  <Button
                    variant="filled"
                    size="sm"
                    leftSection={<IconPlayerPlay size={16} />}
                    onClick={startTraining}
                    loading={isTraining}
                    styles={{
                      root: {
                        backgroundColor: "#262626",
                        color: "#ffffff",
                        "&:hover": {
                          backgroundColor: "#404040",
                        },
                        "&:disabled": {
                          backgroundColor: "#d1d5db",
                          color: "#9ca3af",
                        },
                      },
                    }}
                  >
                    {isTraining ? 'Training...' : 'Start Training'}
                  </Button>
                </Group>
              </Group>
            </Card>
          </Stack>
        </Tabs.Panel>
      </Tabs>
    </Container>
  );
};

export default Pipeline;