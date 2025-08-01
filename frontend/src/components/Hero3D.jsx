// src/components/Hero3D.jsx - LIGHTWEIGHT VERSION
import { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';

function SimpleFloatingShape() {
    const meshRef = useRef();
    
    useFrame((state) => {
        if (meshRef.current) {
            const time = state.clock.getElapsedTime();
            // Very gentle movement to avoid performance issues
            meshRef.current.rotation.y = time * 0.2;
            meshRef.current.position.y = Math.sin(time * 0.5) * 0.3;
        }
    });

    return (
        <mesh ref={meshRef}>
            <icosahedronGeometry args={[1.5, 0]} />
            <meshBasicMaterial 
                color="#8b5cf6" 
                transparent 
                opacity={0.6}
                wireframe
            />
        </mesh>
    );
}

const Hero3D = () => {
    const [isMobile, setIsMobile] = useState(false);
    const [shouldRender, setShouldRender] = useState(false);

    useEffect(() => {
        const checkDevice = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);
            // Only render 3D on desktop and after component mounts
            setShouldRender(!mobile);
        };
        
        checkDevice();
        window.addEventListener('resize', checkDevice);
        
        return () => window.removeEventListener('resize', checkDevice);
    }, []);

    // Don't render 3D on mobile for better performance
    if (isMobile || !shouldRender) {
        return (
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-violet-900/10 to-slate-900 -z-20">
                {/* Static background pattern for mobile */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-1/4 left-1/4 w-32 h-32 border border-violet-500/20 rounded-full"></div>
                    <div className="absolute top-3/4 right-1/4 w-24 h-24 border border-blue-500/20 rounded-full"></div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 border border-purple-500/20 rounded-full"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="absolute inset-0 -z-20">
            <Canvas
                camera={{ position: [0, 0, 5], fov: 50 }}
                dpr={[1, 1.5]} // Limit DPR for better performance
                performance={{ min: 0.8 }} // Higher minimum performance threshold
                style={{ background: 'transparent' }}
            >
                {/* Minimal lighting for better performance */}
                <ambientLight intensity={0.4} />
                <directionalLight position={[2, 2, 2]} intensity={0.6} />
                
                {/* Single simple shape */}
                <SimpleFloatingShape />
            </Canvas>
            
            {/* Static gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900/80 via-transparent to-slate-900/60 pointer-events-none" />
        </div>
    );
};

export default Hero3D;