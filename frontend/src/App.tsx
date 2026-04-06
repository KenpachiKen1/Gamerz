import "./App.css";
import { Route, Routes } from "react-router-dom";

import Home from "./pages/Home";

import ProtectedRoutes from "./components/ProtectedRoutes";

import Questionnaire from "./components/Questionnaire";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
function App() {
  return (
    <Routes>
      <Route path="/" element={<Signup />} />
      <Route path="/login" element={<Login />} />

      <Route element={<ProtectedRoutes />}>
        <Route path="/questionnaire" element={<Questionnaire />} />
        <Route path="/home" element={<Home />} />
      </Route>
    </Routes>
  );
}

export default App;
