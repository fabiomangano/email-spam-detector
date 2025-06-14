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
        <Title order={2} style={{ fontSize: "20px" }}>
          Email
        </Title>
        <Group gap="xs">
          <Button
            variant="outline"
            color="black"
            style={{ width: "100px" }}
            onClick={onClear}
            disabled={!canClear}
          >
            Clear
          </Button>
          <Button
            variant="outline"
            color="black"
            style={{ width: "100px" }}
            disabled
          >
            Copy
          </Button>
          <Button
            variant="filled"
            color="black"
            style={{ width: "100px" }}
            onClick={onUpload}
            disabled={!canUpload}
            loading={loading}
          >
            Upload
          </Button>
          <Button
            variant="filled"
            color="black"
            style={{ width: "100px" }}
            onClick={onParse}
            disabled={!canParse}
          >
            Parse
          </Button>
        </Group>
      </Flex>
      
      <Space h="sm" />
      <Divider />
      <Space h="sm" />
      <Space h="sm" />
      
      <Tabs
        variant="outline"
        value={activeTab}
        onChange={(value) => value && onTabChange(value as TabType)}
        style={{
          flex: 1,
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Tabs.List>
          <Tabs.Tab
            value="gallery"
            leftSection={<IconLetterCase size={14} />}
          >
            Text
          </Tabs.Tab>
          <Tabs.Tab value="messages" leftSection={<IconFile size={12} />}>
            File
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
            label="Text"
            value={textAreaValue}
            onChange={(e) => onTextChange(e.target.value)}
            placeholder="Inserisci il testo dell'email qui..."
            h={"92%"}
            styles={{
              wrapper: { height: "100%" },
              input: { height: "100%" },
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
              border: "1px dashed gray",
              borderRadius: "8px",
              height: "100%",
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