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
} from "@tabler/icons-react";
import { useAnalysis } from "../contexts/AnalysisContext";
import { Link } from "react-router";

function Report() {
  const { analysisResult } = useAnalysis();

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
    <div style={{ padding: "20px", paddingBottom: "80px", height: "100vh", display: "flex", flexDirection: "column" }}>
      <Flex justify="space-between" align="center" mb="xl">
        <Title order={1} size="h2">Analysis Report</Title>
        <Group gap="sm">
          <Button 
            variant="outline" 
            component={Link} 
            to="/upload"
            leftSection={<IconArrowLeft size={16} />}
          >
            Back to Upload
          </Button>
          <Button 
            variant="outline"
            component={Link} 
            to="/risk"
            rightSection={<IconArrowRight size={16} />}
          >
            View Risk Assessment
          </Button>
        </Group>
      </Flex>

      <Grid style={{ flex: 1, height: 0 }}>
        {/* Parsing Results Card */}
        <Grid.Col span={{ base: 12, md: 6, lg: 4 }} style={{ display: "flex" }}>
          <Card padding="lg" radius="md" style={{ height: "calc(100vh - 280px)", flex: 1 }}>
            <Flex align="center" gap="xs" mb="md">
              <IconCode size={20} />
              <Title order={2} size="h3">Parsing Results</Title>
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
            <Flex align="center" gap="xs" mb="md">
              <IconSettings size={20} />
              <Title order={2} size="h3">Technical Analysis</Title>
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
                <div>
                  <Text size="sm" fw={600} mb="xs">Content Metrics</Text>
                  <Text size="xs" mb="xs">Body Length: {analysisResult.details.technical.bodyLength}</Text>
                  <Text size="xs" mb="xs">Links: {analysisResult.details.technical.numLinks} (Ratio: {analysisResult.details.technical.linkRatio})</Text>
                  <Text size="xs" mb="xs">Images: {analysisResult.details.technical.numImages}</Text>
                  <Text size="xs" mb="xs">External Domains: {analysisResult.details.technical.numExternalDomains || 'N/A'}</Text>
                  <Text size="xs" mb="sm">Link/Image Ratio: {analysisResult.details.technical.linkToImageRatio?.toFixed(2) || 'N/A'}</Text>
                </div>

                <Divider size="xs" />
                
                <div>
                  <Text size="sm" fw={600} mb="xs">Header Analysis</Text>
                  <Text size="xs" mb="xs">Received Headers: {analysisResult.details.technical.numReceivedHeaders ?? 'N/A'}</Text>
                  <Text size="xs" mb="xs">X-Mailer: {analysisResult.details.technical.xMailerBrand || 'N/A'}</Text>
                  <Group gap="xs" mb="sm">
                    <Badge variant="outline" color={analysisResult.details.technical.hasOutlookReceivedPattern ? 'green' : 'gray'} size="sm">
                      {analysisResult.details.technical.hasOutlookReceivedPattern ? 'Outlook Route' : 'No Outlook'}
                    </Badge>
                    <Badge variant="outline" color={analysisResult.details.technical.missingDateHeader ? 'red' : 'green'} size="sm">
                      {analysisResult.details.technical.missingDateHeader ? 'No Date' : 'Date OK'}
                    </Badge>
                  </Group>
                </div>

                <Divider size="xs" />
                
                <div>
                  <Text size="sm" fw={600} mb="xs">Authentication</Text>
                  <Group gap="xs" mb="sm">
                    <Badge variant="outline" color={analysisResult.details.technical.spfResult === 'pass' ? 'green' : 'red'} size="sm">
                      SPF: {analysisResult.details.technical.spfResult || 'Unknown'}
                    </Badge>
                    <Badge variant="outline" color={analysisResult.details.technical.dkimResult === 'pass' ? 'green' : 'red'} size="sm">
                      DKIM: {analysisResult.details.technical.dkimResult || 'Unknown'}
                    </Badge>
                    <Badge variant="outline" color={analysisResult.details.technical.dmarcResult === 'pass' ? 'green' : 'red'} size="sm">
                      DMARC: {analysisResult.details.technical.dmarcResult || 'Unknown'}
                    </Badge>
                  </Group>
                </div>

                <div>
                  <Text size="sm" fw={600} mb="xs">Sender Analysis</Text>
                  <Group gap="xs" mb="sm">
                    <Badge variant="outline" color={analysisResult.details.technical.fromNameSuspicious ? 'red' : 'green'} size="sm">
                      {analysisResult.details.technical.fromNameSuspicious ? 'Suspicious Name' : 'Name OK'}
                    </Badge>
                    <Badge variant="outline" color={analysisResult.details.technical.fromDomainIsDisposable ? 'red' : 'green'} size="sm">
                      {analysisResult.details.technical.fromDomainIsDisposable ? 'Disposable Domain' : 'Domain OK'}
                    </Badge>
                    <Badge variant="outline" color={analysisResult.details.technical.sentToMultiple ? 'yellow' : 'green'} size="sm">
                      {analysisResult.details.technical.sentToMultiple ? 'Multiple Recipients' : 'Single Recipient'}
                    </Badge>
                  </Group>
                </div>

                <Divider size="xs" />

                <div>
                  <Text size="sm" fw={600} mb="xs">Text Analysis</Text>
                  <Text size="xs" mb="xs">Uppercase Ratio: {((analysisResult.details.technical.uppercaseRatio || 0) * 100).toFixed(1)}%</Text>
                  <Group gap="xs" mb="sm">
                    <Badge variant="outline" color={analysisResult.details.technical.excessiveExclamations ? 'red' : 'green'} size="sm">
                      {analysisResult.details.technical.excessiveExclamations ? 'Excessive !!!' : 'Normal Punctuation'}
                    </Badge>
                    <Badge variant="outline" color={analysisResult.details.technical.containsUrgencyWords ? 'red' : 'green'} size="sm">
                      {analysisResult.details.technical.containsUrgencyWords ? 'Urgency Words' : 'No Urgency'}
                    </Badge>
                    <Badge variant="outline" color={analysisResult.details.technical.containsElectionTerms ? 'yellow' : 'green'} size="sm">
                      {analysisResult.details.technical.containsElectionTerms ? 'Election Terms' : 'No Election Terms'}
                    </Badge>
                  </Group>
                </div>

                <Divider size="xs" />

                <div>
                  <Text size="sm" fw={600} mb="xs">Security Indicators</Text>
                  <Group gap="xs" mb="sm">
                    <Badge variant="outline" color={analysisResult.details.technical.hasTrackingPixel ? 'red' : 'green'} size="sm">
                      {analysisResult.details.technical.hasTrackingPixel ? 'Tracking Pixel' : 'No Tracking'}
                    </Badge>
                    <Badge variant="outline" color={analysisResult.details.technical.isHtmlOnly ? 'yellow' : 'green'} size="sm">
                      {analysisResult.details.technical.isHtmlOnly ? 'HTML Only' : 'Text+HTML'}
                    </Badge>
                    <Badge variant="outline" color={analysisResult.details.technical.replyToDiffersFromFrom ? 'red' : 'green'} size="sm">
                      {analysisResult.details.technical.replyToDiffersFromFrom ? 'Reply-To Spoofed' : 'Reply-To OK'}
                    </Badge>
                  </Group>
                </div>

                <div>
                  <Text size="sm" fw={600} mb="xs">Campaign & Content</Text>
                  <Group gap="xs" mb="sm">
                    <Badge variant="outline" color={analysisResult.details.technical.campaignIdentifierPresent ? 'blue' : 'gray'} size="sm">
                      {analysisResult.details.technical.campaignIdentifierPresent ? 'Campaign Headers' : 'No Campaign'}
                    </Badge>
                    <Badge variant="outline" color={analysisResult.details.technical.containsFeedbackLoopHeader ? 'blue' : 'gray'} size="sm">
                      {analysisResult.details.technical.containsFeedbackLoopHeader ? 'FBL Headers' : 'No FBL'}
                    </Badge>
                    <Badge variant="outline" color={analysisResult.details.technical.containsObfuscatedText ? 'red' : 'green'} size="sm">
                      {analysisResult.details.technical.containsObfuscatedText ? 'Obfuscated Text' : 'Clear Text'}
                    </Badge>
                  </Group>
                </div>

                <Divider size="xs" />

                <div>
                  <Text size="sm" fw={600} mb="xs">Link Analysis</Text>
                  <Group gap="xs" mb="sm">
                    <Badge variant="outline" color={analysisResult.details.technical.linkDisplayMismatch ? 'red' : 'green'} size="sm">
                      {analysisResult.details.technical.linkDisplayMismatch ? 'Link Mismatch' : 'Links OK'}
                    </Badge>
                    <Badge variant="outline" color={analysisResult.details.technical.containsShortenedUrls ? 'yellow' : 'green'} size="sm">
                      {analysisResult.details.technical.containsShortenedUrls ? 'Shortened URLs' : 'Direct URLs'}
                    </Badge>
                    <Badge variant="outline" color={analysisResult.details.technical.usesEncodedUrls ? 'yellow' : 'green'} size="sm">
                      {analysisResult.details.technical.usesEncodedUrls ? 'Encoded URLs' : 'Plain URLs'}
                    </Badge>
                  </Group>
                </div>

                <Divider size="xs" />

                <div>
                  <Text size="sm" fw={600} mb="xs">MIME Structure</Text>
                  <Group gap="xs" mb="sm">
                    <Badge variant="outline" color={analysisResult.details.technical.hasMixedContentTypes ? 'yellow' : 'green'} size="sm">
                      {analysisResult.details.technical.hasMixedContentTypes ? 'Mixed MIME' : 'Simple MIME'}
                    </Badge>
                    <Badge variant="outline" color={analysisResult.details.technical.hasNestedMultipart ? 'yellow' : 'green'} size="sm">
                      {analysisResult.details.technical.hasNestedMultipart ? 'Nested MIME' : 'Flat MIME'}
                    </Badge>
                    <Badge variant="outline" color={analysisResult.details.technical.boundaryAnomaly ? 'red' : 'green'} size="sm">
                      {analysisResult.details.technical.boundaryAnomaly ? 'Boundary Anomaly' : 'Boundary OK'}
                    </Badge>
                    <Badge variant="outline" color={analysisResult.details.technical.hasFakeMultipartAlternative ? 'red' : 'green'} size="sm">
                      {analysisResult.details.technical.hasFakeMultipartAlternative ? 'Fake Alternative' : 'Valid Alternative'}
                    </Badge>
                  </Group>
                </div>

                <Divider size="xs" />

                <div>
                  <Text size="sm" fw={600} mb="xs">Spam Detection</Text>
                  <Group gap="xs" mb="sm">
                    <Badge variant="outline" color={analysisResult.details.technical.isImageHeavy ? 'red' : 'green'} size="sm">
                      {analysisResult.details.technical.isImageHeavy ? 'Image Heavy' : 'Balanced Content'}
                    </Badge>
                    <Badge variant="outline" color={analysisResult.details.technical.hasRepeatedLinks ? 'red' : 'green'} size="sm">
                      {analysisResult.details.technical.hasRepeatedLinks ? 'Repeated Links' : 'Diverse Links'}
                    </Badge>
                  </Group>
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
            <Flex align="center" gap="xs" mb="md">
              <IconBrain size={20} />
              <Title order={2} size="h3">NLP Analysis</Title>
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