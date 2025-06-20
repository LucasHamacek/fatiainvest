import { Suspense } from "react";
import HomeClient from "./HomeClient";
import { LoadingScreen } from "@/components/Layout/LoadingScreen";

export default function Home() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <HomeClient />
    </Suspense>
  );
}
