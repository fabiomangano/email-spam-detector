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
} from "@mantine/core";
import { 
  IconArrowLeft, 
  IconShield, 
  IconAlertTriangle,
  IconSettings,
  IconBrain,
  IconFileText
} from "@tabler/icons-react";
import { useAnalysis } from "../contexts/AnalysisContext";
import { Link } from "react-router";

function Risk() {
  const { analysisResult } = useAnalysis();

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low': return 'green';
      case 'medium': return 'yellow';
      case 'high': return 'red';
      default: return 'gray';
    }
  };

  const getRiskIcon = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low': return <IconShield size={24} />;
      case 'medium': case 'high': return <IconAlertTriangle size={24} />;
      default: return <IconShield size={24} />;
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
        <Title order={1} size="h2">Security Risk Analysis</Title>
      </Flex>

      <Grid>
        <Grid.Col span={12}>
          <Card padding="lg" radius="md" mb="md">
            <Flex align="center" gap="lg" mb="md">
              {getRiskIcon(analysisResult.riskLevel)}
              <div style={{ flex: 1 }}>
                <Flex align="center" gap="md" mb="sm">
                  <Badge 
                    color={getRiskColor(analysisResult.riskLevel)} 
                    size="xl"
                    variant="filled"
                  >
                    {analysisResult.riskLevel.toUpperCase()} RISK
                  </Badge>
                  <Text size="lg" fw={600}>
                    Score: {Math.round(analysisResult.overallScore * 100)}%
                  </Text>
                </Flex>
                <Progress 
                  value={analysisResult.overallScore * 100} 
                  color={getRiskColor(analysisResult.riskLevel)}
                  size="lg"
                  radius="xl"
                />
              </div>
            </Flex>
            
            <Text size="md" mt="md">
              {analysisResult.summary}
            </Text>
          </Card>
        </Grid.Col>

        {analysisResult.recommendations.length > 0 && (
          <Grid.Col span={12}>
            <Card padding="lg" radius="md" mb="md">
              <Title order={4} size="h4" mb="md">🔒 Security Recommendations</Title>
              <List
                spacing="sm"
                size="sm"
                icon={<Text>"</Text>}
              >
                {analysisResult.recommendations.map((rec, index) => (
                  <List.Item key={index}>
                    <Text fw={500}>{rec}</Text>
                  </List.Item>
                ))}
              </List>
            </Card>
          </Grid.Col>
        )}

        <Grid.Col span={4}>
          <Card padding="lg" radius="md" h="100%">
            <Flex align="center" gap="xs" mb="md">
              <IconSettings size={20} />
              <Title order={5} size="h5">Technical Metrics</Title>
            </Flex>
            <Space h="sm" />
            
            <Text size="sm" fw={600} mb="xs">Content Analysis</Text>
            <Text size="xs" mb="xs">Body Length: {analysisResult.details.technical.bodyLength}</Text>
            <Text size="xs" mb="xs">Links: {analysisResult.details.technical.numLinks} (Ratio: {analysisResult.details.technical.linkRatio})</Text>
            <Text size="xs" mb="xs">Images: {analysisResult.details.technical.numImages}</Text>
            <Text size="xs" mb="sm">Domains: {analysisResult.details.technical.numDomains}</Text>
            
            <Text size="sm" fw={600} mb="xs">Security Indicators</Text>
            <Flex gap="xs" mb="sm" wrap="wrap">
              <Badge color={analysisResult.details.technical.hasTrackingPixel ? 'red' : 'green'} size="sm">
                {analysisResult.details.technical.hasTrackingPixel ? 'Tracking Pixel' : 'No Tracking'}
              </Badge>
              <Badge color={analysisResult.details.technical.isHtmlOnly ? 'yellow' : 'green'} size="sm">
                {analysisResult.details.technical.isHtmlOnly ? 'HTML Only' : 'Text+HTML'}
              </Badge>
              <Badge color={analysisResult.details.technical.replyToDiffersFromFrom ? 'red' : 'green'} size="sm">
                {analysisResult.details.technical.replyToDiffersFromFrom ? 'Reply-To Spoofed' : 'Reply-To OK'}
              </Badge>
            </Flex>
            
            {analysisResult.details.technical.hasAttachments && (
              <>
                <Text size="sm" fw={600} mb="xs">Attachments</Text>
                <Text size="xs" mb="xs">Count: {analysisResult.details.technical.numAttachments}</Text>
                <Text size="xs" c="dimmed">
                  Types: {analysisResult.details.technical.attachmentTypes.join(', ')}
                </Text>
              </>
            )}
          </Card>
        </Grid.Col>

        <Grid.Col span={4}>
          <Card padding="lg" radius="md" h="100%">
            <Flex align="center" gap="xs" mb="md">
              <IconBrain size={20} />
              <Title order={5} size="h5">Behavioral Analysis</Title>
            </Flex>
            <Space h="sm" />
            
            <Text size="sm" fw={600} mb="xs">Urgency Score</Text>
            <Progress 
              value={analysisResult.details.behavior.urgency.score * 100} 
              color="orange" 
              size="sm" 
              mb="sm"
            />
            
            <Text size="sm" fw={600} mb="xs">Social Engineering Score</Text>
            <Progress 
              value={analysisResult.details.behavior.socialEngineering.score * 100} 
              color="red" 
              size="sm" 
              mb="sm"
            />
            
            <Text size="xs" c="dimmed">
              {analysisResult.details.behavior.patterns.analysis}
            </Text>
          </Card>
        </Grid.Col>

        <Grid.Col span={4}>
          <Card padding="lg" radius="md" h="100%">
            <Flex align="center" gap="xs" mb="md">
              <IconFileText size={20} />
              <Title order={5} size="h5">Content Analysis</Title>
            </Flex>
            <Space h="sm" />
            
            <Text size="sm" fw={600} mb="xs">Sentiment</Text>
            <Badge color={analysisResult.details.nlp.sentiment.label === 'positive' ? 'green' : analysisResult.details.nlp.sentiment.label === 'negative' ? 'red' : 'gray'} mb="sm">
              {analysisResult.details.nlp.sentiment.label}
            </Badge>
            
            <Text size="sm" fw={600} mb="xs">Language</Text>
            <Text size="sm" mb="sm">
              {analysisResult.details.nlp.language.detected} ({Math.round(analysisResult.details.nlp.language.confidence * 100)}%)
            </Text>
            
            <Text size="sm" fw={600} mb="xs">Toxicity Score</Text>
            <Progress 
              value={analysisResult.details.nlp.toxicity.score * 100} 
              color="red" 
              size="sm"
            />
          </Card>
        </Grid.Col>
      </Grid>
    </div>
  );
}

export default Risk;