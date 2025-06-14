import { Flex, Input, Text } from "@mantine/core";

interface FieldRowProps {
  label: string;
  value?: string;
}

export function FieldRow({ label, value }: FieldRowProps) {
  return (
    <Flex align="center" gap="sm" mb="sm">
      <Text style={{ minWidth: 90 }}>{label}</Text>
      <Input
        style={{ flex: 1 }}
        value={value || ""}
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