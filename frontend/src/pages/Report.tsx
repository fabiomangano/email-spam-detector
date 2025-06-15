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
  Collapse,
  Divider,
} from "@mantine/core";
import { 
  IconArrowLeft, 
  IconSettings,
  IconBrain,
  IconCode,
  IconChevronDown,
  IconChevronRight,
} from "@tabler/icons-react";
import { useState } from "react";
import { useAnalysis } from "../contexts/AnalysisContext";
import { Link } from "react-router";

function Report() {
  const { analysisResult } = useAnalysis();
  const [showAdvancedHeaders, setShowAdvancedHeaders] = useState(false);

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

  if (!analysisResult) {
    return (
      <div style={{ padding: "20px" }}>
        <Alert color="blue" mb="md">
          No analysis data available. Please upload and analyze an email first.
        </Alert>
        <Button component={Link} to="/upload" leftSection={<IconArrowLeft size={16} />}>
          Go to Upload
        </Button>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px", height: "100%" }}>
      <Flex align="center" gap="md" mb="xl">
        <Button 
          variant="outline" 
          component={Link} 
          to="/upload"
          leftSection={<IconArrowLeft size={16} />}
        >
          Back to Upload
        </Button>
        <Title order={1} size="h2">Analysis Report</Title>
      </Flex>

      <Grid>
        {/* Parsing Results Card */}
        <Grid.Col span={6}>
          <Card padding="lg" radius="md" h="400px">
            <Flex align="center" gap="xs" mb="md">
              <IconCode size={20} />
              <Title order={5} size="h5">Parsing Results</Title>
            </Flex>
            <ScrollArea h={320}>
              <Stack gap="sm">
                {/* Basic Email Headers */}
                <div>
                  <Text size="sm" fw={600} mb="xs">Basic Headers</Text>
                  <Text size="xs" mb="xs">Subject: {analysisResult.details?.parsing?.parsed?.metadata?.subject || 'N/A'}</Text>
                  <Text size="xs" mb="xs">From: {analysisResult.details?.parsing?.parsed?.metadata?.from || 'N/A'}</Text>
                  <Text size="xs" mb="xs">To: {analysisResult.details?.parsing?.parsed?.metadata?.to || 'N/A'}</Text>
                  <Text size="xs" mb="sm">Date: {analysisResult.details?.parsing?.parsed?.metadata?.date || 'N/A'}</Text>
                </div>

                <Divider size="xs" />

                {/* Technical Headers */}
                <div>
                  <Text size="sm" fw={600} mb="xs">Technical Headers</Text>
                  <Text size="xs" mb="xs">Message-ID: {getHeaderValue('message-id')}</Text>
                  <Text size="xs" mb="xs">Reply-To: {getHeaderValue('reply-to')}</Text>
                  <Text size="xs" mb="xs">Return-Path: {getHeaderValue('return-path')}</Text>
                  <Text size="xs" mb="xs">Content-Type: {getHeaderValue('content-type')}</Text>
                  <Text size="xs" mb="sm">Sender IP: {getHeaderValue('x-sender-ip')}</Text>
                </div>

                <Divider size="xs" />

                {/* Authentication Results */}
                <div>
                  <Text size="sm" fw={600} mb="xs">Authentication</Text>
                  <Text size="xs" mb="xs">Auth Results: {getHeaderValue('authentication-results')}</Text>
                  <Text size="xs" mb="sm">Last Hop: {getLastReceived()}</Text>
                </div>

                <Divider size="xs" />

                {/* Content Structure */}
                <div>
                  <Text size="sm" fw={600} mb="xs">Content Structure</Text>
                  <Text size="xs" mb="xs">Has HTML: {analysisResult.details?.parsing?.parsed?.htmlText ? 'Yes' : 'No'}</Text>
                  <Text size="xs" mb="xs">Has Plain Text: {analysisResult.details?.parsing?.parsed?.plainText ? 'Yes' : 'No'}</Text>
                  <Text size="xs" mb="sm">Attachments: {analysisResult.details?.parsing?.parsed?.attachments?.length || 0}</Text>
                </div>

                {/* Advanced Headers - Collapsible */}
                <div>
                  <Button
                    variant="subtle"
                    size="xs"
                    leftSection={showAdvancedHeaders ? <IconChevronDown size={14} /> : <IconChevronRight size={14} />}
                    onClick={() => setShowAdvancedHeaders(!showAdvancedHeaders)}
                    style={{ padding: '4px 8px', height: 'auto' }}
                  >
                    <Text size="sm" fw={600}>Advanced Headers</Text>
                  </Button>
                  
                  <Collapse in={showAdvancedHeaders}>
                    <Stack gap="xs" mt="xs">
                      <Text size="xs" mb="xs">Received-SPF: {getHeaderValue('received-spf')}</Text>
                      <Text size="xs" mb="xs">DKIM-Signature: {getHeaderValue('dkim-signature')}</Text>
                      <Text size="xs" mb="xs">Feedback-ID: {getHeaderValue('feedback-id')}</Text>
                      <Text size="xs" mb="xs">Auto-Submitted: {getHeaderValue('auto-submitted')}</Text>
                      <Text size="xs" mb="xs">X-Mailer: {getHeaderValue('x-mailer')}</Text>
                      <Text size="xs" mb="xs">X-Abuse: {getHeaderValue('x-abuse')}</Text>
                      <Text size="xs" mb="xs">X-CSA-Complaints: {getHeaderValue('x-csa-complaints')}</Text>
                      
                      {/* Microsoft Exchange Headers */}
                      <Text size="xs" fw={500} mt="xs" mb="xs">Microsoft Exchange:</Text>
                      <Text size="xs" mb="xs">Organization ID: {getHeaderValue('x-ms-exchange-organization-network-message-id')}</Text>
                      <Text size="xs" mb="xs">Antispam: {getHeaderValue('x-microsoft-antispam')}</Text>
                      <Text size="xs" mb="xs">Message Info: {getHeaderValue('x-microsoft-antispam-message-info')}</Text>
                      <Text size="xs" mb="xs">Cross-Tenant: {getHeaderValue('x-ms-exchange-crosstenant-id')}</Text>
                    </Stack>
                  </Collapse>
                </div>

              </Stack>
            </ScrollArea>
          </Card>
        </Grid.Col>

        {/* Technical Module Results Card */}
        <Grid.Col span={6}>
          <Card padding="lg" radius="md" h="400px">
            <Flex align="center" gap="xs" mb="md">
              <IconSettings size={20} />
              <Title order={5} size="h5">Technical Analysis</Title>
            </Flex>
            <ScrollArea h={320}>
              <Stack gap="sm">
                <div>
                  <Text size="sm" fw={600} mb="xs">Content Metrics</Text>
                  <Text size="xs" mb="xs">Body Length: {analysisResult.details.technical.bodyLength}</Text>
                  <Text size="xs" mb="xs">Links: {analysisResult.details.technical.numLinks} (Ratio: {analysisResult.details.technical.linkRatio})</Text>
                  <Text size="xs" mb="xs">Images: {analysisResult.details.technical.numImages}</Text>
                  <Text size="xs" mb="sm">Domains: {analysisResult.details.technical.numDomains}</Text>
                </div>
                
                <div>
                  <Text size="sm" fw={600} mb="xs">Authentication</Text>
                  <Group gap="xs" mb="sm">
                    <Badge color={analysisResult.details.technical.spfResult === 'pass' ? 'green' : 'red'} size="sm">
                      SPF: {analysisResult.details.technical.spfResult || 'Unknown'}
                    </Badge>
                    <Badge color={analysisResult.details.technical.dkimResult === 'pass' ? 'green' : 'red'} size="sm">
                      DKIM: {analysisResult.details.technical.dkimResult || 'Unknown'}
                    </Badge>
                    <Badge color={analysisResult.details.technical.dmarcResult === 'pass' ? 'green' : 'red'} size="sm">
                      DMARC: {analysisResult.details.technical.dmarcResult || 'Unknown'}
                    </Badge>
                  </Group>
                </div>

                <div>
                  <Text size="sm" fw={600} mb="xs">Security Indicators</Text>
                  <Group gap="xs" mb="sm">
                    <Badge color={analysisResult.details.technical.hasTrackingPixel ? 'red' : 'green'} size="sm">
                      {analysisResult.details.technical.hasTrackingPixel ? 'Tracking Pixel' : 'No Tracking'}
                    </Badge>
                    <Badge color={analysisResult.details.technical.isHtmlOnly ? 'yellow' : 'green'} size="sm">
                      {analysisResult.details.technical.isHtmlOnly ? 'HTML Only' : 'Text+HTML'}
                    </Badge>
                    <Badge color={analysisResult.details.technical.replyToDiffersFromFrom ? 'red' : 'green'} size="sm">
                      {analysisResult.details.technical.replyToDiffersFromFrom ? 'Reply-To Spoofed' : 'Reply-To OK'}
                    </Badge>
                  </Group>
                </div>

                {analysisResult.details.technical.hasAttachments && (
                  <div>
                    <Text size="sm" fw={600} mb="xs">Attachments</Text>
                    <Text size="xs" mb="xs">Count: {analysisResult.details.technical.numAttachments}</Text>
                    <Text size="xs" c="dimmed">
                      Types: {analysisResult.details.technical.attachmentTypes.join(', ')}
                    </Text>
                  </div>
                )}
              </Stack>
            </ScrollArea>
          </Card>
        </Grid.Col>

        {/* NLP Module Results Card */}
        <Grid.Col span={6}>
          <Card padding="lg" radius="md" h="400px">
            <Flex align="center" gap="xs" mb="md">
              <IconBrain size={20} />
              <Title order={5} size="h5">NLP Analysis</Title>
            </Flex>
            <ScrollArea h={320}>
              <Stack gap="sm">
                <div>
                  <Text size="sm" fw={600} mb="xs">Classification</Text>
                  <Badge color={analysisResult.details.nlp.prediction === 'spam' ? 'red' : 'green'} size="lg" mb="sm">
                    {analysisResult.details.nlp.prediction === 'spam' ? 'SPAM' : 'HAM (Legitimate)'}
                  </Badge>
                </div>

                {analysisResult.details.nlp.nlpMetrics && (
                  <div>
                    <Text size="sm" fw={600} mb="xs">Spam Metrics</Text>
                    <Text size="xs" mb="xs">Spam Words: {analysisResult.details.nlp.nlpMetrics.numSpammyWords}</Text>
                    <Text size="xs" mb="xs">Spam Word Ratio: {(analysisResult.details.nlp.nlpMetrics.spamWordRatio * 100).toFixed(1)}%</Text>
                    <Text size="xs" mb="xs">All Caps Count: {analysisResult.details.nlp.nlpMetrics.allCapsCount}</Text>
                    <Text size="xs" mb="sm">Exclamation Count: {analysisResult.details.nlp.nlpMetrics.exclamationCount}</Text>
                  </div>
                )}
                
                <div>
                  <Text size="sm" fw={600} mb="xs">Sentiment Analysis</Text>
                  <Badge color={analysisResult.details.nlp.sentiment.label === 'positive' ? 'green' : analysisResult.details.nlp.sentiment.label === 'negative' ? 'red' : 'gray'} mb="sm">
                    {analysisResult.details.nlp.sentiment.label} ({analysisResult.details.nlp.sentiment.score.toFixed(2)})
                  </Badge>
                </div>
                
                <div>
                  <Text size="sm" fw={600} mb="xs">Language Detection</Text>
                  <Text size="sm" mb="sm">
                    {analysisResult.details.nlp.language.detected.toUpperCase()} ({Math.round(analysisResult.details.nlp.language.confidence * 100)}%)
                  </Text>
                </div>
                
                <div>
                  <Text size="sm" fw={600} mb="xs">Toxicity Score</Text>
                  <Progress 
                    value={analysisResult.details.nlp.toxicity.score * 100} 
                    color="red" 
                    size="sm"
                    mb="xs"
                  />
                  <Text size="xs" c="dimmed">{Math.round(analysisResult.details.nlp.toxicity.score * 100)}%</Text>
                </div>

                {analysisResult.details.nlp.keywords && analysisResult.details.nlp.keywords.length > 0 && (
                  <div>
                    <Text size="sm" fw={600} mb="xs">Keywords</Text>
                    <Group gap="xs">
                      {analysisResult.details.nlp.keywords.slice(0, 5).map((keyword, index) => (
                        <Badge key={index} variant="light" size="sm">{keyword}</Badge>
                      ))}
                    </Group>
                  </div>
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