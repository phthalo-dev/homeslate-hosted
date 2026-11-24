/**
 * Ref callback that marks the element a Var UI `Dialog` should focus when it opens.
 *
 * Var UI dialogs are native `<dialog>`s opened with `showModal()` in a layout effect, and
 * `showModal()` focuses the first `[autofocus]` element, else the first focusable one (the
 * header's close button). React's `autoFocus` prop never renders the `autofocus` attribute, and
 * its own `.focus()` call runs before `showModal()`, so it is overridden. Setting the attribute
 * from a ref (attached before the dialog's layout effect runs) lets the native focusing pick it.
 */
export function dialogAutoFocus(element: HTMLElement | null) {
  element?.setAttribute('autofocus', '');
}

/**
 * `dialogAutoFocus` for rename fields: also selects the current text, so typing replaces it.
 * The selection is set before `showModal()` focuses the input, which keeps it.
 */
export function dialogAutoFocusSelect(element: HTMLInputElement | null) {
  if (!element) return;
  element.setAttribute('autofocus', '');
  element.setSelectionRange(0, element.value.length);
}
