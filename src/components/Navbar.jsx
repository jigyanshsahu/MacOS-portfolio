import dayjs from 'dayjs'
import { navLinks } from '#constants'

import { navIcons } from '#constants/index.js'

const Navbar = () => {
    return (
        <nav>
            <div>
                <img src="/images/logo.svg" alt="logo" />
                <p className='font-bold'>Jigyansh's Portfolio</p>
          
                <ul>
                    {navLinks.map(({id, name}) => (
                        <li key={id}>
                            <p className='text-sm cursor-pointer hover:underline transition-all'>{name}</p>
                        </li>
                    ))}
                </ul>
            </div>
            <div>
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