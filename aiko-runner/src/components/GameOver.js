import React, { useEffect } from 'react';
import { Howl } from 'howler';

const gameOverSound = new Howl({ src: ['sounds/GameOver.mp3'] });

const GameOver = ({ onRestart }) => {
  // Play sound only once when the component mounts
  useEffect(() => {
    gameOverSound.play();
  }, []);

  return (
    <div className="game-over">
      <h2>Game Over 💥</h2>
      <button onClick={onRestart}>Restart</button>
    </div>
  );
};

export default GameOver;