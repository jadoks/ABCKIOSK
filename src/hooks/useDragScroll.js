import { useEffect, useRef } from 'react'

const THRESHOLD = 6 // px of movement before a press becomes a drag (so normal taps still click)
const FRICTION = 0.95 // per 16ms frame; lower = stops sooner

/*
 * "Hand" scrolling for kiosks: press and drag the list up/down, release to let it glide.
 *
 * - Touchscreens scroll natively (the element must have `touch-pan-y`), which is the smoothest option.
 * - Mouse / pen / touch-as-mouse kiosks use the drag-to-scroll below.
 * - Works inside the scaled <Frame>: pointer movement is divided by the current scale.
 *
 * Usage:  const listRef = useDragScroll()   ...   <section ref={listRef} className="overflow-y-auto touch-pan-y">
 */
export default function useDragScroll() {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    let pointerId = null
    let dragging = false
    let moved = false
    let startY = 0
    let startTop = 0
    let lastY = 0
    let lastT = 0
    let velocity = 0 // scrollTop px per ms
    let raf = 0

    const scale = () => (el.offsetHeight ? el.getBoundingClientRect().height / el.offsetHeight : 1)
    const maxTop = () => el.scrollHeight - el.clientHeight

    const glide = () => {
      el.scrollTop += velocity * 16
      velocity *= FRICTION
      const atEdge = el.scrollTop <= 0 || el.scrollTop >= maxTop()
      if (Math.abs(velocity) > 0.02 && !atEdge) raf = requestAnimationFrame(glide)
    }

    const onDown = (e) => {
      if (e.pointerType === 'touch' || e.button !== 0) return // touch uses native scrolling
      cancelAnimationFrame(raf)
      pointerId = e.pointerId
      dragging = false
      moved = false
      startY = lastY = e.clientY
      startTop = el.scrollTop
      lastT = performance.now()
      velocity = 0
    }

    const onMove = (e) => {
      if (e.pointerId !== pointerId) return
      const dy = e.clientY - startY
      if (!dragging) {
        if (Math.abs(dy) < THRESHOLD) return
        dragging = moved = true
        el.setPointerCapture(pointerId)
        el.style.cursor = 'grabbing'
      }
      const s = scale()
      el.scrollTop = startTop - dy / s
      const now = performance.now()
      const dt = now - lastT
      if (dt > 0) velocity = 0.6 * velocity + 0.4 * ((lastY - e.clientY) / s / dt)
      lastY = e.clientY
      lastT = now
    }

    const onUp = (e) => {
      if (e.pointerId !== pointerId) return
      pointerId = null
      el.style.cursor = 'grab'
      if (!dragging) return
      dragging = false
      if (performance.now() - lastT > 80) velocity = 0 // they paused before letting go
      else raf = requestAnimationFrame(glide)
    }

    // A drag that ends on a button must not count as a tap on it.
    const onClickCapture = (e) => {
      if (!moved) return
      e.stopPropagation()
      e.preventDefault()
      moved = false
    }
    const noNativeDrag = (e) => e.preventDefault() // stops ghost-dragging the photos

    el.style.cursor = 'grab'
    el.addEventListener('pointerdown', onDown)
    el.addEventListener('pointermove', onMove)
    el.addEventListener('pointerup', onUp)
    el.addEventListener('pointercancel', onUp)
    el.addEventListener('click', onClickCapture, true)
    el.addEventListener('dragstart', noNativeDrag)
    return () => {
      cancelAnimationFrame(raf)
      el.removeEventListener('pointerdown', onDown)
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerup', onUp)
      el.removeEventListener('pointercancel', onUp)
      el.removeEventListener('click', onClickCapture, true)
      el.removeEventListener('dragstart', noNativeDrag)
    }
  }, [])

  return ref
}