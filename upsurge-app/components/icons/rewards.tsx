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
      d="M17.625 4.894 10.75 1.13a1.555 1.555 0 0 0-1.5 0L2.375 4.894a1.563 1.563 0 0 0-.813 1.37v7.471a1.562 1.562 0 0 0 .813 1.371L9.25 18.87a1.554 1.554 0 0 0 1.5 0l6.875-3.764a1.562 1.562 0 0 0 .813-1.37V6.264a1.562 1.562 0 0 0-.813-1.371ZM10 2.857l5.625 3.08L10 9.017 4.375 5.938 10 2.858ZM3.437 7.562l5.626 3.078v5.99l-5.626-3.08V7.562Zm7.5 9.068v-5.99l5.626-3.078v5.988l-5.625 3.08Z"
    />
  </svg>
);
export default SvgComponent;
