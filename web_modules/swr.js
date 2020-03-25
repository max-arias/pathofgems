import React, {
  createContext,
  useContext,
  useRef,
  useState,
  useCallback,
  useMemo,
  useEffect,
  useLayoutEffect,
} from './react.js'

var isArray = Array.isArray
var keyList = Object.keys
var hasProp = Object.prototype.hasOwnProperty

var fastDeepEqual = function equal(a, b) {
  if (a === b) return true

  if (a && b && typeof a == 'object' && typeof b == 'object') {
    var arrA = isArray(a),
      arrB = isArray(b),
      i,
      length,
      key

    if (arrA && arrB) {
      length = a.length
      if (length != b.length) return false
      for (i = length; i-- !== 0; ) if (!equal(a[i], b[i])) return false
      return true
    }

    if (arrA != arrB) return false

    var dateA = a instanceof Date,
      dateB = b instanceof Date
    if (dateA != dateB) return false
    if (dateA && dateB) return a.getTime() == b.getTime()

    var regexpA = a instanceof RegExp,
      regexpB = b instanceof RegExp
    if (regexpA != regexpB) return false
    if (regexpA && regexpB) return a.toString() == b.toString()

    var keys = keyList(a)
    length = keys.length

    if (length !== keyList(b).length) return false

    for (i = length; i-- !== 0; ) if (!hasProp.call(b, keys[i])) return false

    for (i = length; i-- !== 0; ) {
      key = keys[i]
      if (!equal(a[key], b[key])) return false
    }

    return true
  }

  return a !== a && b !== b
}

function isDocumentVisible() {
  if (
    typeof document !== 'undefined' &&
    typeof document.visibilityState !== 'undefined'
  ) {
    return document.visibilityState !== 'hidden'
  }
  // always assume it's visible
  return true
}

function isOnline() {
  if (typeof navigator.onLine !== 'undefined') {
    return navigator.onLine
  }
  // always assume it's online
  return true
}

// Cache
const __cache = new Map()
function cacheGet(key) {
  return __cache.get(key)
}
function cacheSet(key, value) {
  return __cache.set(key, value)
}
// state managers
const CONCURRENT_PROMISES = {}
const CONCURRENT_PROMISES_TS = {}
const FOCUS_REVALIDATORS = {}
const CACHE_REVALIDATORS = {}
const MUTATION_TS = {}
// error retry
function onErrorRetry(_, __, config, revalidate, opts) {
  if (!isDocumentVisible()) {
    // if it's hidden, stop
    // it will auto revalidate when focus
    return
  }
  if (config.errorRetryCount && opts.retryCount > config.errorRetryCount) {
    return
  }
  // exponential backoff
  const count = Math.min(opts.retryCount || 0, 8)
  const timeout =
    ~~((Math.random() + 0.5) * (1 << count)) * config.errorRetryInterval
  setTimeout(revalidate, timeout, opts)
}
// client side: need to adjust the config
// based on the browser status
// slow connection (<= 70Kbps)
const slowConnection =
  typeof window !== 'undefined' &&
  navigator['connection'] &&
  ['slow-2g', '2g'].indexOf(navigator['connection'].effectiveType) !== -1
// config
const defaultConfig = {
  // events
  onLoadingSlow: () => {},
  onSuccess: () => {},
  onError: () => {},
  onErrorRetry,
  errorRetryInterval: (slowConnection ? 10 : 5) * 1000,
  focusThrottleInterval: 5 * 1000,
  dedupingInterval: 2 * 1000,
  loadingTimeout: (slowConnection ? 5 : 3) * 1000,
  refreshInterval: 0,
  revalidateOnFocus: true,
  revalidateOnReconnect: true,
  refreshWhenHidden: false,
  refreshWhenOffline: false,
  shouldRetryOnError: true,
  suspense: false,
  compare: fastDeepEqual,
}
// Focus revalidate
let eventsBinded = false
if (typeof window !== 'undefined' && window.addEventListener && !eventsBinded) {
  const revalidate = () => {
    if (!isDocumentVisible() || !isOnline()) return
    for (let key in FOCUS_REVALIDATORS) {
      if (FOCUS_REVALIDATORS[key][0]) FOCUS_REVALIDATORS[key][0]()
    }
  }
  window.addEventListener('visibilitychange', revalidate, false)
  window.addEventListener('focus', revalidate, false)
  // only bind the events once
  eventsBinded = true
}

