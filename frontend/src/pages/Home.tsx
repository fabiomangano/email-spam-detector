import { Button, Tabs } from "@mantine/core";
import {
  IconMessageCircle,
  IconSettings,
} from "@tabler/icons-react";
import { Textarea } from "@mantine/core";
import { Group, Text } from "@mantine/core";
import { IconUpload, IconPhoto, IconX } from "@tabler/icons-react";
import { Dropzone,  IMAGE_MIME_TYPE } from "@mantine/dropzone";
import { useEffect, useState } from "react";

function Home() {

  const [textAreaValue, setTextAreaValue] = useState("")

  const handleTextAreaValueChange= (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTextAreaValue(event.target.value)
  }

  useEffect(() => {
console.log(textAreaValue)
  }, [textAreaValue])

  return (
    <Tabs variant="outline" defaultValue="gallery">
      <Tabs.List>
        <Tabs.Tab value="gallery" leftSection={<IconPhoto size={12} />}>
          Text
        </Tabs.Tab>
        <Tabs.Tab
          value="messages"
          leftSection={<IconMessageCircle size={12} />}
        >
          File
        </Tabs.Tab>
        <Tabs.Tab value="settings" leftSection={<IconSettings size={12} />}>
          Data
        </Tabs.Tab>
      </Tabs.List>

      <Tabs.Panel value="gallery">
        <Textarea
          label="Email text"
          value={textAreaValue}
          onChange={handleTextAreaValueChange}
          placeholder="Input placeholder"
          autosize
          minRows={25}
        />
        <Button>Invia</Button>
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
                Attach as many files as you like, each file should not exceed
                5mb
              </Text>
            </div>
          </Group>
        </Dropzone>
      </Tabs.Panel>

      <Tabs.Panel value="settings">Settings tab content</Tabs.Panel>
    </Tabs>
  );
}

export default Home;
