import React, { useState, useEffect } from 'react';
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
  ThemeIcon,
  Grid,
} from '@mantine/core';
import { IconUpload, IconRobot, IconAlertCircle, IconFileText, IconInfoCircle } from '@tabler/icons-react';
import { useAnalysis } from '../contexts/AnalysisContext';
import { useNavigate } from 'react-router';

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
  const navigate = useNavigate();

  // Load saved email content on component mount
  useEffect(() => {
    const savedContent = sessionStorage.getItem('llmEmailContent');
    if (savedContent) {
      setEmailContent(savedContent);
    }
  }, []);

  // Save email content whenever it changes
  useEffect(() => {
    sessionStorage.setItem('llmEmailContent', emailContent);
  }, [emailContent]);

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
        
        // Navigate to report page immediately
        navigate('/llm-report');
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
    <Container size="lg" pb="6rem">
      <style>
        {`
          .llm-upload-container {
            position: relative;
            min-height: 400px;
            padding-bottom: 80px;
          }
        `}
      </style>
      
      <div className="llm-upload-container">
        {analyzing && <LoadingOverlay visible />}
        
        <Flex justify="space-between" align="center" mb="xl">
          <Group gap="md" align="flex-start">
            <ThemeIcon
              size={48}
              radius="md"
              color="grape"
              style={{
                backgroundColor: 'var(--mantine-color-grape-0)',
                color: 'var(--mantine-color-grape-6)',
              }}
            >
              <IconRobot size={24} />
            </ThemeIcon>
            <div>
              <Title order={1} size="h2" mb="xs">
                LLM Email Analysis
              </Title>
              <Text c="dimmed" size="sm">
                Analyze emails using Large Language Models for advanced spam detection
              </Text>
            </div>
          </Group>
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
            variant="outline"
            title={notification.type === 'success' ? 'Success' : 'Error'}
            withCloseButton
            onClose={() => setNotification(null)}
            mb="md"
            icon={notification.type === 'error' ? <IconAlertCircle size={16} /> : undefined}
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

        <Card withBorder style={{ height: '600px', display: 'flex', flexDirection: 'column' }}>
          <Card.Section withBorder inheritPadding py="md">
            <Flex align="center" gap="xs">
              <IconFileText size={20} />
              <Title order={2} size="h3">Email Content</Title>
            </Flex>
          </Card.Section>

          <Stack gap="md" mt="md" style={{ flex: 1, overflow: 'hidden' }}>
            <Textarea
              placeholder="Paste your email content here (headers + body)...&#10;&#10;Example:&#10;From: sender@example.com&#10;To: recipient@example.com&#10;Subject: Test Email&#10;&#10;Email body content..."
              value={emailContent}
              onChange={(event) => setEmailContent(event.currentTarget.value)}
              rows={20}
              styles={{
                input: {
                  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                  fontSize: "var(--mantine-font-size-xs)",
                  lineHeight: 1.5,
                  height: '500px',
                  resize: 'none',
                  overflow: 'auto'
                },
              }}
            />
            
            <Group justify="space-between" wrap="nowrap">
              <Text size="sm" c="dimmed">
                Characters: {emailContent.length}
              </Text>
              <Text size="sm" c="dimmed">
                Lines: {emailContent.split('\n').length}
              </Text>
            </Group>
          </Stack>
        </Card>
      </div>
    </Container>
  );
};

export default LLMUpload;