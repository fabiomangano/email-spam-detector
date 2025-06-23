import React from 'react';
import {
  Container,
  Paper,
  Title,
  Text,
  Stack,
  Group,
  ThemeIcon,
  Box,
  SimpleGrid,
  Card,
  List,
  Accordion,
  Alert,
  Badge,
  Divider,
  Code,
} from '@mantine/core';
import {
  IconBook,
  IconUpload,
  IconAnalyze,
  IconReport,
  IconSettings,
  IconShield,
  IconAlertTriangle,
  IconInfoCircle,
  IconBulb,
  IconChartBar,
} from '@tabler/icons-react';

const Guide: React.FC = () => {
  return (
    <Container size="lg" py="xl" style={{ height: 'calc(100vh - 120px)', overflow: 'hidden' }}>
      <Stack gap="xl" style={{ height: '100%' }}>
        {/* Header */}
        <Box ta="center">
          <Group justify="center" gap="md" mb="md">
            <IconBook size={48} color="#262626" />
            <Title
              order={1}
              size="h1"
              style={{
                color: '#262626',
                fontWeight: 800,
                letterSpacing: '-0.025em',
              }}
            >
              User Guide
            </Title>
          </Group>
          <Text size="lg" c="dimmed" maw={700} mx="auto">
            Complete guide to using SpamShield for email security analysis
          </Text>
        </Box>

        {/* Main Content Accordion */}
        <div style={{ flex: 1, overflow: 'auto', paddingRight: '8px' }}>
        <Accordion variant="separated" radius="md" defaultValue="getting-started">
          <Accordion.Item key="getting-started" value="getting-started">
            <Accordion.Control>
              <Group gap="md">
                <ThemeIcon size={30} radius="md" color="blue">
                  <IconInfoCircle size={16} />
                </ThemeIcon>
                <Title order={2} c="gray.8">
                  Getting Started
                </Title>
              </Group>
            </Accordion.Control>
            <Accordion.Panel>
              <Stack gap="lg">
                <Text size="md" c="dimmed">
                  SpamShield provides multiple analysis methods to detect spam and phishing emails. 
                  Choose the method that best suits your security requirements and technical needs.
                </Text>
                
                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
                  <Card padding="lg" radius="md" style={{ border: '1px solid #e5e5e5' }}>
                    <Stack gap="sm">
                      <Badge color="green" variant="light">Recommended</Badge>
                      <Title order={4}>NLP Analysis</Title>
                      <Text size="sm" c="dimmed">
                        Traditional natural language processing with machine learning. 
                        Fast, reliable, and works offline.
                      </Text>
                    </Stack>
                  </Card>
                  
                  <Card padding="lg" radius="md" style={{ border: '1px solid #e5e5e5' }}>
                    <Stack gap="sm">
                      <Badge color="violet" variant="light">Advanced</Badge>
                      <Title order={4}>LLM Analysis</Title>
                      <Text size="sm" c="dimmed">
                        Advanced language model analysis for sophisticated threats. 
                        Requires API configuration.
                      </Text>
                    </Stack>
                  </Card>
                </SimpleGrid>
              </Stack>
            </Accordion.Panel>
          </Accordion.Item>
          <Accordion.Item key="step1" value="step1">
            <Accordion.Control>
              <Group gap="md">
                <ThemeIcon size={30} radius="md" color="blue">
                  <IconUpload size={16} />
                </ThemeIcon>
                <Title order={3} c="gray.8">
                  Step 1: Upload Email
                </Title>
              </Group>
            </Accordion.Control>
            <Accordion.Panel>
              <Stack gap="md">
                <Text size="md" c="dimmed">
                  Upload your email file for analysis using one of these methods:
                </Text>
                
                <List spacing="sm" size="md" c="dimmed">
                  <List.Item>
                    <strong>File Upload:</strong> Navigate to "Upload" or "LLM Upload" and select your email file (.eml, .msg, .txt)
                  </List.Item>
                  <List.Item>
                    <strong>Text Input:</strong> Copy and paste email content directly into the text area
                  </List.Item>
                  <List.Item>
                    <strong>Drag & Drop:</strong> Simply drag email files onto the upload area
                  </List.Item>
                </List>

                <Alert icon={<IconInfoCircle size={16} />} color="blue" variant="light">
                  <Text size="sm">
                    <strong>Supported formats:</strong> .eml (standard email), .msg (Outlook), .txt (plain text)
                  </Text>
                </Alert>
              </Stack>
            </Accordion.Panel>
          </Accordion.Item>

          <Accordion.Item key="step2" value="step2">
            <Accordion.Control>
              <Group gap="md">
                <ThemeIcon size={30} radius="md" color="violet">
                  <IconAnalyze size={16} />
                </ThemeIcon>
                <Title order={3} c="gray.8">
                  Step 2: Choose Analysis Method
                </Title>
              </Group>
            </Accordion.Control>
            <Accordion.Panel>
              <Stack gap="md">
                <Text size="md" c="dimmed">
                  Select the appropriate analysis method for your needs:
                </Text>

                <SimpleGrid cols={1} spacing="md">
                  <Card padding="md" radius="md" style={{ border: '1px solid #e5e5e5' }}>
                    <Stack gap="xs">
                      <Group gap="md">
                        <ThemeIcon size={30} radius="md" color="green">
                          <IconChartBar size={16} />
                        </ThemeIcon>
                        <Title order={4}>NLP Pipeline Analysis</Title>
                      </Group>
                      <Text size="sm" c="dimmed">
                        Uses traditional machine learning and natural language processing:
                      </Text>
                      <List size="sm" c="dimmed">
                        <List.Item>Header analysis (sender, recipients, routing)</List.Item>
                        <List.Item>Content analysis (keywords, patterns, language)</List.Item>
                        <List.Item>Technical indicators (domain reputation, links)</List.Item>
                        <List.Item>Statistical analysis and scoring</List.Item>
                      </List>
                    </Stack>
                  </Card>

                  <Card padding="md" radius="md" style={{ border: '1px solid #e5e5e5' }}>
                    <Stack gap="xs">
                      <Group gap="md">
                        <ThemeIcon size={30} radius="md" color="violet">
                          <IconAnalyze size={16} />
                        </ThemeIcon>
                        <Title order={4}>LLM-Enhanced Analysis</Title>
                      </Group>
                      <Text size="sm" c="dimmed">
                        Advanced analysis using large language models:
                      </Text>
                      <List size="sm" c="dimmed">
                        <List.Item>Context-aware content understanding</List.Item>
                        <List.Item>Social engineering detection</List.Item>
                        <List.Item>Sophisticated phishing identification</List.Item>
                        <List.Item>Natural language reasoning</List.Item>
                      </List>
                    </Stack>
                  </Card>
                </SimpleGrid>
              </Stack>
            </Accordion.Panel>
          </Accordion.Item>

          <Accordion.Item key="step3" value="step3">
            <Accordion.Control>
              <Group gap="md">
                <ThemeIcon size={30} radius="md" color="orange">
                  <IconReport size={16} />
                </ThemeIcon>
                <Title order={3} c="gray.8">
                  Step 3: Review Results
                </Title>
              </Group>
            </Accordion.Control>
            <Accordion.Panel>
              <Stack gap="md">
                <Text size="md" c="dimmed">
                  After analysis, you'll receive a comprehensive report including:
                </Text>

                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                  <List spacing="sm" size="md" c="dimmed">
                    <List.Item>
                      <strong>Risk Score:</strong> Overall threat assessment (0-100)
                    </List.Item>
                    <List.Item>
                      <strong>Classification:</strong> Ham, Spam, or Phishing
                    </List.Item>
                    <List.Item>
                      <strong>Confidence Level:</strong> How certain the analysis is
                    </List.Item>
                    <List.Item>
                      <strong>Risk Factors:</strong> Specific indicators found
                    </List.Item>
                  </List>
                  
                  <List spacing="sm" size="md" c="dimmed">
                    <List.Item>
                      <strong>Technical Details:</strong> Header analysis results
                    </List.Item>
                    <List.Item>
                      <strong>Content Analysis:</strong> Keyword and pattern matches
                    </List.Item>
                    <List.Item>
                      <strong>Recommendations:</strong> Suggested actions
                    </List.Item>
                    <List.Item>
                      <strong>Reasoning:</strong> Why the classification was made
                    </List.Item>
                  </List>
                </SimpleGrid>

                <Divider my="sm" />

                <Title order={5} c="gray.8">Understanding Risk Scores</Title>
                <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
                  <Alert color="green" variant="light">
                    <Text size="sm"><strong>Low Risk (0-30):</strong> Likely legitimate email</Text>
                  </Alert>
                  <Alert color="yellow" variant="light">
                    <Text size="sm"><strong>Medium Risk (31-70):</strong> Suspicious, review carefully</Text>
                  </Alert>
                  <Alert color="red" variant="light">
                    <Text size="sm"><strong>High Risk (71-100):</strong> Likely spam/phishing</Text>
                  </Alert>
                </SimpleGrid>
              </Stack>
            </Accordion.Panel>
          </Accordion.Item>

          <Accordion.Item key="configuration" value="configuration">
            <Accordion.Control>
              <Group gap="md">
                <ThemeIcon size={30} radius="md" color="teal">
                  <IconSettings size={16} />
                </ThemeIcon>
                <Title order={3} c="gray.8">
                  Configuration & Settings
                </Title>
              </Group>
            </Accordion.Control>
            <Accordion.Panel>
              <Stack gap="md">
                <Text size="md" c="dimmed">
                  Customize SpamShield's behavior through the Pipeline configuration:
                </Text>

                <Card padding="lg" radius="md" style={{ border: '1px solid #e5e5e5' }}>
                  <Stack gap="sm">
                    <Title order={4}>Detection Thresholds</Title>
                    <Text size="sm" c="dimmed">
                      Adjust sensitivity levels for different types of analysis:
                    </Text>
                    <List size="sm" c="dimmed">
                      <List.Item><Code>low</Code>: Conservative detection (fewer false positives)</List.Item>
                      <List.Item><Code>medium</Code>: Balanced approach (recommended)</List.Item>
                      <List.Item><Code>high</Code>: Aggressive detection (catches more threats)</List.Item>
                    </List>
                  </Stack>
                </Card>

                <Card padding="lg" radius="md" style={{ border: '1px solid #e5e5e5' }}>
                  <Stack gap="sm">
                    <Title order={4}>Analysis Weights</Title>
                    <Text size="sm" c="dimmed">
                      Control how different analysis components contribute to the final score:
                    </Text>
                    <List size="sm" c="dimmed">
                      <List.Item><strong>Technical Analysis:</strong> Headers, domains, routing</List.Item>
                      <List.Item><strong>NLP Analysis:</strong> Content and language patterns</List.Item>
                      <List.Item><strong>LLM Analysis:</strong> Advanced reasoning (if enabled)</List.Item>
                    </List>
                  </Stack>
                </Card>
              </Stack>
            </Accordion.Panel>
          </Accordion.Item>

          <Accordion.Item key="feedback" value="feedback">
            <Accordion.Control>
              <Group gap="md">
                <ThemeIcon size={30} radius="md" color="grape">
                  <IconShield size={16} />
                </ThemeIcon>
                <Title order={3} c="gray.8">
                  Feedback & Training
                </Title>
              </Group>
            </Accordion.Control>
            <Accordion.Panel>
              <Stack gap="md">
                <Text size="md" c="dimmed">
                  Help improve SpamShield's accuracy by providing feedback on analysis results:
                </Text>

                <List spacing="md" size="md" c="dimmed">
                  <List.Item>
                    <strong>Correct Classifications:</strong> Confirm when the system correctly identifies spam or legitimate emails
                  </List.Item>
                  <List.Item>
                    <strong>False Positives:</strong> Report legitimate emails that were incorrectly flagged as spam
                  </List.Item>
                  <List.Item>
                    <strong>False Negatives:</strong> Report spam emails that weren't detected
                  </List.Item>
                  <List.Item>
                    <strong>Model Retraining:</strong> Use accumulated feedback to retrain the classification model
                  </List.Item>
                </List>

                <Alert icon={<IconInfoCircle size={16} />} color="blue" variant="light">
                  <Text size="sm">
                    Your feedback helps the system learn and improve over time. 
                    All feedback is processed securely and helps enhance detection accuracy.
                  </Text>
                </Alert>
              </Stack>
            </Accordion.Panel>
          </Accordion.Item>

          <Accordion.Item key="troubleshooting" value="troubleshooting">
            <Accordion.Control>
              <Group gap="md">
                <ThemeIcon size={30} radius="md" color="red">
                  <IconAlertTriangle size={16} />
                </ThemeIcon>
                <Title order={3} c="gray.8">
                  Troubleshooting
                </Title>
              </Group>
            </Accordion.Control>
            <Accordion.Panel>
              <Stack gap="md">
                <Title order={4} c="gray.8">Common Issues</Title>
                
                <Accordion variant="contained" radius="sm">
                  <Accordion.Item key="upload-issues" value="upload-issues">
                    <Accordion.Control>
                      <Text size="sm" fw={500}>Upload fails or file not recognized</Text>
                    </Accordion.Control>
                    <Accordion.Panel>
                      <List size="sm" c="dimmed">
                        <List.Item>Ensure file format is supported (.eml, .msg, .txt)</List.Item>
                        <List.Item>Check file size (maximum 10MB)</List.Item>
                        <List.Item>Verify file is not corrupted</List.Item>
                        <List.Item>Try copying content as plain text instead</List.Item>
                      </List>
                    </Accordion.Panel>
                  </Accordion.Item>

                  <Accordion.Item key="analysis-errors" value="analysis-errors">
                    <Accordion.Control>
                      <Text size="sm" fw={500}>Analysis takes too long or fails</Text>
                    </Accordion.Control>
                    <Accordion.Panel>
                      <List size="sm" c="dimmed">
                        <List.Item>Large emails may take longer to process</List.Item>
                        <List.Item>LLM analysis requires valid API configuration</List.Item>
                        <List.Item>Check network connectivity for LLM services</List.Item>
                        <List.Item>Try NLP analysis as an alternative</List.Item>
                      </List>
                    </Accordion.Panel>
                  </Accordion.Item>

                  <Accordion.Item key="unexpected-results" value="unexpected-results">
                    <Accordion.Control>
                      <Text size="sm" fw={500}>Unexpected classification results</Text>
                    </Accordion.Control>
                    <Accordion.Panel>
                      <List size="sm" c="dimmed">
                        <List.Item>Review the detailed analysis report for reasoning</List.Item>
                        <List.Item>Check if email contains technical jargon or unusual formatting</List.Item>
                        <List.Item>Consider adjusting detection thresholds in Pipeline settings</List.Item>
                        <List.Item>Provide feedback to help improve future classifications</List.Item>
                      </List>
                    </Accordion.Panel>
                  </Accordion.Item>
                </Accordion>
              </Stack>
            </Accordion.Panel>
          </Accordion.Item>
          <Accordion.Item key="best-practices" value="best-practices">
            <Accordion.Control>
              <Group gap="md">
                <ThemeIcon size={30} radius="md" color="green">
                  <IconBulb size={16} />
                </ThemeIcon>
                <Title order={3} c="gray.8">
                  Best Practices
                </Title>
              </Group>
            </Accordion.Control>
            <Accordion.Panel>
              <Stack gap="md">
                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
                  <Stack gap="sm">
                    <Title order={4} c="gray.8">For Accurate Analysis</Title>
                    <List size="sm" c="dimmed">
                      <List.Item>Include complete email headers when possible</List.Item>
                      <List.Item>Use original email files rather than forwarded copies</List.Item>
                      <List.Item>Analyze suspicious emails promptly</List.Item>
                      <List.Item>Review analysis reasoning for context</List.Item>
                    </List>
                  </Stack>
                  
                  <Stack gap="sm">
                    <Title order={4} c="gray.8">For Security</Title>
                    <List size="sm" c="dimmed">
                      <List.Item>Never click links in suspicious emails</List.Item>
                      <List.Item>Don't enter credentials in flagged emails</List.Item>
                      <List.Item>Report confirmed threats to your IT team</List.Item>
                      <List.Item>Keep SpamShield updated with feedback</List.Item>
                    </List>
                  </Stack>
                </SimpleGrid>
              </Stack>
            </Accordion.Panel>
          </Accordion.Item>
        </Accordion>
        </div>
      </Stack>
    </Container>
  );
};

export default Guide;