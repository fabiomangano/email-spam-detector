import {
  Accordion,
  Alert,
  Badge,
  Button,
  Card,
  Code,
  Divider,
  Flex,
  Grid,
  Input,
  ScrollArea,
  Space,
  Tabs,
  Textarea,
  Group,
  Text,
  Title,
} from "@mantine/core";
import {
  IconFile,
  IconLetterCase,
  IconListDetails,
  IconUpload,
  IconX,
} from "@tabler/icons-react";
import { Dropzone } from "@mantine/dropzone";
import { useEffect, useState } from "react";

interface FieldRowProps {
  label: string;
  value?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
}

function FieldRow({ label, value, onChange, placeholder }: FieldRowProps) {
  return (
    <Flex align="center" gap="sm" mb="sm">
      <Text style={{ minWidth: 90 }}>{label}</Text>
      <Input
        style={{ flex: 1 }}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        size="sm"
        disabled
        styles={{
          input: {
            backgroundColor: "white",
            color: "#000",
            opacity: 1,
          },
        }}
      />
    </Flex>
  );
}

function Home() {
  const [textAreaValue, setTextAreaValue] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedFilename, setUploadedFilename] = useState<string | null>(null);
  const [parsedData, setParsedData] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("gallery");

  const handleTextAreaValueChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setTextAreaValue(event.target.value);
  };

  const handleClear = () => {
    setTextAreaValue(""); // Pulisce la textarea
    setUploadedFile(null); // Rimuove il file
    setUploadedFilename(null); // Resetta il nome file
    setParsedData(null); // Cancella i dati parsati (header + body)
  };

  const handleUpload = async () => {
    setLoading(true);
    try {
      if (activeTab === "messages" && uploadedFile) {
        const formData = new FormData();
        formData.append("file", uploadedFile);

        const response = await fetch("http://localhost:3000/upload/file", {
          method: "POST",
          body: formData,
        });
        const result = await response.json();
        console.log("Upload file success:", result);
        setUploadedFilename(result.filename);
      } else if (activeTab === "gallery" && textAreaValue.trim() !== "") {
        const response = await fetch("http://localhost:3000/upload/text", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: textAreaValue }),
        });
        const result = await response.json();
        console.log("Upload text success:", result);
        setUploadedFilename(result.filename);
      } else {
        alert("Nessun contenuto da caricare.");
      }
    } catch (err) {
      console.error("Errore upload:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleParse = async () => {
    if (!uploadedFilename) {
      alert("Nessun file disponibile da analizzare.");
      return;
    }
    try {
      const res = await fetch(
        `http://localhost:3000/parse/${encodeURIComponent(uploadedFilename)}`
      );
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData?.error || "Errore nel parsing");
      }
      const data = await res.json();
      console.log("Risultato parsing:", data);
      setParsedData(data);
    } catch (error) {
      console.error("Errore durante il parsing:", error);
      alert(`Errore: ${(error as Error).message}`);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        gap: "20px",
        height: "100%",
      }}
    >
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
              onClick={handleClear}
              disabled={
                (activeTab === "gallery" && textAreaValue.trim() === "") ||
                (activeTab === "messages" && !uploadedFile)
              }
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
              onClick={handleUpload}
              disabled={
                loading || (!uploadedFile && textAreaValue.trim() === "")
              }
            >
              Upload
            </Button>
            <Button
              variant="filled"
              color="black"
              style={{ width: "100px" }}
              onClick={handleParse}
              disabled={!uploadedFilename}
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
          onChange={(value) => value && setActiveTab(value)}
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
              onChange={handleTextAreaValueChange}
              placeholder="Input placeholder"
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
              onDrop={(files) => setUploadedFile(files[0])}
              onReject={(files) => console.warn("REJECTED:", files)}
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

      <Card padding="lg" radius="sm" style={{ height: "100%", flex: 1 }}>
        <Flex justify="space-between">
          <Title order={2} style={{ fontSize: "20px" }}>
            Content
          </Title>
          <Group gap="xs">
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
              disabled
            >
              Analyze
            </Button>
          </Group>
        </Flex>
        <Space h="sm" />
        <Divider />
        <Space h="lg" />
        <Title order={5}>Headers</Title>
        <Space h="sm" />
        <Divider />
        <Space h="sm" />
        <FieldRow
          label="Message-ID"
          value={parsedData?.parsed?.metadata?.messageId}
        />
        <FieldRow label="Date" value={parsedData?.parsed?.metadata?.date} />
        <FieldRow label="From" value={parsedData?.parsed?.metadata?.from} />
        <FieldRow label="To" value={parsedData?.parsed?.metadata?.to} />
        <FieldRow
          label="Subject"
          value={parsedData?.parsed?.metadata?.subject}
        />
        <FieldRow
          label="Spf/Dim/Mar"
          value={`SPF=${parsedData?.metrics?.spfResult ?? "N/A"}, DKIM=${
            parsedData?.metrics?.dkimResult ?? "N/A"
          }, DMARC=${parsedData?.metrics?.dmarcResult ?? "N/A"}`}
        />
        <Space h="lg" />
        <Title order={5}>Body</Title>
        <Space h="sm" />
        <Divider />
        <Space h="sm" />
        <Textarea
          minRows={10}
          autosize={false}
          h={"43%"}
          disabled
          value={
            parsedData?.parsed?.plainText || parsedData?.parsed?.htmlText || ""
          }
          styles={{
            wrapper: { height: "100%" },
            input: {
              height: "100%",
              backgroundColor: "white",
              color: "#000",
              opacity: 1,
            },
          }}
        />
      </Card>
    </div>
  );
}

export default Home;
