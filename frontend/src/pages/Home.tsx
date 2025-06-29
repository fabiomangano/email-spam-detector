import React from 'react';
import {
  Container,
  Paper,
  Title,
  Text,
  SimpleGrid,
  Stack,
  Group,
  ThemeIcon,
  Box,
  Card,
} from '@mantine/core';
import {
  IconUpload,
  IconSettings,
  IconUserQuestion,
  IconInfoHexagon,
  IconChartBar,
  IconShield,
} from '@tabler/icons-react';
import { Link } from 'react-router';

interface MenuCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  to: string;
  color: string;
}

const MenuCard: React.FC<MenuCardProps> = ({ title, description, icon, to, color }) => {
  return (
    <Card
      component={Link}
      to={to}
      shadow="sm"
      padding="lg"
      radius="md"
      style={{
        cursor: 'pointer',
        textDecoration: 'none',
        border: '1px solid #e5e5e5',
        transition: 'all 0.2s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        },
      }}
    >
      <Group gap="md" align="flex-start">
        <ThemeIcon
          size={48}
          radius="md"
          color={color}
          style={{
            backgroundColor: `var(--mantine-color-${color}-0)`,
            color: `var(--mantine-color-${color}-6)`,
          }}
        >
          {icon}
        </ThemeIcon>
        <Stack gap="xs" style={{ flex: 1 }}>
          <Title order={4} style={{ color: '#262626' }}>
            {title}
          </Title>
          <Text size="sm" c="dimmed">
            {description}
          </Text>
        </Stack>
      </Group>
    </Card>
  );
};

const Home: React.FC = () => {
  const menuItems = [
    {
      title: 'Upload NLP',
      description: 'Upload emails for analysis with traditional NLP pipeline',
      icon: <IconUpload size={24} />,
      to: '/upload',
      color: 'blue',
    },
    {
      title: 'Upload LLM',
      description: 'Upload emails for advanced analysis with language models',
      icon: <IconChartBar size={24} />,
      to: '/llm-upload',
      color: 'violet',
    },
    {
      title: 'NLP Configuration',
      description: 'Configure NLP analysis pipeline parameters',
      icon: <IconSettings size={24} />,
      to: '/pipeline',
      color: 'green',
    },
    {
      title: 'LLM Configuration',
      description: 'Configure language models and advanced parameters',
      icon: <IconSettings size={24} />,
      to: '/llm',
      color: 'orange',
    },
    {
      title: 'Guides',
      description: 'Browse documentation and usage guides',
      icon: <IconUserQuestion size={24} />,
      to: '/guide',
      color: 'teal',
    },
    {
      title: 'About',
      description: 'Information about the SpamShield platform',
      icon: <IconInfoHexagon size={24} />,
      to: '/about',
      color: 'grape',
    },
  ];

  return (
    <Container size="lg" py="xl">
      <Stack gap="xl">
        {/* Header */}
        <Box ta="center">
          <Group justify="center" gap="md" mb="md">
            <IconShield size={48} color="#262626" />
            <Title
              order={1}
              size="h1"
              style={{
                color: '#262626',
                fontWeight: 800,
                letterSpacing: '-0.025em',
              }}
            >
              SpamShield
            </Title>
          </Group>
          <Text size="lg" c="dimmed" maw={600} mx="auto">
            Advanced email security analysis platform. 
            Choose the type of analysis you want to perform or configure system parameters.
          </Text>
        </Box>

        {/* Menu Grid */}
        <Paper p="xl" radius="md" style={{ backgroundColor: '#ffffff', border: '1px solid #e5e5e5' }}>
          <Title order={2} mb="xl" ta="center" c="gray.8">
            Main Menu
          </Title>
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
            {menuItems.map((item, index) => (
              <MenuCard
                key={index}
                title={item.title}
                description={item.description}
                icon={item.icon}
                to={item.to}
                color={item.color}
              />
            ))}
          </SimpleGrid>
        </Paper>

        {/* Quick Stats or Info */}
        <Paper p="lg" radius="md" style={{ backgroundColor: '#f8f9fa', border: '1px solid #e5e5e5' }}>
          <Stack gap="sm">
            <Title order={3} c="gray.8">
              Welcome to SpamShield
            </Title>
            <Text c="dimmed">
              Use this dashboard to access all platform features. 
              You can upload emails for analysis, configure system parameters, and review 
              results from previous analyses.
            </Text>
          </Stack>
        </Paper>
      </Stack>
    </Container>
  );
};

export default Home;