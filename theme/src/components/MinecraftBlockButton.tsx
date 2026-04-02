import React from 'react';
import { cn } from "@/lib/utils";

interface MinecraftBlockButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
}

export function MinecraftBlockButton({ children, className, ...props }: MinecraftBlockButtonProps) {
    return (
        <div className={cn("relative inline-block", className)}>
            {/* 3D Side Effect (Dirt) */}
            <div
                className="absolute inset-x-0 bottom-0 h-full translate-y-[8px] rounded-2xl border-2 border-black/40 overflow-hidden brightness-50"
            >
                <div
                    className="w-full h-full bg-[url('/assets/minecraft/dirt_side.png')] bg-repeat"
                    style={{ backgroundSize: '48px', imageRendering: 'pixelated' }}
                />
            </div>

            <button
                className="relative px-12 py-5 rounded-2xl border-2 border-black/60 overflow-hidden shadow-inner group transition-all duration-100 active:translate-y-[6px]"
                {...props}
            >
                {/* Grass Top Texture */}
                <div
                    className="absolute inset-0 bg-[url('/assets/minecraft/grass_top.png')] bg-repeat brightness-110 group-hover:brightness-125 transition-all"
                    style={{ backgroundSize: '48px', imageRendering: 'pixelated' }}
                />

                {/* Inner shadow/bevel */}
                <div className="absolute inset-0 border-t-4 border-white/30 border-l-4 border-white/20 border-r-4 border-black/20 border-b-4 border-black/40" />

                {/* Content */}
                <div className="relative z-10 flex items-center justify-center gap-3 text-white font-display font-black text-2xl drop-shadow-[0_3px_0_rgba(0,0,0,0.8)] tracking-tight">
                    {children}
                </div>
            </button>
        </div>
    );
}
