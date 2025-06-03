import "@mantine/core/styles.css";
import '@mantine/dropzone/styles.css';

import { MantineProvider } from "@mantine/core";
import { Routes, Route } from "react-router";
import { AppShell, Burger } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { Anchor } from "@mantine/core";
import { Link } from "react-router";
import Home from "./pages/Home";

function App() {
  const [opened, { toggle }] = useDisclosure();

  return (
    <MantineProvider>
      <AppShell
        header={{ height: 60 }}
        navbar={{
          width: 300,
          breakpoint: "sm",
          collapsed: { mobile: !opened },
        }}
        padding="md"
      >
        <AppShell.Header>
          <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
          <div>Logo</div>
        </AppShell.Header>

        <AppShell.Navbar p="md">
          <Anchor component={Link} to="/">
            Home
          </Anchor>
          <Anchor component={Link} to="/report">
            Report
          </Anchor>
          <Anchor component={Link} to="/report">
            Config
          </Anchor>
           <Anchor component={Link} to="/guide">
            Guide
          </Anchor>
        </AppShell.Navbar>

        <AppShell.Main>
          <Routes>
            <Route index element={<Home />} />
            <Route path="report" element={<>REPORT</>} />
          </Routes>
        </AppShell.Main>
      </AppShell>
    </MantineProvider>
  );
}

export default App;
