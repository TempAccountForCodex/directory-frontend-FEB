import { useState, useEffect } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Alert,
  IconButton,
  InputAdornment,
  Divider,
  Tabs,
  Tab,
  Checkbox,
  FormControlLabel,
  CircularProgress,
  useMediaQuery,
  useTheme as useMuiTheme,
} from "@mui/material";
import { styled, keyframes } from "@mui/material/styles";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import StorefrontIcon from "@mui/icons-material/Storefront";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CodeInput from "../components/CodeInput";
import { ResendLink } from "../components/auth/ResendLink";
import { useResendTimer } from "../hooks/useResendTimer";
import WhiteLogo from "/assets/images/header/WhiteLogo.png";

const star = "/assets/publicAssets/images/common/star.svg";
const darkhole = "assets/publicAssets/images/common/darkhole.svg";

// Subtle floating animation for particles
const float = keyframes`
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-20px);
  }
`;

const pulse = keyframes`
  0%, 100% {
    opacity: 0.4;
  }
  50% {
    opacity: 0.6;
  }
`;

const PageContainer = styled(Box)(({ theme }) => ({
  minHeight: "100vh",
  display: "flex",
  backgroundColor: "#041e18",
  position: "relative",
  overflow: "hidden",
  backgroundImage: `url(${star})`,
  backgroundPosition: "center",
  backgroundRepeat: "no-repeat",
  backgroundSize: "cover",
}));

const LeftPanel = styled(Box)(({ theme }) => ({
  flex: 1,
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  justifyContent: "center",
  padding: theme.spacing(8, 10),
  position: "relative",
  zIndex: 1,
  [theme.breakpoints.down("lg")]: {
    padding: theme.spacing(6, 6),
  },
  [theme.breakpoints.down("md")]: {
    display: "none",
  },
}));

const HeroContent = styled(Box)(({ theme }) => ({
  maxWidth: "540px",
  width: "100%",
}));

const RightPanel = styled(Box)(({ theme }) => ({
  flex: 1,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: theme.spacing(4),
  position: "relative",
  zIndex: 1,
  [theme.breakpoints.down("md")]: {
    flex: "auto",
    width: "100%",
    padding: theme.spacing(3, 2),
  },
}));

const AuthCard = styled(Box)(({ theme }) => ({
  background: "rgba(15, 15, 22, 0.92)",
  backdropFilter: "blur(24px) saturate(180%)",
  WebkitBackdropFilter: "blur(24px) saturate(180%)",
  borderRadius: "20px",
  padding: theme.spacing(5, 4),
  maxWidth: "500px",
  width: "100%",
  border: "1px solid rgba(55, 140, 146, 0.12)",
  boxShadow: `
    0 20px 60px rgba(0, 0, 0, 0.6),
    0 0 0 1px rgba(55, 140, 146, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.02)
  `,
  position: "relative",
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: "10%",
    right: "10%",
    height: "1px",
    background:
      "linear-gradient(90deg, transparent, rgba(55, 140, 146, 0.3), transparent)",
  },
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(4, 3),
    borderRadius: "16px",
  },
}));

const StyledTabs = styled(Tabs)(({ theme }) => ({
  marginBottom: theme.spacing(4),
  minHeight: 48,
  "& .MuiTabs-indicator": {
    backgroundColor: "#378C92",
    height: 2,
    borderRadius: "2px 2px 0 0",
  },
}));

const StyledTab = styled(Tab)(({ theme }) => ({
  flex: 1,
  fontSize: "15px",
  fontWeight: 600,
  textTransform: "none",
  color: "rgba(255, 255, 255, 0.45)",
  transition: "all 0.2s ease",
  "&.Mui-selected": {
    color: "#378C92",
  },
  "&:hover": {
    color: "rgba(255, 255, 255, 0.7)",
  },
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  marginBottom: theme.spacing(2.5),
  "& .MuiOutlinedInput-root": {
    color: "#ffffff",
    backgroundColor: "rgba(255, 255, 255, 0.025)",
    borderRadius: "10px",
    transition: "all 0.25s ease",
    "& fieldset": {
      borderColor: "rgba(255, 255, 255, 0.1)",
      transition: "border-color 0.25s ease",
    },
    "&:hover fieldset": {
      borderColor: "rgba(55, 140, 146, 0.25)",
    },
    "&.Mui-focused": {
      backgroundColor: "rgba(255, 255, 255, 0.035)",
      "& fieldset": {
        borderColor: "#378C92",
        borderWidth: "1.5px",
      },
    },
  },
  "& .MuiInputLabel-root": {
    color: "rgba(255, 255, 255, 0.55)",
    fontWeight: 500,
    fontSize: "14px",
  },
  "& .MuiInputLabel-root.Mui-focused": {
    color: "#378C92",
  },
  "& input:-webkit-autofill": {
    WebkitBoxShadow: "0 0 0 100px rgba(15, 15, 22, 0.95) inset",
    WebkitTextFillColor: "#ffffff",
  },
}));

const PrimaryButton = styled(Button)(({ theme }) => ({
  padding: theme.spacing(1.6, 3),
  borderRadius: "10px",
  fontSize: "15px",
  fontWeight: 600,
  textTransform: "none",
  background: "linear-gradient(135deg, #378C92 0%, #2c6f74 100%)",
  color: "#ffffff",
  boxShadow: "0 4px 16px rgba(55, 140, 146, 0.25)",
  transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
  position: "relative",
  overflow: "hidden",
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: "0 8px 24px rgba(55, 140, 146, 0.35)",
    background: "linear-gradient(135deg, #3a98a0 0%, #378C92 100%)",
  },
  "&:active": {
    transform: "translateY(-1px)",
  },
  "&:disabled": {
    opacity: 0.4,
    cursor: "not-allowed",
    background: "rgba(55, 140, 146, 0.3)",
    boxShadow: "none",
    color: "rgba(255, 255, 255, 0.5)",
  },
}));

