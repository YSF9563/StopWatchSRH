import React, { useState, useEffect } from "react";
import { Timer, Pause, Play, RotateCcw, Save, List, X } from "lucide-react";

interface SavedStopwatch {
  id: string;
  name: string;
  time: number;
  isRunning: boolean;
  lastRunTimestamp: number;
  createdAt: string;
}

export default function App() {
  const [mainTime, setMainTime] = useState(0);
  const [stopwatches, setStopwatches] = useState<SavedStopwatch[]>([]);
  const [saveName, setSaveName] = useState("");
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [editingName, setEditingName] = useState<string | null>(null);
  const [newName, setNewName] = useState<string>("");

  const [currentBelgiumTime, setCurrentBelgiumTime] = useState(0);

  // Hardcoded fixed reference time: January 6, 2025 at 17:40 (Belgium time)
  const fixedReferenceTime = new Date("2025-01-06T17:40:00+01:00").getTime(); // Belgium timezone is UTC+1 at this time

  const fetchBelgiumTime = async () => {
    try {
      // Fetch current time in Belgium from the WorldTime API
      const response = await fetch("http://worldtimeapi.org/api/timezone/Europe/Brussels");
      const data = await response.json();
      return new Date(data.utc_datetime).getTime(); // Get UTC time of Belgium
    } catch (error) {
      console.error("Error fetching Belgium time:", error);
    }
  };

  // Set reference time and Belgium current time when the app is first loaded
  useEffect(() => {
    const init = async () => {
      const belgiumTime = await fetchBelgiumTime();
      setCurrentBelgiumTime(belgiumTime);
    };
    init();
  }, []);

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
      lastRunTimestamp: 0,
      createdAt: new Date().toISOString(),
    };
    setStopwatches((prev) => [...prev, newStopwatch]);
    setSaveName("");
  };

  // Update main stopwatch every second
  useEffect(() => {
    const interval = setInterval(() => {
      const currentTimeInBelgium = new Date().getTime();
      
      // Calculate elapsed time since the fixed reference time (in milliseconds)
      const elapsedTime = currentTimeInBelgium - fixedReferenceTime;

      // Update main time
      setMainTime(elapsedTime);

      // Update running stopwatches
      setStopwatches((prev) =>
        prev.map((sw) => {
          if (sw.isRunning) {
            const timeElapsed = currentTimeInBelgium - sw.lastRunTimestamp;
            return { ...sw, time: sw.time + timeElapsed, lastRunTimestamp: currentTimeInBelgium };
          }
          return sw;
        })
      );
    }, 1000); // Update every second

    return () => clearInterval(interval); // Cleanup on component unmount
  }, []);

  const formatMainTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
  
    // Calculate hours in a way that can scale to K or M
    const hours = Math.floor(totalSeconds / 3600);
  
    let formattedTime = "";
  
    // Format for 1 million and 1 thousand
    if (hours >= 1000000) {
      const millionHours = Math.floor(hours / 1000000);
      const thousandHours = Math.floor((hours % 1000000) / 1000);
      const normalHours = hours % 1000;
  
      formattedTime += `${millionHours}M:`; // 1 million hours
      formattedTime += `${thousandHours}k:`; // 1k hours
      formattedTime += `${normalHours < 100 ? "0" + normalHours : normalHours}:`; // Normal hours
    } else if (hours >= 1000) {
      const thousandHours = Math.floor(hours / 1000);
      const normalHours = hours % 1000;
  
      formattedTime += `${thousandHours}k:`; // 1k hours
      formattedTime += `${normalHours < 100 ? "0" + normalHours : normalHours}:`; // Normal hours
    } else {
      formattedTime += `${hours < 10 ? "0" + hours : hours}:`; // Normal hours
    }
  
    // Format minutes and seconds
    formattedTime += `${minutes < 10 ? "0" + minutes : minutes}:`;
    formattedTime += `${seconds < 10 ? "0" + seconds : seconds}`;
  
    return formattedTime;
  };
  

  const toggleStopwatch = (id: string) => {
    const currentTime = new Date().getTime();
    setStopwatches((prev) =>
      prev.map((sw) =>
        sw.id === id
          ? {
              ...sw,
              isRunning: !sw.isRunning,
              lastRunTimestamp: !sw.isRunning ? currentTime : sw.lastRunTimestamp,
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
      prev.map((sw) => (sw.id === id ? { ...sw, name: newName } : sw))
    );
    setEditingName(null);
  };

  const formattedMainTime = formatMainTime(mainTime);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
      <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-xl w-[520px]">
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
          <div className="w-auto inline-flex items-center justify-center bg-white/15 text-white font-mono text-center p-4 rounded-lg text-4xl">
            {formattedMainTime}
          </div>
          <p className="text-xs text-gray-400">
            Monday, 6 Jan 2025 at 17:40 (Belgium Time)
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
                  <p className="text-blue-300">{formatMainTime(sw.time)}</p>
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
