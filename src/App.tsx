import React, { useState, useEffect } from "react";
import { Timer, Pause, Play, RotateCcw, Save, List, X } from "lucide-react";

interface SavedStopwatch {
  id: string;
  name: string;
  time: number;
  isRunning: boolean;
  createdAt: string;
}

export default function App() {
  const calculateInitialTime = () => {
    // Hardcoding the desired start time: January 6, 2025 at 17:40
    const startTime = new Date("2025-01-06T17:40:00+01:00");
    return startTime.getTime();
  };

  const [mainTime, setMainTime] = useState(0);
  const [stopwatches, setStopwatches] = useState<SavedStopwatch[]>([]);
  const [saveName, setSaveName] = useState("");
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [editingName, setEditingName] = useState<string | null>(null); // State for editing name
  const [newName, setNewName] = useState<string>(""); // State for new name input
  const [referenceTime] = useState(calculateInitialTime());

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

  const updateStopwatchTime = () => {
    const nowInBelgium = new Date(
      new Date().toLocaleString("en-US", { timeZone: "Europe/Brussels" })
    );
    setMainTime(nowInBelgium.getTime() - referenceTime);

    setStopwatches((prev) =>
      prev.map((sw) => {
        if (sw.isRunning) {
          return { ...sw, time: sw.time + 1000 }; // Increment stopwatch time if running
        }
        return sw;
      })
    );
  };

  useEffect(() => {
    const interval = setInterval(updateStopwatchTime, 1000);
    return () => clearInterval(interval);
  }, [referenceTime]);

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
  
    // Separate full 1k hours and 1M hours
    const fullMHours = Math.floor(hours / 1000000); // Full 1M hours
    const fullKHours = Math.floor((hours % 1000000) / 1000); // Full 1k hours
    const remainingHours = hours % 1000; // Remaining hours
  
    // Build the time string
    let formattedTime = "";
  
    if (fullMHours > 0) {
      formattedTime += `${fullMHours}M`;
    } else if (fullKHours > 0) {
      formattedTime += `${fullKHours}k`;
    } else {
      formattedTime += remainingHours.toString();
    }
  
    // Always include minutes and seconds
    formattedTime += `:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  
    return formattedTime;
  };

  const getFontSizeClass = (formattedTime: string) => {
    const length = formattedTime.length;

    // Adjust these thresholds and sizes based on your design preferences
    if (length < 10) {
      return "text-6xl"; // For short times (e.g., hours < 10)
    } else if (length < 15) {
      return "text-5xl"; // For medium-length times
    } else if (length < 20) {
      return "text-4xl"; // For longer times
    } else {
      return "text-3xl"; // For very long times (e.g., 1k hours)
    }
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
    setSaveName("");
    setShowSaveDialog(false);
  };

  const deleteSavedStopwatch = (id: string) => {
    const updatedStopwatches = stopwatches.filter((sw) => sw.id !== id);
    setStopwatches(updatedStopwatches);
    localStorage.setItem("savedStopwatches", JSON.stringify(updatedStopwatches));
  };

  const handleNameEdit = (id: string) => {
    setEditingName(id);
    const stopwatch = stopwatches.find((sw) => sw.id === id);
    if (stopwatch) setNewName(stopwatch.name);
  };

  const handleNameChange = (id: string) => {
    setStopwatches((prev) =>
      prev.map((sw) =>
        sw.id === id ? { ...sw, name: newName } : sw
      )
    );
    setEditingName(null);
    localStorage.setItem("savedStopwwatches", JSON.stringify(stopwatches));
  };

  const formattedMainTime = formatTime(mainTime);
  
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

        <div className="mb-8">
          <h2 className="text-white text-xl">Main Stopwatch</h2>
          <div className={`w-full bg-white/20 text-white font-mono text-center p-4 rounded-lg ${getFontSizeClass(formattedMainTime)}`}>
            {formattedMainTime}
          </div>
          <p className="text-xs text-gray-400 mt-2">
            Started on: January 6, 2025 at 17:40
          </p>
        </div>

        <div className="mb-8 space-y-4">
          {stopwatches.map((sw) => (
            <div
              key={sw.id}
              className="bg-white/20 p-4 rounded-lg flex flex-col items-start justify-between"
            >
              {editingName === sw.id ? (
                <>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="bg-white/20 text-white p-2 rounded-lg mb-2"
                  />
                  <button
                    onClick={() => handleNameChange(sw.id)}
                    className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-lg mb-2"
                  >
                    Save Name
                  </button>
                </>
              ) : (
                <>
                  <h3
                    className="text-white font-semibold cursor-pointer"
                    onClick={() => handleNameEdit(sw.id)}
                  >
                    {sw.name}
                  </h3>
                  <p className="text-blue-300">{formatTime(sw.time)}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(sw.createdAt).toLocaleDateString()}
                  </p>
                </>
              )}

              {/* Buttons for control */}
              <div className="flex gap-2 mt-2">
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
