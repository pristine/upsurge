'use client'; // this line is important
import { type FC, type PropsWithChildren } from 'react';
import '@/lib/iframe';
import { Theme } from 'frosted-ui';

export const ClientLayout: FC<PropsWithChildren> = ({ children }) => {
  return (
    <div>
      <Theme appearance="dark">{children}</Theme>
    </div>
  );
};
