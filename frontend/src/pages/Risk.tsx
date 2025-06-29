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
  ThemeIcon,
  Modal,
  Paper,
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
  IconThumbUp,
  IconThumbDown,
  IconMessageCircle,
  IconCheck,
  IconX,
  IconClock,
} from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { useAnalysis } from "../contexts/AnalysisContext";
import { Link, useNavigate } from "react-router";
import { useState } from "react";

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
    setAnalyzing,
    uploadedFilename
  } = useAnalysis();
  const navigate = useNavigate();
  const [feedbackModalOpened, { open: openFeedbackModal, close: closeFeedbackModal }] = useDisclosure(false);
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

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

  const handleFeedback = async (isSpam: boolean) => {
    if (!uploadedFilename) {
      notifications.show({
        title: "Error",
        message: "No file available for feedback",
        color: "red",
      });
      return;
    }

    setSubmittingFeedback(true);
    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filename: uploadedFilename,
          isSpam: isSpam,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit feedback');
      }

      const result = await response.json();
      
      notifications.show({
        title: "Feedback Submitted",
        message: `Email moved to ${isSpam ? 'spam' : 'ham'} folder for training. Thank you for your feedback!`,
        color: "green",
        icon: <IconCheck size={16} />,
      });

      closeFeedbackModal();
    } catch (error) {
      console.error('Error submitting feedback:', error);
      notifications.show({
        title: "Error",
        message: "Failed to submit feedback. Please try again.",
        color: "red",
        icon: <IconX size={16} />,
      });
    } finally {
      setSubmittingFeedback(false);
    }
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
      case 'medium': return '#fbbf24';
      case 'high': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getRiskIcon = (riskLevel: string) => {
    const color = getRiskColorHex(riskLevel);
    switch (riskLevel) {
      case 'low': return <IconShield size={18} style={{ color }} />;
      case 'medium': case 'high': return <IconAlertTriangle size={18} style={{ color }} />;
      default: return <IconShield size={18} style={{ color }} />;
    }
  };

  // Generate detailed risk explanations
  const generateRiskExplanations = () => {
    if (!analysisResult || !analysisResult.details || !analysisResult.details.technical || !analysisResult.details.nlp) {
      return [];
    }
    
    const explanations = [];
    const technical = analysisResult.details.technical;
    const nlp = analysisResult.details.nlp;
    const behavioral = analysisResult.details.behavioral;

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

    // Behavioral Risk Factors
    if (behavioral) {
      if (behavioral.isNewSender) {
        explanations.push({
          category: 'Behavioral',
          severity: 'medium',
          title: 'New Sender Account',
          description: 'This sender has no previous email history in our system. New accounts are sometimes used by spammers to avoid reputation-based filtering. While many legitimate senders are also new, this factor contributes to overall risk assessment.',
          impact: 'Increased scrutiny required for new senders',
          metrics: behavioral.firstSeenDate ? `First seen: ${new Date(behavioral.firstSeenDate).toLocaleDateString()}` : 'No previous email history'
        });
      }

      if (behavioral.emailCountLast24h > 20) {
        explanations.push({
          category: 'Behavioral',
          severity: behavioral.emailCountLast24h > 50 ? 'high' : 'medium',
          title: 'High Volume Email Activity',
          description: `This sender has sent ${behavioral.emailCountLast24h} emails in the last 24 hours, which is ${behavioral.emailCountLast24h > 50 ? 'extremely' : 'significantly'} higher than typical personal communication patterns. High-volume sending is characteristic of automated spam campaigns or bulk email operations.`,
          impact: 'Strong indicator of mass mailing or spam operation',
          metrics: `${behavioral.emailCountLast24h} emails sent in last 24h, ${behavioral.emailCountLast7d} in last 7 days`
        });
      }

      if (behavioral.burstRatio > 3) {
        explanations.push({
          category: 'Behavioral',
          severity: behavioral.burstRatio > 10 ? 'high' : behavioral.burstRatio > 5 ? 'medium' : 'low',
          title: 'Burst Sending Pattern Detected',
          description: `The sender shows a burst ratio of ${behavioral.burstRatio.toFixed(2)}x, indicating irregular sending patterns with sudden spikes in email volume. This behavior is typical of automated bot systems or compromised accounts used for spam distribution.`,
          impact: 'Potential automated or compromised account activity',
          metrics: `Burst ratio: ${behavioral.burstRatio.toFixed(2)}x above normal patterns`
        });
      }

      if (behavioral.contentSimilarityRate > 0.7) {
        explanations.push({
          category: 'Behavioral',
          severity: behavioral.contentSimilarityRate > 0.9 ? 'high' : 'medium',
          title: 'High Content Similarity Rate',
          description: `${Math.round(behavioral.contentSimilarityRate * 100)}% of this sender's recent emails contain very similar content. This pattern indicates potential mass mailing campaigns where the same or nearly identical messages are sent to multiple recipients, which is characteristic of spam operations.`,
          impact: 'Strong evidence of mass mailing or spam campaign',
          metrics: `Content similarity: ${Math.round(behavioral.contentSimilarityRate * 100)}% across recent emails`
        });
      }

      if (behavioral.timeAnomalyScore > 0.5) {
        explanations.push({
          category: 'Behavioral',
          severity: behavioral.timeAnomalyScore > 0.8 ? 'high' : 'medium',
          title: 'Unusual Sending Time Pattern',
          description: `This email was sent at an unusual time (${behavioral.hourOfDay}:00 on ${behavioral.dayOfWeek}) with an anomaly score of ${Math.round(behavioral.timeAnomalyScore * 100)}%. Automated spam systems often send emails at irregular hours or follow non-human timing patterns.`,
          impact: 'Potential automated or non-human sending pattern',
          metrics: `Time anomaly score: ${Math.round(behavioral.timeAnomalyScore * 100)}% (sent at ${behavioral.hourOfDay}:00, ${behavioral.dayOfWeek})`
        });
      }

      if (behavioral.subjectChangeRate > 0.7) {
        explanations.push({
          category: 'Behavioral',
          severity: behavioral.subjectChangeRate > 0.9 ? 'medium' : 'low',
          title: 'High Subject Line Variation',
          description: `${Math.round(behavioral.subjectChangeRate * 100)}% of this sender's recent emails have different subject lines. While legitimate senders can have varied subjects, extremely high variation rates can indicate attempts to evade spam filters through subject line randomization.`,
          impact: 'Potential spam filter evasion technique',
          metrics: `Subject change rate: ${Math.round(behavioral.subjectChangeRate * 100)}% variation across recent emails`
        });
      }

      if (behavioral.massMailingIndicator) {
        explanations.push({
          category: 'Behavioral',
          severity: 'high',
          title: 'Mass Mailing Operation Detected',
          description: 'Our behavioral analysis has identified this sender as operating a mass mailing system based on volume patterns, timing analysis, and content similarity. This is a strong indicator of commercial bulk email or spam operations.',
          impact: 'High probability of unsolicited bulk email (spam)',
          metrics: 'Multiple mass mailing indicators detected'
        });
      }

      if (behavioral.reputationScore < 0.4) {
        explanations.push({
          category: 'Behavioral',
          severity: behavioral.reputationScore < 0.2 ? 'high' : 'medium',
          title: 'Low Sender Reputation Score',
          description: `This sender has a reputation score of ${(behavioral.reputationScore * 100).toFixed(0)}%, which is ${behavioral.reputationScore < 0.2 ? 'very low' : 'below average'}. The reputation score considers factors like sending consistency, recipient engagement, and compliance with email best practices.`,
          impact: 'Increased likelihood of spam or unwanted email',
          metrics: `Reputation score: ${(behavioral.reputationScore * 100).toFixed(0)}% (based on historical sending patterns)`
        });
      }

      // Average recipients warning for potential mass mailing
      if (behavioral.avgRecipients > 5) {
        explanations.push({
          category: 'Behavioral',
          severity: behavioral.avgRecipients > 10 ? 'medium' : 'low',
          title: 'High Average Recipient Count',
          description: `This sender typically sends emails to an average of ${behavioral.avgRecipients.toFixed(1)} recipients per email. High recipient counts are characteristic of mailing lists, newsletters, or spam campaigns rather than personal communication.`,
          impact: 'Indicates bulk email or mailing list operation',
          metrics: `Average recipients per email: ${behavioral.avgRecipients.toFixed(1)}`
        });
      }
    }

    // New enhanced spam detection metrics
    if (technical.containsFinancialPromises) {
      explanations.push({
        category: 'Technical',
        severity: 'high',
        title: 'Financial Promises or Spam Content',
        description: 'The email contains typical spam patterns such as financial promises, work-from-home schemes, MLM opportunities, or marketing services. These patterns are commonly used in unsolicited commercial emails and scams.',
        impact: 'High likelihood of spam or scam content',
        metrics: 'Financial/spam content patterns detected'
      });
    }

    if (technical.sentToMultiple) {
      explanations.push({
        category: 'Technical',
        severity: 'medium',
        title: 'Multiple Recipients Detected',
        description: 'This email was sent to multiple recipients simultaneously, which is a common characteristic of mass marketing emails, newsletters, or spam campaigns rather than personal communication.',
        impact: 'Indicates bulk email or mass marketing',
        metrics: 'Multiple recipients in To/Cc fields'
      });
    }

    if (technical.hasSpammySubject) {
      explanations.push({
        category: 'Technical',
        severity: 'high',
        title: 'Suspicious Subject Line',
        description: 'The subject line contains patterns typical of spam emails, such as guaranteed promises, urgent language, money amounts, or hyperbolic claims designed to grab attention.',
        impact: 'Strong indicator of spam or promotional email',
        metrics: 'Spam patterns detected in subject line'
      });
    }

    if (technical.hasSuspiciousFromName) {
      explanations.push({
        category: 'Technical',
        severity: 'medium',
        title: 'Suspicious Sender Name',
        description: 'The sender name appears to be randomly generated, contains excessive numbers, or follows patterns typical of automated spam accounts rather than legitimate users.',
        impact: 'Potential automated or fake sender account',
        metrics: 'Suspicious sender name pattern detected'
      });
    }

    if (technical.containsSuspiciousDomains) {
      explanations.push({
        category: 'Technical',
        severity: 'high',
        title: 'Suspicious Domains Detected',
        description: 'The email contains references to domains known for spam, ad networks, or suspicious services. This includes Chinese domains, free hosting services, or known spam infrastructure.',
        impact: 'Connection to spam or suspicious services',
        metrics: 'Suspicious domains found in content'
      });
    }

    if (technical.mailingListSpam) {
      explanations.push({
        category: 'Technical',
        severity: 'high',
        title: 'Compromised Mailing List',
        description: 'This email appears to be spam content disguised as legitimate mailing list traffic. The email has mailing list headers but contains commercial spam content, indicating a hijacked or compromised mailing list.',
        impact: 'Spam disguised as legitimate mailing list',
        metrics: 'Mailing list headers with spam content'
      });
    }

    if (technical.hasNonStandardPorts) {
      explanations.push({
        category: 'Technical',
        severity: 'medium',
        title: 'Non-Standard Port Usage',
        description: 'The email contains URLs using non-standard ports (not 80, 443, 25, etc.), which is often used by spam services to avoid detection or host content on compromised systems.',
        impact: 'Potential connection to suspicious services',
        metrics: 'Non-standard ports detected in URLs'
      });
    }


    if (technical.isImageHeavy) {
      explanations.push({
        category: 'Technical',
        severity: 'medium',
        title: 'Image-Heavy Content',
        description: 'The email consists primarily of images with minimal text content. This technique is often used by spammers to avoid text-based spam filters and can make the email difficult to process by screen readers.',
        impact: 'Potential spam evasion technique',
        metrics: 'High image-to-text ratio detected'
      });
    }

    if (technical.hasRepeatedLinks) {
      explanations.push({
        category: 'Technical',
        severity: 'medium',
        title: 'Repeated Links to Same Domain',
        description: 'Multiple links in the email all point to the same domain or website. This pattern is typical of promotional emails designed to drive traffic to a single destination.',
        impact: 'Indicates promotional or marketing email',
        metrics: 'Multiple links to same destination'
      });
    }

    if (technical.isHtmlOnly) {
      explanations.push({
        category: 'Technical',
        severity: 'low',
        title: 'HTML-Only Email Format',
        description: 'The email is sent only in HTML format without a plain text alternative. While not inherently malicious, this is more common in marketing emails and can be used to embed tracking or malicious content.',
        impact: 'Reduced compatibility and potential tracking',
        metrics: 'No plain text version available'
      });
    }

    if (technical.numLinks > 5) {
      explanations.push({
        category: 'Technical',
        severity: 'medium',
        title: 'Excessive Link Count',
        description: `The email contains ${technical.numLinks} links, which is unusually high for personal communication. High link counts are characteristic of promotional emails, newsletters, or spam.`,
        impact: 'Indicates commercial or promotional content',
        metrics: `${technical.numLinks} links detected`
      });
    }

    if (technical.linkRatio > 0.02) {
      explanations.push({
        category: 'Technical',
        severity: 'medium',
        title: 'High Link-to-Content Ratio',
        description: `${(technical.linkRatio * 100).toFixed(1)}% of the email content consists of links. High link density often indicates spam, phishing attempts, or aggressive marketing campaigns.`,
        impact: 'Potential spam or phishing indicators',
        metrics: `Link ratio: ${(technical.linkRatio * 100).toFixed(1)}%`
      });
    }

    if (technical.fromDomainIsDisposable) {
      explanations.push({
        category: 'Technical',
        severity: 'high',
        title: 'Disposable Email Domain',
        description: 'The sender is using a domain known for providing temporary or disposable email addresses. These domains are frequently used by spammers to avoid detection and accountability.',
        impact: 'High likelihood of spam or throwaway account',
        metrics: 'Disposable email domain detected'
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
      case 'Behavioral': return <IconClock size={18} />;
      default: return <IconSettings size={18} />;
    }
  };

  const getProgressColor = (percentage: number) => {
    if (percentage < 30) return '#22c55e';
    if (percentage < 70) return '#fbbf24';
    return '#ef4444';
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
    <div style={{ padding: "20px", paddingBottom: "140px", minHeight: "calc(100vh - 60px)" }}>
      <Flex justify="space-between" align="center" mb="xl">
        <Group gap="md" align="flex-start">
          <ThemeIcon
            size={48}
            radius="md"
            color="red"
            style={{
              backgroundColor: 'var(--mantine-color-red-0)',
              color: 'var(--mantine-color-red-6)',
            }}
          >
            <IconShield size={24} />
          </ThemeIcon>
          <div>
            <Title order={1} size="h2" mb="xs">
              Security Risk Analysis
            </Title>
            <Text c="dimmed" size="sm">
              Detailed risk assessment and security recommendations for your email
            </Text>
          </div>
        </Group>
        <Group gap="sm">
          <Button 
            size="xs"
            onClick={openFeedbackModal}
            leftSection={<IconMessageCircle size={14} />}
            styles={{
              root: {
                backgroundColor: "#262626",
                color: "#ffffff",
                border: "none",
                "&:hover": {
                  backgroundColor: "#404040",
                },
              },
            }}
          >
            Provide Feedback
          </Button>
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

        {/* Main Content Area */}
        <Grid gutter="md">
          {/* Left Column - Detailed Analysis */}
          <Grid.Col span={{ base: 12, md: 8 }}>
            {/* Detailed Risk Analysis Card */}
            <Card padding="lg" radius="md">
              <Flex align="center" gap="xs" mb="md">
                <IconAlertTriangle size={20} />
                <Title order={2} size="h3">Detailed Risk Analysis</Title>
              </Flex>
              <Divider mb="md" />
              
              <Text size="xs" c="gray.7" mb="md" style={{ lineHeight: 1.4 }}>
                Each risk factor is analyzed and categorized by severity level. The analysis examines technical headers, authentication protocols, content patterns, and behavioral indicators.
                <br />
                Review the detailed explanations below to understand specific security concerns and their potential impact on email safety.
              </Text>
              
              <ScrollArea.Autosize 
                mah="calc(100vh - 440px)"
                scrollbars="y"
                styles={{
                  thumb: {
                    backgroundColor: 'rgba(0, 0, 0, 0.3)',
                  },
                }}
              >
                {riskExplanations.length > 0 ? (
                  <Stack gap="md">
                    {riskExplanations.map((explanation, index) => (
                      <div key={index}>
                        <Flex align="center" gap="sm" mb="xs">
                          <Badge 
                            color={getSeverityColor(explanation.severity)} 
                            size="xs" 
                            leftSection={getSeverityIcon(explanation.severity)}
                          >
                            {explanation.severity.toUpperCase()}
                          </Badge>
                          <Text size="xs" c="dimmed">{explanation.category}</Text>
                        </Flex>
                        
                        <Text size="sm" fw={700} mb="xs" c="gray.9">
                          {explanation.title}
                        </Text>
                        
                        <Text size="xs" c="gray.7" mb="xs" style={{ lineHeight: 1.4 }}>
                          {explanation.description}
                        </Text>
                        
                        <Text size="xs" fw={600} mb="xs" c="gray.7">Impact:</Text>
                        <Text size="xs" c="gray.7" mb="xs" style={{ lineHeight: 1.4 }}>
                          {explanation.impact}
                        </Text>
                        
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
              </ScrollArea.Autosize>
            </Card>
          </Grid.Col>
          
          {/* Right Column - Risk Level, Summary & Recommendations */}
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Stack gap="md">
              {/* Risk Score Card */}
              <Card padding="lg" radius="md">
                <Flex align="center" gap="xs" mb="md">
                  <IconShield size={20} />
                  <Title order={2} size="h3">Security Risk Level</Title>
                </Flex>
                <Divider mb="md" />
                
                <Flex align="center" gap="sm" mb="md">
                  {getRiskIcon(analysisResult.riskLevel)}
                  <div style={{ flex: 1 }}>
                    <Flex align="center" gap="sm" mb="xs">
                      <Badge 
                        size="xs"
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
                      <Text size="xs" fw={600} style={{ color: getRiskColorHex(analysisResult.riskLevel) }}>
                        {Math.round(analysisResult.overallScore * 100)}%
                      </Text>
                    </Flex>
                    <div style={{ 
                      width: '100%', 
                      height: '4px', 
                      backgroundColor: '#e5e7eb', 
                      borderRadius: '9999px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        width: `${analysisResult.overallScore * 100}%`,
                        height: '100%',
                        backgroundColor: getRiskColorHex(analysisResult.riskLevel),
                        borderRadius: '9999px',
                        transition: 'width 0.3s ease'
                      }} />
                    </div>
                  </div>
                </Flex>
                
                <Text size="xs" c="gray.7" style={{ lineHeight: 1.4 }}>
                  {analysisResult.summary}
                </Text>
              </Card>

              {/* Risk Summary */}
              <Card padding="lg" radius="md">
                <Flex align="center" gap="xs" mb="md">
                  <IconBrain size={20} />
                  <Title order={2} size="h3">Risk Breakdown</Title>
                </Flex>
                <Divider mb="md" />
                
                <Stack gap="xs">
                  <div>
                    <Flex justify="space-between" align="center" mb="xs">
                      <Text size="xs" fw={600} c="gray.7">Technical Risk</Text>
                      <Text size="xs" fw={500} c="gray.9">
                        {analysisResult.scores?.technicalPercentage ? 
                          Math.round(analysisResult.scores.technicalPercentage) : 
                          Math.round((analysisResult.details.technical.linkRatio + 
                            (analysisResult.details.technical.hasTrackingPixel ? 0.2 : 0) + 
                            (analysisResult.details.technical.replyToDiffersFromFrom ? 0.2 : 0)) * 100)}%
                      </Text>
                    </Flex>
                    <Progress 
                      size="xs" 
                      color={getProgressColor(
                        analysisResult.scores?.technicalPercentage ? 
                          analysisResult.scores.technicalPercentage : 
                          (analysisResult.details.technical.linkRatio + 
                           (analysisResult.details.technical.hasTrackingPixel ? 0.2 : 0) + 
                           (analysisResult.details.technical.replyToDiffersFromFrom ? 0.2 : 0)) * 100
                      )}
                      value={
                        analysisResult.scores?.technicalPercentage ? 
                          analysisResult.scores.technicalPercentage : 
                          (analysisResult.details.technical.linkRatio + 
                           (analysisResult.details.technical.hasTrackingPixel ? 0.2 : 0) + 
                           (analysisResult.details.technical.replyToDiffersFromFrom ? 0.2 : 0)) * 100
                      } 
                    />
                  </div>
                  
                  <div>
                    <Flex justify="space-between" align="center" mb="xs">
                      <Text size="xs" fw={600} c="gray.7">Content Risk</Text>
                      <Text size="xs" fw={500} c="gray.9">
                        {analysisResult.scores?.nlpPercentage ? 
                          Math.round(analysisResult.scores.nlpPercentage) : 
                          Math.round(analysisResult.details.nlp.toxicity.score * 100)}%
                      </Text>
                    </Flex>
                    <Progress 
                      size="xs" 
                      color={getProgressColor(
                        analysisResult.scores?.nlpPercentage ? 
                          analysisResult.scores.nlpPercentage : 
                          analysisResult.details.nlp.toxicity.score * 100
                      )}
                      value={
                        analysisResult.scores?.nlpPercentage ? 
                          analysisResult.scores.nlpPercentage : 
                          analysisResult.details.nlp.toxicity.score * 100
                      } 
                    />
                  </div>
                  
                  {analysisResult.details.behavioral && (
                    <div>
                      <Flex justify="space-between" align="center" mb="xs">
                        <Text size="xs" fw={600} c="gray.7">Behavioral Risk</Text>
                        <Text size="xs" fw={500} c="gray.9">
                          {analysisResult.scores?.behavioralPercentage ? 
                            Math.round(analysisResult.scores.behavioralPercentage) : 
                            Math.round((
                              (analysisResult.details.behavioral.isNewSender ? 0.2 : 0) +
                              (analysisResult.details.behavioral.emailCountLast24h > 20 ? 0.3 : 0) +
                              (analysisResult.details.behavioral.burstRatio > 3 ? 0.2 : 0) +
                              (analysisResult.details.behavioral.massMailingIndicator ? 0.3 : 0)
                            ) * 100)}%
                        </Text>
                      </Flex>
                      <Progress 
                        size="xs" 
                        color={getProgressColor(
                          analysisResult.scores?.behavioralPercentage ? 
                            analysisResult.scores.behavioralPercentage : 
                            (
                              (analysisResult.details.behavioral.isNewSender ? 0.2 : 0) +
                              (analysisResult.details.behavioral.emailCountLast24h > 20 ? 0.3 : 0) +
                              (analysisResult.details.behavioral.burstRatio > 3 ? 0.2 : 0) +
                              (analysisResult.details.behavioral.massMailingIndicator ? 0.3 : 0)
                            ) * 100
                        )}
                        value={
                          analysisResult.scores?.behavioralPercentage ? 
                            analysisResult.scores.behavioralPercentage : 
                            (
                              (analysisResult.details.behavioral.isNewSender ? 0.2 : 0) +
                              (analysisResult.details.behavioral.emailCountLast24h > 20 ? 0.3 : 0) +
                              (analysisResult.details.behavioral.burstRatio > 3 ? 0.2 : 0) +
                              (analysisResult.details.behavioral.massMailingIndicator ? 0.3 : 0)
                            ) * 100
                        } 
                      />
                    </div>
                  )}
                </Stack>
                
                <Text size="xs" c="gray.7" mt="md" style={{ lineHeight: 1.4 }}>
                  Technical risk analyzes email headers, authentication, and infrastructure patterns.
                  <br />
                  Content risk evaluates language, sentiment, and spam indicators using natural language processing.
                  {analysisResult.details.behavioral && (
                    <>
                      <br />
                      Behavioral risk assesses sender patterns over time including volume, timing, and content similarity.
                    </>
                  )}
                </Text>
              </Card>
              
              {/* Security Recommendations */}
              <Card padding="lg" radius="md">
                <Flex align="center" gap="xs" mb="md">
                  <IconShield size={20} />
                  <Title order={2} size="h3">Recommendations</Title>
                </Flex>
                <Divider mb="md" />
                
                <ScrollArea.Autosize 
                  mah="30vh"
                  scrollbars="y"
                  styles={{
                    thumb: {
                      backgroundColor: 'rgba(0, 0, 0, 0.3)',
                    },
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
                    <Text size="xs" c="gray.7" mb="sm">
                      No specific security recommendations at this time.
                    </Text>
                  )}
                  
                  <Divider my="sm" />
                  
                  <Text size="sm" fw={700} mb="xs" c="gray.9">General Best Practices:</Text>
                  <List size="xs" spacing="xs">
                    <List.Item>
                      <Text size="xs" c="gray.7">Verify sender identity</Text>
                    </List.Item>
                    <List.Item>
                      <Text size="xs" c="gray.7">Hover over links first</Text>
                    </List.Item>
                    <List.Item>
                      <Text size="xs" c="gray.7">Avoid urgent pressure</Text>
                    </List.Item>
                    <List.Item>
                      <Text size="xs" c="gray.7">Report suspicious emails</Text>
                    </List.Item>
                  </List>
                </ScrollArea.Autosize>
              </Card>
            </Stack>
          </Grid.Col>
        </Grid>
        
        {/* Feedback Modal */}
        <Modal
          opened={feedbackModalOpened}
          onClose={closeFeedbackModal}
          title="Provide Email Classification Feedback"
          size="lg"
          centered
          styles={{
            body: {
              padding: "24px",
            },
            header: {
              paddingBottom: "16px",
            },
          }}
          style={{
            maxHeight: "70vh",
          }}
        >
          <Stack gap="lg">
            <Text size="sm" c="dimmed">
              Help improve our spam detection by providing feedback on this email analysis.
              Your feedback will be used to enhance the model's accuracy.
            </Text>
            
            <Paper p="md" style={{ backgroundColor: '#f8f9fa', border: '1px solid #e9ecef' }}>
              <Text size="sm" fw={500} mb="xs">Current Analysis:</Text>
              <Group gap="xs" align="center">
                {getRiskIcon(analysisResult?.riskLevel || 'low')}
                <Badge 
                  color={getRiskColor(analysisResult?.riskLevel || 'low')}
                  size="sm"
                >
                  {(analysisResult?.riskLevel || 'low').toUpperCase()} RISK
                </Badge>
                <Text size="sm" c="dimmed">
                  ({Math.round((analysisResult?.overallScore || 0) * 100)}% spam probability)
                </Text>
              </Group>
            </Paper>
            
            <div>
              <Text size="sm" fw={600} mb="md">
                In your opinion, is this email spam or legitimate?
              </Text>
              
              <Group gap="md" grow>
                <Button
                  variant="outline"
                  leftSection={<IconThumbDown size={16} />}
                  onClick={() => handleFeedback(true)}
                  loading={submittingFeedback}
                  disabled={submittingFeedback}
                  styles={{
                    root: {
                      borderColor: '#ef4444',
                      color: '#ef4444',
                      backgroundColor: '#ffffff',
                      "&:hover": {
                        backgroundColor: '#fef2f2',
                      },
                    },
                  }}
                >
                  This is SPAM
                </Button>
                
                <Button
                  leftSection={<IconThumbUp size={16} />}
                  onClick={() => handleFeedback(false)}
                  loading={submittingFeedback}
                  disabled={submittingFeedback}
                  styles={{
                    root: {
                      backgroundColor: '#262626',
                      color: '#ffffff',
                      border: 'none',
                      "&:hover": {
                        backgroundColor: '#404040',
                      },
                    },
                  }}
                >
                  This is LEGITIMATE
                </Button>
              </Group>
            </div>
            
            <Text size="xs" c="dimmed" style={{ fontStyle: 'italic' }}>
              Note: The email file will be moved to the appropriate training folder 
              (spam or ham) in the SpamAssassin dataset for future model training.
            </Text>
          </Stack>
        </Modal>
    </div>
  );
}

export default Risk;