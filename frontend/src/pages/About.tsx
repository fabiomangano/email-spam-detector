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
  ScrollArea,
} from '@mantine/core';
import {
  IconShield,
  IconBrain,
  IconChartBar,
  IconSettings,
  IconLock,
  IconBolt,
} from '@tabler/icons-react';

const About: React.FC = () => {
  return (
    <div style={{ padding: "20px", paddingBottom: "200px", minHeight: "calc(100vh - 60px)" }}>
      <Container size="lg">
        <ScrollArea.Autosize 
          mah="calc(100vh - 280px)"
          scrollbars="y"
          styles={{
            thumb: {
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
            },
          }}
        >
          <Stack gap="xl">
        {/* Header */}
        <Box ta="center">
          <Group justify="center" gap="md" mb="md">
            <IconShield size={48} color="#262626" />
            <Title
              order={1}
              size="h1"
              style={{
                color: '#262626',
                fontWeight: 800,
                letterSpacing: '-0.025em',
              }}
            >
              About SpamShield
            </Title>
          </Group>
          <Text size="lg" c="dimmed" maw={700} mx="auto">
            Advanced email security analysis platform powered by machine learning 
            and natural language processing technologies.
          </Text>
        </Box>

        {/* Main Description */}
        <Paper p="xl" radius="md" style={{ backgroundColor: '#ffffff', border: '1px solid #e5e5e5' }}>
          <Stack gap="lg">
            <Title order={2} c="gray.8">
              What is SpamShield?
            </Title>
            <Text size="md" c="dimmed">
              SpamShield is a comprehensive email security analysis platform designed to protect 
              organizations from spam, phishing attempts, and malicious email content. Our platform 
              combines traditional natural language processing techniques with cutting-edge language 
              models to provide accurate and reliable email threat detection.
            </Text>
            <Text size="md" c="dimmed">
              Whether you're analyzing suspicious emails or configuring detection parameters, 
              SpamShield provides the tools and insights you need to maintain email security.
            </Text>
          </Stack>
        </Paper>

        {/* Accordion for organized content */}
        <Accordion variant="separated" radius="md">
          <Accordion.Item key="features" value="features">
            <Accordion.Control>
              <Title order={3} c="gray.8">
                Key Features
              </Title>
            </Accordion.Control>
            <Accordion.Panel>
              <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
                <Card padding="lg" radius="md" style={{ border: '1px solid #e5e5e5' }}>
                  <Group gap="md" align="flex-start">
                    <ThemeIcon
                      size={40}
                      radius="md"
                      color="blue"
                      style={{
                        backgroundColor: 'var(--mantine-color-blue-0)',
                        color: 'var(--mantine-color-blue-6)',
                      }}
                    >
                      <IconChartBar size={20} />
                    </ThemeIcon>
                    <Stack gap="xs" style={{ flex: 1 }}>
                      <Title order={4} style={{ color: '#262626' }}>
                        NLP Analysis
                      </Title>
                      <Text size="sm" c="dimmed">
                        Traditional natural language processing pipeline for email content analysis
                      </Text>
                    </Stack>
                  </Group>
                </Card>

                <Card padding="lg" radius="md" style={{ border: '1px solid #e5e5e5' }}>
                  <Group gap="md" align="flex-start">
                    <ThemeIcon
                      size={40}
                      radius="md"
                      color="violet"
                      style={{
                        backgroundColor: 'var(--mantine-color-violet-0)',
                        color: 'var(--mantine-color-violet-6)',
                      }}
                    >
                      <IconBrain size={20} />
                    </ThemeIcon>
                    <Stack gap="xs" style={{ flex: 1 }}>
                      <Title order={4} style={{ color: '#262626' }}>
                        LLM Integration
                      </Title>
                      <Text size="sm" c="dimmed">
                        Advanced language model analysis for sophisticated threat detection
                      </Text>
                    </Stack>
                  </Group>
                </Card>

                <Card padding="lg" radius="md" style={{ border: '1px solid #e5e5e5' }}>
                  <Group gap="md" align="flex-start">
                    <ThemeIcon
                      size={40}
                      radius="md"
                      color="green"
                      style={{
                        backgroundColor: 'var(--mantine-color-green-0)',
                        color: 'var(--mantine-color-green-6)',
                      }}
                    >
                      <IconSettings size={20} />
                    </ThemeIcon>
                    <Stack gap="xs" style={{ flex: 1 }}>
                      <Title order={4} style={{ color: '#262626' }}>
                        Configurable Pipeline
                      </Title>
                      <Text size="sm" c="dimmed">
                        Customizable analysis parameters and detection thresholds
                      </Text>
                    </Stack>
                  </Group>
                </Card>

                <Card padding="lg" radius="md" style={{ border: '1px solid #e5e5e5' }}>
                  <Group gap="md" align="flex-start">
                    <ThemeIcon
                      size={40}
                      radius="md"
                      color="orange"
                      style={{
                        backgroundColor: 'var(--mantine-color-orange-0)',
                        color: 'var(--mantine-color-orange-6)',
                      }}
                    >
                      <IconLock size={20} />
                    </ThemeIcon>
                    <Stack gap="xs" style={{ flex: 1 }}>
                      <Title order={4} style={{ color: '#262626' }}>
                        Secure Processing
                      </Title>
                      <Text size="sm" c="dimmed">
                        Secure email processing with privacy protection measures
                      </Text>
                    </Stack>
                  </Group>
                </Card>

                <Card padding="lg" radius="md" style={{ border: '1px solid #e5e5e5' }}>
                  <Group gap="md" align="flex-start">
                    <ThemeIcon
                      size={40}
                      radius="md"
                      color="teal"
                      style={{
                        backgroundColor: 'var(--mantine-color-teal-0)',
                        color: 'var(--mantine-color-teal-6)',
                      }}
                    >
                      <IconBolt size={20} />
                    </ThemeIcon>
                    <Stack gap="xs" style={{ flex: 1 }}>
                      <Title order={4} style={{ color: '#262626' }}>
                        Real-time Analysis
                      </Title>
                      <Text size="sm" c="dimmed">
                        Fast processing and immediate results for uploaded emails
                      </Text>
                    </Stack>
                  </Group>
                </Card>

                <Card padding="lg" radius="md" style={{ border: '1px solid #e5e5e5' }}>
                  <Group gap="md" align="flex-start">
                    <ThemeIcon
                      size={40}
                      radius="md"
                      color="grape"
                      style={{
                        backgroundColor: 'var(--mantine-color-grape-0)',
                        color: 'var(--mantine-color-grape-6)',
                      }}
                    >
                      <IconChartBar size={20} />
                    </ThemeIcon>
                    <Stack gap="xs" style={{ flex: 1 }}>
                      <Title order={4} style={{ color: '#262626' }}>
                        Detailed Reports
                      </Title>
                      <Text size="sm" c="dimmed">
                        Comprehensive analysis reports with risk assessment metrics
                      </Text>
                    </Stack>
                  </Group>
                </Card>
              </SimpleGrid>
            </Accordion.Panel>
          </Accordion.Item>

          <Accordion.Item key="how-it-works" value="how-it-works">
            <Accordion.Control>
              <Title order={3} c="gray.8">
                How SpamShield Works
              </Title>
            </Accordion.Control>
            <Accordion.Panel>
              <List spacing="md" size="md" c="dimmed">
                <List.Item>
                  <strong>Upload:</strong> Submit email files or content through the upload interface
                </List.Item>
                <List.Item>
                  <strong>Analysis:</strong> Choose between NLP pipeline or LLM-based analysis methods
                </List.Item>
                <List.Item>
                  <strong>Processing:</strong> Our algorithms analyze content, headers, and patterns
                </List.Item>
                <List.Item>
                  <strong>Results:</strong> Receive detailed reports with threat assessments and recommendations
                </List.Item>
                <List.Item>
                  <strong>Configuration:</strong> Adjust detection parameters based on your organization's needs
                </List.Item>
              </List>
            </Accordion.Panel>
          </Accordion.Item>
        </Accordion>
          </Stack>
        </ScrollArea.Autosize>
      </Container>
    </div>
  );
};

export default About;