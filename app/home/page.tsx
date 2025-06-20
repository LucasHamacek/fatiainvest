import dynamic from "next/dynamic";
import { LoadingScreen } from "@/components/Layout/LoadingScreen";

const HomeClient = dynamic(() => import("./HomeClient"), { ssr: false, loading: () => <LoadingScreen /> });

export default function Home() {
  return <HomeClient />;
}
