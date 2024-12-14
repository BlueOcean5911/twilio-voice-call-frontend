"use client";
import dynamic from "next/dynamic";
// import Call from "@/pages/Call";

const Call = dynamic(() => import("@/pages/Call"), {
  ssr: false,
});
const Page = () => {
  return <Call />;
};
export default Page;
