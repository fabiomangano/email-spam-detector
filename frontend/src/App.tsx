import "@mantine/core/styles.css";
import "@mantine/dropzone/styles.css";
import { Divider, NavLink, Title, Flex, Text } from "@mantine/core";
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
import Report from "./pages/Report";
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

        <AppShell.Navbar 
          p={0}
          style={{ 
            backgroundColor: '#ffffff',
            borderRight: '1px solid #e5e5e5',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
          }}
        >
          <div style={{ padding: '1.5rem 1rem 1rem 1rem' }}>
            <Title 
              order={6} 
              c="gray.7" 
              mb="md" 
              px="sm"
              style={{ 
                fontWeight: 600,
                letterSpacing: '0.025em',
                textTransform: 'uppercase',
                fontSize: '0.7rem'
              }}
            >
              Email Analysis
            </Title>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <NavLink
                component={Link}
                to="/upload"
                label="Upload"
                leftSection={<IconUpload size={16} stroke={1.5} />}
                style={{
                  borderRadius: '0.5rem',
                  marginBottom: '0.25rem',
                  padding: '0.625rem 0.75rem',
                  fontWeight: 500,
                  fontSize: '0.875rem'
                }}
              />
              <NavLink
                component={Link}
                to="/report"
                label="Report"
                leftSection={<IconChartBar size={16} stroke={1.5} />}
                style={{
                  borderRadius: '0.5rem',
                  marginBottom: '0.25rem',
                  padding: '0.625rem 0.75rem',
                  fontWeight: 500,
                  fontSize: '0.875rem'
                }}
              />
              <NavLink
                component={Link}
                to="/risk"
                label="Risk"
                leftSection={<IconCheckupList size={16} stroke={1.5} />}
                style={{
                  borderRadius: '0.5rem',
                  marginBottom: '0.25rem',
                  padding: '0.625rem 0.75rem',
                  fontWeight: 500,
                  fontSize: '0.875rem'
                }}
              />
            </div>
            
            <Divider color="gray.2" />
            
            <div style={{ marginTop: '1.5rem', marginBottom: '1.5rem' }}>
              <Title 
                order={6} 
                c="gray.7" 
                mb="md" 
                px="sm"
                style={{ 
                  fontWeight: 600,
                  letterSpacing: '0.025em',
                  textTransform: 'uppercase',
                  fontSize: '0.7rem'
                }}
              >
                Configuration
              </Title>
              <NavLink
                component={Link}
                to="/dashboard"
                label="Config"
                leftSection={<IconSettings size={16} stroke={1.5} />}
                style={{
                  borderRadius: '0.5rem',
                  marginBottom: '0.25rem',
                  padding: '0.625rem 0.75rem',
                  fontWeight: 500,
                  fontSize: '0.875rem'
                }}
              />
            </div>
            
            <Divider color="gray.2" />
            
            <div style={{ marginTop: '1.5rem' }}>
              <Title 
                order={6} 
                c="gray.7" 
                mb="md" 
                px="sm"
                style={{ 
                  fontWeight: 600,
                  letterSpacing: '0.025em',
                  textTransform: 'uppercase',
                  fontSize: '0.7rem'
                }}
              >
                Help & Info
              </Title>
              <NavLink
                component={Link}
                to="/dashboard"
                label="Guide"
                leftSection={<IconUserQuestion size={16} stroke={1.5} />}
                style={{
                  borderRadius: '0.5rem',
                  marginBottom: '0.25rem',
                  padding: '0.625rem 0.75rem',
                  fontWeight: 500,
                  fontSize: '0.875rem'
                }}
              />
              <NavLink
                component={Link}
                to="/dashboard"
                label="About"
                leftSection={<IconInfoHexagon size={16} stroke={1.5} />}
                style={{
                  borderRadius: '0.5rem',
                  marginBottom: '0.25rem',
                  padding: '0.625rem 0.75rem',
                  fontWeight: 500,
                  fontSize: '0.875rem'
                }}
              />
            </div>
          </div>
        </AppShell.Navbar>

        <AppShell.Main style={{ backgroundColor: "#f5f5f5", height: "100vh" }}>
          <Routes>
            <Route index element={<Upload />} />
            <Route path="upload" element={<Upload />} />
            <Route path="risk" element={<Risk />} />
            <Route path="report" element={<Report />} />
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
