"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";

type Props = { children: ReactNode };
type State = { hasError: boolean; message: string };

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: "" };

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      message: error.message || "Unable to display this workspace.",
    };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Workspace rendering failed", error, info.componentStack);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <section className="mx-auto max-w-xl rounded-2xl border border-red-200 bg-red-50 p-6 text-red-900">
        <h2 className="text-lg font-bold">Something went wrong</h2>
        <p className="mt-2 text-sm">This workspace could not display the latest data.</p>
        <p className="mt-2 break-words text-xs text-red-700">{this.state.message}</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-5 rounded-lg bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-800"
        >
          Try again
        </button>
      </section>
    );
  }
}