import React, { useMemo, useState, useEffect } from "react";
import WindowWrapper from "#hoc/WindowWrapper";
import WindowControls from "#components/WindowControls";
import { locations, gallery, blogPosts } from "#constants";
import { Check, Flag } from "lucide-react";

const ImagesComponent = () => {
  const [selected, setSelected] = useState(null);

  // collect images from gallery + location children + blog posts
  const images = useMemo(() => {
    const set = new Set();

    gallery.forEach((g) => g.img && set.add(g.img));

    Object.values(locations).forEach((loc) => {
      if (!loc.children) return;
      loc.children.forEach((child) => {
        if (child.kind === "file" && child.fileType === "img" && child.imageUrl) {
          set.add(child.imageUrl);
        }

        if (child.kind === "folder" && Array.isArray(child.children)) {
          child.children.forEach((c) => {
            if (c.kind === "file") {
              if (c.fileType === "img" && c.imageUrl) set.add(c.imageUrl);
            }
          });
        }
      });
    });

    blogPosts.forEach((b) => b.image && set.add(b.image));

    return Array.from(set);
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") setSelected(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <div id="window-header">
        <WindowControls target="imgfile" />
        <h2 className="font-georama text-sm text-gray-800">Images</h2>
      </div>

      <div className="techstack p-3">
        <div className="content grid grid-cols-6 gap-2">
          {images.map((src, i) => (
            <button
              key={src + i}
              aria-label={`open image ${i}`}
              className="img-thumb overflow-hidden rounded-sm border border-gray-100 p-0.5 cursor-zoom-in"
              onClick={() => setSelected(src)}
            >
              <img src={src} alt={`img-${i}`} className="w-full h-20 object-cover block" />
            </button>
          ))}
        </div>

        <div className="footnote">
          <p>
            <Check size={18} /> {images.length} image(s) loaded
          </p>
        </div>

        {selected && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50" role="dialog" aria-modal="true" onClick={() => setSelected(null)}>
            <img src={selected} alt="selected" className="max-h-[85vh] max-w-[90vw] rounded shadow-lg" />
          </div>
        )}

        <p className="black">
          <Flag size={15} fill="black" /> render time: 7ms
        </p>
      </div>
    </>
  );
};

const ImagesWindow = WindowWrapper(ImagesComponent, "imgfile");

export default ImagesWindow;
