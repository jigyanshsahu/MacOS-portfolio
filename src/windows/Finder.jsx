import WindowWrapper from "#hoc/WindowWrapper.jsx";
import { WindowControls } from "#components";
import useLocationStore from "#store/Location";
import useWindowStore from "#store/Window";
import { locations } from "#constants";
import { useEffect } from "react";

const Finder = () => {
  const { activeLocation, setActiveLocation } = useLocationStore();
  const { openWindow, windows } = useWindowStore();

  // Helper function to find a folder by ID in a location tree
  const findFolderById = (location, folderId) => {
    if (!location?.children) return null;
    for (const child of location.children) {
      if (child.id === folderId) return child;
      const found = findFolderById(child, folderId);
      if (found) return found;
    }
    return null;
  };

  // Restore location when Finder opens
  useEffect(() => {
    if (windows?.finder?.isOpen) {
      const savedData = windows.finder.data;
      if (savedData?.locationType) {
        const { locationType, folderId } = savedData;
        const location = locations[locationType];
        if (location) {
          // If there's a folderId, navigate to that folder
          if (folderId) {
            const folder = findFolderById(location, folderId);
            if (folder) {
              setActiveLocation(folder);
              return;
            }
          }
          // Otherwise, restore to the top-level location
          setActiveLocation(location);
        }
      }
      // If no saved data but Finder just opened, keep current activeLocation
      // (it's already persisted in Location store)
    }
  }, [windows?.finder?.isOpen, setActiveLocation]);

  const handleLocationClick = (locationType) => {
    const location = locations[locationType];
    if (location) {
      setActiveLocation(location);
      // Save the location type to Finder's window data (clear folderId when clicking sidebar)
      openWindow("finder", { locationType });
    }
  };

  const handleItemClick = (item) => {
    if (item.kind === "folder") {
      // If it's a folder, set it as the active location
      setActiveLocation(item);
      // Save the folder's parent type and folder ID to maintain navigation context
      const parentLocationType = Object.keys(locations).find(key => {
        const location = locations[key];
        return findFolderById(location, item.id) !== null;
      });
      if (parentLocationType) {
        openWindow("finder", { locationType: parentLocationType, folderId: item.id });
      }
    } else if (item.kind === "file") {
      // Handle different file types
      if (item.fileType === "txt") {
        openWindow("txtfile", {
          name: item.name,
          description: item.description,
          subtitle: item.subtitle,
          image: item.imageUrl || item.image,
        });
      } else if (item.fileType === "img") {
        openWindow("imgfile", {
          name: item.name,
          imageUrl: item.imageUrl,
        });
      } else if (item.fileType === "url") {
        if (item.href) {
          window.open(item.href, "_blank", "noopener,noreferrer");
        }
      } else if (item.fileType === "pdf") {
        openWindow("resume", item);
      }
    }
  };

  // Helper to check if current location belongs to a top-level location
  const getLocationTypeForActiveLocation = () => {
    if (!activeLocation) return null;
    // If it's a top-level location, return its type
    if (activeLocation.type) {
      return activeLocation.type;
    }
    // Otherwise, find which top-level location contains this folder
    for (const [key, location] of Object.entries(locations)) {
      if (findFolderById(location, activeLocation.id)) {
        return location.type;
      }
    }
    return null;
  };

  const currentItems = activeLocation?.children || [];
  const activeLocationType = getLocationTypeForActiveLocation();

  return (
    <>
      <div id="window-header" className="flex items-center gap-3">
        <WindowControls target="finder" />
        <h2 className="text-lg font-semibold">
          {activeLocation?.name || "Finder"}
        </h2>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className="sidebar">
          <h3>Favorites</h3>
          <ul>
            {Object.entries(locations).map(([key, location]) => (
              <li
                key={key}
                className={
                  activeLocationType === location.type ? "active" : "not-active"
                }
                onClick={() => handleLocationClick(key)}
              >
                <img src={location.icon} alt={location.name} />
                <p>{location.name}</p>
              </li>
            ))}
          </ul>
        </div>

        {/* Content Area */}
        <div className="content">
          <ul>
            {currentItems.map((item) => (
              <li
                key={item.id}
                className={item.position || ""}
                onClick={() => handleItemClick(item)}
                style={{ cursor: "pointer" }}
              >
                <img src={item.icon} alt={item.name} />
                <p>{item.name}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
};

export default WindowWrapper(Finder, "finder");
