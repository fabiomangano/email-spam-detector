import {
  Badge,
  Button,
  Card,
  Flex,
  Grid,
  Progress,
  Text,
  Title,
  Alert,
  Group,
  Stack,
  ScrollArea,
  Divider,
} from "@mantine/core";
import { 
  IconArrowLeft, 
  IconArrowRight,
  IconSettings,
  IconBrain,
  IconCode,
  IconRefresh,
  IconCopy,
} from "@tabler/icons-react";
import { useAnalysis } from "../contexts/AnalysisContext";
import { Link, useNavigate } from "react-router";

function Report() {
  const { 
    analysisResult, 
    setAnalysisResult,
    setTextAreaValue,
    setUploadedFile,
    setUploadedFilename,
    setParsedData,
    setActiveTab,
    setError,
    setLoading,
    setAnalyzing
  } = useAnalysis();
  const navigate = useNavigate();

  const handleNewAnalysis = () => {
    // Reset all analysis and upload data
    setAnalysisResult(null);
    setTextAreaValue("");
    setUploadedFile(null);
    setUploadedFilename(null);
    setParsedData(null);
    setActiveTab("gallery");
    setError(null);
    setLoading(false);
    setAnalyzing(false);
    navigate('/upload');
  };

  // Helper function to get header values
  const getHeaderValue = (headerName: string) => {
    const headers = analysisResult?.details?.parsing?.parsed?.headers;
    if (!headers) return 'N/A';
    
    const value = headers[headerName];
    if (!value) return 'N/A';
    
    // Handle different header formats
    if (typeof value === 'string') return value;
    if (typeof value === 'object' && value.text) return value.text;
    if (typeof value === 'object' && value.value) return value.value;
    if (Array.isArray(value)) return value.join(', ');
    
    return JSON.stringify(value).substring(0, 100);
  };

  // Get last received header (most recent hop)
  const getLastReceived = () => {
    const received = analysisResult?.details?.parsing?.parsed?.headers?.received;
    if (!received || !Array.isArray(received)) return 'N/A';
    return received[0] || 'N/A'; // First item is the most recent
  };

  // Copy functions for each card
  const handleCopyParsingResults = () => {
    const sections: string[] = [];
    
    sections.push("=== PARSING RESULTS ===");
    sections.push("");
    
    sections.push("Basic Headers:");
    sections.push(`Subject: ${analysisResult?.details?.parsing?.parsed?.metadata?.subject || 'N/A'}`);
    sections.push(`From: ${analysisResult?.details?.parsing?.parsed?.metadata?.from || 'N/A'}`);
    sections.push(`To: ${analysisResult?.details?.parsing?.parsed?.metadata?.to || 'N/A'}`);
    sections.push(`Date: ${analysisResult?.details?.parsing?.parsed?.metadata?.date || 'N/A'}`);
    sections.push("");
    
    sections.push("Technical Headers:");
    sections.push(`Message-ID: ${getHeaderValue('message-id')}`);
    sections.push(`Reply-To: ${getHeaderValue('reply-to')}`);
    sections.push(`Return-Path: ${getHeaderValue('return-path')}`);
    sections.push(`Content-Type: ${getHeaderValue('content-type')}`);
    sections.push(`Sender IP: ${getHeaderValue('x-sender-ip')}`);
    sections.push("");
    
    sections.push("Authentication:");
    sections.push(`Auth Results: ${getHeaderValue('authentication-results')}`);
    sections.push(`Last Hop: ${getLastReceived()}`);
    sections.push("");
    
    sections.push("Content Structure:");
    sections.push(`Has HTML: ${analysisResult?.details?.parsing?.parsed?.htmlText ? 'Yes' : 'No'}`);
    sections.push(`Has Plain Text: ${analysisResult?.details?.parsing?.parsed?.plainText ? 'Yes' : 'No'}`);
    sections.push(`Attachments: ${analysisResult?.details?.parsing?.parsed?.attachments?.length || 0}`);
    
    navigator.clipboard.writeText(sections.join('\n'));
  };

  const handleCopyTechnicalAnalysis = () => {
    const sections: string[] = [];
    
    sections.push("=== TECHNICAL ANALYSIS ===");
    sections.push("");
    
    sections.push("Content Metrics:");
    sections.push(`Body Length: ${analysisResult?.details.technical.bodyLength}`);
    sections.push(`Links: ${analysisResult?.details.technical.numLinks} (Ratio: ${analysisResult?.details.technical.linkRatio})`);
    sections.push(`Images: ${analysisResult?.details.technical.numImages}`);
    sections.push(`External Domains: ${analysisResult?.details.technical.numExternalDomains || 'N/A'}`);
    sections.push(`Link/Image Ratio: ${analysisResult?.details.technical.linkToImageRatio?.toFixed(2) || 'N/A'}`);
    sections.push("");
    
    sections.push("Header Analysis:");
    sections.push(`Received Headers: ${analysisResult?.details.technical.numReceivedHeaders ?? 'N/A'}`);
    sections.push(`X-Mailer: ${analysisResult?.details.technical.xMailerBrand || 'N/A'}`);
    sections.push(`Outlook Route: ${analysisResult?.details.technical.hasOutlookReceivedPattern ? 'Yes' : 'No'}`);
    sections.push(`Date Header: ${analysisResult?.details.technical.missingDateHeader ? 'Missing' : 'Present'}`);
    sections.push("");
    
    sections.push("Authentication:");
    sections.push(`SPF: ${analysisResult?.details.technical.spfResult || 'Unknown'}`);
    sections.push(`DKIM: ${analysisResult?.details.technical.dkimResult || 'Unknown'}`);
    sections.push(`DMARC: ${analysisResult?.details.technical.dmarcResult || 'Unknown'}`);
    sections.push("");
    
    sections.push("Security Indicators:");
    sections.push(`Tracking Pixel: ${analysisResult?.details.technical.hasTrackingPixel ? 'Present' : 'None'}`);
    sections.push(`Content Type: ${analysisResult?.details.technical.isHtmlOnly ? 'HTML Only' : 'Text+HTML'}`);
    sections.push(`Reply-To: ${analysisResult?.details.technical.replyToDiffersFromFrom ? 'Spoofed' : 'Normal'}`);
    
    navigator.clipboard.writeText(sections.join('\n'));
  };

  const handleCopyNLPAnalysis = () => {
    const sections: string[] = [];
    
    sections.push("=== NLP ANALYSIS ===");
    sections.push("");
    
    sections.push("Classification:");
    sections.push(`Prediction: ${analysisResult?.details.nlp.prediction === 'spam' ? 'SPAM' : 'HAM (Legitimate)'}`);
    sections.push("");
    
    if (analysisResult?.details.nlp.nlpMetrics) {
      sections.push("Spam Metrics:");
      sections.push(`Spam Words: ${analysisResult.details.nlp.nlpMetrics.numSpammyWords}`);
      sections.push(`Spam Word Ratio: ${(analysisResult.details.nlp.nlpMetrics.spamWordRatio * 100).toFixed(1)}%`);
      sections.push(`All Caps Count: ${analysisResult.details.nlp.nlpMetrics.allCapsCount}`);
      sections.push(`Exclamation Count: ${analysisResult.details.nlp.nlpMetrics.exclamationCount}`);
      sections.push("");
    }
    
    sections.push("Sentiment Analysis:");
    sections.push(`Label: ${analysisResult?.details.nlp.sentiment.label}`);
    sections.push(`Score: ${analysisResult?.details.nlp.sentiment.score.toFixed(2)}`);
    sections.push("");
    
    sections.push("Language Detection:");
    sections.push(`Language: ${analysisResult?.details.nlp.language.detected.toUpperCase()}`);
    sections.push(`Confidence: ${Math.round((analysisResult?.details.nlp.language.confidence || 0) * 100)}%`);
    sections.push("");
    
    sections.push("Toxicity Analysis:");
    sections.push(`Toxicity Score: ${Math.round((analysisResult?.details.nlp.toxicity.score || 0) * 100)}%`);
    if (analysisResult?.details.nlp.toxicity.categories && analysisResult.details.nlp.toxicity.categories.length > 0) {
      sections.push(`Categories: ${analysisResult.details.nlp.toxicity.categories.join(', ')}`);
    }
    
    if (analysisResult?.details.nlp.keywords && analysisResult.details.nlp.keywords.length > 0) {
      sections.push("");
      sections.push("Keywords:");
      sections.push(`Top Keywords: ${analysisResult.details.nlp.keywords.slice(0, 5).join(', ')}`);
    }
    
    navigator.clipboard.writeText(sections.join('\n'));
  };

  if (!analysisResult) {
    return (
      <div style={{ padding: "20px" }}>
        <Alert color="blue" mb="md">
          No analysis data available. Please upload and analyze an email first.
        </Alert>
        <Button variant="filled" color="gray" component={Link} to="/upload" leftSection={<IconArrowLeft size={16} />}>
          Go to Upload
        </Button>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px", paddingBottom: "80px", height: "100vh", display: "flex", flexDirection: "column" }}>
      <Flex justify="space-between" align="center" mb="xl">
        <div>
          <Title order={1} size="h2" mb="xs">
            Analysis Report
          </Title>
          <Text c="dimmed" size="sm">
            Comprehensive security analysis results and technical details of your email
          </Text>
        </div>
        <Group gap="sm">
          <Button 
            variant="outline"
            color="red"
            size="xs"
            onClick={handleNewAnalysis}
            leftSection={<IconRefresh size={14} />}
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
            New Analysis
          </Button>
          <Button 
            variant="outline" 
            color="gray"
            size="xs"
            component={Link} 
            to="/upload"
            leftSection={<IconArrowLeft size={14} />}
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
            Back to Upload
          </Button>
          <Button 
            variant="filled"
            color="green"
            size="xs"
            component={Link} 
            to="/risk"
            rightSection={<IconArrowRight size={14} />}
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
            View Risk
          </Button>
        </Group>
      </Flex>

      <Grid style={{ flex: 1, height: 0 }}>
        {/* Parsing Results Card */}
        <Grid.Col span={{ base: 12, md: 6, lg: 4 }} style={{ display: "flex" }}>
          <Card padding="lg" radius="md" style={{ height: "calc(100vh - 280px)", flex: 1 }}>
            <Flex justify="space-between" align="center" mb="md">
              <Flex align="center" gap="xs">
                <IconCode size={20} />
                <Title order={2} size="h3">Parsing Results</Title>
              </Flex>
              <Button
                variant="outline"
                color="gray"
                size="xs"
                leftSection={<IconCopy size={14} />}
                onClick={handleCopyParsingResults}
                styles={{
                  root: {
                    borderColor: '#262626',
                    color: '#262626',
                    backgroundColor: '#ffffff',
                    '&:hover': {
                      backgroundColor: '#f5f5f5',
                    },
                  },
                }}
              >
                Copy
              </Button>
            </Flex>
            <Divider mb="md" />
            <ScrollArea 
              scrollbars="y" 
              style={{ flex: 1, height: "calc(100vh - 400px)" }}
              styles={{
                scrollbar: {
                  display: 'none'
                },
                thumb: {
                  display: 'none'
                }
              }}
            >
              <Stack gap="sm">
                {/* Basic Email Headers */}
                <div>
                  <Text size="sm" fw={700} mb="xs" c="gray.9">Basic Headers</Text>
                  <Stack gap={4}>
                    <Group justify="space-between" align="flex-start">
                      <Text size="xs" fw={600} c="gray.7" style={{ minWidth: "80px" }}>Subject:</Text>
                      <Text size="xs" c="gray.9" style={{ flex: 1, textAlign: "right" }}>
                        {analysisResult.details?.parsing?.parsed?.metadata?.subject || 'N/A'}
                      </Text>
                    </Group>
                    <Group justify="space-between" align="flex-start">
                      <Text size="xs" fw={600} c="gray.7" style={{ minWidth: "80px" }}>From:</Text>
                      <Text size="xs" c="gray.9" style={{ flex: 1, textAlign: "right" }}>
                        {analysisResult.details?.parsing?.parsed?.metadata?.from || 'N/A'}
                      </Text>
                    </Group>
                    <Group justify="space-between" align="flex-start">
                      <Text size="xs" fw={600} c="gray.7" style={{ minWidth: "80px" }}>To:</Text>
                      <Text size="xs" c="gray.9" style={{ flex: 1, textAlign: "right" }}>
                        {analysisResult.details?.parsing?.parsed?.metadata?.to || 'N/A'}
                      </Text>
                    </Group>
                    <Group justify="space-between" align="flex-start">
                      <Text size="xs" fw={600} c="gray.7" style={{ minWidth: "80px" }}>Date:</Text>
                      <Text size="xs" c="gray.9" style={{ flex: 1, textAlign: "right" }}>
                        {analysisResult.details?.parsing?.parsed?.metadata?.date || 'N/A'}
                      </Text>
                    </Group>
                  </Stack>
                </div>

                <Divider size="xs" />

                {/* Technical Headers */}
                <div>
                  <Text size="sm" fw={700} mb="xs" c="gray.9">Technical Headers</Text>
                  <Stack gap={4}>
                    <Group justify="space-between" align="flex-start">
                      <Text size="xs" fw={600} c="gray.7" style={{ minWidth: "100px" }}>Message-ID:</Text>
                      <Text size="xs" c="gray.9" style={{ flex: 1, textAlign: "right", wordBreak: "break-all" }}>
                        {getHeaderValue('message-id')}
                      </Text>
                    </Group>
                    <Group justify="space-between" align="flex-start">
                      <Text size="xs" fw={600} c="gray.7" style={{ minWidth: "100px" }}>Reply-To:</Text>
                      <Text size="xs" c="gray.9" style={{ flex: 1, textAlign: "right" }}>
                        {getHeaderValue('reply-to')}
                      </Text>
                    </Group>
                    <Group justify="space-between" align="flex-start">
                      <Text size="xs" fw={600} c="gray.7" style={{ minWidth: "100px" }}>Return-Path:</Text>
                      <Text size="xs" c="gray.9" style={{ flex: 1, textAlign: "right" }}>
                        {getHeaderValue('return-path')}
                      </Text>
                    </Group>
                    <Group justify="space-between" align="flex-start">
                      <Text size="xs" fw={600} c="gray.7" style={{ minWidth: "100px" }}>Content-Type:</Text>
                      <Text size="xs" c="gray.9" style={{ flex: 1, textAlign: "right" }}>
                        {getHeaderValue('content-type')}
                      </Text>
                    </Group>
                    <Group justify="space-between" align="flex-start">
                      <Text size="xs" fw={600} c="gray.7" style={{ minWidth: "100px" }}>Sender IP:</Text>
                      <Text size="xs" c="gray.9" style={{ flex: 1, textAlign: "right" }}>
                        {getHeaderValue('x-sender-ip')}
                      </Text>
                    </Group>
                  </Stack>
                </div>

                <Divider size="xs" />

                {/* Authentication Results */}
                <div>
                  <Text size="sm" fw={700} mb="xs" c="gray.9">Authentication</Text>
                  <Stack gap={4}>
                    <Group justify="space-between" align="flex-start">
                      <Text size="xs" fw={600} c="gray.7" style={{ minWidth: "100px" }}>Auth Results:</Text>
                      <Text size="xs" c="gray.9" style={{ flex: 1, textAlign: "right", wordBreak: "break-all" }}>
                        {getHeaderValue('authentication-results')}
                      </Text>
                    </Group>
                    <Group justify="space-between" align="flex-start">
                      <Text size="xs" fw={600} c="gray.7" style={{ minWidth: "100px" }}>Last Hop:</Text>
                      <Text size="xs" c="gray.9" style={{ flex: 1, textAlign: "right", wordBreak: "break-all" }}>
                        {getLastReceived()}
                      </Text>
                    </Group>
                  </Stack>
                </div>

                <Divider size="xs" />

                {/* Content Structure */}
                <div>
                  <Text size="sm" fw={700} mb="xs" c="gray.9">Content Structure</Text>
                  <Stack gap={4}>
                    <Group justify="space-between" align="flex-start">
                      <Text size="xs" fw={600} c="gray.7" style={{ minWidth: "100px" }}>Has HTML:</Text>
                      <Text size="xs" c="gray.9" style={{ flex: 1, textAlign: "right" }}>
                        {analysisResult.details?.parsing?.parsed?.htmlText ? 'Yes' : 'No'}
                      </Text>
                    </Group>
                    <Group justify="space-between" align="flex-start">
                      <Text size="xs" fw={600} c="gray.7" style={{ minWidth: "100px" }}>Has Plain Text:</Text>
                      <Text size="xs" c="gray.9" style={{ flex: 1, textAlign: "right" }}>
                        {analysisResult.details?.parsing?.parsed?.plainText ? 'Yes' : 'No'}
                      </Text>
                    </Group>
                    <Group justify="space-between" align="flex-start">
                      <Text size="xs" fw={600} c="gray.7" style={{ minWidth: "100px" }}>Attachments:</Text>
                      <Text size="xs" c="gray.9" style={{ flex: 1, textAlign: "right" }}>
                        {analysisResult.details?.parsing?.parsed?.attachments?.length || 0}
                      </Text>
                    </Group>
                  </Stack>
                </div>

                <Divider size="xs" />

                {/* Advanced Headers */}
                <div>
                  <Text size="sm" fw={700} mb="xs" c="gray.9">Advanced Headers</Text>
                  <Stack gap={4}>
                    <Group justify="space-between" align="flex-start">
                      <Text size="xs" fw={600} c="gray.7" style={{ minWidth: "120px" }}>Received-SPF:</Text>
                      <Text size="xs" c="gray.9" style={{ flex: 1, textAlign: "right" }}>
                        {getHeaderValue('received-spf')}
                      </Text>
                    </Group>
                    <Group justify="space-between" align="flex-start">
                      <Text size="xs" fw={600} c="gray.7" style={{ minWidth: "120px" }}>DKIM-Signature:</Text>
                      <Text size="xs" c="gray.9" style={{ flex: 1, textAlign: "right", wordBreak: "break-all" }}>
                        {getHeaderValue('dkim-signature')}
                      </Text>
                    </Group>
                    <Group justify="space-between" align="flex-start">
                      <Text size="xs" fw={600} c="gray.7" style={{ minWidth: "120px" }}>Feedback-ID:</Text>
                      <Text size="xs" c="gray.9" style={{ flex: 1, textAlign: "right" }}>
                        {getHeaderValue('feedback-id')}
                      </Text>
                    </Group>
                    <Group justify="space-between" align="flex-start">
                      <Text size="xs" fw={600} c="gray.7" style={{ minWidth: "120px" }}>Auto-Submitted:</Text>
                      <Text size="xs" c="gray.9" style={{ flex: 1, textAlign: "right" }}>
                        {getHeaderValue('auto-submitted')}
                      </Text>
                    </Group>
                    <Group justify="space-between" align="flex-start">
                      <Text size="xs" fw={600} c="gray.7" style={{ minWidth: "120px" }}>X-Mailer:</Text>
                      <Text size="xs" c="gray.9" style={{ flex: 1, textAlign: "right" }}>
                        {getHeaderValue('x-mailer')}
                      </Text>
                    </Group>
                    <Group justify="space-between" align="flex-start">
                      <Text size="xs" fw={600} c="gray.7" style={{ minWidth: "120px" }}>X-Abuse:</Text>
                      <Text size="xs" c="gray.9" style={{ flex: 1, textAlign: "right" }}>
                        {getHeaderValue('x-abuse')}
                      </Text>
                    </Group>
                    <Group justify="space-between" align="flex-start">
                      <Text size="xs" fw={600} c="gray.7" style={{ minWidth: "120px" }}>X-CSA-Complaints:</Text>
                      <Text size="xs" c="gray.9" style={{ flex: 1, textAlign: "right" }}>
                        {getHeaderValue('x-csa-complaints')}
                      </Text>
                    </Group>
                  </Stack>
                </div>

                <Divider size="xs" />

                {/* Microsoft Exchange Headers */}
                <div>
                  <Text size="sm" fw={700} mb="xs" c="gray.9">Microsoft Exchange</Text>
                  <Stack gap={4}>
                    <Group justify="space-between" align="flex-start">
                      <Text size="xs" fw={600} c="gray.7" style={{ minWidth: "120px" }}>Organization ID:</Text>
                      <Text size="xs" c="gray.9" style={{ flex: 1, textAlign: "right", wordBreak: "break-all" }}>
                        {getHeaderValue('x-ms-exchange-organization-network-message-id')}
                      </Text>
                    </Group>
                    <Group justify="space-between" align="flex-start">
                      <Text size="xs" fw={600} c="gray.7" style={{ minWidth: "120px" }}>Antispam:</Text>
                      <Text size="xs" c="gray.9" style={{ flex: 1, textAlign: "right", wordBreak: "break-all" }}>
                        {getHeaderValue('x-microsoft-antispam')}
                      </Text>
                    </Group>
                    <Group justify="space-between" align="flex-start">
                      <Text size="xs" fw={600} c="gray.7" style={{ minWidth: "120px" }}>Message Info:</Text>
                      <Text size="xs" c="gray.9" style={{ flex: 1, textAlign: "right", wordBreak: "break-all" }}>
                        {getHeaderValue('x-microsoft-antispam-message-info')}
                      </Text>
                    </Group>
                    <Group justify="space-between" align="flex-start">
                      <Text size="xs" fw={600} c="gray.7" style={{ minWidth: "120px" }}>Cross-Tenant:</Text>
                      <Text size="xs" c="gray.9" style={{ flex: 1, textAlign: "right" }}>
                        {getHeaderValue('x-ms-exchange-crosstenant-id')}
                      </Text>
                    </Group>
                  </Stack>
                </div>

              </Stack>
            </ScrollArea>
          </Card>
        </Grid.Col>

        {/* Technical Module Results Card */}
        <Grid.Col span={{ base: 12, md: 6, lg: 4 }} style={{ display: "flex" }}>
          <Card padding="lg" radius="md" style={{ height: "calc(100vh - 280px)", flex: 1 }}>
            <Flex justify="space-between" align="center" mb="md">
              <Flex align="center" gap="xs">
                <IconSettings size={20} />
                <Title order={2} size="h3">Technical Analysis</Title>
              </Flex>
              <Button
                variant="outline"
                color="gray"
                size="xs"
                leftSection={<IconCopy size={14} />}
                onClick={handleCopyTechnicalAnalysis}
                styles={{
                  root: {
                    borderColor: '#262626',
                    color: '#262626',
                    backgroundColor: '#ffffff',
                    '&:hover': {
                      backgroundColor: '#f5f5f5',
                    },
                  },
                }}
              >
                Copy
              </Button>
            </Flex>
            <Divider mb="md" />
            <ScrollArea 
              scrollbars="y" 
              style={{ flex: 1, height: "calc(100vh - 400px)" }}
              styles={{
                scrollbar: {
                  display: 'none'
                },
                thumb: {
                  display: 'none'
                }
              }}
            >
              <Stack gap="sm">
                {/* Content Metrics */}
                <div>
                  <Text size="sm" fw={700} mb="xs" c="gray.9">Content Metrics</Text>
                  <Stack gap={4}>
                    <Group justify="space-between" align="flex-start">
                      <Text size="xs" fw={600} c="gray.7" style={{ minWidth: "100px" }}>Body Length:</Text>
                      <Text size="xs" c="gray.9" style={{ flex: 1, textAlign: "right" }}>
                        {analysisResult.details.technical.bodyLength}
                      </Text>
                    </Group>
                    <Group justify="space-between" align="flex-start">
                      <Text size="xs" fw={600} c="gray.7" style={{ minWidth: "100px" }}>Links:</Text>
                      <Text size="xs" c="gray.9" style={{ flex: 1, textAlign: "right" }}>
                        {analysisResult.details.technical.numLinks} (Ratio: {analysisResult.details.technical.linkRatio})
                      </Text>
                    </Group>
                    <Group justify="space-between" align="flex-start">
                      <Text size="xs" fw={600} c="gray.7" style={{ minWidth: "100px" }}>Images:</Text>
                      <Text size="xs" c="gray.9" style={{ flex: 1, textAlign: "right" }}>
                        {analysisResult.details.technical.numImages}
                      </Text>
                    </Group>
                    <Group justify="space-between" align="flex-start">
                      <Text size="xs" fw={600} c="gray.7" style={{ minWidth: "100px" }}>External Domains:</Text>
                      <Text size="xs" c="gray.9" style={{ flex: 1, textAlign: "right" }}>
                        {analysisResult.details.technical.numExternalDomains || 'N/A'}
                      </Text>
                    </Group>
                    <Group justify="space-between" align="flex-start">
                      <Text size="xs" fw={600} c="gray.7" style={{ minWidth: "100px" }}>Link/Image Ratio:</Text>
                      <Text size="xs" c="gray.9" style={{ flex: 1, textAlign: "right" }}>
                        {analysisResult.details.technical.linkToImageRatio?.toFixed(2) || 'N/A'}
                      </Text>
                    </Group>
                  </Stack>
                </div>

                <Divider size="xs" />
                
                {/* Header Analysis */}
                <div>
                  <Text size="sm" fw={700} mb="xs" c="gray.9">Header Analysis</Text>
                  <Stack gap={4}>
                    <Group justify="space-between" align="flex-start">
                      <Text size="xs" fw={600} c="gray.7" style={{ minWidth: "100px" }}>Received Headers:</Text>
                      <Text size="xs" c="gray.9" style={{ flex: 1, textAlign: "right" }}>
                        {analysisResult.details.technical.numReceivedHeaders ?? 'N/A'}
                      </Text>
                    </Group>
                    <Group justify="space-between" align="flex-start">
                      <Text size="xs" fw={600} c="gray.7" style={{ minWidth: "100px" }}>X-Mailer:</Text>
                      <Text size="xs" c="gray.9" style={{ flex: 1, textAlign: "right" }}>
                        {analysisResult.details.technical.xMailerBrand || 'N/A'}
                      </Text>
                    </Group>
                    <Group justify="space-between" align="flex-start">
                      <Text size="xs" fw={600} c="gray.7" style={{ minWidth: "100px" }}>Outlook Route:</Text>
                      <Text size="xs" c="gray.9" style={{ flex: 1, textAlign: "right" }}>
                        {analysisResult.details.technical.hasOutlookReceivedPattern ? 'Yes' : 'No'}
                      </Text>
                    </Group>
                    <Group justify="space-between" align="flex-start">
                      <Text size="xs" fw={600} c="gray.7" style={{ minWidth: "100px" }}>Date Header:</Text>
                      <Text size="xs" c="gray.9" style={{ flex: 1, textAlign: "right" }}>
                        {analysisResult.details.technical.missingDateHeader ? 'Missing' : 'Present'}
                      </Text>
                    </Group>
                  </Stack>
                </div>

                <Divider size="xs" />
                
                {/* Authentication */}
                <div>
                  <Text size="sm" fw={700} mb="xs" c="gray.9">Authentication</Text>
                  <Stack gap={4}>
                    <Group justify="space-between" align="flex-start">
                      <Text size="xs" fw={600} c="gray.7" style={{ minWidth: "100px" }}>SPF:</Text>
                      <Text size="xs" c="gray.9" style={{ flex: 1, textAlign: "right" }}>
                        {analysisResult.details.technical.spfResult || 'Unknown'}
                      </Text>
                    </Group>
                    <Group justify="space-between" align="flex-start">
                      <Text size="xs" fw={600} c="gray.7" style={{ minWidth: "100px" }}>DKIM:</Text>
                      <Text size="xs" c="gray.9" style={{ flex: 1, textAlign: "right" }}>
                        {analysisResult.details.technical.dkimResult || 'Unknown'}
                      </Text>
                    </Group>
                    <Group justify="space-between" align="flex-start">
                      <Text size="xs" fw={600} c="gray.7" style={{ minWidth: "100px" }}>DMARC:</Text>
                      <Text size="xs" c="gray.9" style={{ flex: 1, textAlign: "right" }}>
                        {analysisResult.details.technical.dmarcResult || 'Unknown'}
                      </Text>
                    </Group>
                  </Stack>
                </div>

                <Divider size="xs" />

                {/* Sender Analysis */}
                <div>
                  <Text size="sm" fw={700} mb="xs" c="gray.9">Sender Analysis</Text>
                  <Stack gap={4}>
                    <Group justify="space-between" align="flex-start">
                      <Text size="xs" fw={600} c="gray.7" style={{ minWidth: "100px" }}>From Name:</Text>
                      <Text size="xs" c="gray.9" style={{ flex: 1, textAlign: "right" }}>
                        {analysisResult.details.technical.fromNameSuspicious ? 'Suspicious' : 'Normal'}
                      </Text>
                    </Group>
                    <Group justify="space-between" align="flex-start">
                      <Text size="xs" fw={600} c="gray.7" style={{ minWidth: "100px" }}>Domain:</Text>
                      <Text size="xs" c="gray.9" style={{ flex: 1, textAlign: "right" }}>
                        {analysisResult.details.technical.fromDomainIsDisposable ? 'Disposable' : 'Regular'}
                      </Text>
                    </Group>
                    <Group justify="space-between" align="flex-start">
                      <Text size="xs" fw={600} c="gray.7" style={{ minWidth: "100px" }}>Recipients:</Text>
                      <Text size="xs" c="gray.9" style={{ flex: 1, textAlign: "right" }}>
                        {analysisResult.details.technical.sentToMultiple ? 'Multiple' : 'Single'}
                      </Text>
                    </Group>
                  </Stack>
                </div>

                <Divider size="xs" />

                {/* Text Analysis */}
                <div>
                  <Text size="sm" fw={700} mb="xs" c="gray.9">Text Analysis</Text>
                  <Stack gap={4}>
                    <Group justify="space-between" align="flex-start">
                      <Text size="xs" fw={600} c="gray.7" style={{ minWidth: "100px" }}>Uppercase Ratio:</Text>
                      <Text size="xs" c="gray.9" style={{ flex: 1, textAlign: "right" }}>
                        {((analysisResult.details.technical.uppercaseRatio || 0) * 100).toFixed(1)}%
                      </Text>
                    </Group>
                    <Group justify="space-between" align="flex-start">
                      <Text size="xs" fw={600} c="gray.7" style={{ minWidth: "100px" }}>Exclamations:</Text>
                      <Text size="xs" c="gray.9" style={{ flex: 1, textAlign: "right" }}>
                        {analysisResult.details.technical.excessiveExclamations ? 'Excessive' : 'Normal'}
                      </Text>
                    </Group>
                    <Group justify="space-between" align="flex-start">
                      <Text size="xs" fw={600} c="gray.7" style={{ minWidth: "100px" }}>Urgency Words:</Text>
                      <Text size="xs" c="gray.9" style={{ flex: 1, textAlign: "right" }}>
                        {analysisResult.details.technical.containsUrgencyWords ? 'Present' : 'None'}
                      </Text>
                    </Group>
                    <Group justify="space-between" align="flex-start">
                      <Text size="xs" fw={600} c="gray.7" style={{ minWidth: "100px" }}>Election Terms:</Text>
                      <Text size="xs" c="gray.9" style={{ flex: 1, textAlign: "right" }}>
                        {analysisResult.details.technical.containsElectionTerms ? 'Present' : 'None'}
                      </Text>
                    </Group>
                  </Stack>
                </div>

                <Divider size="xs" />

                {/* Security Indicators */}
                <div>
                  <Text size="sm" fw={700} mb="xs" c="gray.9">Security Indicators</Text>
                  <Stack gap={4}>
                    <Group justify="space-between" align="flex-start">
                      <Text size="xs" fw={600} c="gray.7" style={{ minWidth: "100px" }}>Tracking Pixel:</Text>
                      <Text size="xs" c="gray.9" style={{ flex: 1, textAlign: "right" }}>
                        {analysisResult.details.technical.hasTrackingPixel ? 'Present' : 'None'}
                      </Text>
                    </Group>
                    <Group justify="space-between" align="flex-start">
                      <Text size="xs" fw={600} c="gray.7" style={{ minWidth: "100px" }}>Content Type:</Text>
                      <Text size="xs" c="gray.9" style={{ flex: 1, textAlign: "right" }}>
                        {analysisResult.details.technical.isHtmlOnly ? 'HTML Only' : 'Text+HTML'}
                      </Text>
                    </Group>
                    <Group justify="space-between" align="flex-start">
                      <Text size="xs" fw={600} c="gray.7" style={{ minWidth: "100px" }}>Reply-To:</Text>
                      <Text size="xs" c="gray.9" style={{ flex: 1, textAlign: "right" }}>
                        {analysisResult.details.technical.replyToDiffersFromFrom ? 'Spoofed' : 'Normal'}
                      </Text>
                    </Group>
                  </Stack>
                </div>

                <Divider size="xs" />

                {/* Campaign & Content */}
                <div>
                  <Text size="sm" fw={700} mb="xs" c="gray.9">Campaign & Content</Text>
                  <Stack gap={4}>
                    <Group justify="space-between" align="flex-start">
                      <Text size="xs" fw={600} c="gray.7" style={{ minWidth: "100px" }}>Campaign Headers:</Text>
                      <Text size="xs" c="gray.9" style={{ flex: 1, textAlign: "right" }}>
                        {analysisResult.details.technical.campaignIdentifierPresent ? 'Present' : 'None'}
                      </Text>
                    </Group>
                    <Group justify="space-between" align="flex-start">
                      <Text size="xs" fw={600} c="gray.7" style={{ minWidth: "100px" }}>FBL Headers:</Text>
                      <Text size="xs" c="gray.9" style={{ flex: 1, textAlign: "right" }}>
                        {analysisResult.details.technical.containsFeedbackLoopHeader ? 'Present' : 'None'}
                      </Text>
                    </Group>
                    <Group justify="space-between" align="flex-start">
                      <Text size="xs" fw={600} c="gray.7" style={{ minWidth: "100px" }}>Obfuscated Text:</Text>
                      <Text size="xs" c="gray.9" style={{ flex: 1, textAlign: "right" }}>
                        {analysisResult.details.technical.containsObfuscatedText ? 'Present' : 'None'}
                      </Text>
                    </Group>
                  </Stack>
                </div>

                <Divider size="xs" />

                {/* Link Analysis */}
                <div>
                  <Text size="sm" fw={700} mb="xs" c="gray.9">Link Analysis</Text>
                  <Stack gap={4}>
                    <Group justify="space-between" align="flex-start">
                      <Text size="xs" fw={600} c="gray.7" style={{ minWidth: "100px" }}>Link Display:</Text>
                      <Text size="xs" c="gray.9" style={{ flex: 1, textAlign: "right" }}>
                        {analysisResult.details.technical.linkDisplayMismatch ? 'Mismatch' : 'Normal'}
                      </Text>
                    </Group>
                    <Group justify="space-between" align="flex-start">
                      <Text size="xs" fw={600} c="gray.7" style={{ minWidth: "100px" }}>Shortened URLs:</Text>
                      <Text size="xs" c="gray.9" style={{ flex: 1, textAlign: "right" }}>
                        {analysisResult.details.technical.containsShortenedUrls ? 'Present' : 'None'}
                      </Text>
                    </Group>
                    <Group justify="space-between" align="flex-start">
                      <Text size="xs" fw={600} c="gray.7" style={{ minWidth: "100px" }}>Encoded URLs:</Text>
                      <Text size="xs" c="gray.9" style={{ flex: 1, textAlign: "right" }}>
                        {analysisResult.details.technical.usesEncodedUrls ? 'Present' : 'None'}
                      </Text>
                    </Group>
                  </Stack>
                </div>

                <Divider size="xs" />

                {/* MIME Structure */}
                <div>
                  <Text size="sm" fw={700} mb="xs" c="gray.9">MIME Structure</Text>
                  <Stack gap={4}>
                    <Group justify="space-between" align="flex-start">
                      <Text size="xs" fw={600} c="gray.7" style={{ minWidth: "100px" }}>Content Types:</Text>
                      <Text size="xs" c="gray.9" style={{ flex: 1, textAlign: "right" }}>
                        {analysisResult.details.technical.hasMixedContentTypes ? 'Mixed' : 'Simple'}
                      </Text>
                    </Group>
                    <Group justify="space-between" align="flex-start">
                      <Text size="xs" fw={600} c="gray.7" style={{ minWidth: "100px" }}>Multipart:</Text>
                      <Text size="xs" c="gray.9" style={{ flex: 1, textAlign: "right" }}>
                        {analysisResult.details.technical.hasNestedMultipart ? 'Nested' : 'Flat'}
                      </Text>
                    </Group>
                    <Group justify="space-between" align="flex-start">
                      <Text size="xs" fw={600} c="gray.7" style={{ minWidth: "100px" }}>Boundary:</Text>
                      <Text size="xs" c="gray.9" style={{ flex: 1, textAlign: "right" }}>
                        {analysisResult.details.technical.boundaryAnomaly ? 'Anomaly' : 'Normal'}
                      </Text>
                    </Group>
                    <Group justify="space-between" align="flex-start">
                      <Text size="xs" fw={600} c="gray.7" style={{ minWidth: "100px" }}>Alternative:</Text>
                      <Text size="xs" c="gray.9" style={{ flex: 1, textAlign: "right" }}>
                        {analysisResult.details.technical.hasFakeMultipartAlternative ? 'Fake' : 'Valid'}
                      </Text>
                    </Group>
                  </Stack>
                </div>

                <Divider size="xs" />

                {/* Spam Detection */}
                <div>
                  <Text size="sm" fw={700} mb="xs" c="gray.9">Spam Detection</Text>
                  <Stack gap={4}>
                    <Group justify="space-between" align="flex-start">
                      <Text size="xs" fw={600} c="gray.7" style={{ minWidth: "100px" }}>Image Heavy:</Text>
                      <Text size="xs" c="gray.9" style={{ flex: 1, textAlign: "right" }}>
                        {analysisResult.details.technical.isImageHeavy ? 'Yes' : 'No'}
                      </Text>
                    </Group>
                    <Group justify="space-between" align="flex-start">
                      <Text size="xs" fw={600} c="gray.7" style={{ minWidth: "100px" }}>Repeated Links:</Text>
                      <Text size="xs" c="gray.9" style={{ flex: 1, textAlign: "right" }}>
                        {analysisResult.details.technical.hasRepeatedLinks ? 'Yes' : 'No'}
                      </Text>
                    </Group>
                  </Stack>
                </div>

                {analysisResult.details.technical.hasAttachments && (
                  <>
                    <Divider size="xs" />
                    <div>
                      <Text size="sm" fw={600} mb="xs">Attachments</Text>
                      <Text size="xs" mb="xs">Count: {analysisResult.details.technical.numAttachments}</Text>
                      <Text size="xs" c="dimmed">
                        Types: {analysisResult.details.technical.attachmentTypes.join(', ')}
                      </Text>
                    </div>
                  </>
                )}
              </Stack>
            </ScrollArea>
          </Card>
        </Grid.Col>

        {/* NLP Module Results Card */}
        <Grid.Col span={{ base: 12, md: 6, lg: 4 }} style={{ display: "flex" }}>
          <Card padding="lg" radius="md" style={{ height: "calc(100vh - 280px)", flex: 1 }}>
            <Flex justify="space-between" align="center" mb="md">
              <Flex align="center" gap="xs">
                <IconBrain size={20} />
                <Title order={2} size="h3">NLP Analysis</Title>
              </Flex>
              <Button
                variant="outline"
                color="gray"
                size="xs"
                leftSection={<IconCopy size={14} />}
                onClick={handleCopyNLPAnalysis}
                styles={{
                  root: {
                    borderColor: '#262626',
                    color: '#262626',
                    backgroundColor: '#ffffff',
                    '&:hover': {
                      backgroundColor: '#f5f5f5',
                    },
                  },
                }}
              >
                Copy
              </Button>
            </Flex>
            <Divider mb="md" />
            <ScrollArea 
              scrollbars="y" 
              style={{ flex: 1, height: "calc(100vh - 400px)" }}
              styles={{
                scrollbar: {
                  display: 'none'
                },
                thumb: {
                  display: 'none'
                }
              }}
            >
              <Stack gap="sm">
                {/* Classification */}
                <div>
                  <Text size="sm" fw={700} mb="xs" c="gray.9">Classification</Text>
                  <Stack gap={4}>
                    <Group justify="space-between" align="flex-start">
                      <Text size="xs" fw={600} c="gray.7" style={{ minWidth: "100px" }}>Prediction:</Text>
                      <Text size="xs" c="gray.9" style={{ flex: 1, textAlign: "right" }}>
                        {analysisResult.details.nlp.prediction === 'spam' ? 'SPAM' : 'HAM (Legitimate)'}
                      </Text>
                    </Group>
                  </Stack>
                </div>

                <Divider size="xs" />

                {/* Spam Metrics */}
                {analysisResult.details.nlp.nlpMetrics && (
                  <>
                    <div>
                      <Text size="sm" fw={700} mb="xs" c="gray.9">Spam Metrics</Text>
                      <Stack gap={4}>
                        <Group justify="space-between" align="flex-start">
                          <Text size="xs" fw={600} c="gray.7" style={{ minWidth: "100px" }}>Spam Words:</Text>
                          <Text size="xs" c="gray.9" style={{ flex: 1, textAlign: "right" }}>
                            {analysisResult.details.nlp.nlpMetrics.numSpammyWords}
                          </Text>
                        </Group>
                        <Group justify="space-between" align="flex-start">
                          <Text size="xs" fw={600} c="gray.7" style={{ minWidth: "100px" }}>Spam Word Ratio:</Text>
                          <Text size="xs" c="gray.9" style={{ flex: 1, textAlign: "right" }}>
                            {(analysisResult.details.nlp.nlpMetrics.spamWordRatio * 100).toFixed(1)}%
                          </Text>
                        </Group>
                        <Group justify="space-between" align="flex-start">
                          <Text size="xs" fw={600} c="gray.7" style={{ minWidth: "100px" }}>All Caps Count:</Text>
                          <Text size="xs" c="gray.9" style={{ flex: 1, textAlign: "right" }}>
                            {analysisResult.details.nlp.nlpMetrics.allCapsCount}
                          </Text>
                        </Group>
                        <Group justify="space-between" align="flex-start">
                          <Text size="xs" fw={600} c="gray.7" style={{ minWidth: "100px" }}>Exclamation Count:</Text>
                          <Text size="xs" c="gray.9" style={{ flex: 1, textAlign: "right" }}>
                            {analysisResult.details.nlp.nlpMetrics.exclamationCount}
                          </Text>
                        </Group>
                      </Stack>
                    </div>

                    <Divider size="xs" />
                  </>
                )}
                
                {/* Sentiment Analysis */}
                <div>
                  <Text size="sm" fw={700} mb="xs" c="gray.9">Sentiment Analysis</Text>
                  <Stack gap={4}>
                    <Group justify="space-between" align="flex-start">
                      <Text size="xs" fw={600} c="gray.7" style={{ minWidth: "100px" }}>Label:</Text>
                      <Text size="xs" c="gray.9" style={{ flex: 1, textAlign: "right" }}>
                        {analysisResult.details.nlp.sentiment.label}
                      </Text>
                    </Group>
                    <Group justify="space-between" align="flex-start">
                      <Text size="xs" fw={600} c="gray.7" style={{ minWidth: "100px" }}>Score:</Text>
                      <Text size="xs" c="gray.9" style={{ flex: 1, textAlign: "right" }}>
                        {analysisResult.details.nlp.sentiment.score.toFixed(2)}
                      </Text>
                    </Group>
                  </Stack>
                </div>

                <Divider size="xs" />
                
                {/* Language Detection */}
                <div>
                  <Text size="sm" fw={700} mb="xs" c="gray.9">Language Detection</Text>
                  <Stack gap={4}>
                    <Group justify="space-between" align="flex-start">
                      <Text size="xs" fw={600} c="gray.7" style={{ minWidth: "100px" }}>Language:</Text>
                      <Text size="xs" c="gray.9" style={{ flex: 1, textAlign: "right" }}>
                        {analysisResult.details.nlp.language.detected.toUpperCase()}
                      </Text>
                    </Group>
                    <Group justify="space-between" align="flex-start">
                      <Text size="xs" fw={600} c="gray.7" style={{ minWidth: "100px" }}>Confidence:</Text>
                      <Text size="xs" c="gray.9" style={{ flex: 1, textAlign: "right" }}>
                        {Math.round(analysisResult.details.nlp.language.confidence * 100)}%
                      </Text>
                    </Group>
                  </Stack>
                </div>

                <Divider size="xs" />
                
                {/* Toxicity Analysis */}
                <div>
                  <Text size="sm" fw={700} mb="xs" c="gray.9">Toxicity Analysis</Text>
                  <Stack gap={4}>
                    <Group justify="space-between" align="flex-start">
                      <Text size="xs" fw={600} c="gray.7" style={{ minWidth: "100px" }}>Toxicity Score:</Text>
                      <Text size="xs" c="gray.9" style={{ flex: 1, textAlign: "right" }}>
                        {Math.round(analysisResult.details.nlp.toxicity.score * 100)}%
                      </Text>
                    </Group>
                    {analysisResult.details.nlp.toxicity.categories && analysisResult.details.nlp.toxicity.categories.length > 0 && (
                      <Group justify="space-between" align="flex-start">
                        <Text size="xs" fw={600} c="gray.7" style={{ minWidth: "100px" }}>Categories:</Text>
                        <Text size="xs" c="gray.9" style={{ flex: 1, textAlign: "right" }}>
                          {analysisResult.details.nlp.toxicity.categories.join(', ')}
                        </Text>
                      </Group>
                    )}
                  </Stack>
                </div>

                {/* Keywords */}
                {analysisResult.details.nlp.keywords && analysisResult.details.nlp.keywords.length > 0 && (
                  <>
                    <Divider size="xs" />
                    <div>
                      <Text size="sm" fw={700} mb="xs" c="gray.9">Keywords</Text>
                      <Stack gap={4}>
                        <Group justify="space-between" align="flex-start">
                          <Text size="xs" fw={600} c="gray.7" style={{ minWidth: "100px" }}>Top Keywords:</Text>
                          <Text size="xs" c="gray.9" style={{ flex: 1, textAlign: "right" }}>
                            {analysisResult.details.nlp.keywords.slice(0, 5).join(', ')}
                          </Text>
                        </Group>
                      </Stack>
                    </div>
                  </>
                )}
              </Stack>
            </ScrollArea>
          </Card>
        </Grid.Col>

      </Grid>
    </div>
  );
}

export default Report;