// use WeakMap to store the object->key mapping
// so the objects can be garbage collected.
// WeakMap uses a hashtable under the hood, so the lookup
// complexity is almost O(1).
const table = new WeakMap()
// counter of the key
let counter = 0
// hashes an array of objects and returns a string
function hash(args) {
  if (!args.length) return ''
  let key = 'arg'
  for (let i = 0; i < args.length; ++i) {
    let _hash
    if (args[i] === null || typeof args[i] !== 'object') {
      // need to consider the case that args[i] is a string:
      // args[i]        _hash
      // "undefined" -> '"undefined"'
      // undefined   -> 'undefined'
      // 123         -> '123'
      // null        -> 'null'
      // "null"      -> '"null"'
      if (typeof args[i] === 'string') {
        _hash = '"' + args[i] + '"'
      } else {
        _hash = String(args[i])
      }
    } else {
      if (!table.has(args[i])) {
        _hash = counter
        table.set(args[i], counter++)
      } else {
        _hash = table.get(args[i])
      }
    }
    key += '@' + _hash
  }
  return key
}

function throttle(fn, interval) {
  let pending = false
  return (...args) => {
    if (pending) return
    pending = true
    fn(...args)
    setTimeout(() => (pending = false), interval)
  }
}

const SWRConfigContext = createContext({})
SWRConfigContext.displayName = 'SWRConfigContext'

