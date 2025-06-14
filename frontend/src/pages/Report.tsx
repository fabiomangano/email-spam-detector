import {
  Badge,
  Button,
  Card,
  Flex,
  Grid,
  List,
  Progress,
  Space,
  Text,
  Title,
  Alert,
  Group,
  Stack,
  Code,
  ScrollArea,
} from "@mantine/core";
import { 
  IconArrowLeft, 
  IconSettings,
  IconBrain,
  IconFileText,
  IconCode,
} from "@tabler/icons-react";
import { useAnalysis } from "../contexts/AnalysisContext";
import { Link } from "react-router";

function Report() {
  const { analysisResult } = useAnalysis();

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
          variant="subtle" 
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
                <div>
                  <Text size="sm" fw={600} mb="xs">Email Headers</Text>
                  <Text size="xs" mb="xs">Subject: {analysisResult.details?.parsing?.parsed?.subject || 'N/A'}</Text>
                  <Text size="xs" mb="xs">From: {analysisResult.details?.parsing?.parsed?.from || 'N/A'}</Text>
                  <Text size="xs" mb="xs">To: {analysisResult.details?.parsing?.parsed?.to || 'N/A'}</Text>
                  <Text size="xs" mb="sm">Date: {analysisResult.details?.parsing?.parsed?.date || 'N/A'}</Text>
                </div>
                
                <div>
                  <Text size="sm" fw={600} mb="xs">Content Structure</Text>
                  <Text size="xs" mb="xs">Has HTML: {analysisResult.details?.parsing?.parsed?.html ? 'Yes' : 'No'}</Text>
                  <Text size="xs" mb="xs">Has Plain Text: {analysisResult.details?.parsing?.parsed?.text ? 'Yes' : 'No'}</Text>
                  <Text size="xs" mb="sm">Attachments: {analysisResult.details?.parsing?.parsed?.attachments?.length || 0}</Text>
                </div>

                {analysisResult.details?.parsing?.parsed?.text && (
                  <div>
                    <Text size="sm" fw={600} mb="xs">Text Content Preview</Text>
                    <Code block style={{ maxHeight: '100px', overflow: 'auto' }}>
                      {analysisResult.details.parsing.parsed.text.substring(0, 200)}...
                    </Code>
                  </div>
                )}
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

        {/* Behavioral Analysis Card */}
        <Grid.Col span={6}>
          <Card padding="lg" radius="md" h="400px">
            <Flex align="center" gap="xs" mb="md">
              <IconFileText size={20} />
              <Title order={5} size="h5">Behavioral Analysis</Title>
            </Flex>
            <ScrollArea h={320}>
              <Stack gap="sm">
                <div>
                  <Text size="sm" fw={600} mb="xs">Urgency Score</Text>
                  <Progress 
                    value={analysisResult.details.behavior.urgency.score * 100} 
                    color="orange" 
                    size="lg" 
                    mb="xs"
                  />
                  <Text size="xs" c="dimmed">{Math.round(analysisResult.details.behavior.urgency.score * 100)}%</Text>
                  
                  {analysisResult.details.behavior.urgency.indicators.length > 0 && (
                    <div style={{ marginTop: '8px' }}>
                      <Text size="xs" fw={500} mb="xs">Indicators:</Text>
                      <List size="xs">
                        {analysisResult.details.behavior.urgency.indicators.map((indicator, index) => (
                          <List.Item key={index}>{indicator}</List.Item>
                        ))}
                      </List>
                    </div>
                  )}
                </div>
                
                <div>
                  <Text size="sm" fw={600} mb="xs">Social Engineering Score</Text>
                  <Progress 
                    value={analysisResult.details.behavior.socialEngineering.score * 100} 
                    color="red" 
                    size="lg" 
                    mb="xs"
                  />
                  <Text size="xs" c="dimmed">{Math.round(analysisResult.details.behavior.socialEngineering.score * 100)}%</Text>
                  
                  {analysisResult.details.behavior.socialEngineering.techniques.length > 0 && (
                    <div style={{ marginTop: '8px' }}>
                      <Text size="xs" fw={500} mb="xs">Techniques:</Text>
                      <List size="xs">
                        {analysisResult.details.behavior.socialEngineering.techniques.map((technique, index) => (
                          <List.Item key={index}>{technique}</List.Item>
                        ))}
                      </List>
                    </div>
                  )}
                </div>
                
                <div>
                  <Text size="sm" fw={600} mb="xs">Pattern Analysis</Text>
                  <Text size="xs" c="dimmed" mb="xs">
                    {analysisResult.details.behavior.patterns.analysis}
                  </Text>
                  
                  {analysisResult.details.behavior.patterns.suspicious.length > 0 && (
                    <div>
                      <Text size="xs" fw={500} mb="xs">Suspicious Patterns:</Text>
                      <List size="xs">
                        {analysisResult.details.behavior.patterns.suspicious.map((pattern, index) => (
                          <List.Item key={index}>{pattern}</List.Item>
                        ))}
                      </List>
                    </div>
                  )}
                </div>
              </Stack>
            </ScrollArea>
          </Card>
        </Grid.Col>
      </Grid>
    </div>
  );
}

export default Report;