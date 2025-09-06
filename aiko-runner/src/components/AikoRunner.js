import React, { useEffect, useState, useCallback } from 'react';
import { Howl } from 'howler';
import './AikoRunner.css';

// Fix sound path (no leading slash if in public/sounds)
const jumpSound = new Howl({ src: ['sounds/jump.mp3'] });

const AikoRunner = ({ setY, setX, gameOver }) => { // Add gameOver prop
  const [frame, setFrame] = useState(0);
  const [yPos, setYPos] = useState(20); // bottom position in px
  const [velocity, setVelocity] = useState(0);
  const [jumpCount, setJumpCount] = useState(0); // State for double jump
  const [left, setLeft] = useState(50); // horizontal position

  // --- FIX: Sprite sheet details updated for smaller size ---
  const totalFrames = 10;
  const columns = 5;
  const frameWidth = 140;  // 50% of 280
  const frameHeight = 193; // 50% of 385

  // --- FIX: Adjusted jump physics for a higher, longer jump ---
  const gravity = 0.7;
  const jumpStrength = 23;

  // Animate running frames and horizontal movement
  useEffect(() => {
    if (gameOver) return; // Stop running when game is over

    const interval = setInterval(() => {
      setFrame(prev => (prev + 1) % totalFrames);
      setLeft(prev => {
        const newLeft = prev + 10;
        if (newLeft + frameWidth > window.innerWidth) {
          if (setX) setX(50);
          return 50;
        }
        if (setX) setX(newLeft);
        return newLeft;
      });
    }, 80);
    return () => clearInterval(interval);
  }, [setX, gameOver]); // Rerun if gameOver status changes

  // Handle jump physics
  useEffect(() => {
    if (gameOver) return; // Stop physics when game is over

    let animation;
    const loop = () => {
      setYPos(prevY => {
        let newY = prevY + velocity;
        if (newY <= 20) { // landed
          newY = 20;
          setJumpCount(0); // RESET jump count on landing
          setVelocity(0);
        } else {
          setVelocity(v => v - gravity);
        }
        if (setY) setY(newY);
        return newY;
      });
      animation = requestAnimationFrame(loop);
    };
    animation = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animation);
  }, [velocity, setY, gravity, gameOver]); // Rerun if gameOver status changes

  // --- FIX: Keyboard and Click jump listener ---
  useEffect(() => {
    const handleJump = () => {
      // Use the functional form of setState to get the latest jumpCount
      setJumpCount(currentJumpCount => {
        if (currentJumpCount < 2 && !gameOver) {
          setVelocity(jumpStrength);
          jumpSound.play();
          return currentJumpCount + 1; // Return the new jump count
        }
        return currentJumpCount; // Otherwise, keep it the same
      });
    };

    const onKeyDown = (e) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        handleJump();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    // Also add a click listener to the whole window for mobile/mouse users
    window.addEventListener('click', handleJump);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('click', handleJump);
    };
  }, [gameOver, jumpStrength]); // Re-run only if gameOver or jumpStrength changes

  // Calculate sprite sheet position
  const col = frame % columns;
  const row = Math.floor(frame / columns);

  return (
    <div
      className="aiko-runner"
      style={{
        backgroundPosition: `-${col * frameWidth}px -${row * frameHeight}px`,
        bottom: `${yPos}px`,
        left: `${left}px`
      }}
    />
  );
};

export default AikoRunner;