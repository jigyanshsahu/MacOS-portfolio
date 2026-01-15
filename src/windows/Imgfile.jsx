import WindowWrapper from "#hoc/WindowWrapper.jsx";
import { WindowControls } from "#components";
import useWindowStore from "#store/Window";

const Imgfile = () => {
  const { windows } = useWindowStore();

  const data = windows?.imgfile?.data ?? {};
  const { name, imageUrl } = data;

  if (!name && !imageUrl) return null;

  return (
    <>
      <div id="window-header">
        <WindowControls target="imgfile" />
        <p>{name || "Image Viewer"}</p>
      </div>

      <div className="preview">
        {imageUrl && (
          <img src={imageUrl} alt={name || "Image"} />
        )}
      </div>
    </>
  );
};

export default WindowWrapper(Imgfile, "imgfile");
