import { Component, ErrorInfo, PropsWithChildren } from "react";

import { Layout } from "@/components";
import UnknownState from "@/components/Layouts/UnknownState";

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
        <Layout.Base
          showAffix={false}
          layoutStylesOverwrite={{
            display: "flex",
            flexDirection: "column",
            placeContent: "center",
            placeItems: "center",
          }}
        >
          <UnknownState
            svgNode={<ErrorServer />}
            title="Something went wrong"
            subtitle="a component error occurred"
          />
        </Layout.Base>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
