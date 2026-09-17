const NavItem = ({ icon, label, active = false, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm transition ${
        active
          ? "bg-cream font-semibold text-coral"
          : "text-text hover:bg-soft-orange"
      }`}
    >
      <span>{icon}</span>
      <span>{label}</span>
    </button>
  );
};

export default NavItem;
