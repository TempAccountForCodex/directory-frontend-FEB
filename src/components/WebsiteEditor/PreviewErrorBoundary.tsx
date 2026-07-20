/**
 * Error boundary for the editor preview (TemplateEngine / TemplatePageShell).
 *
 * The preview renders template markup into an iframe portal and mixes React
 * rendering with imperative DOM work (selection overlays, container-style /
 * background-video application). A structural change — e.g. deleting an element
 * or container — can occasionally make React's commit-phase removal hit a node
 * that is no longer where it expects ("Failed to execute 'removeChild' on
 * 'Node': The node to be removed is not a child of this node."), which would
 * otherwise white-screen the whole editor route.
 *
 * The data after such an edit is valid, so instead of a dead fallback we
 * RECOVER: unmount the crashed subtree, then remount it with a fresh key so it
 * rebuilds cleanly from the current content. A retry cap prevents an infinite
 * loop if an error is genuinely deterministic.
 */

import React, { Component } from "react";
import type { ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
  /** Changing this (e.g. when the source data changes) clears a sticky error. */
  resetKey?: unknown;
}

interface State {
  hasError: boolean;
  remountKey: number;
  failureCount: number;
  lastResetKey: unknown;
}

const MAX_AUTO_RECOVERIES = 8;

class PreviewErrorBoundary extends Component<Props, State> {
  state: State = {
    hasError: false,
    remountKey: 0,
    failureCount: 0,
    lastResetKey: undefined,
  };

  static getDerivedStateFromError(): Partial<State> {
    return { hasError: true };
  }

  static getDerivedStateFromProps(
    props: Props,
    state: State,
  ): Partial<State> | null {
    // A new resetKey (the source data changed) clears the failure counter so a
    // previously fatal error can render the latest content again.
    if (props.resetKey !== state.lastResetKey) {
      return { lastResetKey: props.resetKey, failureCount: 0 };
    }
    return null;
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // eslint-disable-next-line no-console
    console.warn(
      "[PreviewErrorBoundary] recovered from a preview render error:",
      error?.message,
      info?.componentStack?.split("\n")?.[1]?.trim(),
    );
    this.setState((prev) => ({
      hasError: false,
      remountKey: prev.remountKey + 1,
      failureCount: prev.failureCount + 1,
    }));
  }

  render() {
    // Deterministic error (exceeded retries): render nothing rather than
    // white-screen the editor. The next data change resets the counter.
    if (this.state.failureCount >= MAX_AUTO_RECOVERIES) {
      return null;
    }
    // Transient: crashed subtree has been unmounted; wait for the remount that
    // componentDidCatch schedules.
    if (this.state.hasError) {
      return null;
    }
    return (
      <React.Fragment key={this.state.remountKey}>
        {this.props.children}
      </React.Fragment>
    );
  }
}

export default PreviewErrorBoundary;
