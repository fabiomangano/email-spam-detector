import "@mantine/core/styles.css";
import "@mantine/dropzone/styles.css";
import { Divider, NavLink, Space, Title, Flex, Text } from "@mantine/core";
import {
  IconChartBar,
  IconCheckupList,
  IconInfoHexagon,
  IconSettings,
  IconUpload,
  IconUserQuestion,
} from "@tabler/icons-react";

import { Burger, MantineProvider } from "@mantine/core";
import { Routes, Route } from "react-router";
import { AppShell /* Burger */ } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { Link } from "react-router";
import Upload from "./pages/Upload";
import Risk from "./pages/Risk";
import { AnalysisProvider } from "./contexts/AnalysisContext";
import { theme } from "./theme/theme";

function App() {
  const [opened, { toggle }] = useDisclosure();

  return (
    <MantineProvider theme={theme}>
      <AnalysisProvider>
        <AppShell
        header={{ height: 60 }}
        navbar={{
          width: 200,
          breakpoint: "md",
          collapsed: { mobile: !opened },
        }}
        padding={"lg"}
        footer={{ height: 60 }}
      >
        <AppShell.Header p="md">
          <Flex align="center" gap="md" h="100%">
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
            <Title 
              order={1} 
              size="h3" 
              style={{ 
                background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                fontWeight: 800,
                letterSpacing: '-0.025em'
              }}
            >
              🛡️ SpamShield
            </Title>
          </Flex>
        </AppShell.Header>

        <AppShell.Navbar p="md">
          <Space h="sm" />
          <Title 
            order={6} 
            c="gray.7" 
            mb="xs" 
            px="md"
            style={{ 
              fontWeight: 600,
              letterSpacing: '0.025em',
              textTransform: 'uppercase',
              fontSize: '0.75rem'
            }}
          >
            Email Analysis
          </Title>
          <NavLink
            component={Link}
            to="/upload"
            label="Upload"
            leftSection={<IconUpload size={16} stroke={1.5} />}
          />
          {/* <NavLink
            component={Link}
            to="/dashboard"
            label="Content"
            leftSection={<IconScan size={16} stroke={1.5} />}
          /> */}
          <NavLink
            component={Link}
            to="/dashboard"
            label="Report"
            leftSection={<IconChartBar size={16} stroke={1.5} />}
          />
          <NavLink
            component={Link}
            to="/risk"
            label="Risk"
            leftSection={<IconCheckupList size={16} stroke={1.5} />}
          />
          <Space h="md" />
          <Divider />
          <Space h="md" />
          
          <Title 
            order={6} 
            c="gray.7" 
            mb="xs" 
            px="md"
            style={{ 
              fontWeight: 600,
              letterSpacing: '0.025em',
              textTransform: 'uppercase',
              fontSize: '0.75rem'
            }}
          >
            Configuration
          </Title>
          <NavLink
            component={Link}
            to="/dashboard"
            label="Config"
            leftSection={<IconSettings size={16} stroke={1.5} />}
          />
          <Space h="md" />
          <Divider />
          <Space h="md" />
          
          <Title 
            order={6} 
            c="gray.7" 
            mb="xs" 
            px="md"
            style={{ 
              fontWeight: 600,
              letterSpacing: '0.025em',
              textTransform: 'uppercase',
              fontSize: '0.75rem'
            }}
          >
            Help & Info
          </Title>
          <NavLink
            component={Link}
            to="/dashboard"
            label="Guide"
            leftSection={<IconUserQuestion size={16} stroke={1.5} />}
          />
          <NavLink
            component={Link}
            to="/dashboard"
            label="About"
            leftSection={<IconInfoHexagon size={16} stroke={1.5} />}
          />
        </AppShell.Navbar>

        <AppShell.Main style={{ backgroundColor: "#f5f5f5", height: "100vh" }}>
          <Routes>
            <Route index element={<Upload />} />
            <Route path="upload" element={<Upload />} />
            <Route path="risk" element={<Risk />} />
            <Route path="report" element={<>REPORT</>} />
          </Routes>
        </AppShell.Main>

        <AppShell.Footer p="md">
          <Flex align="center" justify="center" h="100%">
            <Text size="sm" c="gray.6">
              © 2024 SpamShield - Email Security Analysis
            </Text>
          </Flex>
        </AppShell.Footer>
      </AppShell>
      </AnalysisProvider>
    </MantineProvider>
  );
}

export default App;
