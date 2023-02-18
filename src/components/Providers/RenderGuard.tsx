import React, { FC, PropsWithChildren, ReactNode } from "react";

interface Props extends PropsWithChildren {
  renderIf: boolean;
  fallbackComponent?: ReactNode;
}

export const RenderGuard: FC<Props> = ({
  children,
  renderIf,
  fallbackComponent,
}: Props) => (
  <>
    {renderIf && children}
    {!renderIf && (fallbackComponent ?? null)}
  </>
);

export default RenderGuard;
