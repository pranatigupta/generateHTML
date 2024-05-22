import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useState } from "react";

export default function TreeViewPlugin(): JSX.Element {
  const [htmlText, setHtmlText] = useState("");
  const [editor] = useLexicalComposerContext();

  // Function to fetch the 'text' and 'format'
  function fetchFormatData(
    node: any,
    isRoot: boolean = true, // Add a parameter to track if the current node is the root
  ): { type: string; text: string; format: string[]; style: string }[] {
    let result: {
      type: string;
      text: string;
      format: string[];
      style: string;
    }[] = [];

    if (!node.children || node.children.length === 0) {
      if (
        (node.hasOwnProperty("style") &&
          node.hasOwnProperty("format") &&
          node.hasOwnProperty("text")) ||
        node.hasOwnProperty("type")
      ) {
        result.push({
          type: node.type,
          text: node.text ?? "\n",
          format: getFormatTypeFromFormatValue(node.format) ?? [],
          style: node.style ?? "",
        });
      }
    } else {
      for (let i = 0; i < node.children.length; i++) {
        const child = node.children[i];
        result = result.concat(fetchFormatData(child, false));

        if (isRoot && i < node.children.length - 1) {
          result.push({
            type: "linebreak",
            text: "\n",
            format: [],
            style: "",
          });
        }
      }
    }

    return result;
  }

  function getFormatTypeFromFormatValue(formatValue: number) {
    const formats = [];

    const formatFlags = {
      Bold: 1, // binary 0001
      Italic: 2, // binary 0010
      Strike: 4, // binary 0100
      Underline: 8, // binary 1000
    };

    for (const [format, value] of Object.entries(formatFlags)) {
      // Use bitwise AND to check if the format flag is present in the formatValue
      if ((formatValue & value) === value) {
        formats.push(format);
      }
    }

    return formats.length > 0 ? formats : ["None"];
  }

  function convertToHTML(
    type: string,
    text: string,
    format: string[],
    style: string,
  ) {
    if (text === " ") {
      return " ";
    }
    if (type === "linebreak") {
      return "<br>";
    }

    const formatTags: { [key: string]: string } = {
      Bold: "b",
      Italic: "i",
      Strike: "s",
      Underline: "u",
      Font: "font",
    };

    let html = text;
    for (let i = 0; i < format.length; i++) {
      if (format[i] === "None") {
        html = text;
        continue;
      }
      const openTag = `<${formatTags[format[i]]}>`;
      const closeTag = `</${formatTags[format[i]]}>`;
      html = openTag + html + closeTag;
    }

    if (style !== "") {
      let color = style.replace(":", "=");
      const openTag = `<${formatTags["Font"]} ${color.substring(0, 7)}"${color.substring(7, 14)}">`;
      const closeTag = `</${formatTags["Font"]}>`;
      html = openTag + html + closeTag;
    }

    return html;
  }

  function handleGetHTMLButtonClick() {
    const formats = fetchFormatData(editor.getEditorState().toJSON().root);
    let finalHtml = "";
    for (let i = 0; i < formats.length; i++) {
      const html = convertToHTML(
        formats[i].type,
        formats[i].text,
        formats[i].format,
        formats[i].style,
      );
      finalHtml = finalHtml + html;
    }
    setHtmlText(finalHtml);
  }

  async function copyToClipboard(text: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(text);
      console.log("Text copied to clipboard");
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  }

  return (
    <div>
      <button
        className={"html-button"}
        onClick={() => {
          handleGetHTMLButtonClick();
        }}
      >
        Get HTML
      </button>
      <div className="html-text" data-text="See HTML here...">
        {htmlText}
      </div>
      <button
        className={"html-button"}
        onClick={() => {
          copyToClipboard(htmlText);
        }}
      >
        Copy HTML
      </button>
    </div>
  );
}
