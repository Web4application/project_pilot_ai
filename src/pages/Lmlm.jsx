import Editor from "@monaco-editor/react";
import { useState } from "react";
import { interpretLMLM } from "../utils/api";

export default function LMLMEditor() {
  const [code, setCode] = useState(":table {}");
  const [output, setOutput] = useState("");

  async function runLMLM() {
    const res = await interpretLMLM(code);
    setOutput(JSON.stringify(res, null, 2));
  }

  return (
    <div className="lmlm-editor">
      <Editor
        height="70vh"
        defaultLanguage="yaml"
        value={code}
        onChange={setCode}
      />

      <button onClick={runLMLM}>Run</button>

      <pre className="output">{output}</pre>
    </div>
  );
}
