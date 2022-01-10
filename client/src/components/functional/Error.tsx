import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Error = () => {
  const navigate = useNavigate();

  useEffect(() => {
    setTimeout(() => navigate("/"), 1000);
  }, [navigate]);

  return <h1>An error has occured. Returning to the home page</h1>;
};

export default Error;
