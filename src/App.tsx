import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Workspace from "@/pages/Workspace";

export default function App() {
  return (
    <Router basename="/TextViz">
      <Routes>
        <Route path="/" element={<Workspace />} />
      </Routes>
    </Router>
  );
}
