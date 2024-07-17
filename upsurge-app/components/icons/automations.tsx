import * as React from 'react';
const SvgComponent = (props: any) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={20}
    height={20}
    fill="none"
    {...props}
  >
    <path
      fill={props.innerFill ?? '#A8A8BD'}
      d="M17.5 15.313h-.313V3.124a.938.938 0 0 0-.937-.938h-4.375a.937.937 0 0 0-.938.938v2.813H7.5a.937.937 0 0 0-.938.937v2.813H3.75a.937.937 0 0 0-.938.937v4.688H2.5a.938.938 0 0 0 0 1.874h15a.938.938 0 0 0 0-1.875Zm-4.688-11.25h2.5v11.25h-2.5V4.063Zm-4.374 3.75h2.5v7.5h-2.5v-7.5Zm-3.75 3.75h1.875v3.75H4.688v-3.75Z"
    />
  </svg>
);
export default SvgComponent;
