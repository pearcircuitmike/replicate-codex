import React, { useEffect, useState, useRef } from "react";
import { Stat, StatLabel } from "@chakra-ui/react";

// Counter component just for animating the numbers
const Counter = ({ start, end }) => {
  const [count, setCount] = useState(start);
  const countRef = useRef();

  useEffect(() => {
    let observer;
    let started = false;

    const countUp = () => {
      const startTime = performance.now();
      const duration = 2000;

      const step = (currentTime) => {
        const elapsedTime = currentTime - startTime;
        const progress = Math.min(elapsedTime / duration, 1);
        const currentCount = Math.floor(progress * (end - start) + start);
        setCount(currentCount);

        if (progress < 1) {
          requestAnimationFrame(step);
        }
      };

      requestAnimationFrame(step);
    };

    observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !started) {
          started = true;
          countUp();
        }
      },
      { threshold: 0.5 }
    );

    if (countRef.current) {
      observer.observe(countRef.current);
    }

    return () => observer?.disconnect();
  }, [end, start]);

  return (
    <div ref={countRef} className="text-4xl font-bold">
      {count.toLocaleString()}
    </div>
  );
};

// Main component that handles data fetching and displays the stats
const StatsDisplay = ({ label }) => {
  const [stats, setStats] = useState({
    weeklyPapersCount: 0,
    weeklySummariesCount: 0,
    dailyReaders: 0,
    weeklySignups: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/stats/get-overall-stats");
        if (!response.ok) throw new Error("Failed to fetch stats");
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (isLoading) {
    return <div className="animate-pulse h-16 bg-gray-200 rounded" />;
  }

  return (
    <Stat>
      <Counter start={0} end={stats.weeklyPapersCount} />
      <StatLabel>{label}</StatLabel>
    </Stat>
  );
};

export default StatsDisplay;
