import { Toaster } from "react-hot-toast";
import { CodeDetailPage } from "./pages/CodeDetailPage";
import { ShortUrlsPage } from "./pages/ShortUrlsPage";
import { BrowserRouter, Navigate, Route, Routes } from "react-router";

function App() {
  return (
    <BrowserRouter>
      <Toaster />
      <Routes>
        <Route path="/code/:code" element={<CodeDetailPage />} />
        <Route path="/codes" element={<ShortUrlsPage />} />
        <Route path="/*" element={<Navigate to={"/codes"} />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
