import {
  Button,
  Card,
  Divider,
  Flex,
  Group,
  Space,
  Textarea,
  Title,
} from "@mantine/core";
import { FieldRow } from "./FieldRow";
import type { ParsedData } from "../types/email";

interface ContentPanelProps {
  parsedData: ParsedData | null;
  onAnalyze: () => void;
  analyzing: boolean;
  canAnalyze: boolean;
}

export function ContentPanel({ 
  parsedData, 
  onAnalyze, 
  analyzing, 
  canAnalyze 
}: ContentPanelProps) {
  const spfDmarcString = parsedData?.metrics
    ? `SPF=${parsedData.metrics.spfResult ?? "N/A"}, DKIM=${
        parsedData.metrics.dkimResult ?? "N/A"
      }, DMARC=${parsedData.metrics.dmarcResult ?? "N/A"}`
    : "N/A";

  const bodyText = parsedData?.parsed?.plainText || parsedData?.parsed?.htmlText || "";

  return (
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
            onClick={onAnalyze}
            disabled={!canAnalyze}
            loading={analyzing}
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
      <FieldRow 
        label="Date" 
        value={parsedData?.parsed?.metadata?.date} 
      />
      <FieldRow 
        label="From" 
        value={parsedData?.parsed?.metadata?.from} 
      />
      <FieldRow 
        label="To" 
        value={parsedData?.parsed?.metadata?.to} 
      />
      <FieldRow
        label="Subject"
        value={parsedData?.parsed?.metadata?.subject}
      />
      <FieldRow
        label="Spf/Dim/Mar"
        value={spfDmarcString}
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
        value={bodyText}
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
  );
}