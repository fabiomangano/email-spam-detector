import {
  Badge,
  Button,
  Card,
  Flex,
  Grid,
  List,
  Progress,
  Text,
  Title,
  Alert,
  Stack,
  Group,
  Divider,
  ScrollArea,
} from "@mantine/core";
import { 
  IconArrowLeft, 
  IconShield, 
  IconAlertTriangle,
  IconSettings,
  IconRefresh,
  IconBrain,
  IconCode,
  IconEye,
  IconLock,
  IconExclamationCircle,
} from "@tabler/icons-react";
import { useAnalysis } from "../contexts/AnalysisContext";
import { Link, useNavigate } from "react-router";

function Risk() {
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

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low': return 'green';
      case 'medium': return 'yellow';
      case 'high': return 'red';
      default: return 'gray';
    }
  };

  const getRiskColorHex = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low': return '#22c55e';
      case 'medium': return '#eab308';
      case 'high': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getRiskIcon = (riskLevel: string) => {
    const color = getRiskColorHex(riskLevel);
    switch (riskLevel) {
      case 'low': return <IconShield size={20} style={{ color }} />;
      case 'medium': case 'high': return <IconAlertTriangle size={20} style={{ color }} />;
      default: return <IconShield size={20} style={{ color }} />;
    }
  };

  // Generate detailed risk explanations
  const generateRiskExplanations = () => {
    const explanations = [];
    const technical = analysisResult.details.technical;
    const nlp = analysisResult.details.nlp;

    // Technical Risk Factors
    if (technical.linkRatio > 0.3) {
      explanations.push({
        category: 'Technical',
        severity: technical.linkRatio > 0.6 ? 'high' : 'medium',
        title: 'High Link-to-Text Ratio',
        description: `This email has a link ratio of ${(technical.linkRatio * 100).toFixed(1)}%, which is ${technical.linkRatio > 0.6 ? 'significantly' : 'moderately'} higher than typical legitimate emails. Spam emails often contain excessive links to drive traffic or harvest clicks.`,
        impact: 'Increased risk of phishing or spam content',
        metrics: `${technical.numLinks} links detected in email body`
      });
    }

    if (technical.hasTrackingPixel) {
      explanations.push({
        category: 'Technical',
        severity: 'medium',
        title: 'Tracking Pixel Detected',
        description: 'This email contains tracking pixels - invisible images used to monitor when and how emails are opened. While common in marketing emails, they can indicate unsolicited bulk email or surveillance.',
        impact: 'Privacy concerns and potential spam classification',
        metrics: 'Hidden tracking elements found'
      });
    }

    if (technical.replyToDiffersFromFrom) {
      explanations.push({
        category: 'Technical',
        severity: 'high',
        title: 'Reply-To Address Mismatch',
        description: 'The Reply-To address differs from the From address, which is a common technique used in phishing and spam emails to redirect responses to different addresses controlled by attackers.',
        impact: 'High risk of email spoofing or phishing attempt',
        metrics: 'From and Reply-To headers point to different addresses'
      });
    }

    if (technical.fromDomainIsDisposable) {
      explanations.push({
        category: 'Technical',
        severity: 'high',
        title: 'Disposable Email Domain',
        description: 'The sender is using a disposable or temporary email service. These services are often used by spammers and malicious actors to avoid identification and accountability.',
        impact: 'Very high risk of spam or malicious content',
        metrics: 'Sender domain identified as disposable service'
      });
    }

    if (technical.containsShortenedUrls) {
      explanations.push({
        category: 'Technical',
        severity: 'medium',
        title: 'Shortened URLs Present',
        description: 'This email contains shortened URLs (bit.ly, tinyurl, etc.) which hide the actual destination. Attackers often use URL shorteners to disguise malicious links and bypass security filters.',
        impact: 'Potential for malicious link redirection',
        metrics: 'Shortened URL services detected in links'
      });
    }

    if (technical.uppercaseRatio > 0.3) {
      explanations.push({
        category: 'Technical',
        severity: 'medium',
        title: 'Excessive Uppercase Text',
        description: `${(technical.uppercaseRatio * 100).toFixed(1)}% of the email text is in uppercase. Excessive capitalization is a common spam technique used to grab attention and create urgency.`,
        impact: 'Spam-like content characteristics',
        metrics: `${(technical.uppercaseRatio * 100).toFixed(1)}% uppercase ratio detected`
      });
    }

    // Authentication Issues
    if (technical.spfResult === 'fail' || technical.dkimResult === 'fail' || technical.dmarcResult === 'fail') {
      explanations.push({
        category: 'Authentication',
        severity: 'high',
        title: 'Email Authentication Failure',
        description: `Email authentication checks failed: ${[technical.spfResult === 'fail' ? 'SPF' : null, technical.dkimResult === 'fail' ? 'DKIM' : null, technical.dmarcResult === 'fail' ? 'DMARC' : null].filter(Boolean).join(', ')}. This indicates the email may be forged or sent from an unauthorized server.`,
        impact: 'High risk of email spoofing or domain impersonation',
        metrics: `Authentication status: SPF=${technical.spfResult || 'unknown'}, DKIM=${technical.dkimResult || 'unknown'}, DMARC=${technical.dmarcResult || 'unknown'}`
      });
    }

    // NLP Risk Factors
    if (nlp.prediction === 'spam') {
      explanations.push({
        category: 'Content Analysis',
        severity: 'high',
        title: 'Content Classified as Spam',
        description: 'Our natural language processing model has classified this email content as spam based on linguistic patterns, word usage, and content structure commonly found in unsolicited emails.',
        impact: 'High likelihood of unwanted or malicious content',
        metrics: `NLP confidence: ${nlp.confidence ? (nlp.confidence * 100).toFixed(1) + '%' : 'High'}`
      });
    }

    if (nlp.toxicity.score > 0.5) {
      explanations.push({
        category: 'Content Analysis',
        severity: nlp.toxicity.score > 0.8 ? 'high' : 'medium',
        title: 'Toxic Content Detected',
        description: `The email content has a toxicity score of ${(nlp.toxicity.score * 100).toFixed(1)}%, indicating potentially harmful, offensive, or manipulative language. ${nlp.toxicity.categories ? 'Categories: ' + nlp.toxicity.categories.join(', ') : ''}`,
        impact: 'Risk of harmful or manipulative content',
        metrics: `Toxicity score: ${(nlp.toxicity.score * 100).toFixed(1)}%`
      });
    }

    if (nlp.sentiment.label === 'NEGATIVE' && nlp.sentiment.score < -0.5) {
      explanations.push({
        category: 'Content Analysis',
        severity: 'medium',
        title: 'Highly Negative Sentiment',
        description: `The email content expresses strongly negative sentiment (score: ${nlp.sentiment.score.toFixed(2)}). While not inherently malicious, extremely negative content can indicate aggressive marketing, threats, or emotional manipulation tactics.`,
        impact: 'Potential emotional manipulation or aggressive marketing',
        metrics: `Sentiment: ${nlp.sentiment.label} (${nlp.sentiment.score.toFixed(2)})`
      });
    }

    if (nlp.nlpMetrics && nlp.nlpMetrics.spamWordRatio > 0.1) {
      explanations.push({
        category: 'Content Analysis',
        severity: nlp.nlpMetrics.spamWordRatio > 0.2 ? 'high' : 'medium',
        title: 'High Spam Word Density',
        description: `${(nlp.nlpMetrics.spamWordRatio * 100).toFixed(1)}% of the email content consists of words commonly found in spam emails. This includes terms related to urgent offers, financial schemes, and suspicious calls-to-action.`,
        impact: 'Strong indication of spam or promotional content',
        metrics: `${nlp.nlpMetrics.numSpammyWords} spam words found (${(nlp.nlpMetrics.spamWordRatio * 100).toFixed(1)}% ratio)`
      });
    }

    if (technical.containsUrgencyWords) {
      explanations.push({
        category: 'Content Analysis',
        severity: 'medium',
        title: 'Urgency Language Detected',
        description: 'The email contains urgent language designed to pressure quick action ("act now", "limited time", "urgent!", etc.). This is a common tactic used in phishing and scam emails to bypass rational decision-making.',
        impact: 'Potential social engineering or pressure tactics',
        metrics: 'Urgency keywords identified in content'
      });
    }

    if (technical.excessiveExclamations) {
      explanations.push({
        category: 'Content Analysis',
        severity: 'low',
        title: 'Excessive Exclamation Marks',
        description: 'The email uses an unusual number of exclamation marks, which is characteristic of spam emails attempting to create excitement or urgency artificially.',
        impact: 'Spam-like formatting patterns',
        metrics: 'Multiple exclamation marks detected'
      });
    }

    // If no specific issues found but risk is still elevated
    if (explanations.length === 0 && analysisResult.overallScore > 0.3) {
      explanations.push({
        category: 'General',
        severity: 'medium',
        title: 'Multiple Minor Risk Factors',
        description: 'While no single factor indicates high risk, the combination of multiple minor indicators (header inconsistencies, content patterns, or technical anomalies) contributes to an elevated risk score.',
        impact: 'Cumulative risk from multiple small factors',
        metrics: `Overall risk score: ${(analysisResult.overallScore * 100).toFixed(1)}%`
      });
    }

    return explanations;
  };

  const riskExplanations = generateRiskExplanations();

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'red';
      case 'medium': return 'yellow';
      case 'low': return 'orange';
      default: return 'gray';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high': return <IconExclamationCircle size={16} />;
      case 'medium': return <IconAlertTriangle size={16} />;
      case 'low': return <IconEye size={16} />;
      default: return <IconShield size={16} />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Technical': return <IconCode size={18} />;
      case 'Content Analysis': return <IconBrain size={18} />;
      case 'Authentication': return <IconLock size={18} />;
      default: return <IconSettings size={18} />;
    }
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
        <div>
          <Title order={1} size="h2" mb="xs">
            Security Risk Analysis
          </Title>
          <Text c="dimmed" size="sm">
            Detailed risk assessment and security recommendations for your email
          </Text>
        </div>
        <Group gap="sm">
          <Button 
            variant="outline"
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
            size="xs"
            component={Link} 
            to="/report"
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
            Back to Report
          </Button>
        </Group>
      </Flex>

      <Stack gap="lg" style={{ flex: 1, height: 0 }}>
        {/* Risk Score Header - Compact */}
        <Card padding="lg" radius="md">
          <Flex align="center" gap="lg" mb="md">
            {getRiskIcon(analysisResult.riskLevel)}
            <div style={{ flex: 1 }}>
              <Flex align="center" gap="md" mb="sm">
                <Badge 
                  size="xl"
                  variant="outline"
                  styles={{
                    root: {
                      borderColor: getRiskColorHex(analysisResult.riskLevel),
                      color: getRiskColorHex(analysisResult.riskLevel),
                      backgroundColor: "transparent",
                    },
                  }}
                >
                  {analysisResult.riskLevel.toUpperCase()} RISK
                </Badge>
                <Text size="lg" fw={600} style={{ color: getRiskColorHex(analysisResult.riskLevel) }}>
                  Score: {Math.round(analysisResult.overallScore * 100)}%
                </Text>
              </Flex>
              <Progress 
                value={analysisResult.overallScore * 100} 
                size="lg"
                radius="xl"
                styles={{
                  bar: {
                    backgroundColor: `${getRiskColorHex(analysisResult.riskLevel)} !important`,
                  },
                  root: {
                    backgroundColor: '#e5e7eb',
                  },
                }}
              />
            </div>
          </Flex>
          
          <Text size="md" mt="md" style={{ color: getRiskColorHex(analysisResult.riskLevel) }}>
            {analysisResult.summary}
          </Text>
        </Card>

        {/* Main Content Area */}
        <div style={{ height: "calc(100vh - 360px)" }}>
          <Grid style={{ height: "100%", gap: "md" }}>
            {/* Left Column - Risk Explanations */}
            <Grid.Col span={9} style={{ height: "100%" }}>
              <Card padding="md" radius="md" style={{ height: "100%" }}>
                <Flex align="center" gap="xs" mb="md">
                  <Title order={5} size="h5">Detailed Risk Analysis</Title>
                </Flex>
                <Divider mb="md" />
                
                <ScrollArea 
                  scrollbars="y" 
                  style={{ height: "calc(100% - 60px)" }}
                  styles={{
                    scrollbar: {
                      display: 'none'
                    },
                    thumb: {
                      display: 'none'
                    }
                  }}
                >
                  {riskExplanations.length > 0 ? (
                    <Stack gap="md">
                      {riskExplanations.map((explanation, index) => (
                        <div key={index}>
                          <Flex align="center" gap="sm" mb="xs">
                            <Badge 
                              color={getSeverityColor(explanation.severity)} 
                              size="sm" 
                              leftSection={getSeverityIcon(explanation.severity)}
                            >
                              {explanation.severity.toUpperCase()}
                            </Badge>
                            <Text size="sm" c="dimmed">{explanation.category}</Text>
                          </Flex>
                          
                          <Text size="sm" fw={600} mb="xs" c="gray.9">
                            {explanation.title}
                          </Text>
                          
                          <Text size="xs" c="gray.7" mb="xs" style={{ lineHeight: 1.5 }}>
                            {explanation.description}
                          </Text>
                          
                          <Alert 
                            color={getSeverityColor(explanation.severity)} 
                            variant="light" 
                            size="xs"
                            mb="xs"
                          >
                            <Text size="xs" fw={600}>Impact: {explanation.impact}</Text>
                          </Alert>
                          
                          <Text size="xs" c="dimmed" style={{ fontFamily: 'monospace' }}>
                            {explanation.metrics}
                          </Text>
                          
                          {index < riskExplanations.length - 1 && <Divider my="md" />}
                        </div>
                      ))}
                    </Stack>
                  ) : (
                    <Alert color="green" variant="light">
                      <Text size="sm" fw={600} mb="xs">No Significant Risk Factors Detected</Text>
                      <Text size="sm">
                        Our analysis did not identify any major risk factors in this email. 
                        The content appears to follow legitimate email patterns and practices.
                      </Text>
                    </Alert>
                  )}
                </ScrollArea>
              </Card>
            </Grid.Col>
            
            {/* Right Column - Summary & Recommendations */}
            <Grid.Col span={3} style={{ height: "100%" }}>
              <Stack gap="md" style={{ height: "100%" }}>
                {/* Risk Summary */}
                <Card padding="md" radius="md" style={{ height: "calc(50% - 6px)" }}>
                  <Flex align="center" gap="xs" mb="md">
                    <IconBrain size={18} />
                    <Title order={5} size="h5">Risk Summary</Title>
                  </Flex>
                  
                  <ScrollArea 
                    style={{ height: "calc(100% - 40px)" }}
                    styles={{
                      scrollbar: {
                        display: 'none'
                      },
                      thumb: {
                        display: 'none'
                      }
                    }}
                  >
                    <Text size="xs" fw={600} mb="xs">Overall Assessment</Text>
                    <Text size="xs" mb="md" c="dimmed" style={{ lineHeight: 1.4 }}>
                      {analysisResult.summary}
                    </Text>
                    
                    <Text size="xs" fw={600} mb="xs">Risk Breakdown</Text>
                    <Stack gap="xs">
                      <div>
                        <Flex justify="space-between" align="center" mb="xs">
                          <Text size="xs">Technical Risk</Text>
                          <Text size="xs" fw={500}>
                            {Math.round((analysisResult.details.technical.linkRatio + 
                              (analysisResult.details.technical.hasTrackingPixel ? 0.2 : 0) + 
                              (analysisResult.details.technical.replyToDiffersFromFrom ? 0.2 : 0)) * 100)}%
                          </Text>
                        </Flex>
                        <Progress size="xs" color="blue" value={
                          (analysisResult.details.technical.linkRatio + 
                           (analysisResult.details.technical.hasTrackingPixel ? 0.2 : 0) + 
                           (analysisResult.details.technical.replyToDiffersFromFrom ? 0.2 : 0)) * 100
                        } />
                      </div>
                      
                      <div>
                        <Flex justify="space-between" align="center" mb="xs">
                          <Text size="xs">Content Risk</Text>
                          <Text size="xs" fw={500}>{Math.round(analysisResult.details.nlp.toxicity.score * 100)}%</Text>
                        </Flex>
                        <Progress size="xs" color="red" value={analysisResult.details.nlp.toxicity.score * 100} />
                      </div>
                    </Stack>
                  </ScrollArea>
                </Card>
                
                {/* Security Recommendations */}
                <Card padding="md" radius="md" style={{ height: "calc(50% - 6px)" }}>
                  <Flex align="center" gap="xs" mb="md">
                    <IconShield size={18} />
                    <Title order={5} size="h5">Recommendations</Title>
                  </Flex>
                  
                  <ScrollArea 
                    style={{ height: "calc(100% - 40px)" }}
                    styles={{
                      scrollbar: {
                        display: 'none'
                      },
                      thumb: {
                        display: 'none'
                      }
                    }}
                  >
                    {analysisResult.recommendations.length > 0 ? (
                      <List spacing="xs" size="xs">
                        {analysisResult.recommendations.map((rec, index) => (
                          <List.Item key={index}>
                            <Text size="xs">{rec}</Text>
                          </List.Item>
                        ))}
                      </List>
                    ) : (
                      <Text size="xs" c="dimmed" mb="md">
                        No specific security recommendations at this time.
                      </Text>
                    )}
                    
                    <Divider my="sm" />
                    
                    <Text size="xs" fw={600} mb="xs" c="gray.7">General Best Practices:</Text>
                    <List size="xs" spacing="xs">
                      <List.Item>
                        <Text size="xs" c="dimmed">Verify sender identity</Text>
                      </List.Item>
                      <List.Item>
                        <Text size="xs" c="dimmed">Hover over links first</Text>
                      </List.Item>
                      <List.Item>
                        <Text size="xs" c="dimmed">Avoid urgent pressure</Text>
                      </List.Item>
                      <List.Item>
                        <Text size="xs" c="dimmed">Report suspicious emails</Text>
                      </List.Item>
                    </List>
                  </ScrollArea>
                </Card>
              </Stack>
            </Grid.Col>
          </Grid>
        </div>

      </Stack>
    </div>
  );
}

export default Risk;