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
import { IconMail, IconCopy } from "@tabler/icons-react";
import type { ParsedData } from "../types/email";

interface ContentPanelProps {
  parsedData: ParsedData | null;
  onAnalyze: () => void;
  analyzing: boolean;
  canAnalyze: boolean;
  onParse: () => void;
  canParse: boolean;
}

function formatEmailDate(dateString: string | undefined): string {
  if (!dateString) return 'Mon, 01 Jan 2024 12:00:00 +0000';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return dateString; // Return original if can't parse
    }
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
  } catch {
    return dateString; // Return original if error
  }
}

export function ContentPanel({
  parsedData,
}: ContentPanelProps) {
  const bodyText =
    parsedData?.parsed?.plainText || parsedData?.parsed?.htmlText || "";

  return (
    <Card padding="lg" radius="md" style={{ height: "calc(100vh - 280px)", flex: 1 }}>
      <Stack gap="sm" h="100%">
        <Flex justify="space-between" align="center">
          <Flex align="center" gap="xs">
            <IconMail size={20} />
            <Title order={2} size="h3">Email</Title>
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
                    {formatEmailDate(parsedData?.parsed?.metadata?.date)}
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
{bodyText || 'Email content will appear here once parsing is complete...\n\nThis area will display the full body of the email, including all its components. Here\'s what you can expect to see:\n\n• The plain text version of the message, exactly as written by the sender\n• A rich HTML rendering with styles, formatting, and layout preserved\n• Structured paragraphs and headings for improved readability\n• Hyperlinks, buttons, and references to any external content\n• Mentions of attachments, embedded images, and inline files\n• Special characters, tables, or layout elements used in the original\n• Any metadata or footer typically added by mail clients or servers\n\nIf the email was malformed or contained suspicious content, relevant warnings or highlights may also be shown here.'}
                </Text>
              </div>
            </div>


          </Stack>
        </ScrollArea>
      </Stack>
    </Card>
  );
}
