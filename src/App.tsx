import React, { useState, useEffect, useRef } from "react";
import { Timer, Pause, Play, RotateCcw, Save, List, X } from "lucide-react";

interface SavedStopwatch {
  id: string;
  name: string;
  time: number;
  createdAt: string;
}

export default function App() {
  const calculateInitialTime = () => {
    const now = new Date();
    const pastTime = new Date();
    pastTime.setDate(now.getDate() - 4); // Go back 5 days
    pastTime.setHours(17); // 5:40 PM (17:40 in 24-hour format)
    pastTime.setMinutes(39);
    pastTime.setSeconds(59);
    return pastTime.getTime();
  };

  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState("");
  const [showSaved, setShowSaved] = useState(false);
  const [savedStopwatches, setSavedStopwatches] = useState<SavedStopwatch[]>([]);
  const [saveName, setSaveName] = useState("");
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [referenceTime] = useState(calculateInitialTime());
  const intervalRef = useRef<number>();

  useEffect(() => {
    // Load saved stopwatches from localStorage
    const saved = localStorage.getItem("savedStopwatches");
    if (saved) {
      setSavedStopwatches(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = window.setInterval(() => {
        setTime(Date.now() - referenceTime); // Calculate time difference from referenceTime
      }, 1000); // Update every second
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, referenceTime]);

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${hours.toString().padStart(3, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  const handleEdit = () => {
    if (isEditing) {
      const [h, m, s] = editValue.split(":").map(Number);
      if (!isNaN(h) && !isNaN(m) && !isNaN(s)) {
        const newTime = (h * 60 * 60 + m * 60 + s) * 1000;
        setTime(newTime);
      }
    }
    setIsEditing(!isEditing);
  };

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setTime(0);
    setIsRunning(false);
  };

  const handleSave = () => {
    if (!saveName.trim()) return;

    const newStopwatch: SavedStopwatch = {
      id: Date.now().toString(),
      name: saveName,
      time,
      createdAt: new Date().toISOString(),
    };

    const updatedStopwatches = [...savedStopwatches, newStopwatch];
    setSavedStopwatches(updatedStopwatches);
    localStorage.setItem("savedStopwatches", JSON.stringify(updatedStopwatches));

    setSaveName("");
    setShowSaveDialog(false);
  };

  const deleteSavedStopwatch = (id: string) => {
    const updatedStopwatches = savedStopwatches.filter((sw) => sw.id !== id);
    setSavedStopwatches(updatedStopwatches);
    localStorage.setItem("savedStopwatches", JSON.stringify(updatedStopwatches));
  };

  const loadSavedStopwatch = (savedTime: number) => {
    setTime(savedTime);
    setShowSaved(false);
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
              onClick={() => setShowSaveDialog(true)}
              className="bg-purple-500 hover:bg-purple-600 text-white p-2 rounded-full transition-colors"
            >
              <Save className="w-5 h-5" />
            </button>
            <button
              onClick={() => setShowSaved(!showSaved)}
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

        {showSaved ? (
          <div className="mb-8 space-y-2 max-h-[300px] overflow-y-auto">
            {savedStopwatches.length === 0 ? (
              <p className="text-white text-center">No saved stopwatches</p>
            ) : (
              savedStopwatches.map((sw) => (
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
                      onClick={() => loadSavedStopwatch(sw.time)}
                      className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-lg transition-colors"
                    >
                      Load
                    </button>
                    <button
                      onClick={() => deleteSavedStopwatch(sw.id)}
                      className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="mb-8">
            {isEditing ? (
              <input
                type="text"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="w-full bg-white/20 text-white text-4xl font-mono text-center p-4 rounded-lg"
                placeholder="000:00:00"
              />
            ) : (
              <div
                onClick={() => {
                  setIsEditing(true);
                  setEditValue(formatTime(time));
                }}
                className="w-full bg-white/20 text-white text-4xl font-mono text-center p-4 rounded-lg cursor-pointer hover:bg-white/25 transition-colors"
              >
                {formatTime(time)}
              </div>
            )}
          </div>
        )}

        <div className="flex justify-center space-x-4">
          <button
            onClick={toggleTimer}
            className="bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-full transition-colors"
          >
            {isRunning ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
          </button>
          <button
            onClick={resetTimer}
            className="bg-red-500 hover:bg-red-600 text-white p-3 rounded-full transition-colors"
          >
            <RotateCcw className="w-6 h-6" />
          </button>
          <button
            onClick={handleEdit}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            {isEditing ? "Save" : "Edit"}
          </button>
        </div>
      </div>
    </div>
  );
}
