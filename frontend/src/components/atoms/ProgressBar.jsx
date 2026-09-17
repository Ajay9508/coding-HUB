const ProgressBar = ({ value }) => {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-border">
      <div
        className="h-full rounded-full bg-coral transition-all"
        style={{ width: `${value}%` }}
      />
    </div>
  );
};

export default ProgressBar;