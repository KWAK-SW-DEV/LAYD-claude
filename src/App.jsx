import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import HomePage    from "./pages/HomePage";
import ProductPage from "./pages/ProductPage";
import ShrinkPage  from "./pages/ShrinkPage";
import LayoutPage  from "./pages/LayoutPage";

export default function App() {
  return (
    <Routes>
      <Route path="/"        element={<HomePage />} />
      <Route path="/product" element={<ProductPage />} />
      <Route path="/shrink"  element={<ShrinkPage />} />
      <Route path="/layout"  element={<LayoutPage />} />
    </Routes>
  );
}
