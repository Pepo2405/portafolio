import { useEffect, useState } from 'react'
import { BsFullscreen, BsFullscreenExit } from 'react-icons/bs'
import { useT } from 'src/i18n'

const FullScreenButton = () => {
  const t = useT()
  const [fullScreen, setFullScreen] = useState(false)

  // Mantiene el ícono en sync cuando se sale con Escape o F11.
  useEffect(() => {
    const onChange = () => setFullScreen(Boolean(document.fullscreenElement))
    document.addEventListener('fullscreenchange', onChange)
    return () => document.removeEventListener('fullscreenchange', onChange)
  }, [])

  const handleFull = () => {
    if (!document.fullscreenElement) {
      document.body.requestFullscreen().catch((error) => console.error(error))
    } else {
      document.exitFullscreen().catch((error) => console.error(error))
    }
  }

  return (
    <button
      type="button"
      aria-label={t(fullScreen ? 'fullscreen.exit' : 'fullscreen.enter')}
      title={t(fullScreen ? 'fullscreen.exit' : 'fullscreen.enter')}
      className='absolute select-none hover:-translate-y-1 transition-all duration-300 top-7 right-2 text-2xl md:text-4xl md:right-12 shadowText focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white'
      onClick={handleFull}
    >
      {!fullScreen ? <BsFullscreen /> : <BsFullscreenExit />}
    </button>
  )
}

export default FullScreenButton
