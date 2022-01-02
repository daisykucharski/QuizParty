import React from "react";

function NavButton({
  label,
  onSubmit,
}: {
  label: string;
  onSubmit: () => void;
}) {
  return <button onClick={onSubmit}>{label}</button>;
}

export default NavButton;
