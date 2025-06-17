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

        {!parsedData ? (
          <Stack align="center" justify="center" style={{ flex: 1 }} gap="lg">
            <IconMail size={64} color="var(--mantine-color-gray-4)" stroke={1.5} />
            <Stack align="center" gap="xs">
              <Text c="gray.8" ta="center" size="md" fw={500}>
                No email content
              </Text>
              <Text c="dimmed" ta="center" size="sm">
                Upload and parse an email to see its content here
              </Text>
            </Stack>
          </Stack>
        ) : (
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
                    <Text size="xs" c="gray.9" style={{ flex: 1, textAlign: "right" }}>
                      {parsedData?.parsed?.metadata?.subject || 'N/A'}
                    </Text>
                  </Group>
                  <Group justify="space-between" align="flex-start">
                    <Text size="xs" fw={600} c="gray.7" style={{ minWidth: "80px" }}>From:</Text>
                    <Text size="xs" c="gray.9" style={{ flex: 1, textAlign: "right" }}>
                      {parsedData?.parsed?.metadata?.from || 'N/A'}
                    </Text>
                  </Group>
                  <Group justify="space-between" align="flex-start">
                    <Text size="xs" fw={600} c="gray.7" style={{ minWidth: "80px" }}>To:</Text>
                    <Text size="xs" c="gray.9" style={{ flex: 1, textAlign: "right" }}>
                      {parsedData?.parsed?.metadata?.to || 'N/A'}
                    </Text>
                  </Group>
                  <Group justify="space-between" align="flex-start">
                    <Text size="xs" fw={600} c="gray.7" style={{ minWidth: "80px" }}>Date:</Text>
                    <Text size="xs" c="gray.9" style={{ flex: 1, textAlign: "right" }}>
                      {parsedData?.parsed?.metadata?.date || 'N/A'}
                    </Text>
                  </Group>
                </Stack>
              </div>

              <Divider size="xs" />

              {/* Email Body */}
              <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                <Text size="sm" fw={700} mb="xs" c="gray.9">Email Body</Text>
                <Text 
                  size="xs" 
                  c="gray.9" 
                  style={{ 
                    backgroundColor: "#f8f9fa",
                    padding: "12px",
                    borderRadius: "8px",
                    border: "1px solid #e9ecef",
                    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                    lineHeight: 1.5,
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                    flex: 1,
                    overflow: "auto"
                  }}
                >
                  {bodyText || 'No body content available'}
                </Text>
              </div>

            </Stack>
          </ScrollArea>
        )}
      </Stack>
    </Card>
  );
}
