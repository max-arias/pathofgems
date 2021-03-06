import React, { useEffect, useRef, useReducer, useCallback, useDebugValue, useMemo } from './react.js';

/* istanbul ignore file */
/**
 * Universal global scope object. In the browser this is `self`, in Node.js and React Native it's `global`.
 * This file is excluded from coverage reporting because these globals are environment-specific so we can't test them all.
 */
const globalScope = (() => {
    if (typeof self === "object" && self.self === self)
        return self;
    if (typeof global === "object" && global.global === global)
        return global;
    if (typeof global === "object" && global.GLOBAL === global)
        return global;
    return {}; // fallback that relies on imported modules to be singletons
})();
/**
 * Globally available object used to connect the DevTools to all React Async instances.
 */
globalScope.__REACT_ASYNC__ = globalScope.__REACT_ASYNC__ || {};
const noop = () => { };
class MockAbortController {
    constructor() {
        this.abort = noop;
        this.signal = {};
    }
}

let PropTypes;
try {
    PropTypes = require("prop-types");
}
catch (e) { }
const childrenFn = PropTypes && PropTypes.oneOfType([PropTypes.node, PropTypes.func]);
const stateObject = PropTypes &&
    PropTypes.shape({
        initialValue: PropTypes.any,
        data: PropTypes.any,
        error: PropTypes.instanceOf(Error),
        value: PropTypes.any,
        startedAt: PropTypes.instanceOf(Date),
        finishedAt: PropTypes.instanceOf(Date),
        status: PropTypes.oneOf(["initial", "pending", "fulfilled", "rejected"]),
        isInitial: PropTypes.bool,
        isPending: PropTypes.bool,
        isLoading: PropTypes.bool,
        isFulfilled: PropTypes.bool,
        isResolved: PropTypes.bool,
        isRejected: PropTypes.bool,
        isSettled: PropTypes.bool,
        counter: PropTypes.number,
        promise: PropTypes.instanceOf(Promise),
        run: PropTypes.func,
        reload: PropTypes.func,
        cancel: PropTypes.func,
        setData: PropTypes.func,
        setError: PropTypes.func,
    });
var propTypes = PropTypes && {
    Async: {
        children: childrenFn,
        promise: PropTypes.instanceOf(Promise),
        promiseFn: PropTypes.func,
        deferFn: PropTypes.func,
        watch: PropTypes.any,
        watchFn: PropTypes.func,
        initialValue: PropTypes.any,
        onResolve: PropTypes.func,
        onReject: PropTypes.func,
        reducer: PropTypes.func,
        dispatcher: PropTypes.func,
        debugLabel: PropTypes.string,
        suspense: PropTypes.bool,
    },
    Initial: {
        children: childrenFn,
        state: stateObject.isRequired,
        persist: PropTypes.bool,
    },
    Pending: {
        children: childrenFn,
        state: stateObject.isRequired,
        initial: PropTypes.bool,
    },
    Fulfilled: {
        children: childrenFn,
        state: stateObject.isRequired,
        persist: PropTypes.bool,
    },
    Rejected: {
        children: childrenFn,
        state: stateObject.isRequired,
        persist: PropTypes.bool,
    },
    Settled: {
        children: childrenFn,
        state: stateObject.isRequired,
        persist: PropTypes.bool,
    },
};

const renderFn = (children, ...args) => {
    if (typeof children === "function") {
        const render = children;
        return render(...args);
    }
    return children;
};
/**
 * Renders only when no promise has started or completed yet.
 *
 * @prop {Function|Node} children Function (passing state) or React node
 * @prop {Object} state React Async state object
 * @prop {boolean} persist Show until we have data, even while pending (loading) or when an error occurred
 */
const IfInitial = ({ children, persist, state = {}, }) => React.createElement(React.Fragment, null, state.isInitial || (persist && !state.data) ? renderFn(children, state) : null);
/**
 * Renders only while pending (promise is loading).
 *
 * @prop {Function|Node} children Function (passing state) or React node
 * @prop {Object} state React Async state object
 * @prop {boolean} initial Show only on initial load (data is undefined)
 */
