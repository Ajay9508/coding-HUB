const StatCard = ({
  title,
  value,
  subtitle,
  icon,
}) => {
  return (
    <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted">{title}</p>

          <h3 className="mt-2 text-3xl font-bold">
            {value}
          </h3>

          <p className="mt-1 text-xs text-muted">
            {subtitle}
          </p>
        </div>

        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-soft-orange text-2xl">
          {icon}
        </div>
      </div>
    </div>
  );
};

export default StatCard;