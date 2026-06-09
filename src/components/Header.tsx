import { Youtube, Sparkles } from "lucide-react";

export default function Header() {
  return (
    <div id="app-header" className="text-center py-10 md:py-14 border-b border-gray-100 bg-white shadow-xs">
      <div className="max-w-4xl mx-auto px-4">
        <div className="inline-flex items-center gap-2 bg-rose-50 border border-rose-100 text-rose-600 px-3 py-1 rounded-full text-xs font-medium mb-4">
          <Youtube size={14} className="animate-pulse" />
          <span>YouTube Naming Engine</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-extrabold font-display tracking-tight text-gray-900 leading-tight">
          Linguistic Brand Architect
        </h1>
        <p className="mt-3 text-base md:text-lg text-gray-500 max-w-2xl mx-auto font-light leading-relaxed">
          Describe your channel's soul. Our parallel linguistic engines will design 9 scientifically graded names structured to scale.
        </p>
      </div>
    </div>
  );
}
