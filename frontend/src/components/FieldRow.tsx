import { Flex, Input, Text } from "@mantine/core";

interface FieldRowProps {
  label: string;
  value?: string;
}

export function FieldRow({ label, value }: FieldRowProps) {
  return (
    <Flex align="center" gap="xs" mb={4}>
      <Text 
        size="xs" 
        fw={500} 
        c="gray.6"
        style={{ 
          minWidth: 60,
          flexShrink: 0,
        }}
      >
        {label}
      </Text>
      <Input
        style={{ flex: 1 }}
        value={value || "—"}
        size="xs"
        readOnly
        styles={{
          input: {
            backgroundColor: "var(--mantine-color-gray-0)",
            border: "1px solid var(--mantine-color-gray-2)",
            color: "var(--mantine-color-gray-8)",
            fontSize: "var(--mantine-font-size-xs)",
            fontFamily: value ? "var(--mantine-font-family-monospace)" : "inherit",
            cursor: "default",
            height: "24px",
            "&:focus": {
              borderColor: "var(--mantine-color-gray-3)",
            }
          },
        }}
      />
    </Flex>
  );
}