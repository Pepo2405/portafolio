import React from 'react'
import useWindow from 'src/hooks/useWindow'
import DraggableWin from './draggable'
import data from 'src/lists/proyects.json'
import DraggableLink from './DraggableLink'
import SocialData from 'src/lists/taskList.json'
import Image from 'next/image'

type Props = {}

const WindowsContainer = (props: Props) => {

  const { proyects } = data

  const { visibleItems, handleClose, handleOpen } = useWindow()

  return (
    <div className='absolute h-1  top-0 left-0 md:left-0 md:top-0 bottom-28 flex w-full'>
      {/* <DraggableLink title='Mochify' url='https://pepo2405.github.io/mochifyPlayer.github.io/'></DraggableLink> */}

      {visibleItems["Proyectos"] && <DraggableWin title={'Proyectos'} close={handleClose}>
        <main className='flex gap-4 px-4 py-4 items-center text-black folderIcons'>
          {proyects.map((el: any) => (
            <div
              title={el.title}
              onClick={handleOpen as any}
              key={el.url}
              className='cursor-pointer w-fit h-16 md:w-28 md:h-28 bg-transparen hover:bg-cyan-200/60 rounded-sm flex flex-col justify-between text-center items-center p-1 '
            >
              <div
                className='w-16 h-16'
                title={el.title}
                onClick={handleOpen as any}
                style={{
                  backgroundImage: `url(${el.icon})`,
                  backgroundRepeat: "no-repeat",
                  backgroundSize: "contain",
                  backgroundPosition: "center"
                }}
              >
              </div>
              <span className='whitespace-nowrap text-sm text-black font-medium'>
                {el.title}
              </span>
            </div>
          ))}

        </main>
      </DraggableWin>}

      <div className='absolute'>

        {proyects.map((item: any) => {
          return <div key={item.title}>
            {visibleItems[item.title] ?
              <DraggableLink {...item} />
              : <></>
            }
          </div>
        })}
      </div>
      <div className='absolute'>
        {visibleItems["Sociales"] && <DraggableWin title={'Sociales'} close={handleClose}>
          <main className='flex px-4 py-4 items-center text-black folderIcons ' style={{ columnGap: "2rem" }}>
            {SocialData.items.map((el: any) => (
              <a
                key={el.url}
                className='cursor-pointer w-fit h-16 md:w-28 md:h-28 bg-transparen hover:bg-cyan-200/60 rounded-sm flex flex-col justify-between text-center items-center p-1 '
                {...el}
              >
                <div
                  className='w-16 h-16'
                  title={el.title}
                  style={{
                    backgroundImage: `url(${el.icon})`,
                    backgroundRepeat: "no-repeat",
                    backgroundSize: "contain",
                    backgroundPosition: "center"
                  }}
                >
                </div>
                <span className='whitespace-nowrap text-sm text-black font-medium'>
                  {el.title}
                </span>
              </a>
            ))}

          </main>
        </DraggableWin>}
      </div>
    </div>
  )
}

export default WindowsContainer