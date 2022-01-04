import React from "react";

import { BrowserRouter, Route, Routes } from "react-router-dom";
import StartPage from "./components/pages/StartPage";
import DisplayPage from "./components/pages/DisplayPage";
import PlayerPage from "./components/pages/PlayerPage";

//const ENDPOINT = "http://192.168.56.1:5000"

//import socketIOClient from "socket.io-client";
// useEffect(() => {
//   const socket = socketIOClient(ENDPOINT);
//   console.log("Connected to server");

//   return () => {
//     socket.disconnect();
//   }
// }, [])

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<StartPage />} />
        <Route path="/display" element={<DisplayPage />} />
        <Route path="/player" element={<PlayerPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
