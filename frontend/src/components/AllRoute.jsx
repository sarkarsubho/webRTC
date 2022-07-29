import React from "react";
import { Routes, Route } from "react-router-dom";
import { Chat } from "./Chat";
import { Vedio } from "./Vedio";

export const AllRoute = () => {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Chat></Chat>}></Route>
        <Route path="/vedio" element={<Vedio></Vedio>}></Route>
      </Routes>
    </div>
  );
};
