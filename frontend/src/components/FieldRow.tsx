import { Flex, Input, Text } from "@mantine/core";
import { tokens } from "../theme/tokens";

interface FieldRowProps {
  label: string;
  value?: string;
}

export function FieldRow({ label, value }: FieldRowProps) {
  return (
    <Flex align="center" gap="md" mb="md">
      <Text 
        size="sm" 
        fw={500} 
        c="gray.7"
        style={{ 
          minWidth: 100,
          flexShrink: 0,
        }}
      >
        {label}
      </Text>
      <Input
        style={{ flex: 1 }}
        value={value || "—"}
        size="sm"
        readOnly
        styles={{
          input: {
            backgroundColor: tokens.colors.gray[50],
            border: `1px solid ${tokens.colors.gray[200]}`,
            color: tokens.colors.gray[800],
            fontSize: tokens.typography.fontSize.sm,
            fontFamily: value ? tokens.typography.fontFamily.mono.join(', ') : 'inherit',
            cursor: 'default',
            '&:focus': {
              borderColor: tokens.colors.gray[300],
            }
          },
        }}
      />
    </Flex>
  );
}