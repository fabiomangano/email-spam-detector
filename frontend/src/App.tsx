import { MantineProvider } from "@mantine/core";
import { Routes, Route } from "react-router";
import "@mantine/core/styles.css";

function App() {
  return (
    <MantineProvider>
      <Routes>
        <Route index element={<>HOME</>} />
         <Route path="report" element={<>REPORT</>} />
      </Routes>
    </MantineProvider>
  );
}

export default App;
