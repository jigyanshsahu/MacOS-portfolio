import React from 'react'
import { Navbar, Welcome, Dock } from '#components'
import {Draggable} from "gsap/Draggable"
import gsap from 'gsap'
import { Resume, Safari, Terminal,Finder } from '#windows'
gsap.registerPlugin(Draggable)
function App() {
  return (
   <main>
    <Navbar />
    <Welcome />
    <Dock />
    <Terminal/>
    <Safari/>
    <Resume/>
    <Finder/>
   </main>
  )
}

export default App