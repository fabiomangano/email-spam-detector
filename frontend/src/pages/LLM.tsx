import React, { useState, useEffect } from 'react';
import {
  Container,
  Title,
  Card,
  Group,
  Button,
  Stack,
  Text,
  Switch,
  Select,
  TextInput,
  PasswordInput,
  Alert,
  LoadingOverlay,
  Tabs,
  Grid,
  ActionIcon,
  Tooltip,
  Flex,
  Textarea,
  ThemeIcon,
} from '@mantine/core';
import { IconDeviceFloppy, IconRestore, IconInfoCircle, IconTestPipe, IconBrain, IconRefresh } from '@tabler/icons-react';

interface LLMConfig {
  providers: {
    openai: {
      enabled: boolean;
      model: string;
      apiKey?: string;
      temperature?: number;
    };
    anthropic: {
      enabled: boolean;
      model: string;
      apiKey?: string;
      temperature?: number;
    };
    local: {
      enabled: boolean;
      model: string;
      provider: string;
      endpoint?: string;
    };
  };
  activeProvider: 'openai' | 'anthropic' | 'local';
  systemPrompt?: string;
}

const LLM: React.FC = () => {
  const [config, setConfig] = useState<LLMConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      // Add timestamp to prevent caching
      const timestamp = new Date().getTime();
      const response = await fetch(`/api/llm/config?t=${timestamp}`, {
        cache: 'no-cache',
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      if (!response.ok) throw new Error('Failed to load LLM configuration');
      const data = await response.json();
      console.log('Loaded LLM config from backend:', data);
      // Use the configuration as returned from the backend
      setConfig(data);
    } catch (error) {
      console.error('Error loading LLM config:', error);
      setNotification({ type: 'error', message: 'Failed to load LLM configuration' });
    } finally {
      setLoading(false);
    }
  };

  const saveConfig = async () => {
    if (!config) return;

    setSaving(true);
    try {
      console.log('Saving LLM config:', config);
      const response = await fetch('/api/llm/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Save error response:', errorText);
        throw new Error(errorText);
      }
      
      const result = await response.json();
      console.log('Save result:', result);
      setNotification({ type: 'success', message: 'LLM configuration saved successfully' });
      
      // Reload config to ensure we have the latest from backend
      await loadConfig();
    } catch (error) {
      console.error('Save config error:', error);
      setNotification({ type: 'error', message: 'Failed to save LLM configuration' });
    } finally {
      setSaving(false);
    }
  };

  const testConnection = async () => {
    if (!config) return;

    setTesting(true);
    try {
      const response = await fetch('/api/llm/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: config.activeProvider }),
      });
      
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
      }
      
      setNotification({ type: 'success', message: 'Connection test successful' });
    } catch (error) {
      setNotification({ type: 'error', message: 'Connection test failed' });
    } finally {
      setTesting(false);
    }
  };

  const resetConfig = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/llm/config/reset', { method: 'POST' });
      if (!response.ok) throw new Error('Failed to reset LLM configuration');
      await loadConfig();
      setNotification({ type: 'success', message: 'LLM configuration reset to default values' });
    } catch (error) {
      setNotification({ type: 'error', message: 'Failed to reset LLM configuration' });
    }
  };

  const updateConfig = (path: string, value: any) => {
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
        <Title order={2}>LLM Configuration</Title>
        <Text color="red">Failed to load LLM configuration</Text>
      </Container>
    );
  }

  return (
    <Container size="lg">
      <style>
        {`
          .llm-tabs [data-active] {
            background-color: #262626 !important;
            color: #ffffff !important;
            border: 1px solid #262626 !important;
            font-weight: 600 !important;
          }
          .llm-tabs .mantine-Tabs-tab:not([data-active]) {
            background-color: #ffffff !important;
            color: #525252 !important;
            border: 1px solid #d4d4d4 !important;
            font-weight: 500 !important;
          }
          .llm-tabs .mantine-Tabs-tab:hover:not([data-active]) {
            background-color: #f5f5f5 !important;
          }
        `}
      </style>
      <Flex justify="space-between" align="center" mb="xl">
        <Group gap="md" align="flex-start">
          <ThemeIcon
            size={48}
            radius="md"
            color="orange"
            style={{
              backgroundColor: 'var(--mantine-color-orange-0)',
              color: 'var(--mantine-color-orange-6)',
            }}
          >
            <IconBrain size={24} />
          </ThemeIcon>
          <div>
            <Title order={1} size="h2" mb="xs">
              LLM Configuration
            </Title>
            <Text c="dimmed" size="sm">
              Configure Large Language Model providers and settings for email analysis
            </Text>
          </div>
        </Group>
        <Group gap="sm">
          <Button
            variant="outline"
            color="gray"
            size="xs"
            leftSection={<IconRefresh size={14} />}
            onClick={() => {
              setLoading(true);
              loadConfig();
            }}
            loading={loading}
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
            Refresh
          </Button>
          <Button
            variant="outline"
            color="gray"
            size="xs"
            leftSection={<IconTestPipe size={14} />}
            onClick={testConnection}
            loading={testing}
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
            Test Connection
          </Button>
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
          variant="outline"
          title={notification.type === 'success' ? 'Success' : 'Error'}
          withCloseButton
          onClose={() => setNotification(null)}
          mb="md"
          styles={{
            root: {
              backgroundColor: notification.type === 'success' ? '#f0fdf4' : '#fef2f2',
              borderColor: notification.type === 'success' ? '#22c55e' : '#ef4444',
              borderWidth: '1px',
            },
            title: {
              color: notification.type === 'success' ? '#15803d' : '#dc2626',
              fontWeight: '600',
            },
            body: {
              color: notification.type === 'success' ? '#15803d' : '#dc2626',
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
        defaultValue="providers"
        variant="pills"
        className="llm-tabs"
      >
        <Tabs.List mb="md">
          <Tabs.Tab value="providers">Providers</Tabs.Tab>
          <Tabs.Tab value="settings">Settings</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="providers">
          <Stack gap="md">
            <Card withBorder>
              <Card.Section withBorder inheritPadding py="xs">
                <Group justify="space-between">
                  <Text fw={500}>Active Provider</Text>
                  <Tooltip label="Select which LLM provider to use for email analysis">
                    <ActionIcon variant="subtle" size="sm">
                      <IconInfoCircle size={16} />
                    </ActionIcon>
                  </Tooltip>
                </Group>
              </Card.Section>

              <Stack gap="md" mt="md">
                <Select
                  label="Active Provider"
                  value={config.activeProvider}
                  onChange={(value) => updateConfig('activeProvider', value)}
                  data={[
                    { value: 'openai', label: 'OpenAI' },
                    { value: 'anthropic', label: 'Anthropic' },
                    { value: 'local', label: 'Local (Ollama)' },
                  ]}
                />
              </Stack>
            </Card>

            <Card withBorder>
              <Card.Section withBorder inheritPadding py="xs">
                <Group justify="space-between">
                  <Text fw={500}>OpenAI Configuration</Text>
                  <Switch
                    checked={config.providers.openai.enabled}
                    onChange={(event) => updateConfig('providers.openai.enabled', event.currentTarget.checked)}
                    styles={{
                      track: {
                        backgroundColor: config.providers.openai.enabled ? '#262626' : '#e9ecef',
                        borderColor: config.providers.openai.enabled ? '#262626' : '#e9ecef',
                      },
                    }}
                  />
                </Group>
              </Card.Section>

              <Stack gap="md" mt="md">
                <Grid>
                  <Grid.Col span={6}>
                    <Select
                      label="Model"
                      value={config.providers.openai.model}
                      onChange={(value) => updateConfig('providers.openai.model', value)}
                      data={[
                        { value: 'gpt-4', label: 'GPT-4' },
                        { value: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
                        { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' },
                      ]}
                      disabled={!config.providers.openai.enabled}
                    />
                  </Grid.Col>
                  <Grid.Col span={6}>
                    <PasswordInput
                      label="API Key"
                      placeholder="sk-..."
                      value={config.providers.openai.apiKey || ''}
                      onChange={(event) => updateConfig('providers.openai.apiKey', event.currentTarget.value)}
                      disabled={!config.providers.openai.enabled}
                    />
                  </Grid.Col>
                </Grid>
              </Stack>
            </Card>

            <Card withBorder>
              <Card.Section withBorder inheritPadding py="xs">
                <Group justify="space-between">
                  <Text fw={500}>Anthropic Configuration</Text>
                  <Switch
                    checked={config.providers.anthropic.enabled}
                    onChange={(event) => updateConfig('providers.anthropic.enabled', event.currentTarget.checked)}
                    styles={{
                      track: {
                        backgroundColor: config.providers.anthropic.enabled ? '#262626' : '#e9ecef',
                        borderColor: config.providers.anthropic.enabled ? '#262626' : '#e9ecef',
                      },
                    }}
                  />
                </Group>
              </Card.Section>

              <Stack gap="md" mt="md">
                <Grid>
                  <Grid.Col span={6}>
                    <Select
                      label="Model"
                      value={config.providers.anthropic.model}
                      onChange={(value) => updateConfig('providers.anthropic.model', value)}
                      data={[
                        { value: 'claude-3-sonnet-20240229', label: 'Claude 3 Sonnet' },
                        { value: 'claude-3-haiku-20240307', label: 'Claude 3 Haiku' },
                        { value: 'claude-3-opus-20240229', label: 'Claude 3 Opus' },
                      ]}
                      disabled={!config.providers.anthropic.enabled}
                    />
                  </Grid.Col>
                  <Grid.Col span={6}>
                    <PasswordInput
                      label="API Key"
                      placeholder="sk-ant-..."
                      value={config.providers.anthropic.apiKey || ''}
                      onChange={(event) => updateConfig('providers.anthropic.apiKey', event.currentTarget.value)}
                      disabled={!config.providers.anthropic.enabled}
                    />
                  </Grid.Col>
                </Grid>
              </Stack>
            </Card>

            <Card withBorder>
              <Card.Section withBorder inheritPadding py="xs">
                <Group justify="space-between">
                  <Text fw={500}>Local (Ollama) Configuration</Text>
                  <Switch
                    checked={config.providers.local.enabled}
                    onChange={(event) => updateConfig('providers.local.enabled', event.currentTarget.checked)}
                    styles={{
                      track: {
                        backgroundColor: config.providers.local.enabled ? '#262626' : '#e9ecef',
                        borderColor: config.providers.local.enabled ? '#262626' : '#e9ecef',
                      },
                    }}
                  />
                </Group>
              </Card.Section>

              <Stack gap="md" mt="md">
                <Grid>
                  <Grid.Col span={6}>
                    <TextInput
                      label="Model"
                      value={config.providers.local.model}
                      onChange={(event) => updateConfig('providers.local.model', event.currentTarget.value)}
                      placeholder="llama3, mistral, etc."
                      disabled={!config.providers.local.enabled}
                    />
                  </Grid.Col>
                  <Grid.Col span={6}>
                    <TextInput
                      label="Endpoint"
                      value={config.providers.local.endpoint || ''}
                      onChange={(event) => updateConfig('providers.local.endpoint', event.currentTarget.value)}
                      placeholder="http://localhost:11434"
                      disabled={!config.providers.local.enabled}
                    />
                  </Grid.Col>
                </Grid>
              </Stack>
            </Card>
          </Stack>
        </Tabs.Panel>

        <Tabs.Panel value="settings">
          <Card withBorder>
            <Card.Section withBorder inheritPadding py="xs">
              <Text fw={500}>System Prompt Configuration</Text>
            </Card.Section>

            <Stack gap="md" mt="md">
              <div>
                <Group justify="space-between" align="flex-end" mb="xs">
                  <div>
                    <Text size="sm" fw={500}>System Prompt</Text>
                  </div>
                  <Button 
                    variant="light" 
                    size="xs"
                    onClick={() => {
                      const defaultPrompt = `You are an expert email security analyst specializing in spam and phishing detection. Your task is to analyze the provided email content and classify it as either SPAM or HAM (legitimate).

## Analysis Instructions

### 1. Technical Analysis
Examine technical indicators:
- Authentication results (SPF, DKIM, DMARC)
- Header anomalies and suspicious routing
- URL patterns and link destinations
- Attachment types and suspicious content
- MIME structure irregularities

### 2. Content Analysis
Analyze the email content for:
- Financial promises, get-rich-quick schemes
- Urgency language and pressure tactics
- Suspicious sender names and domains
- Template-based or mass-mailing patterns
- Obfuscation techniques and encoding

### 3. Behavioral Patterns
Consider behavioral indicators:
- Sender reputation and history
- Volume and frequency patterns
- Time anomalies in sending patterns
- Content similarity across emails

### 4. Contextual Factors
Account for legitimate communications:
- Business newsletters and announcements
- Event notifications and invitations
- Transactional emails and confirmations
- Personal correspondence patterns

## Classification Guidelines

**SPAM Classification:**
- Clear financial scams or fraud attempts
- Phishing attacks targeting credentials
- Mass marketing without proper unsubscribe
- Suspicious technical indicators (failed authentication)
- Multiple spam indicators present

**HAM Classification:**
- Legitimate business communications
- Personal correspondence
- Properly formatted newsletters with unsubscribe
- Transactional emails from known services
- Event notifications and invitations

## Output Format

Provide your analysis in JSON format:

\`\`\`json
{
  "classification": "SPAM" | "HAM",
  "confidence": 0.85,
  "reasoning": "Brief explanation of key factors that influenced the decision",
  "risk_indicators": [
    "List of specific spam indicators found"
  ],
  "legitimacy_factors": [
    "List of factors suggesting legitimacy"
  ],
  "recommendation": "Specific action recommendation"
}
\`\`\`

## Important Notes

- Be objective and base decisions on evidence
- Consider false positive impact on legitimate emails
- Weight technical authentication heavily
- Account for cultural and language differences
- Prioritize user safety while minimizing disruption

Analyze the email thoroughly and provide your expert assessment.`;
                      updateConfig('systemPrompt', defaultPrompt);
                    }}
                  >
                    Load Default Prompt
                  </Button>
                </Group>
                <Textarea
                  placeholder="Enter the system prompt for LLM analysis... (Leave empty to use default prompt)"
                  value={config.systemPrompt || ''}
                  onChange={(event) => updateConfig('systemPrompt', event.currentTarget.value)}
                  description="This prompt will be used to instruct the LLM on how to analyze emails for spam detection. Leave empty to use the default comprehensive analysis prompt."
                  rows={16}
                  autosize
                  minRows={8}
                  maxRows={24}
                />
              </div>
            </Stack>
          </Card>
        </Tabs.Panel>
      </Tabs>
    </Container>
  );
};

export default LLM;