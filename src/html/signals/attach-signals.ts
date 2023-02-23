import { SignalData } from './signal-data.js'

export function attachAttributeSignal(
  docFrag: DocumentFragment,
  key: string,
  signalData: SignalData
) {
  const [, attrQuery] = key.split(':')
  const element = docFrag.querySelector(`[${attrQuery}]`)

  if (!element) return

  const [attrName] = attrQuery.split('=')

  function updateElement(value: unknown) {
    if (typeof value === 'boolean') {
      return value
        ? element!.setAttribute(attrName, '')
        : element!.removeAttribute(attrName)
    }

    element!.setAttribute(attrName, String(value))
  }

  signalData.onChange(updateElement)
  updateElement(signalData.get())
}

export function attachPropertySignal(
  docFrag: DocumentFragment,
  key: string,
  signal: SignalData
) {
  const [, propQuery] = key.split(':')
  const element = docFrag.querySelector(`[${propQuery}]`)

  if (!element) return

  const [propName] = propQuery.split('=')

  signal.onChange(
    value => Reflect.set(element, propName, value)
  )
  Reflect.set(element, propName, signal.get())
  element.removeAttribute(propName)
}
