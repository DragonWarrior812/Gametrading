import { useState, useEffect, useRef, useCallback } from 'react';

const FEEDS = {
  ETH: "0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace",
  SOL: "0xef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d",
  BTC: "0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43",
};

const TIMEFRAMES = {
  "10s": 10,
  "30s": 30,
  "10m": 600,
  "30m": 1800,
  "1h": 3600,
};

export function useTradingGame() {
  const [balance, setBalance] = useState(0);
  const [stake, setStake] = useState(5);
  const [currentMarket, setCurrentMarket] = useState("ETH");
  const [currentTimeframe, setCurrentTimeframe] = useState("10s");
  const [currentPrice, setCurrentPrice] = useState(2500.0);
  const [playerCount, setPlayerCount] = useState(0);
  const [allBoxes, setAllBoxes] = useState([]);
  const [midLineY, setMidLineY] = useState(200);
  const [scaleCenterPrice, setScaleCenterPrice] = useState(2500.0);
  const [pixelsPerPrice, setPixelsPerPrice] = useState(9);
  const [players, setPlayers] = useState([]);
  const [toasts, setToasts] = useState([]);

  const priceUpdateIntervalRef = useRef(null);
  const displayUpdateIntervalRef = useRef(null);
  const gameLoopIdRef = useRef(null);
  const animationTimeRef = useRef(0);
  const lastScaleUpdateRef = useRef(0);
  const displayedPriceRef = useRef(2500.0);
  const priceScaleInnerRef = useRef(null);
  const toastIdCounterRef = useRef(0);

  const getPricePerPixel = useCallback((market = currentMarket) => {
    const zooms = {
      ETH: 9,
      SOL: 9,
      BTC: 3,
    };
    return zooms[market] || 1;
  }, [currentMarket]);

  const handleMarketChange = useCallback(async (market) => {
    setCurrentMarket(market);
    
    // Get the real price before showing anything
    let price = null;
    try {
      const id = FEEDS[market];
      // Use backend proxy to avoid CORS issues
      const url = `/api/pyth-price?id=${id}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data && data[0] && data[0].price) {
        const p = data[0].price;
        price = Number(p.price) * Math.pow(10, Number(p.expo));
      }
    } catch (e) {
      console.warn("Price fetch failed, fallback used.", e);
    }

    // Fallback if API fails
    if (!price || isNaN(price)) {
      const basePrices = { SOL: 150, ETH: 2500, BTC: 65000 };
      price = basePrices[market];
    }

    // Apply instantly once real price known
    setCurrentPrice(price);
    setScaleCenterPrice(price);
    setPixelsPerPrice(getPricePerPixel(market));
  }, [getPricePerPixel]);

  const fetchRealPrice = useCallback(async (market) => {
    try {
      const id = FEEDS[market];
      // Use backend proxy to avoid CORS issues
      const url = `/api/pyth-price?id=${id}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data && data[0] && data[0].price) {
        const p = data[0].price;
        const price = Number(p.price) * Math.pow(10, Number(p.expo));
        if (currentMarket === market) {
          setCurrentPrice(price);
        }
        return price;
      }
      return currentPrice;
    } catch (e) {
      console.warn("Pyth fetch failed", e);
      return currentPrice;
    }
  }, [currentMarket, currentPrice]);

  const showToast = useCallback((title, amount, isWin) => {
    // Generate unique ID using counter + timestamp + random to avoid duplicates
    toastIdCounterRef.current += 1;
    const toast = { 
      id: `toast-${Date.now()}-${toastIdCounterRef.current}-${Math.random().toString(36).substr(2, 9)}`, 
      title, 
      amount, 
      isWin 
    };
    setToasts((prev) => {
      const newToasts = [...prev, toast];
      return newToasts.slice(-3);
    });
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== toast.id));
    }, 3000);
  }, []);

  const updateBalanceDisplay = useCallback(() => {
    // Balance is managed by state, no need for separate display update
  }, []);

  const placeBet = useCallback((x, y, side) => {
    const timeframeInSeconds = TIMEFRAMES[currentTimeframe] || 60;
    if(balance - stake < 0){
      showToast("BALANCE_LOW", "Balance is low", false);
      return;
    }
    const now = Date.now();
    const box = {
      id: Date.now() + Math.random(),
      x: 0,
      y: y - 10,
      stake: stake,
      side: side,
      entryPrice: currentPrice,
      timeframe: currentTimeframe,
      duration: timeframeInSeconds,
      startTime: now,
      endTime: now + timeframeInSeconds * 1000,
      settled: false,
      market: currentMarket,
    };
    setAllBoxes((prev) => [...prev, box]);
  }, [currentTimeframe, stake, currentPrice, currentMarket]);

  const updateBoxes = useCallback(() => {
    setAllBoxes((prevBoxes) => {
      return prevBoxes.map((box) => {
        if (box.settled) return box;

        const isMobile = window.innerWidth <= 768;
        const canvasWidth = isMobile ? 315 * 0.7 : 315;
        const totalDistance = canvasWidth * 0.79;
        const timeframeInSeconds = TIMEFRAMES[box.timeframe] || 60;
        const pixelsPerSecond = totalDistance / timeframeInSeconds;

        if (!box.startTime) box.startTime = Date.now();
        const elapsed = (Date.now() - box.startTime) / 1000;
        const distanceTraveled = elapsed * pixelsPerSecond;
        const newX = Math.min(distanceTraveled, totalDistance);

        const now = Date.now();
        const remainingMs = Math.max(0, (box.endTime || box.startTime + timeframeInSeconds * 1000) - now);

        if (newX >= totalDistance || now >= (box.endTime || box.startTime + timeframeInSeconds * 1000)) {
          let won = false;
          if (box.side === "long") {
            won = currentPrice > box.entryPrice;
          } else if (box.side === "short") {
            won = currentPrice < box.entryPrice;
          }

          const stakeAmount = box.stake;
          if (won) {
            setBalance((prev) => prev + stakeAmount);
            showToast("CREDITED", "+" + stakeAmount.toFixed(2), true);
          } else {
            setBalance((prev) => prev - stakeAmount);
            showToast("DEBITED", "-" + stakeAmount.toFixed(2), false);
          }

          setTimeout(() => {
            setAllBoxes((prev) => prev.filter((b) => b.id !== box.id));
          }, 1000);

          return { ...box, settled: true, x: newX, won };
        }

        return { ...box, x: newX };
      });
    });
  }, [currentPrice, showToast]);

  const drawTicks = useCallback(() => {
    const inner = priceScaleInnerRef.current;
    if (!inner) return;
    inner.innerHTML = "";
    const stepPx = 40;
    const stepPrice = stepPx / pixelsPerPrice;
    const ticksEachSide = Math.ceil(400 / stepPx) + 2;
    const centerY = 200;
    const yOffset = stepPx / 2;

    for (let i = -ticksEachSide; i <= ticksEachSide; i++) {
      const y = centerY - i * stepPx + yOffset;
      const price = scaleCenterPrice + i * stepPrice;

      const line = document.createElement("div");
      line.className = `price-tick-line ${i % 2 === 0 ? "major" : ""}`;
      line.style.position = "absolute";
      line.style.left = "0";
      line.style.right = "0";
      line.style.height = "1px";
      line.style.top = `${y}px`;
      inner.appendChild(line);

      const lab = document.createElement("div");
      lab.className = `price-tick ${i % 2 === 0 ? "major" : ""}`;
      lab.style.position = "absolute";
      lab.style.left = "6px";
      lab.style.top = `${y - 8}px`;
      lab.textContent = price.toFixed(4);
      inner.appendChild(lab);
    }
  }, [scaleCenterPrice, pixelsPerPrice]);

  const updatePriceScale = useCallback(() => {
    const now = Date.now();
    if (now - lastScaleUpdateRef.current < 200) return;

    const centerY = 200;
    const priceOffset = currentPrice - scaleCenterPrice;
    const pixelOffset = priceOffset * pixelsPerPrice;
    const thresholdPx = 400 / 2.5;

    if (Math.abs(pixelOffset) > thresholdPx) {
      setScaleCenterPrice(currentPrice);
      lastScaleUpdateRef.current = now;
    }
  }, [currentPrice, scaleCenterPrice, pixelsPerPrice]);

  const centerMidLine = useCallback(() => {
    setMidLineY(200);
    setScaleCenterPrice(currentPrice);
  }, [currentPrice]);

  const startMockUpdates = useCallback(() => {
    if (priceUpdateIntervalRef.current) clearInterval(priceUpdateIntervalRef.current);
    if (displayUpdateIntervalRef.current) clearInterval(displayUpdateIntervalRef.current);

    priceUpdateIntervalRef.current = setInterval(() => {
      fetchRealPrice(currentMarket).catch(() => {});
    }, 400);

    displayUpdateIntervalRef.current = setInterval(() => {
      const oldDisplayPrice = displayedPriceRef.current;
      const targetPrice = currentPrice;
      const diff = targetPrice - displayedPriceRef.current;
      displayedPriceRef.current += diff * 0.2;
    }, 50);

    // setInterval(() => {
    //   setPlayerCount((prev) => Math.max(1, prev + Math.floor(Math.random() * 3) - 1));
    // }, 2000);
  }, [currentMarket, currentPrice, fetchRealPrice]);

  const renderPlayers = useCallback(() => {
    // Players are managed by state, rendering happens in component
  }, []);

  useEffect(() => {
    setPixelsPerPrice(getPricePerPixel());
  }, [currentMarket, getPricePerPixel]);

  useEffect(() => {
    const animate = () => {
      animationTimeRef.current += 1;
      const centerY = 200;
      const priceOffset = currentPrice - scaleCenterPrice;
      const pixelOffset = priceOffset * pixelsPerPrice;
      const targetY = centerY - pixelOffset;
      const distance = Math.abs(targetY - midLineY);
      const smoothing = distance > 50 ? 0.5 : 0.3;
      setMidLineY((prev) => {
        const newY = prev + (targetY - prev) * smoothing;
        return Math.max(0, Math.min(400, newY));
      });
      document.documentElement.style.setProperty("--midY", midLineY);
      gameLoopIdRef.current = requestAnimationFrame(animate);
    };
    gameLoopIdRef.current = requestAnimationFrame(animate);
    return () => {
      if (gameLoopIdRef.current) cancelAnimationFrame(gameLoopIdRef.current);
    };
  }, [currentPrice, scaleCenterPrice, pixelsPerPrice, midLineY]);

  useEffect(() => {
    const interval = setInterval(() => {
      updateBoxes();
    }, 16); // ~60fps
    return () => clearInterval(interval);
  }, [updateBoxes]);

  useEffect(() => {
    const interval = setInterval(() => {
      updatePriceScale();
    }, 200);
    return () => clearInterval(interval);
  }, [updatePriceScale]);

  useEffect(() => {
    drawTicks();
  }, [drawTicks, scaleCenterPrice, pixelsPerPrice]);

  useEffect(() => {
    return () => {
      if (priceUpdateIntervalRef.current) clearInterval(priceUpdateIntervalRef.current);
      if (displayUpdateIntervalRef.current) clearInterval(displayUpdateIntervalRef.current);
      if (gameLoopIdRef.current) cancelAnimationFrame(gameLoopIdRef.current);
    };
  }, []);

  return {
    balance,
    stake,
    currentMarket,
    currentTimeframe,
    currentPrice,
    playerCount,
    allBoxes,
    midLineY,
    scaleCenterPrice,
    pixelsPerPrice,
    priceScaleInner: priceScaleInnerRef,
    players,
    toasts,
    setStake,
    setCurrentMarket: handleMarketChange,
    setCurrentTimeframe,
    setBalance,
    setPlayerCount,
    showToast,
    showDepositModal: () => {},
    showWithdrawModal: () => {},
    setShowDepositModal: () => {},
    setShowWithdrawModal: () => {},
    centerMidLine,
    placeBet,
    updateBoxes,
    updatePriceScale,
    drawTicks,
    fetchRealPrice,
    startMockUpdates,
    //initializePlayers,
    renderPlayers,
  };
}

