import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router";
import App from './App.tsx'

const root = document.getElementById("root")!;

ReactDOM.createRoot(root).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);