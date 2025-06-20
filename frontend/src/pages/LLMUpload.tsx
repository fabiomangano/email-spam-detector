import React, { useState } from 'react';
import {
  Container,
  Title,
  Card,
  Button,
  Stack,
  Text,
  Textarea,
  Alert,
  LoadingOverlay,
  Group,
  Flex,
} from '@mantine/core';
import { IconUpload, IconRobot, IconAlertCircle, IconFileText, IconInfoCircle } from '@tabler/icons-react';
import { useAnalysis } from '../contexts/AnalysisContext';

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
}

const LLMUpload: React.FC = () => {
  const [emailContent, setEmailContent] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const { setLlmAnalysisResult } = useAnalysis();

  const analyzeEmail = async () => {
    if (!emailContent.trim()) {
      setNotification({ type: 'error', message: 'Please enter email content to analyze' });
      return;
    }

    setAnalyzing(true);
    try {
      const response = await fetch('/api/llm/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: emailContent }),
      });
      
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
      }
      
      const result: LLMAnalysisResult = await response.json();
      
      if (result.success) {
        // Store result in both sessionStorage and context
        sessionStorage.setItem('llmAnalysisResult', JSON.stringify(result));
        setLlmAnalysisResult(result);
        setNotification({ type: 'success', message: 'Email analyzed successfully! Check the Report page for results.' });
      } else {
        throw new Error(result.error || 'Analysis failed');
      }
    } catch (error: any) {
      setNotification({ type: 'error', message: `Analysis failed: ${error.message}` });
    } finally {
      setAnalyzing(false);
    }
  };

  const clearContent = () => {
    setEmailContent('');
    setNotification(null);
    // Also clear the LLM result
    setLlmAnalysisResult(null);
    sessionStorage.removeItem('llmAnalysisResult');
  };

  return (
    <Container size="lg">
      <style>
        {`
          .llm-upload-container {
            position: relative;
            min-height: 400px;
          }
        `}
      </style>
      
      <div className="llm-upload-container">
        {analyzing && <LoadingOverlay visible />}
        
        <Flex justify="space-between" align="center" mb="xl">
          <div>
            <Title order={1} size="h2" mb="xs">
              LLM Email Analysis
            </Title>
            <Text c="dimmed" size="sm">
              Analyze emails using Large Language Models for advanced spam detection
            </Text>
          </div>
          <Group gap="sm">
            <Button
              variant="outline"
              color="gray"
              size="xs"
              onClick={clearContent}
              disabled={!emailContent.trim() || analyzing}
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
              Clear
            </Button>
            <Button
              variant="filled"
              size="xs"
              leftSection={<IconRobot size={14} />}
              onClick={analyzeEmail}
              loading={analyzing}
              disabled={!emailContent.trim()}
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
              Analyze with LLM
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
            icon={notification.type === 'error' ? <IconAlertCircle size={16} /> : undefined}
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

        <Card withBorder>
          <Card.Section withBorder inheritPadding py="md">
            <Flex align="center" gap="xs">
              <IconFileText size={20} />
              <Title order={2} size="h3">Email Content</Title>
            </Flex>
          </Card.Section>

          <Stack gap="md" mt="md">
            <Textarea
              placeholder="Paste your email content here (headers + body)...&#10;&#10;Example:&#10;From: sender@example.com&#10;To: recipient@example.com&#10;Subject: Test Email&#10;&#10;Email body content..."
              value={emailContent}
              onChange={(event) => setEmailContent(event.currentTarget.value)}
              minRows={15}
              maxRows={25}
              autosize
              styles={{
                input: {
                  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                  fontSize: "var(--mantine-font-size-xs)",
                  lineHeight: 1.5,
                  scrollbarWidth: "none",
                  msOverflowStyle: "none",
                  "&::WebkitScrollbar": {
                    display: "none"
                  }
                },
              }}
            />
            
            <Group justify="space-between">
              <Text size="sm" c="dimmed">
                Characters: {emailContent.length}
              </Text>
              <Text size="sm" c="dimmed">
                Lines: {emailContent.split('\n').length}
              </Text>
            </Group>
          </Stack>
        </Card>

        <Card withBorder mt="md">
          <Card.Section withBorder inheritPadding py="md">
            <Flex align="center" gap="xs">
              <IconInfoCircle size={20} />
              <Title order={2} size="h3">Instructions</Title>
            </Flex>
          </Card.Section>

          <Stack gap="sm" mt="md">
            <Text size="sm">
              • Paste the complete email content including headers and body
            </Text>
            <Text size="sm">
              • The LLM will analyze the content using the configured model and prompt
            </Text>
            <Text size="sm">
              • Results will be available in the LLM Report section
            </Text>
            <Text size="sm">
              • Make sure LLM configuration is properly set up before analyzing
            </Text>
          </Stack>
        </Card>
      </div>
    </Container>
  );
};

export default LLMUpload;