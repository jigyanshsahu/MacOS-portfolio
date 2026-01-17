import React, { useEffect, useState } from "react";
import WindowWrapper from "#hoc/WindowWrapper";
import WindowControls from "#components/WindowControls";
import { locations } from "#constants";
import { Check, Flag } from "lucide-react"; 

const TextComponent = () => {
  const [readme, setReadme] = useState(null);

  useEffect(() => {
    // try to fetch README.md from project root (works in dev on Vite)
    fetch("/README.md")
      .then((r) => (r.ok ? r.text() : null))
      .then((txt) => setReadme(txt))
      .catch(() => setReadme(null));
  }, []);

  // collect .txt files from locations
  const textFiles = [];

  Object.values(locations).forEach((loc) => {
    if (!loc.children) return;

    loc.children.forEach((child) => {
      if (child.kind === "file" && child.fileType === "txt") {
        textFiles.push({
          name: child.name,
          desc: child.description || [],
        });
      }

      // nested project children
      if (child.kind === "folder" && Array.isArray(child.children)) {
        child.children.forEach((c) => {
          if (c.kind === "file" && c.fileType === "txt") {
            textFiles.push({ name: c.name, desc: c.description || [] });
          }
        });
      }
    });
  });

  return (
    <>
      <div id="window-header">
        <WindowControls target="txtfile" />
        <h2>Documents — Terminal view</h2>
      </div>

      <div className="techstack p-6 font-georama text-sm text-gray-700 space-y-4">
        <p className="text-xs text-gray-500"><span className="font-semibold text-gray-800">@Jigyansh</span> % show documents</p>

        <div className="content max-w-3xl mx-auto space-y-4">
          {textFiles.map(({ name, desc }) => (
            <div key={name} className="mb-4 bg-gray-50 p-4 rounded shadow-sm">
              <p className="font-semibold text-gray-800">@Jigyansh % cat {name}</p>

              {desc.length ? (
                <div className="mt-2 space-y-1 text-gray-700">
                  {desc.map((line, i) => (
                    <p key={i}>{line}</p>
                  ))}
                </div>
              ) : (
                <p className="mt-2 italic text-sm text-gray-500">(no text available)</p>
              )}
            </div>
          ))}

          {readme && (
            <div className="mb-4 bg-gray-50 p-4 rounded shadow-sm">
              <p className="font-semibold text-gray-800">@Adrian % cat README.md</p>
              <pre className="mt-2 max-h-72 overflow-auto whitespace-pre-wrap bg-white p-4 rounded text-sm leading-relaxed text-gray-700 border border-gray-100">
                {readme}
              </pre>
            </div>
          )}
        </div>

        <div className="footnote">
          <p>
            <Check size={18} /> {textFiles.length + (readme ? 1 : 0)} document(s) loaded
          </p>
        </div>

       
      </div>
    </>
  );
};

const TextWindow = WindowWrapper(TextComponent, "txtfile");

export default TextWindow;
