import React, { useState, useRef, useEffect } from "react";
import { StatNumber } from "@chakra-ui/react";

const Counter = ({ start, end }) => {
  const [count, setCount] = useState(start);
  const countRef = useRef();
  const animationRef = useRef();
  const startTimeRef = useRef();

  useEffect(() => {
    const animate = (currentTime) => {
      if (!startTimeRef.current) {
        startTimeRef.current = currentTime;
      }

      const elapsedTime = currentTime - startTimeRef.current;
      const duration = 2000; // 2 seconds
      const progress = Math.min(elapsedTime / duration, 1);
      const currentCount = Math.floor(progress * (end - start) + start);

      setCount(currentCount);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    const startAnimation = () => {
      startTimeRef.current = null;
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      animationRef.current = requestAnimationFrame(animate);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          startAnimation();
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );

    if (countRef.current) {
      observer.observe(countRef.current);
    }

    return () => {
      observer.disconnect();
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [end, start]);

  return (
    <StatNumber ref={countRef} fontSize="4xl" color="red.500">
      {count.toLocaleString()}
    </StatNumber>
  );
};

Counter.displayName = "Counter";

export default React.memo(Counter);
