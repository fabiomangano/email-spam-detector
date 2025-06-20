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
} from '@mantine/core';
import { IconDeviceFloppy, IconRestore, IconInfoCircle, IconTestPipe } from '@tabler/icons-react';

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
      const response = await fetch('/api/llm/config');
      if (!response.ok) throw new Error('Failed to load LLM configuration');
      const data = await response.json();
      // Add activeProvider based on which provider is enabled
      const activeProvider = data.providers.openai.enabled ? 'openai' : 
                           data.providers.anthropic.enabled ? 'anthropic' : 'local';
      setConfig({ ...data, activeProvider });
    } catch (error) {
      setNotification({ type: 'error', message: 'Failed to load LLM configuration' });
    } finally {
      setLoading(false);
    }
  };

  const saveConfig = async () => {
    if (!config) return;

    setSaving(true);
    try {
      const response = await fetch('/api/llm/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
      }
      
      setNotification({ type: 'success', message: 'LLM configuration saved successfully' });
    } catch (error) {
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
        <div>
          <Title order={1} size="h2" mb="xs">
            LLM Configuration
          </Title>
          <Text c="dimmed" size="sm">
            Configure Large Language Model providers and settings for email analysis
          </Text>
        </div>
        <Group gap="sm">
          <Button
            variant="outline"
            color="blue"
            size="xs"
            leftSection={<IconTestPipe size={14} />}
            onClick={testConnection}
            loading={testing}
            styles={{
              root: {
                borderColor: "#3b82f6",
                color: "#3b82f6",
                backgroundColor: "#ffffff",
                "&:hover": {
                  backgroundColor: "#eff6ff",
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
          variant="filled"
          title={notification.type === 'success' ? 'Success' : 'Error'}
          withCloseButton
          onClose={() => setNotification(null)}
          mb="md"
          styles={{
            root: {
              backgroundColor: notification.type === 'success' ? '#22c55e' : '#ef4444',
              borderColor: notification.type === 'success' ? '#22c55e' : '#ef4444',
            },
            title: {
              color: '#ffffff',
            },
            body: {
              color: '#ffffff',
            },
            closeButton: {
              color: '#ffffff',
              '&:hover': {
                backgroundColor: notification.type === 'success' ? '#16a34a' : '#dc2626',
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
              <Text fw={500}>Global Settings</Text>
            </Card.Section>

            <Stack gap="md" mt="md">
              <Alert>
                <Text size="sm">
                  Global LLM settings will be available in future updates. Currently, provider-specific 
                  settings are managed in the Providers tab.
                </Text>
              </Alert>
            </Stack>
          </Card>
        </Tabs.Panel>
      </Tabs>
    </Container>
  );
};

export default LLM;