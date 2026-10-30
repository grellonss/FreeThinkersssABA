import React from "react";

/**
 * CulturalGuideLogo - Split Swiss & Italian Emblem
 * Left half: Swiss Red with White Cross (ESN Olten)
 * Right half: Italian Tricolor Green-White-Red (ESN Camerino)
 */
export function CulturalGuideLogo({ size = "md", showText = true, showSubtitle = true, onClick }) {
    const emblemSizes = {
        sm: { width: 34, height: 34, radius: 8 },
        md: { width: 44, height: 44, radius: 11 },
        lg: { width: 72, height: 72, radius: 18 },
    };

    const cfg = emblemSizes[size] || emblemSizes.md;

    const emblem = (
        <div
            className="relative overflow-hidden shadow-md flex-shrink-0 border border-black/10 transition-transform duration-200 group-hover:scale-105"
            style={{
                width: cfg.width,
                height: cfg.height,
                borderRadius: cfg.radius,
            }}
        >
            {/* Left 50% - Switzerland (Red + White Cross) */}
            <div
                className="absolute top-0 left-0 w-1/2 h-full bg-[#D52B1E] flex items-center justify-center overflow-hidden"
                title="Svizzera - ESN Olten"
            >
                {/* Swiss Cross */}
                <div className="relative w-full h-full flex items-center justify-end pr-[2px]">
                    {/* Vertical bar of white cross */}
                    <div
                        className="absolute bg-white rounded-xs shadow-xs"
                        style={{
                            width: `${cfg.width * 0.16}px`,
                            height: `${cfg.height * 0.54}px`,
                            right: `${cfg.width * 0.08}px`,
                        }}
                    />
                    {/* Horizontal bar of white cross */}
                    <div
                        className="absolute bg-white rounded-xs shadow-xs"
                        style={{
                            width: `${cfg.width * 0.36}px`,
                            height: `${cfg.height * 0.16}px`,
                            right: `0px`,
                        }}
                    />
                </div>
            </div>

            {/* Right 50% - Italy (Green / White / Red Tricolor) */}
            <div
                className="absolute top-0 right-0 w-1/2 h-full flex overflow-hidden"
                title="Italia - ESN Camerino"
            >
                {/* Italian Green */}
                <div className="w-1/3 h-full bg-[#008C45]" />
                {/* Italian White */}
                <div className="w-1/3 h-full bg-[#F4F5F0]" />
                {/* Italian Red */}
                <div className="w-1/3 h-full bg-[#CD212A]" />
            </div>

            {/* Center subtle divider sheen */}
            <div className="absolute top-0 bottom-0 left-1/2 -ml-[1px] w-[2px] bg-black/15 shadow-sm z-10" />
        </div>
    );

    if (!showText) {
        return onClick ? (
            <button onClick={onClick} className="group flex items-center focus:outline-none">
                {emblem}
            </button>
        ) : emblem;
    }

    return (
        <div
            onClick={onClick}
            className={`group inline-flex items-center gap-3 ${onClick ? "cursor-pointer select-none" : ""}`}
        >
            {emblem}

            <div className="flex flex-col text-left">
                <span className={`font-black tracking-tight leading-tight transition-colors ${
                    size === "lg" ? "text-2xl md:text-3xl text-gray-900" :
                    size === "sm" ? "text-base text-gray-900 group-hover:text-red-600" :
                    "text-xl text-gray-900 group-hover:text-red-600"
                }`}>
                    <span className="text-red-600">Cultural</span>
                    <span className="text-green-700 ml-1">Guide</span>
                </span>

                {showSubtitle && (
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-500 tracking-wide mt-0.5">
                        <span className="inline-flex items-center text-red-600 font-bold">🇨🇭 Olten</span>
                        <span className="text-gray-300">•</span>
                        <span className="inline-flex items-center text-green-700 font-bold">🇮🇹 Camerino</span>
                    </div>
                )}
            </div>
        </div>
    );
}
