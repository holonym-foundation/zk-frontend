import { useEffect } from "react";
// https://hackernoon.com/how-to-add-script-tags-in-react
export default function useScriptWithURL(
  url: string,
  attributes: { [key: string]: any } = {}
) {
  useEffect(() => {
    const head = document.querySelector("head");
    const script = document.createElement("script");

    script.setAttribute("src", url);
    for (const attr of Object.keys(attributes)) {
      script.setAttribute(attr, attributes[attr]);
    }

    head!.appendChild(script);

    return () => {
      head!.removeChild(script);
    };
  }, [url]);
}
