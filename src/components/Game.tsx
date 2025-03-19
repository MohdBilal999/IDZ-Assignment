import React, { useState, useEffect, useRef } from 'react';

interface GameSettings {
  generationSpeed: number;
  floatingSpeed: number;
  isAutoPump: boolean;
}

interface Balloon {
  id: number;
  x: number;
  y: number;
  color: string;
  letter: string;
  size: number;
}

const Game: React.FC = () => {
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState<GameSettings>({
    generationSpeed: 1000,
    floatingSpeed: 1,
    isAutoPump: false,
  });
  const [balloons, setBalloons] = useState<Balloon[]>([]);
  const [isInflating, setIsInflating] = useState(false);
  const [score, setScore] = useState(0);
  const gameAreaRef = useRef<HTMLDivElement>(null);

  const backgroundImageUrl = '/bg.png';
  const colors = ['#FF69B4', '#87CEEB', '#98FB98', '#DDA0DD', '#FFB6C1'];
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  // Create a new balloon
  const createBalloon = () => {
    if (gameAreaRef.current) {
      const newBalloon: Balloon = {
        id: Date.now(),
        x: Math.random() * (gameAreaRef.current.clientWidth - 100),
        y: gameAreaRef.current.clientHeight - 100,
        color: colors[Math.floor(Math.random() * colors.length)],
        letter: letters[Math.floor(Math.random() * letters.length)],
        size: 0,
      };
      setBalloons((prev) => [...prev, newBalloon]);
    }
  };

  // Inflate a balloon
  const inflateBalloon = () => {
    setIsInflating(true);
    createBalloon();
  };

  // Stop inflating
  const stopInflating = () => {
    setIsInflating(false);
  };

  // Pop a balloon
  const popBalloon = (id: number) => {
    setBalloons((prev) => prev.filter((balloon) => balloon.id !== id));
    setScore((prev) => prev + 10);
  };

  // Move balloons and update their size
  useEffect(() => {
    const moveBalloons = setInterval(() => {
      setBalloons((prev) =>
        prev.map((balloon) => ({
          ...balloon,
          y: balloon.y - settings.floatingSpeed,
          x: balloon.x + Math.sin(Date.now() / 1000 + balloon.id) * 0.5,
          size: Math.min(balloon.size + 0.5, 100),
        }))
      );
    }, 16);

    return () => clearInterval(moveBalloons);
  }, [settings.floatingSpeed]);

  // Auto-pump balloons if enabled
  useEffect(() => {
    let autoPumpInterval: NodeJS.Timeout;
    if (settings.isAutoPump) {
      autoPumpInterval = setInterval(() => {
        createBalloon();
      }, settings.generationSpeed);
    }
    return () => clearInterval(autoPumpInterval);
  }, [settings.isAutoPump, settings.generationSpeed]);

  // Remove balloons that are out of the screen
  useEffect(() => {
    setBalloons((prev) => prev.filter((balloon) => balloon.y > -100));
  }, [balloons.length]);

  return (
    <div
      className="relative w-full h-screen overflow-hidden"
      ref={gameAreaRef}
      style={{
        backgroundImage: `url(${backgroundImageUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Back Button */}
      <button className="absolute top-4 left-4 bg-white rounded-full p-3 shadow-lg cursor-pointer !rounded-button">
        <i className="fas fa-arrow-left text-gray-700 text-xl"></i>
      </button>

      {/* Score Display */}
      <div className="absolute top-4 right-4 bg-white rounded-xl px-6 py-3 shadow-lg">
        <span className="text-2xl font-bold text-gray-700">Score: {score}</span>
      </div>

      {/* Balloons */}
      {balloons.map((balloon) => (
        <div
          key={balloon.id}
          className="absolute cursor-pointer transition-transform"
          style={{
            left: `${balloon.x}px`,
            top: `${balloon.y}px`,
            transform: `scale(${balloon.size / 100})`,
          }}
          onClick={() => popBalloon(balloon.id)}
        >
          <div
            className="w-20 h-24 rounded-full flex items-center justify-center text-white font-bold text-2xl relative"
            style={{ backgroundColor: balloon.color }}
          >
            {balloon.letter}
            <div
              className="absolute bottom-0 left-1/2 w-4 h-6 -translate-x-1/2 rounded-b-lg"
              style={{ backgroundColor: balloon.color }}
            ></div>
          </div>
        </div>
      ))}

      {/* Pump and Settings */}
      <div className="absolute bottom-8 right-8 flex items-end">
        {/* Settings Panel */}
        {showSettings && (
          <div className="absolute bottom-full mb-4 right-0 w-64 bg-white rounded-lg shadow-xl p-4">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Balloon Generation Speed
                </label>
                <input
                  type="range"
                  min="500"
                  max="3000"
                  step="100"
                  value={settings.generationSpeed}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      generationSpeed: parseInt(e.target.value),
                    }))
                  }
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="text-xs text-gray-500 mt-1">{settings.generationSpeed}ms</div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Floating Speed
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="3"
                  step="0.1"
                  value={settings.floatingSpeed}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      floatingSpeed: parseFloat(e.target.value),
                    }))
                  }
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="text-xs text-gray-500 mt-1">x{settings.floatingSpeed}</div>
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">Auto Pump</label>
                <button
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                    settings.isAutoPump ? 'bg-teal-500' : 'bg-gray-300'
                  }`}
                  onClick={() =>
                    setSettings((prev) => ({
                      ...prev,
                      isAutoPump: !prev.isAutoPump,
                    }))
                  }
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.isAutoPump ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="w-32 h-40 bg-teal-500 rounded-lg relative shadow-xl">
          <button
            className="absolute top-1/4 left-1/2 -translate-x-1/2 w-16 h-16 bg-white rounded-full flex items-center justify-center !rounded-button hover:bg-gray-100 transition-colors"
            onClick={() => setShowSettings(!showSettings)}
          >
            <i className="fas fa-cog text-teal-500 text-2xl"></i>
          </button>
          <button
            className="absolute -top-12 left-1/2 -translate-x-1/2 w-8 h-24 bg-purple-600 cursor-pointer !rounded-button"
            onMouseDown={inflateBalloon}
            onMouseUp={stopInflating}
            onMouseLeave={stopInflating}
            onTouchStart={inflateBalloon}
            onTouchEnd={stopInflating}
            disabled={settings.isAutoPump}
          >
            <div className="w-full h-8 bg-purple-800 rounded-t-lg"></div>
          </button>
        </div>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-4 left-4 bg-white bg-opacity-90 rounded-xl p-4 shadow-lg">
        <p className="text-gray-700">
          Click and hold the pump handle to create balloons!<br />
          Pop the balloons by clicking them to score points!
        </p>
      </div>
    </div>
  );
};

export default Game;