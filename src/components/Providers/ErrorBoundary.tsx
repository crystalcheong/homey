import dynamic from "next/dynamic";
import { Component, ErrorInfo, PropsWithChildren } from "react";
const UnknownState = dynamic(() => import("@/components/Layouts/UnknownState"));

import ErrorServer from "~/assets/images/error-server.svg";

type Props = PropsWithChildren;

interface State {
  hasError: boolean;
}

/**
 * @link https://react-typescript-cheatsheet.netlify.app/docs/basic/getting-started/error_boundaries/
 */
export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(_: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <UnknownState
          svgNode={<ErrorServer />}
          title="Something went wrong"
          subtitle="a component error occurred"
        />
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