const GoogleButton = styled(Button)(({ theme }) => ({
  width: "100%",
  padding: theme.spacing(1.6, 2),
  marginBottom: theme.spacing(3),
  borderRadius: "10px",
  fontSize: "15px",
  fontWeight: 600,
  textTransform: "none",
  color: "#ffffff",
  backgroundColor: "rgba(255, 255, 255, 0.04)",
  border: "1px solid rgba(255, 255, 255, 0.1)",
  transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
  "&:hover": {
    backgroundColor: "rgba(55, 140, 146, 0.06)",
    border: "1px solid rgba(55, 140, 146, 0.3)",
    transform: "translateY(-1px)",
    boxShadow: "0 4px 16px rgba(55, 140, 146, 0.15)",
  },
}));

const SecondaryButton = styled(Button)(({ theme }) => ({
  color: "#378C92",
  fontSize: "14px",
  fontWeight: 600,
  textTransform: "none",
  transition: "all 0.2s ease",
  "&:hover": {
    color: "#3a98a0",
    backgroundColor: "rgba(55, 140, 146, 0.06)",
  },
}));

const FeatureItem = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "flex-start",
  gap: theme.spacing(2),
  marginBottom: theme.spacing(3),
  color: "rgba(255, 255, 255, 0.8)",
}));

const IconWrapper = styled(Box)(({ theme }) => ({
  width: 44,
  height: 44,
  minWidth: 44,
  borderRadius: "10px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "rgba(55, 140, 146, 0.08)",
  border: "1px solid rgba(55, 140, 146, 0.15)",
  transition: "all 0.3s ease",
  "& svg": {
    color: "#378C92",
    fontSize: 22,
  },
}));

const FloatingParticle = styled(Box)(({ theme }) => ({
  position: "absolute",
  width: "4px",
  height: "4px",
  borderRadius: "50%",
  background: "rgba(55, 140, 146, 0.3)",
  animation: `${float} 8s ease-in-out infinite, ${pulse} 4s ease-in-out infinite`,
  pointerEvents: "none",
}));

// Google Icon Component
const GoogleIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 48 48"
    style={{ marginRight: "10px" }}
  >
    <path
      fill="#EA4335"
      d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
    />
    <path
      fill="#4285F4"
      d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
    />
    <path
      fill="#FBBC05"
      d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
    />
    <path
      fill="#34A853"
      d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
    />
    <path fill="none" d="M0 0h48v48H0z" />
  </svg>
);

interface FormData {
  email: string;
  password: string;
  name: string;
}

interface BackendStatus {
  online: boolean;
  cached: boolean;
}

type SigninMode = "password" | "code" | "reset";
type ResetStep = "email" | "code";
type CodeSigninStep = "email" | "code";

