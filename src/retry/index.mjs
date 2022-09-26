export const retry = (on, options) => {
  if (options?.bypass) return on

  const retryOn = (callback) => {
    let spOff
    let timer
    let errorCb

    const retryPattern = (options?.pattern || defaultRetryPattern).concat([])

    function subscribe() {
      spOff = on(callback).catch((error) => {
        // If an error happens and the retry pattern is not empty
        if (retryPattern.length > 0) {
          // Unsubscribe first

          // Delay unsubscribing as the off function can be undefined if
          // the SubscriptionPromise code is synchronouslycalled (e.g.,
          // the subscribe function returned the error right away).
          setTimeout(() => spOff?.())

          // Then schedule retry
          timer = setTimeout(subscribe, retryPattern.shift())
        } else {
          errorCb?.(error)
        }
      })
    }

    subscribe()

    const off = () => {
      spOff()
      clearTimeout(timer)
    }

    const offWithCatch = () => {
      off()
    }

    offWithCatch.catch = (cb) => {
      errorCb = cb
      return off
    }

    return offWithCatch
  }

  retryOn.request = on.request
  return retryOn
}

var defaultRetryPattern = [250, 500, 1000, 2000, 4000, 8000, 16000]
