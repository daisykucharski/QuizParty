import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export const Error = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate("/");
  }, [navigate]);

  return <h1>An error has occured</h1>;
};