const Auth = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const {
    user,
    loading: authLoading,
    signup,
    signin,
    checkSuperAdmin,
    requestSigninCode,
    signinCode,
    requestPasswordReset,
    resetPassword,
    verifyEmail,
    resendVerification,
  } = useAuth();
  const muiTheme = useMuiTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("md"));
  const isSmall = useMediaQuery(muiTheme.breakpoints.down("sm"));

  const [tabValue, setTabValue] = useState<"signin" | "signup">("signin");
  const [signinMode, setSigninMode] = useState<SigninMode>("password");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [backendStatus, setBackendStatus] = useState<BackendStatus>({
    online: true,
    cached: false,
  });
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);

  // Code signin state
  const [codeSigninStep, setCodeSigninStep] = useState<CodeSigninStep>("email");
  const [codeSigninEmail, setCodeSigninEmail] = useState("");
  const [signinCodeValue, setSigninCodeValue] = useState("");
  const codeSigninTimer = useResendTimer(60);

  // Password reset state
  const [resetStep, setResetStep] = useState<ResetStep>("email");
  const [resetEmail, setResetEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const resetTimer = useResendTimer(60);

  // Email verification state
  const [verificationCode, setVerificationCode] = useState("");
  const verificationTimer = useResendTimer(60);

  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
    name: "",
  });

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

  // Handle mode from URL query string
  useEffect(() => {
    const mode = searchParams.get("mode");
    if (mode === "login" || mode === "signin") {
      setTabValue("signin");
      setSigninMode("password");
    } else if (mode === "signup" || mode === "register") {
      setTabValue("signup");
    } else if (mode === "code") {
      setTabValue("signin");
      setSigninMode("code");
    } else if (mode === "forgot-password" || mode === "reset-password") {
      setTabValue("signin");
      setSigninMode("reset");
    }
  }, [searchParams]);

  // Step 10.35: Capture referral code from URL ?ref=CODE
  useEffect(() => {
    const refCode = searchParams.get("ref");
    if (refCode && typeof refCode === "string" && refCode.trim()) {
      const code = refCode.trim().toLowerCase();
      // Store in localStorage (reliable) + cookie (30-day, for server reads)
      localStorage.setItem("ref_code", code);
      document.cookie = `ref_code=${encodeURIComponent(code)}; max-age=${30 * 86400}; path=/; SameSite=Lax`;

      // Track click (non-blocking)
      const apiUrl =
        import.meta.env.VITE_API_URL || "http://localhost:5001/api";
      fetch(`${apiUrl}/referral/track-click`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      }).catch(() => {
        /* ignore tracking failures */
      });
    }
  }, [searchParams]);

  // Handle Google OAuth errors (success now redirects directly to dashboard)
  useEffect(() => {
    const googleAuth = searchParams.get("google_auth");

    if (googleAuth === "error") {
      const message = searchParams.get("message");
      setError(decodeURIComponent(message || "Google authentication failed"));

      // Clear the URL params
      const newUrl = window.location.pathname;
      window.history.replaceState({}, "", newUrl);
    }
  }, [searchParams]);

  useEffect(() => {
    // Only redirect after auth loading is complete and user is authenticated
    if (!authLoading && user) {
      navigate("/dashboard");
      return;
    }

    // Don't run checkAdmin while auth is still loading
    if (authLoading) {
      return;
    }

    const checkAdmin = async () => {
      const result = await checkSuperAdmin();

      if (result.error && result.cached) {
        setBackendStatus({ online: false, cached: true });
        setTabValue(!result.exists ? "signup" : "signin");
      } else if (result.error && !result.cached) {
        setBackendStatus({ online: false, cached: false });
        setTabValue("signin");
        setError(
          "Cannot connect to server. Please check if the backend is running.",
        );
      } else {
        setBackendStatus({ online: true, cached: false });
        setTabValue(!result.exists ? "signup" : "signin");
      }
    };

    checkAdmin();
  }, [user, authLoading, navigate, checkSuperAdmin]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");
    setSuccess("");
  };

  const handleTabChange = (
    _event: React.SyntheticEvent,
    newValue: "signin" | "signup",
  ) => {
    setTabValue(newValue);
    setSigninMode("password");
    setError("");
    setSuccess("");
    setFormData({ email: "", password: "", name: "" });
  };

  const handleGoogleSignIn = () => {
    window.location.href = `${API_URL}/auth/google/start`;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      if (tabValue === "signup") {
        // Validate terms acceptance before proceeding
        if (!acceptTerms) {
          setError("Please accept the Terms of Service and Privacy Policy");
          setLoading(false);
          return;
        }

        // Validate password complexity on frontend (same rules as backend)
        if (!formData.password || formData.password.length < 8) {
          setError("Password must be at least 8 characters");
          setLoading(false);
          return;
        }

        const passwordRegex =
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_+\-=\[\]{};:'",.<>\/\\|`~])[A-Za-z\d@$!%*?&#^()_+\-=\[\]{};:'",.<>\/\\|`~]{8,}$/;
        if (!passwordRegex.test(formData.password)) {
          setError(
            "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
          );
          setLoading(false);
          return;
        }

        const formDataToSend = new FormData();
        formDataToSend.append("email", formData.email);
        formDataToSend.append("password", formData.password);
        formDataToSend.append("name", formData.name);
        formDataToSend.append("acceptTerms", acceptTerms.toString());

        // Step 10.35: Include referral code if present
        const refCode = localStorage.getItem("ref_code");
        if (refCode) {
          formDataToSend.append("referralCode", refCode);
        }

        const result = await signup(formDataToSend);
        if (result.success) {
          // Clear referral code after successful signup
          localStorage.removeItem("ref_code");
          document.cookie = "ref_code=; max-age=0; path=/";
          setVerificationEmail(formData.email);
          setShowEmailVerification(true);
        } else {
          setError(result.message || "Signup failed");
        }
      } else {
        const result = await signin(formData.email, formData.password);
        if (result.success) {
          navigate("/dashboard");
        } else {
          setError(result.message || "Sign in failed");
        }
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  // Code Signin Handlers
  const handleRequestSigninCode = async () => {
    if (!codeSigninEmail || !codeSigninEmail.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const result = await requestSigninCode(codeSigninEmail);
      if (result.success) {
        setCodeSigninStep("code");
        codeSigninTimer.start(60);
        setSuccess("Code sent to your email");
      } else {
        if (result.retryAfter) {
          codeSigninTimer.start(result.retryAfter);
          setError(
            `Please wait ${result.retryAfter} seconds before requesting another code`,
          );
        } else {
          setError(result.message || "Failed to send signin code");
        }
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleCodeSignin = async () => {
    if (signinCodeValue.length !== 6) {
      setError("Please enter the 6-digit code");
      return;
    }

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const result = await signinCode(codeSigninEmail, signinCodeValue);
      if (result.success) {
        navigate("/dashboard");
      } else {
        setError(result.message || "Sign in failed");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleResendSigninCode = async () => {
    if (codeSigninTimer.secondsRemaining > 0) return;

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const result = await requestSigninCode(codeSigninEmail);
      if (result.success) {
        codeSigninTimer.reset(60);
        setSuccess("Code resent to your email");
        setSigninCodeValue("");
      } else {
        if (result.retryAfter) {
          codeSigninTimer.reset(result.retryAfter);
          setError(
            `Please wait ${result.retryAfter} seconds before requesting another code`,
          );
        } else {
          setError(result.message || "Failed to resend code");
        }
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  // Password Reset Handlers
  const handleRequestResetCode = async () => {
    if (!resetEmail || !resetEmail.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const result = await requestPasswordReset(resetEmail);
      if (result.success) {
        setResetStep("code");
        resetTimer.start(60);
        setSuccess("Reset code sent to your email");
      } else {
        if (result.retryAfter) {
          resetTimer.start(result.retryAfter);
          setError(
            `Please wait ${result.retryAfter} seconds before requesting another code`,
          );
        } else {
          setError(result.message || "Failed to send reset code");
        }
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (resetCode.length !== 6) {
      setError("Please enter the 6-digit code");
      return;
    }

    // Password validation matching backend requirements
    if (!newPassword || newPassword.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_+\-=\[\]{};:'",.<>\/\\|`~])[A-Za-z\d@$!%*?&#^()_+\-=\[\]{};:'",.<>\/\\|`~]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      setError(
        "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
      );
      return;
    }

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const result = await resetPassword(resetEmail, resetCode, newPassword);
      if (result.success) {
        setSuccess("Password reset successfully!");
        setTimeout(() => {
          setSigninMode("password");
          setFormData({ ...formData, email: resetEmail, password: "" });
          setResetStep("email");
          setResetEmail("");
          setResetCode("");
          setNewPassword("");
          setError("");
          setSuccess("");
        }, 2000);
      } else {
        setError(result.message || "Password reset failed");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleResendResetCode = async () => {
    if (resetTimer.secondsRemaining > 0) return;

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const result = await requestPasswordReset(resetEmail);
      if (result.success) {
        resetTimer.reset(60);
        setSuccess("Code resent to your email");
        setResetCode("");
      } else {
        if (result.retryAfter) {
          resetTimer.reset(result.retryAfter);
          setError(
            `Please wait ${result.retryAfter} seconds before requesting another code`,
          );
        } else {
          setError(result.message || "Failed to resend code");
        }
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  // Email Verification Handlers
  const handleEmailVerification = async () => {
    if (verificationCode.length !== 6) {
      setError("Please enter the 6-digit code");
      return;
    }

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const result = await verifyEmail(verificationEmail, verificationCode);
      if (result.success) {
        // Redirect immediately to dashboard (no delay)
        navigate("/dashboard");
      } else {
        setError(result.message || "Verification failed");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (verificationTimer.secondsRemaining > 0) return;

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const result = await resendVerification(verificationEmail);
      if (result.success) {
        verificationTimer.reset(60);
        setSuccess("Code resent to your email");
        setVerificationCode("");
      } else {
        if (result.retryAfter) {
          verificationTimer.reset(result.retryAfter);
          setError(
            `Please wait ${result.retryAfter} seconds before requesting another code`,
          );
        } else {
          setError(result.message || "Failed to resend code");
        }
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  // Render Email Verification View (in card)
  const renderEmailVerification = () => (
    <>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
        <IconButton
          onClick={() => {
            setShowEmailVerification(false);
            setVerificationEmail("");
            setVerificationCode("");
            setError("");
            setSuccess("");
          }}
          size="small"
          sx={{ color: "rgba(255, 255, 255, 0.6)" }}
        >
          <ArrowBackIcon fontSize="small" />
        </IconButton>
        <Typography
          variant="h5"
          sx={{
            fontWeight: 700,
            fontSize: { xs: "22px", sm: "24px" },
            color: "#ffffff",
          }}
        >
          Verify Your Email
        </Typography>
      </Box>

      <Typography
        variant="body2"
        sx={{
          color: "rgba(255, 255, 255, 0.65)",
          fontSize: "14px",
          mb: 1,
        }}
      >
        We've sent a 6-digit code to:
      </Typography>

      <Typography
        variant="body1"
        sx={{
          fontWeight: 600,
          color: "#378C92",
          mb: 4,
        }}
      >
        {verificationEmail}
      </Typography>

      {success && (
        <Alert
          severity="success"
          sx={{
            mb: 3,
            fontSize: "13px",
            backgroundColor: "rgba(46, 125, 50, 0.1)",
            border: "1px solid rgba(46, 125, 50, 0.3)",
            color: "#66bb6a",
          }}
        >
          {success}
        </Alert>
      )}

      {error && (
        <Alert
          severity="error"
          sx={{
            mb: 3,
            fontSize: "13px",
            backgroundColor: "rgba(211, 47, 47, 0.08)",
            border: "1px solid rgba(211, 47, 47, 0.25)",
            color: "#ff6b6b",
          }}
        >
          {error}
        </Alert>
      )}

      <Box sx={{ mb: 3 }}>
        <CodeInput
          value={verificationCode}
          onChange={setVerificationCode}
          onComplete={setVerificationCode}
          disabled={loading}
          error={!!error}
        />
      </Box>

      <PrimaryButton
        fullWidth
        onClick={handleEmailVerification}
        disabled={loading || verificationCode.length !== 6}
        sx={{ mb: 2 }}
      >
        {loading ? (
          <CircularProgress size={20} sx={{ color: "#ffffff" }} />
        ) : (
          "Verify Email"
        )}
      </PrimaryButton>

      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          gap: 0.5,
          alignItems: "center",
          mt: 2,
        }}
      >
        <Typography
          variant="body2"
          sx={{ color: "rgba(255, 255, 255, 0.55)", fontSize: "14px" }}
        >
          Didn't receive the code?
        </Typography>
        <ResendLink
          secondsRemaining={verificationTimer.secondsRemaining}
          onResend={handleResendVerification}
          disabled={loading}
        />
      </Box>
    </>
  );

  // Render Code Signin View (in card)
  const renderCodeSignin = () => (
    <>
      {codeSigninStep === "email" && (
        <>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
            <IconButton
              onClick={() => {
                setSigninMode("password");
                setCodeSigninEmail("");
                setError("");
                setSuccess("");
              }}
              size="small"
              sx={{ color: "rgba(255, 255, 255, 0.6)" }}
            >
              <ArrowBackIcon fontSize="small" />
            </IconButton>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                fontSize: { xs: "22px", sm: "24px" },
                color: "#ffffff",
              }}
            >
              Sign in with code
            </Typography>
          </Box>

          <Typography
            variant="body2"
            sx={{
              color: "rgba(255, 255, 255, 0.65)",
              fontSize: "14px",
              mb: 4,
            }}
          >
            We'll email a one-time 6-digit code to your address
          </Typography>

          {error && (
            <Alert
              severity="error"
              sx={{
                mb: 3,
                fontSize: "13px",
                backgroundColor: "rgba(211, 47, 47, 0.08)",
                border: "1px solid rgba(211, 47, 47, 0.25)",
                color: "#ff6b6b",
              }}
            >
              {error}
            </Alert>
          )}

          <StyledTextField
            fullWidth
            label="Email Address"
            type="email"
            value={codeSigninEmail}
            onChange={(e) => {
              setCodeSigninEmail(e.target.value);
              setError("");
            }}
            autoFocus
            size={isSmall ? "small" : "medium"}
          />

          <PrimaryButton
            fullWidth
            onClick={handleRequestSigninCode}
            disabled={loading || !codeSigninEmail}
            sx={{ mb: 2 }}
          >
            {loading ? (
              <CircularProgress size={20} sx={{ color: "#ffffff" }} />
            ) : (
              "Send code"
            )}
          </PrimaryButton>
        </>
      )}

      {codeSigninStep === "code" && (
        <>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
            <IconButton
              onClick={() => {
                setCodeSigninStep("email");
                setSigninCodeValue("");
                setError("");
                setSuccess("");
              }}
              size="small"
              sx={{ color: "rgba(255, 255, 255, 0.6)" }}
            >
              <ArrowBackIcon fontSize="small" />
            </IconButton>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                fontSize: { xs: "22px", sm: "24px" },
                color: "#ffffff",
              }}
            >
              Enter code
            </Typography>
          </Box>

          <Typography
            variant="body2"
            sx={{
              color: "rgba(255, 255, 255, 0.65)",
              fontSize: "14px",
              mb: 1,
            }}
          >
            We sent a code to:
          </Typography>

          <Typography
            variant="body1"
            sx={{
              fontWeight: 600,
              color: "#378C92",
              mb: 4,
            }}
          >
            {codeSigninEmail}
          </Typography>

          {success && (
            <Alert
              severity="success"
              sx={{
                mb: 3,
                fontSize: "13px",
                backgroundColor: "rgba(46, 125, 50, 0.1)",
                border: "1px solid rgba(46, 125, 50, 0.3)",
                color: "#66bb6a",
              }}
            >
              {success}
            </Alert>
          )}

          {error && (
            <Alert
              severity="error"
              sx={{
                mb: 3,
                fontSize: "13px",
                backgroundColor: "rgba(211, 47, 47, 0.08)",
                border: "1px solid rgba(211, 47, 47, 0.25)",
                color: "#ff6b6b",
              }}
            >
              {error}
            </Alert>
          )}

          <Box sx={{ mb: 3 }}>
            <CodeInput
              value={signinCodeValue}
              onChange={setSigninCodeValue}
              onComplete={setSigninCodeValue}
              disabled={loading}
              error={!!error}
            />
          </Box>

          <PrimaryButton
            fullWidth
            onClick={handleCodeSignin}
            disabled={loading || signinCodeValue.length !== 6}
            sx={{ mb: 2 }}
          >
            {loading ? (
              <CircularProgress size={20} sx={{ color: "#ffffff" }} />
            ) : (
              "Sign in"
            )}
          </PrimaryButton>

          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              gap: 0.5,
              alignItems: "center",
              mt: 2,
            }}
          >
            <Typography
              variant="body2"
              sx={{ color: "rgba(255, 255, 255, 0.55)", fontSize: "14px" }}
            >
              Didn't receive the code?
            </Typography>
            <ResendLink
              secondsRemaining={codeSigninTimer.secondsRemaining}
              onResend={handleResendSigninCode}
              disabled={loading}
            />
          </Box>
        </>
      )}
    </>
  );

  // Render Password Reset View (in card)
  const renderPasswordReset = () => (
    <>
      {resetStep === "email" && (
        <>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
            <IconButton
              onClick={() => {
                setSigninMode("password");
                setResetEmail("");
                setError("");
                setSuccess("");
              }}
              size="small"
              sx={{ color: "rgba(255, 255, 255, 0.6)" }}
            >
              <ArrowBackIcon fontSize="small" />
            </IconButton>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                fontSize: { xs: "22px", sm: "24px" },
                color: "#ffffff",
              }}
            >
              Reset your password
            </Typography>
          </Box>

          <Typography
            variant="body2"
            sx={{
              color: "rgba(255, 255, 255, 0.65)",
              fontSize: "14px",
              mb: 4,
            }}
          >
            Enter your email and we'll send you a reset code
          </Typography>

          {success && (
            <Alert
              severity="success"
              sx={{
                mb: 3,
                fontSize: "13px",
                backgroundColor: "rgba(46, 125, 50, 0.1)",
                border: "1px solid rgba(46, 125, 50, 0.3)",
                color: "#66bb6a",
              }}
            >
              {success}
            </Alert>
          )}

          {error && (
            <Alert
              severity="error"
              sx={{
                mb: 3,
                fontSize: "13px",
                backgroundColor: "rgba(211, 47, 47, 0.08)",
                border: "1px solid rgba(211, 47, 47, 0.25)",
                color: "#ff6b6b",
              }}
            >
              {error}
            </Alert>
          )}

          <StyledTextField
            fullWidth
            label="Email Address"
            type="email"
            value={resetEmail}
            onChange={(e) => {
              setResetEmail(e.target.value);
              setError("");
              setSuccess("");
            }}
            autoFocus
            size={isSmall ? "small" : "medium"}
          />

          <PrimaryButton
            fullWidth
            onClick={handleRequestResetCode}
            disabled={loading || !resetEmail}
            sx={{ mb: 2 }}
          >
            {loading ? (
              <CircularProgress size={20} sx={{ color: "#ffffff" }} />
            ) : (
              "Send reset code"
            )}
          </PrimaryButton>
        </>
      )}

      {resetStep === "code" && (
        <>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
            <IconButton
              onClick={() => {
                setResetStep("email");
                setResetCode("");
                setNewPassword("");
                setError("");
                setSuccess("");
              }}
              size="small"
              sx={{ color: "rgba(255, 255, 255, 0.6)" }}
            >
              <ArrowBackIcon fontSize="small" />
            </IconButton>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                fontSize: { xs: "22px", sm: "24px" },
                color: "#ffffff",
              }}
            >
              Enter code & new password
            </Typography>
          </Box>

          <Typography
            variant="body2"
            sx={{
              color: "rgba(255, 255, 255, 0.65)",
              fontSize: "14px",
              mb: 1,
            }}
          >
            Code sent to:
          </Typography>

          <Typography
            variant="body1"
            sx={{
              fontWeight: 600,
              color: "#378C92",
              mb: 3,
            }}
          >
            {resetEmail}
          </Typography>

          {success && (
            <Alert
              severity="success"
              sx={{
                mb: 3,
                fontSize: "13px",
                backgroundColor: "rgba(46, 125, 50, 0.1)",
                border: "1px solid rgba(46, 125, 50, 0.3)",
                color: "#66bb6a",
              }}
            >
              {success}
            </Alert>
          )}

          {error && (
            <Alert
              severity="error"
              sx={{
                mb: 3,
                fontSize: "13px",
                backgroundColor: "rgba(211, 47, 47, 0.08)",
                border: "1px solid rgba(211, 47, 47, 0.25)",
                color: "#ff6b6b",
              }}
            >
              {error}
            </Alert>
          )}

          <Typography
            variant="body2"
            sx={{
              color: "rgba(255, 255, 255, 0.55)",
              fontSize: "13px",
              mb: 1,
              fontWeight: 500,
            }}
          >
            Enter 6-digit code
          </Typography>

          <Box sx={{ mb: 3 }}>
            <CodeInput
              value={resetCode}
              onChange={setResetCode}
              onComplete={setResetCode}
              disabled={loading}
              error={!!error}
            />
          </Box>

          <StyledTextField
            fullWidth
            label="New Password"
            type={showPassword ? "text" : "password"}
            value={newPassword}
            onChange={(e) => {
              setNewPassword(e.target.value);
              setError("");
              setSuccess("");
            }}
            size={isSmall ? "small" : "medium"}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                    size="small"
                    sx={{ color: "rgba(255, 255, 255, 0.5)" }}
                  >
                    {showPassword ? (
                      <VisibilityOff fontSize="small" />
                    ) : (
                      <Visibility fontSize="small" />
                    )}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <PrimaryButton
            fullWidth
            onClick={handlePasswordReset}
            disabled={
              loading || resetCode.length !== 6 || newPassword.length < 8
            }
            sx={{ mb: 2 }}
          >
            {loading ? (
              <CircularProgress size={20} sx={{ color: "#ffffff" }} />
            ) : (
              "Update password"
            )}
          </PrimaryButton>

          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              gap: 0.5,
              alignItems: "center",
              mt: 2,
            }}
          >
            <Typography
              variant="body2"
              sx={{ color: "rgba(255, 255, 255, 0.55)", fontSize: "14px" }}
            >
              Didn't receive the code?
            </Typography>
            <ResendLink
              secondsRemaining={resetTimer.secondsRemaining}
              onResend={handleResendResetCode}
              disabled={loading}
            />
          </Box>
        </>
      )}
    </>
  );

  // Render Password Mode (default signin)
  const renderPasswordMode = () => (
    <>
      <Typography
        variant="h4"
        sx={{
          fontWeight: 800,
          fontSize: { xs: "26px", sm: "30px" },
          background:
            "linear-gradient(135deg, #ffffff 0%, rgba(255, 255, 255, 0.9) 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          mb: 1.5,
          letterSpacing: "-0.02em",
        }}
      >
        {tabValue === "signin" ? "Welcome back" : "Create your account"}
      </Typography>

      <Typography
        variant="body2"
        sx={{
          color: "rgba(255, 255, 255, 0.55)",
          fontSize: "14px",
          mb: 4,
          lineHeight: 1.5,
        }}
      >
        {tabValue === "signin"
          ? "Sign in to your Techietribe account to access the dashboard."
          : "Join Techietribe and start building your online presence."}
      </Typography>

      {/* Tabs */}
      <StyledTabs value={tabValue} onChange={handleTabChange}>
        <StyledTab label="Sign in" value="signin" />
        <StyledTab label="Create account" value="signup" />
      </StyledTabs>

      {/* Backend Status Warning */}
      {!backendStatus.online && backendStatus.cached && (
        <Alert
          severity={import.meta.env.DEV ? "warning" : "error"}
          sx={{ mb: 3, fontSize: "13px" }}
        >
          {import.meta.env.DEV
            ? "Backend is offline. Using cached data. Some features may not work."
            : "Unable to connect to the server. Please try again later or contact support."}
        </Alert>
      )}

      {/* Google Sign In Button */}
      <GoogleButton onClick={handleGoogleSignIn}>
        <GoogleIcon />
        Continue with Google
      </GoogleButton>

      <Typography
        variant="caption"
        sx={{
          display: "block",
          textAlign: "center",
          color: "rgba(255, 255, 255, 0.4)",
          fontSize: "12px",
          mb: 3,
          mt: -2,
        }}
      >
        We'll never post to your Google account
      </Typography>

      {/* Divider */}
      <Divider sx={{ mb: 4, mt: 1 }}>
        <Typography
          variant="body2"
          sx={{
            color: "rgba(255, 255, 255, 0.45)",
            fontSize: "12px",
            px: 2,
          }}
        >
          or continue with email
        </Typography>
      </Divider>

      {/* Error Message */}
      {error && (
        <Alert
          severity="error"
          sx={{
            mb: 3,
            fontSize: "13px",
            backgroundColor: "rgba(211, 47, 47, 0.08)",
            border: "1px solid rgba(211, 47, 47, 0.25)",
            color: "#ff6b6b",
          }}
        >
          {error}
        </Alert>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit}>
        {tabValue === "signup" && (
          <StyledTextField
            fullWidth
            label="Full Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            autoComplete="name"
            size={isSmall ? "small" : "medium"}
          />
        )}

        <StyledTextField
          fullWidth
          label="Email Address"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          required
          autoComplete="email"
          size={isSmall ? "small" : "medium"}
        />

        <StyledTextField
          fullWidth
          label="Password"
          name="password"
          type={showPassword ? "text" : "password"}
          value={formData.password}
          onChange={handleChange}
          required
          autoComplete={
            tabValue === "signin" ? "current-password" : "new-password"
          }
          size={isSmall ? "small" : "medium"}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowPassword(!showPassword)}
                  edge="end"
                  size="small"
                  sx={{ color: "rgba(255, 255, 255, 0.5)" }}
                >
                  {showPassword ? (
                    <VisibilityOff fontSize="small" />
                  ) : (
                    <Visibility fontSize="small" />
                  )}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        {tabValue === "signup" && (
          <Typography
            variant="caption"
            sx={{
              display: "block",
              color: "rgba(255, 255, 255, 0.45)",
              fontSize: "12px",
              mb: 2,
              mt: -1.5,
              lineHeight: 1.4,
            }}
          >
            Must be 8+ characters with uppercase, lowercase, number, and special
            character
          </Typography>
        )}

        {tabValue === "signup" && (
          <FormControlLabel
            control={
              <Checkbox
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                size="small"
                sx={{
                  color: "rgba(255, 255, 255, 0.25)",
                  "&.Mui-checked": {
                    color: "#378C92",
                  },
                }}
              />
            }
            label={
              <Typography
                variant="body2"
                sx={{ color: "rgba(255, 255, 255, 0.55)", fontSize: "13px" }}
              >
                I agree to the Terms of Service and Privacy Policy
              </Typography>
            }
            sx={{ mb: 2, ml: -0.5 }}
          />
        )}

        {/* Submit Button */}
        <PrimaryButton
          type="submit"
          fullWidth
          disabled={
            loading ||
            (!backendStatus.online && !backendStatus.cached) ||
            (tabValue === "signup" && !acceptTerms)
          }
          sx={{ mb: 2 }}
        >
          {loading ? (
            <CircularProgress size={20} sx={{ color: "#ffffff" }} />
          ) : tabValue === "signin" ? (
            "Sign in"
          ) : (
            "Create account"
          )}
        </PrimaryButton>

        {/* Secondary Links */}
        {tabValue === "signin" && (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: "4px",
              alignItems: "center",
              mt: 2,
            }}
          >
            <SecondaryButton onClick={() => setSigninMode("code")} size="small">
              Sign in with code instead
            </SecondaryButton>
            <SecondaryButton
              onClick={() => setSigninMode("reset")}
              size="small"
            >
              Forgot password?
            </SecondaryButton>
          </Box>
        )}

        {tabValue === "signup" && (
          <Box sx={{ textAlign: "center", mt: 2 }}>
            <Typography
              variant="body2"
              sx={{ color: "rgba(255, 255, 255, 0.55)", fontSize: "13px" }}
            >
              Already have an account?{" "}
              <SecondaryButton
                onClick={() => setTabValue("signin")}
                size="small"
                sx={{
                  p: 0,
                  minWidth: "auto",
                  fontSize: "13px",
                  verticalAlign: "baseline",
                }}
              >
                Sign in
              </SecondaryButton>
            </Typography>
          </Box>
        )}
      </form>
    </>
  );

  // Show loading spinner while checking authentication
  if (authLoading || loading) {
    return (
      <PageContainer>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "100vh",
          }}
        >
          <CircularProgress
            size={50}
            sx={{
              color: "#378C92",
            }}
          />
        </Box>
      </PageContainer>
    );
  }

  // Main auth view
  return (
    <PageContainer>
      <Box
        sx={{
          position: "absolute",
          height: "auto",
          zIndex: 0,
          backgroundImage: `url("${darkhole}")`,
          backgroundRepeat: "no-repeat",
          backgroundSize: "contain",
          aspectRatio: "2074 / 1333",
          top: "12%",
          left: "-70%",
          width: "280%",

          "@media (min-width: 640px)": {
            top: "-4%",
            width: "130%",
            left: "-15%",
          },
        }}
      />

      {/* Floating particles for subtle background effect */}
      <FloatingParticle sx={{ top: "15%", left: "8%", animationDelay: "0s" }} />
      <FloatingParticle
        sx={{ top: "65%", left: "12%", animationDelay: "2s" }}
      />
      <FloatingParticle
        sx={{ top: "45%", right: "15%", animationDelay: "4s" }}
      />
      <FloatingParticle
        sx={{ top: "80%", right: "10%", animationDelay: "6s" }}
      />

      {/* Left Brand Panel */}
      <LeftPanel>
        <HeroContent>
          {/* Logo */}
          <Link
            to="/"
            style={{
              textDecoration: "none",
              display: "inline-block",
              marginBottom: "48px",
            }}
          >
            <Box
              component="img"
              src={WhiteLogo}
              alt="Techietribe"
              sx={{
                width: { lg: "200px", md: "180px" },
                height: "auto",
                cursor: "pointer",
                transition: "opacity 0.3s ease",
                "&:hover": {
                  opacity: 0.8,
                },
              }}
            />
          </Link>

          {/* Headline */}
          <Typography
            variant="h2"
            sx={{
              fontWeight: 900,
              fontSize: { lg: "52px", md: "44px" },
              lineHeight: 1.1,
              mb: 3,
              background: "linear-gradient(135deg, #ffffff 0%, #e0e0e0 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              letterSpacing: "-0.03em",
            }}
          >
            Build. Launch.
            <br />
            Get Discovered.
          </Typography>

          {/* Subtitle */}
          <Typography
            variant="body1"
            sx={{
              color: "rgba(255, 255, 255, 0.65)",
              fontSize: "17px",
              lineHeight: 1.65,
              mb: 6,
            }}
          >
            Create stunning landing pages in minutes and get discovered in our
            curated business directory—all for free.
          </Typography>

          {/* Feature List */}
          <Box>
            <FeatureItem>
              <IconWrapper>
                <AutoAwesomeIcon />
              </IconWrapper>
              <Box>
                <Typography
                  variant="body1"
                  sx={{
                    fontWeight: 600,
                    color: "#ffffff",
                    mb: 0.5,
                    fontSize: "15px",
                  }}
                >
                  AI-Assisted Builder
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: "rgba(255, 255, 255, 0.55)",
                    fontSize: "14px",
                    lineHeight: 1.5,
                  }}
                >
                  Create professional landing pages with smart templates
                </Typography>
              </Box>
            </FeatureItem>

            <FeatureItem>
              <IconWrapper>
                <RocketLaunchIcon />
              </IconWrapper>
              <Box>
                <Typography
                  variant="body1"
                  sx={{
                    fontWeight: 600,
                    color: "#ffffff",
                    mb: 0.5,
                    fontSize: "15px",
                  }}
                >
                  Premium Templates
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: "rgba(255, 255, 255, 0.55)",
                    fontSize: "14px",
                    lineHeight: 1.5,
                  }}
                >
                  Launch faster with beautiful, conversion-optimized designs
                </Typography>
              </Box>
            </FeatureItem>

            <FeatureItem>
              <IconWrapper>
                <StorefrontIcon />
              </IconWrapper>
              <Box>
                <Typography
                  variant="body1"
                  sx={{
                    fontWeight: 600,
                    color: "#ffffff",
                    mb: 0.5,
                    fontSize: "15px",
                  }}
                >
                  Directory Presence
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: "rgba(255, 255, 255, 0.55)",
                    fontSize: "14px",
                    lineHeight: 1.5,
                  }}
                >
                  Get discovered by customers in our business directory
                </Typography>
              </Box>
            </FeatureItem>
          </Box>
        </HeroContent>
      </LeftPanel>

      {/* Right Auth Panel */}
      <RightPanel>
        <AuthCard>
          {/* Back button for mobile (xs and sm screens only) */}
          {(isSmall || isMobile) &&
            signinMode === "password" &&
            !showEmailVerification && (
              <Box sx={{ mb: 2 }}>
                <IconButton
                  component={Link}
                  to="/"
                  size="small"
                  sx={{
                    color: "rgba(255, 255, 255, 0.6)",
                    "&:hover": {
                      color: "rgba(255, 255, 255, 0.8)",
                      backgroundColor: "rgba(255, 255, 255, 0.05)",
                    },
                  }}
                >
                  <ArrowBackIcon fontSize="small" />
                </IconButton>
              </Box>
            )}

          {/* Logo Badge (Mobile) */}
          {isMobile && (
            <Box sx={{ textAlign: "center", mb: 3 }}>
              <Box
                component="img"
                src={WhiteLogo}
                alt="Techietribe"
                sx={{
                  width: { xs: "160px", sm: "180px" },
                  height: "auto",
                  mx: "auto",
                }}
              />
            </Box>
          )}

          {/* Render different views based on state */}
          {showEmailVerification
            ? renderEmailVerification()
            : tabValue === "signin" && signinMode === "code"
              ? renderCodeSignin()
              : tabValue === "signin" && signinMode === "reset"
                ? renderPasswordReset()
                : renderPasswordMode()}
        </AuthCard>
      </RightPanel>
    </PageContainer>
  );
};

export default Auth;
