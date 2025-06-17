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
} from "@mantine/core";
import { 
  IconArrowLeft, 
  IconShield, 
  IconAlertTriangle,
  IconSettings,
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
      <Flex justify="space-between" align="center" mb="xl">
        <Title order={1} size="h2">Security Risk Analysis</Title>
        <Button 
          variant="outline" 
          component={Link} 
          to="/report"
          leftSection={<IconArrowLeft size={16} />}
        >
          Back to Report
        </Button>
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

        {/* Analysis Summary & Recommendations Card */}
        <Grid.Col span={12}>
          <Card padding="lg" radius="md">
            <Flex align="center" gap="xs" mb="md">
              <IconSettings size={20} />
              <Title order={4} size="h4">Analysis Summary & Recommendations</Title>
            </Flex>
            
            <Grid>
              <Grid.Col span={6}>
                <Text size="sm" fw={600} mb="xs">Overall Assessment</Text>
                <Text size="sm" mb="md" c="dimmed">
                  {analysisResult.summary}
                </Text>
                
                <Text size="sm" fw={600} mb="xs">Risk Breakdown</Text>
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
              </Grid.Col>
              
              <Grid.Col span={6}>
                {analysisResult.recommendations.length > 0 && (
                  <div>
                    <Text size="sm" fw={600} mb="md">🔒 Security Recommendations</Text>
                    <List spacing="sm" size="sm">
                      {analysisResult.recommendations.map((rec, index) => (
                        <List.Item key={index}>
                          <Text size="sm">{rec}</Text>
                        </List.Item>
                      ))}
                    </List>
                  </div>
                )}
              </Grid.Col>
            </Grid>
          </Card>
        </Grid.Col>

      </Grid>
    </div>
  );
}

export default Risk;