const IS_SERVER = typeof window === 'undefined'
// React currently throws a warning when using useLayoutEffect on the server.
// To get around it, we can conditionally useEffect on the server (no-op) and
// useLayoutEffect in the browser.
const useIsomorphicLayoutEffect = IS_SERVER ? useEffect : useLayoutEffect
// TODO: introduce namepsace for the cache
const getErrorKey = (key) => (key ? 'err@' + key : '')
const getKeyArgs = (key) => {
  let args = null
  if (typeof key === 'function') {
    try {
      key = key()
    } catch (err) {
      // dependencies not ready
      key = ''
    }
  }
  if (Array.isArray(key)) {
    // args array
    args = key
    key = hash(key)
  } else {
    // convert null to ''
    key = String(key || '')
  }
  return [key, args]
}
const NO_DEDUPE = false
const trigger = (_key, shouldRevalidate = true) => {
  const [key] = getKeyArgs(_key)
  if (!key) return
  const updaters = CACHE_REVALIDATORS[key]
  if (key && updaters) {
    const currentData = cacheGet(key)
    const currentError = cacheGet(getErrorKey(key))
    for (let i = 0; i < updaters.length; ++i) {
      updaters[i](shouldRevalidate, currentData, currentError, NO_DEDUPE)
    }
  }
}
const broadcastState = (key, data, error) => {
  const updaters = CACHE_REVALIDATORS[key]
  if (key && updaters) {
    for (let i = 0; i < updaters.length; ++i) {
      updaters[i](false, data, error)
    }
  }
}
const mutate = async (_key, _data, shouldRevalidate = true) => {
  const [key] = getKeyArgs(_key)
  if (!key) return
  // if there is no new data, call revalidate against the key
  if (typeof _data === 'undefined') return trigger(_key, shouldRevalidate)
  // update timestamp
  MUTATION_TS[key] = Date.now() - 1
  let data, error
  if (_data && typeof _data === 'function') {
    // `_data` is a function, call it passing current cache value
    try {
      data = await _data(cacheGet(key))
    } catch (err) {
      error = err
    }
  } else if (_data && typeof _data.then === 'function') {
    // `_data` is a promise
    try {
      data = await _data
    } catch (err) {
      error = err
    }
  } else {
    data = _data
  }
  if (typeof data !== 'undefined') {
    // update cached data
    cacheSet(key, data)
  }
  // update existing SWR Hooks' state
  const updaters = CACHE_REVALIDATORS[key]
  if (updaters) {
    for (let i = 0; i < updaters.length; ++i) {
      updaters[i](!!shouldRevalidate, data, error, NO_DEDUPE)
    }
  }
  // throw error or return data to be used by caller of mutate
  if (error) throw error
  return data
}
function useSWR(...args) {
  let _key,
    fn,
    config = {}
  if (args.length >= 1) {
    _key = args[0]
  }
  if (args.length > 2) {
    fn = args[1]
    config = args[2]
  } else {
    if (typeof args[1] === 'function') {
      fn = args[1]
    } else if (typeof args[1] === 'object') {
      config = args[1]
    }
  }
  // we assume `key` as the identifier of the request
  // `key` can change but `fn` shouldn't
  // (because `revalidate` only depends on `key`)
  const [key, fnArgs] = getKeyArgs(_key)
  // `keyErr` is the cache key for error objects
  const keyErr = getErrorKey(key)
  config = Object.assign(
    {},
    defaultConfig,
    useContext(SWRConfigContext),
    config
  )
  if (typeof fn === 'undefined') {
    // use a global fetcher
    fn = config.fetcher
  }
  const initialData = cacheGet(key) || config.initialData
  const initialError = cacheGet(keyErr)
  // if a state is accessed (data, error or isValidating),
  // we add the state to dependencies so if the state is
  // updated in the future, we can trigger a rerender
  const stateDependencies = useRef({
    data: false,
    error: false,
    isValidating: false,
  })
  const stateRef = useRef({
    data: initialData,
    error: initialError,
    isValidating: false,
  })
  const rerender = useState(null)[1]
  let dispatch = useCallback((payload) => {
    let shouldUpdateState = false
    for (let k in payload) {
      stateRef.current[k] = payload[k]
      if (stateDependencies.current[k]) {
        shouldUpdateState = true
      }
    }
    if (shouldUpdateState || config.suspense) {
      rerender({})
    }
  }, [])
  // error ref inside revalidate (is last request errored?)
  const unmountedRef = useRef(false)
  const keyRef = useRef(key)
  const boundMutate = useCallback(
    (data, shouldRevalidate) => {
      return mutate(key, data, shouldRevalidate)
    },
    [key]
  )
  // start a revalidation
  const revalidate = useCallback(
    async (revalidateOpts = {}) => {
      if (!key || !fn) return false
      if (unmountedRef.current) return false
      revalidateOpts = Object.assign({ dedupe: false }, revalidateOpts)
      let loading = true
      let shouldDeduping =
        typeof CONCURRENT_PROMISES[key] !== 'undefined' && revalidateOpts.dedupe
      // start fetching
      try {
        dispatch({
          isValidating: true,
        })
        let newData
        let startAt
        if (shouldDeduping) {
          // there's already an ongoing request,
          // this one needs to be deduplicated.
          startAt = CONCURRENT_PROMISES_TS[key]
          newData = await CONCURRENT_PROMISES[key]
        } else {
          // if not deduping the request (hard revalidate) but
          // there're other ongoing request(s) at the same time,
          // we need to ignore the other result(s) to avoid
          // possible race conditions:
          // req1------------------>res1
          //      req2-------->res2
          // in that case, the second response should not be overridden
          // by the first one.
          if (CONCURRENT_PROMISES[key]) {
            // we can mark it as a mutation to ignore
            // all requests which are fired before this one
            MUTATION_TS[key] = Date.now() - 1
          }
          // if no cache being rendered currently (it shows a blank page),
          // we trigger the loading slow event.
          if (config.loadingTimeout && !cacheGet(key)) {
            setTimeout(() => {
              if (loading) config.onLoadingSlow(key, config)
            }, config.loadingTimeout)
          }
          if (fnArgs !== null) {
            CONCURRENT_PROMISES[key] = fn(...fnArgs)
          } else {
            CONCURRENT_PROMISES[key] = fn(key)
          }
          CONCURRENT_PROMISES_TS[key] = startAt = Date.now()
          newData = await CONCURRENT_PROMISES[key]
          setTimeout(() => {
            delete CONCURRENT_PROMISES[key]
            delete CONCURRENT_PROMISES_TS[key]
          }, config.dedupingInterval)
          // trigger the success event,
          // only do this for the original request.
          config.onSuccess(newData, key, config)
        }
        // if the revalidation happened earlier than the local mutation,
        // we have to ignore the result because it could override.
        // meanwhile, a new revalidation should be triggered by the mutation.
        if (MUTATION_TS[key] && startAt <= MUTATION_TS[key]) {
          dispatch({ isValidating: false })
          return false
        }
        cacheSet(key, newData)
        cacheSet(keyErr, undefined)
        keyRef.current = key
        // new state for the reducer
        const newState = {
          isValidating: false,
        }
        if (typeof stateRef.current.error !== 'undefined') {
          // we don't have an error
          newState.error = undefined
        }
        if (config.compare(stateRef.current.data, newData)) {
          // deep compare to avoid extra re-render
          // do nothing
        } else {
          // data changed
          newState.data = newData
        }
        // merge the new state
        dispatch(newState)
        if (!shouldDeduping) {
          // also update other hooks
          broadcastState(key, newData, undefined)
        }
      } catch (err) {
        delete CONCURRENT_PROMISES[key]
        delete CONCURRENT_PROMISES_TS[key]
        cacheSet(keyErr, err)
        keyRef.current = key
        // get a new error
        // don't use deep equal for errors
        if (stateRef.current.error !== err) {
          // we keep the stale data
          dispatch({
            isValidating: false,
            error: err,
          })
          if (!shouldDeduping) {
            // also broadcast to update other hooks
            broadcastState(key, undefined, err)
          }
        }
        // events and retry
        config.onError(err, key, config)
        if (config.shouldRetryOnError) {
          // when retrying, we always enable deduping
          const retryCount = (revalidateOpts.retryCount || 0) + 1
          config.onErrorRetry(
            err,
            key,
            config,
            revalidate,
            Object.assign({ dedupe: true }, revalidateOpts, { retryCount })
          )
        }
      }
      loading = false
      return true
    },
    [key]
  )
  // mounted (client side rendering)
  useIsomorphicLayoutEffect(() => {
    if (!key) return undefined
    // after `key` updates, we need to mark it as mounted
    unmountedRef.current = false
    // after the component is mounted (hydrated),
    // we need to update the data from the cache
    // and trigger a revalidation
    const currentHookData = stateRef.current.data
    const latestKeyedData = cacheGet(key) || config.initialData
    // update the state if the key changed or cache updated
    if (
      keyRef.current !== key ||
      !config.compare(currentHookData, latestKeyedData)
    ) {
      dispatch({ data: latestKeyedData })
      keyRef.current = key
    }
    // revalidate with deduping
    const softRevalidate = () => revalidate({ dedupe: true })
    // trigger a revalidation
    if (!config.initialData) {
      if (
        typeof latestKeyedData !== 'undefined' &&
        !IS_SERVER &&
        window['requestIdleCallback']
      ) {
        // delay revalidate if there's cache
        // to not block the rendering
        window['requestIdleCallback'](softRevalidate)
      } else {
        softRevalidate()
      }
    }
    // whenever the window gets focused, revalidate
    let onFocus
    if (config.revalidateOnFocus) {
      // throttle: avoid being called twice from both listeners
      // and tabs being switched quickly
      onFocus = throttle(softRevalidate, config.focusThrottleInterval)
      if (!FOCUS_REVALIDATORS[key]) {
        FOCUS_REVALIDATORS[key] = [onFocus]
      } else {
        FOCUS_REVALIDATORS[key].push(onFocus)
      }
    }
    // register global cache update listener
    const onUpdate = (
      shouldRevalidate = true,
      updatedData,
      updatedError,
      dedupe = true
    ) => {
      // update hook state
      const newState = {}
      let needUpdate = false
      if (
        typeof updatedData !== 'undefined' &&
        !config.compare(stateRef.current.data, updatedData)
      ) {
        newState.data = updatedData
        needUpdate = true
      }
      // always update error
      // because it can be `undefined`
      if (stateRef.current.error !== updatedError) {
        newState.error = updatedError
        needUpdate = true
      }
      if (needUpdate) {
        dispatch(newState)
      }
      keyRef.current = key
      if (shouldRevalidate) {
        if (dedupe) {
          return softRevalidate()
        } else {
          return revalidate()
        }
      }
      return false
    }
    // add updater to listeners
    if (!CACHE_REVALIDATORS[key]) {
      CACHE_REVALIDATORS[key] = [onUpdate]
    } else {
      CACHE_REVALIDATORS[key].push(onUpdate)
    }
    // set up reconnecting when the browser regains network connection
    let reconnect = null
    if (
      typeof addEventListener !== 'undefined' &&
      config.revalidateOnReconnect
    ) {
      reconnect = addEventListener('online', softRevalidate)
    }
    return () => {
      // cleanup
      dispatch = () => null
      // mark it as unmounted
      unmountedRef.current = true
      if (onFocus && FOCUS_REVALIDATORS[key]) {
        const revalidators = FOCUS_REVALIDATORS[key]
        const index = revalidators.indexOf(onFocus)
        if (index >= 0) {
          // 10x faster than splice
          // https://jsperf.com/array-remove-by-index
          revalidators[index] = revalidators[revalidators.length - 1]
          revalidators.pop()
        }
      }
      if (CACHE_REVALIDATORS[key]) {
        const revalidators = CACHE_REVALIDATORS[key]
        const index = revalidators.indexOf(onUpdate)
        if (index >= 0) {
          revalidators[index] = revalidators[revalidators.length - 1]
          revalidators.pop()
        }
      }
      if (typeof removeEventListener !== 'undefined' && reconnect !== null) {
        removeEventListener('online', reconnect)
      }
    }
  }, [key, revalidate])
  // set up polling
  useIsomorphicLayoutEffect(() => {
    let timer = null
    const tick = async () => {
      if (
        !stateRef.current.error &&
        (config.refreshWhenHidden || isDocumentVisible()) &&
        !config.refreshWhenOffline &&
        isOnline()
      ) {
        // only revalidate when the page is visible
        // if API request errored, we stop polling in this round
        // and let the error retry function handle it
        await revalidate({ dedupe: true })
      }
      if (config.refreshInterval) {
        timer = setTimeout(tick, config.refreshInterval)
      }
    }
    if (config.refreshInterval) {
      timer = setTimeout(tick, config.refreshInterval)
    }
    return () => {
      if (timer) clearTimeout(timer)
    }
  }, [
    config.refreshInterval,
    config.refreshWhenHidden,
    config.refreshWhenOffline,
    revalidate,
  ])
  // suspense
  if (config.suspense) {
    if (IS_SERVER)
      throw new Error('Suspense on server side is not yet supported!')
    // in suspense mode, we can't return empty state
    // (it should be suspended)
    // try to get data and error from cache
    let latestData = cacheGet(key)
    let latestError = cacheGet(keyErr)
    if (
      typeof latestData === 'undefined' &&
      typeof latestError === 'undefined'
    ) {
      // need to start the request if it hasn't
      if (!CONCURRENT_PROMISES[key]) {
        // trigger revalidate immediately
        // to get the promise
        revalidate()
      }
      if (
        CONCURRENT_PROMISES[key] &&
        typeof CONCURRENT_PROMISES[key].then === 'function'
      ) {
        // if it is a promise
        throw CONCURRENT_PROMISES[key]
      }
      // it's a value, return it directly (override)
      latestData = CONCURRENT_PROMISES[key]
    }
    if (typeof latestData === 'undefined' && latestError) {
      // in suspense mode, throw error if there's no content
      throw latestError
    }
    // return the latest data / error from cache
    // in case `key` has changed
    return {
      error: latestError,
      data: latestData,
      revalidate,
      mutate: boundMutate,
      isValidating: stateRef.current.isValidating,
    }
  }
  // define returned state
  // can be memorized since the state is a ref
  return useMemo(() => {
    const state = { revalidate, mutate: boundMutate }
    Object.defineProperties(state, {
      error: {
        // `key` might be changed in the upcoming hook re-render,
        // but the previous state will stay
        // so we need to match the latest key and data (fallback to `initialData`)
        get: function () {
          stateDependencies.current.error = true
          return keyRef.current === key ? stateRef.current.error : initialError
        },
      },
      data: {
        get: function () {
          stateDependencies.current.data = true
          return keyRef.current === key ? stateRef.current.data : initialData
        },
      },
      isValidating: {
        get: function () {
          stateDependencies.current.isValidating = true
          return stateRef.current.isValidating
        },
      },
    })
    return state
  }, [revalidate])
}
const SWRConfig = SWRConfigContext.Provider

