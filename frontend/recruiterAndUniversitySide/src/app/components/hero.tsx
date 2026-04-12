import { ArrowRight, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useRef } from "react";
import { useTheme } from "./theme-context";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};
const stagger = { visible: { transition: { staggerChildren: 0.12 } } };

function Cube3D({ dk }: { dk: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let animationId: number;
    let mouseX = 0;
    let mouseY = 0;
    let currentX = 0;
    let currentY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      mouseX = ((e.clientX - rect.left) / rect.width - 0.5) * 30;
      mouseY = ((e.clientY - rect.top) / rect.height - 0.5) * -30;
    };

    const animate = () => {
      currentX += (mouseX - currentX) * 0.05;
      currentY += (mouseY - currentY) * 0.05;
      const cube = containerRef.current?.querySelector(".cube") as HTMLElement;
      if (cube) {
        cube.style.transform = `rotateX(${currentY + 25}deg) rotateY(${currentX + 35}deg)`;
      }
      animationId = requestAnimationFrame(animate);
    };

    window.addEventListener("mousemove", handleMouseMove);
    animationId = requestAnimationFrame(animate);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationId);
    };
  }, []);

  const faces = [
    { transform: "translateZ(90px)", label: "Match" },
    { transform: "rotateY(180deg) translateZ(90px)", label: "Score" },
    { transform: "rotateY(90deg) translateZ(90px)", label: "Hire" },
    { transform: "rotateY(-90deg) translateZ(90px)", label: "Skills" },
    { transform: "rotateX(90deg) translateZ(90px)", label: "Data" },
    { transform: "rotateX(-90deg) translateZ(90px)", label: "Verify" },
  ];

  return (
    <div ref={containerRef} className="w-full h-full flex items-center justify-center" style={{ perspective: "800px" }}>
      <div className="cube relative w-[180px] h-[180px]" style={{ transformStyle: "preserve-3d", transform: "rotateX(25deg) rotateY(35deg)" }}>
        {faces.map((face, i) => (
          <div
            key={i}
            className={`absolute inset-0 border backdrop-blur-sm flex items-center justify-center ${dk ? "border-blue-500/30 bg-blue-500/5" : "border-blue-200 bg-blue-50/60"}`}
            style={{ transform: face.transform, backfaceVisibility: "visible" }}
          >
            <span className={`text-sm tracking-widest uppercase ${dk ? "text-blue-400/60" : "text-blue-400/80"}`}>{face.label}</span>
          </div>
        ))}
        <div className="absolute inset-0" style={{ transform: "translateZ(90px)", boxShadow: dk ? "0 0 40px rgba(59,130,246,0.15)" : "0 0 40px rgba(59,130,246,0.08)" }} />
      </div>

      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className={`absolute w-1 h-1 rounded-full ${dk ? "bg-blue-500/40" : "bg-blue-400/30"}`}
          style={{
            top: `${20 + Math.random() * 60}%`,
            left: `${20 + Math.random() * 60}%`,
          }}
          animate={{ y: [0, -20, 0], opacity: [0.2, 0.6, 0.2] }}
          transition={{ duration: 3 + Math.random() * 2, repeat: Infinity, delay: Math.random() * 2 }}
        />
      ))}
    </div>
  );
}

export function Hero() {
  const { theme } = useTheme();
  const dk = theme === "dark";

  return (
    <section className="relative pt-28 pb-16 md:pt-40 md:pb-28 overflow-hidden">
      <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full blur-[120px] ${dk ? "bg-blue-600/5" : "bg-blue-100/50"}`} />
      <div className={`absolute bottom-0 right-0 w-[300px] h-[300px] rounded-full blur-[100px] ${dk ? "bg-blue-600/5" : "bg-blue-50/60"}`} />

      <div className="relative max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div initial="hidden" animate="visible" variants={stagger}>
            <motion.div variants={fadeUp} className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm mb-8 ${dk ? "border border-blue-500/20 bg-blue-500/10 text-blue-400" : "border border-blue-200 bg-blue-50 text-blue-600"}`}>
              <Sparkles className="w-4 h-4" />
              Smart Campus Hiring Platform
            </motion.div>
            <motion.h1
              variants={fadeUp}
              className={`text-4xl md:text-6xl tracking-tight mb-6 ${dk ? "text-white" : "text-gray-900"}`}
              style={{ lineHeight: 1.08 }}
            >
              Campus hiring,{" "}
              <span className="text-blue-600">reimagined</span>{" "}
              with data
            </motion.h1>
            <motion.p variants={fadeUp} className={`text-lg mb-10 max-w-xl ${dk ? "text-gray-400" : "text-gray-500"}`} style={{ lineHeight: 1.7 }}>
              Inturn connects institutions and recruiters on a single platform that makes placements structured, efficient, and driven by verified skills — not guesswork.
            </motion.p>
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4">
              <button className="bg-blue-600 text-white px-8 py-3.5 rounded-full hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 group">
                Get Started Free
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
              <button className={`border px-8 py-3.5 rounded-full transition-all ${dk ? "border-white/10 text-gray-300 hover:border-white/20 hover:text-white" : "border-gray-300 text-gray-600 hover:border-gray-400 hover:text-gray-900"}`}>
                Request Demo
              </button>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="hidden lg:block h-[420px] relative"
          >
            <Cube3D dk={dk} />
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          className={`mt-20 grid grid-cols-2 md:grid-cols-4 gap-px rounded-2xl overflow-hidden border ${dk ? "bg-white/5 border-white/5" : "bg-gray-300 border-gray-300"}`}
        >
          {[
            { value: "500+", label: "Institutions" },
            { value: "12K+", label: "Recruiters" },
            { value: "98%", label: "Match Accuracy" },
            { value: "3x", label: "Faster Hiring" },
          ].map((stat) => (
            <div key={stat.label} className={`p-6 md:py-8 flex flex-col items-center ${dk ? "bg-[#0a0a0f]" : "bg-white"}`}>
              <span className={`text-2xl md:text-3xl tracking-tight ${dk ? "text-white" : "text-gray-900"}`}>{stat.value}</span>
              <span className={`text-sm mt-1 ${dk ? "text-gray-500" : "text-gray-400"}`}>{stat.label}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}