import React from "react";

import { BrowserRouter, Route, Routes } from "react-router-dom";
import Start from "./components/pages/Start";
import Display from "./components/pages/Display";
import Player from "./components/pages/Player";

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
        <Route path="/" element={<Start />} />
        <Route path="/display" element={<Display />} />
        <Route path="/player" element={<Player />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
