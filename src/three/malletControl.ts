/**
 * Pointer state for the mallet, kept outside React because it changes on every
 * mouse move and nothing in the DOM tree needs to know.
 *
 * Only the swing counter and a "have we ever seen the pointer" flag live here.
 * The mallet works out its own position from the pointer ray each frame, so
 * that its head lands under the cursor rather than under whatever surface the
 * pointer happened to strike.
 */
export const malletControl = { swings: 0, moved: false }

export const markPointerSeen = () => {
  malletControl.moved = true
}

export const swingMallet = () => {
  malletControl.swings += 1
}
