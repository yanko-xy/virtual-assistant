"use client";

import Image from "next/image";
import { Loader } from "@react-three/drei";
import { Leva } from "leva";
import { UI } from "@/components/UI";
import { Canvas } from "@react-three/fiber";
import { Experience } from "@/components/Experience";
import { ChatProvider } from "@/hooks/useChat";

export default function Home() {
	return (
		<main className="min-h-screen h-screen">
			<ChatProvider>
				<Loader />
				<Leva hidden />
				<UI />
				<Canvas shadows camera={{ position: [0, 0, 1], fov: 30 }}>
					<Experience />
				</Canvas>
			</ChatProvider>
		</main>
	);
}
