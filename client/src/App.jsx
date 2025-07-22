import React from "react";
import { Routes, Route } from "react-router-dom";
import WelcomePage from "./pages/WelcomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ChatPage from "./pages/ChatPage";
import PrivateRoute from "./components/PrivateRoute";
import { Toaster } from "sonner";
import { SocketContextProvider } from "./context/SocketContext";
// The 'CryptoProvider' has been removed.

function App() {
  return (
    <>
      <Toaster position="top-center" richColors />
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route path="" element={<PrivateRoute />}>
          <Route
            path="/chat"
            element={
              <SocketContextProvider>
                <ChatPage />
              </SocketContextProvider>
            }
          />
        </Route>
      </Routes>
    </>
  );
}

export default App;
