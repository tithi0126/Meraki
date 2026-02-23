import { motion } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import CoffeeCup from '../components/3d/CoffeeCup';
export default function Home() {
    return (
        <div className="relative min-h-[90vh] flex items-center bg-zinc-50 overflow-hidden">

            {/* 3D Canvas Container Background */}
            <div className="absolute inset-0 z-0 opacity-100 flex items-center justify-end px-4 md:px-20 pt-20">
                <div className="w-full h-full max-w-2xl relative">
                    {/* Subtle glow behind the 3D model */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-primary-500/10 to-accent-gold/10 rounded-full blur-3xl transform scale-75 translate-y-10" />

                    {/* Three.js Canvas */}
                    <div className="absolute inset-0 z-10">
                        <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
                            <ambientLight intensity={1.5} />
                            <directionalLight position={[10, 10, 5]} intensity={2} />
                            <directionalLight position={[-10, 10, -5]} intensity={1} color="#D4AF37" />
                            <CoffeeCup />
                        </Canvas>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
                <div className="max-w-xl">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="text-5xl md:text-7xl font-serif font-bold text-secondary-900 leading-tight mb-6"
                    >
                        Where Coffee Meets <span className="text-primary-500 italic">Meraki</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                        className="text-lg md:text-xl text-gray-600 mb-10 leading-relaxed"
                    >
                        We pour our soul, creativity, and love into everything we brew. Experience the artisanal spirit in every cup.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
                        className="flex flex-col sm:flex-row gap-4"
                    >
                        <a
                            href="/menu"
                            className="px-8 py-4 bg-primary-600 hover:bg-primary-500 text-white font-medium rounded-full transition-colors text-center shadow-lg shadow-primary-500/30"
                        >
                            Explore Menu
                        </a>
                        <a
                            href="/review"
                            className="px-8 py-4 bg-white text-secondary-900 border border-gray-200 hover:border-primary-500 font-medium rounded-full transition-colors text-center"
                        >
                            Read Reviews
                        </a>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
