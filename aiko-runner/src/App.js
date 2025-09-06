import React, { useState, useEffect, useRef } from 'react'; // Import useRef
import axios from 'axios'; // Import axios
import AikoRunner from './components/AikoRunner';
import Obstacle from './components/Obstacle';
import GameOver from './components/GameOver';
import './App.css';

// Define obstacle properties, including their different widths
const OBSTACLE_CONFIG = {
  1: { width: 140, height: 160 }, // Obstacle1.png
  2: { width: 100, height: 120 }  // Obstacle2.png
};

function App() {
  const [obstacles, setObstacles] = useState([]);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0); // State for high score
  const [aikoY, setAikoY] = useState(20);
  const [aikoX, setAikoX] = useState(50);
  const [gameOver, setGameOver] = useState(false);

  // Use a ref to track aiko's position inside the game loop without causing re-renders
  const aikoXRef = useRef(aikoX);
  useEffect(() => {
    aikoXRef.current = aikoX;
  }, [aikoX]);

  // Fetch high score on initial load
  useEffect(() => {
    axios.get('https://localhost:7163/api/score')
      .then(res => setHighScore(res.data))
      .catch(err => console.error("Could not fetch high score:", err));
  }, []);

  // --- FIX: Refactored Game Loop ---
  useEffect(() => {
    if (gameOver) return;

    const gameInterval = setInterval(() => {
      // Perform all obstacle logic in one state update
      setObstacles(prevObstacles => {
        // 1. Move obstacles
        const movedObstacles = prevObstacles.map(obs => ({
          ...obs,
          x: obs.x - 5 // Speed of obstacles
        }));

        // 2. Check for scoring using the up-to-date ref
        movedObstacles.forEach(obs => {
          if (!obs.scored && obs.x + obs.width < aikoXRef.current) {
            obs.scored = true;
            setScore(s => s + 1);
          }
        });

        // 3. Filter out off-screen obstacles
        let updatedObstacles = movedObstacles.filter(obs => obs.x > -200);

        // 4. Spawn new obstacles
        const lastObstacle = updatedObstacles[updatedObstacles.length - 1];
        if (!lastObstacle || lastObstacle.x < window.innerWidth - 500) {
          const newObstacleType = Math.random() < 0.5 ? 1 : 2;
          updatedObstacles.push({
            id: Date.now(),
            x: window.innerWidth,
            type: newObstacleType,
            width: OBSTACLE_CONFIG[newObstacleType].width,
            height: OBSTACLE_CONFIG[newObstacleType].height,
            scored: false
          });
        }
        return updatedObstacles;
      });
    }, 30);

    return () => clearInterval(gameInterval);
  }, [gameOver]); // The loop only depends on the gameOver state

  // Collision detection
  useEffect(() => {
    if (gameOver) return; // Don't check for collisions if game is already over

    const aikoHitbox = { width: 50, height: 100, paddingX: 45 };
    const aikoLeft = aikoX + aikoHitbox.paddingX;
    const aikoRight = aikoLeft + aikoHitbox.width;
    const aikoBottom = aikoY;

    for (const obs of obstacles) {
      const isHorizontallyOverlapping = aikoRight > obs.x && aikoLeft < obs.x + obs.width;
      const isVerticallyOverlapping = aikoBottom < 20 + obs.height;

      if (isHorizontallyOverlapping && isVerticallyOverlapping) {
        setGameOver(true);
        // Post final score to the backend
        axios.post('https://localhost:7163/api/score', { score })
          .then(res => setHighScore(res.data))
          .catch(err => console.error("Could not post score:", err));
        return; // Exit after first collision
      }
    }
  }, [obstacles, aikoX, aikoY, gameOver, score]); // Add gameOver and score to dependencies

  const handleRestart = () => {
    setScore(0);
    setObstacles([]);
    setGameOver(false);
    setAikoY(20);
    setAikoX(50);
  };

  return (
    <div className="game-container">
      {/* Display Score and High Score */}
      <div className="score-container">
        <h1>Score: {score}</h1>
        <h2>High Score: {highScore}</h2>
      </div>
      {gameOver ? (
        <GameOver onRestart={handleRestart} />
      ) : (
        <>
          <AikoRunner setY={setAikoY} setX={setAikoX} gameOver={gameOver} />
          {obstacles.map(obs => (
            <Obstacle key={obs.id} x={obs.x} type={obs.type} />
          ))}
        </>
      )}
    </div>
  );
}

export default App;