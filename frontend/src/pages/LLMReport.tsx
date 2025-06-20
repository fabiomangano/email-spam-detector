import React, { useState, useEffect } from 'react';
import {
  Container,
  Title,
  Card,
  Stack,
  Text,
  Progress,
  Badge,
  Group,
  Flex,
  Alert,
  List,
  ThemeIcon,
  Divider,
  Button,
} from '@mantine/core';
import { useAnalysis } from '../contexts/AnalysisContext';
import { 
  IconRobot, 
  IconAlertTriangle, 
  IconCheck, 
  IconInfoCircle,
  IconBrain,
  IconTarget,
  IconPercentage,
  IconRefresh,
} from '@tabler/icons-react';

interface LLMAnalysisResult {
  success: boolean;
  analysis?: {
    spamProbability: number;
    reasoning: string;
    confidence: number;
    keyIndicators: string[];
  };
  error?: string;
  provider?: string;
  model?: string;
  timestamp?: string;
  parsing?: {
    subject?: string;
    from?: string;
    contentLength?: number;
  };
}

const LLMReport: React.FC = () => {
  const [result, setResult] = useState<LLMAnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const { llmAnalysisResult } = useAnalysis();

  useEffect(() => {
    loadResults();
  }, [llmAnalysisResult]);

  const loadResults = () => {
    setLoading(true);
    try {
      // First try to get from context, then from sessionStorage
      if (llmAnalysisResult) {
        setResult(llmAnalysisResult);
      } else {
        const storedResult = sessionStorage.getItem('llmAnalysisResult');
        if (storedResult) {
          const parsedResult = JSON.parse(storedResult);
          setResult(parsedResult);
        } else {
          setResult(null);
        }
      }
    } catch (error) {
      console.error('Failed to load LLM analysis results:', error);
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const getRiskLevel = (probability: number) => {
    if (probability >= 0.7) return { level: 'High', color: 'red' };
    if (probability >= 0.4) return { level: 'Medium', color: 'yellow' };
    return { level: 'Low', color: 'green' };
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'green';
    if (confidence >= 0.6) return 'yellow';
    return 'red';
  };

  if (loading) {
    return (
      <Container size="lg">
        <Title order={2}>Loading LLM Analysis Results...</Title>
      </Container>
    );
  }

  if (!result) {
    return (
      <Container size="lg">
        <Flex justify="space-between" align="center" mb="xl">
          <div>
            <Title order={1} size="h2" mb="xs">
              LLM Analysis Report
            </Title>
            <Text c="dimmed" size="sm">
              No analysis results available
            </Text>
          </div>
        </Flex>

        <Alert
          variant="light"
          color="blue"
          title="No Results Found"
          icon={<IconInfoCircle size={16} />}
        >
          <Text>
            No LLM analysis results found. Please analyze an email using the LLM Upload page first.
          </Text>
        </Alert>
      </Container>
    );
  }

  if (!result.success) {
    return (
      <Container size="lg">
        <Flex justify="space-between" align="center" mb="xl">
          <div>
            <Title order={1} size="h2" mb="xs">
              LLM Analysis Report
            </Title>
            <Text c="dimmed" size="sm">
              Analysis failed
            </Text>
          </div>
          <Button
            variant="outline"
            color="gray"
            size="xs"
            leftSection={<IconRefresh size={14} />}
            onClick={loadResults}
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
        </Flex>

        <Alert
          variant="filled"
          color="red"
          title="Analysis Failed"
          icon={<IconAlertTriangle size={16} />}
        >
          <Text>{result.error || 'Unknown error occurred during analysis'}</Text>
        </Alert>
      </Container>
    );
  }

  const analysis = result.analysis!;
  const riskLevel = getRiskLevel(analysis.spamProbability);
  const confidenceColor = getConfidenceColor(analysis.confidence);

  return (
    <Container size="lg">
      <Flex justify="space-between" align="center" mb="xl">
        <Group gap="md" align="flex-start">
          <ThemeIcon
            size={48}
            radius="md"
            color="teal"
            style={{
              backgroundColor: 'var(--mantine-color-teal-0)',
              color: 'var(--mantine-color-teal-6)',
            }}
          >
            <IconBrain size={24} />
          </ThemeIcon>
          <div>
            <Title order={1} size="h2" mb="xs">
              LLM Analysis Report
            </Title>
            <Text c="dimmed" size="sm">
              Advanced spam detection results using {result.provider} ({result.model})
            </Text>
          </div>
        </Group>
        <Button
          variant="outline"
          color="gray"
          size="xs"
          leftSection={<IconRefresh size={14} />}
          onClick={loadResults}
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
      </Flex>

      <Stack gap="md">
        {/* Main Results Card */}
        <Card withBorder>
          <Card.Section withBorder inheritPadding py="xs">
            <Group justify="space-between">
              <Text fw={500}>Analysis Results</Text>
              <IconRobot size={16} />
            </Group>
          </Card.Section>

          <Stack gap="lg" mt="md">
            {/* Spam Probability */}
            <div>
              <Group justify="space-between" mb="xs">
                <Group gap="xs">
                  <IconTarget size={16} />
                  <Text size="sm" fw={500}>Spam Probability</Text>
                </Group>
                <Badge color={riskLevel.color} variant="filled">
                  {riskLevel.level} Risk
                </Badge>
              </Group>
              <Progress 
                value={analysis.spamProbability * 100} 
                color={riskLevel.color}
                size="lg"
                mb="xs"
              />
              <Text size="sm" ta="center" fw={600}>
                {(analysis.spamProbability * 100).toFixed(1)}%
              </Text>
            </div>

            <Divider />

            {/* Confidence Level */}
            <div>
              <Group justify="space-between" mb="xs">
                <Group gap="xs">
                  <IconPercentage size={16} />
                  <Text size="sm" fw={500}>Model Confidence</Text>
                </Group>
                <Badge color={confidenceColor} variant="light">
                  {(analysis.confidence * 100).toFixed(1)}%
                </Badge>
              </Group>
              <Progress 
                value={analysis.confidence * 100} 
                color={confidenceColor}
                size="md"
              />
            </div>
          </Stack>
        </Card>

        {/* Email Info Card */}
        {result.parsing && (
          <Card withBorder>
            <Card.Section withBorder inheritPadding py="xs">
              <Text fw={500}>Email Information</Text>
            </Card.Section>

            <Stack gap="sm" mt="md">
              {result.parsing.subject && (
                <Group>
                  <Text size="sm" fw={500} w={80}>Subject:</Text>
                  <Text size="sm">{result.parsing.subject}</Text>
                </Group>
              )}
              {result.parsing.from && (
                <Group>
                  <Text size="sm" fw={500} w={80}>From:</Text>
                  <Text size="sm">{result.parsing.from}</Text>
                </Group>
              )}
              {result.parsing.contentLength && (
                <Group>
                  <Text size="sm" fw={500} w={80}>Length:</Text>
                  <Text size="sm">{result.parsing.contentLength} characters</Text>
                </Group>
              )}
            </Stack>
          </Card>
        )}

        {/* AI Reasoning Card */}
        <Card withBorder>
          <Card.Section withBorder inheritPadding py="xs">
            <Group gap="xs">
              <IconBrain size={16} />
              <Text fw={500}>AI Reasoning</Text>
            </Group>
          </Card.Section>

          <Text size="sm" mt="md" style={{ lineHeight: 1.6 }}>
            {analysis.reasoning}
          </Text>
        </Card>

        {/* Key Indicators Card */}
        {analysis.keyIndicators && analysis.keyIndicators.length > 0 && (
          <Card withBorder>
            <Card.Section withBorder inheritPadding py="xs">
              <Text fw={500}>Key Indicators</Text>
            </Card.Section>

            <List
              spacing="xs"
              size="sm"
              center
              mt="md"
              icon={
                <ThemeIcon color={riskLevel.color} size={16} radius="xl">
                  {riskLevel.level === 'High' ? (
                    <IconAlertTriangle size={10} />
                  ) : (
                    <IconCheck size={10} />
                  )}
                </ThemeIcon>
              }
            >
              {analysis.keyIndicators.map((indicator, index) => (
                <List.Item key={index}>{indicator}</List.Item>
              ))}
            </List>
          </Card>
        )}

        {/* Technical Details Card */}
        <Card withBorder>
          <Card.Section withBorder inheritPadding py="xs">
            <Text fw={500}>Technical Details</Text>
          </Card.Section>

          <Stack gap="xs" mt="md">
            <Group>
              <Text size="sm" fw={500} w={80}>Provider:</Text>
              <Text size="sm">{result.provider || 'Unknown'}</Text>
            </Group>
            <Group>
              <Text size="sm" fw={500} w={80}>Model:</Text>
              <Text size="sm">{result.model || 'Unknown'}</Text>
            </Group>
            {result.timestamp && (
              <Group>
                <Text size="sm" fw={500} w={80}>Analyzed:</Text>
                <Text size="sm">{new Date(result.timestamp).toLocaleString()}</Text>
              </Group>
            )}
          </Stack>
        </Card>
      </Stack>
    </Container>
  );
};

export default LLMReport;