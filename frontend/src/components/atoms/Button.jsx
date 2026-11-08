const Button = ({ children, variant = "primary", onClick, type = "button", className = "" }) => {
  const styles = {
    primary: "bg-[#689D4B] text-white hover:bg-[#58863F] shadow-xs font-semibold",
    secondary: "border border-[#91AE6E] bg-white text-[#1A241A] hover:bg-[#E5ECE2] dark:bg-[#1D261D] dark:text-[#F2F2F2] dark:border-[#2E3D2E] dark:hover:bg-[#253225] font-semibold",
    coral: "bg-[#D96868] text-white hover:bg-[#C85555] shadow-xs font-semibold",
    yellow: "bg-[#91AE6E] text-white hover:bg-[#7E9A5E] font-semibold shadow-xs",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      className={`rounded-xl px-5 py-3 transition ${styles[variant] || styles.primary} ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;
