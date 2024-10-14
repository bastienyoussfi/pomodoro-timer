import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Bell, CheckCircle, PlusCircle, Trash2 } from 'lucide-react';

type TimerType = 'work' | 'shortBreak' | 'longBreak';

interface Task {
  id: number;
  text: string;
  completed: boolean;
  pomodoros: number;
}

const PomodoroTimer: React.FC = () => {
  const [time, setTime] = useState({ minutes: 25, seconds: 0 });
  const [isActive, setIsActive] = useState(false);
  const [timerType, setTimerType] = useState<TimerType>('work');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState('');
  const [completedPomodoros, setCompletedPomodoros] = useState(0);

  const audioRef = useRef<HTMLAudioElement>(null);

  const timerDurations = {
    work: 25,
    shortBreak: 5,
    longBreak: 15,
  };

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
    if (audioRef.current) audioRef.current.play();
    if (timerType === 'work') {
      setCompletedPomodoros((prev) => prev + 1);
    }
    switchTimer(timerType === 'work' ? 'shortBreak' : 'work');
  };

  const switchTimer = (type: TimerType) => {
    setTimerType(type);
    setTime({ minutes: timerDurations[type], seconds: 0 });
  };

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTime({ minutes: timerDurations[timerType], seconds: 0 });
  };

  const addTask = () => {
    if (newTask.trim()) {
      setTasks([...tasks, { id: Date.now(), text: newTask, completed: false, pomodoros: 0 }]);
      setNewTask('');
    }
  };

  const toggleTaskCompletion = (id: number) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const incrementTaskPomodoros = (id: number) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, pomodoros: task.pomodoros + 1 } : task
    ));
  };

  const removeTask = (id: number) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  const getTimerColor = () => {
    switch (timerType) {
      case 'work': return 'bg-red-500';
      case 'shortBreak': return 'bg-green-500';
      case 'longBreak': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <motion.div 
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md p-6 bg-white rounded-lg shadow-lg"
      >
        <h1 className="text-4xl font-bold mb-6 text-center text-gray-800">Pomodoro Timer</h1>
        <motion.div 
          className={`text-7xl font-bold mb-8 text-center p-8 rounded-full ${getTimerColor()} text-white shadow-lg`}
          animate={{ scale: isActive ? [1, 1.05, 1] : 1 }}
          transition={{ duration: 1, repeat: isActive ? Infinity : 0 }}
        >
          {String(time.minutes).padStart(2, '0')}:{String(time.seconds).padStart(2, '0')}
        </motion.div>
        <div className="flex justify-between mb-6">
          {(['work', 'shortBreak', 'longBreak'] as TimerType[]).map((type) => (
            <motion.button
              key={type}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`px-4 py-2 rounded-full ${timerType === type ? getTimerColor() : 'bg-gray-300'} text-white font-semibold shadow-md`}
              onClick={() => switchTimer(type)}
            >
              {type === 'work' ? 'Work' : type === 'shortBreak' ? 'Short Break' : 'Long Break'}
            </motion.button>
          ))}
        </div>
        <div className="flex justify-center space-x-4 mb-8">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`px-6 py-2 rounded-full ${
              isActive ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
            } text-white font-bold shadow-md`}
            onClick={toggleTimer}
          >
            {isActive ? 'Pause' : 'Start'}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-2 rounded-full bg-gray-500 hover:bg-gray-600 text-white font-bold shadow-md"
            onClick={resetTimer}
          >
            Reset
          </motion.button>
        </div>
        <div className="mb-6">
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
              className="px-4 py-2 bg-blue-500 text-white rounded-r-full"
              onClick={addTask}
            >
              <PlusCircle size={24} />
            </motion.button>
          </div>
          <ul className="space-y-2">
            {tasks.map((task) => (
              <motion.li
                key={task.id}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex items-center justify-between p-3 bg-gray-100 rounded-lg"
              >
                <span className={`flex-grow ${task.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}>
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
                    <Bell size={20} />
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
          </ul>
        </div>
        <div className="text-center text-lg font-semibold text-gray-700">
          <p>Completed Pomodoros: {completedPomodoros}</p>
        </div>
      </motion.div>
      <audio ref={audioRef} src="/notification.mp3" />
    </div>
  );
};

export default PomodoroTimer;