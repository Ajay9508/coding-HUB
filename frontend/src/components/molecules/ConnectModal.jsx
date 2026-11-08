import { useState } from "react";
import { X, Check, Link2, Unlink } from "lucide-react";
import { PlatformLogo } from "./PlatformCard";

const ConnectModalInner = ({ onClose, initialPlatform, platforms, onSave }) => {
  const [selectedPlatformId, setSelectedPlatformId] = useState(
    initialPlatform?.id || platforms[0]?.id || ""
  );
  const [handle, setHandle] = useState(initialPlatform?.handle || "");
  const [statusMessage, setStatusMessage] = useState("");
  const [statusError, setStatusError] = useState(false);
  const [saving, setSaving] = useState(false);

  const currentPlatform =
    platforms.find((p) => p.id === selectedPlatformId) || initialPlatform;

  const handlePlatformChange = (e) => {
    const newId = e.target.value;
    setSelectedPlatformId(newId);
    const selected = platforms.find((p) => p.id === newId);
    setHandle(selected?.handle || "");
    setStatusMessage("");
    setStatusError(false);
  };

  const handleConnect = async (e) => {
    e.preventDefault();
    if (!handle.trim()) {
      setStatusMessage("Please enter your platform handle / username.");
      return;
    }

    setSaving(true);
    try {
      await onSave({ id: currentPlatform.id, isConnected: true, handle: handle.trim() });
      setStatusMessage("Platform connected to your account.");
      setStatusError(false);
      setTimeout(onClose, 400);
    } catch (error) {
      setStatusMessage(error.message || error.response?.data?.message || "Could not connect this platform.");
      setStatusError(true);
    } finally {
      setSaving(false);
    }
  };

  const handleDisconnect = async () => {
    setSaving(true);
    try {
      await onSave({ id: currentPlatform.id, isConnected: false, handle: "" });
      setStatusMessage("Platform disconnected.");
      setStatusError(false);
      setTimeout(onClose, 400);
    } catch (error) {
      setStatusMessage(error.response?.data?.message || "Could not disconnect this platform.");
      setStatusError(true);
    } finally {
      setSaving(false);
    }
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
      <div className="relative z-10 w-full max-w-md rounded-3xl border border-[#B9E4E8] bg-white p-6 sm:p-8 shadow-2xl dark:bg-[#0c2133] dark:border-[#167D8D]/40">
        <div className="flex items-center justify-between pb-4 border-b border-[#B9E4E8]/40 dark:border-[#167D8D]/30">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EEEEEE] border border-[#B9E4E8]/50 dark:bg-[#071B2B] dark:border-[#167D8D]/40">
              {currentPlatform && <PlatformLogo type={currentPlatform.logoType} />}
            </div>
            <div>
              <h3 className="text-lg font-black text-[#071B2B] dark:text-[#EEEEEE]">
                {currentPlatform?.isConnected ? "Manage Connection" : "Connect Platform"}
              </h3>
              <p className="text-xs text-[#526574] dark:text-[#B9E4E8]/80">
                Link a public profile handle to your account
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="rounded-xl p-1.5 text-[#526574] hover:bg-[#B9E4E8]/40 dark:text-[#B9E4E8] dark:hover:bg-[#167D8D]/30 transition"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleConnect} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#071B2B] dark:text-[#EEEEEE] mb-1.5">
              Select Platform
            </label>
            <select
              value={selectedPlatformId}
              onChange={handlePlatformChange}
              className="w-full rounded-2xl border border-[#B9E4E8] bg-[#EEEEEE] dark:bg-[#071B2B] dark:text-[#EEEEEE] dark:border-[#167D8D]/40 px-4 py-3 text-sm font-semibold text-[#071B2B] outline-none focus:border-[#167D8D]"
            >
              {platforms.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} {p.isConnected ? "✓ (Connected)" : ""}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#071B2B] dark:text-[#EEEEEE] mb-1.5">
              Username / Handle
            </label>
            <input
              type="text"
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              placeholder="e.g. tourist, neal_wu"
              required
              className="w-full rounded-2xl border border-[#B9E4E8] bg-white dark:bg-[#071B2B] dark:text-[#EEEEEE] dark:border-[#167D8D]/40 px-4 py-3 text-sm text-[#071B2B] outline-none focus:border-[#167D8D] focus:ring-2 focus:ring-[#167D8D]/25 transition"
            />
          </div>

          {statusMessage && (
            <div role={statusError ? "alert" : "status"} className={`rounded-xl p-3 text-xs font-semibold flex items-center gap-2 ${statusError ? "bg-[#B9E4E8]/40 text-[#071B2B] border border-[#167D8D]" : "bg-[#B9E4E8] text-[#071B2B] font-bold"}`}>
              {!statusError && <Check size={16} />}
              {statusMessage}
            </div>
          )}

          <div className="pt-3 flex items-center justify-end gap-3">
            {currentPlatform?.isConnected && (
              <button
                type="button"
                onClick={handleDisconnect}
                disabled={saving}
                className="inline-flex items-center gap-1.5 rounded-xl border border-[#B9E4E8] bg-[#EEEEEE] px-4 py-2.5 text-xs font-bold text-[#071B2B] hover:bg-[#B9E4E8] dark:bg-[#071B2B] dark:text-[#EEEEEE] dark:border-[#167D8D]/40 transition"
              >
                <Unlink size={14} />
                Disconnect
              </button>
            )}

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-[#167D8D] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#11626F] transition shadow-xs"
            >
              <Link2 size={14} />
              {saving ? "Saving…" : currentPlatform?.isConnected ? "Update Handle" : "Connect Account"}
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
