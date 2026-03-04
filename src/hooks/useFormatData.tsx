import { useState, useEffect } from "react";

/* ---------------- Hook ---------------- */
const useFormatData = (data?: string): string[] => {
  const [formattedData, setFormattedData] = useState<string[]>([]);

  useEffect(() => {
    if (data) {
      // Use a regular expression to split based on hyphens, bullets, or dots
      const formatted = data
        .split(/\s*[-•]\s*/)
        .filter((item) => item.trim() !== "")
        .map((item) => item.trim());

      setFormattedData(formatted);
    }
  }, [data]);

  return formattedData;
};

export default useFormatData;
