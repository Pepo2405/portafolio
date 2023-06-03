import React, { useEffect } from 'react'
import Draggable from 'react-draggable';
type Props = {}
import { AiOutlinePlayCircle, AiOutlinePauseCircle, AiOutlineCaretLeft, AiOutlineCaretRight, AiOutlineClose } from 'react-icons/ai'
import { Howl } from 'howler';
import songList from 'src/lists/music.json'

const Mochify = (props: Props) => {

  const [currentSongI, setCurrentSongI] = React.useState(0)
  const [songs, setSongs] = React.useState(songList.songs.map((el, i) => buildSong(i)))
  const [currentSong, setCurrentSong] = React.useState<any>(buildSong(0))
  const [playing, setPlaying] = React.useState(false)
  const [exit, setExit] = React.useState(false)

  const handlePlay = () => {
    if (playing) {
      songs[currentSongI].pause()
      setPlaying(false)
      return

    }
    songs[currentSongI].play()
    setPlaying(true)
    return
  }

  const handleNext = () => {
    if (currentSongI === songs.length - 1) {
      songs[currentSongI].stop()
      setCurrentSongI(0)
      songs[0].play()

      return
    }
    songs[currentSongI].stop()
    songs[currentSongI + 1].play()
    setCurrentSongI((currentSong) => (currentSong + 1))
  }

  const handlePrev = () => {
    if (currentSongI === 0) {
      songs[currentSongI].stop()
      songs[songs.length - 1].play()

      setCurrentSongI(songs.length - 1)
      return
    }
    songs[currentSongI].stop()
    songs[currentSongI - 1].play()
    setCurrentSongI((currentSong) => (currentSong - 1))
  }



  function buildSong(i: number): any {
    return new Howl({
      src: [songList.songs[i].url],
      html5: true,
      volume: 0.3
    })
  }

  if (exit) return <></>


  return (
    <div className='min-w-fit absolute w-96 bottom-9 right-2'>
      <Draggable
        defaultPosition={{ x: 0, y: 0 }}
        scale={1}
        defaultClassName='z-10 '
        bounds={"body"}

      >
        <div className='hidden md:flex justify-around bg-blue-700 text-blue-600 max-w-sm py-4 px-2 rounded-lg relative border shadow-md border-white'>
          <div className='flex flex-col text-white'>
            <span className='text-xs'>
              Mochify
            </span>
            <p>
              {songList.songs[currentSongI].title || "Song Title"}
            </p>
          </div>
          <div className='flex gap-2 '>
            <div onClick={handlePrev} className='bg-gray-200 rounded-full py-0  px-2 items-center flex justify-center hover:text-gray-600 transition-all duration-300'>
              <AiOutlineCaretLeft />
            </div>
            <div onClick={handlePlay} className='bg-gray-200 rounded-full py-0  px-2 items-center flex justify-center hover:text-gray-600 transition-all duration-300'>
              {!playing ? <AiOutlinePlayCircle /> : <AiOutlinePauseCircle />}          </div>
            <div onClick={handleNext} className='bg-gray-200 rounded-full py-0  px-2 items-center flex justify-center hover:text-gray-600 transition-all duration-300'>
              <AiOutlineCaretRight />
            </div>
          </div>
          <AiOutlineClose onClick={() => setExit(true)} className='absolute top-1 right-1 hover:text-white transition-all duration-300' />
        </div>
      </Draggable>
    </div>
  )
}

export default Mochify