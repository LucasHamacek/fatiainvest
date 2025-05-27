// components/Layout/LoadingScreen.tsx
import { Progress } from "@/components/ui/progress"

interface LoadingScreenProps {
  progress: number
}

export const LoadingScreen = ({ progress }: LoadingScreenProps) => {
  return (
    <div className="flex flex-col items-center justify-center h-screen gap-4">
      <div className="text-lg font-medium">Carregando dados das ações...</div>
      <Progress value={progress} className="w-[60%]" />
    </div>
  )
}