import { useState } from "react";
import { X, Check, Link2, Unlink } from "lucide-react";
import { PlatformLogo } from "./PlatformCard";

const ConnectModalInner = ({ onClose, initialPlatform, platforms, onSave }) => {
  const [selectedPlatformId, setSelectedPlatformId] = useState(
    initialPlatform?.id || platforms[0]?.id || ""
  );
  const [handle, setHandle] = useState(initialPlatform?.handle || "");
  const [statusMessage, setStatusMessage] = useState("");

  const currentPlatform =
    platforms.find((p) => p.id === selectedPlatformId) || initialPlatform;

  const handlePlatformChange = (e) => {
    const newId = e.target.value;
    setSelectedPlatformId(newId);
    const selected = platforms.find((p) => p.id === newId);
    setHandle(selected?.handle || "");
    setStatusMessage("");
  };

  const handleConnect = (e) => {
    e.preventDefault();
    if (!handle.trim()) {
      setStatusMessage("Please enter your platform handle / username.");
      return;
    }

    onSave({
      id: currentPlatform.id,
      isConnected: true,
      handle: handle.trim(),
    });

    setStatusMessage("Platform connected successfully! 🎉");
    setTimeout(() => {
      setStatusMessage("");
      onClose();
    }, 600);
  };

  const handleDisconnect = () => {
    onSave({
      id: currentPlatform.id,
      isConnected: false,
      handle: "",
    });

    setStatusMessage("Platform disconnected.");
    setTimeout(() => {
      setStatusMessage("");
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div className="relative z-10 w-full max-w-md rounded-3xl border border-[#E9E2D8] bg-white p-6 sm:p-8 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-[#F2ECE4]">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FFF8EE] border border-[#F2ECE4]">
              {currentPlatform && <PlatformLogo type={currentPlatform.logoType} />}
            </div>
            <div>
              <h3 className="text-lg font-black text-[#171717]">
                {currentPlatform?.isConnected ? "Manage Connection" : "Connect Platform"}
              </h3>
              <p className="text-xs text-[#7A7A7A]">
                Sync your stats, ratings and problem counts
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="rounded-xl p-1.5 text-[#7A7A7A] hover:bg-[#FFF0DA] transition"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleConnect} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#171717] mb-1.5">
              Select Platform
            </label>
            <select
              value={selectedPlatformId}
              onChange={handlePlatformChange}
              className="w-full rounded-2xl border border-[#E9E2D8] bg-[#FFFBF5] px-4 py-3 text-sm font-semibold text-[#171717] outline-none focus:border-[#FF8E3C]"
            >
              {platforms.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} {p.isConnected ? "✓ (Connected)" : ""}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#171717] mb-1.5">
              Username / Handle
            </label>
            <input
              type="text"
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              placeholder="e.g. tourist, neal_wu"
              required
              className="w-full rounded-2xl border border-[#E9E2D8] px-4 py-3 text-sm text-[#171717] outline-none focus:border-[#FF8E3C] focus:ring-2 focus:ring-[#FF8E3C]/20 transition"
            />
          </div>

          {statusMessage && (
            <div className="rounded-xl bg-[#E8F8EE] p-3 text-xs font-semibold text-[#16A34A] flex items-center gap-2">
              <Check size={16} />
              {statusMessage}
            </div>
          )}

          <div className="pt-3 flex items-center justify-end gap-3">
            {currentPlatform?.isConnected && (
              <button
                type="button"
                onClick={handleDisconnect}
                className="inline-flex items-center gap-1.5 rounded-xl border border-[#FFE2DE] bg-[#FFF5F5] px-4 py-2.5 text-xs font-bold text-[#F35F67] hover:bg-[#FFE2DE] transition"
              >
                <Unlink size={14} />
                Disconnect
              </button>
            )}

            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-xl bg-[#171717] px-5 py-2.5 text-xs font-bold text-white hover:bg-black transition shadow-xs"
            >
              <Link2 size={14} />
              {currentPlatform?.isConnected ? "Update Handle" : "Connect Account"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ConnectModal = ({ isOpen, onClose, platform, platforms, onSave }) => {
  if (!isOpen) return null;

  return (
    <ConnectModalInner
      key={`${platform?.id || "default"}-${isOpen}`}
      onClose={onClose}
      initialPlatform={platform}
      platforms={platforms}
      onSave={onSave}
    />
  );
};

export default ConnectModal;
