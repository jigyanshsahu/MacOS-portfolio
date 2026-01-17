import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import WindowWrapper from "#hoc/WindowWrapper";
import WindowControls from "#components/WindowControls";
import { socials, locations } from "#constants";

const ContactComponent = () => {
  // try to find an avatar from ABOUT_LOCATION
  const about = locations?.about;
  const avatar = about?.children?.find((c) => c.kind === "file" && c.fileType === "img")?.imageUrl || "/images/giyu.png";

  const footerRef = useRef(null);

  useEffect(() => {
    if (!footerRef.current) return;
    gsap.fromTo(
      footerRef.current.querySelectorAll(".action-btn"),
      { y: 10, opacity: 0, scale: 0.98 },
      { y: 0, opacity: 1, scale: 1, stagger: 0.08, duration: 0.45, ease: "power2.out" }
    );
  }, []);

  return (
    <>
      <div id="window-header">
        <WindowControls target="contact" />
        <h2 className="font-georama text-sm text-gray-800">Contact Me</h2>
      </div>

      <div className="p-6 bg-white h-full flex flex-col justify-between">
        <div className="flex items-start gap-4">
          <img src={avatar} alt="avatar" className="w-16 h-16 rounded-full object-cover shadow" />

          <div className="">
            <h3 className="text-lg font-semibold text-gray-800">Let's Connect</h3>
            <p className="text-sm text-gray-600 mt-1">
              Got an idea? A bug to squash? Or just wanna talk tech? <br /> I'm in.
            </p>
          </div>
          <h2 className="">jigyanshsahu8@gmail.com</h2>
        </div>

        <div className="contact-footer">
          <div className="contact-actions flex relative bottom-[30px] items-center gap-4">
            {socials.map(({ id, text, icon, bg, link }) => (
              <a
                key={id}
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className="action-btn flex items-center gap-3 p-3 rounded shadow-sm hover:shadow-md transition-colors text-white text-sm font-medium"
                style={{ background: bg }}
              >
                <img src={icon} alt={text} className="w-5 h-5" />
                <span>{text}</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

const ContactWindow = WindowWrapper(ContactComponent, "contact");

export default ContactWindow;
