// components/Layout/LoadingScreen.tsx
import { DotLottieReact } from '@lottiefiles/dotlottie-react'

export const LoadingScreen = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen gap-6">
      <div className="w-20 h-20">
        <DotLottieReact
          src="https://lottie.host/d3e19fc8-7dfb-4782-b4b3-05004b5d5242/6WwreGYGC0.lottie"
          loop
          autoplay
        />
      </div>
      <div className="text-base font-medium text-gray-500">
        Carregando...
      </div>
    </div>
  )
}
