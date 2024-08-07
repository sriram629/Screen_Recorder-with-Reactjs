import React, { useState, useRef } from "react";
import axios from "axios";
import "./index.css"; // Ensure this file includes the Tailwind imports

function App() {
  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [chunks, setChunks] = useState([]);
  const videoRef = useRef();

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getDisplayMedia({
      video: true,
    });
    const recorder = new MediaRecorder(stream);

    recorder.ondataavailable = (event) => {
      setChunks((prev) => [...prev, event.data]);
    };

    recorder.start();
    setMediaRecorder(recorder);
    setRecording(true);
    videoRef.current.srcObject = stream;
  };

  const stopRecording = () => {
    mediaRecorder.stop();
    setRecording(false);
  };

  const downloadRecording = async () => {
    const blob = new Blob(chunks, { type: "video/webm" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.style.display = "none";
    a.href = url;
    a.download = "recording.webm";
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(url);

    const formData = new FormData();
    formData.append("video", blob, "recording.webm");
    try {
      await axios.post("https://sriram629-screen-recorder-with-reactjs-zgdp.vercel.app/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-black items-center justify-between p-4">
      <h1 className="text-3xl text-white mb-4">Screen Recorder</h1>
      <video
        ref={videoRef}
        autoPlay
        className="w-full max-h-[60vh] mb-4 rounded-lg border-2 border-gray-600"
      ></video>
      <div className="space-x-4 mb-4">
        {!recording ? (
          <button
            onClick={startRecording}
            className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-700"
          >
            Start Recording
          </button>
        ) : (
          <button
            onClick={stopRecording}
            className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-700"
          >
            Stop Recording
          </button>
        )}
        <button
          onClick={downloadRecording}
          disabled={recording || chunks.length === 0}
          className={`py-2 px-4 rounded ${
            recording || chunks.length === 0
              ? "bg-gray-500"
              : "bg-green-500 hover:bg-green-700"
          } text-white`}
        >
          Download Recording
        </button>
      </div>
    </div>
  );
}

export default App;
