import { CheckCircle2, Link2 } from "lucide-react";

const benefits = [
  "Track your progress across all platforms",
  "Compare ratings and ranks",
  "Get personalized insights and recommendations",
  "View upcoming contests",
  "Access roadmaps and resources",
];

const WhyConnectCard = ({ onConnectNew }) => {
  return (
    <article className="flex flex-col justify-between rounded-3xl border border-[#E9E2D8] bg-[#FFFDF9] p-6 shadow-xs hover:shadow-md transition-all">
      <div>
        {/* Header */}
        <div className="flex items-center gap-3.5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFF0DA] text-2xl shadow-xs">
            🚀
          </div>
          <h3 className="text-xl font-black text-[#171717]">Why Connect Your Profiles?</h3>
        </div>

        {/* Benefits Checklist */}
        <ul className="mt-6 space-y-3.5" aria-label="Benefits of connecting profiles">
          {benefits.map((benefit) => (
            <li key={benefit} className="flex items-start gap-2.5 text-xs text-[#4A4A4A]">
              <CheckCircle2
                size={16}
                className="mt-0.5 shrink-0 text-[#16A34A] fill-[#E8F8EE]"
              />
              <span className="leading-snug font-medium">{benefit}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* CTA Button */}
      <div className="mt-8 pt-4">
        <button
          type="button"
          onClick={onConnectNew}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#FFD05A] px-5 py-3.5 text-xs sm:text-sm font-bold text-[#171717] shadow-xs transition hover:bg-[#FFA057]"
        >
          <Link2 size={16} />
          Connect New Platform
        </button>
      </div>
    </article>
  );
};

export default WhyConnectCard;