const IfPending = ({ children, initial, state = {}, }) => React.createElement(React.Fragment, null, state.isPending && (!initial || !state.value) ? renderFn(children, state) : null);
/**
 * Renders only when promise is resolved.
 *
 * @prop {Function|Node} children Function (passing data and state) or React node
 * @prop {Object} state React Async state object
 * @prop {boolean} persist Show old data while pending (promise is loading)
 */
const IfFulfilled = ({ children, persist, state = {}, }) => (React.createElement(React.Fragment, null, state.isFulfilled || (persist && state.data) ? renderFn(children, state.data, state) : null));
/**
 * Renders only when promise is rejected.
 *
 * @prop {Function|Node} children Function (passing error and state) or React node
 * @prop {Object} state React Async state object
 * @prop {boolean} persist Show old error while pending (promise is loading)
 */
const IfRejected = ({ children, persist, state = {}, }) => (React.createElement(React.Fragment, null, state.isRejected || (persist && state.error) ? renderFn(children, state.error, state) : null));
/**
 * Renders only when promise is fulfilled or rejected.
 *
 * @prop {Function|Node} children Function (passing state) or React node
 * @prop {Object} state React Async state object
 * @prop {boolean} persist Show old data or error while pending (promise is loading)
 */
const IfSettled = ({ children, persist, state = {}, }) => React.createElement(React.Fragment, null, state.isSettled || (persist && state.value) ? renderFn(children, state) : null);
if (propTypes) {
    IfInitial.propTypes = propTypes.Initial;
    IfPending.propTypes = propTypes.Pending;
    IfFulfilled.propTypes = propTypes.Fulfilled;
    IfRejected.propTypes = propTypes.Rejected;
    IfSettled.propTypes = propTypes.Settled;
}

var StatusTypes;
(function (StatusTypes) {
    StatusTypes["initial"] = "initial";
    StatusTypes["pending"] = "pending";
    StatusTypes["fulfilled"] = "fulfilled";
    StatusTypes["rejected"] = "rejected";
})(StatusTypes || (StatusTypes = {}));
const getInitialStatus = (value, promise) => {
    if (value instanceof Error)
        return StatusTypes.rejected;
    if (value !== undefined)
        return StatusTypes.fulfilled;
    if (promise)
        return StatusTypes.pending;
    return StatusTypes.initial;
};
const getIdleStatus = (value) => {
    if (value instanceof Error)
        return StatusTypes.rejected;
    if (value !== undefined)
        return StatusTypes.fulfilled;
    return StatusTypes.initial;
};
const getStatusProps = (status) => ({
    status,
    isInitial: status === StatusTypes.initial,
    isPending: status === StatusTypes.pending,
    isLoading: status === StatusTypes.pending,
    isFulfilled: status === StatusTypes.fulfilled,
    isResolved: status === StatusTypes.fulfilled,
    isRejected: status === StatusTypes.rejected,
    isSettled: status === StatusTypes.fulfilled || status === StatusTypes.rejected,
});

// This exists to make sure we don't hold any references to user-provided functions
// The way NeverSettle extends from Promise is complicated, but can't be done differently because Babel doesn't support
// extending built-in classes. See https://babeljs.io/docs/en/caveats/#classes
const NeverSettle = function () { };
/* istanbul ignore next */
if (Object.setPrototypeOf) {
    Object.setPrototypeOf(NeverSettle, Promise);
}
else {
    NeverSettle.__proto__ = Promise;
}
NeverSettle.prototype = Object.assign(Object.create(Promise.prototype), {
    finally() {
        return this;
    },
    catch() {
        return this;
    },
    then() {
        return this;
    },
});
const neverSettle = new NeverSettle();
var ActionTypes;
(function (ActionTypes) {
    ActionTypes["start"] = "start";
    ActionTypes["cancel"] = "cancel";
    ActionTypes["fulfill"] = "fulfill";
    ActionTypes["reject"] = "reject";
})(ActionTypes || (ActionTypes = {}));
const init = ({ initialValue, promise, promiseFn, }) => ({
    initialValue,
    data: initialValue instanceof Error ? undefined : initialValue,
    error: initialValue instanceof Error ? initialValue : undefined,
    value: initialValue,
    startedAt: promise || promiseFn ? new Date() : undefined,
    finishedAt: initialValue ? new Date() : undefined,
    ...getStatusProps(getInitialStatus(initialValue, promise || promiseFn)),
    counter: 0,
    promise: neverSettle,
});
const reducer = (state, action) => {
    switch (action.type) {
        case ActionTypes.start:
            return {
                ...state,
                startedAt: new Date(),
                finishedAt: undefined,
                ...getStatusProps(StatusTypes.pending),
                counter: action.meta.counter,
                promise: action.meta.promise,
            };
        case ActionTypes.cancel:
            return {
                ...state,
                startedAt: undefined,
                finishedAt: undefined,
                ...getStatusProps(getIdleStatus(state.error || state.data)),
                counter: action.meta.counter,
                promise: action.meta.promise,
            };
        case ActionTypes.fulfill:
            return {
                ...state,
                data: action.payload,
                value: action.payload,
                error: undefined,
                finishedAt: new Date(),
                ...getStatusProps(StatusTypes.fulfilled),
                promise: action.meta.promise,
            };
        case ActionTypes.reject:
            return {
                ...state,
                error: action.payload,
                value: action.payload,
                finishedAt: new Date(),
                ...getStatusProps(StatusTypes.rejected),
                promise: action.meta.promise,
            };
        default:
            return state;
    }
};
const dispatchMiddleware = (dispatch) => (action, ...args) => {
    dispatch(action, ...args);
    if (action.type === ActionTypes.start && typeof action.payload === "function") {
        action.payload();
    }
};

