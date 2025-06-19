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
import { IconFileInfo, IconCopy } from "@tabler/icons-react";
import type { ParsedData } from "../types/email";

interface MetadataPanelProps {
  parsedData: ParsedData | null;
  uploadedFile: File | null;
  textAreaValue?: string;
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const value = Number((bytes / Math.pow(k, i)).toFixed(2));
  return `${value} ${sizes[i]}`;
}

function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toUpperCase() || 'Unknown';
}

function estimateTextSize(text: string): number {
  return new Blob([text]).size;
}

function countLines(text: string): number {
  return text.split('\n').length;
}

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(word => word.length > 0).length;
}

function countCharacters(text: string): number {
  return text.length;
}

export function MetadataPanel({
  parsedData,
  uploadedFile,
  textAreaValue = "",
}: MetadataPanelProps) {
  
  const generateMetadataText = (): string => {
    const sections: string[] = [];
    
    // File Information
    if (parsedData || uploadedFile) {
      sections.push("=== FILE INFORMATION ===");
      sections.push(`Name: ${parsedData && uploadedFile?.name ? uploadedFile.name : 'example-email.eml'}`);
      sections.push(`Size: ${parsedData && uploadedFile?.size ? formatFileSize(uploadedFile.size) : '2.5 KB'}`);
      sections.push(`Type: ${parsedData && uploadedFile?.type ? uploadedFile.type : 'text/plain'}`);
      sections.push(`Extension: ${parsedData && uploadedFile?.name ? getFileExtension(uploadedFile.name) : 'EML'}`);
      sections.push(`Modified: ${parsedData && uploadedFile?.lastModified ? new Date(uploadedFile.lastModified).toLocaleDateString() : '18/6/2025'}`);
      sections.push(`MIME Type: ${parsedData && uploadedFile?.type ? uploadedFile.type : 'message/rfc822'}`);
      sections.push(`Web Type: ${parsedData && uploadedFile ? (uploadedFile.webkitRelativePath || 'Local File') : 'Local File'}`);
      sections.push(`Created: ${parsedData && uploadedFile?.lastModified ? new Date(uploadedFile.lastModified).toLocaleDateString() : '18/6/2025'}`);
      sections.push("");
    }
    
    // Content Analysis
    sections.push("=== CONTENT ANALYSIS ===");
    sections.push(`Source: ${parsedData && uploadedFile ? 'File Upload' : parsedData && textAreaValue ? 'Text Input' : 'File Upload'}`);
    sections.push(`Text Size: ${parsedData && textAreaValue ? formatFileSize(estimateTextSize(textAreaValue)) : '2.1 KB'}`);
    sections.push(`Lines: ${parsedData && textAreaValue ? countLines(textAreaValue).toString() : '45'}`);
    sections.push(`Words: ${parsedData && textAreaValue ? countWords(textAreaValue).toString() : '342'}`);
    sections.push(`Characters: ${parsedData && textAreaValue ? countCharacters(textAreaValue).toString() : '2,156'}`);
    sections.push("");
    
    // Parsing Stats
    sections.push("=== PARSING STATS ===");
    sections.push(`Status: ${parsedData ? 'Parsed Successfully' : 'Pending'}`);
    sections.push(`Parsed At: ${parsedData ? `${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}` : 'Not yet parsed'}`);
    sections.push(`Body Length: ${parsedData?.parsed?.plainText ? `${parsedData.parsed.plainText.length.toString()} chars` : '0 chars'}`);
    sections.push(`HTML Length: ${parsedData?.parsed?.htmlText ? `${parsedData.parsed.htmlText.length.toString()} chars` : '0 chars'}`);
    sections.push(`Processing Time: ${parsedData?.processingTime ? `${String(parsedData.processingTime)}ms` : 'N/A'}`);
    sections.push(`Parser Engine: ${String(parsedData?.parserEngine || 'Email Parser v1.0')}`);
    sections.push(`Encoding: ${String(parsedData?.parsed?.headers?.['content-transfer-encoding'] || 'UTF-8')}`);
    sections.push("");
    
    // Content Structure
    sections.push("=== CONTENT STRUCTURE ===");
    sections.push(`Has HTML: ${parsedData?.parsed?.htmlText ? 'Yes' : 'No'}`);
    sections.push(`Has Plain Text: ${parsedData?.parsed?.plainText ? 'Yes' : 'No'}`);
    sections.push(`Attachments: ${parsedData ? (parsedData.parsed?.attachments?.length || 0) : '0'}`);
    sections.push(`Content Type: ${String(parsedData?.parsed?.headers?.['content-type'] || 'text/plain')}`);
    sections.push(`Multipart: ${parsedData?.parsed?.headers?.['content-type']?.includes?.('multipart') ? 'Yes' : 'No'}`);
    
    return sections.join('\n');
  };

  const handleCopyMetadata = () => {
    const metadataText = generateMetadataText();
    navigator.clipboard.writeText(metadataText);
  };
  return (
    <Card padding="lg" radius="md" style={{ height: "calc(100vh - 280px)", flex: 1 }}>
      <Stack gap="sm" h="100%">
        <Flex justify="space-between" align="center">
          <Flex align="center" gap="xs">
            <IconFileInfo size={20} />
            <Title order={2} size="h3">Metadata</Title>
          </Flex>
          {parsedData && (
            <Button
              variant="outline"
              color="gray"
              size="xs"
              leftSection={<IconCopy size={14} />}
              onClick={handleCopyMetadata}
              styles={{
                root: {
                  borderColor: '#262626',
                  color: '#262626',
                  backgroundColor: '#ffffff',
                  '&:hover': {
                    backgroundColor: '#f5f5f5',
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
            {/* File Information */}
            <div>
              <Text size="sm" fw={700} mb="xs" c="gray.9">File Information</Text>
              <Stack gap={4}>
                <Group justify="space-between" align="flex-start">
                  <Text size="xs" fw={600} c="gray.7" style={{ minWidth: "80px" }}>Name:</Text>
                  <Text size="xs" c={parsedData && uploadedFile?.name ? "gray.9" : "gray.5"} style={{ flex: 1, textAlign: "right", fontStyle: parsedData && uploadedFile?.name ? "normal" : "italic" }}>
                    {parsedData && uploadedFile?.name ? uploadedFile.name : 'example-email.eml'}
                  </Text>
                </Group>
                <Group justify="space-between" align="flex-start">
                  <Text size="xs" fw={600} c="gray.7" style={{ minWidth: "80px" }}>Size:</Text>
                  <Text size="xs" c={parsedData && uploadedFile?.size ? "gray.9" : "gray.5"} style={{ flex: 1, textAlign: "right", fontStyle: parsedData && uploadedFile?.size ? "normal" : "italic" }}>
                    {parsedData && uploadedFile?.size ? formatFileSize(uploadedFile.size) : '2.5 KB'}
                  </Text>
                </Group>
                <Group justify="space-between" align="flex-start">
                  <Text size="xs" fw={600} c="gray.7" style={{ minWidth: "80px" }}>Type:</Text>
                  <Text size="xs" c={parsedData && uploadedFile?.type ? "gray.9" : "gray.5"} style={{ flex: 1, textAlign: "right", fontStyle: parsedData && uploadedFile?.type ? "normal" : "italic" }}>
                    {parsedData && uploadedFile?.type ? uploadedFile.type : 'text/plain'}
                  </Text>
                </Group>
                <Group justify="space-between" align="flex-start">
                  <Text size="xs" fw={600} c="gray.7" style={{ minWidth: "80px" }}>Extension:</Text>
                  <Text size="xs" c={parsedData && uploadedFile?.name ? "gray.9" : "gray.5"} style={{ flex: 1, textAlign: "right", fontStyle: parsedData && uploadedFile?.name ? "normal" : "italic" }}>
                    {parsedData && uploadedFile?.name ? getFileExtension(uploadedFile.name) : 'EML'}
                  </Text>
                </Group>
                <Group justify="space-between" align="flex-start">
                  <Text size="xs" fw={600} c="gray.7" style={{ minWidth: "80px" }}>Modified:</Text>
                  <Text size="xs" c={parsedData && uploadedFile?.lastModified ? "gray.9" : "gray.5"} style={{ flex: 1, textAlign: "right", fontStyle: parsedData && uploadedFile?.lastModified ? "normal" : "italic" }}>
                    {parsedData && uploadedFile?.lastModified ? new Date(uploadedFile.lastModified).toLocaleDateString() : '18/6/2025'}
                  </Text>
                </Group>
                <Group justify="space-between" align="flex-start">
                  <Text size="xs" fw={600} c="gray.7" style={{ minWidth: "80px" }}>MIME Type:</Text>
                  <Text size="xs" c={parsedData && uploadedFile?.type ? "gray.9" : "gray.5"} style={{ flex: 1, textAlign: "right", fontStyle: parsedData && uploadedFile?.type ? "normal" : "italic" }}>
                    {parsedData && uploadedFile?.type ? uploadedFile.type : 'message/rfc822'}
                  </Text>
                </Group>
                <Group justify="space-between" align="flex-start">
                  <Text size="xs" fw={600} c="gray.7" style={{ minWidth: "80px" }}>Web Type:</Text>
                  <Text size="xs" c={parsedData && uploadedFile ? "gray.9" : "gray.5"} style={{ flex: 1, textAlign: "right", fontStyle: parsedData && uploadedFile ? "normal" : "italic" }}>
                    {parsedData && uploadedFile ? (uploadedFile.webkitRelativePath || 'Local File') : 'Local File'}
                  </Text>
                </Group>
                <Group justify="space-between" align="flex-start">
                  <Text size="xs" fw={600} c="gray.7" style={{ minWidth: "80px" }}>Created:</Text>
                  <Text size="xs" c={parsedData && uploadedFile?.lastModified ? "gray.9" : "gray.5"} style={{ flex: 1, textAlign: "right", fontStyle: parsedData && uploadedFile?.lastModified ? "normal" : "italic" }}>
                    {parsedData && uploadedFile?.lastModified ? new Date(uploadedFile.lastModified).toLocaleDateString() : '18/6/2025'}
                  </Text>
                </Group>
              </Stack>
            </div>

            <Divider size="xs" />

            {/* Text Content Analysis */}
            <div>
              <Text size="sm" fw={700} mb="xs" c="gray.9">Content Analysis</Text>
              <Stack gap={4}>
                <Group justify="space-between" align="flex-start">
                  <Text size="xs" fw={600} c="gray.7" style={{ minWidth: "100px" }}>Source:</Text>
                  <Text size="xs" c={parsedData && (textAreaValue || uploadedFile) ? "gray.9" : "gray.5"} style={{ flex: 1, textAlign: "right", fontStyle: parsedData && (textAreaValue || uploadedFile) ? "normal" : "italic" }}>
                    {parsedData && uploadedFile ? 'File Upload' : parsedData && textAreaValue ? 'Text Input' : 'File Upload'}
                  </Text>
                </Group>
                <Group justify="space-between" align="flex-start">
                  <Text size="xs" fw={600} c="gray.7" style={{ minWidth: "100px" }}>Text Size:</Text>
                  <Text size="xs" c={parsedData && textAreaValue ? "gray.9" : "gray.5"} style={{ flex: 1, textAlign: "right", fontStyle: parsedData && textAreaValue ? "normal" : "italic" }}>
                    {parsedData && textAreaValue ? formatFileSize(estimateTextSize(textAreaValue)) : '2.1 KB'}
                  </Text>
                </Group>
                <Group justify="space-between" align="flex-start">
                  <Text size="xs" fw={600} c="gray.7" style={{ minWidth: "100px" }}>Lines:</Text>
                  <Text size="xs" c={parsedData && textAreaValue ? "gray.9" : "gray.5"} style={{ flex: 1, textAlign: "right", fontStyle: parsedData && textAreaValue ? "normal" : "italic" }}>
                    {parsedData && textAreaValue ? countLines(textAreaValue).toString() : '45'}
                  </Text>
                </Group>
                <Group justify="space-between" align="flex-start">
                  <Text size="xs" fw={600} c="gray.7" style={{ minWidth: "100px" }}>Words:</Text>
                  <Text size="xs" c={parsedData && textAreaValue ? "gray.9" : "gray.5"} style={{ flex: 1, textAlign: "right", fontStyle: parsedData && textAreaValue ? "normal" : "italic" }}>
                    {parsedData && textAreaValue ? countWords(textAreaValue).toString() : '342'}
                  </Text>
                </Group>
                <Group justify="space-between" align="flex-start">
                  <Text size="xs" fw={600} c="gray.7" style={{ minWidth: "100px" }}>Characters:</Text>
                  <Text size="xs" c={parsedData && textAreaValue ? "gray.9" : "gray.5"} style={{ flex: 1, textAlign: "right", fontStyle: parsedData && textAreaValue ? "normal" : "italic" }}>
                    {parsedData && textAreaValue ? countCharacters(textAreaValue).toString() : '2,156'}
                  </Text>
                </Group>
              </Stack>
            </div>

            <Divider size="xs" />

            {/* Parsing Statistics */}
            <div>
              <Text size="sm" fw={700} mb="xs" c="gray.9">Parsing Stats</Text>
              <Stack gap={4}>
                <Group justify="space-between" align="flex-start">
                  <Text size="xs" fw={600} c="gray.7" style={{ minWidth: "100px" }}>Status:</Text>
                  <Text size="xs" c={parsedData ? "green.7" : "gray.5"} style={{ flex: 1, textAlign: "right", fontWeight: parsedData ? 600 : 400, fontStyle: parsedData ? "normal" : "italic" }}>
                    {parsedData ? 'Parsed Successfully' : 'Pending'}
                  </Text>
                </Group>
                <Group justify="space-between" align="flex-start">
                  <Text size="xs" fw={600} c="gray.7" style={{ minWidth: "100px" }}>Parsed At:</Text>
                  <Text size="xs" c={parsedData ? "gray.9" : "gray.5"} style={{ flex: 1, textAlign: "right", fontStyle: parsedData ? "normal" : "italic" }}>
                    {parsedData ? `${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}` : 'Not yet parsed'}
                  </Text>
                </Group>
                <Group justify="space-between" align="flex-start">
                  <Text size="xs" fw={600} c="gray.7" style={{ minWidth: "100px" }}>Body Length:</Text>
                  <Text size="xs" c={parsedData?.parsed?.plainText ? "gray.9" : "gray.5"} style={{ flex: 1, textAlign: "right", fontStyle: parsedData?.parsed?.plainText ? "normal" : "italic" }}>
                    {parsedData?.parsed?.plainText ? `${parsedData.parsed.plainText.length.toString()} chars` : '0 chars'}
                  </Text>
                </Group>
                <Group justify="space-between" align="flex-start">
                  <Text size="xs" fw={600} c="gray.7" style={{ minWidth: "100px" }}>HTML Length:</Text>
                  <Text size="xs" c={parsedData?.parsed?.htmlText ? "gray.9" : "gray.5"} style={{ flex: 1, textAlign: "right", fontStyle: parsedData?.parsed?.htmlText ? "normal" : "italic" }}>
                    {parsedData?.parsed?.htmlText ? `${parsedData.parsed.htmlText.length.toString()} chars` : '0 chars'}
                  </Text>
                </Group>
                <Group justify="space-between" align="flex-start">
                  <Text size="xs" fw={600} c="gray.7" style={{ minWidth: "100px" }}>Processing Time:</Text>
                  <Text size="xs" c={parsedData ? "gray.9" : "gray.5"} style={{ flex: 1, textAlign: "right", fontStyle: parsedData ? "normal" : "italic" }}>
                    {parsedData?.processingTime ? `${String(parsedData.processingTime)}ms` : 'N/A'}
                  </Text>
                </Group>
                <Group justify="space-between" align="flex-start">
                  <Text size="xs" fw={600} c="gray.7" style={{ minWidth: "100px" }}>Parser Engine:</Text>
                  <Text size="xs" c={parsedData ? "gray.9" : "gray.5"} style={{ flex: 1, textAlign: "right", fontStyle: parsedData ? "normal" : "italic" }}>
                    {String(parsedData?.parserEngine || 'Email Parser v1.0')}
                  </Text>
                </Group>
                <Group justify="space-between" align="flex-start">
                  <Text size="xs" fw={600} c="gray.7" style={{ minWidth: "100px" }}>Encoding:</Text>
                  <Text size="xs" c={parsedData ? "gray.9" : "gray.5"} style={{ flex: 1, textAlign: "right", fontStyle: parsedData ? "normal" : "italic" }}>
                    {String(parsedData?.parsed?.headers?.['content-transfer-encoding'] || 'UTF-8')}
                  </Text>
                </Group>
              </Stack>
            </div>

            <Divider size="xs" />

            {/* Content Structure */}
            <div>
              <Text size="sm" fw={700} mb="xs" c="gray.9">Content Structure</Text>
              <Stack gap={4}>
                <Group justify="space-between" align="flex-start">
                  <Text size="xs" fw={600} c="gray.7" style={{ minWidth: "100px" }}>Has HTML:</Text>
                  <Text size="xs" c={parsedData?.parsed?.htmlText ? "gray.9" : "gray.5"} style={{ flex: 1, textAlign: "right", fontStyle: parsedData?.parsed?.htmlText ? "normal" : "italic" }}>
                    {parsedData?.parsed?.htmlText ? 'Yes' : 'No'}
                  </Text>
                </Group>
                <Group justify="space-between" align="flex-start">
                  <Text size="xs" fw={600} c="gray.7" style={{ minWidth: "100px" }}>Has Plain Text:</Text>
                  <Text size="xs" c={parsedData?.parsed?.plainText ? "gray.9" : "gray.5"} style={{ flex: 1, textAlign: "right", fontStyle: parsedData?.parsed?.plainText ? "normal" : "italic" }}>
                    {parsedData?.parsed?.plainText ? 'Yes' : 'No'}
                  </Text>
                </Group>
                <Group justify="space-between" align="flex-start">
                  <Text size="xs" fw={600} c="gray.7" style={{ minWidth: "100px" }}>Attachments:</Text>
                  <Text size="xs" c={(parsedData?.parsed?.attachments?.length || 0) > 0 ? "gray.9" : "gray.5"} style={{ flex: 1, textAlign: "right", fontStyle: (parsedData?.parsed?.attachments?.length || 0) > 0 ? "normal" : "italic" }}>
                    {parsedData ? (parsedData.parsed?.attachments?.length || 0) : '0'}
                  </Text>
                </Group>
                <Group justify="space-between" align="flex-start">
                  <Text size="xs" fw={600} c="gray.7" style={{ minWidth: "100px" }}>Content Type:</Text>
                  <Text size="xs" c={parsedData?.parsed?.headers?.['content-type'] ? "gray.9" : "gray.5"} style={{ flex: 1, textAlign: "right", fontStyle: parsedData?.parsed?.headers?.['content-type'] ? "normal" : "italic" }}>
                    {String(parsedData?.parsed?.headers?.['content-type'] || 'text/plain')}
                  </Text>
                </Group>
                <Group justify="space-between" align="flex-start">
                  <Text size="xs" fw={600} c="gray.7" style={{ minWidth: "100px" }}>Multipart:</Text>
                  <Text size="xs" c={parsedData?.parsed?.headers?.['content-type']?.includes?.('multipart') ? "gray.9" : "gray.5"} style={{ flex: 1, textAlign: "right", fontStyle: parsedData?.parsed?.headers?.['content-type']?.includes?.('multipart') ? "normal" : "italic" }}>
                    {parsedData?.parsed?.headers?.['content-type']?.includes?.('multipart') ? 'Yes' : 'No'}
                  </Text>
                </Group>
              </Stack>
            </div>



          </Stack>
        </ScrollArea>
      </Stack>
    </Card>
  );
}