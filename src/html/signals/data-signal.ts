export type SignalListener<T = unknown> = (newValue: T, oldValue: T) => void

/**
 * A Class used to create an object that holds a value and
 * a list of listeners that listen to change made to this
 * hold value.
 */
export class DataSignal<T = unknown> {
  #listeners = new Set<SignalListener<T>>()
  #value
 
  /**
   * @param value - The value hold by the signal.
   */
  constructor(value: T) {
    this.#value = value
  }

  /**
   * Method to add a listener in a `Set` of listeners that
   * are called when the hold value changes. It receives
   * the new value and the old value as parameters.
   * 
   * @param listener - a listener function.
   * 
   * @example
   * ```ts
   * signal.onChange((newValue, oldValue) => {
   *   console.log({ newValue, oldValue })
   * })
   * ```
   */
  onChange(listener: SignalListener<T>) {
    this.#listeners.add(listener)
  }

  /**
   * @returns the current value hold by the signal.
   */
  get() {
    return this.#value
  }

  /**
   * Method to change the value hold by the signal.
   * When this method is called, all listeners registred
   * with the `onChange` method are called passing the
   * new and old values.
   * 
   * @param newValue - the new value that will replace
   * the current one, can be a function that receives the
   * current value as argument and its returned value will
   * replace the signal's value.
   */
  set(newValue: T | ((value: T) => T)) {
    const oldValue = this.#value
    const isFunction = typeof newValue === 'function'
    this.#value = isFunction
      ? (<Function>newValue)(oldValue)
      : newValue

    for (const listener of this.#listeners) {
      listener(this.#value, oldValue)
    }
  }
}

/**
 * A helper function to create a `SignalData` instance.
 * 
 * A `SignalData` is an object used to identify if the passed value
 * must have a reactive behavior through listeners that listen to the
 * change of the hold value by calling `signalData.set`.
 * 
 * @param data - The data to be hold by the `SignalData` instance.
 * 
 * @returns a `SignalData` instance.
 */
export const signal = <T = unknown>(data: T) => new DataSignal<T>(data)

export type SignalRecord<T extends Record<string, unknown>> = {
  [P in keyof T]: DataSignal<T[P]>
}

/**
 * A helper function that creates an instance of `DataSignalRecord`,
 * which is used to create a object like group of signals.
 * Currently if you pass an object as value to a `DataSignal`
 * the object itself will be the value hold by the signal. But
 * if we want that which key of the object to be a signal and
 * not the object itself. That is the usage of this function.
 * 
 * It gets all values of the object provided and creates a new
 * `DataSignal` for each.
 * 
 * Stay alert that this is a swallow copy of the provided object,
 * so if you have a deep layer object, only the first will be a
 * signal.
 * 
 * @param data - An object value representing a group of signals.
 * @returns A clone of the same object provided.
 */
export function signalRecord<T extends Record<string, unknown>>(data: T) {
  return new DataSignalRecord(data) as SignalRecord<T>
}

/**
 * A class that represents an object that is a group of `DataSignals`.
 * It will make a swallow copy of the object passed as argument to it.
 * The copy is swallow, so it will not cycle through nested objects to
 * make them `DataSignalRecords` too. But if the value of some field of
 * the object already is a `DataSignal` or `DataSignalRecord` it just
 * leave the value as it is.
 */
export class DataSignalRecord {
  constructor(obj: Record<string, unknown>) {
    Object.entries(obj).forEach(([key, value]) => {
      if (
        value instanceof DataSignal
        || value instanceof DataSignalRecord
      ) {
        Reflect.set(this, key, value)
        return
      }
      
      Reflect.set(this, key, signal(value))
    })
  }
}