import React from 'react'
import { Navbar, Welcome, Dock } from '#components'
import {Draggable} from "gsap/Draggable"
import gsap from 'gsap'
import { Terminal } from '#windows'
gsap.registerPlugin(Draggable)
function App() {
  return (
   <main>
    <Navbar />
    <Welcome />
    <Dock />
    <Terminal/>
   </main>
  )
}

export default App