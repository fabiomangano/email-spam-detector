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
} from "@mantine/core";
import { IconFile, IconLetterCase, IconListDetails } from "@tabler/icons-react";
import { Textarea } from "@mantine/core";
import { Group, Text } from "@mantine/core";
import { IconUpload, IconPhoto, IconX } from "@tabler/icons-react";
import { Dropzone, IMAGE_MIME_TYPE } from "@mantine/dropzone";
import { useEffect, useState } from "react";
import { Title } from "@mantine/core";

/**
 *
 *
 * todo: aggiungere
 * - spiegazioni
 * - bottoni per copiare
 * - empty states
 * - sotto la dropdonw nome file carricato
 */

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
            color: "#000", // opzionale: testo nero anche da disabilitato
            opacity: 1, // opzionale: evita il grigio "faded" di default
          },
        }}
      />
    </Flex>
  );
}

function Home() {
  const [textAreaValue, setTextAreaValue] = useState("");

  const handleTextAreaValueChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setTextAreaValue(event.target.value);
  };

  useEffect(() => {
    console.log(textAreaValue);
  }, [textAreaValue]);

  useEffect(() => {
    fetch("http://localhost:3000/hello")
      .then((res) => res.text())
      .then((data) => {
        console.log("Risposta:", data);
      });
  }, []);

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
          width: "50%",
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
            <Button variant="outline" color="black" style={{ width: "100px" }}>
              Clear
            </Button>
            <Button variant="outline" color="black" style={{ width: "100px" }}>
              Copy
            </Button>
            <Button
              variant="filled"
              color="black"
              style={{ width: "100px" }}
              disabled
            >
              Parse
            </Button>
          </Group>
        </Flex>
        <Space h="sm"></Space>
        <Divider></Divider>
        <Space h="sm"></Space>
        <Space h="sm"></Space>
        <Tabs
          variant="outline"
          defaultValue="gallery"
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
            {/* <Tabs.Tab
              value="settings"
              leftSection={<IconListDetails size={12} />}
            >
              Data
            </Tabs.Tab> */}
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
            <Space h="sm"></Space>
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
              flex: 1,
              minHeight: 0,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Space h="sm" />
            <Input.Label>Load a file</Input.Label>

            <Dropzone
              onDrop={(files) => console.log("accepted files", files)}
              onReject={(files) => console.log("rejected files", files)}
              maxSize={5 * 1024 ** 2}
              accept={IMAGE_MIME_TYPE}
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
            </Dropzone>
          </Tabs.Panel>

          <Tabs.Panel value="settings">Settings tab content</Tabs.Panel>
        </Tabs>
      </Card>

      <Card
        padding="lg"
        radius="sm"
        style={{ width: "50%", height: "100%", flex: 1 }}
      >
        <Flex justify="space-between">
          <Title order={2} style={{ fontSize: "20px" }}>
            Content
          </Title>
          <Group gap="xs">
            <Button variant="outline" color="black" style={{ width: "100px" }}>
              Copy
            </Button>
            <Button
              variant="filled"
              color="black"
              style={{ width: "100px" }}
              disabled
            >
              Upload
            </Button>
          </Group>
        </Flex>
        <Space h="sm"></Space>
        <Divider></Divider>
        <Space h="lg"></Space>
        <Title order={5}>Headers</Title>
        <Space h="sm"></Space>
        <Divider></Divider>
        <Space h="sm"></Space>

        {/**
         * ID messaggio
         * Creato alle
         * Da
         * A
         * Oggetto
         * SPF
         * DIM
         * DMARC
         */}

        <FieldRow label="Message-ID" />
        <FieldRow label="Date" />
        <FieldRow label="From" />
        <FieldRow label="To" />
        <FieldRow label="Subject" />

        <FieldRow label="Spf/Dim/Mar" />

        <Space h="lg"></Space>
        <Title order={5}>Body</Title>
        <Space h="sm"></Space>
        <Divider></Divider>
        <Space h="sm"></Space>
        <Textarea
          minRows={10}
          autosize={false}
          h={"43%"}
          disabled
          styles={{
            wrapper: { height: "100%" },
            input: {
              height: "100%",
              backgroundColor: "white",
              color: "#000", // opzionale: testo nero anche da disabilitato
              opacity: 1, // opzionale: evita il grigio "faded" di default
            },
          }}
        />
        <Space h="lg"></Space>
        {/**
        *  <Title order={5}>Attachments</Title>
        <Space h="sm"></Space>
        <Divider></Divider>
        <Space h="sm"></Space>
        */}
      </Card>
    </div>
  );
}

export default Home;
