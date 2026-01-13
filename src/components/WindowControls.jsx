import useWindowStore from "#store/Window";
import React from "react";

const WindowControls = ({ target }) => {
  const closeWindow = useWindowStore((s) => s.closeWindow);

  return (
    <div id="window-controls">
     <div
  className="close"
  onMouseDown={(e) => {
    e.stopPropagation();
  }}
  onClick={(e) => {
    e.stopPropagation();
    closeWindow(target);
  }}
/>

      <div className="minimize" />
      <div className="maximize" />
    </div>
  );
};

export default WindowControls;
