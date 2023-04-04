import React, { FC, PropsWithChildren, ReactNode } from "react";

import ErrorBoundary from "@/components/Providers/ErrorBoundary";

interface Props extends PropsWithChildren {
  renderIf: boolean;
  fallbackComponent?: ReactNode;
}

export const RenderGuard: FC<Props> = ({
  children,
  renderIf,
  fallbackComponent,
}: Props) => (
  <ErrorBoundary>
    {renderIf ? children : fallbackComponent ?? null}
  </ErrorBoundary>
);

export default RenderGuard;
