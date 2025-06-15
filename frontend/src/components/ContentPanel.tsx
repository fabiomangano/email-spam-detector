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
import { IconCopy, IconFileText } from "@tabler/icons-react";
import { FieldRow } from "./FieldRow";
import type { ParsedData } from "../types/email";

interface ContentPanelProps {
  parsedData: ParsedData | null;
  onAnalyze: () => void;
  analyzing: boolean;
  canAnalyze: boolean;
  onParse: () => void;
  canParse: boolean;
}

export function ContentPanel({
  parsedData,
  onParse,
  canParse,
}: ContentPanelProps) {
  const spfDmarcString = parsedData?.metrics
    ? [
        parsedData.metrics.spfResult && `SPF=${parsedData.metrics.spfResult}`,
        parsedData.metrics.dkimResult && `DKIM=${parsedData.metrics.dkimResult}`,
        parsedData.metrics.dmarcResult && `DMARC=${parsedData.metrics.dmarcResult}`
      ].filter(Boolean).join(", ") || "—"
    : "—";

  const bodyText =
    parsedData?.parsed?.plainText || parsedData?.parsed?.htmlText || "";

  return (
    <Card padding="lg" radius="sm" style={{ height: "100%", flex: 1 }}>
      <Stack gap="sm" h="100%">
        <Flex justify="space-between" align="center">
          <Flex align="center" gap="sm">
            <Title order={2} size="h3">
              Content
            </Title>
            {parsedData && (
              <Badge 
                variant="outline" 
                size="sm"
                style={{
                  borderColor: '#22c55e',
                  color: '#22c55e',
                  backgroundColor: 'transparent',
                }}
              >
                ● Parsed
              </Badge>
            )}
          </Flex>
          <Group gap="sm">
            <Button
              variant="outline"
              size="sm"
              leftSection={<IconCopy size={16} />}
              disabled={!bodyText}
              onClick={() => {
                if (bodyText) {
                  navigator.clipboard.writeText(bodyText);
                }
              }}
              styles={{
                root: {
                  borderColor: '#262626',
                  color: '#262626',
                  backgroundColor: '#ffffff',
                  '&:disabled': {
                    backgroundColor: '#ffffff !important',
                    borderColor: '#e5e5e5 !important',
                    color: '#a3a3a3 !important',
                  },
                  '&[data-disabled]': {
                    backgroundColor: '#ffffff !important',
                    borderColor: '#e5e5e5 !important',
                    color: '#a3a3a3 !important',
                  },
                },
              }}
            >
              Copy
            </Button>
            <Button
              variant="filled"
              size="sm"
              onClick={onParse}
              disabled={!canParse}
              leftSection={<IconFileText size={16} />}
              styles={{
                root: {
                  backgroundColor: '#262626',
                  color: '#ffffff',
                  '&:disabled': {
                    backgroundColor: '#f5f5f5 !important',
                    borderColor: '#e5e5e5 !important',
                    color: '#a3a3a3 !important',
                  },
                },
              }}
            >
              Parse
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
          <Stack gap="sm" style={{ flex: 1 }}>
            <div>
              <Text size="sm" fw={600} c="gray.9" mb="xs">
                Headers
              </Text>
              <Stack gap={4}>
                <FieldRow
                  label="From"
                  value={parsedData?.parsed?.metadata?.from}
                />
                <FieldRow label="To" value={parsedData?.parsed?.metadata?.to} />
                <FieldRow
                  label="Subject"
                  value={parsedData?.parsed?.metadata?.subject}
                />
                {parsedData?.metrics && (
                  parsedData.metrics.spfResult || 
                  parsedData.metrics.dkimResult || 
                  parsedData.metrics.dmarcResult
                ) && (
                  <FieldRow label="Security" value={spfDmarcString} />
                )}
              </Stack>
            </div>

            <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
              <Text size="sm" fw={600} c="gray.9" mb="xs">
                Body
              </Text>
              <Textarea
                placeholder="Email content will appear here after parsing..."
                value={bodyText}
                readOnly
                style={{ flex: 1 }}
                styles={{
                  wrapper: { 
                    height: "100%", 
                    flex: 1
                  },
                  input: {
                    height: "100%",
                    backgroundColor: "var(--mantine-color-gray-0)",
                    border: "1px solid var(--mantine-color-gray-3)",
                    fontFamily: "Inter",
                    fontSize: "var(--mantine-font-size-xs)",
                    lineHeight: 1.4,
                    resize: "none",
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
