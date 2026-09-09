import dayjs from 'dayjs'
import { navLinks } from '#constants'
import { navIcons } from '#constants/index.js'
import useWindowStore from '#store/Window.js'
import MusicPlayer from '#components/MusicPlayer'

const Navbar = () => {
    const { openWindow } = useWindowStore()

    const handleNavClick = (type) => {
        openWindow(type)
    }

    return (
        <nav>
            <div>
                <img src="/images/logo.svg" alt="logo" />
                <p className='font-bold'>Jigyansh's Portfolio</p>
          
                <ul>
                    {navLinks.map(({id, name, type}) => (
                        <li key={id}>
                            <p 
                                className='text-sm cursor-pointer hover:underline transition-all'
                                onClick={() => handleNavClick(type)}
                            >
                                {name}
                            </p>
                        </li>
                    ))}
                </ul>
            </div>
            <div>
                <MusicPlayer />
                <ul>
                    {navIcons.map(({id, img}) => (
                        <li key={id}>
                            <img src={img} className='icon-hover' alt={`icon-${id}`} />
                        </li>
                    ))}
                </ul>
                <time>{dayjs().format('ddd MMM D h:mm')}</time>
            </div>
        </nav>
    )
}

export default Navbar