/*
The idea

A "Page" component renders the content of 1 API request, it accepts an offset (in this example it's from),
uses a SWR hook (useSWR(API + '?limit=' + limit + '&from=' + from)) and returns items (Projects).

The UI:
      +------------------------------------------+
      |   Projects                               |
+------------------------------------------------------+
|     |   +----------------+                     |     |
|     |                                          |     |
|     |   +------------+                         |     |
|     |                                          |     +--> 1 Page
|     |   +-----------------+                    |     |
|     |                                          |     |  /projects/list?limit=4
|     |   +---------+                            |     |
+------------------------------------------------------+
      |                                          |
      |   +------------+                         |     +  /projects/list?limit=4&from=123
      |                                          |     |
      |   +----------------+                     |     |
      |                                          |     |
      |   +---------+                            |     |
      |                                          |     |
      |   +--------------+                       |     +
      |                                          |
      |   +-------------------+                  |     +  /projects/list?limit=4&from=456
      |                                          |     |
      |   +------------+                         |     |
      |                                          |     |
      |   +----------------+                     |     |
      |                                          |     |
      |                                          |     +

The API
// (inside `render`)

function App () {
  const {
    pages,    // an array of each page component
    pageSWRs, // an array of SWRs of each page
    isLoadingMore,
    isReachingEnd,
    isEmpty,
    loadMore
  } = useSWRPages(
    'project-page', // key of this page

    // ======== the actual Page component!
    ({ offset, withSWR }) => {
      // required: use `withSWR` to wrap your main SWR (source of your pagination API)
      const { data } = withSWR(
        useSWR(API + '?limit=10&from=' + offset) // request projects with offset
      )
      if (!data) return <Placeholder>
      return data.projects.map(project => <Card project={project} team={team}>)
    },
    // ========

    // a function accepts a SWR's `data`, and returns the offset of the next page (or null)
    data => data && data.length >= 10 ? data[data.length - 1].createdAt : null,

    // (optional) outside deps of your Page component. in this case it's empty
    []
  )

  // ...

  if (isEmpty) return <EmptyProjectsPage/>

  return <div>
    {pages}
    {isReachingEnd
      ? null
      : <button loading={isLoadingMore} onClick={loadMore}>Load More</button>}
  </div>
}
*/
const pageCacheMap = new Map()
function useSWRPages(pageKey, pageFn, SWRToOffset, deps = []) {
  const pageCountKey = `_swr_page_count_` + pageKey
  const pageOffsetKey = `_swr_page_offset_` + pageKey
  const [pageCount, setPageCount] = useState(cacheGet(pageCountKey) || 1)
  const [pageOffsets, setPageOffsets] = useState(
    cacheGet(pageOffsetKey) || [null]
  )
  const [pageSWRs, setPageSWRs] = useState([])
  const pageFnRef = useRef(pageFn)
  const emptyPageRef = useRef(false)
  // Page component (wraps `pageFn`)
  // for performance reason we need to memorize it
  const Page = useCallback((props) => {
    // render the page component
    const dataList = pageFnRef.current(props)
    // if dataList is [], we can assume this page is empty
    // TODO: this API is not stable
    if (dataList && !dataList.length) {
      emptyPageRef.current = true
    } else {
      emptyPageRef.current = false
    }
    return dataList
  }, [])
  // Doesn't have a next page
  const isReachingEnd = pageOffsets[pageCount] === null
  const isLoadingMore = pageCount === pageOffsets.length
  const isEmpty = isReachingEnd && pageCount === 1 && emptyPageRef.current
  const loadMore = useCallback(() => {
    if (isLoadingMore || isReachingEnd) return
    setPageCount((c) => {
      cacheSet(pageCountKey, c + 1)
      return c + 1
    })
  }, [isLoadingMore || isReachingEnd])
  const _pageFn = useCallback(pageFn, deps)
  pageFnRef.current = _pageFn
  const pages = useMemo(() => {
    const getWithSWR = (id) => (swr) => {
      if (
        !pageSWRs[id] ||
        pageSWRs[id].data !== swr.data ||
        pageSWRs[id].error !== swr.error ||
        pageSWRs[id].revalidate !== swr.revalidate
      ) {
        setPageSWRs((swrs) => {
          const _swrs = [...swrs]
          _swrs[id] = {
            data: swr.data,
            error: swr.error,
            revalidate: swr.revalidate,
            isValidating: swr.isValidating,
            mutate: swr.mutate,
          }
          return _swrs
        })
        if (typeof swr.data !== 'undefined') {
          // set next page's offset
          const newPageOffset = SWRToOffset(swr, id)
          if (pageOffsets[id + 1] !== newPageOffset) {
            setPageOffsets((arr) => {
              const _arr = [...arr]
              _arr[id + 1] = newPageOffset
              cacheSet(pageOffsetKey, _arr)
              return _arr
            })
          }
        }
      }
      return swr
    }
    // render each page
    const p = []
    if (!pageCacheMap.has(pageKey)) {
      pageCacheMap.set(pageKey, [])
    }
    const pageCache = pageCacheMap.get(pageKey)
    for (let i = 0; i < pageCount; ++i) {
      if (
        !pageCache[i] ||
        pageCache[i].offset !== pageOffsets[i] ||
        pageCache[i].pageFn !== _pageFn
      ) {
        // when props change or at init
        // render the page and cache it
        pageCache[i] = {
          component: React.createElement(Page, {
            key: `page-${pageOffsets[i]}-${i}`,
            offset: pageOffsets[i],
            withSWR: getWithSWR(i),
          }),
          pageFn: _pageFn,
          offset: pageOffsets[i],
        }
      }
      p.push(pageCache[i].component)
    }
    return p
  }, [_pageFn, pageCount, pageSWRs, pageOffsets, pageKey])
  return {
    pages,
    pageCount,
    pageSWRs,
    isLoadingMore,
    isReachingEnd,
    isEmpty,
    loadMore,
  }
}

export default useSWR
export { SWRConfig, mutate, trigger, useSWRPages }