class Async extends React.Component {
}
/**
 * createInstance allows you to create instances of Async that are bound to a specific promise.
 * A unique instance also uses its own React context for better nesting capability.
 */
function createInstance(defaultOptions = {}, displayName = "Async") {
    const { Consumer: UnguardedConsumer, Provider } = React.createContext(undefined);
    function Consumer({ children }) {
        return (React.createElement(UnguardedConsumer, null, value => {
            if (!value) {
                throw new Error("this component should only be used within an associated <Async> component!");
            }
            return children(value);
        }));
    }
    class Async extends React.Component {
        constructor(props) {
            super(props);
            this.mounted = false;
            this.counter = 0;
            this.args = [];
            this.promise = neverSettle;
            this.abortController = new MockAbortController();
            this.start = this.start.bind(this);
            this.load = this.load.bind(this);
            this.run = this.run.bind(this);
            this.cancel = this.cancel.bind(this);
            this.onResolve = this.onResolve.bind(this);
            this.onReject = this.onReject.bind(this);
            this.setData = this.setData.bind(this);
            this.setError = this.setError.bind(this);
            const promise = props.promise;
            const promiseFn = props.promiseFn || defaultOptions.promiseFn;
            const initialValue = props.initialValue || defaultOptions.initialValue;
            this.state = {
                ...init({ initialValue, promise, promiseFn }),
                cancel: this.cancel,
                run: this.run,
                reload: () => {
                    this.load();
                    this.run(...this.args);
                },
                setData: this.setData,
                setError: this.setError,
            };
            this.debugLabel = props.debugLabel || defaultOptions.debugLabel;
            const { devToolsDispatcher } = globalScope.__REACT_ASYNC__;
            const _reducer = props.reducer || defaultOptions.reducer;
            const _dispatcher = props.dispatcher || defaultOptions.dispatcher || devToolsDispatcher;
            const reducer$1 = _reducer
                ? (state, action) => _reducer(state, action, reducer)
                : reducer;
            const dispatch = dispatchMiddleware((action, callback) => {
                this.setState(state => reducer$1(state, action), callback);
            });
            this.dispatch = _dispatcher ? action => _dispatcher(action, dispatch, props) : dispatch;
        }
        componentDidMount() {
            this.mounted = true;
            if (this.props.promise || !this.state.initialValue) {
                this.load();
            }
        }
        componentDidUpdate(prevProps) {
            const { watch, watchFn = defaultOptions.watchFn, promise, promiseFn } = this.props;
            if (watch !== prevProps.watch) {
                if (this.counter)
                    this.cancel();
                return this.load();
            }
            if (watchFn &&
                watchFn({ ...defaultOptions, ...this.props }, { ...defaultOptions, ...prevProps })) {
                if (this.counter)
                    this.cancel();
                return this.load();
            }
            if (promise !== prevProps.promise) {
                if (this.counter)
                    this.cancel();
                if (promise)
                    return this.load();
            }
            if (promiseFn !== prevProps.promiseFn) {
                if (this.counter)
                    this.cancel();
                if (promiseFn)
                    return this.load();
            }
        }
        componentWillUnmount() {
            this.cancel();
            this.mounted = false;
        }
        getMeta(meta) {
            return {
                counter: this.counter,
                promise: this.promise,
                debugLabel: this.debugLabel,
                ...meta,
            };
        }
        start(promiseFn) {
            if ("AbortController" in globalScope) {
                this.abortController.abort();
                this.abortController = new globalScope.AbortController();
            }
            this.counter++;
            return (this.promise = new Promise((resolve, reject) => {
                if (!this.mounted)
                    return;
                const executor = () => promiseFn().then(resolve, reject);
                this.dispatch({ type: ActionTypes.start, payload: executor, meta: this.getMeta() });
            }));
        }
        load() {
            const promise = this.props.promise;
            const promiseFn = this.props.promiseFn || defaultOptions.promiseFn;
            if (promise) {
                this.start(() => promise)
                    .then(this.onResolve(this.counter))
                    .catch(this.onReject(this.counter));
            }
            else if (promiseFn) {
                const props = { ...defaultOptions, ...this.props };
                this.start(() => promiseFn(props, this.abortController))
                    .then(this.onResolve(this.counter))
                    .catch(this.onReject(this.counter));
            }
        }
        run(...args) {
            const deferFn = this.props.deferFn || defaultOptions.deferFn;
            if (deferFn) {
                this.args = args;
                const props = { ...defaultOptions, ...this.props };
                return this.start(() => deferFn(args, props, this.abortController)).then(this.onResolve(this.counter), this.onReject(this.counter));
            }
        }
        cancel() {
            const onCancel = this.props.onCancel || defaultOptions.onCancel;
            onCancel && onCancel();
            this.counter++;
            this.abortController.abort();
            this.mounted && this.dispatch({ type: ActionTypes.cancel, meta: this.getMeta() });
        }
        onResolve(counter) {
            return (data) => {
                if (this.counter === counter) {
                    const onResolve = this.props.onResolve || defaultOptions.onResolve;
                    this.setData(data, () => onResolve && onResolve(data));
                }
                return data;
            };
        }
        onReject(counter) {
            return (error) => {
                if (this.counter === counter) {
                    const onReject = this.props.onReject || defaultOptions.onReject;
                    this.setError(error, () => onReject && onReject(error));
                }
                return error;
            };
        }
        setData(data, callback) {
            this.mounted &&
                this.dispatch({ type: ActionTypes.fulfill, payload: data, meta: this.getMeta() }, callback);
            return data;
        }
        setError(error, callback) {
            this.mounted &&
                this.dispatch({ type: ActionTypes.reject, payload: error, error: true, meta: this.getMeta() }, callback);
            return error;
        }
        render() {
            const { children, suspense } = this.props;
            if (suspense && this.state.isPending && this.promise !== neverSettle) {
                // Rely on Suspense to handle the loading state
                throw this.promise;
            }
            if (typeof children === "function") {
                const render = children;
                return React.createElement(Provider, { value: this.state }, render(this.state));
            }
            if (children !== undefined && children !== null) {
                return React.createElement(Provider, { value: this.state }, children);
            }
            return null;
        }
    }
    if (propTypes)
        Async.propTypes = propTypes.Async;
    const AsyncInitial = props => (React.createElement(Consumer, null, st => React.createElement(IfInitial, Object.assign({}, props, { state: st }))));
    const AsyncPending = props => (React.createElement(Consumer, null, st => React.createElement(IfPending, Object.assign({}, props, { state: st }))));
    const AsyncFulfilled = props => (React.createElement(Consumer, null, st => React.createElement(IfFulfilled, Object.assign({}, props, { state: st }))));
    const AsyncRejected = props => (React.createElement(Consumer, null, st => React.createElement(IfRejected, Object.assign({}, props, { state: st }))));
    const AsyncSettled = props => (React.createElement(Consumer, null, st => React.createElement(IfSettled, Object.assign({}, props, { state: st }))));
    AsyncInitial.displayName = `${displayName}.Initial`;
    AsyncPending.displayName = `${displayName}.Pending`;
    AsyncFulfilled.displayName = `${displayName}.Fulfilled`;
    AsyncRejected.displayName = `${displayName}.Rejected`;
    AsyncSettled.displayName = `${displayName}.Settled`;
    return Object.assign(Async, {
        displayName: displayName,
        Initial: AsyncInitial,
        Pending: AsyncPending,
        Loading: AsyncPending,
        Fulfilled: AsyncFulfilled,
        Resolved: AsyncFulfilled,
        Rejected: AsyncRejected,
        Settled: AsyncSettled,
    });
}
var Async$1 = createInstance();

