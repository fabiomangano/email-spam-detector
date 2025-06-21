import "@mantine/core/styles.css";
import "@mantine/dropzone/styles.css";
import { Divider, NavLink, Title, Flex, Text, Button, Group } from "@mantine/core";
import {
  IconChartBar,
  IconCheckupList,
  IconInfoHexagon,
  IconSettings,
  IconUpload,
  IconUserQuestion,
  IconLogout,
  IconShield,
} from "@tabler/icons-react";

import { Burger, MantineProvider } from "@mantine/core";
import { Routes, Route } from "react-router";
import { AppShell /* Burger */ } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { Link, useLocation } from "react-router";
import Upload from "./pages/Upload";
import Risk from "./pages/Risk";
import Report from "./pages/Report";
import Pipeline from "./pages/Pipeline";
import LLM from "./pages/LLM";
import LLMUpload from "./pages/LLMUpload";
import LLMReport from "./pages/LLMReport";
import Login from "./pages/Login";
import Home from "./pages/Home";
import About from "./pages/About";
import ProtectedRoute from "./components/ProtectedRoute";
import { AnalysisProvider, useAnalysis } from "./contexts/AnalysisContext";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { theme } from "./theme/theme";

function AppContent() {
  const [opened, { toggle }] = useDisclosure();
  const { analysisResult, llmAnalysisResult } = useAnalysis();
  const { logout, user } = useAuth();
  const location = useLocation();
  const isHomePage = location.pathname === '/' || location.pathname === '/home';

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={isHomePage ? { width: 0, breakpoint: "md", collapsed: { desktop: true, mobile: true } } : {
        width: 200,
        breakpoint: "md",
        collapsed: { mobile: !opened },
      }}
      padding={"lg"}
      footer={{ height: 60 }}
    >
      <AppShell.Header p="md">
        <Flex align="center" justify="space-between" h="100%">
          <Flex align="center" gap="md">
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
            <Flex align="center" gap="xs" component={Link} to="/" style={{ textDecoration: 'none' }}>
              <IconShield size={28} color="#262626" />
              <Title 
                order={1} 
                size="h3" 
                style={{ 
                  color: '#262626',
                  fontWeight: 800,
                  letterSpacing: '-0.025em',
                  cursor: 'pointer'
                }}
              >
                SpamShield
              </Title>
            </Flex>
          </Flex>
          <Group gap="sm">
            <Text size="sm" c="dimmed">Welcome, {user?.username}</Text>
            <Button
              variant="outline"
              color="gray"
              size="xs"
              leftSection={<IconLogout size={14} />}
              onClick={logout}
              styles={{
                root: {
                  borderColor: "#262626",
                  color: "#262626",
                  backgroundColor: "#ffffff",
                  "&:hover": {
                    backgroundColor: "#f9fafb",
                  },
                },
              }}
            >
              Logout
            </Button>
          </Group>
        </Flex>
      </AppShell.Header>

      {!isHomePage && <AppShell.Navbar 
        p={0}
        style={{ 
          backgroundColor: '#ffffff',
          borderRight: '1px solid #e5e5e5',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
        }}
      >
        <div style={{ padding: '1.5rem 1rem 1rem 1rem', height: '100%', overflowY: 'auto' }}>
          <Title 
            order={6} 
            c="gray.9" 
            mb="md" 
            px="sm"
            style={{ 
              fontWeight: 600,
              letterSpacing: '0.025em',
              textTransform: 'uppercase',
              fontSize: '0.7rem'
            }}
          >
            Metrics & NLP
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
              component={analysisResult ? Link : undefined}
              to={analysisResult ? "/report" : "#"}
              label="Report"
              leftSection={<IconChartBar size={16} stroke={1.5} />}
              onClick={(e) => {
                if (!analysisResult) {
                  e.preventDefault();
                  e.stopPropagation();
                }
              }}
              style={{
                borderRadius: '0.5rem',
                marginBottom: '0.25rem',
                padding: '0.625rem 0.75rem',
                fontWeight: 500,
                fontSize: '0.875rem',
                opacity: analysisResult ? 1 : 0.5,
                cursor: analysisResult ? 'pointer' : 'not-allowed',
                pointerEvents: analysisResult ? 'auto' : 'none'
              }}
            />
            <NavLink
              component={analysisResult ? Link : undefined}
              to={analysisResult ? "/risk" : "#"}
              label="Risk"
              leftSection={<IconCheckupList size={16} stroke={1.5} />}
              onClick={(e) => {
                if (!analysisResult) {
                  e.preventDefault();
                  e.stopPropagation();
                }
              }}
              style={{
                borderRadius: '0.5rem',
                marginBottom: '0.25rem',
                padding: '0.625rem 0.75rem',
                fontWeight: 500,
                fontSize: '0.875rem',
                opacity: analysisResult ? 1 : 0.5,
                cursor: analysisResult ? 'pointer' : 'not-allowed',
                pointerEvents: analysisResult ? 'auto' : 'none'
              }}
            />
          </div>
          
          <Divider color="gray.3" />
          
          <div style={{ marginTop: '1.5rem', marginBottom: '1.5rem' }}>
            <Title 
              order={6} 
              c="gray.9" 
              mb="md" 
              px="sm"
              style={{ 
                fontWeight: 600,
                letterSpacing: '0.025em',
                textTransform: 'uppercase',
                fontSize: '0.7rem'
              }}
            >
              LLM
            </Title>
            <NavLink
              component={Link}
              to="/llm-upload"
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
              component={llmAnalysisResult ? Link : undefined}
              to={llmAnalysisResult ? "/llm-report" : "#"}
              label="Report"
              leftSection={<IconChartBar size={16} stroke={1.5} />}
              onClick={(e) => {
                if (!llmAnalysisResult) {
                  e.preventDefault();
                  e.stopPropagation();
                }
              }}
              style={{
                borderRadius: '0.5rem',
                marginBottom: '0.25rem',
                padding: '0.625rem 0.75rem',
                fontWeight: 500,
                fontSize: '0.875rem',
                opacity: llmAnalysisResult ? 1 : 0.5,
                cursor: llmAnalysisResult ? 'pointer' : 'not-allowed',
                pointerEvents: llmAnalysisResult ? 'auto' : 'none'
              }}
            />
          </div>
          
          <Divider color="gray.3" />
          
          <div style={{ marginTop: '1.5rem', marginBottom: '1.5rem' }}>
            <Title 
              order={6} 
              c="gray.9" 
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
              to="/pipeline"
              label="Pipeline"
              leftSection={<IconSettings size={16} stroke={1.5} />}
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
              to="/llm"
              label="LLM"
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
          
          <Divider color="gray.3" />
          
          <div style={{ marginTop: '1.5rem' }}>
            <Title 
              order={6} 
              c="gray.9" 
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
              to="/about"
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
      </AppShell.Navbar>}

      <AppShell.Main style={{ backgroundColor: "#fafafa", height: "100vh" }}>
        <Routes>
          <Route index element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="upload" element={<ProtectedRoute><Upload /></ProtectedRoute>} />
          <Route path="risk" element={<ProtectedRoute><Risk /></ProtectedRoute>} />
          <Route path="report" element={<ProtectedRoute><Report /></ProtectedRoute>} />
          <Route path="pipeline" element={<ProtectedRoute><Pipeline /></ProtectedRoute>} />
          <Route path="llm" element={<ProtectedRoute><LLM /></ProtectedRoute>} />
          <Route path="llm-upload" element={<ProtectedRoute><LLMUpload /></ProtectedRoute>} />
          <Route path="llm-report" element={<ProtectedRoute><LLMReport /></ProtectedRoute>} />
          <Route path="guides" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="about" element={<ProtectedRoute><About /></ProtectedRoute>} />
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
  );
}

function App() {
  return (
    <MantineProvider theme={theme}>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/*" element={
            <AnalysisProvider>
              <AppContent />
            </AnalysisProvider>
          } />
        </Routes>
      </AuthProvider>
    </MantineProvider>
  );
}

export default App;