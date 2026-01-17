import React from "react";
import WindowWrapper from "#hoc/WindowWrapper.jsx";
import { WindowControls } from "#components/index.js";
import { Search } from "lucide-react";
import clsx from "clsx";
import useLocationStore from "#store/Location";
import useWindowStore from "#store/Window";
import { locations } from "#constants";

const Finder = () => {
    const { openWindow } = useWindowStore();
  const { activeLocation, setActiveLocation } = useLocationStore();
const openItem = (item) => {
  if (!item) return;
  if (item.fileType === "pdf") return openWindow("resume");
  if (item.kind === "folder") return setActiveLocation(item);
  if (["fig", "url"].includes(item.fileType) && item.href)
    return window.open(item.href, "_blank");

  openWindow(`${item.fileType}${item.kind}`, item);
};
    ``

  const renderList = (name, items = []) => (
    <div>
      <h3>{name}</h3>

      <ul>
        {items.map((item) => (
          <li
            key={item.id}
            onClick={() => setActiveLocation(item)}
            className={clsx(
              item.id === activeLocation?.id ? "active" : "not-active"
            )}
          >
            <img src={item.icon} className="w-4" alt={item.name} />
            <p className="text-sm font-medium truncate">{item.name}</p>
          </li>
        ))}
      </ul>
    </div>
  );

  const items = activeLocation?.children ?? [];

  return (
    <>
      <div id="window-header">
        <WindowControls target="finder" />
        <Search className="icon" />
      </div>

      <div className="finder-container">
        <aside className="sidebar">
          {renderList("Favorites", Object.values(locations))}
          {renderList("Work", locations.work.children)}
          {renderList("About me", locations.about.children)}
        </aside>

        <main className="content grid grid-cols-3 gap-6">
          {items.map((item) => (
            <div key={item.id} className="desktop-item" onClick={() => openItem(item)}>
              <img src={item.icon} alt={item.name} />
              <p>{item.name}</p>
            </div>
          ))}
        </main>
      </div>
    </>
  );
};

const FinderWindow = WindowWrapper(Finder, "finder");
export default FinderWindow;
