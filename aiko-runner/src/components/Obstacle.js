import React from 'react';
import './Obstacle.css';

const Obstacle = ({ x, type }) => {
  // Choose class based on type
  const obstacleClass = `obstacle obstacle-type-${type}`;
  return (
    <div
      className={obstacleClass}
      style={{ left: `${x}px` }}
    />
  );
};

export default Obstacle;