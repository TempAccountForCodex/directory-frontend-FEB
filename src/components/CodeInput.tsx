import { useState, useRef } from "react";
import type { ChangeEvent, KeyboardEvent } from "react";
import { Box, TextField } from "@mui/material";
import { styled } from "@mui/material/styles";

const CodeDigitField = styled(TextField)(({ theme }) => ({
  width: "3rem",
  "& .MuiOutlinedInput-root": {
    color: "#ffffff",
    "& fieldset": {
      borderColor: "rgba(255, 255, 255, 0.23)",
    },
    "&:hover fieldset": {
      borderColor: "rgba(255, 255, 255, 0.4)",
    },
    "&.Mui-focused fieldset": {
      borderColor: "#378C92",
    },
  },
  "& input": {
    textAlign: "center",
    fontSize: "1.5rem",
    fontWeight: 600,
    padding: theme.spacing(1.5),
  },
}));

interface CodeInputProps {
  value: string;
  onChange: (code: string) => void;
  onComplete?: (code: string) => void;
  disabled?: boolean;
  error?: boolean;
}

const CodeInput = ({
  value,
  onChange,
  onComplete,
  disabled = false,
  error = false,
}: CodeInputProps) => {
  const [digits, setDigits] = useState<string[]>(
    value.split("").concat(Array(6 - value.length).fill("")),
  );
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, e: ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;

    // Only allow numeric input
    if (!/^\d*$/.test(newValue)) {
      return;
    }

    const newDigits = [...digits];

    // Handle paste
    if (newValue.length > 1) {
      const pastedDigits = newValue.slice(0, 6).split("");
      for (let i = 0; i < pastedDigits.length && index + i < 6; i++) {
        newDigits[index + i] = pastedDigits[i];
      }
      setDigits(newDigits);
      const code = newDigits.join("");
      onChange(code);

      // Focus on next empty field or last field
      const nextIndex = Math.min(index + pastedDigits.length, 5);
      inputRefs.current[nextIndex]?.focus();

      // Check if complete
      if (code.length === 6 && onComplete) {
        onComplete(code);
      }
      return;
    }

    // Handle single digit input
    newDigits[index] = newValue;
    setDigits(newDigits);
    const code = newDigits.join("");
    onChange(code);

    // Auto-advance to next field
    if (newValue && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Check if complete
    if (code.length === 6 && onComplete) {
      onComplete(code);
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    // Backspace: clear current digit and move to previous
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      const newDigits = [...digits];
      newDigits[index - 1] = "";
      setDigits(newDigits);
      onChange(newDigits.join(""));
      inputRefs.current[index - 1]?.focus();
    }

    // Left arrow: move to previous
    if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }

    // Right arrow: move to next
    if (e.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleFocus = (index: number) => {
    // Select the content when focused for easier editing
    inputRefs.current[index]?.select();
  };

  return (
    <Box sx={{ display: "flex", gap: 1, justifyContent: "center" }}>
      {digits.map((digit, index) => (
        <CodeDigitField
          key={index}
          inputRef={(el) => (inputRefs.current[index] = el)}
          value={digit}
          onChange={(e) =>
            handleChange(index, e as ChangeEvent<HTMLInputElement>)
          }
          onKeyDown={(e) =>
            handleKeyDown(index, e as KeyboardEvent<HTMLInputElement>)
          }
          onFocus={() => handleFocus(index)}
          disabled={disabled}
          error={error}
          inputProps={{
            maxLength: 1,
            inputMode: "numeric",
            pattern: "[0-9]*",
            autoComplete: "off",
          }}
        />
      ))}
    </Box>
  );
};

export default CodeInput;
