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
          <Title order={2} size="h3">
            Content
            {parsedData && (
              <Badge color="green" variant="dot" size="sm" ml="sm">
                Parsed
              </Badge>
            )}
          </Title>
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
              <Title order={5} size="h6" mb="xs" fw={500} c="gray.7">
                Email Headers
              </Title>
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
                <FieldRow
                  label="Date"
                  value={parsedData?.parsed?.metadata?.date}
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
              <Title order={5} size="h6" mb="xs" fw={500} c="gray.7">
                Email Body
              </Title>
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
