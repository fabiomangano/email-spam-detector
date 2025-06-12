import "@mantine/core/styles.css";
import "@mantine/dropzone/styles.css";
import { Divider, NavLink, Space } from "@mantine/core";
import {
  IconChartBar,
  IconCheckupList,
  IconInfoHexagon,
  IconScan,
  IconSettings,
  IconUpload,
  IconUserQuestion,
} from "@tabler/icons-react";

import { Burger, MantineProvider } from "@mantine/core";
import { Routes, Route } from "react-router";
import { AppShell /* Burger */ } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { Link } from "react-router";
import Home from "./pages/Home";

function App() {
  const [opened, { toggle }] = useDisclosure();

  return (
    <MantineProvider>
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
        <AppShell.Header p="sm" >
          <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
          <span
            style={{
              fontWeight: 900,
              fontSize: "20px",
              color: "#000",
              letterSpacing: "-0.5px",
              paddingLeft: "20px"
            }}
          >
            SpamShield
          </span>
        </AppShell.Header>

        <AppShell.Navbar p="md">
         <Space h="sm"></Space>
          <span
            style={{
              fontWeight: 700,
              fontSize: "16px",
              color: "#000",
              letterSpacing: "-0.5px",
              marginLeft: "10px",
            }}
          >
           Email
          </span>
          <NavLink
            component={Link}
            to="/dashboard"
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
            to="/dashboard"
            label="Risk"
            leftSection={<IconCheckupList size={16} stroke={1.5} />}
          />
          <br></br>

          <Divider></Divider>
          <br></br>
          <span
            style={{
              fontWeight: 700,
              fontSize: "16px",
              color: "#000",
              letterSpacing: "-0.5px",
              marginLeft: "10px",
            }}
          >
            Settings
          </span>
          <NavLink
            component={Link}
            to="/dashboard"
            label="Config"
            leftSection={<IconSettings size={16} stroke={1.5} />}
          />
          <br></br>
          <Divider></Divider>
          <br></br>
          <span
            style={{
              fontWeight: 700,
              fontSize: "16px",
              color: "#000",
              letterSpacing: "-0.5px",
              marginLeft: "10px",
            }}
          >
            Misc
          </span>
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
            <Route index element={<Home />} />
            <Route path="report" element={<>REPORT</>} />
          </Routes>
        </AppShell.Main>

        <AppShell.Footer p="sm"></AppShell.Footer>
      </AppShell>
    </MantineProvider>
  );
}

export default App;
