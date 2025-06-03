import { MantineProvider } from "@mantine/core";
import { Routes, Route } from "react-router";
import "@mantine/core/styles.css";
import Home from "./pages/Home";

function App() {
  return (
    <MantineProvider>
      <Routes>
        <Route index element={<Home/>} />
        <Route path="report" element={<>REPORT</>} />
      </Routes>
    </MantineProvider>
  );
}

export default App;
