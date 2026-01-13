
import { techStack } from "#constants";
import WindowWrapper from "#hoc/WindowWrapper";
import WindowControls from "#components/WindowControls";


import { Check, Flag } from "lucide-react";
import React from "react";

const TerminalComponent = () => {
  return (
    <>
      <div id="window-header">
        <WindowControls target="terminal" />
        <h2>Tech Stack</h2>
      </div>

      <div className="techstack">
        <p>
          <span className="font-bold">@Jigyansh %</span> show tech stack
        </p>

        <div className="label">
          <p className="w-32">Category</p>
          <p>Technologies</p>
        </div>

        <ul className="content">
          {techStack.map(({ category, items }) => (
            <li key={category}>
              <div className="flex items-center">
                <Check className="check" size={20} />
                <h3 className="w-32">{category}</h3>

                <p>
                  {items.map((item, i) => (
                    <span key={i}>
                      {item}
                      {i < items.length - 1 ? ", " : ""}
                    </span>
                  ))}
                </p>
              </div>
            </li>
          ))}
        </ul>

        {/* footer */}
        <div className="footnote">
          <p>
            <Check size={20} /> 5 of 5 stacks loaded successfully (100%)
          </p>
        </div>

        <p className="black">
          <Flag size={15} fill="black" /> render time: 6ms
        </p>
      </div>
    </>
  );
};

const TerminalWindow = WindowWrapper(TerminalComponent, "terminal");

export default TerminalWindow;
