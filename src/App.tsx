import React, { useState, useEffect } from "react";
import { Timer, Pause, Play, RotateCcw, Save, List, X } from "lucide-react";

interface SavedStopwatch {
  id: string;
  name: string;
  time: number;
  isRunning: boolean;
  lastRunTimestamp: number; // Add lastRunTimestamp to track when it was last running
  createdAt: string;
}

export default function App() {
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

  const [mainTime, setMainTime] = useState(0);
  const [stopwatches, setStopwatches] = useState<SavedStopwatch[]>([]);
  const [saveName, setSaveName] = useState("");
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [editingName, setEditingName] = useState<string | null>(null);
  const [newName, setNewName] = useState<string>("");
  const [referenceTime] = useState(calculateInitialTime());

  // Load saved stopwatches from localStorage on initial render
  useEffect(() => {
    const savedStopwatches = localStorage.getItem("savedStopwatches");
    if (savedStopwatches) {
      setStopwatches(JSON.parse(savedStopwatches));
    }
  }, []);

  // Save stopwatches to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("savedStopwatches", JSON.stringify(stopwatches));
  }, [stopwatches]);

  const addStopwatch = () => {
    const newStopwatch: SavedStopwatch = {
      id: Date.now().toString(),
      name: saveName || "New Stopwatch",
      time: 0,
      isRunning: false,
      lastRunTimestamp: 0, // Initialize lastRunTimestamp
      createdAt: new Date().toISOString(),
    };
    setStopwatches((prev) => [...prev, newStopwatch]);
    setSaveName("");
  };

  const updateStopwatchTime = () => {
    const nowInBelgium = new Date(
      new Date().toLocaleString("en-US", { timeZone: "Europe/Brussels" })
    );
    setMainTime(nowInBelgium.getTime() - referenceTime);

    setStopwatches((prev) =>
      prev.map((sw) => {
        if (sw.isRunning) {
          const timeElapsed = Date.now() - sw.lastRunTimestamp;
          return { ...sw, time: sw.time + timeElapsed, lastRunTimestamp: Date.now() }; // Update time with timeElapsed
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

    return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  const toggleStopwatch = (id: string) => {
    setStopwatches((prev) =>
      prev.map((sw) =>
        sw.id === id
          ? {
              ...sw,
              isRunning: !sw.isRunning,
              lastRunTimestamp: !sw.isRunning ? Date.now() : sw.lastRunTimestamp,
            }
          : sw
      )
    );
  };

  const resetStopwatch = (id: string) => {
    setStopwatches((prev) =>
      prev.map((sw) =>
        sw.id === id
          ? { ...sw, time: 0, isRunning: false, lastRunTimestamp: 0 }
          : sw
      )
    );
  };

  const deleteSavedStopwatch = (id: string) => {
    setStopwatches((prev) => prev.filter((sw) => sw.id !== id));
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
  };

  const formattedMainTime = formatTime(mainTime);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
      <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-xl w-full max-w-xl sm:w-11/12 md:w-96">
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
                onClick={addStopwatch}
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
          <div className="w-full bg-white/20 text-white font-mono text-center p-4 rounded-lg text-6xl sm:text-5xl md:text-6xl lg:text-7xl">
            {formattedMainTime}
          </div>
          <p className="text-xs text-gray-400 mt-2">
            monday 6 jan 2025 at 17:40
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
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
