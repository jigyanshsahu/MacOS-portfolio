import React from "react";
import useWindowStore from "#store/Window";
import WindowWrapper from "#hoc/WindowWrapper";
import WindowControls from "#components/WindowControls";
import { Check, Flag } from "lucide-react";

const FilePreviewBase = ({ target }) => {
  const { windows } = useWindowStore();
  const win = windows?.[target];
  const data = win?.data;

  const isTxt = target === "txtfile";
  const isImg = target === "imgfile";

  return (
    <>
      <div id="window-header">
        <WindowControls target={target} />
        <h2 className="font-georama text-sm text-gray-800">{data?.name || "Preview"}</h2>
      </div>

      <div className="techstack p-6 font-georama text-sm text-gray-700 space-y-4">
        <p className="text-xs text-gray-500"><span className="font-semibold text-gray-800">@Adrian</span> % preview</p>

        <div className="content max-w-3xl mx-auto">
          {!data && (
            <p className="italic text-gray-500">No file selected. Open a file from Finder to preview it here.</p>
          )}

          {data && isTxt && (
            <div className="prose prose-sm mx-auto text-gray-700 leading-relaxed">
              {data.subtitle && <p className="font-semibold text-gray-800">{data.subtitle}</p>}

              {Array.isArray(data.description) ? (
                data.description.map((line, i) => <p key={i}>{line}</p>)
              ) : (
                <p className="italic text-sm text-gray-500">(no text content)</p>
              )}
            </div>
          )}

          {data && isImg && (
            <div className="flex items-center justify-center">
              <img
                src={data.imageUrl || data.icon}
                alt={data.name}
                className="max-w-full max-h-[70vh] object-contain rounded-sm shadow-sm"
              />
            </div>
          )}
        </div>

        <div className="footnote">
          <p>
            <Check size={18} /> preview ready
          </p>
        </div>

        <p className="black">
          <Flag size={15} fill="black" /> render time: 2ms
        </p>
      </div>
    </>
  );
};

const TxtPreview = WindowWrapper((props) => <FilePreviewBase target="txtfile" {...props} />, "txtfile");
const ImgPreview = WindowWrapper((props) => <FilePreviewBase target="imgfile" {...props} />, "imgfile");

export { TxtPreview as TextWindow, ImgPreview as ImagesWindow };
