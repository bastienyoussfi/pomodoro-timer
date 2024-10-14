import React, { useState, useEffect, useRef } from 'react';

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

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-3xl font-bold mb-4 text-center">Pomodoro Timer</h1>
        <div className="text-6xl font-bold mb-8 text-center">
          {String(time.minutes).padStart(2, '0')}:{String(time.seconds).padStart(2, '0')}
        </div>
        <div className="flex justify-between mb-4">
          <button
            className={`px-4 py-2 rounded ${timerType === 'work' ? 'bg-blue-500' : 'bg-gray-300'}`}
            onClick={() => switchTimer('work')}
          >
            Work
          </button>
          <button
            className={`px-4 py-2 rounded ${timerType === 'shortBreak' ? 'bg-green-500' : 'bg-gray-300'}`}
            onClick={() => switchTimer('shortBreak')}
          >
            Short Break
          </button>
          <button
            className={`px-4 py-2 rounded ${timerType === 'longBreak' ? 'bg-purple-500' : 'bg-gray-300'}`}
            onClick={() => switchTimer('longBreak')}
          >
            Long Break
          </button>
        </div>
        <div className="flex justify-center space-x-4 mb-8">
          <button
            className={`px-4 py-2 rounded ${
              isActive ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
            } text-white font-bold`}
            onClick={toggleTimer}
          >
            {isActive ? 'Pause' : 'Start'}
          </button>
          <button
            className="px-4 py-2 rounded bg-gray-500 hover:bg-gray-600 text-white font-bold"
            onClick={resetTimer}
          >
            Reset
          </button>
        </div>
        <div className="mb-4">
          <h2 className="text-xl font-bold mb-2">Tasks</h2>
          <div className="flex mb-2">
            <input
              type="text"
              className="flex-grow px-2 py-1 border rounded-l"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              placeholder="Add a new task"
            />
            <button
              className="px-4 py-1 bg-blue-500 text-white rounded-r"
              onClick={addTask}
            >
              Add
            </button>
          </div>
          <ul>
            {tasks.map((task) => (
              <li key={task.id} className="flex items-center justify-between mb-2">
                <span className={task.completed ? 'line-through' : ''}>
                  {task.text} (Pomodoros: {task.pomodoros})
                </span>
                <div>
                  <button
                    className="mr-2 px-2 py-1 bg-green-500 text-white rounded"
                    onClick={() => toggleTaskCompletion(task.id)}
                  >
                    {task.completed ? 'Undo' : 'Complete'}
                  </button>
                  <button
                    className="px-2 py-1 bg-blue-500 text-white rounded"
                    onClick={() => incrementTaskPomodoros(task.id)}
                  >
                    +1 Pomodoro
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div className="text-center">
          <p>Completed Pomodoros: {completedPomodoros}</p>
        </div>
      </div>
      <audio ref={audioRef} src="/notification.mp3" />
    </div>
  );
};

export default PomodoroTimer;