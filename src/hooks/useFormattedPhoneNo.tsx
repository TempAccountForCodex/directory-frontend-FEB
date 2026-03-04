import { useState, useEffect } from "react";

const useFormattedPhoneNo = (
  number: string | number | null | undefined,
): string => {
  const [formattedNumber, setFormattedNumber] = useState<string>("");

  useEffect(() => {
    if (number) {
      const formatPhoneNumber = (num: string | number): string => {
        const numberString = num.toString();
        return numberString.replace(/(\d{3})(\d{3})(\d{4})/, "($1)$2-$3");
      };
      setFormattedNumber(formatPhoneNumber(number));
    } else {
      setFormattedNumber("no number available");
    }
  }, [number]);

  return formattedNumber;
};

export default useFormattedPhoneNo;
