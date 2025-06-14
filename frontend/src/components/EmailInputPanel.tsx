import {
  Button,
  Card,
  Divider,
  Flex,
  Group,
  Input,
  Space,
  Tabs,
  Text,
  Textarea,
  Title,
} from "@mantine/core";
import {
  IconCopy,
  IconFile,
  IconLetterCase,
  IconUpload,
  IconX,
} from "@tabler/icons-react";
import { Dropzone } from "@mantine/dropzone";
import type { TabType } from "../types/email";

interface EmailInputPanelProps {
  textAreaValue: string;
  uploadedFile: File | null;
  activeTab: TabType;
  loading: boolean;
  onTextChange: (value: string) => void;
  onFileUpload: (file: File) => void;
  onTabChange: (tab: TabType) => void;
  onClear: () => void;
  onUpload: () => void;
}

export function EmailInputPanel({
  textAreaValue,
  uploadedFile,
  activeTab,
  loading,
  onTextChange,
  onFileUpload,
  onTabChange,
  onUpload,
}: EmailInputPanelProps) {
  const canUpload =
    !loading && (uploadedFile !== null || textAreaValue.trim() !== "");

  return (
    <Card
      padding="lg"
      radius="sm"
      style={{
        height: "100%",
        flex: 1,
        minHeight: 0,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Flex justify="space-between" align="center">
        <Title order={2} size="h3">
          Input
        </Title>
        <Group gap="sm" justify="flex-end">
          <Button
            variant="gradient"
            gradient={{ from: "blue", to: "cyan" }}
            size="sm"
            onClick={onUpload}
            disabled={!canUpload}
            loading={loading}
            leftSection={<IconUpload size={16} />}
          >
            Upload
          </Button>
            <Button
              variant="light"
              color="gray"
              size="sm"
              leftSection={<IconCopy size={16} />}
              disabled={activeTab === "gallery" ? !textAreaValue.trim() : !uploadedFile}
              onClick={() => {
                if (activeTab === "gallery" && textAreaValue.trim()) {
                  navigator.clipboard.writeText(textAreaValue);
                }
              }}
            >
              Copy
            </Button>
        </Group>
      </Flex>

      <Space h="sm" />
      <Divider />
      <Space h="sm" />
      <Space h="sm" />

      <Tabs
        variant="pills"
        value={activeTab}
        onChange={(value) => value && onTabChange(value as TabType)}
        style={{
          flex: 1,
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Tabs.List grow>
          <Tabs.Tab value="gallery" leftSection={<IconLetterCase size={16} />}>
            Text Input
          </Tabs.Tab>
          <Tabs.Tab value="messages" leftSection={<IconFile size={16} />}>
            File Upload
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel
          value="gallery"
          style={{
            flex: 1,
            minHeight: 0,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Space h="sm" />
          <Textarea
            label="Email Content"
            value={textAreaValue}
            onChange={(e) => onTextChange(e.target.value)}
            placeholder="Paste your email content here (headers + body)...&#10;&#10;Example:&#10;From: sender@example.com&#10;To: recipient@example.com&#10;Subject: Test Email&#10;&#10;Email body content..."
            h={"92%"}
            styles={{
              wrapper: { height: "100%" },
              input: {
                height: "100%",
                fontFamily: "Inter",
              },
            }}
          />
        </Tabs.Panel>

        <Tabs.Panel
          value="messages"
          style={{
            flex: 1,
            minHeight: 0,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Space h="sm" />
          <Input.Label size="sm" fw={500} c="gray.7" mb="xs">Upload File</Input.Label>
          <Dropzone
            onDrop={(files) => onFileUpload(files[0])}
            onReject={(files) => console.warn("File rejected:", files)}
            maxSize={5 * 1024 ** 2}
            accept={{
              "text/*": [".txt"],
              "application/octet-stream": [".eml", ".msg"],
              "application/text": [".txt"],
            }}
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
              border: uploadedFile
                ? "2px dashed var(--mantine-color-blue-5)"
                : "2px dashed var(--mantine-color-gray-3)",
              borderRadius: "var(--mantine-radius-md)",
              height: "100%",
              backgroundColor: uploadedFile 
                ? "var(--mantine-color-blue-0)" 
                : "var(--mantine-color-gray-0)",
              transition: "all 0.15s ease-in-out",
              cursor: "pointer",
            }}
          >
            {uploadedFile ? (
              <>
                <IconFile
                  size={48}
                  color="var(--mantine-color-blue-6)"
                  stroke={1.5}
                />
                <Text size="sm" mt="sm" fw={500} ta="center" c="gray.8">
                  {uploadedFile.name}
                </Text>
                <Text size="xs" c="dimmed" mt={4} ta="center">
                  Ready to upload
                </Text>
              </>
            ) : (
              <>
                <Dropzone.Accept>
                  <IconUpload
                    size={48}
                    color="var(--mantine-color-blue-6)"
                    stroke={1.5}
                  />
                </Dropzone.Accept>
                <Dropzone.Reject>
                  <IconX
                    size={48}
                    color="var(--mantine-color-red-6)"
                    stroke={1.5}
                  />
                </Dropzone.Reject>
                <Dropzone.Idle>
                  <IconFile
                    size={48}
                    color="var(--mantine-color-gray-5)"
                    stroke={1.2}
                  />
                </Dropzone.Idle>
                <Text size="md" mt="sm" fw={500} ta="center" c="gray.8">
                  Drop files here or click to browse
                </Text>
                <Text size="xs" c="dimmed" mt={4} ta="center">
                  Attach files up to 5 MB (.txt, .eml, .msg)
                </Text>
              </>
            )}
          </Dropzone>
          {uploadedFile && (
            <Text mt="xs" size="xs" c="dimmed" ta="center">
              Selected: <strong>{uploadedFile.name}</strong>
            </Text>
          )}
        </Tabs.Panel>
      </Tabs>
    </Card>
  );
}
