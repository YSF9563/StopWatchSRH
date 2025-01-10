import React, { useState, useEffect, useRef } from "react";
import { Timer, Pause, Play, RotateCcw, Save, List, X } from "lucide-react";

interface SavedStopwatch {
  id: string;
  name: string;
  time: number;
  isRunning: boolean;
  createdAt: string;
}

export default function App() {
  // Get Belgium's current time considering daylight saving time
  const calculateInitialTime = () => {
    const nowInBelgium = new Date(
      new Date().toLocaleString("en-US", {
        timeZone: "Europe/Brussels",
      })
    );
    const pastTime = new Date(nowInBelgium);
    pastTime.setDate(nowInBelgium.getDate() - 4); // Go back 4 days
    pastTime.setHours(17); // 5:40 PM (17:40 in 24-hour format)
    pastTime.setMinutes(39);
    pastTime.setSeconds(59);
    return pastTime.getTime();
  };

  const [mainTime, setMainTime] = useState(0);  // Main timer time based on reference
  const [stopwatches, setStopwatches] = useState<SavedStopwatch[]>([]);
  const [saveName, setSaveName] = useState("");
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [referenceTime] = useState(calculateInitialTime()); // Reference time for the main stopwatch

  // Add a new stopwatch
  const addStopwatch = () => {
    const newStopwatch: SavedStopwatch = {
      id: Date.now().toString(),
      name: saveName || "New Stopwatch",
      time: 0,
      isRunning: false,
      createdAt: new Date().toISOString(),
    };
    setStopwatches((prev) => [...prev, newStopwatch]);
  };

  // Update the main timer and other stopwatches' time
  const updateStopwatchTime = () => {
    // Update the main timer
    const nowInBelgium = new Date(
      new Date().toLocaleString("en-US", { timeZone: "Europe/Brussels" })
    );
    setMainTime(nowInBelgium.getTime() - referenceTime); // Main timer based on Brussels reference time

    // Update each stopwatch time
    setStopwatches((prev) =>
      prev.map((sw) => {
        if (sw.isRunning) {
          return { ...sw, time: sw.time + 1000 };  // Increment stopwatch time if it's running
        }
        return sw;
      })
    );
  };

  useEffect(() => {
    const interval = setInterval(updateStopwatchTime, 1000); // Update every second
    return () => clearInterval(interval);
  }, [referenceTime]);

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  const toggleStopwatch = (id: string) => {
    setStopwatches((prev) =>
      prev.map((sw) =>
        sw.id === id ? { ...sw, isRunning: !sw.isRunning } : sw
      )
    );
  };

  const resetStopwatch = (id: string) => {
    setStopwatches((prev) =>
      prev.map((sw) =>
        sw.id === id ? { ...sw, time: 0, isRunning: false } : sw
      )
    );
  };

  const handleSave = () => {
    const newStopwatch: SavedStopwatch = {
      id: Date.now().toString(),
      name: saveName || "New Stopwatch",
      time: 0,
      isRunning: false,
      createdAt: new Date().toISOString(),
    };
    const updatedStopwatches = [...stopwatches, newStopwatch];
    setStopwatches(updatedStopwatches);
    localStorage.setItem("savedStopwatches", JSON.stringify(updatedStopwatches));
    setSaveName(""); // Reset the save name input after saving
    setShowSaveDialog(false); // Close save dialog
  };

  const deleteSavedStopwatch = (id: string) => {
    const updatedStopwatches = stopwatches.filter((sw) => sw.id !== id);
    setStopwatches(updatedStopwatches);
    localStorage.setItem("savedStopwatches", JSON.stringify(updatedStopwatches));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
      <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-xl w-96">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Timer className="w-8 h-8 text-blue-400 mr-2" />
            <h1 className="text-2xl font-bold text-white">Stopwatch</h1>
          </div>
          <div className="flex gap-2">
            <button
              onClick={addStopwatch}
              className="bg-purple-500 hover:bg-purple-600 text-white p-2 rounded-full transition-colors"
            >
              <Save className="w-5 h-5" />
            </button>
            <button
              onClick={() => setShowSaveDialog(true)}
              className="bg-purple-500 hover:bg-purple-600 text-white p-2 rounded-full transition-colors"
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>

        {showSaveDialog && (
          <div className="mb-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={saveName}
                onChange={(e) => setSaveName(e.target.value)}
                placeholder="Enter stopwatch name"
                className="flex-1 bg-white/20 text-white p-2 rounded-lg"
              />
              <button
                onClick={handleSave}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Save
              </button>
              <button
                onClick={() => setShowSaveDialog(false)}
                className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Main Stopwatch (based on reference time) */}
        <div className="mb-8">
          <h2 className="text-white text-xl">Main Stopwatch</h2>
          <div className="w-full bg-white/20 text-white text-4xl font-mono text-center p-4 rounded-lg">
            {formatTime(mainTime)}
          </div>
        </div>

        {/* Independent Stopwatches */}
        <div className="mb-8 space-y-4">
          {stopwatches.map((sw) => (
            <div
              key={sw.id}
              className="bg-white/20 p-4 rounded-lg flex items-center justify-between"
            >
              <div>
                <h3 className="text-white font-semibold">{sw.name}</h3>
                <p className="text-blue-300">{formatTime(sw.time)}</p>
                <p className="text-xs text-gray-400">
                  {new Date(sw.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => toggleStopwatch(sw.id)}
                  className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-lg transition-colors"
                >
                  {sw.isRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                </button>
                <button
                  onClick={() => resetStopwatch(sw.id)}
                  className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg transition-colors"
                >
                  <RotateCcw className="w-5 h-5" />
                </button>
                <button
                  onClick={() => deleteSavedStopwatch(sw.id)}
                  className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
