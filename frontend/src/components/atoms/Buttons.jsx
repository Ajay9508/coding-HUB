const Button = ({
  children,
  variant = "primary",
  onClick,
  type = "button"
}) => {
  const styles = {
    primary:
      "bg-[#FF7378] text-white hover:bg-[#F35F67]",

    secondary:
      "border border-[#E9E2D8] bg-white text-[#171717] hover:bg-[#FFF0DA]",

    yellow:
      "bg-[#FFD05A] text-[#171717] hover:bg-[#FFA057]"
  };

  return (
    <button
      type={type}
      onClick={onClick}
      className={`
        rounded-xl
        px-5 py-3
        font-semibold
        transition
        ${styles[variant]}
      `}
    >
      {children}
    </button>
  );
};

export default Button;