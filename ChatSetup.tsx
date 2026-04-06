
/* Layer 1: Base is handled in TSX via bg-[#050505] */

/* Layer 2: The Grid - Static Terminal Aesthetic (Tinted Red) */
.terminal-grid {
    position: absolute;
    inset: 0;
    background-image: 
        linear-gradient(to right, rgba(220, 20, 60, 0.03) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(220, 20, 60, 0.03) 1px, transparent 1px);
    background-size: 40px 40px;
    pointer-events: none;
    z-index: 1;
}

.scanlines {
    position: absolute;
    inset: 0;
    background: linear-gradient(
        to bottom,
        transparent 50%,
        rgba(0, 0, 0, calc(0.1 + (var(--ui-intensity, 0.3) * 0.3))) 50%
    );
    background-size: 100% calc(4px - (var(--ui-intensity, 0.3) * 1px)); /* Scanlines get tighter as stress rises */
    pointer-events: none;
    z-index: 2;
}

/* 16mm Film Grain Texture */
.film-grain {
    position: absolute;
    inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.5'/%3E%3C/svg%3E");
    background-size: 150px 150px;
    animation: grain-dance 0.5s steps(3) infinite;
    opacity: 0.1;
    mix-blend-mode: overlay;
    pointer-events: none;
    z-index: 3;
}

@keyframes grain-dance {
    0% { background-position: 0 0; }
    33% { background-position: 50px -50px; }
    66% { background-position: -50px 50px; }
    100% { background-position: 25px -25px; }
}

/* Projector Flicker */
.projector-flicker {
    position: absolute;
    inset: 0;
    background: white;
    opacity: 0;
    animation: flicker-anim 4s infinite steps(12);
    mix-blend-mode: overlay;
    pointer-events: none;
    z-index: 4;
}

@keyframes flicker-anim {
    0% { opacity: 0.01; }
    5% { opacity: 0.03; }
    10% { opacity: 0.01; }
    15% { opacity: 0.04; }
    30% { opacity: 0.01; }
    50% { opacity: 0.01; }
    55% { opacity: 0.03; }
    60% { opacity: 0.01; }
    90% { opacity: 0.05; }
    100% { opacity: 0.01; }
}

/* Layer 3: The Glitch - Erratic Burst (Decorative Only) */
@keyframes glitch-burst {
    0% { clip-path: inset(0 0 0 0); transform: translate(0); opacity: 1; }
    2% { clip-path: inset(10% 0 80% 0); transform: translate(-5px, 2px); opacity: 0.8; }
    4% { clip-path: inset(0 0 0 0); transform: translate(0); opacity: 1; }
    30% { clip-path: inset(0 0 0 0); transform: translate(0); opacity: 1; }
    32% { clip-path: inset(60% 0 10% 0); transform: translate(5px, -2px); opacity: 0.7; }
    34% { clip-path: inset(0 0 0 0); transform: translate(0); opacity: 1; }
    100% { clip-path: inset(0 0 0 0); transform: translate(0); opacity: 1; }
}

.decorative-glitch {
    animation: glitch-burst 8s infinite;
}

/* Stabilized Interactive Elements (Red Theme) */
.terminal-button {
    @apply relative flex items-center justify-center px-12 py-4 border-2 border-red-600/40 bg-black text-red-500 font-sans font-bold uppercase tracking-[0.2em] transition-all duration-200;
    box-shadow: 0 0 20px rgba(220, 20, 60, 0.05);
}

.terminal-button:hover {
    @apply border-red-500 bg-red-600/10 text-red-400;
    box-shadow: 0 0 30px rgba(220, 20, 60, 0.15);
}

.terminal-button:active {
    @apply scale-[0.98] bg-red-600/20;
}

/* Typography */
.font-terminal {
    font-family: 'JetBrains Mono', 'Fira Code', monospace;
}

/* Typewriter Cursor */
.cursor-blink {
    display: inline-block;
    width: 0.6em;
    height: 1.2em;
    background-color: currentColor;
    margin-left: 2px;
    vertical-align: middle;
    animation: blink 1s step-end infinite;
}

@keyframes blink {
    from, to { opacity: 1; }
    50% { opacity: 0; }
}

/* Diagnostic Corners */
.diagnostic-tag {
    @apply font-terminal text-[10px] text-red-600/40 uppercase tracking-widest p-4;
}

.diagnostic-tag b {
    @apply text-red-600/80;
}

/* Gear Spin Animations */
@keyframes gear-spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
}

@keyframes gear-spin-reverse {
    from { transform: rotate(360deg); }
    to { transform: rotate(0deg); }
}

.gear-spin {
    animation: gear-spin 12s linear infinite;
}

.gear-spin-reverse {
    animation: gear-spin-reverse 8s linear infinite;
}

/* Steam Particles */
@keyframes steam {
    0% { transform: translateY(0) scale(1); opacity: 0; }
    50% { opacity: 0.3; }
    100% { transform: translateY(-100px) scale(2); opacity: 0; }
}

.steam-particle {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    filter: blur(10px);
    position: absolute;
    animation: steam 4s infinite ease-out;
}

.steam-1 { left: 40%; animation-delay: 0s; }
.steam-2 { left: 50%; animation-delay: 1.5s; }
.steam-3 { left: 60%; animation-delay: 3s; }
