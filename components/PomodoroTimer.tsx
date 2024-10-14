import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock,
  CheckCircle,
  PlusCircle,
  Trash2,
  Settings,
  BarChart2,
  Volume2,
  VolumeX,
} from "lucide-react";

type TimerType = "work" | "shortBreak" | "longBreak";

interface Task {
  id: number;
  text: string;
  completed: boolean;
  pomodoros: number;
}

interface TimerSettings {
  work: number;
  shortBreak: number;
  longBreak: number;
}

const PomodoroTimer: React.FC = () => {
  const [time, setTime] = useState({ minutes: 25, seconds: 0 });
  const [isActive, setIsActive] = useState(false);
  const [timerType, setTimerType] = useState<TimerType>("work");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState("");
  const [completedPomodoros, setCompletedPomodoros] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [timerSettings, setTimerSettings] = useState<TimerSettings>({
    work: 25,
    shortBreak: 5,
    longBreak: 15,
  });
  const [showStats, setShowStats] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    // Load data from localStorage
    const savedTasks = localStorage.getItem("pomodoro-tasks");
    if (savedTasks) setTasks(JSON.parse(savedTasks));

    const savedCompletedPomodoros = localStorage.getItem("completed-pomodoros");
    if (savedCompletedPomodoros)
      setCompletedPomodoros(parseInt(savedCompletedPomodoros, 10));

    const savedTimerSettings = localStorage.getItem("timer-settings");
    if (savedTimerSettings) setTimerSettings(JSON.parse(savedTimerSettings));
  }, []);

  useEffect(() => {
    localStorage.setItem("pomodoro-tasks", JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem("completed-pomodoros", completedPomodoros.toString());
  }, [completedPomodoros]);

  useEffect(() => {
    localStorage.setItem("timer-settings", JSON.stringify(timerSettings));
  }, [timerSettings]);

  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;

    if (isActive) {
      interval = setInterval(() => {
        setTime((prevTime) => {
          if (prevTime.seconds === 0) {
            if (prevTime.minutes === 0) {
              clearInterval(interval);
              handleTimerComplete();
              return prevTime;
            }
            return { minutes: prevTime.minutes - 1, seconds: 59 };
          }
          return { ...prevTime, seconds: prevTime.seconds - 1 };
        });
      }, 1000);
    } else if (!isActive && (time.seconds !== 0 || time.minutes !== 0)) {
      if (interval) clearInterval(interval);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, time]);

  const handleTimerComplete = () => {
    setIsActive(false);
    if (!isMuted && audioRef.current) audioRef.current.play();
    if (timerType === "work") {
      setCompletedPomodoros((prev) => prev + 1);
    }
    switchTimer(timerType === "work" ? "shortBreak" : "work");
  };

  const switchTimer = (type: TimerType) => {
    setTimerType(type);
    setTime({ minutes: timerSettings[type], seconds: 0 });
  };

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTime({ minutes: timerSettings[timerType], seconds: 0 });
  };

  const addTask = () => {
    if (newTask.trim()) {
      setTasks([
        ...tasks,
        { id: Date.now(), text: newTask, completed: false, pomodoros: 0 },
      ]);
      setNewTask("");
    }
  };

  const toggleTaskCompletion = (id: number) => {
    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const incrementTaskPomodoros = (id: number) => {
    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, pomodoros: task.pomodoros + 1 } : task
      )
    );
  };

  const removeTask = (id: number) => {
    setTasks(tasks.filter((task) => task.id !== id));
  };

  const getTimerColor = () => {
    switch (timerType) {
      case "work":
        return "bg-blue-600";
      case "shortBreak":
        return "bg-green-600";
      case "longBreak":
        return "bg-purple-600";
      default:
        return "bg-gray-600";
    }
  };

  const formatTime = (minutes: number, seconds: number) => {
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
      2,
      "0"
    )}`;
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-4xl p-8 bg-white rounded-lg shadow-xl"
      >
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">FocusFlow</h1>
          <div className="flex space-x-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 rounded-full bg-gray-200 text-gray-600 hover:bg-gray-300"
              onClick={() => setShowStats(!showStats)}
            >
              <BarChart2 size={24} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 rounded-full bg-gray-200 text-gray-600 hover:bg-gray-300"
              onClick={() => setShowSettings(!showSettings)}
            >
              <Settings size={24} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 rounded-full bg-gray-200 text-gray-600 hover:bg-gray-300"
              onClick={() => setIsMuted(!isMuted)}
            >
              {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
            </motion.button>
          </div>
        </div>

        <div className="flex justify-center mb-8">
          <motion.div
            className={`text-6xl font-bold p-8 rounded-full ${getTimerColor()} text-white shadow-lg`}
            animate={{ scale: isActive ? [1, 1.03, 1] : 1 }}
            transition={{ duration: 1, repeat: isActive ? Infinity : 0 }}
          >
            {formatTime(time.minutes, time.seconds)}
          </motion.div>
        </div>

        <div className="flex justify-center space-x-4 mb-8">
          {(["work", "shortBreak", "longBreak"] as TimerType[]).map((type) => (
            <motion.button
              key={type}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`px-6 py-2 rounded-full ${
                timerType === type ? getTimerColor() : "bg-gray-300"
              } text-white font-semibold shadow-md`}
              onClick={() => switchTimer(type)}
            >
              {type === "work"
                ? "Work"
                : type === "shortBreak"
                ? "Short Break"
                : "Long Break"}
            </motion.button>
          ))}
        </div>

        <div className="flex justify-center space-x-4 mb-12">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`px-8 py-3 rounded-full ${
              isActive
                ? "bg-red-500 hover:bg-red-600"
                : "bg-green-500 hover:bg-green-600"
            } text-white font-bold shadow-md text-lg`}
            onClick={toggleTimer}
          >
            {isActive ? "Pause" : "Start"}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-3 rounded-full bg-gray-500 hover:bg-gray-600 text-white font-bold shadow-md text-lg"
            onClick={resetTimer}
          >
            Reset
          </motion.button>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">Tasks</h2>
          <div className="flex mb-4">
            <input
              type="text"
              className="flex-grow px-4 py-2 border border-gray-300 rounded-l-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              placeholder="Add a new task"
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-2 bg-blue-500 text-white rounded-r-full"
              onClick={addTask}
            >
              <PlusCircle size={24} />
            </motion.button>
          </div>
          <ul className="space-y-2">
            <AnimatePresence>
              {tasks.map((task) => (
                <motion.li
                  key={task.id}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="flex items-center justify-between p-3 bg-gray-100 rounded-lg"
                >
                  <span
                    className={`flex-grow ${
                      task.completed
                        ? "line-through text-gray-500"
                        : "text-gray-800"
                    }`}
                  >
                    {task.text} (Pomodoros: {task.pomodoros})
                  </span>
                  <div className="flex space-x-2">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-1 rounded-full bg-green-500 text-white"
                      onClick={() => toggleTaskCompletion(task.id)}
                    >
                      <CheckCircle size={20} />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-1 rounded-full bg-blue-500 text-white"
                      onClick={() => incrementTaskPomodoros(task.id)}
                    >
                      <Clock size={20} />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-1 rounded-full bg-red-500 text-white"
                      onClick={() => removeTask(task.id)}
                    >
                      <Trash2 size={20} />
                    </motion.button>
                  </div>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        </div>

        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-8"
            >
              <h2 className="text-2xl font-bold mb-4 text-gray-800">
                Timer Settings
              </h2>
              <div className="grid grid-cols-3 gap-4">
                {Object.entries(timerSettings).map(([key, value]) => (
                  <div key={key} className="flex flex-col">
                    <label className="mb-2 text-gray-700">
                      {key.charAt(0).toUpperCase() + key.slice(1)} (minutes)
                    </label>
                    <input
                      type="number"
                      value={value}
                      onChange={(e) =>
                        setTimerSettings({
                          ...timerSettings,
                          [key]: parseInt(e.target.value),
                        })
                      }
                      className="px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showStats && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-8"
            >
              <h2 className="text-2xl font-bold mb-4 text-gray-800">
                Statistics
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-100 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-2">
                    Completed Pomodoros
                  </h3>
                  <p className="text-3xl font-bold text-blue-600">
                    {completedPomodoros}
                  </p>
                </div>
                <div className="bg-green-100 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-2">
                    Completed Tasks
                  </h3>
                  <p className="text-3xl font-bold text-green-600">
                    {tasks.filter((task) => task.completed).length}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      <audio ref={audioRef} src="/notification.mp3" />
    </div>
  );
};

export default PomodoroTimer;
