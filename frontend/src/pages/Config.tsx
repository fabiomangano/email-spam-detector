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
  Notification,
  LoadingOverlay,
  Tabs,
  ScrollArea,
  ActionIcon,
  Tooltip,
} from '@mantine/core';
import { IconSettings, IconDeviceFloppy, IconRestore, IconInfoCircle } from '@tabler/icons-react';

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

const Config: React.FC = () => {
  const [config, setConfig] = useState<SpamDetectionConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

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
      setNotification({ type: 'error', message: 'Errore nel caricamento della configurazione' });
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
      
      setNotification({ type: 'success', message: 'Configurazione salvata con successo' });
    } catch (error) {
      setNotification({ type: 'error', message: 'Errore nel salvataggio della configurazione' });
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
      setNotification({ type: 'success', message: 'Configurazione ripristinata ai valori predefiniti' });
    } catch (error) {
      setNotification({ type: 'error', message: 'Errore nel ripristino della configurazione' });
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
        <Title order={2}>Configurazione</Title>
        <Text color="red">Errore nel caricamento della configurazione</Text>
      </Container>
    );
  }

  return (
    <Container size="lg">
      <Group justify="space-between" mb="xl">
        <Group>
          <IconSettings size={32} />
          <Title order={2}>Configurazione Sistema</Title>
        </Group>
        <Group>
          <Button
            variant="outline"
            color="gray"
            leftSection={<IconRestore size={16} />}
            onClick={resetConfig}
          >
            Ripristina Default
          </Button>
          <Button
            leftSection={<IconDeviceFloppy size={16} />}
            onClick={saveConfig}
            loading={saving}
          >
            Salva Configurazione
          </Button>
        </Group>
      </Group>

      {notification && (
        <Notification
          color={notification.type === 'success' ? 'green' : 'red'}
          onClose={() => setNotification(null)}
          mb="md"
        >
          {notification.message}
        </Notification>
      )}

      <Tabs defaultValue="scoring">
        <Tabs.List mb="md">
          <Tabs.Tab value="scoring">Punteggi e Soglie</Tabs.Tab>
          <Tabs.Tab value="technical">Penalità Tecniche</Tabs.Tab>
          <Tabs.Tab value="thresholds">Soglie Tecniche</Tabs.Tab>
          <Tabs.Tab value="nlp">Configurazione NLP</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="scoring">
          <Card withBorder>
            <Card.Section withBorder inheritPadding py="xs">
              <Group justify="space-between">
                <Text fw={500}>Configurazione Punteggi</Text>
                <Tooltip label="Configura i pesi per il calcolo del punteggio finale e le soglie di rischio">
                  <ActionIcon variant="subtle" size="sm">
                    <IconInfoCircle size={16} />
                  </ActionIcon>
                </Tooltip>
              </Group>
            </Card.Section>

            <Stack gap="md" mt="md">
              <Text size="sm" fw={500}>Pesi Moduli (devono sommare a 1.0)</Text>
              <Grid>
                <Grid.Col span={6}>
                  <NumberInput
                    label="Peso Modulo Tecnico"
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
                    label="Peso Modulo NLP"
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

              <Text size="sm" fw={500}>Soglie Livelli di Rischio</Text>
              <Grid>
                <Grid.Col span={6}>
                  <NumberInput
                    label="Soglia Rischio Basso"
                    value={config.scoring.riskLevels.low}
                    onChange={(value) => updateConfig('scoring.riskLevels.low', value as number)}
                    min={0}
                    max={1}
                    step={0.1}
                    precision={1}
                    description="Sotto questa soglia = rischio basso"
                  />
                </Grid.Col>
                <Grid.Col span={6}>
                  <NumberInput
                    label="Soglia Rischio Medio"
                    value={config.scoring.riskLevels.medium}
                    onChange={(value) => updateConfig('scoring.riskLevels.medium', value as number)}
                    min={0}
                    max={1}
                    step={0.1}
                    precision={1}
                    description="Sopra questa soglia = rischio alto"
                  />
                </Grid.Col>
              </Grid>
            </Stack>
          </Card>
        </Tabs.Panel>

        <Tabs.Panel value="technical">
          <ScrollArea h={600}>
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
          <ScrollArea h={600}>
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
          <Stack gap="md">
            <Card withBorder>
              <Card.Section withBorder inheritPadding py="xs">
                <Text fw={500}>Moltiplicatori NLP</Text>
              </Card.Section>

              <Grid mt="md">
                <Grid.Col span={4}>
                  <NumberInput
                    label="Moltiplicatore Tossicità"
                    value={config.nlp.multipliers.toxicity}
                    onChange={(value) => updateConfig('nlp.multipliers.toxicity', value as number)}
                    min={0}
                    step={0.1}
                    precision={1}
                  />
                </Grid.Col>
                <Grid.Col span={4}>
                  <NumberInput
                    label="Sentiment Negativo"
                    value={config.nlp.multipliers.sentiment.negative}
                    onChange={(value) => updateConfig('nlp.multipliers.sentiment.negative', value as number)}
                    min={0}
                    step={0.1}
                    precision={1}
                  />
                </Grid.Col>
                <Grid.Col span={4}>
                  <NumberInput
                    label="Sentiment Positivo"
                    value={config.nlp.multipliers.sentiment.positive}
                    onChange={(value) => updateConfig('nlp.multipliers.sentiment.positive', value as number)}
                    min={0}
                    step={0.1}
                    precision={1}
                  />
                </Grid.Col>
                <Grid.Col span={4}>
                  <NumberInput
                    label="Parole Spam"
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
                <Text fw={500}>Soglie NLP</Text>
              </Card.Section>

              <Grid mt="md">
                <Grid.Col span={6}>
                  <NumberInput
                    label="Soglia Tossicità Bassa"
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
                    label="Soglia Tossicità Media"
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
                    label="Soglia Sentiment Negativo"
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
                    label="Soglia Sentiment Positivo"
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
                    label="Soglia Rapporto Parole Spam"
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
        </Tabs.Panel>
      </Tabs>
    </Container>
  );
};

export default Config;