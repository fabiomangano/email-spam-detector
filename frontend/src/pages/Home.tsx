import {
  Accordion,
  Alert,
  Badge,
  Button,
  Card,
  Code,
  Divider,
  Flex,
  ScrollArea,
  Space,
  Tabs,
} from "@mantine/core";
import {
  IconBubbleText,
  IconFile,
  IconLetterCase,
  IconListDetails,
  IconMessageCircle,
  IconSettings,
} from "@tabler/icons-react";
import { Textarea } from "@mantine/core";
import { Group, Text } from "@mantine/core";
import { IconUpload, IconPhoto, IconX } from "@tabler/icons-react";
import { Dropzone, IMAGE_MIME_TYPE } from "@mantine/dropzone";
import { useEffect, useState } from "react";
import { Title } from "@mantine/core";

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
        justifyContent: "center",
        flexDirection: "column",
        gap: "20px",
      }}
    >
      <Card shadow="sm" padding="lg" radius="sm">
        <Flex justify="space-between" gap="10px">
          <Title order={2} style={{ fontSize: "20px" }}>
            Email
          </Title>
          <Group gap="xs">
            <Button variant="outline" color="black" style={{ width: "100px" }}>
              Clear
            </Button>
            <Button variant="filled" color="black" style={{ width: "100px" }}>
              Parse
            </Button>
          </Group>
        </Flex>
        <Space h="sm"></Space>
        <Divider></Divider>
        <Space h="sm"></Space>
        <Space h="sm"></Space>
        <Tabs variant="outline" defaultValue="gallery">
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
            <Tabs.Tab
              value="settings"
              leftSection={<IconListDetails size={12} />}
            >
              Data
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="gallery">
            <Space h="sm"></Space>
            <Textarea
              label="Text"
              value={textAreaValue}
              onChange={handleTextAreaValueChange}
              placeholder="Input placeholder"
              autosize
              minRows={15}
            />
          </Tabs.Panel>

          <Tabs.Panel value="messages">
            <Dropzone
              onDrop={(files) => console.log("accepted files", files)}
              onReject={(files) => console.log("rejected files", files)}
              maxSize={5 * 1024 ** 2}
              accept={IMAGE_MIME_TYPE}
            >
              <Group
                justify="center"
                gap="xl"
                mih={220}
                style={{ pointerEvents: "none" }}
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
                  <IconPhoto
                    size={52}
                    color="var(--mantine-color-dimmed)"
                    stroke={1.5}
                  />
                </Dropzone.Idle>

                <div>
                  <Text size="xl" inline>
                    Drag images here or click to select files
                  </Text>
                  <Text size="sm" c="dimmed" inline mt={7}>
                    Attach as many files as you like, each file should not
                    exceed 5mb
                  </Text>
                </div>
              </Group>
            </Dropzone>
          </Tabs.Panel>

          <Tabs.Panel value="settings">Settings tab content</Tabs.Panel>
        </Tabs>
      </Card>

      <Card padding="lg">
        <Flex justify="space-between">
          <Title order={2} style={{ fontSize: "20px" }}>
            Content
          </Title>
          <Button variant="filled" color="black" style={{ width: "100px" }}>
            Upload
          </Button>
        </Flex>
        <Space h="sm"></Space>
        <Divider></Divider>
        <Space h="sm"></Space>
        <Group justify="space-between">
          <Text fw={700}>Your login link</Text>
          <Text size="sm" c="gray">
            12/12/2024
          </Text>
        </Group>

        <Text size="sm" mt="sm">
          Da: <b>Josh Comeau</b> &lt;support@joshwcomeau.com&gt;
        </Text>
        <Text size="sm">A: fabio_mangano@hotmail.it</Text>

        <ScrollArea h={300}>
          <Text size="sm" ff="monospace" style={{ whiteSpace: "pre-wrap" }}>
           Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed nec nisl vitae velit pretium feugiat. Suspendisse potenti. In eget dictum magna. Duis sagittis, ipsum ac porta gravida, sapien eros tincidunt urna, in convallis metus metus sed urna. Aenean ultrices orci eu mi finibus, at volutpat orci accumsan. Donec venenatis mauris sed neque hendrerit, sit amet ullamcorper enim accumsan. Etiam malesuada felis ut hendrerit gravida. Praesent fermentum convallis dolor, nec eleifend orci.

          </Text>
        </ScrollArea>

        <Group mt="md">
          <Badge color="green">SPF: pass</Badge>
          <Badge color="green">DKIM: pass</Badge>
          <Badge color="green">DMARC: pass</Badge>
        </Group>

        {
          <Alert color="red" mt="sm">
            Alert
          </Alert>
        }

        <Accordion>
          <Accordion.Item value="headers">
            <Accordion.Control>Header Tecnici</Accordion.Control>
            <Accordion.Panel>
              <Code block>boh</Code>
            </Accordion.Panel>
          </Accordion.Item>
        </Accordion>
      </Card>
    </div>
  );
}

export default Home;