function useAsync(arg1, arg2) {
    const options = typeof arg1 === "function"
        ? {
            ...arg2,
            promiseFn: arg1,
        }
        : arg1;
    const counter = useRef(0);
    const isMounted = useRef(true);
    const lastArgs = useRef(undefined);
    const lastOptions = useRef(options);
    const lastPromise = useRef(neverSettle);
    const abortController = useRef(new MockAbortController());
    const { devToolsDispatcher } = globalScope.__REACT_ASYNC__;
    const { reducer: reducer$1, dispatcher = devToolsDispatcher } = options;
    const [state, _dispatch] = useReducer(reducer$1 ? (state, action) => reducer$1(state, action, reducer) : reducer, options, init);
    const dispatch = useCallback(dispatcher
        ? action => dispatcher(action, dispatchMiddleware(_dispatch), lastOptions.current)
        : dispatchMiddleware(_dispatch), [dispatcher]);
    const { debugLabel } = options;
    const getMeta = useCallback((meta) => ({
        counter: counter.current,
        promise: lastPromise.current,
        debugLabel,
        ...meta,
    }), [debugLabel]);
    const setData = useCallback((data, callback = noop) => {
        if (isMounted.current) {
            dispatch({
                type: ActionTypes.fulfill,
                payload: data,
                meta: getMeta(),
            });
            callback();
        }
        return data;
    }, [dispatch, getMeta]);
    const setError = useCallback((error, callback = noop) => {
        if (isMounted.current) {
            dispatch({
                type: ActionTypes.reject,
                payload: error,
                error: true,
                meta: getMeta(),
            });
            callback();
        }
        return error;
    }, [dispatch, getMeta]);
    const { onResolve, onReject } = options;
    const handleResolve = useCallback(count => (data) => count === counter.current && setData(data, () => onResolve && onResolve(data)), [setData, onResolve]);
    const handleReject = useCallback(count => (err) => count === counter.current && setError(err, () => onReject && onReject(err)), [setError, onReject]);
    const start = useCallback(promiseFn => {
        if ("AbortController" in globalScope) {
            abortController.current.abort();
            abortController.current = new globalScope.AbortController();
        }
        counter.current++;
        return (lastPromise.current = new Promise((resolve, reject) => {
            if (!isMounted.current)
                return;
            const executor = () => promiseFn().then(resolve, reject);
            dispatch({
                type: ActionTypes.start,
                payload: executor,
                meta: getMeta(),
            });
        }));
    }, [dispatch, getMeta]);
    const { promise, promiseFn, initialValue } = options;
    const load = useCallback(() => {
        const isPreInitialized = initialValue && counter.current === 0;
        if (promise) {
            start(() => promise)
                .then(handleResolve(counter.current))
                .catch(handleReject(counter.current));
        }
        else if (promiseFn && !isPreInitialized) {
            start(() => promiseFn(lastOptions.current, abortController.current))
                .then(handleResolve(counter.current))
                .catch(handleReject(counter.current));
        }
    }, [start, promise, promiseFn, initialValue, handleResolve, handleReject]);
    const { deferFn } = options;
    const run = useCallback((...args) => {
        if (deferFn) {
            lastArgs.current = args;
            start(() => deferFn(args, lastOptions.current, abortController.current))
                .then(handleResolve(counter.current))
                .catch(handleReject(counter.current));
        }
    }, [start, deferFn, handleResolve, handleReject]);
    const reload = useCallback(() => {
        lastArgs.current ? run(...lastArgs.current) : load();
    }, [run, load]);
    const { onCancel } = options;
    const cancel = useCallback(() => {
        onCancel && onCancel();
        counter.current++;
        abortController.current.abort();
        isMounted.current &&
            dispatch({
                type: ActionTypes.cancel,
                meta: getMeta(),
            });
    }, [onCancel, dispatch, getMeta]);
    /* These effects should only be triggered on changes to specific props */
    /* eslint-disable react-hooks/exhaustive-deps */
    const { watch, watchFn } = options;
    useEffect(() => {
        if (watchFn && lastOptions.current && watchFn(options, lastOptions.current)) {
            lastOptions.current = options;
            load();
        }
    });
    useEffect(() => {
        lastOptions.current = options;
    }, [options]);
    useEffect(() => {
        if (counter.current)
            cancel();
        if (promise || promiseFn)
            load();
    }, [promise, promiseFn, watch]);
    useEffect(() => () => {
        isMounted.current = false;
    }, []);
    useEffect(() => () => cancel(), []);
    /* eslint-enable react-hooks/exhaustive-deps */
    useDebugValue(state, ({ status }) => `[${counter.current}] ${status}`);
    if (options.suspense && state.isPending && lastPromise.current !== neverSettle) {
        // Rely on Suspense to handle the loading state
        throw lastPromise.current;
    }
    return useMemo(() => ({
        ...state,
        run,
        reload,
        cancel,
        setData,
        setError,
    }), [state, run, reload, cancel, setData, setError]);
}
class FetchError extends Error {
    constructor(response) {
        super(`${response.status} ${response.statusText}`);
        this.response = response;
        /* istanbul ignore next */
        if (Object.setPrototypeOf) {
            // Not available in IE 10, but can be polyfilled
            Object.setPrototypeOf(this, FetchError.prototype);
        }
    }
}
const parseResponse = (accept, json) => (res) => {
    if (!res.ok)
        return Promise.reject(new FetchError(res));
    if (typeof json === "boolean")
        return json ? res.json() : res;
    return accept === "application/json" ? res.json() : res;
};
function isEvent(e) {
    return typeof e === "object" && "preventDefault" in e;
}
/**
 *
 * @param {RequestInfo} resource
 * @param {RequestInit} init
 * @param {FetchOptions} options
 * @returns {AsyncState<T, FetchRun<T>>}
 */
