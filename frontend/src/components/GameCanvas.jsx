import React, { useEffect, useRef } from 'react';
import BetBox from './BetBox';

function GameCanvas({
  currentMarket,
  currentPrice,
  midLineY,
  scaleCenterPrice,
  pixelsPerPrice,
  allBoxes,
  onCanvasClick,
  onCenterClick,
        priceScaleInner,
        drawTicks,
}) {
  const canvasRef = useRef(null);
  const greenBarRef = useRef(null);
  const redBarRef = useRef(null);
  const midLineRef = useRef(null);
  const topShadowRef = useRef(null);
  const leftPriceTagRef = useRef(null);
  const rightPriceTagRef = useRef(null);
  const displayedPriceRef = useRef(currentPrice);

  useEffect(() => {
    if (priceScaleInner && priceScaleInner.current) {
      drawTicks();
    }
  }, [drawTicks, priceScaleInner, scaleCenterPrice, pixelsPerPrice]);

  useEffect(() => {
    const greenH = Math.max(0, midLineY);
    const redH = Math.max(0, 400 - midLineY);

    if (greenBarRef.current) {
      greenBarRef.current.setAttribute("y", 0);
      greenBarRef.current.setAttribute("height", greenH);
    }
    if (redBarRef.current) {
      redBarRef.current.setAttribute("y", midLineY);
      redBarRef.current.setAttribute("height", redH);
    }
    if (midLineRef.current) {
      midLineRef.current.setAttribute("y1", midLineY);
      midLineRef.current.setAttribute("y2", midLineY);
    }
    if (topShadowRef.current) {
      topShadowRef.current.setAttribute("y1", midLineY - 30);
      topShadowRef.current.setAttribute("y2", midLineY - 30);
    }
    if (leftPriceTagRef.current) {
      leftPriceTagRef.current.style.top = midLineY - 8 + "px";
    }
    if (rightPriceTagRef.current) {
      rightPriceTagRef.current.style.top = midLineY - 8 + "px";
    }
  }, [midLineY]);

  useEffect(() => {
    const interval = setInterval(() => {
      const oldDisplayPrice = displayedPriceRef.current;
      const targetPrice = currentPrice;
      const diff = targetPrice - displayedPriceRef.current;
      displayedPriceRef.current += diff * 0.2;

      const newPrice = displayedPriceRef.current;
      if (leftPriceTagRef.current) {
        leftPriceTagRef.current.textContent = "$" + newPrice.toFixed(4);
      }
      if (rightPriceTagRef.current) {
        rightPriceTagRef.current.textContent = "$" + newPrice.toFixed(4);
      }

      if (newPrice > oldDisplayPrice) {
        if (leftPriceTagRef.current) leftPriceTagRef.current.style.color = "#96FF2C";
        if (rightPriceTagRef.current) rightPriceTagRef.current.style.color = "#96FF2C";
      } else if (newPrice < oldDisplayPrice) {
        if (leftPriceTagRef.current) leftPriceTagRef.current.style.color = "#f948aa";
        if (rightPriceTagRef.current) rightPriceTagRef.current.style.color = "#f948aa";
      } else {
        if (leftPriceTagRef.current) leftPriceTagRef.current.style.color = "white";
        if (rightPriceTagRef.current) rightPriceTagRef.current.style.color = "white";
      }
    }, 50);

    return () => clearInterval(interval);
  }, [currentPrice]);

  const handleCanvasClick = (e) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const scaleX = 375 / rect.width;
    const scaleY = 400 / rect.height;
    const svgX = x * scaleX;
    const svgY = y * scaleY;

    const isInGreenArea = svgY < midLineY;
    const isInRedArea = svgY > midLineY;

    if (svgX >= 0 && svgX <= 315) {
      if (isInGreenArea) {
        onCanvasClick(svgX, svgY, "long");
      } else if (isInRedArea) {
        onCanvasClick(svgX, svgY, "short");
      }
    }
  };

  const currentMarketBoxes = allBoxes.filter((box) => box.market === currentMarket && !box.settled);

  return (
    <div className="game-container">
      <div className="price-scale">
        <div className="price-scale-inner" ref={(el) => {
          if (priceScaleInner && priceScaleInner.current !== el) {
            priceScaleInner.current = el;
          }
        }} id="priceScaleInner"></div>
      </div>

      <button className="center-button" id="centerButton" onClick={onCenterClick} title="Center Mid-line">
        ⊙
      </button>

      <svg
        ref={canvasRef}
        className="game-canvas"
        id="gameCanvas"
        viewBox="0 0 375 400"
        width="375"
        height="400"
        onClick={handleCanvasClick}
      >
        <rect x="0" y="0" width="315" height="400" fill="#0D1117" />
        <rect x="315" y="0" width="60" height="400" fill="#2A2A2A" />
        <rect ref={greenBarRef} id="greenBar" x="0" y="0" width="315" height="200" fill="#96FF2C" opacity="0.7" />
        <rect ref={redBarRef} id="redBar" x="0" y="200" width="315" height="200" fill="#f948aa" opacity="0.7" />
        <line ref={midLineRef} id="midLine" x1="0" y1="200" x2="375" y2="200" stroke="white" strokeWidth="2" />

        <g id="checkeredLine">
          {Array.from({ length: 20 }).map((_, i) => (
            <rect
              key={i}
              x="313"
              y={i * 20}
              width="5"
              height="20"
              fill={i % 2 === 0 ? "black" : "white"}
            />
          ))}
        </g>

        <line
          ref={topShadowRef}
          id="topShadow"
          x1="0"
          y1="170"
          x2="375"
          y2="170"
          stroke="#000"
          strokeWidth="1"
          opacity="0.25"
          filter="url(#softBlur)"
        />

        <line
          id="leftShadow"
          x1="5"
          y1="0"
          x2="5"
          y2="400"
          stroke="#000"
          strokeWidth="3"
          opacity="0.18"
          filter="url(#softBlur)"
        />

        <defs>
          <filter id="softBlur" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2" />
          </filter>
        </defs>
      </svg>

      <div className="price-tag left" ref={leftPriceTagRef} id="leftPriceTag">
        ${currentPrice.toFixed(4)}
      </div>
      <div className="price-tag right" ref={rightPriceTagRef} id="rightPriceTag">
        ${currentPrice.toFixed(4)}
      </div>

      {currentMarketBoxes.map((box) => (
        <BetBox key={box.id} box={box} />
      ))}
    </div>
  );
}

export default GameCanvas;

