import React, { useState } from 'react'
import { BsFullscreen, BsFullscreenExit } from 'react-icons/bs'

type Props = {}

const FullScreenButton = (props: Props) => {
  const [fullScreen, setFullScreen] = useState(false)

  const handleFull = () => {
    if (!fullScreen) {
      setFullScreen(true)
      document.body.requestFullscreen()
    } else {
      document.exitFullscreen()
        .then(() => setFullScreen(false))
        .catch((error) => console.error(error))
    }
  }

  return (
    <button className='absolute  select-none hover:-translate-y-1 transition-all duration-300 top-7 right-2 text-2xl md:text-4xl md:right-12 shadowText' onClick={handleFull}>
      {!fullScreen ? <BsFullscreen /> : <BsFullscreenExit />}
    </button>
  )
}

export default FullScreenButton
