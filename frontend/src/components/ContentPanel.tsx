import {
  Button,
  Card,
  Divider,
  Flex,
  Group,
  Textarea,
  Title,
  Text,
  Badge,
  Stack,
} from "@mantine/core";
import { IconShield, IconCopy } from "@tabler/icons-react";
import { FieldRow } from "./FieldRow";
import type { ParsedData } from "../types/email";

interface ContentPanelProps {
  parsedData: ParsedData | null;
  onAnalyze: () => void;
  analyzing: boolean;
  canAnalyze: boolean;
}

export function ContentPanel({ 
  parsedData, 
  onAnalyze, 
  analyzing, 
  canAnalyze 
}: ContentPanelProps) {
  const spfDmarcString = parsedData?.metrics
    ? `SPF=${parsedData.metrics.spfResult ?? "N/A"}, DKIM=${
        parsedData.metrics.dkimResult ?? "N/A"
      }, DMARC=${parsedData.metrics.dmarcResult ?? "N/A"}`
    : "N/A";

  const bodyText = parsedData?.parsed?.plainText || parsedData?.parsed?.htmlText || "";

  return (
    <Card padding="lg" radius="sm" style={{ height: "100%", flex: 1 }}>
      <Stack gap="md" h="100%">
        <Flex justify="space-between" align="center">
          <div>
            <Title order={2} size="h3">
              Email Content
            </Title>
            {parsedData && (
              <Badge color="green" variant="light" size="sm" mt="xs">
                Parsed Successfully
              </Badge>
            )}
          </div>
          <Group gap="sm">
            <Button
              variant="light"
              color="gray"
              size="sm"
              leftSection={<IconCopy size={16} />}
              disabled={!bodyText}
            >
              Copy
            </Button>
            <Button
              variant="gradient"
              gradient={{ from: 'red', to: 'orange' }}
              size="sm"
              onClick={onAnalyze}
              disabled={!canAnalyze}
              loading={analyzing}
              leftSection={<IconShield size={16} />}
            >
              {analyzing ? 'Analyzing...' : 'Analyze Security'}
            </Button>
          </Group>
        </Flex>
      
        <Divider />
        
        {!parsedData ? (
          <Stack align="center" justify="center" style={{ flex: 1 }}>
            <Text c="dimmed" ta="center" size="sm">
              Upload and parse an email to see its content here
            </Text>
          </Stack>
        ) : (
          <Stack gap="md" style={{ flex: 1 }}>
            <div>
              <Title order={4} size="h5" mb="sm">
                📧 Email Headers
              </Title>
              <Stack gap="xs">
                <FieldRow
                  label="From"
                  value={parsedData?.parsed?.metadata?.from}
                />
                <FieldRow 
                  label="To" 
                  value={parsedData?.parsed?.metadata?.to} 
                />
                <FieldRow
                  label="Subject"
                  value={parsedData?.parsed?.metadata?.subject}
                />
                <FieldRow 
                  label="Date" 
                  value={parsedData?.parsed?.metadata?.date} 
                />
                <FieldRow
                  label="Security"
                  value={spfDmarcString}
                />
              </Stack>
            </div>
            
            <div style={{ flex: 1, minHeight: 0 }}>
              <Title order={4} size="h5" mb="sm">
                📄 Email Body
              </Title>
              <Textarea
                placeholder="Email content will appear here after parsing..."
                value={bodyText}
                readOnly
                autosize
                minRows={8}
                maxRows={15}
                styles={{
                  input: {
                    backgroundColor: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    fontSize: "14px",
                    fontFamily: "monospace",
                  },
                }}
              />
            </div>
          </Stack>
        )}
      </Stack>
    </Card>
  );
}