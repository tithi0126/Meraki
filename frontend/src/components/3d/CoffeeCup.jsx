import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, Float, PresentationControls, ContactShadows, Environment } from '@react-three/drei';

export default function CoffeeCup() {
    const ref = useRef();

    // Create a stylized geometric representation if we don't have a model yet
    // This will be a sleek, modern coffee cup made of basic shapes
    return (
        <PresentationControls
            global
            rotation={[0, -Math.PI / 4, 0]}
            polar={[-0.4, 0.2]}
            azimuth={[-1, 0.75]}
            config={{ mass: 2, tension: 400 }}
            snap={{ mass: 4, tension: 400 }}
        >
            <Float rotationIntensity={1.5} floatIntensity={2} speed={2}>
                <group ref={ref} position={[0, -1, 0]}>
                    {/* Main Cup Body */}
                    <mesh castShadow receiveShadow position={[0, 1.2, 0]}>
                        <cylinderGeometry args={[1.2, 0.9, 2.4, 32]} />
                        <meshStandardMaterial
                            color="#1a1a1a"
                            roughness={0.2}
                            metalness={0.1}
                            clearcoat={0.5}
                        />
                    </mesh>

                    {/* Cup Rim */}
                    <mesh position={[0, 2.4, 0]}>
                        <torusGeometry args={[1.2, 0.1, 16, 32]} />
                        <meshStandardMaterial color="#D4AF37" roughness={0.1} metalness={0.8} />
                    </mesh>

                    {/* Coffee inside */}
                    <mesh position={[0, 2.3, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                        <circleGeometry args={[1.1, 32]} />
                        <meshStandardMaterial color="#2c1a0c" roughness={0.4} />
                    </mesh>

                    {/* Steam particle approximations */}
                    <SteamParticle position={[0.2, 3, 0]} delay={0} />
                    <SteamParticle position={[-0.3, 2.8, 0.2]} delay={0.5} />
                    <SteamParticle position={[0.1, 3.2, -0.2]} delay={1} />
                </group>
            </Float>

            <ContactShadows
                position={[0, -1.2, 0]}
                opacity={0.7}
                scale={10}
                blur={2}
                far={4}
                color="#8C6D53"
            />
            <Environment preset="city" />
        </PresentationControls>
    );
}

function SteamParticle({ position, delay }) {
    const ref = useRef();

    useFrame((state) => {
        const t = state.clock.getElapsedTime() + delay;
        ref.current.position.y = position[1] + Math.sin(t) * 0.5 + t * 0.5 % 2;
        ref.current.position.x = position[0] + Math.sin(t * 2) * 0.2;
        ref.current.scale.setScalar(Math.max(0, 1 - (ref.current.position.y - position[1]) / 2));
        ref.current.material.opacity = Math.max(0, 0.5 - (ref.current.position.y - position[1]) / 4);
    });

    return (
        <mesh ref={ref} position={position}>
            <sphereGeometry args={[0.2, 16, 16]} />
            <meshStandardMaterial
                color="#ffffff"
                transparent
                opacity={0.4}
                depthWrite={false}
            />
        </mesh>
    );
}
