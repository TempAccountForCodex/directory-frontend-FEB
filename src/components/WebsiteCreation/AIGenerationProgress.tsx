/**
 * AIGenerationProgress — Full-page progress component for AI content generation
 *
 * Connects to SSE stream at GET /api/ai/progress/:sessionId after wizard
 * creates session via POST /api/ai/generate-content.
 * Shows real-time progress per block/page, handles retry, connection drops, and total failure.
 *
 * Step 3.18.B + 3.18.C
 */

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Box,
  Typography,
  LinearProgress,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { motion, AnimatePresence } from "framer-motion";
import CheckCircle from "@mui/icons-material/CheckCircle";
import RadioButtonUnchecked from "@mui/icons-material/RadioButtonUnchecked";
import ErrorIcon from "@mui/icons-material/Error";
import { Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getDashboardColors } from "../../styles/dashboardTheme";
import { useTheme as useCustomTheme } from "../../context/ThemeContext";
import {
  DashboardCard,
  DashboardGradientButton,
  DashboardActionButton,
  DashboardCancelButton,
} from "../Dashboard/shared";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

interface PageStatus {
  pageId: number;
  pageName: string;
  status: "pending" | "current" | "completed" | "failed";
  blockCount: number;
}

interface FailedBlock {
  blockId: number;
  blockType: string;
  error: string;
  retrying: boolean;
}

interface ProgressStats {
  totalBlocks: number;
  completedBlocks: number;
  totalTokensUsed: number;
  cacheHits: number;
  blocksFailed: number;
  pagesCompleted: number;
}

interface AIGenerationProgressProps {
  sessionId: string;
  websiteId: number;
  websiteName: string;
  questionnaireData: Record<string, unknown>;
  onRetrySession?: (resumeMode: boolean) => Promise<string | null>;
}

