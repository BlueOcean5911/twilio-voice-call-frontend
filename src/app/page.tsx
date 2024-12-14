"use client";
import dynamic from "next/dynamic";

const CallComponent = dynamic(() => import("@/pages/Call"), {
  ssr: false,
  loading: () => <div>Loading...</div>,
});

export default function Home() {
  return <CallComponent />;
}
