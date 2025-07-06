import { Component } from "react";

export default class AppErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-screen gap-4">
          <h1 className="text-3xl font-bold">Something went wrong 😓</h1>
          <p className="text-zinc-400">
            Please refresh, or contact us if it keeps happening because your defininely doing something wrong.
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}
