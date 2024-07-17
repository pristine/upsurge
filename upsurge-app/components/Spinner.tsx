interface SpinnerProps {
  className?: string;
  dark?: boolean;
}

const Spinner = ({ className, dark = true }: SpinnerProps) => (
  <div className="h-6 w-6 border-2 rounded-full animate-spin border-black/75 border-t-black/25" />
);

export default Spinner;