const AIGenerationProgress: React.FC<AIGenerationProgressProps> = React.memo(
  ({
    sessionId,
    websiteId,
    websiteName,
    questionnaireData,
    onRetrySession,
  }) => {
    const { actualTheme } = useCustomTheme();
    const colors = getDashboardColors(actualTheme);
    const navigate = useNavigate();

    const [pages, setPages] = useState<PageStatus[]>([]);
    const [failedBlocks, setFailedBlocks] = useState<FailedBlock[]>([]);
    const [stats, setStats] = useState<ProgressStats>({
      totalBlocks: 0,
      completedBlocks: 0,
      totalTokensUsed: 0,
      cacheHits: 0,
      blocksFailed: 0,
      pagesCompleted: 0,
    });
    const [phase, setPhase] = useState<
      "connecting" | "generating" | "complete" | "failed" | "disconnected"
    >("connecting");
    const [countdown, setCountdown] = useState(3);
    const [snackbar, setSnackbar] = useState<{
      open: boolean;
      message: string;
      severity: "success" | "error";
    }>({
      open: false,
      message: "",
      severity: "success",
    });

    const abortRef = useRef<AbortController | null>(null);
    const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const activeSessionIdRef = useRef(sessionId);

    // Cleanup on unmount
    useEffect(() => {
      return () => {
        if (abortRef.current) {
          abortRef.current.abort();
        }
        if (countdownRef.current) {
          clearInterval(countdownRef.current);
        }
      };
    }, []);

    // Connect to SSE stream
    const connectSSE = useCallback(async (sid: string) => {
      activeSessionIdRef.current = sid;
      setPhase("connecting");

      // Abort previous connection if any
      if (abortRef.current) {
        abortRef.current.abort();
      }

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const response = await fetch(`${API_URL}/ai/progress/${sid}`, {
          method: "GET",
          headers: {
            Accept: "text/event-stream",
          },
          credentials: "include",
          signal: controller.signal,
        });

        if (!response.ok) {
          setPhase("failed");
          return;
        }

        setPhase("generating");

        const reader = response.body?.getReader();
        if (!reader) {
          setPhase("failed");
          return;
        }

        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              try {
                const data = JSON.parse(line.slice(6));
                handleSSEEvent(data);
              } catch {
                // Skip malformed events
              }
            }
          }
        }
      } catch (error: unknown) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return; // Intentional abort
        }
        if (phase !== "complete") {
          setPhase("disconnected");
        }
      }
    }, []);

    // Handle SSE events
    const handleSSEEvent = useCallback((data: Record<string, unknown>) => {
      switch (data.type) {
        case "start":
          setStats((prev) => ({
            ...prev,
            totalBlocks: data.totalBlocks as number,
          }));
          break;

        case "page_start":
          setPages((prev) => {
            const exists = prev.find((p) => p.pageId === data.pageId);
            if (exists) {
              return prev.map((p) =>
                p.pageId === data.pageId
                  ? { ...p, status: "current" as const }
                  : p,
              );
            }
            return [
              ...prev.map((p) =>
                p.status === "current"
                  ? { ...p, status: "completed" as const }
                  : p,
              ),
              {
                pageId: data.pageId as number,
                pageName: data.pageName as string,
                status: "current" as const,
                blockCount: data.blockCount as number,
              },
            ];
          });
          break;

        case "block_complete":
          setStats((prev) => ({
            ...prev,
            completedBlocks: prev.completedBlocks + 1,
            cacheHits:
              data.source === "cache" ? prev.cacheHits + 1 : prev.cacheHits,
          }));
          break;

        case "block_error":
          setStats((prev) => ({
            ...prev,
            blocksFailed: prev.blocksFailed + 1,
          }));
          setFailedBlocks((prev) => [
            ...prev,
            {
              blockId: data.blockId as number,
              blockType: data.blockType as string,
              error: data.error as string,
              retrying: false,
            },
          ]);
          break;

        case "page_complete":
          setPages((prev) =>
            prev.map((p) =>
              p.pageId === data.pageId
                ? { ...p, status: "completed" as const }
                : p,
            ),
          );
          setStats((prev) => ({
            ...prev,
            pagesCompleted: prev.pagesCompleted + 1,
          }));
          break;

        case "complete":
          setStats((prev) => ({
            ...prev,
            totalTokensUsed: data.totalTokensUsed as number,
            cacheHits: data.cacheHits as number,
            blocksFailed: data.blocksFailed as number,
            pagesCompleted: data.pagesCompleted as number,
            completedBlocks:
              (data.totalBlocks as number) - (data.blocksFailed as number),
          }));
          // Check for total failure
          if (
            (data.blocksFailed as number) === (data.totalBlocks as number) &&
            !data.alreadyCompleted
          ) {
            setPhase("failed");
          } else if (data.alreadyCompleted && data.status === "failed") {
            setPhase("failed");
          } else {
            setPhase("complete");
          }
          break;

        case "error":
          setPhase("failed");
          break;
      }
    }, []);

    // Start SSE connection on mount
    useEffect(() => {
      if (sessionId) {
        connectSSE(sessionId);
      }
    }, [sessionId, connectSSE]);

    // Auto-redirect countdown on completion
    useEffect(() => {
      if (phase === "complete") {
        countdownRef.current = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              if (countdownRef.current) clearInterval(countdownRef.current);
              navigate(`/dashboard/websites/${websiteId}/manage/overview`);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }

      return () => {
        if (countdownRef.current) {
          clearInterval(countdownRef.current);
        }
      };
    }, [phase, websiteId, navigate]);

    // Handle resume after disconnect
    const handleResume = useCallback(async () => {
      if (onRetrySession) {
        const newSessionId = await onRetrySession(true);
        if (newSessionId) {
          setPhase("connecting");
          setFailedBlocks([]);
          connectSSE(newSessionId);
        }
      }
    }, [onRetrySession, connectSSE]);

    // Handle full retry
    const handleRetry = useCallback(async () => {
      if (onRetrySession) {
        const newSessionId = await onRetrySession(false);
        if (newSessionId) {
          setPhase("connecting");
          setPages([]);
          setFailedBlocks([]);
          setStats({
            totalBlocks: 0,
            completedBlocks: 0,
            totalTokensUsed: 0,
            cacheHits: 0,
            blocksFailed: 0,
            pagesCompleted: 0,
          });
          connectSSE(newSessionId);
        }
      }
    }, [onRetrySession, connectSSE]);

    // Handle per-block retry
    const handleBlockRetry = useCallback(
      async (block: FailedBlock) => {
        setFailedBlocks((prev) =>
          prev.map((b) =>
            b.blockId === block.blockId ? { ...b, retrying: true } : b,
          ),
        );

        try {
          const response = await fetch(`${API_URL}/ai/generate-block`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({
              blockId: block.blockId,
              blockType: block.blockType,
              questionnaireData,
            }),
          });

          if (response.ok) {
            setFailedBlocks((prev) =>
              prev.filter((b) => b.blockId !== block.blockId),
            );
            setStats((prev) => ({
              ...prev,
              completedBlocks: prev.completedBlocks + 1,
              blocksFailed: prev.blocksFailed - 1,
            }));
            setSnackbar({
              open: true,
              message: "Section regenerated successfully",
              severity: "success",
            });
          } else {
            setFailedBlocks((prev) =>
              prev.map((b) =>
                b.blockId === block.blockId ? { ...b, retrying: false } : b,
              ),
            );
            setSnackbar({
              open: true,
              message: "Failed to regenerate section. Please try again.",
              severity: "error",
            });
          }
        } catch {
          setFailedBlocks((prev) =>
            prev.map((b) =>
              b.blockId === block.blockId ? { ...b, retrying: false } : b,
            ),
          );
          setSnackbar({
            open: true,
            message: "Failed to regenerate section. Please try again.",
            severity: "error",
          });
        }
      },
      [questionnaireData],
    );

    const progressPercent =
      stats.totalBlocks > 0
        ? Math.round(
            ((stats.completedBlocks + stats.blocksFailed) / stats.totalBlocks) *
              100,
          )
        : 0;

    const handleGoToEditor = useCallback(() => {
      navigate(`/dashboard/websites/${websiteId}/manage/overview`);
    }, [navigate, websiteId]);

    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
          minHeight: "60vh",
          pt: { xs: 2, sm: 6 },
          px: { xs: 1, sm: 2 },
        }}
      >
        <Box sx={{ width: "100%", maxWidth: 600 }}>
          <DashboardCard
            icon={Sparkles}
            title={websiteName || "Your Website"}
            subtitle="AI Content Generation"
          >
            {/* Disconnected banner */}
            {phase === "disconnected" && (
              <Alert
                severity="warning"
                sx={{
                  mb: 2,
                  bgcolor: alpha("#ff9800", 0.1),
                  border: `1px solid ${alpha("#ff9800", 0.3)}`,
                }}
                action={
                  <DashboardGradientButton
                    size="small"
                    onClick={handleResume}
                    sx={{ minWidth: 44, minHeight: 44 }}
                    aria-label="Resume generation"
                  >
                    Resume Generation
                  </DashboardGradientButton>
                }
              >
                Connection lost — progress saved
              </Alert>
            )}

            {/* Total failure state */}
            {phase === "failed" && (
              <Box sx={{ textAlign: "center", py: 3 }}>
                <ErrorIcon sx={{ fontSize: 48, color: "error.main", mb: 2 }} />
                <Typography
                  variant="h6"
                  sx={{ color: colors.text, mb: 1, fontWeight: 600 }}
                >
                  AI content generation unavailable
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: alpha(colors.text, 0.6), mb: 3 }}
                >
                  Your website is ready with template defaults. You can edit
                  content manually or try AI generation again later.
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    gap: 2,
                    justifyContent: "center",
                    flexWrap: "wrap",
                  }}
                >
                  <DashboardGradientButton
                    onClick={handleGoToEditor}
                    sx={{ minWidth: 44, minHeight: 44 }}
                    aria-label="Go to editor"
                  >
                    Go to Editor
                  </DashboardGradientButton>
                  <DashboardActionButton
                    onClick={handleRetry}
                    sx={{ minWidth: 44, minHeight: 44 }}
                    aria-label="Try again"
                  >
                    Try Again
                  </DashboardActionButton>
                </Box>
              </Box>
            )}

            {/* Connecting state */}
            {phase === "connecting" && (
              <Box sx={{ textAlign: "center", py: 4 }}>
                <CircularProgress
                  size={32}
                  sx={{ color: colors.primary, mb: 2 }}
                />
                <Typography
                  variant="body2"
                  sx={{ color: alpha(colors.text, 0.6) }}
                >
                  Connecting to AI service...
                </Typography>
              </Box>
            )}

            {/* Generating state */}
            {phase === "generating" && (
              <Box>
                {/* Overall progress bar */}
                <Box sx={{ mb: 3 }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 1,
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{ color: colors.text, fontWeight: 600 }}
                    >
                      {stats.completedBlocks + stats.blocksFailed} of{" "}
                      {stats.totalBlocks} blocks
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: alpha(colors.text, 0.5) }}
                    >
                      {progressPercent}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={progressPercent}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      bgcolor: alpha(colors.primary, 0.1),
                      "& .MuiLinearProgress-bar": {
                        bgcolor: colors.primary,
                        borderRadius: 4,
                      },
                    }}
                  />
                  {/* Token/cache summary */}
                  <Typography
                    variant="caption"
                    sx={{
                      color: alpha(colors.text, 0.4),
                      mt: 0.5,
                      display: "block",
                    }}
                  >
                    {stats.cacheHits > 0 && `${stats.cacheHits} cached`}
                    {stats.blocksFailed > 0 &&
                      ` · ${stats.blocksFailed} failed`}
                  </Typography>
                </Box>

                {/* Page list */}
                <Box
                  sx={{
                    maxHeight: { xs: 300, sm: 400 },
                    overflow: "auto",
                    "&::-webkit-scrollbar": { width: 4 },
                    "&::-webkit-scrollbar-thumb": {
                      bgcolor: alpha(colors.text, 0.2),
                      borderRadius: 2,
                    },
                  }}
                >
                  <AnimatePresence>
                    {pages.map((page) => (
                      <motion.div
                        key={page.pageId}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1.5,
                            py: 1.5,
                            px: 1,
                            borderRadius: 1,
                            mb: 0.5,
                            bgcolor:
                              page.status === "current"
                                ? alpha(colors.primary, 0.05)
                                : "transparent",
                          }}
                        >
                          {page.status === "completed" && (
                            <CheckCircle
                              sx={{ color: "success.main", fontSize: 20 }}
                            />
                          )}
                          {page.status === "current" && (
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{
                                duration: 1.5,
                                repeat: Infinity,
                                ease: "linear",
                              }}
                            >
                              <CircularProgress
                                size={20}
                                thickness={4}
                                sx={{ color: colors.primary }}
                              />
                            </motion.div>
                          )}
                          {page.status === "pending" && (
                            <RadioButtonUnchecked
                              sx={{
                                color: alpha(colors.text, 0.3),
                                fontSize: 20,
                              }}
                            />
                          )}
                          {page.status === "failed" && (
                            <ErrorIcon
                              sx={{ color: "error.main", fontSize: 20 }}
                            />
                          )}
                          <Typography
                            variant="body2"
                            sx={{
                              color:
                                page.status === "current"
                                  ? colors.text
                                  : alpha(colors.text, 0.7),
                              fontWeight: page.status === "current" ? 600 : 400,
                              flex: 1,
                            }}
                          >
                            {page.pageName}
                          </Typography>
                          {page.status === "current" && (
                            <Typography
                              variant="caption"
                              sx={{ color: alpha(colors.text, 0.4) }}
                            >
                              {page.blockCount} blocks
                            </Typography>
                          )}
                        </Box>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </Box>

                {/* Failed blocks with retry */}
                {failedBlocks.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography
                      variant="subtitle2"
                      sx={{ color: "error.main", mb: 1, fontWeight: 600 }}
                    >
                      Failed blocks
                    </Typography>
                    {failedBlocks.map((block) => (
                      <Box
                        key={block.blockId}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          py: 1,
                          px: 1,
                          borderRadius: 1,
                          bgcolor: alpha("#f44336", 0.05),
                          mb: 0.5,
                        }}
                      >
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <ErrorIcon
                            sx={{ color: "error.main", fontSize: 16 }}
                          />
                          <Typography
                            variant="body2"
                            sx={{ color: colors.text }}
                          >
                            {block.blockType}
                          </Typography>
                        </Box>
                        {block.retrying ? (
                          <CircularProgress
                            size={16}
                            sx={{ color: colors.primary }}
                          />
                        ) : (
                          <DashboardActionButton
                            size="small"
                            onClick={() => handleBlockRetry(block)}
                            sx={{
                              minWidth: 44,
                              minHeight: 44,
                              fontSize: "0.75rem",
                            }}
                            aria-label={`Retry ${block.blockType} block`}
                          >
                            Retry
                          </DashboardActionButton>
                        )}
                      </Box>
                    ))}
                  </Box>
                )}
              </Box>
            )}

            {/* Complete state */}
            {phase === "complete" && (
              <Box sx={{ textAlign: "center", py: 3 }}>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", duration: 0.5 }}
                >
                  <CheckCircle
                    sx={{ fontSize: 48, color: "success.main", mb: 2 }}
                  />
                </motion.div>
                <Typography
                  variant="h6"
                  sx={{ color: colors.text, mb: 1, fontWeight: 600 }}
                >
                  Content Generated!
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: alpha(colors.text, 0.6), mb: 1 }}
                >
                  {stats.completedBlocks} blocks across {stats.pagesCompleted}{" "}
                  pages
                </Typography>
                {/* Token/cache summary */}
                <Typography
                  variant="caption"
                  sx={{
                    color: alpha(colors.text, 0.4),
                    display: "block",
                    mb: 3,
                  }}
                >
                  {stats.totalTokensUsed > 0 &&
                    `${stats.totalTokensUsed} tokens used`}
                  {stats.cacheHits > 0 && ` · ${stats.cacheHits} from cache`}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: alpha(colors.text, 0.5), mb: 2 }}
                >
                  Redirecting to editor in {countdown}s...
                </Typography>
                <DashboardGradientButton
                  onClick={handleGoToEditor}
                  sx={{ minWidth: 44, minHeight: 44 }}
                  aria-label="View your website"
                >
                  View Your Website
                </DashboardGradientButton>
              </Box>
            )}
          </DashboardCard>
        </Box>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert
            severity={snackbar.severity}
            onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    );
  },
);

AIGenerationProgress.displayName = "AIGenerationProgress";

export default AIGenerationProgress;
