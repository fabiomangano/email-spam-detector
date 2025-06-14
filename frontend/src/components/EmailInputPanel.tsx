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
  IconFile,
  IconLetterCase,
  IconUpload,
  IconX,
  IconFileText,
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
  onParse: () => void;
  canParse: boolean;
}

export function EmailInputPanel({
  textAreaValue,
  uploadedFile,
  activeTab,
  loading,
  onTextChange,
  onFileUpload,
  onTabChange,
  onClear,
  onUpload,
  onParse,
  canParse,
}: EmailInputPanelProps) {
  const canClear = 
    (activeTab === "gallery" && textAreaValue.trim() !== "") ||
    (activeTab === "messages" && uploadedFile !== null);

  const canUpload = !loading && (uploadedFile !== null || textAreaValue.trim() !== "");

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
      <Flex justify="space-between" gap="10px">
        <Title order={2} size="h3">
          Email Input
        </Title>
        <Group gap="sm" justify="flex-end">
          <Button
            variant="subtle"
            color="gray"
            size="sm"
            onClick={onClear}
            disabled={!canClear}
          >
            Clear
          </Button>
          <Button
            variant="gradient"
            gradient={{ from: 'blue', to: 'cyan' }}
            size="sm"
            onClick={onUpload}
            disabled={!canUpload}
            loading={loading}
            leftSection={<IconUpload size={16} />}
          >
            Upload Email
          </Button>
          <Button
            variant="light"
            color="blue"
            size="sm"
            onClick={onParse}
            disabled={!canParse}
            leftSection={<IconFileText size={16} />}
          >
            Parse Content
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
          <Tabs.Tab
            value="gallery"
            leftSection={<IconLetterCase size={16} />}
          >
            Text Input
          </Tabs.Tab>
          <Tabs.Tab 
            value="messages" 
            leftSection={<IconFile size={16} />}
          >
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
            width: "50%",
            minHeight: 0,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Space h="sm" />
          <Input.Label>Load a file</Input.Label>
          <Dropzone
            onDrop={(files) => onFileUpload(files[0])}
            onReject={(files) => console.warn("File rifiutato:", files)}
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
              border: uploadedFile ? "2px dashed #3b82f6" : "2px dashed #e0e7ff",
              borderRadius: "12px",
              height: "100%",
              backgroundColor: uploadedFile ? "#f0f9ff" : "#fafbfc",
              transition: "all 0.2s ease",
              cursor: "pointer",
            }}
          >
            {uploadedFile ? (
              <>
                <IconFile
                  size={52}
                  color="var(--mantine-color-blue-6)"
                  stroke={1.5}
                />
                <Text size="md" mt="md" fw={500}>
                  {uploadedFile.name}
                </Text>
                <Text size="sm" c="dimmed" mt={5}>
                  File pronto per l'upload
                </Text>
              </>
            ) : (
              <>
                <Dropzone.Accept>
                  <IconUpload
                    size={52}
                    color="var(--mantine-color-blue-6)"
                    stroke={1.5}
                  />
                </Dropzone.Accept>
                <Dropzone.Reject>
                  <IconX
                    size={52}
                    color="var(--mantine-color-red-6)"
                    stroke={1.5}
                  />
                </Dropzone.Reject>
                <Dropzone.Idle>
                  <IconFile
                    size={52}
                    color="var(--mantine-color-dimmed)"
                    stroke={1}
                  />
                </Dropzone.Idle>
                <Text size="xl" mt="md">
                  Trascina qui i file o clicca per selezionarlo
                </Text>
                <Text size="sm" c="dimmed" mt={7}>
                  Puoi allegare un file di massimo 5 MB
                </Text>
              </>
            )}
          </Dropzone>
          {uploadedFile && (
            <Text mt="xs" size="sm" c="dimmed" ta="center">
              File selezionato: <strong>{uploadedFile.name}</strong>
            </Text>
          )}
        </Tabs.Panel>
      </Tabs>
    </Card>
  );
}