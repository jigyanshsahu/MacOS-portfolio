import WindowWrapper from "#hoc/WindowWrapper.jsx";
import { WindowControls } from "#components";
import useWindowStore from "#store/Window";

const Text = () => {
  const { windows } = useWindowStore();

  // ✅ ALWAYS default to empty object
  const data = windows?.txtfile?.data ?? {};

  const { name, image, subtitle, description } = data;

  // ✅ Optional: hide window when no file is selected
  if (!name && !description && !image) return null;

  return (
    <>
      <div id="window-header" className="flex items-center gap-3">
        <WindowControls target="txtfile" />
        <h2 className="text-lg font-semibold">
          {name || "Text Viewer"}
        </h2>
      </div>

      <div className="p-5 space-y-6 bg-white">
        {image && (
          <img
            src={image}
            alt={name || "Text window image"}
            className="w-full h-auto rounded"
          />
        )}

        {subtitle && (
          <h3 className="text-lg font-semibold text-gray-900">
            {subtitle}
          </h3>
        )}

        {Array.isArray(description) && (
          <div className="space-y-3 leading-relaxed text-base text-gray-800">
            {description.map((para, idx) => (
              <p key={idx}>{para}</p>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default WindowWrapper(Text, "txtfile");
