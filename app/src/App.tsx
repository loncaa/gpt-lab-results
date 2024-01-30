import React from "react";
import "./App.css";

import Logo from "./logo.svg";

import axios from "axios";

function App() {
  const [selectedFile, setSelectedFile] = React.useState<File>();
  const [resultText, setResultText] = React.useState<string>();

  const handleOnFileChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) {
      return;
    }

    setSelectedFile(event.target.files[0]);
  };

  const handleSubmit = async (event: React.SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedFile) {
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);

    console.log("formData", selectedFile.name);

    try {
      const response = await axios<{ promptResponse: string }>({
        method: "post",
        url: "/parse",
        data: formData,
        headers: { "Content-Type": "multipart/form-data" },
      });

      const { promptResponse } = response.data;
      setResultText(promptResponse);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="App">
      <div className="App-header">
        <form onSubmit={handleSubmit}>
          <input type="file" id="pdfFile" onChange={handleOnFileChanged} />
          <input type="submit" value="GO" />
        </form>
        <p>{resultText}</p>
      </div>
    </div>
  );
}

export default App;
