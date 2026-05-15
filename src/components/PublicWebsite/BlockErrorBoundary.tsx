/**
 * Error Boundary for Block Renderer
 * Catches errors in individual blocks to prevent entire page crashes
 */

import React, { Component } from "react";
import type { ErrorInfo, ReactNode } from "react";
import { Box, Container, Typography, Alert } from "@mui/material";

interface Props {
  children: ReactNode;
  blockType?: string;
  blockId?: number;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class BlockErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Block rendering error:", {
      blockType: this.props.blockType,
      blockId: this.props.blockId,
      error: error.message,
      errorInfo,
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box sx={{ py: 4, bgcolor: "error.light" }}>
          <Container>
            <Alert severity="error">
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                Block Rendering Error
              </Typography>
              <Typography variant="caption" display="block">
                Block Type: {this.props.blockType || "Unknown"}
              </Typography>
              {this.state.error && (
                <Typography
                  variant="caption"
                  display="block"
                  sx={{ mt: 1, fontFamily: "monospace" }}
                >
                  {this.state.error.message}
                </Typography>
              )}
            </Alert>
          </Container>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default BlockErrorBoundary;
