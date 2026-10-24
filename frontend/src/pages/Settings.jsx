import { useState } from "react";
import { Bell, Database, CheckCircle2, Save } from "lucide-react";
import AppLayout from "../components/organisms/AppLayout";

const Settings = () => {
  const [contestAlerts, setContestAlerts] = useState(true);
  const [emailDigest, setEmailDigest] = useState(false);
  const [autoSync, setAutoSync] = useState(true);
  const [defaultLanguage, setDefaultLanguage] = useState("javascript");
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <AppLayout>
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-[#FED7B2] bg-gradient-to-r from-[#FFF4E6] via-[#FEEBD9] to-[#FEDBC0] p-6 sm:p-8 shadow-xs mb-8">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl bg-gradient-to-b from-[#FFE8B2] to-[#FFD05A] text-3xl shadow-sm border-2 border-white/80">
            ⚙️
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#171717] tracking-tight">
              Settings & Account Preferences
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-[#5F5F5F] max-w-xl">
              Configure your notifications, IDE default preferences, synchronized platform schedules,
              and security credentials.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-3xl space-y-6">
        {savedSuccess && (
          <div className="flex items-center gap-2 rounded-2xl bg-[#E8F8EE] p-4 text-xs font-bold text-[#16A34A] shadow-xs">
            <CheckCircle2 size={16} />
            Preferences updated successfully!
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          {/* Section 1: Notifications */}
          <div className="rounded-3xl border border-[#E9E2D8] bg-white p-6 sm:p-7 shadow-xs">
            <div className="flex items-center gap-2.5 pb-4 border-b border-[#F2ECE4]">
              <Bell className="text-[#FFA057]" size={20} />
              <h2 className="text-base font-black text-[#171717]">Contest & Sync Notifications</h2>
            </div>

            <div className="mt-4 space-y-4">
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <p className="text-xs font-bold text-[#171717]">Upcoming Contest Reminders</p>
                  <p className="text-[11px] text-[#7A7A7A]">
                    Notify 1 hour before scheduled Codeforces, LeetCode, and local contests start.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={contestAlerts}
                  onChange={(e) => setContestAlerts(e.target.checked)}
                  className="h-5 w-5 accent-[#FFD05A] rounded"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <p className="text-xs font-bold text-[#171717]">Automatic Stats Syncing</p>
                  <p className="text-[11px] text-[#7A7A7A]">
                    Sync newly solved problems and rating changes in the background daily.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={autoSync}
                  onChange={(e) => setAutoSync(e.target.checked)}
                  className="h-5 w-5 accent-[#FFD05A] rounded"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <p className="text-xs font-bold text-[#171717]">Weekly Performance Digest</p>
                  <p className="text-[11px] text-[#7A7A7A]">
                    Receive an email summary of your solved problems and rating progression.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={emailDigest}
                  onChange={(e) => setEmailDigest(e.target.checked)}
                  className="h-5 w-5 accent-[#FFD05A] rounded"
                />
              </label>
            </div>
          </div>

          {/* Section 2: IDE & Editor Defaults */}
          <div className="rounded-3xl border border-[#E9E2D8] bg-white p-6 sm:p-7 shadow-xs">
            <div className="flex items-center gap-2.5 pb-4 border-b border-[#F2ECE4]">
              <Database className="text-[#3B82F6]" size={20} />
              <h2 className="text-base font-black text-[#171717]">IDE Defaults & Language</h2>
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#171717] mb-1.5">
                  Default Programming Language
                </label>
                <select
                  value={defaultLanguage}
                  onChange={(e) => setDefaultLanguage(e.target.value)}
                  className="w-full rounded-2xl border border-[#E9E2D8] bg-[#FFFBF5] px-3.5 py-2.5 text-xs text-[#171717] outline-none"
                >
                  <option value="javascript">JavaScript (ES2024)</option>
                  <option value="python">Python 3.12</option>
                  <option value="cpp">C++20</option>
                  <option value="java">Java 21</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#171717] mb-1.5">
                  Editor Tab Size
                </label>
                <select
                  defaultValue="2"
                  className="w-full rounded-2xl border border-[#E9E2D8] bg-[#FFFBF5] px-3.5 py-2.5 text-xs text-[#171717] outline-none"
                >
                  <option value="2">2 Spaces</option>
                  <option value="4">4 Spaces</option>
                </select>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-2 rounded-2xl bg-[#171717] px-6 py-3 text-xs sm:text-sm font-bold text-white hover:bg-black transition shadow-xs"
            >
              <Save size={16} />
              Save Preferences
            </button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
};

export default Settings;
