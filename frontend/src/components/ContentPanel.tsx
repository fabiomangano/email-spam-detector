import {
  Button,
  Card,
  Divider,
  Flex,
  Group,
  Title,
  Text,
  Stack,
  ScrollArea,
} from "@mantine/core";
import { IconMail, IconCode, IconCopy } from "@tabler/icons-react";
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
  const bodyText =
    parsedData?.parsed?.plainText || parsedData?.parsed?.htmlText || "";

  return (
    <Card padding="lg" radius="md" style={{ height: "calc(100vh - 280px)", flex: 1 }}>
      <Stack gap="sm" h="100%">
        <Flex justify="space-between" align="center">
          <Flex align="center" gap="xs">
            <IconCode size={20} />
            <Title order={2} size="h3">Content</Title>
          </Flex>
          {parsedData && (
            <Button
              variant="outline"
              size="xs"
              leftSection={<IconCopy size={14} />}
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
                },
              }}
            >
              Copy
            </Button>
          )}
        </Flex>

        <Divider />

        <ScrollArea 
          scrollbars="y" 
          style={{ flex: 1, height: "calc(100vh - 400px)" }}
          styles={{
            scrollbar: {
              display: 'none'
            },
            thumb: {
              display: 'none'
            }
          }}
        >
          <Stack gap="sm">
            {/* Basic Email Headers */}
            <div>
              <Text size="sm" fw={700} mb="xs" c="gray.9">Basic Headers</Text>
              <Stack gap={4}>
                <Group justify="space-between" align="flex-start">
                  <Text size="xs" fw={600} c="gray.7" style={{ minWidth: "80px" }}>Subject:</Text>
                  <Text size="xs" c={parsedData?.parsed?.metadata?.subject ? "gray.9" : "gray.5"} style={{ flex: 1, textAlign: "right", fontStyle: parsedData?.parsed?.metadata?.subject ? "normal" : "italic" }}>
                    {parsedData?.parsed?.metadata?.subject || 'No subject'}
                  </Text>
                </Group>
                <Group justify="space-between" align="flex-start">
                  <Text size="xs" fw={600} c="gray.7" style={{ minWidth: "80px" }}>From:</Text>
                  <Text size="xs" c={parsedData?.parsed?.metadata?.from ? "gray.9" : "gray.5"} style={{ flex: 1, textAlign: "right", fontStyle: parsedData?.parsed?.metadata?.from ? "normal" : "italic" }}>
                    {parsedData?.parsed?.metadata?.from || 'sender@example.com'}
                  </Text>
                </Group>
                <Group justify="space-between" align="flex-start">
                  <Text size="xs" fw={600} c="gray.7" style={{ minWidth: "80px" }}>To:</Text>
                  <Text size="xs" c={parsedData?.parsed?.metadata?.to ? "gray.9" : "gray.5"} style={{ flex: 1, textAlign: "right", fontStyle: parsedData?.parsed?.metadata?.to ? "normal" : "italic" }}>
                    {parsedData?.parsed?.metadata?.to || 'recipient@example.com'}
                  </Text>
                </Group>
                <Group justify="space-between" align="flex-start">
                  <Text size="xs" fw={600} c="gray.7" style={{ minWidth: "80px" }}>Date:</Text>
                  <Text size="xs" c={parsedData?.parsed?.metadata?.date ? "gray.9" : "gray.5"} style={{ flex: 1, textAlign: "right", fontStyle: parsedData?.parsed?.metadata?.date ? "normal" : "italic" }}>
                    {parsedData?.parsed?.metadata?.date || 'Mon, 01 Jan 2024 12:00:00 +0000'}
                  </Text>
                </Group>
              </Stack>
            </div>

            <Divider size="xs" />

            {/* Email Body */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
              <Text size="sm" fw={700} mb="xs" c="gray.9">Email Body</Text>
              <div style={{ flex: 1, overflow: "auto" }}>
                <Text 
                  size="xs" 
                  c={bodyText ? "gray.9" : "gray.5"}
                  style={{ 
                    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                    lineHeight: 1.5,
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                    fontStyle: bodyText ? "normal" : "italic"
                  }}
                >
{bodyText || 'Email content will appear here after parsing...\n\nThis is where you\'ll see the complete message body including:\n• Plain text content\n• HTML rendering\n• Formatted paragraphs\n• Links and attachments references'}
                </Text>
              </div>
            </div>

          </Stack>
        </ScrollArea>
      </Stack>
    </Card>
  );
}