function useAsyncFetch(resource, init, { defer, json, ...options } = {}) {
    const method = resource.method || (init && init.method);
    const headers = resource.headers || (init && init.headers) || {};
    const accept = headers["Accept"] || headers["accept"] || (headers.get && headers.get("accept"));
    const doFetch = (input, init) => globalScope.fetch(input, init).then(parseResponse(accept, json));
    const isDefer = typeof defer === "boolean" ? defer : ["POST", "PUT", "PATCH", "DELETE"].indexOf(method) !== -1;
    const fn = isDefer ? "deferFn" : "promiseFn";
    const identity = JSON.stringify({
        resource,
        init,
        isDefer,
    });
    const promiseFn = useCallback((_, { signal }) => {
        return doFetch(resource, { signal, ...init });
    }, [identity] // eslint-disable-line react-hooks/exhaustive-deps
    );
    const deferFn = useCallback(function ([override], _, { signal }) {
        if (!override || isEvent(override)) {
            return doFetch(resource, { signal, ...init });
        }
        if (typeof override === "function") {
            const { resource: runResource, ...runInit } = override({ resource, signal, ...init });
            return doFetch(runResource || resource, { signal, ...runInit });
        }
        const { resource: runResource, ...runInit } = override;
        return doFetch(runResource || resource, { signal, ...init, ...runInit });
    }, [identity] // eslint-disable-line react-hooks/exhaustive-deps
    );
    const state = useAsync({
        ...options,
        [fn]: isDefer ? deferFn : promiseFn,
    });
    useDebugValue(state, ({ counter, status }) => `[${counter}] ${status}`);
    return state;
}
const unsupported = () => {
    throw new Error("useAsync requires React v16.8 or up. Upgrade your React version or use the <Async> component instead.");
};
var useAsync$1 = useEffect ? useAsync : unsupported;
const useFetch = useEffect ? useAsyncFetch : unsupported;

export default Async$1;
export { ActionTypes, Async$1 as Async, FetchError, IfFulfilled, IfInitial, IfPending, IfRejected, IfSettled, StatusTypes, createInstance, dispatchMiddleware, globalScope, init, neverSettle, reducer, useAsync$1 as useAsync, useFetch };
