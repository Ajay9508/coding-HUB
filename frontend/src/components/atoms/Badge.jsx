const Badge = ({ children }) => {
  return (
    <span className="rounded-full bg-soft-orange px-3 py-1 text-xs font-medium text-coral">
      {children}
    </span>
  );
};

export default Badge;