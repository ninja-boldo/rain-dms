function Uf(e, t) {
  for (var n = 0; n < t.length; n++) {
    const r = t[n];
    if (typeof r != "string" && !Array.isArray(r)) {
      for (const l in r)
        if (l !== "default" && !(l in e)) {
          const o = Object.getOwnPropertyDescriptor(r, l);
          o &&
            Object.defineProperty(
              e,
              l,
              o.get ? o : { enumerable: !0, get: () => r[l] },
            );
        }
    }
  }
  return Object.freeze(
    Object.defineProperty(e, Symbol.toStringTag, { value: "Module" }),
  );
}
(function () {
  const t = document.createElement("link").relList;
  if (t && t.supports && t.supports("modulepreload")) return;
  for (const l of document.querySelectorAll('link[rel="modulepreload"]')) r(l);
  new MutationObserver((l) => {
    for (const o of l)
      if (o.type === "childList")
        for (const s of o.addedNodes)
          s.tagName === "LINK" && s.rel === "modulepreload" && r(s);
  }).observe(document, { childList: !0, subtree: !0 });
  function n(l) {
    const o = {};
    return (
      l.integrity && (o.integrity = l.integrity),
      l.referrerPolicy && (o.referrerPolicy = l.referrerPolicy),
      l.crossOrigin === "use-credentials"
        ? (o.credentials = "include")
        : l.crossOrigin === "anonymous"
          ? (o.credentials = "omit")
          : (o.credentials = "same-origin"),
      o
    );
  }
  function r(l) {
    if (l.ep) return;
    l.ep = !0;
    const o = n(l);
    fetch(l.href, o);
  }
})();
function Wf(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default")
    ? e.default
    : e;
}
var Wu = { exports: {} },
  eo = {},
  Hu = { exports: {} },
  H = {};
/**
 * @license React
 * react.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ var Ur = Symbol.for("react.element"),
  Hf = Symbol.for("react.portal"),
  Vf = Symbol.for("react.fragment"),
  Kf = Symbol.for("react.strict_mode"),
  Qf = Symbol.for("react.profiler"),
  Jf = Symbol.for("react.provider"),
  Yf = Symbol.for("react.context"),
  Xf = Symbol.for("react.forward_ref"),
  Gf = Symbol.for("react.suspense"),
  Zf = Symbol.for("react.memo"),
  qf = Symbol.for("react.lazy"),
  aa = Symbol.iterator;
function ep(e) {
  return e === null || typeof e != "object"
    ? null
    : ((e = (aa && e[aa]) || e["@@iterator"]),
      typeof e == "function" ? e : null);
}
var Vu = {
    isMounted: function () {
      return !1;
    },
    enqueueForceUpdate: function () {},
    enqueueReplaceState: function () {},
    enqueueSetState: function () {},
  },
  Ku = Object.assign,
  Qu = {};
function Hn(e, t, n) {
  ((this.props = e),
    (this.context = t),
    (this.refs = Qu),
    (this.updater = n || Vu));
}
Hn.prototype.isReactComponent = {};
Hn.prototype.setState = function (e, t) {
  if (typeof e != "object" && typeof e != "function" && e != null)
    throw Error(
      "setState(...): takes an object of state variables to update or a function which returns an object of state variables.",
    );
  this.updater.enqueueSetState(this, e, t, "setState");
};
Hn.prototype.forceUpdate = function (e) {
  this.updater.enqueueForceUpdate(this, e, "forceUpdate");
};
function Ju() {}
Ju.prototype = Hn.prototype;
function qi(e, t, n) {
  ((this.props = e),
    (this.context = t),
    (this.refs = Qu),
    (this.updater = n || Vu));
}
var es = (qi.prototype = new Ju());
es.constructor = qi;
Ku(es, Hn.prototype);
es.isPureReactComponent = !0;
var ua = Array.isArray,
  Yu = Object.prototype.hasOwnProperty,
  ts = { current: null },
  Xu = { key: !0, ref: !0, __self: !0, __source: !0 };
function Gu(e, t, n) {
  var r,
    l = {},
    o = null,
    s = null;
  if (t != null)
    for (r in (t.ref !== void 0 && (s = t.ref),
    t.key !== void 0 && (o = "" + t.key),
    t))
      Yu.call(t, r) && !Xu.hasOwnProperty(r) && (l[r] = t[r]);
  var a = arguments.length - 2;
  if (a === 1) l.children = n;
  else if (1 < a) {
    for (var u = Array(a), c = 0; c < a; c++) u[c] = arguments[c + 2];
    l.children = u;
  }
  if (e && e.defaultProps)
    for (r in ((a = e.defaultProps), a)) l[r] === void 0 && (l[r] = a[r]);
  return {
    $$typeof: Ur,
    type: e,
    key: o,
    ref: s,
    props: l,
    _owner: ts.current,
  };
}
function tp(e, t) {
  return {
    $$typeof: Ur,
    type: e.type,
    key: t,
    ref: e.ref,
    props: e.props,
    _owner: e._owner,
  };
}
function ns(e) {
  return typeof e == "object" && e !== null && e.$$typeof === Ur;
}
function np(e) {
  var t = { "=": "=0", ":": "=2" };
  return (
    "$" +
    e.replace(/[=:]/g, function (n) {
      return t[n];
    })
  );
}
var ca = /\/+/g;
function jo(e, t) {
  return typeof e == "object" && e !== null && e.key != null
    ? np("" + e.key)
    : t.toString(36);
}
function gl(e, t, n, r, l) {
  var o = typeof e;
  (o === "undefined" || o === "boolean") && (e = null);
  var s = !1;
  if (e === null) s = !0;
  else
    switch (o) {
      case "string":
      case "number":
        s = !0;
        break;
      case "object":
        switch (e.$$typeof) {
          case Ur:
          case Hf:
            s = !0;
        }
    }
  if (s)
    return (
      (s = e),
      (l = l(s)),
      (e = r === "" ? "." + jo(s, 0) : r),
      ua(l)
        ? ((n = ""),
          e != null && (n = e.replace(ca, "$&/") + "/"),
          gl(l, t, n, "", function (c) {
            return c;
          }))
        : l != null &&
          (ns(l) &&
            (l = tp(
              l,
              n +
                (!l.key || (s && s.key === l.key)
                  ? ""
                  : ("" + l.key).replace(ca, "$&/") + "/") +
                e,
            )),
          t.push(l)),
      1
    );
  if (((s = 0), (r = r === "" ? "." : r + ":"), ua(e)))
    for (var a = 0; a < e.length; a++) {
      o = e[a];
      var u = r + jo(o, a);
      s += gl(o, t, n, u, l);
    }
  else if (((u = ep(e)), typeof u == "function"))
    for (e = u.call(e), a = 0; !(o = e.next()).done; )
      ((o = o.value), (u = r + jo(o, a++)), (s += gl(o, t, n, u, l)));
  else if (o === "object")
    throw (
      (t = String(e)),
      Error(
        "Objects are not valid as a React child (found: " +
          (t === "[object Object]"
            ? "object with keys {" + Object.keys(e).join(", ") + "}"
            : t) +
          "). If you meant to render a collection of children, use an array instead.",
      )
    );
  return s;
}
function Jr(e, t, n) {
  if (e == null) return e;
  var r = [],
    l = 0;
  return (
    gl(e, r, "", "", function (o) {
      return t.call(n, o, l++);
    }),
    r
  );
}
function rp(e) {
  if (e._status === -1) {
    var t = e._result;
    ((t = t()),
      t.then(
        function (n) {
          (e._status === 0 || e._status === -1) &&
            ((e._status = 1), (e._result = n));
        },
        function (n) {
          (e._status === 0 || e._status === -1) &&
            ((e._status = 2), (e._result = n));
        },
      ),
      e._status === -1 && ((e._status = 0), (e._result = t)));
  }
  if (e._status === 1) return e._result.default;
  throw e._result;
}
var Ee = { current: null },
  vl = { transition: null },
  lp = {
    ReactCurrentDispatcher: Ee,
    ReactCurrentBatchConfig: vl,
    ReactCurrentOwner: ts,
  };
function Zu() {
  throw Error("act(...) is not supported in production builds of React.");
}
H.Children = {
  map: Jr,
  forEach: function (e, t, n) {
    Jr(
      e,
      function () {
        t.apply(this, arguments);
      },
      n,
    );
  },
  count: function (e) {
    var t = 0;
    return (
      Jr(e, function () {
        t++;
      }),
      t
    );
  },
  toArray: function (e) {
    return (
      Jr(e, function (t) {
        return t;
      }) || []
    );
  },
  only: function (e) {
    if (!ns(e))
      throw Error(
        "React.Children.only expected to receive a single React element child.",
      );
    return e;
  },
};
H.Component = Hn;
H.Fragment = Vf;
H.Profiler = Qf;
H.PureComponent = qi;
H.StrictMode = Kf;
H.Suspense = Gf;
H.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = lp;
H.act = Zu;
H.cloneElement = function (e, t, n) {
  if (e == null)
    throw Error(
      "React.cloneElement(...): The argument must be a React element, but you passed " +
        e +
        ".",
    );
  var r = Ku({}, e.props),
    l = e.key,
    o = e.ref,
    s = e._owner;
  if (t != null) {
    if (
      (t.ref !== void 0 && ((o = t.ref), (s = ts.current)),
      t.key !== void 0 && (l = "" + t.key),
      e.type && e.type.defaultProps)
    )
      var a = e.type.defaultProps;
    for (u in t)
      Yu.call(t, u) &&
        !Xu.hasOwnProperty(u) &&
        (r[u] = t[u] === void 0 && a !== void 0 ? a[u] : t[u]);
  }
  var u = arguments.length - 2;
  if (u === 1) r.children = n;
  else if (1 < u) {
    a = Array(u);
    for (var c = 0; c < u; c++) a[c] = arguments[c + 2];
    r.children = a;
  }
  return { $$typeof: Ur, type: e.type, key: l, ref: o, props: r, _owner: s };
};
H.createContext = function (e) {
  return (
    (e = {
      $$typeof: Yf,
      _currentValue: e,
      _currentValue2: e,
      _threadCount: 0,
      Provider: null,
      Consumer: null,
      _defaultValue: null,
      _globalName: null,
    }),
    (e.Provider = { $$typeof: Jf, _context: e }),
    (e.Consumer = e)
  );
};
H.createElement = Gu;
H.createFactory = function (e) {
  var t = Gu.bind(null, e);
  return ((t.type = e), t);
};
H.createRef = function () {
  return { current: null };
};
H.forwardRef = function (e) {
  return { $$typeof: Xf, render: e };
};
H.isValidElement = ns;
H.lazy = function (e) {
  return { $$typeof: qf, _payload: { _status: -1, _result: e }, _init: rp };
};
H.memo = function (e, t) {
  return { $$typeof: Zf, type: e, compare: t === void 0 ? null : t };
};
H.startTransition = function (e) {
  var t = vl.transition;
  vl.transition = {};
  try {
    e();
  } finally {
    vl.transition = t;
  }
};
H.unstable_act = Zu;
H.useCallback = function (e, t) {
  return Ee.current.useCallback(e, t);
};
H.useContext = function (e) {
  return Ee.current.useContext(e);
};
H.useDebugValue = function () {};
H.useDeferredValue = function (e) {
  return Ee.current.useDeferredValue(e);
};
H.useEffect = function (e, t) {
  return Ee.current.useEffect(e, t);
};
H.useId = function () {
  return Ee.current.useId();
};
H.useImperativeHandle = function (e, t, n) {
  return Ee.current.useImperativeHandle(e, t, n);
};
H.useInsertionEffect = function (e, t) {
  return Ee.current.useInsertionEffect(e, t);
};
H.useLayoutEffect = function (e, t) {
  return Ee.current.useLayoutEffect(e, t);
};
H.useMemo = function (e, t) {
  return Ee.current.useMemo(e, t);
};
H.useReducer = function (e, t, n) {
  return Ee.current.useReducer(e, t, n);
};
H.useRef = function (e) {
  return Ee.current.useRef(e);
};
H.useState = function (e) {
  return Ee.current.useState(e);
};
H.useSyncExternalStore = function (e, t, n) {
  return Ee.current.useSyncExternalStore(e, t, n);
};
H.useTransition = function () {
  return Ee.current.useTransition();
};
H.version = "18.3.1";
Hu.exports = H;
var x = Hu.exports;
const ur = Wf(x),
  op = Uf({ __proto__: null, default: ur }, [x]);
/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ var ip = x,
  sp = Symbol.for("react.element"),
  ap = Symbol.for("react.fragment"),
  up = Object.prototype.hasOwnProperty,
  cp = ip.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,
  dp = { key: !0, ref: !0, __self: !0, __source: !0 };
function qu(e, t, n) {
  var r,
    l = {},
    o = null,
    s = null;
  (n !== void 0 && (o = "" + n),
    t.key !== void 0 && (o = "" + t.key),
    t.ref !== void 0 && (s = t.ref));
  for (r in t) up.call(t, r) && !dp.hasOwnProperty(r) && (l[r] = t[r]);
  if (e && e.defaultProps)
    for (r in ((t = e.defaultProps), t)) l[r] === void 0 && (l[r] = t[r]);
  return {
    $$typeof: sp,
    type: e,
    key: o,
    ref: s,
    props: l,
    _owner: cp.current,
  };
}
eo.Fragment = ap;
eo.jsx = qu;
eo.jsxs = qu;
Wu.exports = eo;
var i = Wu.exports,
  ec = { exports: {} },
  $e = {},
  tc = { exports: {} },
  nc = {};
/**
 * @license React
 * scheduler.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ (function (e) {
  function t(b, M) {
    var B = b.length;
    b.push(M);
    e: for (; 0 < B; ) {
      var V = (B - 1) >>> 1,
        U = b[V];
      if (0 < l(U, M)) ((b[V] = M), (b[B] = U), (B = V));
      else break e;
    }
  }
  function n(b) {
    return b.length === 0 ? null : b[0];
  }
  function r(b) {
    if (b.length === 0) return null;
    var M = b[0],
      B = b.pop();
    if (B !== M) {
      b[0] = B;
      e: for (var V = 0, U = b.length, dt = U >>> 1; V < dt; ) {
        var F = 2 * (V + 1) - 1,
          ve = b[F],
          xe = F + 1,
          bt = b[xe];
        if (0 > l(ve, B))
          xe < U && 0 > l(bt, ve)
            ? ((b[V] = bt), (b[xe] = B), (V = xe))
            : ((b[V] = ve), (b[F] = B), (V = F));
        else if (xe < U && 0 > l(bt, B)) ((b[V] = bt), (b[xe] = B), (V = xe));
        else break e;
      }
    }
    return M;
  }
  function l(b, M) {
    var B = b.sortIndex - M.sortIndex;
    return B !== 0 ? B : b.id - M.id;
  }
  if (typeof performance == "object" && typeof performance.now == "function") {
    var o = performance;
    e.unstable_now = function () {
      return o.now();
    };
  } else {
    var s = Date,
      a = s.now();
    e.unstable_now = function () {
      return s.now() - a;
    };
  }
  var u = [],
    c = [],
    m = 1,
    f = null,
    g = 3,
    S = !1,
    y = !1,
    k = !1,
    j = typeof setTimeout == "function" ? setTimeout : null,
    p = typeof clearTimeout == "function" ? clearTimeout : null,
    d = typeof setImmediate < "u" ? setImmediate : null;
  typeof navigator < "u" &&
    navigator.scheduling !== void 0 &&
    navigator.scheduling.isInputPending !== void 0 &&
    navigator.scheduling.isInputPending.bind(navigator.scheduling);
  function h(b) {
    for (var M = n(c); M !== null; ) {
      if (M.callback === null) r(c);
      else if (M.startTime <= b)
        (r(c), (M.sortIndex = M.expirationTime), t(u, M));
      else break;
      M = n(c);
    }
  }
  function w(b) {
    if (((k = !1), h(b), !y))
      if (n(u) !== null) ((y = !0), Q(_));
      else {
        var M = n(c);
        M !== null && T(w, M.startTime - b);
      }
  }
  function _(b, M) {
    ((y = !1), k && ((k = !1), p(v), (v = -1)), (S = !0));
    var B = g;
    try {
      for (
        h(M), f = n(u);
        f !== null && (!(f.expirationTime > M) || (b && !R()));
      ) {
        var V = f.callback;
        if (typeof V == "function") {
          ((f.callback = null), (g = f.priorityLevel));
          var U = V(f.expirationTime <= M);
          ((M = e.unstable_now()),
            typeof U == "function" ? (f.callback = U) : f === n(u) && r(u),
            h(M));
        } else r(u);
        f = n(u);
      }
      if (f !== null) var dt = !0;
      else {
        var F = n(c);
        (F !== null && T(w, F.startTime - M), (dt = !1));
      }
      return dt;
    } finally {
      ((f = null), (g = B), (S = !1));
    }
  }
  var E = !1,
    C = null,
    v = -1,
    N = 5,
    z = -1;
  function R() {
    return !(e.unstable_now() - z < N);
  }
  function W() {
    if (C !== null) {
      var b = e.unstable_now();
      z = b;
      var M = !0;
      try {
        M = C(!0, b);
      } finally {
        M ? P() : ((E = !1), (C = null));
      }
    } else E = !1;
  }
  var P;
  if (typeof d == "function")
    P = function () {
      d(W);
    };
  else if (typeof MessageChannel < "u") {
    var O = new MessageChannel(),
      $ = O.port2;
    ((O.port1.onmessage = W),
      (P = function () {
        $.postMessage(null);
      }));
  } else
    P = function () {
      j(W, 0);
    };
  function Q(b) {
    ((C = b), E || ((E = !0), P()));
  }
  function T(b, M) {
    v = j(function () {
      b(e.unstable_now());
    }, M);
  }
  ((e.unstable_IdlePriority = 5),
    (e.unstable_ImmediatePriority = 1),
    (e.unstable_LowPriority = 4),
    (e.unstable_NormalPriority = 3),
    (e.unstable_Profiling = null),
    (e.unstable_UserBlockingPriority = 2),
    (e.unstable_cancelCallback = function (b) {
      b.callback = null;
    }),
    (e.unstable_continueExecution = function () {
      y || S || ((y = !0), Q(_));
    }),
    (e.unstable_forceFrameRate = function (b) {
      0 > b || 125 < b
        ? console.error(
            "forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported",
          )
        : (N = 0 < b ? Math.floor(1e3 / b) : 5);
    }),
    (e.unstable_getCurrentPriorityLevel = function () {
      return g;
    }),
    (e.unstable_getFirstCallbackNode = function () {
      return n(u);
    }),
    (e.unstable_next = function (b) {
      switch (g) {
        case 1:
        case 2:
        case 3:
          var M = 3;
          break;
        default:
          M = g;
      }
      var B = g;
      g = M;
      try {
        return b();
      } finally {
        g = B;
      }
    }),
    (e.unstable_pauseExecution = function () {}),
    (e.unstable_requestPaint = function () {}),
    (e.unstable_runWithPriority = function (b, M) {
      switch (b) {
        case 1:
        case 2:
        case 3:
        case 4:
        case 5:
          break;
        default:
          b = 3;
      }
      var B = g;
      g = b;
      try {
        return M();
      } finally {
        g = B;
      }
    }),
    (e.unstable_scheduleCallback = function (b, M, B) {
      var V = e.unstable_now();
      switch (
        (typeof B == "object" && B !== null
          ? ((B = B.delay), (B = typeof B == "number" && 0 < B ? V + B : V))
          : (B = V),
        b)
      ) {
        case 1:
          var U = -1;
          break;
        case 2:
          U = 250;
          break;
        case 5:
          U = 1073741823;
          break;
        case 4:
          U = 1e4;
          break;
        default:
          U = 5e3;
      }
      return (
        (U = B + U),
        (b = {
          id: m++,
          callback: M,
          priorityLevel: b,
          startTime: B,
          expirationTime: U,
          sortIndex: -1,
        }),
        B > V
          ? ((b.sortIndex = B),
            t(c, b),
            n(u) === null &&
              b === n(c) &&
              (k ? (p(v), (v = -1)) : (k = !0), T(w, B - V)))
          : ((b.sortIndex = U), t(u, b), y || S || ((y = !0), Q(_))),
        b
      );
    }),
    (e.unstable_shouldYield = R),
    (e.unstable_wrapCallback = function (b) {
      var M = g;
      return function () {
        var B = g;
        g = M;
        try {
          return b.apply(this, arguments);
        } finally {
          g = B;
        }
      };
    }));
})(nc);
tc.exports = nc;
var fp = tc.exports;
/**
 * @license React
 * react-dom.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ var pp = x,
  Oe = fp;
function L(e) {
  for (
    var t = "https://reactjs.org/docs/error-decoder.html?invariant=" + e, n = 1;
    n < arguments.length;
    n++
  )
    t += "&args[]=" + encodeURIComponent(arguments[n]);
  return (
    "Minified React error #" +
    e +
    "; visit " +
    t +
    " for the full message or use the non-minified dev environment for full errors and additional helpful warnings."
  );
}
var rc = new Set(),
  jr = {};
function pn(e, t) {
  (In(e, t), In(e + "Capture", t));
}
function In(e, t) {
  for (jr[e] = t, e = 0; e < t.length; e++) rc.add(t[e]);
}
var xt = !(
    typeof window > "u" ||
    typeof window.document > "u" ||
    typeof window.document.createElement > "u"
  ),
  Zo = Object.prototype.hasOwnProperty,
  hp =
    /^[:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD][:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\-.0-9\u00B7\u0300-\u036F\u203F-\u2040]*$/,
  da = {},
  fa = {};
function mp(e) {
  return Zo.call(fa, e)
    ? !0
    : Zo.call(da, e)
      ? !1
      : hp.test(e)
        ? (fa[e] = !0)
        : ((da[e] = !0), !1);
}
function gp(e, t, n, r) {
  if (n !== null && n.type === 0) return !1;
  switch (typeof t) {
    case "function":
    case "symbol":
      return !0;
    case "boolean":
      return r
        ? !1
        : n !== null
          ? !n.acceptsBooleans
          : ((e = e.toLowerCase().slice(0, 5)), e !== "data-" && e !== "aria-");
    default:
      return !1;
  }
}
function vp(e, t, n, r) {
  if (t === null || typeof t > "u" || gp(e, t, n, r)) return !0;
  if (r) return !1;
  if (n !== null)
    switch (n.type) {
      case 3:
        return !t;
      case 4:
        return t === !1;
      case 5:
        return isNaN(t);
      case 6:
        return isNaN(t) || 1 > t;
    }
  return !1;
}
function be(e, t, n, r, l, o, s) {
  ((this.acceptsBooleans = t === 2 || t === 3 || t === 4),
    (this.attributeName = r),
    (this.attributeNamespace = l),
    (this.mustUseProperty = n),
    (this.propertyName = e),
    (this.type = t),
    (this.sanitizeURL = o),
    (this.removeEmptyString = s));
}
var ge = {};
"children dangerouslySetInnerHTML defaultValue defaultChecked innerHTML suppressContentEditableWarning suppressHydrationWarning style"
  .split(" ")
  .forEach(function (e) {
    ge[e] = new be(e, 0, !1, e, null, !1, !1);
  });
[
  ["acceptCharset", "accept-charset"],
  ["className", "class"],
  ["htmlFor", "for"],
  ["httpEquiv", "http-equiv"],
].forEach(function (e) {
  var t = e[0];
  ge[t] = new be(t, 1, !1, e[1], null, !1, !1);
});
["contentEditable", "draggable", "spellCheck", "value"].forEach(function (e) {
  ge[e] = new be(e, 2, !1, e.toLowerCase(), null, !1, !1);
});
[
  "autoReverse",
  "externalResourcesRequired",
  "focusable",
  "preserveAlpha",
].forEach(function (e) {
  ge[e] = new be(e, 2, !1, e, null, !1, !1);
});
"allowFullScreen async autoFocus autoPlay controls default defer disabled disablePictureInPicture disableRemotePlayback formNoValidate hidden loop noModule noValidate open playsInline readOnly required reversed scoped seamless itemScope"
  .split(" ")
  .forEach(function (e) {
    ge[e] = new be(e, 3, !1, e.toLowerCase(), null, !1, !1);
  });
["checked", "multiple", "muted", "selected"].forEach(function (e) {
  ge[e] = new be(e, 3, !0, e, null, !1, !1);
});
["capture", "download"].forEach(function (e) {
  ge[e] = new be(e, 4, !1, e, null, !1, !1);
});
["cols", "rows", "size", "span"].forEach(function (e) {
  ge[e] = new be(e, 6, !1, e, null, !1, !1);
});
["rowSpan", "start"].forEach(function (e) {
  ge[e] = new be(e, 5, !1, e.toLowerCase(), null, !1, !1);
});
var rs = /[\-:]([a-z])/g;
function ls(e) {
  return e[1].toUpperCase();
}
"accent-height alignment-baseline arabic-form baseline-shift cap-height clip-path clip-rule color-interpolation color-interpolation-filters color-profile color-rendering dominant-baseline enable-background fill-opacity fill-rule flood-color flood-opacity font-family font-size font-size-adjust font-stretch font-style font-variant font-weight glyph-name glyph-orientation-horizontal glyph-orientation-vertical horiz-adv-x horiz-origin-x image-rendering letter-spacing lighting-color marker-end marker-mid marker-start overline-position overline-thickness paint-order panose-1 pointer-events rendering-intent shape-rendering stop-color stop-opacity strikethrough-position strikethrough-thickness stroke-dasharray stroke-dashoffset stroke-linecap stroke-linejoin stroke-miterlimit stroke-opacity stroke-width text-anchor text-decoration text-rendering underline-position underline-thickness unicode-bidi unicode-range units-per-em v-alphabetic v-hanging v-ideographic v-mathematical vector-effect vert-adv-y vert-origin-x vert-origin-y word-spacing writing-mode xmlns:xlink x-height"
  .split(" ")
  .forEach(function (e) {
    var t = e.replace(rs, ls);
    ge[t] = new be(t, 1, !1, e, null, !1, !1);
  });
"xlink:actuate xlink:arcrole xlink:role xlink:show xlink:title xlink:type"
  .split(" ")
  .forEach(function (e) {
    var t = e.replace(rs, ls);
    ge[t] = new be(t, 1, !1, e, "http://www.w3.org/1999/xlink", !1, !1);
  });
["xml:base", "xml:lang", "xml:space"].forEach(function (e) {
  var t = e.replace(rs, ls);
  ge[t] = new be(t, 1, !1, e, "http://www.w3.org/XML/1998/namespace", !1, !1);
});
["tabIndex", "crossOrigin"].forEach(function (e) {
  ge[e] = new be(e, 1, !1, e.toLowerCase(), null, !1, !1);
});
ge.xlinkHref = new be(
  "xlinkHref",
  1,
  !1,
  "xlink:href",
  "http://www.w3.org/1999/xlink",
  !0,
  !1,
);
["src", "href", "action", "formAction"].forEach(function (e) {
  ge[e] = new be(e, 1, !1, e.toLowerCase(), null, !0, !0);
});
function os(e, t, n, r) {
  var l = ge.hasOwnProperty(t) ? ge[t] : null;
  (l !== null
    ? l.type !== 0
    : r ||
      !(2 < t.length) ||
      (t[0] !== "o" && t[0] !== "O") ||
      (t[1] !== "n" && t[1] !== "N")) &&
    (vp(t, n, l, r) && (n = null),
    r || l === null
      ? mp(t) && (n === null ? e.removeAttribute(t) : e.setAttribute(t, "" + n))
      : l.mustUseProperty
        ? (e[l.propertyName] = n === null ? (l.type === 3 ? !1 : "") : n)
        : ((t = l.attributeName),
          (r = l.attributeNamespace),
          n === null
            ? e.removeAttribute(t)
            : ((l = l.type),
              (n = l === 3 || (l === 4 && n === !0) ? "" : "" + n),
              r ? e.setAttributeNS(r, t, n) : e.setAttribute(t, n))));
}
var kt = pp.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED,
  Yr = Symbol.for("react.element"),
  vn = Symbol.for("react.portal"),
  xn = Symbol.for("react.fragment"),
  is = Symbol.for("react.strict_mode"),
  qo = Symbol.for("react.profiler"),
  lc = Symbol.for("react.provider"),
  oc = Symbol.for("react.context"),
  ss = Symbol.for("react.forward_ref"),
  ei = Symbol.for("react.suspense"),
  ti = Symbol.for("react.suspense_list"),
  as = Symbol.for("react.memo"),
  Lt = Symbol.for("react.lazy"),
  ic = Symbol.for("react.offscreen"),
  pa = Symbol.iterator;
function Xn(e) {
  return e === null || typeof e != "object"
    ? null
    : ((e = (pa && e[pa]) || e["@@iterator"]),
      typeof e == "function" ? e : null);
}
var oe = Object.assign,
  _o;
function cr(e) {
  if (_o === void 0)
    try {
      throw Error();
    } catch (n) {
      var t = n.stack.trim().match(/\n( *(at )?)/);
      _o = (t && t[1]) || "";
    }
  return (
    `
` +
    _o +
    e
  );
}
var Co = !1;
function Eo(e, t) {
  if (!e || Co) return "";
  Co = !0;
  var n = Error.prepareStackTrace;
  Error.prepareStackTrace = void 0;
  try {
    if (t)
      if (
        ((t = function () {
          throw Error();
        }),
        Object.defineProperty(t.prototype, "props", {
          set: function () {
            throw Error();
          },
        }),
        typeof Reflect == "object" && Reflect.construct)
      ) {
        try {
          Reflect.construct(t, []);
        } catch (c) {
          var r = c;
        }
        Reflect.construct(e, [], t);
      } else {
        try {
          t.call();
        } catch (c) {
          r = c;
        }
        e.call(t.prototype);
      }
    else {
      try {
        throw Error();
      } catch (c) {
        r = c;
      }
      e();
    }
  } catch (c) {
    if (c && r && typeof c.stack == "string") {
      for (
        var l = c.stack.split(`
`),
          o = r.stack.split(`
`),
          s = l.length - 1,
          a = o.length - 1;
        1 <= s && 0 <= a && l[s] !== o[a];
      )
        a--;
      for (; 1 <= s && 0 <= a; s--, a--)
        if (l[s] !== o[a]) {
          if (s !== 1 || a !== 1)
            do
              if ((s--, a--, 0 > a || l[s] !== o[a])) {
                var u =
                  `
` + l[s].replace(" at new ", " at ");
                return (
                  e.displayName &&
                    u.includes("<anonymous>") &&
                    (u = u.replace("<anonymous>", e.displayName)),
                  u
                );
              }
            while (1 <= s && 0 <= a);
          break;
        }
    }
  } finally {
    ((Co = !1), (Error.prepareStackTrace = n));
  }
  return (e = e ? e.displayName || e.name : "") ? cr(e) : "";
}
function xp(e) {
  switch (e.tag) {
    case 5:
      return cr(e.type);
    case 16:
      return cr("Lazy");
    case 13:
      return cr("Suspense");
    case 19:
      return cr("SuspenseList");
    case 0:
    case 2:
    case 15:
      return ((e = Eo(e.type, !1)), e);
    case 11:
      return ((e = Eo(e.type.render, !1)), e);
    case 1:
      return ((e = Eo(e.type, !0)), e);
    default:
      return "";
  }
}
function ni(e) {
  if (e == null) return null;
  if (typeof e == "function") return e.displayName || e.name || null;
  if (typeof e == "string") return e;
  switch (e) {
    case xn:
      return "Fragment";
    case vn:
      return "Portal";
    case qo:
      return "Profiler";
    case is:
      return "StrictMode";
    case ei:
      return "Suspense";
    case ti:
      return "SuspenseList";
  }
  if (typeof e == "object")
    switch (e.$$typeof) {
      case oc:
        return (e.displayName || "Context") + ".Consumer";
      case lc:
        return (e._context.displayName || "Context") + ".Provider";
      case ss:
        var t = e.render;
        return (
          (e = e.displayName),
          e ||
            ((e = t.displayName || t.name || ""),
            (e = e !== "" ? "ForwardRef(" + e + ")" : "ForwardRef")),
          e
        );
      case as:
        return (
          (t = e.displayName || null),
          t !== null ? t : ni(e.type) || "Memo"
        );
      case Lt:
        ((t = e._payload), (e = e._init));
        try {
          return ni(e(t));
        } catch {}
    }
  return null;
}
function yp(e) {
  var t = e.type;
  switch (e.tag) {
    case 24:
      return "Cache";
    case 9:
      return (t.displayName || "Context") + ".Consumer";
    case 10:
      return (t._context.displayName || "Context") + ".Provider";
    case 18:
      return "DehydratedFragment";
    case 11:
      return (
        (e = t.render),
        (e = e.displayName || e.name || ""),
        t.displayName || (e !== "" ? "ForwardRef(" + e + ")" : "ForwardRef")
      );
    case 7:
      return "Fragment";
    case 5:
      return t;
    case 4:
      return "Portal";
    case 3:
      return "Root";
    case 6:
      return "Text";
    case 16:
      return ni(t);
    case 8:
      return t === is ? "StrictMode" : "Mode";
    case 22:
      return "Offscreen";
    case 12:
      return "Profiler";
    case 21:
      return "Scope";
    case 13:
      return "Suspense";
    case 19:
      return "SuspenseList";
    case 25:
      return "TracingMarker";
    case 1:
    case 0:
    case 17:
    case 2:
    case 14:
    case 15:
      if (typeof t == "function") return t.displayName || t.name || null;
      if (typeof t == "string") return t;
  }
  return null;
}
function Jt(e) {
  switch (typeof e) {
    case "boolean":
    case "number":
    case "string":
    case "undefined":
      return e;
    case "object":
      return e;
    default:
      return "";
  }
}
function sc(e) {
  var t = e.type;
  return (
    (e = e.nodeName) &&
    e.toLowerCase() === "input" &&
    (t === "checkbox" || t === "radio")
  );
}
function Sp(e) {
  var t = sc(e) ? "checked" : "value",
    n = Object.getOwnPropertyDescriptor(e.constructor.prototype, t),
    r = "" + e[t];
  if (
    !e.hasOwnProperty(t) &&
    typeof n < "u" &&
    typeof n.get == "function" &&
    typeof n.set == "function"
  ) {
    var l = n.get,
      o = n.set;
    return (
      Object.defineProperty(e, t, {
        configurable: !0,
        get: function () {
          return l.call(this);
        },
        set: function (s) {
          ((r = "" + s), o.call(this, s));
        },
      }),
      Object.defineProperty(e, t, { enumerable: n.enumerable }),
      {
        getValue: function () {
          return r;
        },
        setValue: function (s) {
          r = "" + s;
        },
        stopTracking: function () {
          ((e._valueTracker = null), delete e[t]);
        },
      }
    );
  }
}
function Xr(e) {
  e._valueTracker || (e._valueTracker = Sp(e));
}
function ac(e) {
  if (!e) return !1;
  var t = e._valueTracker;
  if (!t) return !0;
  var n = t.getValue(),
    r = "";
  return (
    e && (r = sc(e) ? (e.checked ? "true" : "false") : e.value),
    (e = r),
    e !== n ? (t.setValue(e), !0) : !1
  );
}
function zl(e) {
  if (((e = e || (typeof document < "u" ? document : void 0)), typeof e > "u"))
    return null;
  try {
    return e.activeElement || e.body;
  } catch {
    return e.body;
  }
}
function ri(e, t) {
  var n = t.checked;
  return oe({}, t, {
    defaultChecked: void 0,
    defaultValue: void 0,
    value: void 0,
    checked: n ?? e._wrapperState.initialChecked,
  });
}
function ha(e, t) {
  var n = t.defaultValue == null ? "" : t.defaultValue,
    r = t.checked != null ? t.checked : t.defaultChecked;
  ((n = Jt(t.value != null ? t.value : n)),
    (e._wrapperState = {
      initialChecked: r,
      initialValue: n,
      controlled:
        t.type === "checkbox" || t.type === "radio"
          ? t.checked != null
          : t.value != null,
    }));
}
function uc(e, t) {
  ((t = t.checked), t != null && os(e, "checked", t, !1));
}
function li(e, t) {
  uc(e, t);
  var n = Jt(t.value),
    r = t.type;
  if (n != null)
    r === "number"
      ? ((n === 0 && e.value === "") || e.value != n) && (e.value = "" + n)
      : e.value !== "" + n && (e.value = "" + n);
  else if (r === "submit" || r === "reset") {
    e.removeAttribute("value");
    return;
  }
  (t.hasOwnProperty("value")
    ? oi(e, t.type, n)
    : t.hasOwnProperty("defaultValue") && oi(e, t.type, Jt(t.defaultValue)),
    t.checked == null &&
      t.defaultChecked != null &&
      (e.defaultChecked = !!t.defaultChecked));
}
function ma(e, t, n) {
  if (t.hasOwnProperty("value") || t.hasOwnProperty("defaultValue")) {
    var r = t.type;
    if (
      !(
        (r !== "submit" && r !== "reset") ||
        (t.value !== void 0 && t.value !== null)
      )
    )
      return;
    ((t = "" + e._wrapperState.initialValue),
      n || t === e.value || (e.value = t),
      (e.defaultValue = t));
  }
  ((n = e.name),
    n !== "" && (e.name = ""),
    (e.defaultChecked = !!e._wrapperState.initialChecked),
    n !== "" && (e.name = n));
}
function oi(e, t, n) {
  (t !== "number" || zl(e.ownerDocument) !== e) &&
    (n == null
      ? (e.defaultValue = "" + e._wrapperState.initialValue)
      : e.defaultValue !== "" + n && (e.defaultValue = "" + n));
}
var dr = Array.isArray;
function Pn(e, t, n, r) {
  if (((e = e.options), t)) {
    t = {};
    for (var l = 0; l < n.length; l++) t["$" + n[l]] = !0;
    for (n = 0; n < e.length; n++)
      ((l = t.hasOwnProperty("$" + e[n].value)),
        e[n].selected !== l && (e[n].selected = l),
        l && r && (e[n].defaultSelected = !0));
  } else {
    for (n = "" + Jt(n), t = null, l = 0; l < e.length; l++) {
      if (e[l].value === n) {
        ((e[l].selected = !0), r && (e[l].defaultSelected = !0));
        return;
      }
      t !== null || e[l].disabled || (t = e[l]);
    }
    t !== null && (t.selected = !0);
  }
}
function ii(e, t) {
  if (t.dangerouslySetInnerHTML != null) throw Error(L(91));
  return oe({}, t, {
    value: void 0,
    defaultValue: void 0,
    children: "" + e._wrapperState.initialValue,
  });
}
function ga(e, t) {
  var n = t.value;
  if (n == null) {
    if (((n = t.children), (t = t.defaultValue), n != null)) {
      if (t != null) throw Error(L(92));
      if (dr(n)) {
        if (1 < n.length) throw Error(L(93));
        n = n[0];
      }
      t = n;
    }
    (t == null && (t = ""), (n = t));
  }
  e._wrapperState = { initialValue: Jt(n) };
}
function cc(e, t) {
  var n = Jt(t.value),
    r = Jt(t.defaultValue);
  (n != null &&
    ((n = "" + n),
    n !== e.value && (e.value = n),
    t.defaultValue == null && e.defaultValue !== n && (e.defaultValue = n)),
    r != null && (e.defaultValue = "" + r));
}
function va(e) {
  var t = e.textContent;
  t === e._wrapperState.initialValue && t !== "" && t !== null && (e.value = t);
}
function dc(e) {
  switch (e) {
    case "svg":
      return "http://www.w3.org/2000/svg";
    case "math":
      return "http://www.w3.org/1998/Math/MathML";
    default:
      return "http://www.w3.org/1999/xhtml";
  }
}
function si(e, t) {
  return e == null || e === "http://www.w3.org/1999/xhtml"
    ? dc(t)
    : e === "http://www.w3.org/2000/svg" && t === "foreignObject"
      ? "http://www.w3.org/1999/xhtml"
      : e;
}
var Gr,
  fc = (function (e) {
    return typeof MSApp < "u" && MSApp.execUnsafeLocalFunction
      ? function (t, n, r, l) {
          MSApp.execUnsafeLocalFunction(function () {
            return e(t, n, r, l);
          });
        }
      : e;
  })(function (e, t) {
    if (e.namespaceURI !== "http://www.w3.org/2000/svg" || "innerHTML" in e)
      e.innerHTML = t;
    else {
      for (
        Gr = Gr || document.createElement("div"),
          Gr.innerHTML = "<svg>" + t.valueOf().toString() + "</svg>",
          t = Gr.firstChild;
        e.firstChild;
      )
        e.removeChild(e.firstChild);
      for (; t.firstChild; ) e.appendChild(t.firstChild);
    }
  });
function _r(e, t) {
  if (t) {
    var n = e.firstChild;
    if (n && n === e.lastChild && n.nodeType === 3) {
      n.nodeValue = t;
      return;
    }
  }
  e.textContent = t;
}
var hr = {
    animationIterationCount: !0,
    aspectRatio: !0,
    borderImageOutset: !0,
    borderImageSlice: !0,
    borderImageWidth: !0,
    boxFlex: !0,
    boxFlexGroup: !0,
    boxOrdinalGroup: !0,
    columnCount: !0,
    columns: !0,
    flex: !0,
    flexGrow: !0,
    flexPositive: !0,
    flexShrink: !0,
    flexNegative: !0,
    flexOrder: !0,
    gridArea: !0,
    gridRow: !0,
    gridRowEnd: !0,
    gridRowSpan: !0,
    gridRowStart: !0,
    gridColumn: !0,
    gridColumnEnd: !0,
    gridColumnSpan: !0,
    gridColumnStart: !0,
    fontWeight: !0,
    lineClamp: !0,
    lineHeight: !0,
    opacity: !0,
    order: !0,
    orphans: !0,
    tabSize: !0,
    widows: !0,
    zIndex: !0,
    zoom: !0,
    fillOpacity: !0,
    floodOpacity: !0,
    stopOpacity: !0,
    strokeDasharray: !0,
    strokeDashoffset: !0,
    strokeMiterlimit: !0,
    strokeOpacity: !0,
    strokeWidth: !0,
  },
  wp = ["Webkit", "ms", "Moz", "O"];
Object.keys(hr).forEach(function (e) {
  wp.forEach(function (t) {
    ((t = t + e.charAt(0).toUpperCase() + e.substring(1)), (hr[t] = hr[e]));
  });
});
function pc(e, t, n) {
  return t == null || typeof t == "boolean" || t === ""
    ? ""
    : n || typeof t != "number" || t === 0 || (hr.hasOwnProperty(e) && hr[e])
      ? ("" + t).trim()
      : t + "px";
}
function hc(e, t) {
  e = e.style;
  for (var n in t)
    if (t.hasOwnProperty(n)) {
      var r = n.indexOf("--") === 0,
        l = pc(n, t[n], r);
      (n === "float" && (n = "cssFloat"), r ? e.setProperty(n, l) : (e[n] = l));
    }
}
var kp = oe(
  { menuitem: !0 },
  {
    area: !0,
    base: !0,
    br: !0,
    col: !0,
    embed: !0,
    hr: !0,
    img: !0,
    input: !0,
    keygen: !0,
    link: !0,
    meta: !0,
    param: !0,
    source: !0,
    track: !0,
    wbr: !0,
  },
);
function ai(e, t) {
  if (t) {
    if (kp[e] && (t.children != null || t.dangerouslySetInnerHTML != null))
      throw Error(L(137, e));
    if (t.dangerouslySetInnerHTML != null) {
      if (t.children != null) throw Error(L(60));
      if (
        typeof t.dangerouslySetInnerHTML != "object" ||
        !("__html" in t.dangerouslySetInnerHTML)
      )
        throw Error(L(61));
    }
    if (t.style != null && typeof t.style != "object") throw Error(L(62));
  }
}
function ui(e, t) {
  if (e.indexOf("-") === -1) return typeof t.is == "string";
  switch (e) {
    case "annotation-xml":
    case "color-profile":
    case "font-face":
    case "font-face-src":
    case "font-face-uri":
    case "font-face-format":
    case "font-face-name":
    case "missing-glyph":
      return !1;
    default:
      return !0;
  }
}
var ci = null;
function us(e) {
  return (
    (e = e.target || e.srcElement || window),
    e.correspondingUseElement && (e = e.correspondingUseElement),
    e.nodeType === 3 ? e.parentNode : e
  );
}
var di = null,
  Nn = null,
  Rn = null;
function xa(e) {
  if ((e = Vr(e))) {
    if (typeof di != "function") throw Error(L(280));
    var t = e.stateNode;
    t && ((t = oo(t)), di(e.stateNode, e.type, t));
  }
}
function mc(e) {
  Nn ? (Rn ? Rn.push(e) : (Rn = [e])) : (Nn = e);
}
function gc() {
  if (Nn) {
    var e = Nn,
      t = Rn;
    if (((Rn = Nn = null), xa(e), t)) for (e = 0; e < t.length; e++) xa(t[e]);
  }
}
function vc(e, t) {
  return e(t);
}
function xc() {}
var bo = !1;
function yc(e, t, n) {
  if (bo) return e(t, n);
  bo = !0;
  try {
    return vc(e, t, n);
  } finally {
    ((bo = !1), (Nn !== null || Rn !== null) && (xc(), gc()));
  }
}
function Cr(e, t) {
  var n = e.stateNode;
  if (n === null) return null;
  var r = oo(n);
  if (r === null) return null;
  n = r[t];
  e: switch (t) {
    case "onClick":
    case "onClickCapture":
    case "onDoubleClick":
    case "onDoubleClickCapture":
    case "onMouseDown":
    case "onMouseDownCapture":
    case "onMouseMove":
    case "onMouseMoveCapture":
    case "onMouseUp":
    case "onMouseUpCapture":
    case "onMouseEnter":
      ((r = !r.disabled) ||
        ((e = e.type),
        (r = !(
          e === "button" ||
          e === "input" ||
          e === "select" ||
          e === "textarea"
        ))),
        (e = !r));
      break e;
    default:
      e = !1;
  }
  if (e) return null;
  if (n && typeof n != "function") throw Error(L(231, t, typeof n));
  return n;
}
var fi = !1;
if (xt)
  try {
    var Gn = {};
    (Object.defineProperty(Gn, "passive", {
      get: function () {
        fi = !0;
      },
    }),
      window.addEventListener("test", Gn, Gn),
      window.removeEventListener("test", Gn, Gn));
  } catch {
    fi = !1;
  }
function jp(e, t, n, r, l, o, s, a, u) {
  var c = Array.prototype.slice.call(arguments, 3);
  try {
    t.apply(n, c);
  } catch (m) {
    this.onError(m);
  }
}
var mr = !1,
  Pl = null,
  Nl = !1,
  pi = null,
  _p = {
    onError: function (e) {
      ((mr = !0), (Pl = e));
    },
  };
function Cp(e, t, n, r, l, o, s, a, u) {
  ((mr = !1), (Pl = null), jp.apply(_p, arguments));
}
function Ep(e, t, n, r, l, o, s, a, u) {
  if ((Cp.apply(this, arguments), mr)) {
    if (mr) {
      var c = Pl;
      ((mr = !1), (Pl = null));
    } else throw Error(L(198));
    Nl || ((Nl = !0), (pi = c));
  }
}
function hn(e) {
  var t = e,
    n = e;
  if (e.alternate) for (; t.return; ) t = t.return;
  else {
    e = t;
    do ((t = e), t.flags & 4098 && (n = t.return), (e = t.return));
    while (e);
  }
  return t.tag === 3 ? n : null;
}
function Sc(e) {
  if (e.tag === 13) {
    var t = e.memoizedState;
    if (
      (t === null && ((e = e.alternate), e !== null && (t = e.memoizedState)),
      t !== null)
    )
      return t.dehydrated;
  }
  return null;
}
function ya(e) {
  if (hn(e) !== e) throw Error(L(188));
}
function bp(e) {
  var t = e.alternate;
  if (!t) {
    if (((t = hn(e)), t === null)) throw Error(L(188));
    return t !== e ? null : e;
  }
  for (var n = e, r = t; ; ) {
    var l = n.return;
    if (l === null) break;
    var o = l.alternate;
    if (o === null) {
      if (((r = l.return), r !== null)) {
        n = r;
        continue;
      }
      break;
    }
    if (l.child === o.child) {
      for (o = l.child; o; ) {
        if (o === n) return (ya(l), e);
        if (o === r) return (ya(l), t);
        o = o.sibling;
      }
      throw Error(L(188));
    }
    if (n.return !== r.return) ((n = l), (r = o));
    else {
      for (var s = !1, a = l.child; a; ) {
        if (a === n) {
          ((s = !0), (n = l), (r = o));
          break;
        }
        if (a === r) {
          ((s = !0), (r = l), (n = o));
          break;
        }
        a = a.sibling;
      }
      if (!s) {
        for (a = o.child; a; ) {
          if (a === n) {
            ((s = !0), (n = o), (r = l));
            break;
          }
          if (a === r) {
            ((s = !0), (r = o), (n = l));
            break;
          }
          a = a.sibling;
        }
        if (!s) throw Error(L(189));
      }
    }
    if (n.alternate !== r) throw Error(L(190));
  }
  if (n.tag !== 3) throw Error(L(188));
  return n.stateNode.current === n ? e : t;
}
function wc(e) {
  return ((e = bp(e)), e !== null ? kc(e) : null);
}
function kc(e) {
  if (e.tag === 5 || e.tag === 6) return e;
  for (e = e.child; e !== null; ) {
    var t = kc(e);
    if (t !== null) return t;
    e = e.sibling;
  }
  return null;
}
var jc = Oe.unstable_scheduleCallback,
  Sa = Oe.unstable_cancelCallback,
  zp = Oe.unstable_shouldYield,
  Pp = Oe.unstable_requestPaint,
  ae = Oe.unstable_now,
  Np = Oe.unstable_getCurrentPriorityLevel,
  cs = Oe.unstable_ImmediatePriority,
  _c = Oe.unstable_UserBlockingPriority,
  Rl = Oe.unstable_NormalPriority,
  Rp = Oe.unstable_LowPriority,
  Cc = Oe.unstable_IdlePriority,
  to = null,
  at = null;
function Lp(e) {
  if (at && typeof at.onCommitFiberRoot == "function")
    try {
      at.onCommitFiberRoot(to, e, void 0, (e.current.flags & 128) === 128);
    } catch {}
}
var et = Math.clz32 ? Math.clz32 : Ip,
  Tp = Math.log,
  Mp = Math.LN2;
function Ip(e) {
  return ((e >>>= 0), e === 0 ? 32 : (31 - ((Tp(e) / Mp) | 0)) | 0);
}
var Zr = 64,
  qr = 4194304;
function fr(e) {
  switch (e & -e) {
    case 1:
      return 1;
    case 2:
      return 2;
    case 4:
      return 4;
    case 8:
      return 8;
    case 16:
      return 16;
    case 32:
      return 32;
    case 64:
    case 128:
    case 256:
    case 512:
    case 1024:
    case 2048:
    case 4096:
    case 8192:
    case 16384:
    case 32768:
    case 65536:
    case 131072:
    case 262144:
    case 524288:
    case 1048576:
    case 2097152:
      return e & 4194240;
    case 4194304:
    case 8388608:
    case 16777216:
    case 33554432:
    case 67108864:
      return e & 130023424;
    case 134217728:
      return 134217728;
    case 268435456:
      return 268435456;
    case 536870912:
      return 536870912;
    case 1073741824:
      return 1073741824;
    default:
      return e;
  }
}
function Ll(e, t) {
  var n = e.pendingLanes;
  if (n === 0) return 0;
  var r = 0,
    l = e.suspendedLanes,
    o = e.pingedLanes,
    s = n & 268435455;
  if (s !== 0) {
    var a = s & ~l;
    a !== 0 ? (r = fr(a)) : ((o &= s), o !== 0 && (r = fr(o)));
  } else ((s = n & ~l), s !== 0 ? (r = fr(s)) : o !== 0 && (r = fr(o)));
  if (r === 0) return 0;
  if (
    t !== 0 &&
    t !== r &&
    !(t & l) &&
    ((l = r & -r), (o = t & -t), l >= o || (l === 16 && (o & 4194240) !== 0))
  )
    return t;
  if ((r & 4 && (r |= n & 16), (t = e.entangledLanes), t !== 0))
    for (e = e.entanglements, t &= r; 0 < t; )
      ((n = 31 - et(t)), (l = 1 << n), (r |= e[n]), (t &= ~l));
  return r;
}
function Fp(e, t) {
  switch (e) {
    case 1:
    case 2:
    case 4:
      return t + 250;
    case 8:
    case 16:
    case 32:
    case 64:
    case 128:
    case 256:
    case 512:
    case 1024:
    case 2048:
    case 4096:
    case 8192:
    case 16384:
    case 32768:
    case 65536:
    case 131072:
    case 262144:
    case 524288:
    case 1048576:
    case 2097152:
      return t + 5e3;
    case 4194304:
    case 8388608:
    case 16777216:
    case 33554432:
    case 67108864:
      return -1;
    case 134217728:
    case 268435456:
    case 536870912:
    case 1073741824:
      return -1;
    default:
      return -1;
  }
}
function Dp(e, t) {
  for (
    var n = e.suspendedLanes,
      r = e.pingedLanes,
      l = e.expirationTimes,
      o = e.pendingLanes;
    0 < o;
  ) {
    var s = 31 - et(o),
      a = 1 << s,
      u = l[s];
    (u === -1
      ? (!(a & n) || a & r) && (l[s] = Fp(a, t))
      : u <= t && (e.expiredLanes |= a),
      (o &= ~a));
  }
}
function hi(e) {
  return (
    (e = e.pendingLanes & -1073741825),
    e !== 0 ? e : e & 1073741824 ? 1073741824 : 0
  );
}
function Ec() {
  var e = Zr;
  return ((Zr <<= 1), !(Zr & 4194240) && (Zr = 64), e);
}
function zo(e) {
  for (var t = [], n = 0; 31 > n; n++) t.push(e);
  return t;
}
function Wr(e, t, n) {
  ((e.pendingLanes |= t),
    t !== 536870912 && ((e.suspendedLanes = 0), (e.pingedLanes = 0)),
    (e = e.eventTimes),
    (t = 31 - et(t)),
    (e[t] = n));
}
function Bp(e, t) {
  var n = e.pendingLanes & ~t;
  ((e.pendingLanes = t),
    (e.suspendedLanes = 0),
    (e.pingedLanes = 0),
    (e.expiredLanes &= t),
    (e.mutableReadLanes &= t),
    (e.entangledLanes &= t),
    (t = e.entanglements));
  var r = e.eventTimes;
  for (e = e.expirationTimes; 0 < n; ) {
    var l = 31 - et(n),
      o = 1 << l;
    ((t[l] = 0), (r[l] = -1), (e[l] = -1), (n &= ~o));
  }
}
function ds(e, t) {
  var n = (e.entangledLanes |= t);
  for (e = e.entanglements; n; ) {
    var r = 31 - et(n),
      l = 1 << r;
    ((l & t) | (e[r] & t) && (e[r] |= t), (n &= ~l));
  }
}
var J = 0;
function bc(e) {
  return (
    (e &= -e),
    1 < e ? (4 < e ? (e & 268435455 ? 16 : 536870912) : 4) : 1
  );
}
var zc,
  fs,
  Pc,
  Nc,
  Rc,
  mi = !1,
  el = [],
  Ot = null,
  $t = null,
  At = null,
  Er = new Map(),
  br = new Map(),
  Mt = [],
  Op =
    "mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset submit".split(
      " ",
    );
function wa(e, t) {
  switch (e) {
    case "focusin":
    case "focusout":
      Ot = null;
      break;
    case "dragenter":
    case "dragleave":
      $t = null;
      break;
    case "mouseover":
    case "mouseout":
      At = null;
      break;
    case "pointerover":
    case "pointerout":
      Er.delete(t.pointerId);
      break;
    case "gotpointercapture":
    case "lostpointercapture":
      br.delete(t.pointerId);
  }
}
function Zn(e, t, n, r, l, o) {
  return e === null || e.nativeEvent !== o
    ? ((e = {
        blockedOn: t,
        domEventName: n,
        eventSystemFlags: r,
        nativeEvent: o,
        targetContainers: [l],
      }),
      t !== null && ((t = Vr(t)), t !== null && fs(t)),
      e)
    : ((e.eventSystemFlags |= r),
      (t = e.targetContainers),
      l !== null && t.indexOf(l) === -1 && t.push(l),
      e);
}
function $p(e, t, n, r, l) {
  switch (t) {
    case "focusin":
      return ((Ot = Zn(Ot, e, t, n, r, l)), !0);
    case "dragenter":
      return (($t = Zn($t, e, t, n, r, l)), !0);
    case "mouseover":
      return ((At = Zn(At, e, t, n, r, l)), !0);
    case "pointerover":
      var o = l.pointerId;
      return (Er.set(o, Zn(Er.get(o) || null, e, t, n, r, l)), !0);
    case "gotpointercapture":
      return (
        (o = l.pointerId),
        br.set(o, Zn(br.get(o) || null, e, t, n, r, l)),
        !0
      );
  }
  return !1;
}
function Lc(e) {
  var t = tn(e.target);
  if (t !== null) {
    var n = hn(t);
    if (n !== null) {
      if (((t = n.tag), t === 13)) {
        if (((t = Sc(n)), t !== null)) {
          ((e.blockedOn = t),
            Rc(e.priority, function () {
              Pc(n);
            }));
          return;
        }
      } else if (t === 3 && n.stateNode.current.memoizedState.isDehydrated) {
        e.blockedOn = n.tag === 3 ? n.stateNode.containerInfo : null;
        return;
      }
    }
  }
  e.blockedOn = null;
}
function xl(e) {
  if (e.blockedOn !== null) return !1;
  for (var t = e.targetContainers; 0 < t.length; ) {
    var n = gi(e.domEventName, e.eventSystemFlags, t[0], e.nativeEvent);
    if (n === null) {
      n = e.nativeEvent;
      var r = new n.constructor(n.type, n);
      ((ci = r), n.target.dispatchEvent(r), (ci = null));
    } else return ((t = Vr(n)), t !== null && fs(t), (e.blockedOn = n), !1);
    t.shift();
  }
  return !0;
}
function ka(e, t, n) {
  xl(e) && n.delete(t);
}
function Ap() {
  ((mi = !1),
    Ot !== null && xl(Ot) && (Ot = null),
    $t !== null && xl($t) && ($t = null),
    At !== null && xl(At) && (At = null),
    Er.forEach(ka),
    br.forEach(ka));
}
function qn(e, t) {
  e.blockedOn === t &&
    ((e.blockedOn = null),
    mi ||
      ((mi = !0),
      Oe.unstable_scheduleCallback(Oe.unstable_NormalPriority, Ap)));
}
function zr(e) {
  function t(l) {
    return qn(l, e);
  }
  if (0 < el.length) {
    qn(el[0], e);
    for (var n = 1; n < el.length; n++) {
      var r = el[n];
      r.blockedOn === e && (r.blockedOn = null);
    }
  }
  for (
    Ot !== null && qn(Ot, e),
      $t !== null && qn($t, e),
      At !== null && qn(At, e),
      Er.forEach(t),
      br.forEach(t),
      n = 0;
    n < Mt.length;
    n++
  )
    ((r = Mt[n]), r.blockedOn === e && (r.blockedOn = null));
  for (; 0 < Mt.length && ((n = Mt[0]), n.blockedOn === null); )
    (Lc(n), n.blockedOn === null && Mt.shift());
}
var Ln = kt.ReactCurrentBatchConfig,
  Tl = !0;
function Up(e, t, n, r) {
  var l = J,
    o = Ln.transition;
  Ln.transition = null;
  try {
    ((J = 1), ps(e, t, n, r));
  } finally {
    ((J = l), (Ln.transition = o));
  }
}
function Wp(e, t, n, r) {
  var l = J,
    o = Ln.transition;
  Ln.transition = null;
  try {
    ((J = 4), ps(e, t, n, r));
  } finally {
    ((J = l), (Ln.transition = o));
  }
}
function ps(e, t, n, r) {
  if (Tl) {
    var l = gi(e, t, n, r);
    if (l === null) (Bo(e, t, r, Ml, n), wa(e, r));
    else if ($p(l, e, t, n, r)) r.stopPropagation();
    else if ((wa(e, r), t & 4 && -1 < Op.indexOf(e))) {
      for (; l !== null; ) {
        var o = Vr(l);
        if (
          (o !== null && zc(o),
          (o = gi(e, t, n, r)),
          o === null && Bo(e, t, r, Ml, n),
          o === l)
        )
          break;
        l = o;
      }
      l !== null && r.stopPropagation();
    } else Bo(e, t, r, null, n);
  }
}
var Ml = null;
function gi(e, t, n, r) {
  if (((Ml = null), (e = us(r)), (e = tn(e)), e !== null))
    if (((t = hn(e)), t === null)) e = null;
    else if (((n = t.tag), n === 13)) {
      if (((e = Sc(t)), e !== null)) return e;
      e = null;
    } else if (n === 3) {
      if (t.stateNode.current.memoizedState.isDehydrated)
        return t.tag === 3 ? t.stateNode.containerInfo : null;
      e = null;
    } else t !== e && (e = null);
  return ((Ml = e), null);
}
function Tc(e) {
  switch (e) {
    case "cancel":
    case "click":
    case "close":
    case "contextmenu":
    case "copy":
    case "cut":
    case "auxclick":
    case "dblclick":
    case "dragend":
    case "dragstart":
    case "drop":
    case "focusin":
    case "focusout":
    case "input":
    case "invalid":
    case "keydown":
    case "keypress":
    case "keyup":
    case "mousedown":
    case "mouseup":
    case "paste":
    case "pause":
    case "play":
    case "pointercancel":
    case "pointerdown":
    case "pointerup":
    case "ratechange":
    case "reset":
    case "resize":
    case "seeked":
    case "submit":
    case "touchcancel":
    case "touchend":
    case "touchstart":
    case "volumechange":
    case "change":
    case "selectionchange":
    case "textInput":
    case "compositionstart":
    case "compositionend":
    case "compositionupdate":
    case "beforeblur":
    case "afterblur":
    case "beforeinput":
    case "blur":
    case "fullscreenchange":
    case "focus":
    case "hashchange":
    case "popstate":
    case "select":
    case "selectstart":
      return 1;
    case "drag":
    case "dragenter":
    case "dragexit":
    case "dragleave":
    case "dragover":
    case "mousemove":
    case "mouseout":
    case "mouseover":
    case "pointermove":
    case "pointerout":
    case "pointerover":
    case "scroll":
    case "toggle":
    case "touchmove":
    case "wheel":
    case "mouseenter":
    case "mouseleave":
    case "pointerenter":
    case "pointerleave":
      return 4;
    case "message":
      switch (Np()) {
        case cs:
          return 1;
        case _c:
          return 4;
        case Rl:
        case Rp:
          return 16;
        case Cc:
          return 536870912;
        default:
          return 16;
      }
    default:
      return 16;
  }
}
var Ft = null,
  hs = null,
  yl = null;
function Mc() {
  if (yl) return yl;
  var e,
    t = hs,
    n = t.length,
    r,
    l = "value" in Ft ? Ft.value : Ft.textContent,
    o = l.length;
  for (e = 0; e < n && t[e] === l[e]; e++);
  var s = n - e;
  for (r = 1; r <= s && t[n - r] === l[o - r]; r++);
  return (yl = l.slice(e, 1 < r ? 1 - r : void 0));
}
function Sl(e) {
  var t = e.keyCode;
  return (
    "charCode" in e
      ? ((e = e.charCode), e === 0 && t === 13 && (e = 13))
      : (e = t),
    e === 10 && (e = 13),
    32 <= e || e === 13 ? e : 0
  );
}
function tl() {
  return !0;
}
function ja() {
  return !1;
}
function Ae(e) {
  function t(n, r, l, o, s) {
    ((this._reactName = n),
      (this._targetInst = l),
      (this.type = r),
      (this.nativeEvent = o),
      (this.target = s),
      (this.currentTarget = null));
    for (var a in e)
      e.hasOwnProperty(a) && ((n = e[a]), (this[a] = n ? n(o) : o[a]));
    return (
      (this.isDefaultPrevented = (
        o.defaultPrevented != null ? o.defaultPrevented : o.returnValue === !1
      )
        ? tl
        : ja),
      (this.isPropagationStopped = ja),
      this
    );
  }
  return (
    oe(t.prototype, {
      preventDefault: function () {
        this.defaultPrevented = !0;
        var n = this.nativeEvent;
        n &&
          (n.preventDefault
            ? n.preventDefault()
            : typeof n.returnValue != "unknown" && (n.returnValue = !1),
          (this.isDefaultPrevented = tl));
      },
      stopPropagation: function () {
        var n = this.nativeEvent;
        n &&
          (n.stopPropagation
            ? n.stopPropagation()
            : typeof n.cancelBubble != "unknown" && (n.cancelBubble = !0),
          (this.isPropagationStopped = tl));
      },
      persist: function () {},
      isPersistent: tl,
    }),
    t
  );
}
var Vn = {
    eventPhase: 0,
    bubbles: 0,
    cancelable: 0,
    timeStamp: function (e) {
      return e.timeStamp || Date.now();
    },
    defaultPrevented: 0,
    isTrusted: 0,
  },
  ms = Ae(Vn),
  Hr = oe({}, Vn, { view: 0, detail: 0 }),
  Hp = Ae(Hr),
  Po,
  No,
  er,
  no = oe({}, Hr, {
    screenX: 0,
    screenY: 0,
    clientX: 0,
    clientY: 0,
    pageX: 0,
    pageY: 0,
    ctrlKey: 0,
    shiftKey: 0,
    altKey: 0,
    metaKey: 0,
    getModifierState: gs,
    button: 0,
    buttons: 0,
    relatedTarget: function (e) {
      return e.relatedTarget === void 0
        ? e.fromElement === e.srcElement
          ? e.toElement
          : e.fromElement
        : e.relatedTarget;
    },
    movementX: function (e) {
      return "movementX" in e
        ? e.movementX
        : (e !== er &&
            (er && e.type === "mousemove"
              ? ((Po = e.screenX - er.screenX), (No = e.screenY - er.screenY))
              : (No = Po = 0),
            (er = e)),
          Po);
    },
    movementY: function (e) {
      return "movementY" in e ? e.movementY : No;
    },
  }),
  _a = Ae(no),
  Vp = oe({}, no, { dataTransfer: 0 }),
  Kp = Ae(Vp),
  Qp = oe({}, Hr, { relatedTarget: 0 }),
  Ro = Ae(Qp),
  Jp = oe({}, Vn, { animationName: 0, elapsedTime: 0, pseudoElement: 0 }),
  Yp = Ae(Jp),
  Xp = oe({}, Vn, {
    clipboardData: function (e) {
      return "clipboardData" in e ? e.clipboardData : window.clipboardData;
    },
  }),
  Gp = Ae(Xp),
  Zp = oe({}, Vn, { data: 0 }),
  Ca = Ae(Zp),
  qp = {
    Esc: "Escape",
    Spacebar: " ",
    Left: "ArrowLeft",
    Up: "ArrowUp",
    Right: "ArrowRight",
    Down: "ArrowDown",
    Del: "Delete",
    Win: "OS",
    Menu: "ContextMenu",
    Apps: "ContextMenu",
    Scroll: "ScrollLock",
    MozPrintableKey: "Unidentified",
  },
  eh = {
    8: "Backspace",
    9: "Tab",
    12: "Clear",
    13: "Enter",
    16: "Shift",
    17: "Control",
    18: "Alt",
    19: "Pause",
    20: "CapsLock",
    27: "Escape",
    32: " ",
    33: "PageUp",
    34: "PageDown",
    35: "End",
    36: "Home",
    37: "ArrowLeft",
    38: "ArrowUp",
    39: "ArrowRight",
    40: "ArrowDown",
    45: "Insert",
    46: "Delete",
    112: "F1",
    113: "F2",
    114: "F3",
    115: "F4",
    116: "F5",
    117: "F6",
    118: "F7",
    119: "F8",
    120: "F9",
    121: "F10",
    122: "F11",
    123: "F12",
    144: "NumLock",
    145: "ScrollLock",
    224: "Meta",
  },
  th = {
    Alt: "altKey",
    Control: "ctrlKey",
    Meta: "metaKey",
    Shift: "shiftKey",
  };
function nh(e) {
  var t = this.nativeEvent;
  return t.getModifierState ? t.getModifierState(e) : (e = th[e]) ? !!t[e] : !1;
}
function gs() {
  return nh;
}
var rh = oe({}, Hr, {
    key: function (e) {
      if (e.key) {
        var t = qp[e.key] || e.key;
        if (t !== "Unidentified") return t;
      }
      return e.type === "keypress"
        ? ((e = Sl(e)), e === 13 ? "Enter" : String.fromCharCode(e))
        : e.type === "keydown" || e.type === "keyup"
          ? eh[e.keyCode] || "Unidentified"
          : "";
    },
    code: 0,
    location: 0,
    ctrlKey: 0,
    shiftKey: 0,
    altKey: 0,
    metaKey: 0,
    repeat: 0,
    locale: 0,
    getModifierState: gs,
    charCode: function (e) {
      return e.type === "keypress" ? Sl(e) : 0;
    },
    keyCode: function (e) {
      return e.type === "keydown" || e.type === "keyup" ? e.keyCode : 0;
    },
    which: function (e) {
      return e.type === "keypress"
        ? Sl(e)
        : e.type === "keydown" || e.type === "keyup"
          ? e.keyCode
          : 0;
    },
  }),
  lh = Ae(rh),
  oh = oe({}, no, {
    pointerId: 0,
    width: 0,
    height: 0,
    pressure: 0,
    tangentialPressure: 0,
    tiltX: 0,
    tiltY: 0,
    twist: 0,
    pointerType: 0,
    isPrimary: 0,
  }),
  Ea = Ae(oh),
  ih = oe({}, Hr, {
    touches: 0,
    targetTouches: 0,
    changedTouches: 0,
    altKey: 0,
    metaKey: 0,
    ctrlKey: 0,
    shiftKey: 0,
    getModifierState: gs,
  }),
  sh = Ae(ih),
  ah = oe({}, Vn, { propertyName: 0, elapsedTime: 0, pseudoElement: 0 }),
  uh = Ae(ah),
  ch = oe({}, no, {
    deltaX: function (e) {
      return "deltaX" in e ? e.deltaX : "wheelDeltaX" in e ? -e.wheelDeltaX : 0;
    },
    deltaY: function (e) {
      return "deltaY" in e
        ? e.deltaY
        : "wheelDeltaY" in e
          ? -e.wheelDeltaY
          : "wheelDelta" in e
            ? -e.wheelDelta
            : 0;
    },
    deltaZ: 0,
    deltaMode: 0,
  }),
  dh = Ae(ch),
  fh = [9, 13, 27, 32],
  vs = xt && "CompositionEvent" in window,
  gr = null;
xt && "documentMode" in document && (gr = document.documentMode);
var ph = xt && "TextEvent" in window && !gr,
  Ic = xt && (!vs || (gr && 8 < gr && 11 >= gr)),
  ba = " ",
  za = !1;
function Fc(e, t) {
  switch (e) {
    case "keyup":
      return fh.indexOf(t.keyCode) !== -1;
    case "keydown":
      return t.keyCode !== 229;
    case "keypress":
    case "mousedown":
    case "focusout":
      return !0;
    default:
      return !1;
  }
}
function Dc(e) {
  return ((e = e.detail), typeof e == "object" && "data" in e ? e.data : null);
}
var yn = !1;
function hh(e, t) {
  switch (e) {
    case "compositionend":
      return Dc(t);
    case "keypress":
      return t.which !== 32 ? null : ((za = !0), ba);
    case "textInput":
      return ((e = t.data), e === ba && za ? null : e);
    default:
      return null;
  }
}
function mh(e, t) {
  if (yn)
    return e === "compositionend" || (!vs && Fc(e, t))
      ? ((e = Mc()), (yl = hs = Ft = null), (yn = !1), e)
      : null;
  switch (e) {
    case "paste":
      return null;
    case "keypress":
      if (!(t.ctrlKey || t.altKey || t.metaKey) || (t.ctrlKey && t.altKey)) {
        if (t.char && 1 < t.char.length) return t.char;
        if (t.which) return String.fromCharCode(t.which);
      }
      return null;
    case "compositionend":
      return Ic && t.locale !== "ko" ? null : t.data;
    default:
      return null;
  }
}
var gh = {
  color: !0,
  date: !0,
  datetime: !0,
  "datetime-local": !0,
  email: !0,
  month: !0,
  number: !0,
  password: !0,
  range: !0,
  search: !0,
  tel: !0,
  text: !0,
  time: !0,
  url: !0,
  week: !0,
};
function Pa(e) {
  var t = e && e.nodeName && e.nodeName.toLowerCase();
  return t === "input" ? !!gh[e.type] : t === "textarea";
}
function Bc(e, t, n, r) {
  (mc(r),
    (t = Il(t, "onChange")),
    0 < t.length &&
      ((n = new ms("onChange", "change", null, n, r)),
      e.push({ event: n, listeners: t })));
}
var vr = null,
  Pr = null;
function vh(e) {
  Yc(e, 0);
}
function ro(e) {
  var t = kn(e);
  if (ac(t)) return e;
}
function xh(e, t) {
  if (e === "change") return t;
}
var Oc = !1;
if (xt) {
  var Lo;
  if (xt) {
    var To = "oninput" in document;
    if (!To) {
      var Na = document.createElement("div");
      (Na.setAttribute("oninput", "return;"),
        (To = typeof Na.oninput == "function"));
    }
    Lo = To;
  } else Lo = !1;
  Oc = Lo && (!document.documentMode || 9 < document.documentMode);
}
function Ra() {
  vr && (vr.detachEvent("onpropertychange", $c), (Pr = vr = null));
}
function $c(e) {
  if (e.propertyName === "value" && ro(Pr)) {
    var t = [];
    (Bc(t, Pr, e, us(e)), yc(vh, t));
  }
}
function yh(e, t, n) {
  e === "focusin"
    ? (Ra(), (vr = t), (Pr = n), vr.attachEvent("onpropertychange", $c))
    : e === "focusout" && Ra();
}
function Sh(e) {
  if (e === "selectionchange" || e === "keyup" || e === "keydown")
    return ro(Pr);
}
function wh(e, t) {
  if (e === "click") return ro(t);
}
function kh(e, t) {
  if (e === "input" || e === "change") return ro(t);
}
function jh(e, t) {
  return (e === t && (e !== 0 || 1 / e === 1 / t)) || (e !== e && t !== t);
}
var nt = typeof Object.is == "function" ? Object.is : jh;
function Nr(e, t) {
  if (nt(e, t)) return !0;
  if (typeof e != "object" || e === null || typeof t != "object" || t === null)
    return !1;
  var n = Object.keys(e),
    r = Object.keys(t);
  if (n.length !== r.length) return !1;
  for (r = 0; r < n.length; r++) {
    var l = n[r];
    if (!Zo.call(t, l) || !nt(e[l], t[l])) return !1;
  }
  return !0;
}
function La(e) {
  for (; e && e.firstChild; ) e = e.firstChild;
  return e;
}
function Ta(e, t) {
  var n = La(e);
  e = 0;
  for (var r; n; ) {
    if (n.nodeType === 3) {
      if (((r = e + n.textContent.length), e <= t && r >= t))
        return { node: n, offset: t - e };
      e = r;
    }
    e: {
      for (; n; ) {
        if (n.nextSibling) {
          n = n.nextSibling;
          break e;
        }
        n = n.parentNode;
      }
      n = void 0;
    }
    n = La(n);
  }
}
function Ac(e, t) {
  return e && t
    ? e === t
      ? !0
      : e && e.nodeType === 3
        ? !1
        : t && t.nodeType === 3
          ? Ac(e, t.parentNode)
          : "contains" in e
            ? e.contains(t)
            : e.compareDocumentPosition
              ? !!(e.compareDocumentPosition(t) & 16)
              : !1
    : !1;
}
function Uc() {
  for (var e = window, t = zl(); t instanceof e.HTMLIFrameElement; ) {
    try {
      var n = typeof t.contentWindow.location.href == "string";
    } catch {
      n = !1;
    }
    if (n) e = t.contentWindow;
    else break;
    t = zl(e.document);
  }
  return t;
}
function xs(e) {
  var t = e && e.nodeName && e.nodeName.toLowerCase();
  return (
    t &&
    ((t === "input" &&
      (e.type === "text" ||
        e.type === "search" ||
        e.type === "tel" ||
        e.type === "url" ||
        e.type === "password")) ||
      t === "textarea" ||
      e.contentEditable === "true")
  );
}
function _h(e) {
  var t = Uc(),
    n = e.focusedElem,
    r = e.selectionRange;
  if (
    t !== n &&
    n &&
    n.ownerDocument &&
    Ac(n.ownerDocument.documentElement, n)
  ) {
    if (r !== null && xs(n)) {
      if (
        ((t = r.start),
        (e = r.end),
        e === void 0 && (e = t),
        "selectionStart" in n)
      )
        ((n.selectionStart = t),
          (n.selectionEnd = Math.min(e, n.value.length)));
      else if (
        ((e = ((t = n.ownerDocument || document) && t.defaultView) || window),
        e.getSelection)
      ) {
        e = e.getSelection();
        var l = n.textContent.length,
          o = Math.min(r.start, l);
        ((r = r.end === void 0 ? o : Math.min(r.end, l)),
          !e.extend && o > r && ((l = r), (r = o), (o = l)),
          (l = Ta(n, o)));
        var s = Ta(n, r);
        l &&
          s &&
          (e.rangeCount !== 1 ||
            e.anchorNode !== l.node ||
            e.anchorOffset !== l.offset ||
            e.focusNode !== s.node ||
            e.focusOffset !== s.offset) &&
          ((t = t.createRange()),
          t.setStart(l.node, l.offset),
          e.removeAllRanges(),
          o > r
            ? (e.addRange(t), e.extend(s.node, s.offset))
            : (t.setEnd(s.node, s.offset), e.addRange(t)));
      }
    }
    for (t = [], e = n; (e = e.parentNode); )
      e.nodeType === 1 &&
        t.push({ element: e, left: e.scrollLeft, top: e.scrollTop });
    for (typeof n.focus == "function" && n.focus(), n = 0; n < t.length; n++)
      ((e = t[n]),
        (e.element.scrollLeft = e.left),
        (e.element.scrollTop = e.top));
  }
}
var Ch = xt && "documentMode" in document && 11 >= document.documentMode,
  Sn = null,
  vi = null,
  xr = null,
  xi = !1;
function Ma(e, t, n) {
  var r = n.window === n ? n.document : n.nodeType === 9 ? n : n.ownerDocument;
  xi ||
    Sn == null ||
    Sn !== zl(r) ||
    ((r = Sn),
    "selectionStart" in r && xs(r)
      ? (r = { start: r.selectionStart, end: r.selectionEnd })
      : ((r = (
          (r.ownerDocument && r.ownerDocument.defaultView) ||
          window
        ).getSelection()),
        (r = {
          anchorNode: r.anchorNode,
          anchorOffset: r.anchorOffset,
          focusNode: r.focusNode,
          focusOffset: r.focusOffset,
        })),
    (xr && Nr(xr, r)) ||
      ((xr = r),
      (r = Il(vi, "onSelect")),
      0 < r.length &&
        ((t = new ms("onSelect", "select", null, t, n)),
        e.push({ event: t, listeners: r }),
        (t.target = Sn))));
}
function nl(e, t) {
  var n = {};
  return (
    (n[e.toLowerCase()] = t.toLowerCase()),
    (n["Webkit" + e] = "webkit" + t),
    (n["Moz" + e] = "moz" + t),
    n
  );
}
var wn = {
    animationend: nl("Animation", "AnimationEnd"),
    animationiteration: nl("Animation", "AnimationIteration"),
    animationstart: nl("Animation", "AnimationStart"),
    transitionend: nl("Transition", "TransitionEnd"),
  },
  Mo = {},
  Wc = {};
xt &&
  ((Wc = document.createElement("div").style),
  "AnimationEvent" in window ||
    (delete wn.animationend.animation,
    delete wn.animationiteration.animation,
    delete wn.animationstart.animation),
  "TransitionEvent" in window || delete wn.transitionend.transition);
function lo(e) {
  if (Mo[e]) return Mo[e];
  if (!wn[e]) return e;
  var t = wn[e],
    n;
  for (n in t) if (t.hasOwnProperty(n) && n in Wc) return (Mo[e] = t[n]);
  return e;
}
var Hc = lo("animationend"),
  Vc = lo("animationiteration"),
  Kc = lo("animationstart"),
  Qc = lo("transitionend"),
  Jc = new Map(),
  Ia =
    "abort auxClick cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(
      " ",
    );
function Xt(e, t) {
  (Jc.set(e, t), pn(t, [e]));
}
for (var Io = 0; Io < Ia.length; Io++) {
  var Fo = Ia[Io],
    Eh = Fo.toLowerCase(),
    bh = Fo[0].toUpperCase() + Fo.slice(1);
  Xt(Eh, "on" + bh);
}
Xt(Hc, "onAnimationEnd");
Xt(Vc, "onAnimationIteration");
Xt(Kc, "onAnimationStart");
Xt("dblclick", "onDoubleClick");
Xt("focusin", "onFocus");
Xt("focusout", "onBlur");
Xt(Qc, "onTransitionEnd");
In("onMouseEnter", ["mouseout", "mouseover"]);
In("onMouseLeave", ["mouseout", "mouseover"]);
In("onPointerEnter", ["pointerout", "pointerover"]);
In("onPointerLeave", ["pointerout", "pointerover"]);
pn(
  "onChange",
  "change click focusin focusout input keydown keyup selectionchange".split(
    " ",
  ),
);
pn(
  "onSelect",
  "focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(
    " ",
  ),
);
pn("onBeforeInput", ["compositionend", "keypress", "textInput", "paste"]);
pn(
  "onCompositionEnd",
  "compositionend focusout keydown keypress keyup mousedown".split(" "),
);
pn(
  "onCompositionStart",
  "compositionstart focusout keydown keypress keyup mousedown".split(" "),
);
pn(
  "onCompositionUpdate",
  "compositionupdate focusout keydown keypress keyup mousedown".split(" "),
);
var pr =
    "abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(
      " ",
    ),
  zh = new Set("cancel close invalid load scroll toggle".split(" ").concat(pr));
function Fa(e, t, n) {
  var r = e.type || "unknown-event";
  ((e.currentTarget = n), Ep(r, t, void 0, e), (e.currentTarget = null));
}
function Yc(e, t) {
  t = (t & 4) !== 0;
  for (var n = 0; n < e.length; n++) {
    var r = e[n],
      l = r.event;
    r = r.listeners;
    e: {
      var o = void 0;
      if (t)
        for (var s = r.length - 1; 0 <= s; s--) {
          var a = r[s],
            u = a.instance,
            c = a.currentTarget;
          if (((a = a.listener), u !== o && l.isPropagationStopped())) break e;
          (Fa(l, a, c), (o = u));
        }
      else
        for (s = 0; s < r.length; s++) {
          if (
            ((a = r[s]),
            (u = a.instance),
            (c = a.currentTarget),
            (a = a.listener),
            u !== o && l.isPropagationStopped())
          )
            break e;
          (Fa(l, a, c), (o = u));
        }
    }
  }
  if (Nl) throw ((e = pi), (Nl = !1), (pi = null), e);
}
function Z(e, t) {
  var n = t[ji];
  n === void 0 && (n = t[ji] = new Set());
  var r = e + "__bubble";
  n.has(r) || (Xc(t, e, 2, !1), n.add(r));
}
function Do(e, t, n) {
  var r = 0;
  (t && (r |= 4), Xc(n, e, r, t));
}
var rl = "_reactListening" + Math.random().toString(36).slice(2);
function Rr(e) {
  if (!e[rl]) {
    ((e[rl] = !0),
      rc.forEach(function (n) {
        n !== "selectionchange" && (zh.has(n) || Do(n, !1, e), Do(n, !0, e));
      }));
    var t = e.nodeType === 9 ? e : e.ownerDocument;
    t === null || t[rl] || ((t[rl] = !0), Do("selectionchange", !1, t));
  }
}
function Xc(e, t, n, r) {
  switch (Tc(t)) {
    case 1:
      var l = Up;
      break;
    case 4:
      l = Wp;
      break;
    default:
      l = ps;
  }
  ((n = l.bind(null, t, n, e)),
    (l = void 0),
    !fi ||
      (t !== "touchstart" && t !== "touchmove" && t !== "wheel") ||
      (l = !0),
    r
      ? l !== void 0
        ? e.addEventListener(t, n, { capture: !0, passive: l })
        : e.addEventListener(t, n, !0)
      : l !== void 0
        ? e.addEventListener(t, n, { passive: l })
        : e.addEventListener(t, n, !1));
}
function Bo(e, t, n, r, l) {
  var o = r;
  if (!(t & 1) && !(t & 2) && r !== null)
    e: for (;;) {
      if (r === null) return;
      var s = r.tag;
      if (s === 3 || s === 4) {
        var a = r.stateNode.containerInfo;
        if (a === l || (a.nodeType === 8 && a.parentNode === l)) break;
        if (s === 4)
          for (s = r.return; s !== null; ) {
            var u = s.tag;
            if (
              (u === 3 || u === 4) &&
              ((u = s.stateNode.containerInfo),
              u === l || (u.nodeType === 8 && u.parentNode === l))
            )
              return;
            s = s.return;
          }
        for (; a !== null; ) {
          if (((s = tn(a)), s === null)) return;
          if (((u = s.tag), u === 5 || u === 6)) {
            r = o = s;
            continue e;
          }
          a = a.parentNode;
        }
      }
      r = r.return;
    }
  yc(function () {
    var c = o,
      m = us(n),
      f = [];
    e: {
      var g = Jc.get(e);
      if (g !== void 0) {
        var S = ms,
          y = e;
        switch (e) {
          case "keypress":
            if (Sl(n) === 0) break e;
          case "keydown":
          case "keyup":
            S = lh;
            break;
          case "focusin":
            ((y = "focus"), (S = Ro));
            break;
          case "focusout":
            ((y = "blur"), (S = Ro));
            break;
          case "beforeblur":
          case "afterblur":
            S = Ro;
            break;
          case "click":
            if (n.button === 2) break e;
          case "auxclick":
          case "dblclick":
          case "mousedown":
          case "mousemove":
          case "mouseup":
          case "mouseout":
          case "mouseover":
          case "contextmenu":
            S = _a;
            break;
          case "drag":
          case "dragend":
          case "dragenter":
          case "dragexit":
          case "dragleave":
          case "dragover":
          case "dragstart":
          case "drop":
            S = Kp;
            break;
          case "touchcancel":
          case "touchend":
          case "touchmove":
          case "touchstart":
            S = sh;
            break;
          case Hc:
          case Vc:
          case Kc:
            S = Yp;
            break;
          case Qc:
            S = uh;
            break;
          case "scroll":
            S = Hp;
            break;
          case "wheel":
            S = dh;
            break;
          case "copy":
          case "cut":
          case "paste":
            S = Gp;
            break;
          case "gotpointercapture":
          case "lostpointercapture":
          case "pointercancel":
          case "pointerdown":
          case "pointermove":
          case "pointerout":
          case "pointerover":
          case "pointerup":
            S = Ea;
        }
        var k = (t & 4) !== 0,
          j = !k && e === "scroll",
          p = k ? (g !== null ? g + "Capture" : null) : g;
        k = [];
        for (var d = c, h; d !== null; ) {
          h = d;
          var w = h.stateNode;
          if (
            (h.tag === 5 &&
              w !== null &&
              ((h = w),
              p !== null && ((w = Cr(d, p)), w != null && k.push(Lr(d, w, h)))),
            j)
          )
            break;
          d = d.return;
        }
        0 < k.length &&
          ((g = new S(g, y, null, n, m)), f.push({ event: g, listeners: k }));
      }
    }
    if (!(t & 7)) {
      e: {
        if (
          ((g = e === "mouseover" || e === "pointerover"),
          (S = e === "mouseout" || e === "pointerout"),
          g &&
            n !== ci &&
            (y = n.relatedTarget || n.fromElement) &&
            (tn(y) || y[yt]))
        )
          break e;
        if (
          (S || g) &&
          ((g =
            m.window === m
              ? m
              : (g = m.ownerDocument)
                ? g.defaultView || g.parentWindow
                : window),
          S
            ? ((y = n.relatedTarget || n.toElement),
              (S = c),
              (y = y ? tn(y) : null),
              y !== null &&
                ((j = hn(y)), y !== j || (y.tag !== 5 && y.tag !== 6)) &&
                (y = null))
            : ((S = null), (y = c)),
          S !== y)
        ) {
          if (
            ((k = _a),
            (w = "onMouseLeave"),
            (p = "onMouseEnter"),
            (d = "mouse"),
            (e === "pointerout" || e === "pointerover") &&
              ((k = Ea),
              (w = "onPointerLeave"),
              (p = "onPointerEnter"),
              (d = "pointer")),
            (j = S == null ? g : kn(S)),
            (h = y == null ? g : kn(y)),
            (g = new k(w, d + "leave", S, n, m)),
            (g.target = j),
            (g.relatedTarget = h),
            (w = null),
            tn(m) === c &&
              ((k = new k(p, d + "enter", y, n, m)),
              (k.target = h),
              (k.relatedTarget = j),
              (w = k)),
            (j = w),
            S && y)
          )
            t: {
              for (k = S, p = y, d = 0, h = k; h; h = gn(h)) d++;
              for (h = 0, w = p; w; w = gn(w)) h++;
              for (; 0 < d - h; ) ((k = gn(k)), d--);
              for (; 0 < h - d; ) ((p = gn(p)), h--);
              for (; d--; ) {
                if (k === p || (p !== null && k === p.alternate)) break t;
                ((k = gn(k)), (p = gn(p)));
              }
              k = null;
            }
          else k = null;
          (S !== null && Da(f, g, S, k, !1),
            y !== null && j !== null && Da(f, j, y, k, !0));
        }
      }
      e: {
        if (
          ((g = c ? kn(c) : window),
          (S = g.nodeName && g.nodeName.toLowerCase()),
          S === "select" || (S === "input" && g.type === "file"))
        )
          var _ = xh;
        else if (Pa(g))
          if (Oc) _ = kh;
          else {
            _ = Sh;
            var E = yh;
          }
        else
          (S = g.nodeName) &&
            S.toLowerCase() === "input" &&
            (g.type === "checkbox" || g.type === "radio") &&
            (_ = wh);
        if (_ && (_ = _(e, c))) {
          Bc(f, _, n, m);
          break e;
        }
        (E && E(e, g, c),
          e === "focusout" &&
            (E = g._wrapperState) &&
            E.controlled &&
            g.type === "number" &&
            oi(g, "number", g.value));
      }
      switch (((E = c ? kn(c) : window), e)) {
        case "focusin":
          (Pa(E) || E.contentEditable === "true") &&
            ((Sn = E), (vi = c), (xr = null));
          break;
        case "focusout":
          xr = vi = Sn = null;
          break;
        case "mousedown":
          xi = !0;
          break;
        case "contextmenu":
        case "mouseup":
        case "dragend":
          ((xi = !1), Ma(f, n, m));
          break;
        case "selectionchange":
          if (Ch) break;
        case "keydown":
        case "keyup":
          Ma(f, n, m);
      }
      var C;
      if (vs)
        e: {
          switch (e) {
            case "compositionstart":
              var v = "onCompositionStart";
              break e;
            case "compositionend":
              v = "onCompositionEnd";
              break e;
            case "compositionupdate":
              v = "onCompositionUpdate";
              break e;
          }
          v = void 0;
        }
      else
        yn
          ? Fc(e, n) && (v = "onCompositionEnd")
          : e === "keydown" && n.keyCode === 229 && (v = "onCompositionStart");
      (v &&
        (Ic &&
          n.locale !== "ko" &&
          (yn || v !== "onCompositionStart"
            ? v === "onCompositionEnd" && yn && (C = Mc())
            : ((Ft = m),
              (hs = "value" in Ft ? Ft.value : Ft.textContent),
              (yn = !0))),
        (E = Il(c, v)),
        0 < E.length &&
          ((v = new Ca(v, e, null, n, m)),
          f.push({ event: v, listeners: E }),
          C ? (v.data = C) : ((C = Dc(n)), C !== null && (v.data = C)))),
        (C = ph ? hh(e, n) : mh(e, n)) &&
          ((c = Il(c, "onBeforeInput")),
          0 < c.length &&
            ((m = new Ca("onBeforeInput", "beforeinput", null, n, m)),
            f.push({ event: m, listeners: c }),
            (m.data = C))));
    }
    Yc(f, t);
  });
}
function Lr(e, t, n) {
  return { instance: e, listener: t, currentTarget: n };
}
function Il(e, t) {
  for (var n = t + "Capture", r = []; e !== null; ) {
    var l = e,
      o = l.stateNode;
    (l.tag === 5 &&
      o !== null &&
      ((l = o),
      (o = Cr(e, n)),
      o != null && r.unshift(Lr(e, o, l)),
      (o = Cr(e, t)),
      o != null && r.push(Lr(e, o, l))),
      (e = e.return));
  }
  return r;
}
function gn(e) {
  if (e === null) return null;
  do e = e.return;
  while (e && e.tag !== 5);
  return e || null;
}
function Da(e, t, n, r, l) {
  for (var o = t._reactName, s = []; n !== null && n !== r; ) {
    var a = n,
      u = a.alternate,
      c = a.stateNode;
    if (u !== null && u === r) break;
    (a.tag === 5 &&
      c !== null &&
      ((a = c),
      l
        ? ((u = Cr(n, o)), u != null && s.unshift(Lr(n, u, a)))
        : l || ((u = Cr(n, o)), u != null && s.push(Lr(n, u, a)))),
      (n = n.return));
  }
  s.length !== 0 && e.push({ event: t, listeners: s });
}
var Ph = /\r\n?/g,
  Nh = /\u0000|\uFFFD/g;
function Ba(e) {
  return (typeof e == "string" ? e : "" + e)
    .replace(
      Ph,
      `
`,
    )
    .replace(Nh, "");
}
function ll(e, t, n) {
  if (((t = Ba(t)), Ba(e) !== t && n)) throw Error(L(425));
}
function Fl() {}
var yi = null,
  Si = null;
function wi(e, t) {
  return (
    e === "textarea" ||
    e === "noscript" ||
    typeof t.children == "string" ||
    typeof t.children == "number" ||
    (typeof t.dangerouslySetInnerHTML == "object" &&
      t.dangerouslySetInnerHTML !== null &&
      t.dangerouslySetInnerHTML.__html != null)
  );
}
var ki = typeof setTimeout == "function" ? setTimeout : void 0,
  Rh = typeof clearTimeout == "function" ? clearTimeout : void 0,
  Oa = typeof Promise == "function" ? Promise : void 0,
  Lh =
    typeof queueMicrotask == "function"
      ? queueMicrotask
      : typeof Oa < "u"
        ? function (e) {
            return Oa.resolve(null).then(e).catch(Th);
          }
        : ki;
function Th(e) {
  setTimeout(function () {
    throw e;
  });
}
function Oo(e, t) {
  var n = t,
    r = 0;
  do {
    var l = n.nextSibling;
    if ((e.removeChild(n), l && l.nodeType === 8))
      if (((n = l.data), n === "/$")) {
        if (r === 0) {
          (e.removeChild(l), zr(t));
          return;
        }
        r--;
      } else (n !== "$" && n !== "$?" && n !== "$!") || r++;
    n = l;
  } while (n);
  zr(t);
}
function Ut(e) {
  for (; e != null; e = e.nextSibling) {
    var t = e.nodeType;
    if (t === 1 || t === 3) break;
    if (t === 8) {
      if (((t = e.data), t === "$" || t === "$!" || t === "$?")) break;
      if (t === "/$") return null;
    }
  }
  return e;
}
function $a(e) {
  e = e.previousSibling;
  for (var t = 0; e; ) {
    if (e.nodeType === 8) {
      var n = e.data;
      if (n === "$" || n === "$!" || n === "$?") {
        if (t === 0) return e;
        t--;
      } else n === "/$" && t++;
    }
    e = e.previousSibling;
  }
  return null;
}
var Kn = Math.random().toString(36).slice(2),
  st = "__reactFiber$" + Kn,
  Tr = "__reactProps$" + Kn,
  yt = "__reactContainer$" + Kn,
  ji = "__reactEvents$" + Kn,
  Mh = "__reactListeners$" + Kn,
  Ih = "__reactHandles$" + Kn;
function tn(e) {
  var t = e[st];
  if (t) return t;
  for (var n = e.parentNode; n; ) {
    if ((t = n[yt] || n[st])) {
      if (
        ((n = t.alternate),
        t.child !== null || (n !== null && n.child !== null))
      )
        for (e = $a(e); e !== null; ) {
          if ((n = e[st])) return n;
          e = $a(e);
        }
      return t;
    }
    ((e = n), (n = e.parentNode));
  }
  return null;
}
function Vr(e) {
  return (
    (e = e[st] || e[yt]),
    !e || (e.tag !== 5 && e.tag !== 6 && e.tag !== 13 && e.tag !== 3) ? null : e
  );
}
function kn(e) {
  if (e.tag === 5 || e.tag === 6) return e.stateNode;
  throw Error(L(33));
}
function oo(e) {
  return e[Tr] || null;
}
var _i = [],
  jn = -1;
function Gt(e) {
  return { current: e };
}
function q(e) {
  0 > jn || ((e.current = _i[jn]), (_i[jn] = null), jn--);
}
function X(e, t) {
  (jn++, (_i[jn] = e.current), (e.current = t));
}
var Yt = {},
  je = Gt(Yt),
  Te = Gt(!1),
  sn = Yt;
function Fn(e, t) {
  var n = e.type.contextTypes;
  if (!n) return Yt;
  var r = e.stateNode;
  if (r && r.__reactInternalMemoizedUnmaskedChildContext === t)
    return r.__reactInternalMemoizedMaskedChildContext;
  var l = {},
    o;
  for (o in n) l[o] = t[o];
  return (
    r &&
      ((e = e.stateNode),
      (e.__reactInternalMemoizedUnmaskedChildContext = t),
      (e.__reactInternalMemoizedMaskedChildContext = l)),
    l
  );
}
function Me(e) {
  return ((e = e.childContextTypes), e != null);
}
function Dl() {
  (q(Te), q(je));
}
function Aa(e, t, n) {
  if (je.current !== Yt) throw Error(L(168));
  (X(je, t), X(Te, n));
}
function Gc(e, t, n) {
  var r = e.stateNode;
  if (((t = t.childContextTypes), typeof r.getChildContext != "function"))
    return n;
  r = r.getChildContext();
  for (var l in r) if (!(l in t)) throw Error(L(108, yp(e) || "Unknown", l));
  return oe({}, n, r);
}
function Bl(e) {
  return (
    (e =
      ((e = e.stateNode) && e.__reactInternalMemoizedMergedChildContext) || Yt),
    (sn = je.current),
    X(je, e),
    X(Te, Te.current),
    !0
  );
}
function Ua(e, t, n) {
  var r = e.stateNode;
  if (!r) throw Error(L(169));
  (n
    ? ((e = Gc(e, t, sn)),
      (r.__reactInternalMemoizedMergedChildContext = e),
      q(Te),
      q(je),
      X(je, e))
    : q(Te),
    X(Te, n));
}
var ht = null,
  io = !1,
  $o = !1;
function Zc(e) {
  ht === null ? (ht = [e]) : ht.push(e);
}
function Fh(e) {
  ((io = !0), Zc(e));
}
function Zt() {
  if (!$o && ht !== null) {
    $o = !0;
    var e = 0,
      t = J;
    try {
      var n = ht;
      for (J = 1; e < n.length; e++) {
        var r = n[e];
        do r = r(!0);
        while (r !== null);
      }
      ((ht = null), (io = !1));
    } catch (l) {
      throw (ht !== null && (ht = ht.slice(e + 1)), jc(cs, Zt), l);
    } finally {
      ((J = t), ($o = !1));
    }
  }
  return null;
}
var _n = [],
  Cn = 0,
  Ol = null,
  $l = 0,
  We = [],
  He = 0,
  an = null,
  mt = 1,
  gt = "";
function qt(e, t) {
  ((_n[Cn++] = $l), (_n[Cn++] = Ol), (Ol = e), ($l = t));
}
function qc(e, t, n) {
  ((We[He++] = mt), (We[He++] = gt), (We[He++] = an), (an = e));
  var r = mt;
  e = gt;
  var l = 32 - et(r) - 1;
  ((r &= ~(1 << l)), (n += 1));
  var o = 32 - et(t) + l;
  if (30 < o) {
    var s = l - (l % 5);
    ((o = (r & ((1 << s) - 1)).toString(32)),
      (r >>= s),
      (l -= s),
      (mt = (1 << (32 - et(t) + l)) | (n << l) | r),
      (gt = o + e));
  } else ((mt = (1 << o) | (n << l) | r), (gt = e));
}
function ys(e) {
  e.return !== null && (qt(e, 1), qc(e, 1, 0));
}
function Ss(e) {
  for (; e === Ol; )
    ((Ol = _n[--Cn]), (_n[Cn] = null), ($l = _n[--Cn]), (_n[Cn] = null));
  for (; e === an; )
    ((an = We[--He]),
      (We[He] = null),
      (gt = We[--He]),
      (We[He] = null),
      (mt = We[--He]),
      (We[He] = null));
}
var Be = null,
  De = null,
  ee = !1,
  qe = null;
function ed(e, t) {
  var n = Ve(5, null, null, 0);
  ((n.elementType = "DELETED"),
    (n.stateNode = t),
    (n.return = e),
    (t = e.deletions),
    t === null ? ((e.deletions = [n]), (e.flags |= 16)) : t.push(n));
}
function Wa(e, t) {
  switch (e.tag) {
    case 5:
      var n = e.type;
      return (
        (t =
          t.nodeType !== 1 || n.toLowerCase() !== t.nodeName.toLowerCase()
            ? null
            : t),
        t !== null
          ? ((e.stateNode = t), (Be = e), (De = Ut(t.firstChild)), !0)
          : !1
      );
    case 6:
      return (
        (t = e.pendingProps === "" || t.nodeType !== 3 ? null : t),
        t !== null ? ((e.stateNode = t), (Be = e), (De = null), !0) : !1
      );
    case 13:
      return (
        (t = t.nodeType !== 8 ? null : t),
        t !== null
          ? ((n = an !== null ? { id: mt, overflow: gt } : null),
            (e.memoizedState = {
              dehydrated: t,
              treeContext: n,
              retryLane: 1073741824,
            }),
            (n = Ve(18, null, null, 0)),
            (n.stateNode = t),
            (n.return = e),
            (e.child = n),
            (Be = e),
            (De = null),
            !0)
          : !1
      );
    default:
      return !1;
  }
}
function Ci(e) {
  return (e.mode & 1) !== 0 && (e.flags & 128) === 0;
}
function Ei(e) {
  if (ee) {
    var t = De;
    if (t) {
      var n = t;
      if (!Wa(e, t)) {
        if (Ci(e)) throw Error(L(418));
        t = Ut(n.nextSibling);
        var r = Be;
        t && Wa(e, t)
          ? ed(r, n)
          : ((e.flags = (e.flags & -4097) | 2), (ee = !1), (Be = e));
      }
    } else {
      if (Ci(e)) throw Error(L(418));
      ((e.flags = (e.flags & -4097) | 2), (ee = !1), (Be = e));
    }
  }
}
function Ha(e) {
  for (e = e.return; e !== null && e.tag !== 5 && e.tag !== 3 && e.tag !== 13; )
    e = e.return;
  Be = e;
}
function ol(e) {
  if (e !== Be) return !1;
  if (!ee) return (Ha(e), (ee = !0), !1);
  var t;
  if (
    ((t = e.tag !== 3) &&
      !(t = e.tag !== 5) &&
      ((t = e.type),
      (t = t !== "head" && t !== "body" && !wi(e.type, e.memoizedProps))),
    t && (t = De))
  ) {
    if (Ci(e)) throw (td(), Error(L(418)));
    for (; t; ) (ed(e, t), (t = Ut(t.nextSibling)));
  }
  if ((Ha(e), e.tag === 13)) {
    if (((e = e.memoizedState), (e = e !== null ? e.dehydrated : null), !e))
      throw Error(L(317));
    e: {
      for (e = e.nextSibling, t = 0; e; ) {
        if (e.nodeType === 8) {
          var n = e.data;
          if (n === "/$") {
            if (t === 0) {
              De = Ut(e.nextSibling);
              break e;
            }
            t--;
          } else (n !== "$" && n !== "$!" && n !== "$?") || t++;
        }
        e = e.nextSibling;
      }
      De = null;
    }
  } else De = Be ? Ut(e.stateNode.nextSibling) : null;
  return !0;
}
function td() {
  for (var e = De; e; ) e = Ut(e.nextSibling);
}
function Dn() {
  ((De = Be = null), (ee = !1));
}
function ws(e) {
  qe === null ? (qe = [e]) : qe.push(e);
}
var Dh = kt.ReactCurrentBatchConfig;
function tr(e, t, n) {
  if (
    ((e = n.ref), e !== null && typeof e != "function" && typeof e != "object")
  ) {
    if (n._owner) {
      if (((n = n._owner), n)) {
        if (n.tag !== 1) throw Error(L(309));
        var r = n.stateNode;
      }
      if (!r) throw Error(L(147, e));
      var l = r,
        o = "" + e;
      return t !== null &&
        t.ref !== null &&
        typeof t.ref == "function" &&
        t.ref._stringRef === o
        ? t.ref
        : ((t = function (s) {
            var a = l.refs;
            s === null ? delete a[o] : (a[o] = s);
          }),
          (t._stringRef = o),
          t);
    }
    if (typeof e != "string") throw Error(L(284));
    if (!n._owner) throw Error(L(290, e));
  }
  return e;
}
function il(e, t) {
  throw (
    (e = Object.prototype.toString.call(t)),
    Error(
      L(
        31,
        e === "[object Object]"
          ? "object with keys {" + Object.keys(t).join(", ") + "}"
          : e,
      ),
    )
  );
}
function Va(e) {
  var t = e._init;
  return t(e._payload);
}
function nd(e) {
  function t(p, d) {
    if (e) {
      var h = p.deletions;
      h === null ? ((p.deletions = [d]), (p.flags |= 16)) : h.push(d);
    }
  }
  function n(p, d) {
    if (!e) return null;
    for (; d !== null; ) (t(p, d), (d = d.sibling));
    return null;
  }
  function r(p, d) {
    for (p = new Map(); d !== null; )
      (d.key !== null ? p.set(d.key, d) : p.set(d.index, d), (d = d.sibling));
    return p;
  }
  function l(p, d) {
    return ((p = Kt(p, d)), (p.index = 0), (p.sibling = null), p);
  }
  function o(p, d, h) {
    return (
      (p.index = h),
      e
        ? ((h = p.alternate),
          h !== null
            ? ((h = h.index), h < d ? ((p.flags |= 2), d) : h)
            : ((p.flags |= 2), d))
        : ((p.flags |= 1048576), d)
    );
  }
  function s(p) {
    return (e && p.alternate === null && (p.flags |= 2), p);
  }
  function a(p, d, h, w) {
    return d === null || d.tag !== 6
      ? ((d = Qo(h, p.mode, w)), (d.return = p), d)
      : ((d = l(d, h)), (d.return = p), d);
  }
  function u(p, d, h, w) {
    var _ = h.type;
    return _ === xn
      ? m(p, d, h.props.children, w, h.key)
      : d !== null &&
          (d.elementType === _ ||
            (typeof _ == "object" &&
              _ !== null &&
              _.$$typeof === Lt &&
              Va(_) === d.type))
        ? ((w = l(d, h.props)), (w.ref = tr(p, d, h)), (w.return = p), w)
        : ((w = bl(h.type, h.key, h.props, null, p.mode, w)),
          (w.ref = tr(p, d, h)),
          (w.return = p),
          w);
  }
  function c(p, d, h, w) {
    return d === null ||
      d.tag !== 4 ||
      d.stateNode.containerInfo !== h.containerInfo ||
      d.stateNode.implementation !== h.implementation
      ? ((d = Jo(h, p.mode, w)), (d.return = p), d)
      : ((d = l(d, h.children || [])), (d.return = p), d);
  }
  function m(p, d, h, w, _) {
    return d === null || d.tag !== 7
      ? ((d = on(h, p.mode, w, _)), (d.return = p), d)
      : ((d = l(d, h)), (d.return = p), d);
  }
  function f(p, d, h) {
    if ((typeof d == "string" && d !== "") || typeof d == "number")
      return ((d = Qo("" + d, p.mode, h)), (d.return = p), d);
    if (typeof d == "object" && d !== null) {
      switch (d.$$typeof) {
        case Yr:
          return (
            (h = bl(d.type, d.key, d.props, null, p.mode, h)),
            (h.ref = tr(p, null, d)),
            (h.return = p),
            h
          );
        case vn:
          return ((d = Jo(d, p.mode, h)), (d.return = p), d);
        case Lt:
          var w = d._init;
          return f(p, w(d._payload), h);
      }
      if (dr(d) || Xn(d))
        return ((d = on(d, p.mode, h, null)), (d.return = p), d);
      il(p, d);
    }
    return null;
  }
  function g(p, d, h, w) {
    var _ = d !== null ? d.key : null;
    if ((typeof h == "string" && h !== "") || typeof h == "number")
      return _ !== null ? null : a(p, d, "" + h, w);
    if (typeof h == "object" && h !== null) {
      switch (h.$$typeof) {
        case Yr:
          return h.key === _ ? u(p, d, h, w) : null;
        case vn:
          return h.key === _ ? c(p, d, h, w) : null;
        case Lt:
          return ((_ = h._init), g(p, d, _(h._payload), w));
      }
      if (dr(h) || Xn(h)) return _ !== null ? null : m(p, d, h, w, null);
      il(p, h);
    }
    return null;
  }
  function S(p, d, h, w, _) {
    if ((typeof w == "string" && w !== "") || typeof w == "number")
      return ((p = p.get(h) || null), a(d, p, "" + w, _));
    if (typeof w == "object" && w !== null) {
      switch (w.$$typeof) {
        case Yr:
          return (
            (p = p.get(w.key === null ? h : w.key) || null),
            u(d, p, w, _)
          );
        case vn:
          return (
            (p = p.get(w.key === null ? h : w.key) || null),
            c(d, p, w, _)
          );
        case Lt:
          var E = w._init;
          return S(p, d, h, E(w._payload), _);
      }
      if (dr(w) || Xn(w)) return ((p = p.get(h) || null), m(d, p, w, _, null));
      il(d, w);
    }
    return null;
  }
  function y(p, d, h, w) {
    for (
      var _ = null, E = null, C = d, v = (d = 0), N = null;
      C !== null && v < h.length;
      v++
    ) {
      C.index > v ? ((N = C), (C = null)) : (N = C.sibling);
      var z = g(p, C, h[v], w);
      if (z === null) {
        C === null && (C = N);
        break;
      }
      (e && C && z.alternate === null && t(p, C),
        (d = o(z, d, v)),
        E === null ? (_ = z) : (E.sibling = z),
        (E = z),
        (C = N));
    }
    if (v === h.length) return (n(p, C), ee && qt(p, v), _);
    if (C === null) {
      for (; v < h.length; v++)
        ((C = f(p, h[v], w)),
          C !== null &&
            ((d = o(C, d, v)),
            E === null ? (_ = C) : (E.sibling = C),
            (E = C)));
      return (ee && qt(p, v), _);
    }
    for (C = r(p, C); v < h.length; v++)
      ((N = S(C, p, v, h[v], w)),
        N !== null &&
          (e && N.alternate !== null && C.delete(N.key === null ? v : N.key),
          (d = o(N, d, v)),
          E === null ? (_ = N) : (E.sibling = N),
          (E = N)));
    return (
      e &&
        C.forEach(function (R) {
          return t(p, R);
        }),
      ee && qt(p, v),
      _
    );
  }
  function k(p, d, h, w) {
    var _ = Xn(h);
    if (typeof _ != "function") throw Error(L(150));
    if (((h = _.call(h)), h == null)) throw Error(L(151));
    for (
      var E = (_ = null), C = d, v = (d = 0), N = null, z = h.next();
      C !== null && !z.done;
      v++, z = h.next()
    ) {
      C.index > v ? ((N = C), (C = null)) : (N = C.sibling);
      var R = g(p, C, z.value, w);
      if (R === null) {
        C === null && (C = N);
        break;
      }
      (e && C && R.alternate === null && t(p, C),
        (d = o(R, d, v)),
        E === null ? (_ = R) : (E.sibling = R),
        (E = R),
        (C = N));
    }
    if (z.done) return (n(p, C), ee && qt(p, v), _);
    if (C === null) {
      for (; !z.done; v++, z = h.next())
        ((z = f(p, z.value, w)),
          z !== null &&
            ((d = o(z, d, v)),
            E === null ? (_ = z) : (E.sibling = z),
            (E = z)));
      return (ee && qt(p, v), _);
    }
    for (C = r(p, C); !z.done; v++, z = h.next())
      ((z = S(C, p, v, z.value, w)),
        z !== null &&
          (e && z.alternate !== null && C.delete(z.key === null ? v : z.key),
          (d = o(z, d, v)),
          E === null ? (_ = z) : (E.sibling = z),
          (E = z)));
    return (
      e &&
        C.forEach(function (W) {
          return t(p, W);
        }),
      ee && qt(p, v),
      _
    );
  }
  function j(p, d, h, w) {
    if (
      (typeof h == "object" &&
        h !== null &&
        h.type === xn &&
        h.key === null &&
        (h = h.props.children),
      typeof h == "object" && h !== null)
    ) {
      switch (h.$$typeof) {
        case Yr:
          e: {
            for (var _ = h.key, E = d; E !== null; ) {
              if (E.key === _) {
                if (((_ = h.type), _ === xn)) {
                  if (E.tag === 7) {
                    (n(p, E.sibling),
                      (d = l(E, h.props.children)),
                      (d.return = p),
                      (p = d));
                    break e;
                  }
                } else if (
                  E.elementType === _ ||
                  (typeof _ == "object" &&
                    _ !== null &&
                    _.$$typeof === Lt &&
                    Va(_) === E.type)
                ) {
                  (n(p, E.sibling),
                    (d = l(E, h.props)),
                    (d.ref = tr(p, E, h)),
                    (d.return = p),
                    (p = d));
                  break e;
                }
                n(p, E);
                break;
              } else t(p, E);
              E = E.sibling;
            }
            h.type === xn
              ? ((d = on(h.props.children, p.mode, w, h.key)),
                (d.return = p),
                (p = d))
              : ((w = bl(h.type, h.key, h.props, null, p.mode, w)),
                (w.ref = tr(p, d, h)),
                (w.return = p),
                (p = w));
          }
          return s(p);
        case vn:
          e: {
            for (E = h.key; d !== null; ) {
              if (d.key === E)
                if (
                  d.tag === 4 &&
                  d.stateNode.containerInfo === h.containerInfo &&
                  d.stateNode.implementation === h.implementation
                ) {
                  (n(p, d.sibling),
                    (d = l(d, h.children || [])),
                    (d.return = p),
                    (p = d));
                  break e;
                } else {
                  n(p, d);
                  break;
                }
              else t(p, d);
              d = d.sibling;
            }
            ((d = Jo(h, p.mode, w)), (d.return = p), (p = d));
          }
          return s(p);
        case Lt:
          return ((E = h._init), j(p, d, E(h._payload), w));
      }
      if (dr(h)) return y(p, d, h, w);
      if (Xn(h)) return k(p, d, h, w);
      il(p, h);
    }
    return (typeof h == "string" && h !== "") || typeof h == "number"
      ? ((h = "" + h),
        d !== null && d.tag === 6
          ? (n(p, d.sibling), (d = l(d, h)), (d.return = p), (p = d))
          : (n(p, d), (d = Qo(h, p.mode, w)), (d.return = p), (p = d)),
        s(p))
      : n(p, d);
  }
  return j;
}
var Bn = nd(!0),
  rd = nd(!1),
  Al = Gt(null),
  Ul = null,
  En = null,
  ks = null;
function js() {
  ks = En = Ul = null;
}
function _s(e) {
  var t = Al.current;
  (q(Al), (e._currentValue = t));
}
function bi(e, t, n) {
  for (; e !== null; ) {
    var r = e.alternate;
    if (
      ((e.childLanes & t) !== t
        ? ((e.childLanes |= t), r !== null && (r.childLanes |= t))
        : r !== null && (r.childLanes & t) !== t && (r.childLanes |= t),
      e === n)
    )
      break;
    e = e.return;
  }
}
function Tn(e, t) {
  ((Ul = e),
    (ks = En = null),
    (e = e.dependencies),
    e !== null &&
      e.firstContext !== null &&
      (e.lanes & t && (Re = !0), (e.firstContext = null)));
}
function Qe(e) {
  var t = e._currentValue;
  if (ks !== e)
    if (((e = { context: e, memoizedValue: t, next: null }), En === null)) {
      if (Ul === null) throw Error(L(308));
      ((En = e), (Ul.dependencies = { lanes: 0, firstContext: e }));
    } else En = En.next = e;
  return t;
}
var nn = null;
function Cs(e) {
  nn === null ? (nn = [e]) : nn.push(e);
}
function ld(e, t, n, r) {
  var l = t.interleaved;
  return (
    l === null ? ((n.next = n), Cs(t)) : ((n.next = l.next), (l.next = n)),
    (t.interleaved = n),
    St(e, r)
  );
}
function St(e, t) {
  e.lanes |= t;
  var n = e.alternate;
  for (n !== null && (n.lanes |= t), n = e, e = e.return; e !== null; )
    ((e.childLanes |= t),
      (n = e.alternate),
      n !== null && (n.childLanes |= t),
      (n = e),
      (e = e.return));
  return n.tag === 3 ? n.stateNode : null;
}
var Tt = !1;
function Es(e) {
  e.updateQueue = {
    baseState: e.memoizedState,
    firstBaseUpdate: null,
    lastBaseUpdate: null,
    shared: { pending: null, interleaved: null, lanes: 0 },
    effects: null,
  };
}
function od(e, t) {
  ((e = e.updateQueue),
    t.updateQueue === e &&
      (t.updateQueue = {
        baseState: e.baseState,
        firstBaseUpdate: e.firstBaseUpdate,
        lastBaseUpdate: e.lastBaseUpdate,
        shared: e.shared,
        effects: e.effects,
      }));
}
function vt(e, t) {
  return {
    eventTime: e,
    lane: t,
    tag: 0,
    payload: null,
    callback: null,
    next: null,
  };
}
function Wt(e, t, n) {
  var r = e.updateQueue;
  if (r === null) return null;
  if (((r = r.shared), K & 2)) {
    var l = r.pending;
    return (
      l === null ? (t.next = t) : ((t.next = l.next), (l.next = t)),
      (r.pending = t),
      St(e, n)
    );
  }
  return (
    (l = r.interleaved),
    l === null ? ((t.next = t), Cs(r)) : ((t.next = l.next), (l.next = t)),
    (r.interleaved = t),
    St(e, n)
  );
}
function wl(e, t, n) {
  if (
    ((t = t.updateQueue), t !== null && ((t = t.shared), (n & 4194240) !== 0))
  ) {
    var r = t.lanes;
    ((r &= e.pendingLanes), (n |= r), (t.lanes = n), ds(e, n));
  }
}
function Ka(e, t) {
  var n = e.updateQueue,
    r = e.alternate;
  if (r !== null && ((r = r.updateQueue), n === r)) {
    var l = null,
      o = null;
    if (((n = n.firstBaseUpdate), n !== null)) {
      do {
        var s = {
          eventTime: n.eventTime,
          lane: n.lane,
          tag: n.tag,
          payload: n.payload,
          callback: n.callback,
          next: null,
        };
        (o === null ? (l = o = s) : (o = o.next = s), (n = n.next));
      } while (n !== null);
      o === null ? (l = o = t) : (o = o.next = t);
    } else l = o = t;
    ((n = {
      baseState: r.baseState,
      firstBaseUpdate: l,
      lastBaseUpdate: o,
      shared: r.shared,
      effects: r.effects,
    }),
      (e.updateQueue = n));
    return;
  }
  ((e = n.lastBaseUpdate),
    e === null ? (n.firstBaseUpdate = t) : (e.next = t),
    (n.lastBaseUpdate = t));
}
function Wl(e, t, n, r) {
  var l = e.updateQueue;
  Tt = !1;
  var o = l.firstBaseUpdate,
    s = l.lastBaseUpdate,
    a = l.shared.pending;
  if (a !== null) {
    l.shared.pending = null;
    var u = a,
      c = u.next;
    ((u.next = null), s === null ? (o = c) : (s.next = c), (s = u));
    var m = e.alternate;
    m !== null &&
      ((m = m.updateQueue),
      (a = m.lastBaseUpdate),
      a !== s &&
        (a === null ? (m.firstBaseUpdate = c) : (a.next = c),
        (m.lastBaseUpdate = u)));
  }
  if (o !== null) {
    var f = l.baseState;
    ((s = 0), (m = c = u = null), (a = o));
    do {
      var g = a.lane,
        S = a.eventTime;
      if ((r & g) === g) {
        m !== null &&
          (m = m.next =
            {
              eventTime: S,
              lane: 0,
              tag: a.tag,
              payload: a.payload,
              callback: a.callback,
              next: null,
            });
        e: {
          var y = e,
            k = a;
          switch (((g = t), (S = n), k.tag)) {
            case 1:
              if (((y = k.payload), typeof y == "function")) {
                f = y.call(S, f, g);
                break e;
              }
              f = y;
              break e;
            case 3:
              y.flags = (y.flags & -65537) | 128;
            case 0:
              if (
                ((y = k.payload),
                (g = typeof y == "function" ? y.call(S, f, g) : y),
                g == null)
              )
                break e;
              f = oe({}, f, g);
              break e;
            case 2:
              Tt = !0;
          }
        }
        a.callback !== null &&
          a.lane !== 0 &&
          ((e.flags |= 64),
          (g = l.effects),
          g === null ? (l.effects = [a]) : g.push(a));
      } else
        ((S = {
          eventTime: S,
          lane: g,
          tag: a.tag,
          payload: a.payload,
          callback: a.callback,
          next: null,
        }),
          m === null ? ((c = m = S), (u = f)) : (m = m.next = S),
          (s |= g));
      if (((a = a.next), a === null)) {
        if (((a = l.shared.pending), a === null)) break;
        ((g = a),
          (a = g.next),
          (g.next = null),
          (l.lastBaseUpdate = g),
          (l.shared.pending = null));
      }
    } while (!0);
    if (
      (m === null && (u = f),
      (l.baseState = u),
      (l.firstBaseUpdate = c),
      (l.lastBaseUpdate = m),
      (t = l.shared.interleaved),
      t !== null)
    ) {
      l = t;
      do ((s |= l.lane), (l = l.next));
      while (l !== t);
    } else o === null && (l.shared.lanes = 0);
    ((cn |= s), (e.lanes = s), (e.memoizedState = f));
  }
}
function Qa(e, t, n) {
  if (((e = t.effects), (t.effects = null), e !== null))
    for (t = 0; t < e.length; t++) {
      var r = e[t],
        l = r.callback;
      if (l !== null) {
        if (((r.callback = null), (r = n), typeof l != "function"))
          throw Error(L(191, l));
        l.call(r);
      }
    }
}
var Kr = {},
  ut = Gt(Kr),
  Mr = Gt(Kr),
  Ir = Gt(Kr);
function rn(e) {
  if (e === Kr) throw Error(L(174));
  return e;
}
function bs(e, t) {
  switch ((X(Ir, t), X(Mr, e), X(ut, Kr), (e = t.nodeType), e)) {
    case 9:
    case 11:
      t = (t = t.documentElement) ? t.namespaceURI : si(null, "");
      break;
    default:
      ((e = e === 8 ? t.parentNode : t),
        (t = e.namespaceURI || null),
        (e = e.tagName),
        (t = si(t, e)));
  }
  (q(ut), X(ut, t));
}
function On() {
  (q(ut), q(Mr), q(Ir));
}
function id(e) {
  rn(Ir.current);
  var t = rn(ut.current),
    n = si(t, e.type);
  t !== n && (X(Mr, e), X(ut, n));
}
function zs(e) {
  Mr.current === e && (q(ut), q(Mr));
}
var ne = Gt(0);
function Hl(e) {
  for (var t = e; t !== null; ) {
    if (t.tag === 13) {
      var n = t.memoizedState;
      if (
        n !== null &&
        ((n = n.dehydrated), n === null || n.data === "$?" || n.data === "$!")
      )
        return t;
    } else if (t.tag === 19 && t.memoizedProps.revealOrder !== void 0) {
      if (t.flags & 128) return t;
    } else if (t.child !== null) {
      ((t.child.return = t), (t = t.child));
      continue;
    }
    if (t === e) break;
    for (; t.sibling === null; ) {
      if (t.return === null || t.return === e) return null;
      t = t.return;
    }
    ((t.sibling.return = t.return), (t = t.sibling));
  }
  return null;
}
var Ao = [];
function Ps() {
  for (var e = 0; e < Ao.length; e++)
    Ao[e]._workInProgressVersionPrimary = null;
  Ao.length = 0;
}
var kl = kt.ReactCurrentDispatcher,
  Uo = kt.ReactCurrentBatchConfig,
  un = 0,
  re = null,
  ce = null,
  fe = null,
  Vl = !1,
  yr = !1,
  Fr = 0,
  Bh = 0;
function Se() {
  throw Error(L(321));
}
function Ns(e, t) {
  if (t === null) return !1;
  for (var n = 0; n < t.length && n < e.length; n++)
    if (!nt(e[n], t[n])) return !1;
  return !0;
}
function Rs(e, t, n, r, l, o) {
  if (
    ((un = o),
    (re = t),
    (t.memoizedState = null),
    (t.updateQueue = null),
    (t.lanes = 0),
    (kl.current = e === null || e.memoizedState === null ? Uh : Wh),
    (e = n(r, l)),
    yr)
  ) {
    o = 0;
    do {
      if (((yr = !1), (Fr = 0), 25 <= o)) throw Error(L(301));
      ((o += 1),
        (fe = ce = null),
        (t.updateQueue = null),
        (kl.current = Hh),
        (e = n(r, l)));
    } while (yr);
  }
  if (
    ((kl.current = Kl),
    (t = ce !== null && ce.next !== null),
    (un = 0),
    (fe = ce = re = null),
    (Vl = !1),
    t)
  )
    throw Error(L(300));
  return e;
}
function Ls() {
  var e = Fr !== 0;
  return ((Fr = 0), e);
}
function it() {
  var e = {
    memoizedState: null,
    baseState: null,
    baseQueue: null,
    queue: null,
    next: null,
  };
  return (fe === null ? (re.memoizedState = fe = e) : (fe = fe.next = e), fe);
}
function Je() {
  if (ce === null) {
    var e = re.alternate;
    e = e !== null ? e.memoizedState : null;
  } else e = ce.next;
  var t = fe === null ? re.memoizedState : fe.next;
  if (t !== null) ((fe = t), (ce = e));
  else {
    if (e === null) throw Error(L(310));
    ((ce = e),
      (e = {
        memoizedState: ce.memoizedState,
        baseState: ce.baseState,
        baseQueue: ce.baseQueue,
        queue: ce.queue,
        next: null,
      }),
      fe === null ? (re.memoizedState = fe = e) : (fe = fe.next = e));
  }
  return fe;
}
function Dr(e, t) {
  return typeof t == "function" ? t(e) : t;
}
function Wo(e) {
  var t = Je(),
    n = t.queue;
  if (n === null) throw Error(L(311));
  n.lastRenderedReducer = e;
  var r = ce,
    l = r.baseQueue,
    o = n.pending;
  if (o !== null) {
    if (l !== null) {
      var s = l.next;
      ((l.next = o.next), (o.next = s));
    }
    ((r.baseQueue = l = o), (n.pending = null));
  }
  if (l !== null) {
    ((o = l.next), (r = r.baseState));
    var a = (s = null),
      u = null,
      c = o;
    do {
      var m = c.lane;
      if ((un & m) === m)
        (u !== null &&
          (u = u.next =
            {
              lane: 0,
              action: c.action,
              hasEagerState: c.hasEagerState,
              eagerState: c.eagerState,
              next: null,
            }),
          (r = c.hasEagerState ? c.eagerState : e(r, c.action)));
      else {
        var f = {
          lane: m,
          action: c.action,
          hasEagerState: c.hasEagerState,
          eagerState: c.eagerState,
          next: null,
        };
        (u === null ? ((a = u = f), (s = r)) : (u = u.next = f),
          (re.lanes |= m),
          (cn |= m));
      }
      c = c.next;
    } while (c !== null && c !== o);
    (u === null ? (s = r) : (u.next = a),
      nt(r, t.memoizedState) || (Re = !0),
      (t.memoizedState = r),
      (t.baseState = s),
      (t.baseQueue = u),
      (n.lastRenderedState = r));
  }
  if (((e = n.interleaved), e !== null)) {
    l = e;
    do ((o = l.lane), (re.lanes |= o), (cn |= o), (l = l.next));
    while (l !== e);
  } else l === null && (n.lanes = 0);
  return [t.memoizedState, n.dispatch];
}
function Ho(e) {
  var t = Je(),
    n = t.queue;
  if (n === null) throw Error(L(311));
  n.lastRenderedReducer = e;
  var r = n.dispatch,
    l = n.pending,
    o = t.memoizedState;
  if (l !== null) {
    n.pending = null;
    var s = (l = l.next);
    do ((o = e(o, s.action)), (s = s.next));
    while (s !== l);
    (nt(o, t.memoizedState) || (Re = !0),
      (t.memoizedState = o),
      t.baseQueue === null && (t.baseState = o),
      (n.lastRenderedState = o));
  }
  return [o, r];
}
function sd() {}
function ad(e, t) {
  var n = re,
    r = Je(),
    l = t(),
    o = !nt(r.memoizedState, l);
  if (
    (o && ((r.memoizedState = l), (Re = !0)),
    (r = r.queue),
    Ts(dd.bind(null, n, r, e), [e]),
    r.getSnapshot !== t || o || (fe !== null && fe.memoizedState.tag & 1))
  ) {
    if (
      ((n.flags |= 2048),
      Br(9, cd.bind(null, n, r, l, t), void 0, null),
      pe === null)
    )
      throw Error(L(349));
    un & 30 || ud(n, t, l);
  }
  return l;
}
function ud(e, t, n) {
  ((e.flags |= 16384),
    (e = { getSnapshot: t, value: n }),
    (t = re.updateQueue),
    t === null
      ? ((t = { lastEffect: null, stores: null }),
        (re.updateQueue = t),
        (t.stores = [e]))
      : ((n = t.stores), n === null ? (t.stores = [e]) : n.push(e)));
}
function cd(e, t, n, r) {
  ((t.value = n), (t.getSnapshot = r), fd(t) && pd(e));
}
function dd(e, t, n) {
  return n(function () {
    fd(t) && pd(e);
  });
}
function fd(e) {
  var t = e.getSnapshot;
  e = e.value;
  try {
    var n = t();
    return !nt(e, n);
  } catch {
    return !0;
  }
}
function pd(e) {
  var t = St(e, 1);
  t !== null && tt(t, e, 1, -1);
}
function Ja(e) {
  var t = it();
  return (
    typeof e == "function" && (e = e()),
    (t.memoizedState = t.baseState = e),
    (e = {
      pending: null,
      interleaved: null,
      lanes: 0,
      dispatch: null,
      lastRenderedReducer: Dr,
      lastRenderedState: e,
    }),
    (t.queue = e),
    (e = e.dispatch = Ah.bind(null, re, e)),
    [t.memoizedState, e]
  );
}
function Br(e, t, n, r) {
  return (
    (e = { tag: e, create: t, destroy: n, deps: r, next: null }),
    (t = re.updateQueue),
    t === null
      ? ((t = { lastEffect: null, stores: null }),
        (re.updateQueue = t),
        (t.lastEffect = e.next = e))
      : ((n = t.lastEffect),
        n === null
          ? (t.lastEffect = e.next = e)
          : ((r = n.next), (n.next = e), (e.next = r), (t.lastEffect = e))),
    e
  );
}
function hd() {
  return Je().memoizedState;
}
function jl(e, t, n, r) {
  var l = it();
  ((re.flags |= e),
    (l.memoizedState = Br(1 | t, n, void 0, r === void 0 ? null : r)));
}
function so(e, t, n, r) {
  var l = Je();
  r = r === void 0 ? null : r;
  var o = void 0;
  if (ce !== null) {
    var s = ce.memoizedState;
    if (((o = s.destroy), r !== null && Ns(r, s.deps))) {
      l.memoizedState = Br(t, n, o, r);
      return;
    }
  }
  ((re.flags |= e), (l.memoizedState = Br(1 | t, n, o, r)));
}
function Ya(e, t) {
  return jl(8390656, 8, e, t);
}
function Ts(e, t) {
  return so(2048, 8, e, t);
}
function md(e, t) {
  return so(4, 2, e, t);
}
function gd(e, t) {
  return so(4, 4, e, t);
}
function vd(e, t) {
  if (typeof t == "function")
    return (
      (e = e()),
      t(e),
      function () {
        t(null);
      }
    );
  if (t != null)
    return (
      (e = e()),
      (t.current = e),
      function () {
        t.current = null;
      }
    );
}
function xd(e, t, n) {
  return (
    (n = n != null ? n.concat([e]) : null),
    so(4, 4, vd.bind(null, t, e), n)
  );
}
function Ms() {}
function yd(e, t) {
  var n = Je();
  t = t === void 0 ? null : t;
  var r = n.memoizedState;
  return r !== null && t !== null && Ns(t, r[1])
    ? r[0]
    : ((n.memoizedState = [e, t]), e);
}
function Sd(e, t) {
  var n = Je();
  t = t === void 0 ? null : t;
  var r = n.memoizedState;
  return r !== null && t !== null && Ns(t, r[1])
    ? r[0]
    : ((e = e()), (n.memoizedState = [e, t]), e);
}
function wd(e, t, n) {
  return un & 21
    ? (nt(n, t) || ((n = Ec()), (re.lanes |= n), (cn |= n), (e.baseState = !0)),
      t)
    : (e.baseState && ((e.baseState = !1), (Re = !0)), (e.memoizedState = n));
}
function Oh(e, t) {
  var n = J;
  ((J = n !== 0 && 4 > n ? n : 4), e(!0));
  var r = Uo.transition;
  Uo.transition = {};
  try {
    (e(!1), t());
  } finally {
    ((J = n), (Uo.transition = r));
  }
}
function kd() {
  return Je().memoizedState;
}
function $h(e, t, n) {
  var r = Vt(e);
  if (
    ((n = {
      lane: r,
      action: n,
      hasEagerState: !1,
      eagerState: null,
      next: null,
    }),
    jd(e))
  )
    _d(t, n);
  else if (((n = ld(e, t, n, r)), n !== null)) {
    var l = Ce();
    (tt(n, e, r, l), Cd(n, t, r));
  }
}
function Ah(e, t, n) {
  var r = Vt(e),
    l = { lane: r, action: n, hasEagerState: !1, eagerState: null, next: null };
  if (jd(e)) _d(t, l);
  else {
    var o = e.alternate;
    if (
      e.lanes === 0 &&
      (o === null || o.lanes === 0) &&
      ((o = t.lastRenderedReducer), o !== null)
    )
      try {
        var s = t.lastRenderedState,
          a = o(s, n);
        if (((l.hasEagerState = !0), (l.eagerState = a), nt(a, s))) {
          var u = t.interleaved;
          (u === null
            ? ((l.next = l), Cs(t))
            : ((l.next = u.next), (u.next = l)),
            (t.interleaved = l));
          return;
        }
      } catch {
      } finally {
      }
    ((n = ld(e, t, l, r)),
      n !== null && ((l = Ce()), tt(n, e, r, l), Cd(n, t, r)));
  }
}
function jd(e) {
  var t = e.alternate;
  return e === re || (t !== null && t === re);
}
function _d(e, t) {
  yr = Vl = !0;
  var n = e.pending;
  (n === null ? (t.next = t) : ((t.next = n.next), (n.next = t)),
    (e.pending = t));
}
function Cd(e, t, n) {
  if (n & 4194240) {
    var r = t.lanes;
    ((r &= e.pendingLanes), (n |= r), (t.lanes = n), ds(e, n));
  }
}
var Kl = {
    readContext: Qe,
    useCallback: Se,
    useContext: Se,
    useEffect: Se,
    useImperativeHandle: Se,
    useInsertionEffect: Se,
    useLayoutEffect: Se,
    useMemo: Se,
    useReducer: Se,
    useRef: Se,
    useState: Se,
    useDebugValue: Se,
    useDeferredValue: Se,
    useTransition: Se,
    useMutableSource: Se,
    useSyncExternalStore: Se,
    useId: Se,
    unstable_isNewReconciler: !1,
  },
  Uh = {
    readContext: Qe,
    useCallback: function (e, t) {
      return ((it().memoizedState = [e, t === void 0 ? null : t]), e);
    },
    useContext: Qe,
    useEffect: Ya,
    useImperativeHandle: function (e, t, n) {
      return (
        (n = n != null ? n.concat([e]) : null),
        jl(4194308, 4, vd.bind(null, t, e), n)
      );
    },
    useLayoutEffect: function (e, t) {
      return jl(4194308, 4, e, t);
    },
    useInsertionEffect: function (e, t) {
      return jl(4, 2, e, t);
    },
    useMemo: function (e, t) {
      var n = it();
      return (
        (t = t === void 0 ? null : t),
        (e = e()),
        (n.memoizedState = [e, t]),
        e
      );
    },
    useReducer: function (e, t, n) {
      var r = it();
      return (
        (t = n !== void 0 ? n(t) : t),
        (r.memoizedState = r.baseState = t),
        (e = {
          pending: null,
          interleaved: null,
          lanes: 0,
          dispatch: null,
          lastRenderedReducer: e,
          lastRenderedState: t,
        }),
        (r.queue = e),
        (e = e.dispatch = $h.bind(null, re, e)),
        [r.memoizedState, e]
      );
    },
    useRef: function (e) {
      var t = it();
      return ((e = { current: e }), (t.memoizedState = e));
    },
    useState: Ja,
    useDebugValue: Ms,
    useDeferredValue: function (e) {
      return (it().memoizedState = e);
    },
    useTransition: function () {
      var e = Ja(!1),
        t = e[0];
      return ((e = Oh.bind(null, e[1])), (it().memoizedState = e), [t, e]);
    },
    useMutableSource: function () {},
    useSyncExternalStore: function (e, t, n) {
      var r = re,
        l = it();
      if (ee) {
        if (n === void 0) throw Error(L(407));
        n = n();
      } else {
        if (((n = t()), pe === null)) throw Error(L(349));
        un & 30 || ud(r, t, n);
      }
      l.memoizedState = n;
      var o = { value: n, getSnapshot: t };
      return (
        (l.queue = o),
        Ya(dd.bind(null, r, o, e), [e]),
        (r.flags |= 2048),
        Br(9, cd.bind(null, r, o, n, t), void 0, null),
        n
      );
    },
    useId: function () {
      var e = it(),
        t = pe.identifierPrefix;
      if (ee) {
        var n = gt,
          r = mt;
        ((n = (r & ~(1 << (32 - et(r) - 1))).toString(32) + n),
          (t = ":" + t + "R" + n),
          (n = Fr++),
          0 < n && (t += "H" + n.toString(32)),
          (t += ":"));
      } else ((n = Bh++), (t = ":" + t + "r" + n.toString(32) + ":"));
      return (e.memoizedState = t);
    },
    unstable_isNewReconciler: !1,
  },
  Wh = {
    readContext: Qe,
    useCallback: yd,
    useContext: Qe,
    useEffect: Ts,
    useImperativeHandle: xd,
    useInsertionEffect: md,
    useLayoutEffect: gd,
    useMemo: Sd,
    useReducer: Wo,
    useRef: hd,
    useState: function () {
      return Wo(Dr);
    },
    useDebugValue: Ms,
    useDeferredValue: function (e) {
      var t = Je();
      return wd(t, ce.memoizedState, e);
    },
    useTransition: function () {
      var e = Wo(Dr)[0],
        t = Je().memoizedState;
      return [e, t];
    },
    useMutableSource: sd,
    useSyncExternalStore: ad,
    useId: kd,
    unstable_isNewReconciler: !1,
  },
  Hh = {
    readContext: Qe,
    useCallback: yd,
    useContext: Qe,
    useEffect: Ts,
    useImperativeHandle: xd,
    useInsertionEffect: md,
    useLayoutEffect: gd,
    useMemo: Sd,
    useReducer: Ho,
    useRef: hd,
    useState: function () {
      return Ho(Dr);
    },
    useDebugValue: Ms,
    useDeferredValue: function (e) {
      var t = Je();
      return ce === null ? (t.memoizedState = e) : wd(t, ce.memoizedState, e);
    },
    useTransition: function () {
      var e = Ho(Dr)[0],
        t = Je().memoizedState;
      return [e, t];
    },
    useMutableSource: sd,
    useSyncExternalStore: ad,
    useId: kd,
    unstable_isNewReconciler: !1,
  };
function Ge(e, t) {
  if (e && e.defaultProps) {
    ((t = oe({}, t)), (e = e.defaultProps));
    for (var n in e) t[n] === void 0 && (t[n] = e[n]);
    return t;
  }
  return t;
}
function zi(e, t, n, r) {
  ((t = e.memoizedState),
    (n = n(r, t)),
    (n = n == null ? t : oe({}, t, n)),
    (e.memoizedState = n),
    e.lanes === 0 && (e.updateQueue.baseState = n));
}
var ao = {
  isMounted: function (e) {
    return (e = e._reactInternals) ? hn(e) === e : !1;
  },
  enqueueSetState: function (e, t, n) {
    e = e._reactInternals;
    var r = Ce(),
      l = Vt(e),
      o = vt(r, l);
    ((o.payload = t),
      n != null && (o.callback = n),
      (t = Wt(e, o, l)),
      t !== null && (tt(t, e, l, r), wl(t, e, l)));
  },
  enqueueReplaceState: function (e, t, n) {
    e = e._reactInternals;
    var r = Ce(),
      l = Vt(e),
      o = vt(r, l);
    ((o.tag = 1),
      (o.payload = t),
      n != null && (o.callback = n),
      (t = Wt(e, o, l)),
      t !== null && (tt(t, e, l, r), wl(t, e, l)));
  },
  enqueueForceUpdate: function (e, t) {
    e = e._reactInternals;
    var n = Ce(),
      r = Vt(e),
      l = vt(n, r);
    ((l.tag = 2),
      t != null && (l.callback = t),
      (t = Wt(e, l, r)),
      t !== null && (tt(t, e, r, n), wl(t, e, r)));
  },
};
function Xa(e, t, n, r, l, o, s) {
  return (
    (e = e.stateNode),
    typeof e.shouldComponentUpdate == "function"
      ? e.shouldComponentUpdate(r, o, s)
      : t.prototype && t.prototype.isPureReactComponent
        ? !Nr(n, r) || !Nr(l, o)
        : !0
  );
}
function Ed(e, t, n) {
  var r = !1,
    l = Yt,
    o = t.contextType;
  return (
    typeof o == "object" && o !== null
      ? (o = Qe(o))
      : ((l = Me(t) ? sn : je.current),
        (r = t.contextTypes),
        (o = (r = r != null) ? Fn(e, l) : Yt)),
    (t = new t(n, o)),
    (e.memoizedState = t.state !== null && t.state !== void 0 ? t.state : null),
    (t.updater = ao),
    (e.stateNode = t),
    (t._reactInternals = e),
    r &&
      ((e = e.stateNode),
      (e.__reactInternalMemoizedUnmaskedChildContext = l),
      (e.__reactInternalMemoizedMaskedChildContext = o)),
    t
  );
}
function Ga(e, t, n, r) {
  ((e = t.state),
    typeof t.componentWillReceiveProps == "function" &&
      t.componentWillReceiveProps(n, r),
    typeof t.UNSAFE_componentWillReceiveProps == "function" &&
      t.UNSAFE_componentWillReceiveProps(n, r),
    t.state !== e && ao.enqueueReplaceState(t, t.state, null));
}
function Pi(e, t, n, r) {
  var l = e.stateNode;
  ((l.props = n), (l.state = e.memoizedState), (l.refs = {}), Es(e));
  var o = t.contextType;
  (typeof o == "object" && o !== null
    ? (l.context = Qe(o))
    : ((o = Me(t) ? sn : je.current), (l.context = Fn(e, o))),
    (l.state = e.memoizedState),
    (o = t.getDerivedStateFromProps),
    typeof o == "function" && (zi(e, t, o, n), (l.state = e.memoizedState)),
    typeof t.getDerivedStateFromProps == "function" ||
      typeof l.getSnapshotBeforeUpdate == "function" ||
      (typeof l.UNSAFE_componentWillMount != "function" &&
        typeof l.componentWillMount != "function") ||
      ((t = l.state),
      typeof l.componentWillMount == "function" && l.componentWillMount(),
      typeof l.UNSAFE_componentWillMount == "function" &&
        l.UNSAFE_componentWillMount(),
      t !== l.state && ao.enqueueReplaceState(l, l.state, null),
      Wl(e, n, l, r),
      (l.state = e.memoizedState)),
    typeof l.componentDidMount == "function" && (e.flags |= 4194308));
}
function $n(e, t) {
  try {
    var n = "",
      r = t;
    do ((n += xp(r)), (r = r.return));
    while (r);
    var l = n;
  } catch (o) {
    l =
      `
Error generating stack: ` +
      o.message +
      `
` +
      o.stack;
  }
  return { value: e, source: t, stack: l, digest: null };
}
function Vo(e, t, n) {
  return { value: e, source: null, stack: n ?? null, digest: t ?? null };
}
function Ni(e, t) {
  try {
    console.error(t.value);
  } catch (n) {
    setTimeout(function () {
      throw n;
    });
  }
}
var Vh = typeof WeakMap == "function" ? WeakMap : Map;
function bd(e, t, n) {
  ((n = vt(-1, n)), (n.tag = 3), (n.payload = { element: null }));
  var r = t.value;
  return (
    (n.callback = function () {
      (Jl || ((Jl = !0), ($i = r)), Ni(e, t));
    }),
    n
  );
}
function zd(e, t, n) {
  ((n = vt(-1, n)), (n.tag = 3));
  var r = e.type.getDerivedStateFromError;
  if (typeof r == "function") {
    var l = t.value;
    ((n.payload = function () {
      return r(l);
    }),
      (n.callback = function () {
        Ni(e, t);
      }));
  }
  var o = e.stateNode;
  return (
    o !== null &&
      typeof o.componentDidCatch == "function" &&
      (n.callback = function () {
        (Ni(e, t),
          typeof r != "function" &&
            (Ht === null ? (Ht = new Set([this])) : Ht.add(this)));
        var s = t.stack;
        this.componentDidCatch(t.value, {
          componentStack: s !== null ? s : "",
        });
      }),
    n
  );
}
function Za(e, t, n) {
  var r = e.pingCache;
  if (r === null) {
    r = e.pingCache = new Vh();
    var l = new Set();
    r.set(t, l);
  } else ((l = r.get(t)), l === void 0 && ((l = new Set()), r.set(t, l)));
  l.has(n) || (l.add(n), (e = om.bind(null, e, t, n)), t.then(e, e));
}
function qa(e) {
  do {
    var t;
    if (
      ((t = e.tag === 13) &&
        ((t = e.memoizedState), (t = t !== null ? t.dehydrated !== null : !0)),
      t)
    )
      return e;
    e = e.return;
  } while (e !== null);
  return null;
}
function eu(e, t, n, r, l) {
  return e.mode & 1
    ? ((e.flags |= 65536), (e.lanes = l), e)
    : (e === t
        ? (e.flags |= 65536)
        : ((e.flags |= 128),
          (n.flags |= 131072),
          (n.flags &= -52805),
          n.tag === 1 &&
            (n.alternate === null
              ? (n.tag = 17)
              : ((t = vt(-1, 1)), (t.tag = 2), Wt(n, t, 1))),
          (n.lanes |= 1)),
      e);
}
var Kh = kt.ReactCurrentOwner,
  Re = !1;
function _e(e, t, n, r) {
  t.child = e === null ? rd(t, null, n, r) : Bn(t, e.child, n, r);
}
function tu(e, t, n, r, l) {
  n = n.render;
  var o = t.ref;
  return (
    Tn(t, l),
    (r = Rs(e, t, n, r, o, l)),
    (n = Ls()),
    e !== null && !Re
      ? ((t.updateQueue = e.updateQueue),
        (t.flags &= -2053),
        (e.lanes &= ~l),
        wt(e, t, l))
      : (ee && n && ys(t), (t.flags |= 1), _e(e, t, r, l), t.child)
  );
}
function nu(e, t, n, r, l) {
  if (e === null) {
    var o = n.type;
    return typeof o == "function" &&
      !Us(o) &&
      o.defaultProps === void 0 &&
      n.compare === null &&
      n.defaultProps === void 0
      ? ((t.tag = 15), (t.type = o), Pd(e, t, o, r, l))
      : ((e = bl(n.type, null, r, t, t.mode, l)),
        (e.ref = t.ref),
        (e.return = t),
        (t.child = e));
  }
  if (((o = e.child), !(e.lanes & l))) {
    var s = o.memoizedProps;
    if (
      ((n = n.compare), (n = n !== null ? n : Nr), n(s, r) && e.ref === t.ref)
    )
      return wt(e, t, l);
  }
  return (
    (t.flags |= 1),
    (e = Kt(o, r)),
    (e.ref = t.ref),
    (e.return = t),
    (t.child = e)
  );
}
function Pd(e, t, n, r, l) {
  if (e !== null) {
    var o = e.memoizedProps;
    if (Nr(o, r) && e.ref === t.ref)
      if (((Re = !1), (t.pendingProps = r = o), (e.lanes & l) !== 0))
        e.flags & 131072 && (Re = !0);
      else return ((t.lanes = e.lanes), wt(e, t, l));
  }
  return Ri(e, t, n, r, l);
}
function Nd(e, t, n) {
  var r = t.pendingProps,
    l = r.children,
    o = e !== null ? e.memoizedState : null;
  if (r.mode === "hidden")
    if (!(t.mode & 1))
      ((t.memoizedState = { baseLanes: 0, cachePool: null, transitions: null }),
        X(zn, Fe),
        (Fe |= n));
    else {
      if (!(n & 1073741824))
        return (
          (e = o !== null ? o.baseLanes | n : n),
          (t.lanes = t.childLanes = 1073741824),
          (t.memoizedState = {
            baseLanes: e,
            cachePool: null,
            transitions: null,
          }),
          (t.updateQueue = null),
          X(zn, Fe),
          (Fe |= e),
          null
        );
      ((t.memoizedState = { baseLanes: 0, cachePool: null, transitions: null }),
        (r = o !== null ? o.baseLanes : n),
        X(zn, Fe),
        (Fe |= r));
    }
  else
    (o !== null ? ((r = o.baseLanes | n), (t.memoizedState = null)) : (r = n),
      X(zn, Fe),
      (Fe |= r));
  return (_e(e, t, l, n), t.child);
}
function Rd(e, t) {
  var n = t.ref;
  ((e === null && n !== null) || (e !== null && e.ref !== n)) &&
    ((t.flags |= 512), (t.flags |= 2097152));
}
function Ri(e, t, n, r, l) {
  var o = Me(n) ? sn : je.current;
  return (
    (o = Fn(t, o)),
    Tn(t, l),
    (n = Rs(e, t, n, r, o, l)),
    (r = Ls()),
    e !== null && !Re
      ? ((t.updateQueue = e.updateQueue),
        (t.flags &= -2053),
        (e.lanes &= ~l),
        wt(e, t, l))
      : (ee && r && ys(t), (t.flags |= 1), _e(e, t, n, l), t.child)
  );
}
function ru(e, t, n, r, l) {
  if (Me(n)) {
    var o = !0;
    Bl(t);
  } else o = !1;
  if ((Tn(t, l), t.stateNode === null))
    (_l(e, t), Ed(t, n, r), Pi(t, n, r, l), (r = !0));
  else if (e === null) {
    var s = t.stateNode,
      a = t.memoizedProps;
    s.props = a;
    var u = s.context,
      c = n.contextType;
    typeof c == "object" && c !== null
      ? (c = Qe(c))
      : ((c = Me(n) ? sn : je.current), (c = Fn(t, c)));
    var m = n.getDerivedStateFromProps,
      f =
        typeof m == "function" ||
        typeof s.getSnapshotBeforeUpdate == "function";
    (f ||
      (typeof s.UNSAFE_componentWillReceiveProps != "function" &&
        typeof s.componentWillReceiveProps != "function") ||
      ((a !== r || u !== c) && Ga(t, s, r, c)),
      (Tt = !1));
    var g = t.memoizedState;
    ((s.state = g),
      Wl(t, r, s, l),
      (u = t.memoizedState),
      a !== r || g !== u || Te.current || Tt
        ? (typeof m == "function" && (zi(t, n, m, r), (u = t.memoizedState)),
          (a = Tt || Xa(t, n, a, r, g, u, c))
            ? (f ||
                (typeof s.UNSAFE_componentWillMount != "function" &&
                  typeof s.componentWillMount != "function") ||
                (typeof s.componentWillMount == "function" &&
                  s.componentWillMount(),
                typeof s.UNSAFE_componentWillMount == "function" &&
                  s.UNSAFE_componentWillMount()),
              typeof s.componentDidMount == "function" && (t.flags |= 4194308))
            : (typeof s.componentDidMount == "function" && (t.flags |= 4194308),
              (t.memoizedProps = r),
              (t.memoizedState = u)),
          (s.props = r),
          (s.state = u),
          (s.context = c),
          (r = a))
        : (typeof s.componentDidMount == "function" && (t.flags |= 4194308),
          (r = !1)));
  } else {
    ((s = t.stateNode),
      od(e, t),
      (a = t.memoizedProps),
      (c = t.type === t.elementType ? a : Ge(t.type, a)),
      (s.props = c),
      (f = t.pendingProps),
      (g = s.context),
      (u = n.contextType),
      typeof u == "object" && u !== null
        ? (u = Qe(u))
        : ((u = Me(n) ? sn : je.current), (u = Fn(t, u))));
    var S = n.getDerivedStateFromProps;
    ((m =
      typeof S == "function" ||
      typeof s.getSnapshotBeforeUpdate == "function") ||
      (typeof s.UNSAFE_componentWillReceiveProps != "function" &&
        typeof s.componentWillReceiveProps != "function") ||
      ((a !== f || g !== u) && Ga(t, s, r, u)),
      (Tt = !1),
      (g = t.memoizedState),
      (s.state = g),
      Wl(t, r, s, l));
    var y = t.memoizedState;
    a !== f || g !== y || Te.current || Tt
      ? (typeof S == "function" && (zi(t, n, S, r), (y = t.memoizedState)),
        (c = Tt || Xa(t, n, c, r, g, y, u) || !1)
          ? (m ||
              (typeof s.UNSAFE_componentWillUpdate != "function" &&
                typeof s.componentWillUpdate != "function") ||
              (typeof s.componentWillUpdate == "function" &&
                s.componentWillUpdate(r, y, u),
              typeof s.UNSAFE_componentWillUpdate == "function" &&
                s.UNSAFE_componentWillUpdate(r, y, u)),
            typeof s.componentDidUpdate == "function" && (t.flags |= 4),
            typeof s.getSnapshotBeforeUpdate == "function" && (t.flags |= 1024))
          : (typeof s.componentDidUpdate != "function" ||
              (a === e.memoizedProps && g === e.memoizedState) ||
              (t.flags |= 4),
            typeof s.getSnapshotBeforeUpdate != "function" ||
              (a === e.memoizedProps && g === e.memoizedState) ||
              (t.flags |= 1024),
            (t.memoizedProps = r),
            (t.memoizedState = y)),
        (s.props = r),
        (s.state = y),
        (s.context = u),
        (r = c))
      : (typeof s.componentDidUpdate != "function" ||
          (a === e.memoizedProps && g === e.memoizedState) ||
          (t.flags |= 4),
        typeof s.getSnapshotBeforeUpdate != "function" ||
          (a === e.memoizedProps && g === e.memoizedState) ||
          (t.flags |= 1024),
        (r = !1));
  }
  return Li(e, t, n, r, o, l);
}
function Li(e, t, n, r, l, o) {
  Rd(e, t);
  var s = (t.flags & 128) !== 0;
  if (!r && !s) return (l && Ua(t, n, !1), wt(e, t, o));
  ((r = t.stateNode), (Kh.current = t));
  var a =
    s && typeof n.getDerivedStateFromError != "function" ? null : r.render();
  return (
    (t.flags |= 1),
    e !== null && s
      ? ((t.child = Bn(t, e.child, null, o)), (t.child = Bn(t, null, a, o)))
      : _e(e, t, a, o),
    (t.memoizedState = r.state),
    l && Ua(t, n, !0),
    t.child
  );
}
function Ld(e) {
  var t = e.stateNode;
  (t.pendingContext
    ? Aa(e, t.pendingContext, t.pendingContext !== t.context)
    : t.context && Aa(e, t.context, !1),
    bs(e, t.containerInfo));
}
function lu(e, t, n, r, l) {
  return (Dn(), ws(l), (t.flags |= 256), _e(e, t, n, r), t.child);
}
var Ti = { dehydrated: null, treeContext: null, retryLane: 0 };
function Mi(e) {
  return { baseLanes: e, cachePool: null, transitions: null };
}
function Td(e, t, n) {
  var r = t.pendingProps,
    l = ne.current,
    o = !1,
    s = (t.flags & 128) !== 0,
    a;
  if (
    ((a = s) ||
      (a = e !== null && e.memoizedState === null ? !1 : (l & 2) !== 0),
    a
      ? ((o = !0), (t.flags &= -129))
      : (e === null || e.memoizedState !== null) && (l |= 1),
    X(ne, l & 1),
    e === null)
  )
    return (
      Ei(t),
      (e = t.memoizedState),
      e !== null && ((e = e.dehydrated), e !== null)
        ? (t.mode & 1
            ? e.data === "$!"
              ? (t.lanes = 8)
              : (t.lanes = 1073741824)
            : (t.lanes = 1),
          null)
        : ((s = r.children),
          (e = r.fallback),
          o
            ? ((r = t.mode),
              (o = t.child),
              (s = { mode: "hidden", children: s }),
              !(r & 1) && o !== null
                ? ((o.childLanes = 0), (o.pendingProps = s))
                : (o = fo(s, r, 0, null)),
              (e = on(e, r, n, null)),
              (o.return = t),
              (e.return = t),
              (o.sibling = e),
              (t.child = o),
              (t.child.memoizedState = Mi(n)),
              (t.memoizedState = Ti),
              e)
            : Is(t, s))
    );
  if (((l = e.memoizedState), l !== null && ((a = l.dehydrated), a !== null)))
    return Qh(e, t, s, r, a, l, n);
  if (o) {
    ((o = r.fallback), (s = t.mode), (l = e.child), (a = l.sibling));
    var u = { mode: "hidden", children: r.children };
    return (
      !(s & 1) && t.child !== l
        ? ((r = t.child),
          (r.childLanes = 0),
          (r.pendingProps = u),
          (t.deletions = null))
        : ((r = Kt(l, u)), (r.subtreeFlags = l.subtreeFlags & 14680064)),
      a !== null ? (o = Kt(a, o)) : ((o = on(o, s, n, null)), (o.flags |= 2)),
      (o.return = t),
      (r.return = t),
      (r.sibling = o),
      (t.child = r),
      (r = o),
      (o = t.child),
      (s = e.child.memoizedState),
      (s =
        s === null
          ? Mi(n)
          : {
              baseLanes: s.baseLanes | n,
              cachePool: null,
              transitions: s.transitions,
            }),
      (o.memoizedState = s),
      (o.childLanes = e.childLanes & ~n),
      (t.memoizedState = Ti),
      r
    );
  }
  return (
    (o = e.child),
    (e = o.sibling),
    (r = Kt(o, { mode: "visible", children: r.children })),
    !(t.mode & 1) && (r.lanes = n),
    (r.return = t),
    (r.sibling = null),
    e !== null &&
      ((n = t.deletions),
      n === null ? ((t.deletions = [e]), (t.flags |= 16)) : n.push(e)),
    (t.child = r),
    (t.memoizedState = null),
    r
  );
}
function Is(e, t) {
  return (
    (t = fo({ mode: "visible", children: t }, e.mode, 0, null)),
    (t.return = e),
    (e.child = t)
  );
}
function sl(e, t, n, r) {
  return (
    r !== null && ws(r),
    Bn(t, e.child, null, n),
    (e = Is(t, t.pendingProps.children)),
    (e.flags |= 2),
    (t.memoizedState = null),
    e
  );
}
function Qh(e, t, n, r, l, o, s) {
  if (n)
    return t.flags & 256
      ? ((t.flags &= -257), (r = Vo(Error(L(422)))), sl(e, t, s, r))
      : t.memoizedState !== null
        ? ((t.child = e.child), (t.flags |= 128), null)
        : ((o = r.fallback),
          (l = t.mode),
          (r = fo({ mode: "visible", children: r.children }, l, 0, null)),
          (o = on(o, l, s, null)),
          (o.flags |= 2),
          (r.return = t),
          (o.return = t),
          (r.sibling = o),
          (t.child = r),
          t.mode & 1 && Bn(t, e.child, null, s),
          (t.child.memoizedState = Mi(s)),
          (t.memoizedState = Ti),
          o);
  if (!(t.mode & 1)) return sl(e, t, s, null);
  if (l.data === "$!") {
    if (((r = l.nextSibling && l.nextSibling.dataset), r)) var a = r.dgst;
    return (
      (r = a),
      (o = Error(L(419))),
      (r = Vo(o, r, void 0)),
      sl(e, t, s, r)
    );
  }
  if (((a = (s & e.childLanes) !== 0), Re || a)) {
    if (((r = pe), r !== null)) {
      switch (s & -s) {
        case 4:
          l = 2;
          break;
        case 16:
          l = 8;
          break;
        case 64:
        case 128:
        case 256:
        case 512:
        case 1024:
        case 2048:
        case 4096:
        case 8192:
        case 16384:
        case 32768:
        case 65536:
        case 131072:
        case 262144:
        case 524288:
        case 1048576:
        case 2097152:
        case 4194304:
        case 8388608:
        case 16777216:
        case 33554432:
        case 67108864:
          l = 32;
          break;
        case 536870912:
          l = 268435456;
          break;
        default:
          l = 0;
      }
      ((l = l & (r.suspendedLanes | s) ? 0 : l),
        l !== 0 &&
          l !== o.retryLane &&
          ((o.retryLane = l), St(e, l), tt(r, e, l, -1)));
    }
    return (As(), (r = Vo(Error(L(421)))), sl(e, t, s, r));
  }
  return l.data === "$?"
    ? ((t.flags |= 128),
      (t.child = e.child),
      (t = im.bind(null, e)),
      (l._reactRetry = t),
      null)
    : ((e = o.treeContext),
      (De = Ut(l.nextSibling)),
      (Be = t),
      (ee = !0),
      (qe = null),
      e !== null &&
        ((We[He++] = mt),
        (We[He++] = gt),
        (We[He++] = an),
        (mt = e.id),
        (gt = e.overflow),
        (an = t)),
      (t = Is(t, r.children)),
      (t.flags |= 4096),
      t);
}
function ou(e, t, n) {
  e.lanes |= t;
  var r = e.alternate;
  (r !== null && (r.lanes |= t), bi(e.return, t, n));
}
function Ko(e, t, n, r, l) {
  var o = e.memoizedState;
  o === null
    ? (e.memoizedState = {
        isBackwards: t,
        rendering: null,
        renderingStartTime: 0,
        last: r,
        tail: n,
        tailMode: l,
      })
    : ((o.isBackwards = t),
      (o.rendering = null),
      (o.renderingStartTime = 0),
      (o.last = r),
      (o.tail = n),
      (o.tailMode = l));
}
function Md(e, t, n) {
  var r = t.pendingProps,
    l = r.revealOrder,
    o = r.tail;
  if ((_e(e, t, r.children, n), (r = ne.current), r & 2))
    ((r = (r & 1) | 2), (t.flags |= 128));
  else {
    if (e !== null && e.flags & 128)
      e: for (e = t.child; e !== null; ) {
        if (e.tag === 13) e.memoizedState !== null && ou(e, n, t);
        else if (e.tag === 19) ou(e, n, t);
        else if (e.child !== null) {
          ((e.child.return = e), (e = e.child));
          continue;
        }
        if (e === t) break e;
        for (; e.sibling === null; ) {
          if (e.return === null || e.return === t) break e;
          e = e.return;
        }
        ((e.sibling.return = e.return), (e = e.sibling));
      }
    r &= 1;
  }
  if ((X(ne, r), !(t.mode & 1))) t.memoizedState = null;
  else
    switch (l) {
      case "forwards":
        for (n = t.child, l = null; n !== null; )
          ((e = n.alternate),
            e !== null && Hl(e) === null && (l = n),
            (n = n.sibling));
        ((n = l),
          n === null
            ? ((l = t.child), (t.child = null))
            : ((l = n.sibling), (n.sibling = null)),
          Ko(t, !1, l, n, o));
        break;
      case "backwards":
        for (n = null, l = t.child, t.child = null; l !== null; ) {
          if (((e = l.alternate), e !== null && Hl(e) === null)) {
            t.child = l;
            break;
          }
          ((e = l.sibling), (l.sibling = n), (n = l), (l = e));
        }
        Ko(t, !0, n, null, o);
        break;
      case "together":
        Ko(t, !1, null, null, void 0);
        break;
      default:
        t.memoizedState = null;
    }
  return t.child;
}
function _l(e, t) {
  !(t.mode & 1) &&
    e !== null &&
    ((e.alternate = null), (t.alternate = null), (t.flags |= 2));
}
function wt(e, t, n) {
  if (
    (e !== null && (t.dependencies = e.dependencies),
    (cn |= t.lanes),
    !(n & t.childLanes))
  )
    return null;
  if (e !== null && t.child !== e.child) throw Error(L(153));
  if (t.child !== null) {
    for (
      e = t.child, n = Kt(e, e.pendingProps), t.child = n, n.return = t;
      e.sibling !== null;
    )
      ((e = e.sibling),
        (n = n.sibling = Kt(e, e.pendingProps)),
        (n.return = t));
    n.sibling = null;
  }
  return t.child;
}
function Jh(e, t, n) {
  switch (t.tag) {
    case 3:
      (Ld(t), Dn());
      break;
    case 5:
      id(t);
      break;
    case 1:
      Me(t.type) && Bl(t);
      break;
    case 4:
      bs(t, t.stateNode.containerInfo);
      break;
    case 10:
      var r = t.type._context,
        l = t.memoizedProps.value;
      (X(Al, r._currentValue), (r._currentValue = l));
      break;
    case 13:
      if (((r = t.memoizedState), r !== null))
        return r.dehydrated !== null
          ? (X(ne, ne.current & 1), (t.flags |= 128), null)
          : n & t.child.childLanes
            ? Td(e, t, n)
            : (X(ne, ne.current & 1),
              (e = wt(e, t, n)),
              e !== null ? e.sibling : null);
      X(ne, ne.current & 1);
      break;
    case 19:
      if (((r = (n & t.childLanes) !== 0), e.flags & 128)) {
        if (r) return Md(e, t, n);
        t.flags |= 128;
      }
      if (
        ((l = t.memoizedState),
        l !== null &&
          ((l.rendering = null), (l.tail = null), (l.lastEffect = null)),
        X(ne, ne.current),
        r)
      )
        break;
      return null;
    case 22:
    case 23:
      return ((t.lanes = 0), Nd(e, t, n));
  }
  return wt(e, t, n);
}
var Id, Ii, Fd, Dd;
Id = function (e, t) {
  for (var n = t.child; n !== null; ) {
    if (n.tag === 5 || n.tag === 6) e.appendChild(n.stateNode);
    else if (n.tag !== 4 && n.child !== null) {
      ((n.child.return = n), (n = n.child));
      continue;
    }
    if (n === t) break;
    for (; n.sibling === null; ) {
      if (n.return === null || n.return === t) return;
      n = n.return;
    }
    ((n.sibling.return = n.return), (n = n.sibling));
  }
};
Ii = function () {};
Fd = function (e, t, n, r) {
  var l = e.memoizedProps;
  if (l !== r) {
    ((e = t.stateNode), rn(ut.current));
    var o = null;
    switch (n) {
      case "input":
        ((l = ri(e, l)), (r = ri(e, r)), (o = []));
        break;
      case "select":
        ((l = oe({}, l, { value: void 0 })),
          (r = oe({}, r, { value: void 0 })),
          (o = []));
        break;
      case "textarea":
        ((l = ii(e, l)), (r = ii(e, r)), (o = []));
        break;
      default:
        typeof l.onClick != "function" &&
          typeof r.onClick == "function" &&
          (e.onclick = Fl);
    }
    ai(n, r);
    var s;
    n = null;
    for (c in l)
      if (!r.hasOwnProperty(c) && l.hasOwnProperty(c) && l[c] != null)
        if (c === "style") {
          var a = l[c];
          for (s in a) a.hasOwnProperty(s) && (n || (n = {}), (n[s] = ""));
        } else
          c !== "dangerouslySetInnerHTML" &&
            c !== "children" &&
            c !== "suppressContentEditableWarning" &&
            c !== "suppressHydrationWarning" &&
            c !== "autoFocus" &&
            (jr.hasOwnProperty(c)
              ? o || (o = [])
              : (o = o || []).push(c, null));
    for (c in r) {
      var u = r[c];
      if (
        ((a = l != null ? l[c] : void 0),
        r.hasOwnProperty(c) && u !== a && (u != null || a != null))
      )
        if (c === "style")
          if (a) {
            for (s in a)
              !a.hasOwnProperty(s) ||
                (u && u.hasOwnProperty(s)) ||
                (n || (n = {}), (n[s] = ""));
            for (s in u)
              u.hasOwnProperty(s) &&
                a[s] !== u[s] &&
                (n || (n = {}), (n[s] = u[s]));
          } else (n || (o || (o = []), o.push(c, n)), (n = u));
        else
          c === "dangerouslySetInnerHTML"
            ? ((u = u ? u.__html : void 0),
              (a = a ? a.__html : void 0),
              u != null && a !== u && (o = o || []).push(c, u))
            : c === "children"
              ? (typeof u != "string" && typeof u != "number") ||
                (o = o || []).push(c, "" + u)
              : c !== "suppressContentEditableWarning" &&
                c !== "suppressHydrationWarning" &&
                (jr.hasOwnProperty(c)
                  ? (u != null && c === "onScroll" && Z("scroll", e),
                    o || a === u || (o = []))
                  : (o = o || []).push(c, u));
    }
    n && (o = o || []).push("style", n);
    var c = o;
    (t.updateQueue = c) && (t.flags |= 4);
  }
};
Dd = function (e, t, n, r) {
  n !== r && (t.flags |= 4);
};
function nr(e, t) {
  if (!ee)
    switch (e.tailMode) {
      case "hidden":
        t = e.tail;
        for (var n = null; t !== null; )
          (t.alternate !== null && (n = t), (t = t.sibling));
        n === null ? (e.tail = null) : (n.sibling = null);
        break;
      case "collapsed":
        n = e.tail;
        for (var r = null; n !== null; )
          (n.alternate !== null && (r = n), (n = n.sibling));
        r === null
          ? t || e.tail === null
            ? (e.tail = null)
            : (e.tail.sibling = null)
          : (r.sibling = null);
    }
}
function we(e) {
  var t = e.alternate !== null && e.alternate.child === e.child,
    n = 0,
    r = 0;
  if (t)
    for (var l = e.child; l !== null; )
      ((n |= l.lanes | l.childLanes),
        (r |= l.subtreeFlags & 14680064),
        (r |= l.flags & 14680064),
        (l.return = e),
        (l = l.sibling));
  else
    for (l = e.child; l !== null; )
      ((n |= l.lanes | l.childLanes),
        (r |= l.subtreeFlags),
        (r |= l.flags),
        (l.return = e),
        (l = l.sibling));
  return ((e.subtreeFlags |= r), (e.childLanes = n), t);
}
function Yh(e, t, n) {
  var r = t.pendingProps;
  switch ((Ss(t), t.tag)) {
    case 2:
    case 16:
    case 15:
    case 0:
    case 11:
    case 7:
    case 8:
    case 12:
    case 9:
    case 14:
      return (we(t), null);
    case 1:
      return (Me(t.type) && Dl(), we(t), null);
    case 3:
      return (
        (r = t.stateNode),
        On(),
        q(Te),
        q(je),
        Ps(),
        r.pendingContext &&
          ((r.context = r.pendingContext), (r.pendingContext = null)),
        (e === null || e.child === null) &&
          (ol(t)
            ? (t.flags |= 4)
            : e === null ||
              (e.memoizedState.isDehydrated && !(t.flags & 256)) ||
              ((t.flags |= 1024), qe !== null && (Wi(qe), (qe = null)))),
        Ii(e, t),
        we(t),
        null
      );
    case 5:
      zs(t);
      var l = rn(Ir.current);
      if (((n = t.type), e !== null && t.stateNode != null))
        (Fd(e, t, n, r, l),
          e.ref !== t.ref && ((t.flags |= 512), (t.flags |= 2097152)));
      else {
        if (!r) {
          if (t.stateNode === null) throw Error(L(166));
          return (we(t), null);
        }
        if (((e = rn(ut.current)), ol(t))) {
          ((r = t.stateNode), (n = t.type));
          var o = t.memoizedProps;
          switch (((r[st] = t), (r[Tr] = o), (e = (t.mode & 1) !== 0), n)) {
            case "dialog":
              (Z("cancel", r), Z("close", r));
              break;
            case "iframe":
            case "object":
            case "embed":
              Z("load", r);
              break;
            case "video":
            case "audio":
              for (l = 0; l < pr.length; l++) Z(pr[l], r);
              break;
            case "source":
              Z("error", r);
              break;
            case "img":
            case "image":
            case "link":
              (Z("error", r), Z("load", r));
              break;
            case "details":
              Z("toggle", r);
              break;
            case "input":
              (ha(r, o), Z("invalid", r));
              break;
            case "select":
              ((r._wrapperState = { wasMultiple: !!o.multiple }),
                Z("invalid", r));
              break;
            case "textarea":
              (ga(r, o), Z("invalid", r));
          }
          (ai(n, o), (l = null));
          for (var s in o)
            if (o.hasOwnProperty(s)) {
              var a = o[s];
              s === "children"
                ? typeof a == "string"
                  ? r.textContent !== a &&
                    (o.suppressHydrationWarning !== !0 &&
                      ll(r.textContent, a, e),
                    (l = ["children", a]))
                  : typeof a == "number" &&
                    r.textContent !== "" + a &&
                    (o.suppressHydrationWarning !== !0 &&
                      ll(r.textContent, a, e),
                    (l = ["children", "" + a]))
                : jr.hasOwnProperty(s) &&
                  a != null &&
                  s === "onScroll" &&
                  Z("scroll", r);
            }
          switch (n) {
            case "input":
              (Xr(r), ma(r, o, !0));
              break;
            case "textarea":
              (Xr(r), va(r));
              break;
            case "select":
            case "option":
              break;
            default:
              typeof o.onClick == "function" && (r.onclick = Fl);
          }
          ((r = l), (t.updateQueue = r), r !== null && (t.flags |= 4));
        } else {
          ((s = l.nodeType === 9 ? l : l.ownerDocument),
            e === "http://www.w3.org/1999/xhtml" && (e = dc(n)),
            e === "http://www.w3.org/1999/xhtml"
              ? n === "script"
                ? ((e = s.createElement("div")),
                  (e.innerHTML = "<script><\/script>"),
                  (e = e.removeChild(e.firstChild)))
                : typeof r.is == "string"
                  ? (e = s.createElement(n, { is: r.is }))
                  : ((e = s.createElement(n)),
                    n === "select" &&
                      ((s = e),
                      r.multiple
                        ? (s.multiple = !0)
                        : r.size && (s.size = r.size)))
              : (e = s.createElementNS(e, n)),
            (e[st] = t),
            (e[Tr] = r),
            Id(e, t, !1, !1),
            (t.stateNode = e));
          e: {
            switch (((s = ui(n, r)), n)) {
              case "dialog":
                (Z("cancel", e), Z("close", e), (l = r));
                break;
              case "iframe":
              case "object":
              case "embed":
                (Z("load", e), (l = r));
                break;
              case "video":
              case "audio":
                for (l = 0; l < pr.length; l++) Z(pr[l], e);
                l = r;
                break;
              case "source":
                (Z("error", e), (l = r));
                break;
              case "img":
              case "image":
              case "link":
                (Z("error", e), Z("load", e), (l = r));
                break;
              case "details":
                (Z("toggle", e), (l = r));
                break;
              case "input":
                (ha(e, r), (l = ri(e, r)), Z("invalid", e));
                break;
              case "option":
                l = r;
                break;
              case "select":
                ((e._wrapperState = { wasMultiple: !!r.multiple }),
                  (l = oe({}, r, { value: void 0 })),
                  Z("invalid", e));
                break;
              case "textarea":
                (ga(e, r), (l = ii(e, r)), Z("invalid", e));
                break;
              default:
                l = r;
            }
            (ai(n, l), (a = l));
            for (o in a)
              if (a.hasOwnProperty(o)) {
                var u = a[o];
                o === "style"
                  ? hc(e, u)
                  : o === "dangerouslySetInnerHTML"
                    ? ((u = u ? u.__html : void 0), u != null && fc(e, u))
                    : o === "children"
                      ? typeof u == "string"
                        ? (n !== "textarea" || u !== "") && _r(e, u)
                        : typeof u == "number" && _r(e, "" + u)
                      : o !== "suppressContentEditableWarning" &&
                        o !== "suppressHydrationWarning" &&
                        o !== "autoFocus" &&
                        (jr.hasOwnProperty(o)
                          ? u != null && o === "onScroll" && Z("scroll", e)
                          : u != null && os(e, o, u, s));
              }
            switch (n) {
              case "input":
                (Xr(e), ma(e, r, !1));
                break;
              case "textarea":
                (Xr(e), va(e));
                break;
              case "option":
                r.value != null && e.setAttribute("value", "" + Jt(r.value));
                break;
              case "select":
                ((e.multiple = !!r.multiple),
                  (o = r.value),
                  o != null
                    ? Pn(e, !!r.multiple, o, !1)
                    : r.defaultValue != null &&
                      Pn(e, !!r.multiple, r.defaultValue, !0));
                break;
              default:
                typeof l.onClick == "function" && (e.onclick = Fl);
            }
            switch (n) {
              case "button":
              case "input":
              case "select":
              case "textarea":
                r = !!r.autoFocus;
                break e;
              case "img":
                r = !0;
                break e;
              default:
                r = !1;
            }
          }
          r && (t.flags |= 4);
        }
        t.ref !== null && ((t.flags |= 512), (t.flags |= 2097152));
      }
      return (we(t), null);
    case 6:
      if (e && t.stateNode != null) Dd(e, t, e.memoizedProps, r);
      else {
        if (typeof r != "string" && t.stateNode === null) throw Error(L(166));
        if (((n = rn(Ir.current)), rn(ut.current), ol(t))) {
          if (
            ((r = t.stateNode),
            (n = t.memoizedProps),
            (r[st] = t),
            (o = r.nodeValue !== n) && ((e = Be), e !== null))
          )
            switch (e.tag) {
              case 3:
                ll(r.nodeValue, n, (e.mode & 1) !== 0);
                break;
              case 5:
                e.memoizedProps.suppressHydrationWarning !== !0 &&
                  ll(r.nodeValue, n, (e.mode & 1) !== 0);
            }
          o && (t.flags |= 4);
        } else
          ((r = (n.nodeType === 9 ? n : n.ownerDocument).createTextNode(r)),
            (r[st] = t),
            (t.stateNode = r));
      }
      return (we(t), null);
    case 13:
      if (
        (q(ne),
        (r = t.memoizedState),
        e === null ||
          (e.memoizedState !== null && e.memoizedState.dehydrated !== null))
      ) {
        if (ee && De !== null && t.mode & 1 && !(t.flags & 128))
          (td(), Dn(), (t.flags |= 98560), (o = !1));
        else if (((o = ol(t)), r !== null && r.dehydrated !== null)) {
          if (e === null) {
            if (!o) throw Error(L(318));
            if (
              ((o = t.memoizedState),
              (o = o !== null ? o.dehydrated : null),
              !o)
            )
              throw Error(L(317));
            o[st] = t;
          } else
            (Dn(),
              !(t.flags & 128) && (t.memoizedState = null),
              (t.flags |= 4));
          (we(t), (o = !1));
        } else (qe !== null && (Wi(qe), (qe = null)), (o = !0));
        if (!o) return t.flags & 65536 ? t : null;
      }
      return t.flags & 128
        ? ((t.lanes = n), t)
        : ((r = r !== null),
          r !== (e !== null && e.memoizedState !== null) &&
            r &&
            ((t.child.flags |= 8192),
            t.mode & 1 &&
              (e === null || ne.current & 1 ? de === 0 && (de = 3) : As())),
          t.updateQueue !== null && (t.flags |= 4),
          we(t),
          null);
    case 4:
      return (
        On(),
        Ii(e, t),
        e === null && Rr(t.stateNode.containerInfo),
        we(t),
        null
      );
    case 10:
      return (_s(t.type._context), we(t), null);
    case 17:
      return (Me(t.type) && Dl(), we(t), null);
    case 19:
      if ((q(ne), (o = t.memoizedState), o === null)) return (we(t), null);
      if (((r = (t.flags & 128) !== 0), (s = o.rendering), s === null))
        if (r) nr(o, !1);
        else {
          if (de !== 0 || (e !== null && e.flags & 128))
            for (e = t.child; e !== null; ) {
              if (((s = Hl(e)), s !== null)) {
                for (
                  t.flags |= 128,
                    nr(o, !1),
                    r = s.updateQueue,
                    r !== null && ((t.updateQueue = r), (t.flags |= 4)),
                    t.subtreeFlags = 0,
                    r = n,
                    n = t.child;
                  n !== null;
                )
                  ((o = n),
                    (e = r),
                    (o.flags &= 14680066),
                    (s = o.alternate),
                    s === null
                      ? ((o.childLanes = 0),
                        (o.lanes = e),
                        (o.child = null),
                        (o.subtreeFlags = 0),
                        (o.memoizedProps = null),
                        (o.memoizedState = null),
                        (o.updateQueue = null),
                        (o.dependencies = null),
                        (o.stateNode = null))
                      : ((o.childLanes = s.childLanes),
                        (o.lanes = s.lanes),
                        (o.child = s.child),
                        (o.subtreeFlags = 0),
                        (o.deletions = null),
                        (o.memoizedProps = s.memoizedProps),
                        (o.memoizedState = s.memoizedState),
                        (o.updateQueue = s.updateQueue),
                        (o.type = s.type),
                        (e = s.dependencies),
                        (o.dependencies =
                          e === null
                            ? null
                            : {
                                lanes: e.lanes,
                                firstContext: e.firstContext,
                              })),
                    (n = n.sibling));
                return (X(ne, (ne.current & 1) | 2), t.child);
              }
              e = e.sibling;
            }
          o.tail !== null &&
            ae() > An &&
            ((t.flags |= 128), (r = !0), nr(o, !1), (t.lanes = 4194304));
        }
      else {
        if (!r)
          if (((e = Hl(s)), e !== null)) {
            if (
              ((t.flags |= 128),
              (r = !0),
              (n = e.updateQueue),
              n !== null && ((t.updateQueue = n), (t.flags |= 4)),
              nr(o, !0),
              o.tail === null && o.tailMode === "hidden" && !s.alternate && !ee)
            )
              return (we(t), null);
          } else
            2 * ae() - o.renderingStartTime > An &&
              n !== 1073741824 &&
              ((t.flags |= 128), (r = !0), nr(o, !1), (t.lanes = 4194304));
        o.isBackwards
          ? ((s.sibling = t.child), (t.child = s))
          : ((n = o.last),
            n !== null ? (n.sibling = s) : (t.child = s),
            (o.last = s));
      }
      return o.tail !== null
        ? ((t = o.tail),
          (o.rendering = t),
          (o.tail = t.sibling),
          (o.renderingStartTime = ae()),
          (t.sibling = null),
          (n = ne.current),
          X(ne, r ? (n & 1) | 2 : n & 1),
          t)
        : (we(t), null);
    case 22:
    case 23:
      return (
        $s(),
        (r = t.memoizedState !== null),
        e !== null && (e.memoizedState !== null) !== r && (t.flags |= 8192),
        r && t.mode & 1
          ? Fe & 1073741824 && (we(t), t.subtreeFlags & 6 && (t.flags |= 8192))
          : we(t),
        null
      );
    case 24:
      return null;
    case 25:
      return null;
  }
  throw Error(L(156, t.tag));
}
function Xh(e, t) {
  switch ((Ss(t), t.tag)) {
    case 1:
      return (
        Me(t.type) && Dl(),
        (e = t.flags),
        e & 65536 ? ((t.flags = (e & -65537) | 128), t) : null
      );
    case 3:
      return (
        On(),
        q(Te),
        q(je),
        Ps(),
        (e = t.flags),
        e & 65536 && !(e & 128) ? ((t.flags = (e & -65537) | 128), t) : null
      );
    case 5:
      return (zs(t), null);
    case 13:
      if ((q(ne), (e = t.memoizedState), e !== null && e.dehydrated !== null)) {
        if (t.alternate === null) throw Error(L(340));
        Dn();
      }
      return (
        (e = t.flags),
        e & 65536 ? ((t.flags = (e & -65537) | 128), t) : null
      );
    case 19:
      return (q(ne), null);
    case 4:
      return (On(), null);
    case 10:
      return (_s(t.type._context), null);
    case 22:
    case 23:
      return ($s(), null);
    case 24:
      return null;
    default:
      return null;
  }
}
var al = !1,
  ke = !1,
  Gh = typeof WeakSet == "function" ? WeakSet : Set,
  I = null;
function bn(e, t) {
  var n = e.ref;
  if (n !== null)
    if (typeof n == "function")
      try {
        n(null);
      } catch (r) {
        se(e, t, r);
      }
    else n.current = null;
}
function Fi(e, t, n) {
  try {
    n();
  } catch (r) {
    se(e, t, r);
  }
}
var iu = !1;
function Zh(e, t) {
  if (((yi = Tl), (e = Uc()), xs(e))) {
    if ("selectionStart" in e)
      var n = { start: e.selectionStart, end: e.selectionEnd };
    else
      e: {
        n = ((n = e.ownerDocument) && n.defaultView) || window;
        var r = n.getSelection && n.getSelection();
        if (r && r.rangeCount !== 0) {
          n = r.anchorNode;
          var l = r.anchorOffset,
            o = r.focusNode;
          r = r.focusOffset;
          try {
            (n.nodeType, o.nodeType);
          } catch {
            n = null;
            break e;
          }
          var s = 0,
            a = -1,
            u = -1,
            c = 0,
            m = 0,
            f = e,
            g = null;
          t: for (;;) {
            for (
              var S;
              f !== n || (l !== 0 && f.nodeType !== 3) || (a = s + l),
                f !== o || (r !== 0 && f.nodeType !== 3) || (u = s + r),
                f.nodeType === 3 && (s += f.nodeValue.length),
                (S = f.firstChild) !== null;
            )
              ((g = f), (f = S));
            for (;;) {
              if (f === e) break t;
              if (
                (g === n && ++c === l && (a = s),
                g === o && ++m === r && (u = s),
                (S = f.nextSibling) !== null)
              )
                break;
              ((f = g), (g = f.parentNode));
            }
            f = S;
          }
          n = a === -1 || u === -1 ? null : { start: a, end: u };
        } else n = null;
      }
    n = n || { start: 0, end: 0 };
  } else n = null;
  for (Si = { focusedElem: e, selectionRange: n }, Tl = !1, I = t; I !== null; )
    if (((t = I), (e = t.child), (t.subtreeFlags & 1028) !== 0 && e !== null))
      ((e.return = t), (I = e));
    else
      for (; I !== null; ) {
        t = I;
        try {
          var y = t.alternate;
          if (t.flags & 1024)
            switch (t.tag) {
              case 0:
              case 11:
              case 15:
                break;
              case 1:
                if (y !== null) {
                  var k = y.memoizedProps,
                    j = y.memoizedState,
                    p = t.stateNode,
                    d = p.getSnapshotBeforeUpdate(
                      t.elementType === t.type ? k : Ge(t.type, k),
                      j,
                    );
                  p.__reactInternalSnapshotBeforeUpdate = d;
                }
                break;
              case 3:
                var h = t.stateNode.containerInfo;
                h.nodeType === 1
                  ? (h.textContent = "")
                  : h.nodeType === 9 &&
                    h.documentElement &&
                    h.removeChild(h.documentElement);
                break;
              case 5:
              case 6:
              case 4:
              case 17:
                break;
              default:
                throw Error(L(163));
            }
        } catch (w) {
          se(t, t.return, w);
        }
        if (((e = t.sibling), e !== null)) {
          ((e.return = t.return), (I = e));
          break;
        }
        I = t.return;
      }
  return ((y = iu), (iu = !1), y);
}
function Sr(e, t, n) {
  var r = t.updateQueue;
  if (((r = r !== null ? r.lastEffect : null), r !== null)) {
    var l = (r = r.next);
    do {
      if ((l.tag & e) === e) {
        var o = l.destroy;
        ((l.destroy = void 0), o !== void 0 && Fi(t, n, o));
      }
      l = l.next;
    } while (l !== r);
  }
}
function uo(e, t) {
  if (
    ((t = t.updateQueue), (t = t !== null ? t.lastEffect : null), t !== null)
  ) {
    var n = (t = t.next);
    do {
      if ((n.tag & e) === e) {
        var r = n.create;
        n.destroy = r();
      }
      n = n.next;
    } while (n !== t);
  }
}
function Di(e) {
  var t = e.ref;
  if (t !== null) {
    var n = e.stateNode;
    switch (e.tag) {
      case 5:
        e = n;
        break;
      default:
        e = n;
    }
    typeof t == "function" ? t(e) : (t.current = e);
  }
}
function Bd(e) {
  var t = e.alternate;
  (t !== null && ((e.alternate = null), Bd(t)),
    (e.child = null),
    (e.deletions = null),
    (e.sibling = null),
    e.tag === 5 &&
      ((t = e.stateNode),
      t !== null &&
        (delete t[st], delete t[Tr], delete t[ji], delete t[Mh], delete t[Ih])),
    (e.stateNode = null),
    (e.return = null),
    (e.dependencies = null),
    (e.memoizedProps = null),
    (e.memoizedState = null),
    (e.pendingProps = null),
    (e.stateNode = null),
    (e.updateQueue = null));
}
function Od(e) {
  return e.tag === 5 || e.tag === 3 || e.tag === 4;
}
function su(e) {
  e: for (;;) {
    for (; e.sibling === null; ) {
      if (e.return === null || Od(e.return)) return null;
      e = e.return;
    }
    for (
      e.sibling.return = e.return, e = e.sibling;
      e.tag !== 5 && e.tag !== 6 && e.tag !== 18;
    ) {
      if (e.flags & 2 || e.child === null || e.tag === 4) continue e;
      ((e.child.return = e), (e = e.child));
    }
    if (!(e.flags & 2)) return e.stateNode;
  }
}
function Bi(e, t, n) {
  var r = e.tag;
  if (r === 5 || r === 6)
    ((e = e.stateNode),
      t
        ? n.nodeType === 8
          ? n.parentNode.insertBefore(e, t)
          : n.insertBefore(e, t)
        : (n.nodeType === 8
            ? ((t = n.parentNode), t.insertBefore(e, n))
            : ((t = n), t.appendChild(e)),
          (n = n._reactRootContainer),
          n != null || t.onclick !== null || (t.onclick = Fl)));
  else if (r !== 4 && ((e = e.child), e !== null))
    for (Bi(e, t, n), e = e.sibling; e !== null; )
      (Bi(e, t, n), (e = e.sibling));
}
function Oi(e, t, n) {
  var r = e.tag;
  if (r === 5 || r === 6)
    ((e = e.stateNode), t ? n.insertBefore(e, t) : n.appendChild(e));
  else if (r !== 4 && ((e = e.child), e !== null))
    for (Oi(e, t, n), e = e.sibling; e !== null; )
      (Oi(e, t, n), (e = e.sibling));
}
var he = null,
  Ze = !1;
function Pt(e, t, n) {
  for (n = n.child; n !== null; ) ($d(e, t, n), (n = n.sibling));
}
function $d(e, t, n) {
  if (at && typeof at.onCommitFiberUnmount == "function")
    try {
      at.onCommitFiberUnmount(to, n);
    } catch {}
  switch (n.tag) {
    case 5:
      ke || bn(n, t);
    case 6:
      var r = he,
        l = Ze;
      ((he = null),
        Pt(e, t, n),
        (he = r),
        (Ze = l),
        he !== null &&
          (Ze
            ? ((e = he),
              (n = n.stateNode),
              e.nodeType === 8 ? e.parentNode.removeChild(n) : e.removeChild(n))
            : he.removeChild(n.stateNode)));
      break;
    case 18:
      he !== null &&
        (Ze
          ? ((e = he),
            (n = n.stateNode),
            e.nodeType === 8
              ? Oo(e.parentNode, n)
              : e.nodeType === 1 && Oo(e, n),
            zr(e))
          : Oo(he, n.stateNode));
      break;
    case 4:
      ((r = he),
        (l = Ze),
        (he = n.stateNode.containerInfo),
        (Ze = !0),
        Pt(e, t, n),
        (he = r),
        (Ze = l));
      break;
    case 0:
    case 11:
    case 14:
    case 15:
      if (
        !ke &&
        ((r = n.updateQueue), r !== null && ((r = r.lastEffect), r !== null))
      ) {
        l = r = r.next;
        do {
          var o = l,
            s = o.destroy;
          ((o = o.tag),
            s !== void 0 && (o & 2 || o & 4) && Fi(n, t, s),
            (l = l.next));
        } while (l !== r);
      }
      Pt(e, t, n);
      break;
    case 1:
      if (
        !ke &&
        (bn(n, t),
        (r = n.stateNode),
        typeof r.componentWillUnmount == "function")
      )
        try {
          ((r.props = n.memoizedProps),
            (r.state = n.memoizedState),
            r.componentWillUnmount());
        } catch (a) {
          se(n, t, a);
        }
      Pt(e, t, n);
      break;
    case 21:
      Pt(e, t, n);
      break;
    case 22:
      n.mode & 1
        ? ((ke = (r = ke) || n.memoizedState !== null), Pt(e, t, n), (ke = r))
        : Pt(e, t, n);
      break;
    default:
      Pt(e, t, n);
  }
}
function au(e) {
  var t = e.updateQueue;
  if (t !== null) {
    e.updateQueue = null;
    var n = e.stateNode;
    (n === null && (n = e.stateNode = new Gh()),
      t.forEach(function (r) {
        var l = sm.bind(null, e, r);
        n.has(r) || (n.add(r), r.then(l, l));
      }));
  }
}
function Xe(e, t) {
  var n = t.deletions;
  if (n !== null)
    for (var r = 0; r < n.length; r++) {
      var l = n[r];
      try {
        var o = e,
          s = t,
          a = s;
        e: for (; a !== null; ) {
          switch (a.tag) {
            case 5:
              ((he = a.stateNode), (Ze = !1));
              break e;
            case 3:
              ((he = a.stateNode.containerInfo), (Ze = !0));
              break e;
            case 4:
              ((he = a.stateNode.containerInfo), (Ze = !0));
              break e;
          }
          a = a.return;
        }
        if (he === null) throw Error(L(160));
        ($d(o, s, l), (he = null), (Ze = !1));
        var u = l.alternate;
        (u !== null && (u.return = null), (l.return = null));
      } catch (c) {
        se(l, t, c);
      }
    }
  if (t.subtreeFlags & 12854)
    for (t = t.child; t !== null; ) (Ad(t, e), (t = t.sibling));
}
function Ad(e, t) {
  var n = e.alternate,
    r = e.flags;
  switch (e.tag) {
    case 0:
    case 11:
    case 14:
    case 15:
      if ((Xe(t, e), lt(e), r & 4)) {
        try {
          (Sr(3, e, e.return), uo(3, e));
        } catch (k) {
          se(e, e.return, k);
        }
        try {
          Sr(5, e, e.return);
        } catch (k) {
          se(e, e.return, k);
        }
      }
      break;
    case 1:
      (Xe(t, e), lt(e), r & 512 && n !== null && bn(n, n.return));
      break;
    case 5:
      if (
        (Xe(t, e),
        lt(e),
        r & 512 && n !== null && bn(n, n.return),
        e.flags & 32)
      ) {
        var l = e.stateNode;
        try {
          _r(l, "");
        } catch (k) {
          se(e, e.return, k);
        }
      }
      if (r & 4 && ((l = e.stateNode), l != null)) {
        var o = e.memoizedProps,
          s = n !== null ? n.memoizedProps : o,
          a = e.type,
          u = e.updateQueue;
        if (((e.updateQueue = null), u !== null))
          try {
            (a === "input" && o.type === "radio" && o.name != null && uc(l, o),
              ui(a, s));
            var c = ui(a, o);
            for (s = 0; s < u.length; s += 2) {
              var m = u[s],
                f = u[s + 1];
              m === "style"
                ? hc(l, f)
                : m === "dangerouslySetInnerHTML"
                  ? fc(l, f)
                  : m === "children"
                    ? _r(l, f)
                    : os(l, m, f, c);
            }
            switch (a) {
              case "input":
                li(l, o);
                break;
              case "textarea":
                cc(l, o);
                break;
              case "select":
                var g = l._wrapperState.wasMultiple;
                l._wrapperState.wasMultiple = !!o.multiple;
                var S = o.value;
                S != null
                  ? Pn(l, !!o.multiple, S, !1)
                  : g !== !!o.multiple &&
                    (o.defaultValue != null
                      ? Pn(l, !!o.multiple, o.defaultValue, !0)
                      : Pn(l, !!o.multiple, o.multiple ? [] : "", !1));
            }
            l[Tr] = o;
          } catch (k) {
            se(e, e.return, k);
          }
      }
      break;
    case 6:
      if ((Xe(t, e), lt(e), r & 4)) {
        if (e.stateNode === null) throw Error(L(162));
        ((l = e.stateNode), (o = e.memoizedProps));
        try {
          l.nodeValue = o;
        } catch (k) {
          se(e, e.return, k);
        }
      }
      break;
    case 3:
      if (
        (Xe(t, e), lt(e), r & 4 && n !== null && n.memoizedState.isDehydrated)
      )
        try {
          zr(t.containerInfo);
        } catch (k) {
          se(e, e.return, k);
        }
      break;
    case 4:
      (Xe(t, e), lt(e));
      break;
    case 13:
      (Xe(t, e),
        lt(e),
        (l = e.child),
        l.flags & 8192 &&
          ((o = l.memoizedState !== null),
          (l.stateNode.isHidden = o),
          !o ||
            (l.alternate !== null && l.alternate.memoizedState !== null) ||
            (Bs = ae())),
        r & 4 && au(e));
      break;
    case 22:
      if (
        ((m = n !== null && n.memoizedState !== null),
        e.mode & 1 ? ((ke = (c = ke) || m), Xe(t, e), (ke = c)) : Xe(t, e),
        lt(e),
        r & 8192)
      ) {
        if (
          ((c = e.memoizedState !== null),
          (e.stateNode.isHidden = c) && !m && e.mode & 1)
        )
          for (I = e, m = e.child; m !== null; ) {
            for (f = I = m; I !== null; ) {
              switch (((g = I), (S = g.child), g.tag)) {
                case 0:
                case 11:
                case 14:
                case 15:
                  Sr(4, g, g.return);
                  break;
                case 1:
                  bn(g, g.return);
                  var y = g.stateNode;
                  if (typeof y.componentWillUnmount == "function") {
                    ((r = g), (n = g.return));
                    try {
                      ((t = r),
                        (y.props = t.memoizedProps),
                        (y.state = t.memoizedState),
                        y.componentWillUnmount());
                    } catch (k) {
                      se(r, n, k);
                    }
                  }
                  break;
                case 5:
                  bn(g, g.return);
                  break;
                case 22:
                  if (g.memoizedState !== null) {
                    cu(f);
                    continue;
                  }
              }
              S !== null ? ((S.return = g), (I = S)) : cu(f);
            }
            m = m.sibling;
          }
        e: for (m = null, f = e; ; ) {
          if (f.tag === 5) {
            if (m === null) {
              m = f;
              try {
                ((l = f.stateNode),
                  c
                    ? ((o = l.style),
                      typeof o.setProperty == "function"
                        ? o.setProperty("display", "none", "important")
                        : (o.display = "none"))
                    : ((a = f.stateNode),
                      (u = f.memoizedProps.style),
                      (s =
                        u != null && u.hasOwnProperty("display")
                          ? u.display
                          : null),
                      (a.style.display = pc("display", s))));
              } catch (k) {
                se(e, e.return, k);
              }
            }
          } else if (f.tag === 6) {
            if (m === null)
              try {
                f.stateNode.nodeValue = c ? "" : f.memoizedProps;
              } catch (k) {
                se(e, e.return, k);
              }
          } else if (
            ((f.tag !== 22 && f.tag !== 23) ||
              f.memoizedState === null ||
              f === e) &&
            f.child !== null
          ) {
            ((f.child.return = f), (f = f.child));
            continue;
          }
          if (f === e) break e;
          for (; f.sibling === null; ) {
            if (f.return === null || f.return === e) break e;
            (m === f && (m = null), (f = f.return));
          }
          (m === f && (m = null),
            (f.sibling.return = f.return),
            (f = f.sibling));
        }
      }
      break;
    case 19:
      (Xe(t, e), lt(e), r & 4 && au(e));
      break;
    case 21:
      break;
    default:
      (Xe(t, e), lt(e));
  }
}
function lt(e) {
  var t = e.flags;
  if (t & 2) {
    try {
      e: {
        for (var n = e.return; n !== null; ) {
          if (Od(n)) {
            var r = n;
            break e;
          }
          n = n.return;
        }
        throw Error(L(160));
      }
      switch (r.tag) {
        case 5:
          var l = r.stateNode;
          r.flags & 32 && (_r(l, ""), (r.flags &= -33));
          var o = su(e);
          Oi(e, o, l);
          break;
        case 3:
        case 4:
          var s = r.stateNode.containerInfo,
            a = su(e);
          Bi(e, a, s);
          break;
        default:
          throw Error(L(161));
      }
    } catch (u) {
      se(e, e.return, u);
    }
    e.flags &= -3;
  }
  t & 4096 && (e.flags &= -4097);
}
function qh(e, t, n) {
  ((I = e), Ud(e));
}
function Ud(e, t, n) {
  for (var r = (e.mode & 1) !== 0; I !== null; ) {
    var l = I,
      o = l.child;
    if (l.tag === 22 && r) {
      var s = l.memoizedState !== null || al;
      if (!s) {
        var a = l.alternate,
          u = (a !== null && a.memoizedState !== null) || ke;
        a = al;
        var c = ke;
        if (((al = s), (ke = u) && !c))
          for (I = l; I !== null; )
            ((s = I),
              (u = s.child),
              s.tag === 22 && s.memoizedState !== null
                ? du(l)
                : u !== null
                  ? ((u.return = s), (I = u))
                  : du(l));
        for (; o !== null; ) ((I = o), Ud(o), (o = o.sibling));
        ((I = l), (al = a), (ke = c));
      }
      uu(e);
    } else
      l.subtreeFlags & 8772 && o !== null ? ((o.return = l), (I = o)) : uu(e);
  }
}
function uu(e) {
  for (; I !== null; ) {
    var t = I;
    if (t.flags & 8772) {
      var n = t.alternate;
      try {
        if (t.flags & 8772)
          switch (t.tag) {
            case 0:
            case 11:
            case 15:
              ke || uo(5, t);
              break;
            case 1:
              var r = t.stateNode;
              if (t.flags & 4 && !ke)
                if (n === null) r.componentDidMount();
                else {
                  var l =
                    t.elementType === t.type
                      ? n.memoizedProps
                      : Ge(t.type, n.memoizedProps);
                  r.componentDidUpdate(
                    l,
                    n.memoizedState,
                    r.__reactInternalSnapshotBeforeUpdate,
                  );
                }
              var o = t.updateQueue;
              o !== null && Qa(t, o, r);
              break;
            case 3:
              var s = t.updateQueue;
              if (s !== null) {
                if (((n = null), t.child !== null))
                  switch (t.child.tag) {
                    case 5:
                      n = t.child.stateNode;
                      break;
                    case 1:
                      n = t.child.stateNode;
                  }
                Qa(t, s, n);
              }
              break;
            case 5:
              var a = t.stateNode;
              if (n === null && t.flags & 4) {
                n = a;
                var u = t.memoizedProps;
                switch (t.type) {
                  case "button":
                  case "input":
                  case "select":
                  case "textarea":
                    u.autoFocus && n.focus();
                    break;
                  case "img":
                    u.src && (n.src = u.src);
                }
              }
              break;
            case 6:
              break;
            case 4:
              break;
            case 12:
              break;
            case 13:
              if (t.memoizedState === null) {
                var c = t.alternate;
                if (c !== null) {
                  var m = c.memoizedState;
                  if (m !== null) {
                    var f = m.dehydrated;
                    f !== null && zr(f);
                  }
                }
              }
              break;
            case 19:
            case 17:
            case 21:
            case 22:
            case 23:
            case 25:
              break;
            default:
              throw Error(L(163));
          }
        ke || (t.flags & 512 && Di(t));
      } catch (g) {
        se(t, t.return, g);
      }
    }
    if (t === e) {
      I = null;
      break;
    }
    if (((n = t.sibling), n !== null)) {
      ((n.return = t.return), (I = n));
      break;
    }
    I = t.return;
  }
}
function cu(e) {
  for (; I !== null; ) {
    var t = I;
    if (t === e) {
      I = null;
      break;
    }
    var n = t.sibling;
    if (n !== null) {
      ((n.return = t.return), (I = n));
      break;
    }
    I = t.return;
  }
}
function du(e) {
  for (; I !== null; ) {
    var t = I;
    try {
      switch (t.tag) {
        case 0:
        case 11:
        case 15:
          var n = t.return;
          try {
            uo(4, t);
          } catch (u) {
            se(t, n, u);
          }
          break;
        case 1:
          var r = t.stateNode;
          if (typeof r.componentDidMount == "function") {
            var l = t.return;
            try {
              r.componentDidMount();
            } catch (u) {
              se(t, l, u);
            }
          }
          var o = t.return;
          try {
            Di(t);
          } catch (u) {
            se(t, o, u);
          }
          break;
        case 5:
          var s = t.return;
          try {
            Di(t);
          } catch (u) {
            se(t, s, u);
          }
      }
    } catch (u) {
      se(t, t.return, u);
    }
    if (t === e) {
      I = null;
      break;
    }
    var a = t.sibling;
    if (a !== null) {
      ((a.return = t.return), (I = a));
      break;
    }
    I = t.return;
  }
}
var em = Math.ceil,
  Ql = kt.ReactCurrentDispatcher,
  Fs = kt.ReactCurrentOwner,
  Ke = kt.ReactCurrentBatchConfig,
  K = 0,
  pe = null,
  ue = null,
  me = 0,
  Fe = 0,
  zn = Gt(0),
  de = 0,
  Or = null,
  cn = 0,
  co = 0,
  Ds = 0,
  wr = null,
  Ne = null,
  Bs = 0,
  An = 1 / 0,
  pt = null,
  Jl = !1,
  $i = null,
  Ht = null,
  ul = !1,
  Dt = null,
  Yl = 0,
  kr = 0,
  Ai = null,
  Cl = -1,
  El = 0;
function Ce() {
  return K & 6 ? ae() : Cl !== -1 ? Cl : (Cl = ae());
}
function Vt(e) {
  return e.mode & 1
    ? K & 2 && me !== 0
      ? me & -me
      : Dh.transition !== null
        ? (El === 0 && (El = Ec()), El)
        : ((e = J),
          e !== 0 || ((e = window.event), (e = e === void 0 ? 16 : Tc(e.type))),
          e)
    : 1;
}
function tt(e, t, n, r) {
  if (50 < kr) throw ((kr = 0), (Ai = null), Error(L(185)));
  (Wr(e, n, r),
    (!(K & 2) || e !== pe) &&
      (e === pe && (!(K & 2) && (co |= n), de === 4 && It(e, me)),
      Ie(e, r),
      n === 1 && K === 0 && !(t.mode & 1) && ((An = ae() + 500), io && Zt())));
}
function Ie(e, t) {
  var n = e.callbackNode;
  Dp(e, t);
  var r = Ll(e, e === pe ? me : 0);
  if (r === 0)
    (n !== null && Sa(n), (e.callbackNode = null), (e.callbackPriority = 0));
  else if (((t = r & -r), e.callbackPriority !== t)) {
    if ((n != null && Sa(n), t === 1))
      (e.tag === 0 ? Fh(fu.bind(null, e)) : Zc(fu.bind(null, e)),
        Lh(function () {
          !(K & 6) && Zt();
        }),
        (n = null));
    else {
      switch (bc(r)) {
        case 1:
          n = cs;
          break;
        case 4:
          n = _c;
          break;
        case 16:
          n = Rl;
          break;
        case 536870912:
          n = Cc;
          break;
        default:
          n = Rl;
      }
      n = Xd(n, Wd.bind(null, e));
    }
    ((e.callbackPriority = t), (e.callbackNode = n));
  }
}
function Wd(e, t) {
  if (((Cl = -1), (El = 0), K & 6)) throw Error(L(327));
  var n = e.callbackNode;
  if (Mn() && e.callbackNode !== n) return null;
  var r = Ll(e, e === pe ? me : 0);
  if (r === 0) return null;
  if (r & 30 || r & e.expiredLanes || t) t = Xl(e, r);
  else {
    t = r;
    var l = K;
    K |= 2;
    var o = Vd();
    (pe !== e || me !== t) && ((pt = null), (An = ae() + 500), ln(e, t));
    do
      try {
        rm();
        break;
      } catch (a) {
        Hd(e, a);
      }
    while (!0);
    (js(),
      (Ql.current = o),
      (K = l),
      ue !== null ? (t = 0) : ((pe = null), (me = 0), (t = de)));
  }
  if (t !== 0) {
    if (
      (t === 2 && ((l = hi(e)), l !== 0 && ((r = l), (t = Ui(e, l)))), t === 1)
    )
      throw ((n = Or), ln(e, 0), It(e, r), Ie(e, ae()), n);
    if (t === 6) It(e, r);
    else {
      if (
        ((l = e.current.alternate),
        !(r & 30) &&
          !tm(l) &&
          ((t = Xl(e, r)),
          t === 2 && ((o = hi(e)), o !== 0 && ((r = o), (t = Ui(e, o)))),
          t === 1))
      )
        throw ((n = Or), ln(e, 0), It(e, r), Ie(e, ae()), n);
      switch (((e.finishedWork = l), (e.finishedLanes = r), t)) {
        case 0:
        case 1:
          throw Error(L(345));
        case 2:
          en(e, Ne, pt);
          break;
        case 3:
          if (
            (It(e, r), (r & 130023424) === r && ((t = Bs + 500 - ae()), 10 < t))
          ) {
            if (Ll(e, 0) !== 0) break;
            if (((l = e.suspendedLanes), (l & r) !== r)) {
              (Ce(), (e.pingedLanes |= e.suspendedLanes & l));
              break;
            }
            e.timeoutHandle = ki(en.bind(null, e, Ne, pt), t);
            break;
          }
          en(e, Ne, pt);
          break;
        case 4:
          if ((It(e, r), (r & 4194240) === r)) break;
          for (t = e.eventTimes, l = -1; 0 < r; ) {
            var s = 31 - et(r);
            ((o = 1 << s), (s = t[s]), s > l && (l = s), (r &= ~o));
          }
          if (
            ((r = l),
            (r = ae() - r),
            (r =
              (120 > r
                ? 120
                : 480 > r
                  ? 480
                  : 1080 > r
                    ? 1080
                    : 1920 > r
                      ? 1920
                      : 3e3 > r
                        ? 3e3
                        : 4320 > r
                          ? 4320
                          : 1960 * em(r / 1960)) - r),
            10 < r)
          ) {
            e.timeoutHandle = ki(en.bind(null, e, Ne, pt), r);
            break;
          }
          en(e, Ne, pt);
          break;
        case 5:
          en(e, Ne, pt);
          break;
        default:
          throw Error(L(329));
      }
    }
  }
  return (Ie(e, ae()), e.callbackNode === n ? Wd.bind(null, e) : null);
}
function Ui(e, t) {
  var n = wr;
  return (
    e.current.memoizedState.isDehydrated && (ln(e, t).flags |= 256),
    (e = Xl(e, t)),
    e !== 2 && ((t = Ne), (Ne = n), t !== null && Wi(t)),
    e
  );
}
function Wi(e) {
  Ne === null ? (Ne = e) : Ne.push.apply(Ne, e);
}
function tm(e) {
  for (var t = e; ; ) {
    if (t.flags & 16384) {
      var n = t.updateQueue;
      if (n !== null && ((n = n.stores), n !== null))
        for (var r = 0; r < n.length; r++) {
          var l = n[r],
            o = l.getSnapshot;
          l = l.value;
          try {
            if (!nt(o(), l)) return !1;
          } catch {
            return !1;
          }
        }
    }
    if (((n = t.child), t.subtreeFlags & 16384 && n !== null))
      ((n.return = t), (t = n));
    else {
      if (t === e) break;
      for (; t.sibling === null; ) {
        if (t.return === null || t.return === e) return !0;
        t = t.return;
      }
      ((t.sibling.return = t.return), (t = t.sibling));
    }
  }
  return !0;
}
function It(e, t) {
  for (
    t &= ~Ds,
      t &= ~co,
      e.suspendedLanes |= t,
      e.pingedLanes &= ~t,
      e = e.expirationTimes;
    0 < t;
  ) {
    var n = 31 - et(t),
      r = 1 << n;
    ((e[n] = -1), (t &= ~r));
  }
}
function fu(e) {
  if (K & 6) throw Error(L(327));
  Mn();
  var t = Ll(e, 0);
  if (!(t & 1)) return (Ie(e, ae()), null);
  var n = Xl(e, t);
  if (e.tag !== 0 && n === 2) {
    var r = hi(e);
    r !== 0 && ((t = r), (n = Ui(e, r)));
  }
  if (n === 1) throw ((n = Or), ln(e, 0), It(e, t), Ie(e, ae()), n);
  if (n === 6) throw Error(L(345));
  return (
    (e.finishedWork = e.current.alternate),
    (e.finishedLanes = t),
    en(e, Ne, pt),
    Ie(e, ae()),
    null
  );
}
function Os(e, t) {
  var n = K;
  K |= 1;
  try {
    return e(t);
  } finally {
    ((K = n), K === 0 && ((An = ae() + 500), io && Zt()));
  }
}
function dn(e) {
  Dt !== null && Dt.tag === 0 && !(K & 6) && Mn();
  var t = K;
  K |= 1;
  var n = Ke.transition,
    r = J;
  try {
    if (((Ke.transition = null), (J = 1), e)) return e();
  } finally {
    ((J = r), (Ke.transition = n), (K = t), !(K & 6) && Zt());
  }
}
function $s() {
  ((Fe = zn.current), q(zn));
}
function ln(e, t) {
  ((e.finishedWork = null), (e.finishedLanes = 0));
  var n = e.timeoutHandle;
  if ((n !== -1 && ((e.timeoutHandle = -1), Rh(n)), ue !== null))
    for (n = ue.return; n !== null; ) {
      var r = n;
      switch ((Ss(r), r.tag)) {
        case 1:
          ((r = r.type.childContextTypes), r != null && Dl());
          break;
        case 3:
          (On(), q(Te), q(je), Ps());
          break;
        case 5:
          zs(r);
          break;
        case 4:
          On();
          break;
        case 13:
          q(ne);
          break;
        case 19:
          q(ne);
          break;
        case 10:
          _s(r.type._context);
          break;
        case 22:
        case 23:
          $s();
      }
      n = n.return;
    }
  if (
    ((pe = e),
    (ue = e = Kt(e.current, null)),
    (me = Fe = t),
    (de = 0),
    (Or = null),
    (Ds = co = cn = 0),
    (Ne = wr = null),
    nn !== null)
  ) {
    for (t = 0; t < nn.length; t++)
      if (((n = nn[t]), (r = n.interleaved), r !== null)) {
        n.interleaved = null;
        var l = r.next,
          o = n.pending;
        if (o !== null) {
          var s = o.next;
          ((o.next = l), (r.next = s));
        }
        n.pending = r;
      }
    nn = null;
  }
  return e;
}
function Hd(e, t) {
  do {
    var n = ue;
    try {
      if ((js(), (kl.current = Kl), Vl)) {
        for (var r = re.memoizedState; r !== null; ) {
          var l = r.queue;
          (l !== null && (l.pending = null), (r = r.next));
        }
        Vl = !1;
      }
      if (
        ((un = 0),
        (fe = ce = re = null),
        (yr = !1),
        (Fr = 0),
        (Fs.current = null),
        n === null || n.return === null)
      ) {
        ((de = 1), (Or = t), (ue = null));
        break;
      }
      e: {
        var o = e,
          s = n.return,
          a = n,
          u = t;
        if (
          ((t = me),
          (a.flags |= 32768),
          u !== null && typeof u == "object" && typeof u.then == "function")
        ) {
          var c = u,
            m = a,
            f = m.tag;
          if (!(m.mode & 1) && (f === 0 || f === 11 || f === 15)) {
            var g = m.alternate;
            g
              ? ((m.updateQueue = g.updateQueue),
                (m.memoizedState = g.memoizedState),
                (m.lanes = g.lanes))
              : ((m.updateQueue = null), (m.memoizedState = null));
          }
          var S = qa(s);
          if (S !== null) {
            ((S.flags &= -257),
              eu(S, s, a, o, t),
              S.mode & 1 && Za(o, c, t),
              (t = S),
              (u = c));
            var y = t.updateQueue;
            if (y === null) {
              var k = new Set();
              (k.add(u), (t.updateQueue = k));
            } else y.add(u);
            break e;
          } else {
            if (!(t & 1)) {
              (Za(o, c, t), As());
              break e;
            }
            u = Error(L(426));
          }
        } else if (ee && a.mode & 1) {
          var j = qa(s);
          if (j !== null) {
            (!(j.flags & 65536) && (j.flags |= 256),
              eu(j, s, a, o, t),
              ws($n(u, a)));
            break e;
          }
        }
        ((o = u = $n(u, a)),
          de !== 4 && (de = 2),
          wr === null ? (wr = [o]) : wr.push(o),
          (o = s));
        do {
          switch (o.tag) {
            case 3:
              ((o.flags |= 65536), (t &= -t), (o.lanes |= t));
              var p = bd(o, u, t);
              Ka(o, p);
              break e;
            case 1:
              a = u;
              var d = o.type,
                h = o.stateNode;
              if (
                !(o.flags & 128) &&
                (typeof d.getDerivedStateFromError == "function" ||
                  (h !== null &&
                    typeof h.componentDidCatch == "function" &&
                    (Ht === null || !Ht.has(h))))
              ) {
                ((o.flags |= 65536), (t &= -t), (o.lanes |= t));
                var w = zd(o, a, t);
                Ka(o, w);
                break e;
              }
          }
          o = o.return;
        } while (o !== null);
      }
      Qd(n);
    } catch (_) {
      ((t = _), ue === n && n !== null && (ue = n = n.return));
      continue;
    }
    break;
  } while (!0);
}
function Vd() {
  var e = Ql.current;
  return ((Ql.current = Kl), e === null ? Kl : e);
}
function As() {
  ((de === 0 || de === 3 || de === 2) && (de = 4),
    pe === null || (!(cn & 268435455) && !(co & 268435455)) || It(pe, me));
}
function Xl(e, t) {
  var n = K;
  K |= 2;
  var r = Vd();
  (pe !== e || me !== t) && ((pt = null), ln(e, t));
  do
    try {
      nm();
      break;
    } catch (l) {
      Hd(e, l);
    }
  while (!0);
  if ((js(), (K = n), (Ql.current = r), ue !== null)) throw Error(L(261));
  return ((pe = null), (me = 0), de);
}
function nm() {
  for (; ue !== null; ) Kd(ue);
}
function rm() {
  for (; ue !== null && !zp(); ) Kd(ue);
}
function Kd(e) {
  var t = Yd(e.alternate, e, Fe);
  ((e.memoizedProps = e.pendingProps),
    t === null ? Qd(e) : (ue = t),
    (Fs.current = null));
}
function Qd(e) {
  var t = e;
  do {
    var n = t.alternate;
    if (((e = t.return), t.flags & 32768)) {
      if (((n = Xh(n, t)), n !== null)) {
        ((n.flags &= 32767), (ue = n));
        return;
      }
      if (e !== null)
        ((e.flags |= 32768), (e.subtreeFlags = 0), (e.deletions = null));
      else {
        ((de = 6), (ue = null));
        return;
      }
    } else if (((n = Yh(n, t, Fe)), n !== null)) {
      ue = n;
      return;
    }
    if (((t = t.sibling), t !== null)) {
      ue = t;
      return;
    }
    ue = t = e;
  } while (t !== null);
  de === 0 && (de = 5);
}
function en(e, t, n) {
  var r = J,
    l = Ke.transition;
  try {
    ((Ke.transition = null), (J = 1), lm(e, t, n, r));
  } finally {
    ((Ke.transition = l), (J = r));
  }
  return null;
}
function lm(e, t, n, r) {
  do Mn();
  while (Dt !== null);
  if (K & 6) throw Error(L(327));
  n = e.finishedWork;
  var l = e.finishedLanes;
  if (n === null) return null;
  if (((e.finishedWork = null), (e.finishedLanes = 0), n === e.current))
    throw Error(L(177));
  ((e.callbackNode = null), (e.callbackPriority = 0));
  var o = n.lanes | n.childLanes;
  if (
    (Bp(e, o),
    e === pe && ((ue = pe = null), (me = 0)),
    (!(n.subtreeFlags & 2064) && !(n.flags & 2064)) ||
      ul ||
      ((ul = !0),
      Xd(Rl, function () {
        return (Mn(), null);
      })),
    (o = (n.flags & 15990) !== 0),
    n.subtreeFlags & 15990 || o)
  ) {
    ((o = Ke.transition), (Ke.transition = null));
    var s = J;
    J = 1;
    var a = K;
    ((K |= 4),
      (Fs.current = null),
      Zh(e, n),
      Ad(n, e),
      _h(Si),
      (Tl = !!yi),
      (Si = yi = null),
      (e.current = n),
      qh(n),
      Pp(),
      (K = a),
      (J = s),
      (Ke.transition = o));
  } else e.current = n;
  if (
    (ul && ((ul = !1), (Dt = e), (Yl = l)),
    (o = e.pendingLanes),
    o === 0 && (Ht = null),
    Lp(n.stateNode),
    Ie(e, ae()),
    t !== null)
  )
    for (r = e.onRecoverableError, n = 0; n < t.length; n++)
      ((l = t[n]), r(l.value, { componentStack: l.stack, digest: l.digest }));
  if (Jl) throw ((Jl = !1), (e = $i), ($i = null), e);
  return (
    Yl & 1 && e.tag !== 0 && Mn(),
    (o = e.pendingLanes),
    o & 1 ? (e === Ai ? kr++ : ((kr = 0), (Ai = e))) : (kr = 0),
    Zt(),
    null
  );
}
function Mn() {
  if (Dt !== null) {
    var e = bc(Yl),
      t = Ke.transition,
      n = J;
    try {
      if (((Ke.transition = null), (J = 16 > e ? 16 : e), Dt === null))
        var r = !1;
      else {
        if (((e = Dt), (Dt = null), (Yl = 0), K & 6)) throw Error(L(331));
        var l = K;
        for (K |= 4, I = e.current; I !== null; ) {
          var o = I,
            s = o.child;
          if (I.flags & 16) {
            var a = o.deletions;
            if (a !== null) {
              for (var u = 0; u < a.length; u++) {
                var c = a[u];
                for (I = c; I !== null; ) {
                  var m = I;
                  switch (m.tag) {
                    case 0:
                    case 11:
                    case 15:
                      Sr(8, m, o);
                  }
                  var f = m.child;
                  if (f !== null) ((f.return = m), (I = f));
                  else
                    for (; I !== null; ) {
                      m = I;
                      var g = m.sibling,
                        S = m.return;
                      if ((Bd(m), m === c)) {
                        I = null;
                        break;
                      }
                      if (g !== null) {
                        ((g.return = S), (I = g));
                        break;
                      }
                      I = S;
                    }
                }
              }
              var y = o.alternate;
              if (y !== null) {
                var k = y.child;
                if (k !== null) {
                  y.child = null;
                  do {
                    var j = k.sibling;
                    ((k.sibling = null), (k = j));
                  } while (k !== null);
                }
              }
              I = o;
            }
          }
          if (o.subtreeFlags & 2064 && s !== null) ((s.return = o), (I = s));
          else
            e: for (; I !== null; ) {
              if (((o = I), o.flags & 2048))
                switch (o.tag) {
                  case 0:
                  case 11:
                  case 15:
                    Sr(9, o, o.return);
                }
              var p = o.sibling;
              if (p !== null) {
                ((p.return = o.return), (I = p));
                break e;
              }
              I = o.return;
            }
        }
        var d = e.current;
        for (I = d; I !== null; ) {
          s = I;
          var h = s.child;
          if (s.subtreeFlags & 2064 && h !== null) ((h.return = s), (I = h));
          else
            e: for (s = d; I !== null; ) {
              if (((a = I), a.flags & 2048))
                try {
                  switch (a.tag) {
                    case 0:
                    case 11:
                    case 15:
                      uo(9, a);
                  }
                } catch (_) {
                  se(a, a.return, _);
                }
              if (a === s) {
                I = null;
                break e;
              }
              var w = a.sibling;
              if (w !== null) {
                ((w.return = a.return), (I = w));
                break e;
              }
              I = a.return;
            }
        }
        if (
          ((K = l), Zt(), at && typeof at.onPostCommitFiberRoot == "function")
        )
          try {
            at.onPostCommitFiberRoot(to, e);
          } catch {}
        r = !0;
      }
      return r;
    } finally {
      ((J = n), (Ke.transition = t));
    }
  }
  return !1;
}
function pu(e, t, n) {
  ((t = $n(n, t)),
    (t = bd(e, t, 1)),
    (e = Wt(e, t, 1)),
    (t = Ce()),
    e !== null && (Wr(e, 1, t), Ie(e, t)));
}
function se(e, t, n) {
  if (e.tag === 3) pu(e, e, n);
  else
    for (; t !== null; ) {
      if (t.tag === 3) {
        pu(t, e, n);
        break;
      } else if (t.tag === 1) {
        var r = t.stateNode;
        if (
          typeof t.type.getDerivedStateFromError == "function" ||
          (typeof r.componentDidCatch == "function" &&
            (Ht === null || !Ht.has(r)))
        ) {
          ((e = $n(n, e)),
            (e = zd(t, e, 1)),
            (t = Wt(t, e, 1)),
            (e = Ce()),
            t !== null && (Wr(t, 1, e), Ie(t, e)));
          break;
        }
      }
      t = t.return;
    }
}
function om(e, t, n) {
  var r = e.pingCache;
  (r !== null && r.delete(t),
    (t = Ce()),
    (e.pingedLanes |= e.suspendedLanes & n),
    pe === e &&
      (me & n) === n &&
      (de === 4 || (de === 3 && (me & 130023424) === me && 500 > ae() - Bs)
        ? ln(e, 0)
        : (Ds |= n)),
    Ie(e, t));
}
function Jd(e, t) {
  t === 0 &&
    (e.mode & 1
      ? ((t = qr), (qr <<= 1), !(qr & 130023424) && (qr = 4194304))
      : (t = 1));
  var n = Ce();
  ((e = St(e, t)), e !== null && (Wr(e, t, n), Ie(e, n)));
}
function im(e) {
  var t = e.memoizedState,
    n = 0;
  (t !== null && (n = t.retryLane), Jd(e, n));
}
function sm(e, t) {
  var n = 0;
  switch (e.tag) {
    case 13:
      var r = e.stateNode,
        l = e.memoizedState;
      l !== null && (n = l.retryLane);
      break;
    case 19:
      r = e.stateNode;
      break;
    default:
      throw Error(L(314));
  }
  (r !== null && r.delete(t), Jd(e, n));
}
var Yd;
Yd = function (e, t, n) {
  if (e !== null)
    if (e.memoizedProps !== t.pendingProps || Te.current) Re = !0;
    else {
      if (!(e.lanes & n) && !(t.flags & 128)) return ((Re = !1), Jh(e, t, n));
      Re = !!(e.flags & 131072);
    }
  else ((Re = !1), ee && t.flags & 1048576 && qc(t, $l, t.index));
  switch (((t.lanes = 0), t.tag)) {
    case 2:
      var r = t.type;
      (_l(e, t), (e = t.pendingProps));
      var l = Fn(t, je.current);
      (Tn(t, n), (l = Rs(null, t, r, e, l, n)));
      var o = Ls();
      return (
        (t.flags |= 1),
        typeof l == "object" &&
        l !== null &&
        typeof l.render == "function" &&
        l.$$typeof === void 0
          ? ((t.tag = 1),
            (t.memoizedState = null),
            (t.updateQueue = null),
            Me(r) ? ((o = !0), Bl(t)) : (o = !1),
            (t.memoizedState =
              l.state !== null && l.state !== void 0 ? l.state : null),
            Es(t),
            (l.updater = ao),
            (t.stateNode = l),
            (l._reactInternals = t),
            Pi(t, r, e, n),
            (t = Li(null, t, r, !0, o, n)))
          : ((t.tag = 0), ee && o && ys(t), _e(null, t, l, n), (t = t.child)),
        t
      );
    case 16:
      r = t.elementType;
      e: {
        switch (
          (_l(e, t),
          (e = t.pendingProps),
          (l = r._init),
          (r = l(r._payload)),
          (t.type = r),
          (l = t.tag = um(r)),
          (e = Ge(r, e)),
          l)
        ) {
          case 0:
            t = Ri(null, t, r, e, n);
            break e;
          case 1:
            t = ru(null, t, r, e, n);
            break e;
          case 11:
            t = tu(null, t, r, e, n);
            break e;
          case 14:
            t = nu(null, t, r, Ge(r.type, e), n);
            break e;
        }
        throw Error(L(306, r, ""));
      }
      return t;
    case 0:
      return (
        (r = t.type),
        (l = t.pendingProps),
        (l = t.elementType === r ? l : Ge(r, l)),
        Ri(e, t, r, l, n)
      );
    case 1:
      return (
        (r = t.type),
        (l = t.pendingProps),
        (l = t.elementType === r ? l : Ge(r, l)),
        ru(e, t, r, l, n)
      );
    case 3:
      e: {
        if ((Ld(t), e === null)) throw Error(L(387));
        ((r = t.pendingProps),
          (o = t.memoizedState),
          (l = o.element),
          od(e, t),
          Wl(t, r, null, n));
        var s = t.memoizedState;
        if (((r = s.element), o.isDehydrated))
          if (
            ((o = {
              element: r,
              isDehydrated: !1,
              cache: s.cache,
              pendingSuspenseBoundaries: s.pendingSuspenseBoundaries,
              transitions: s.transitions,
            }),
            (t.updateQueue.baseState = o),
            (t.memoizedState = o),
            t.flags & 256)
          ) {
            ((l = $n(Error(L(423)), t)), (t = lu(e, t, r, n, l)));
            break e;
          } else if (r !== l) {
            ((l = $n(Error(L(424)), t)), (t = lu(e, t, r, n, l)));
            break e;
          } else
            for (
              De = Ut(t.stateNode.containerInfo.firstChild),
                Be = t,
                ee = !0,
                qe = null,
                n = rd(t, null, r, n),
                t.child = n;
              n;
            )
              ((n.flags = (n.flags & -3) | 4096), (n = n.sibling));
        else {
          if ((Dn(), r === l)) {
            t = wt(e, t, n);
            break e;
          }
          _e(e, t, r, n);
        }
        t = t.child;
      }
      return t;
    case 5:
      return (
        id(t),
        e === null && Ei(t),
        (r = t.type),
        (l = t.pendingProps),
        (o = e !== null ? e.memoizedProps : null),
        (s = l.children),
        wi(r, l) ? (s = null) : o !== null && wi(r, o) && (t.flags |= 32),
        Rd(e, t),
        _e(e, t, s, n),
        t.child
      );
    case 6:
      return (e === null && Ei(t), null);
    case 13:
      return Td(e, t, n);
    case 4:
      return (
        bs(t, t.stateNode.containerInfo),
        (r = t.pendingProps),
        e === null ? (t.child = Bn(t, null, r, n)) : _e(e, t, r, n),
        t.child
      );
    case 11:
      return (
        (r = t.type),
        (l = t.pendingProps),
        (l = t.elementType === r ? l : Ge(r, l)),
        tu(e, t, r, l, n)
      );
    case 7:
      return (_e(e, t, t.pendingProps, n), t.child);
    case 8:
      return (_e(e, t, t.pendingProps.children, n), t.child);
    case 12:
      return (_e(e, t, t.pendingProps.children, n), t.child);
    case 10:
      e: {
        if (
          ((r = t.type._context),
          (l = t.pendingProps),
          (o = t.memoizedProps),
          (s = l.value),
          X(Al, r._currentValue),
          (r._currentValue = s),
          o !== null)
        )
          if (nt(o.value, s)) {
            if (o.children === l.children && !Te.current) {
              t = wt(e, t, n);
              break e;
            }
          } else
            for (o = t.child, o !== null && (o.return = t); o !== null; ) {
              var a = o.dependencies;
              if (a !== null) {
                s = o.child;
                for (var u = a.firstContext; u !== null; ) {
                  if (u.context === r) {
                    if (o.tag === 1) {
                      ((u = vt(-1, n & -n)), (u.tag = 2));
                      var c = o.updateQueue;
                      if (c !== null) {
                        c = c.shared;
                        var m = c.pending;
                        (m === null
                          ? (u.next = u)
                          : ((u.next = m.next), (m.next = u)),
                          (c.pending = u));
                      }
                    }
                    ((o.lanes |= n),
                      (u = o.alternate),
                      u !== null && (u.lanes |= n),
                      bi(o.return, n, t),
                      (a.lanes |= n));
                    break;
                  }
                  u = u.next;
                }
              } else if (o.tag === 10) s = o.type === t.type ? null : o.child;
              else if (o.tag === 18) {
                if (((s = o.return), s === null)) throw Error(L(341));
                ((s.lanes |= n),
                  (a = s.alternate),
                  a !== null && (a.lanes |= n),
                  bi(s, n, t),
                  (s = o.sibling));
              } else s = o.child;
              if (s !== null) s.return = o;
              else
                for (s = o; s !== null; ) {
                  if (s === t) {
                    s = null;
                    break;
                  }
                  if (((o = s.sibling), o !== null)) {
                    ((o.return = s.return), (s = o));
                    break;
                  }
                  s = s.return;
                }
              o = s;
            }
        (_e(e, t, l.children, n), (t = t.child));
      }
      return t;
    case 9:
      return (
        (l = t.type),
        (r = t.pendingProps.children),
        Tn(t, n),
        (l = Qe(l)),
        (r = r(l)),
        (t.flags |= 1),
        _e(e, t, r, n),
        t.child
      );
    case 14:
      return (
        (r = t.type),
        (l = Ge(r, t.pendingProps)),
        (l = Ge(r.type, l)),
        nu(e, t, r, l, n)
      );
    case 15:
      return Pd(e, t, t.type, t.pendingProps, n);
    case 17:
      return (
        (r = t.type),
        (l = t.pendingProps),
        (l = t.elementType === r ? l : Ge(r, l)),
        _l(e, t),
        (t.tag = 1),
        Me(r) ? ((e = !0), Bl(t)) : (e = !1),
        Tn(t, n),
        Ed(t, r, l),
        Pi(t, r, l, n),
        Li(null, t, r, !0, e, n)
      );
    case 19:
      return Md(e, t, n);
    case 22:
      return Nd(e, t, n);
  }
  throw Error(L(156, t.tag));
};
function Xd(e, t) {
  return jc(e, t);
}
function am(e, t, n, r) {
  ((this.tag = e),
    (this.key = n),
    (this.sibling =
      this.child =
      this.return =
      this.stateNode =
      this.type =
      this.elementType =
        null),
    (this.index = 0),
    (this.ref = null),
    (this.pendingProps = t),
    (this.dependencies =
      this.memoizedState =
      this.updateQueue =
      this.memoizedProps =
        null),
    (this.mode = r),
    (this.subtreeFlags = this.flags = 0),
    (this.deletions = null),
    (this.childLanes = this.lanes = 0),
    (this.alternate = null));
}
function Ve(e, t, n, r) {
  return new am(e, t, n, r);
}
function Us(e) {
  return ((e = e.prototype), !(!e || !e.isReactComponent));
}
function um(e) {
  if (typeof e == "function") return Us(e) ? 1 : 0;
  if (e != null) {
    if (((e = e.$$typeof), e === ss)) return 11;
    if (e === as) return 14;
  }
  return 2;
}
function Kt(e, t) {
  var n = e.alternate;
  return (
    n === null
      ? ((n = Ve(e.tag, t, e.key, e.mode)),
        (n.elementType = e.elementType),
        (n.type = e.type),
        (n.stateNode = e.stateNode),
        (n.alternate = e),
        (e.alternate = n))
      : ((n.pendingProps = t),
        (n.type = e.type),
        (n.flags = 0),
        (n.subtreeFlags = 0),
        (n.deletions = null)),
    (n.flags = e.flags & 14680064),
    (n.childLanes = e.childLanes),
    (n.lanes = e.lanes),
    (n.child = e.child),
    (n.memoizedProps = e.memoizedProps),
    (n.memoizedState = e.memoizedState),
    (n.updateQueue = e.updateQueue),
    (t = e.dependencies),
    (n.dependencies =
      t === null ? null : { lanes: t.lanes, firstContext: t.firstContext }),
    (n.sibling = e.sibling),
    (n.index = e.index),
    (n.ref = e.ref),
    n
  );
}
function bl(e, t, n, r, l, o) {
  var s = 2;
  if (((r = e), typeof e == "function")) Us(e) && (s = 1);
  else if (typeof e == "string") s = 5;
  else
    e: switch (e) {
      case xn:
        return on(n.children, l, o, t);
      case is:
        ((s = 8), (l |= 8));
        break;
      case qo:
        return (
          (e = Ve(12, n, t, l | 2)),
          (e.elementType = qo),
          (e.lanes = o),
          e
        );
      case ei:
        return ((e = Ve(13, n, t, l)), (e.elementType = ei), (e.lanes = o), e);
      case ti:
        return ((e = Ve(19, n, t, l)), (e.elementType = ti), (e.lanes = o), e);
      case ic:
        return fo(n, l, o, t);
      default:
        if (typeof e == "object" && e !== null)
          switch (e.$$typeof) {
            case lc:
              s = 10;
              break e;
            case oc:
              s = 9;
              break e;
            case ss:
              s = 11;
              break e;
            case as:
              s = 14;
              break e;
            case Lt:
              ((s = 16), (r = null));
              break e;
          }
        throw Error(L(130, e == null ? e : typeof e, ""));
    }
  return (
    (t = Ve(s, n, t, l)),
    (t.elementType = e),
    (t.type = r),
    (t.lanes = o),
    t
  );
}
function on(e, t, n, r) {
  return ((e = Ve(7, e, r, t)), (e.lanes = n), e);
}
function fo(e, t, n, r) {
  return (
    (e = Ve(22, e, r, t)),
    (e.elementType = ic),
    (e.lanes = n),
    (e.stateNode = { isHidden: !1 }),
    e
  );
}
function Qo(e, t, n) {
  return ((e = Ve(6, e, null, t)), (e.lanes = n), e);
}
function Jo(e, t, n) {
  return (
    (t = Ve(4, e.children !== null ? e.children : [], e.key, t)),
    (t.lanes = n),
    (t.stateNode = {
      containerInfo: e.containerInfo,
      pendingChildren: null,
      implementation: e.implementation,
    }),
    t
  );
}
function cm(e, t, n, r, l) {
  ((this.tag = t),
    (this.containerInfo = e),
    (this.finishedWork =
      this.pingCache =
      this.current =
      this.pendingChildren =
        null),
    (this.timeoutHandle = -1),
    (this.callbackNode = this.pendingContext = this.context = null),
    (this.callbackPriority = 0),
    (this.eventTimes = zo(0)),
    (this.expirationTimes = zo(-1)),
    (this.entangledLanes =
      this.finishedLanes =
      this.mutableReadLanes =
      this.expiredLanes =
      this.pingedLanes =
      this.suspendedLanes =
      this.pendingLanes =
        0),
    (this.entanglements = zo(0)),
    (this.identifierPrefix = r),
    (this.onRecoverableError = l),
    (this.mutableSourceEagerHydrationData = null));
}
function Ws(e, t, n, r, l, o, s, a, u) {
  return (
    (e = new cm(e, t, n, a, u)),
    t === 1 ? ((t = 1), o === !0 && (t |= 8)) : (t = 0),
    (o = Ve(3, null, null, t)),
    (e.current = o),
    (o.stateNode = e),
    (o.memoizedState = {
      element: r,
      isDehydrated: n,
      cache: null,
      transitions: null,
      pendingSuspenseBoundaries: null,
    }),
    Es(o),
    e
  );
}
function dm(e, t, n) {
  var r = 3 < arguments.length && arguments[3] !== void 0 ? arguments[3] : null;
  return {
    $$typeof: vn,
    key: r == null ? null : "" + r,
    children: e,
    containerInfo: t,
    implementation: n,
  };
}
function Gd(e) {
  if (!e) return Yt;
  e = e._reactInternals;
  e: {
    if (hn(e) !== e || e.tag !== 1) throw Error(L(170));
    var t = e;
    do {
      switch (t.tag) {
        case 3:
          t = t.stateNode.context;
          break e;
        case 1:
          if (Me(t.type)) {
            t = t.stateNode.__reactInternalMemoizedMergedChildContext;
            break e;
          }
      }
      t = t.return;
    } while (t !== null);
    throw Error(L(171));
  }
  if (e.tag === 1) {
    var n = e.type;
    if (Me(n)) return Gc(e, n, t);
  }
  return t;
}
function Zd(e, t, n, r, l, o, s, a, u) {
  return (
    (e = Ws(n, r, !0, e, l, o, s, a, u)),
    (e.context = Gd(null)),
    (n = e.current),
    (r = Ce()),
    (l = Vt(n)),
    (o = vt(r, l)),
    (o.callback = t ?? null),
    Wt(n, o, l),
    (e.current.lanes = l),
    Wr(e, l, r),
    Ie(e, r),
    e
  );
}
function po(e, t, n, r) {
  var l = t.current,
    o = Ce(),
    s = Vt(l);
  return (
    (n = Gd(n)),
    t.context === null ? (t.context = n) : (t.pendingContext = n),
    (t = vt(o, s)),
    (t.payload = { element: e }),
    (r = r === void 0 ? null : r),
    r !== null && (t.callback = r),
    (e = Wt(l, t, s)),
    e !== null && (tt(e, l, s, o), wl(e, l, s)),
    s
  );
}
function Gl(e) {
  if (((e = e.current), !e.child)) return null;
  switch (e.child.tag) {
    case 5:
      return e.child.stateNode;
    default:
      return e.child.stateNode;
  }
}
function hu(e, t) {
  if (((e = e.memoizedState), e !== null && e.dehydrated !== null)) {
    var n = e.retryLane;
    e.retryLane = n !== 0 && n < t ? n : t;
  }
}
function Hs(e, t) {
  (hu(e, t), (e = e.alternate) && hu(e, t));
}
function fm() {
  return null;
}
var qd =
  typeof reportError == "function"
    ? reportError
    : function (e) {
        console.error(e);
      };
function Vs(e) {
  this._internalRoot = e;
}
ho.prototype.render = Vs.prototype.render = function (e) {
  var t = this._internalRoot;
  if (t === null) throw Error(L(409));
  po(e, t, null, null);
};
ho.prototype.unmount = Vs.prototype.unmount = function () {
  var e = this._internalRoot;
  if (e !== null) {
    this._internalRoot = null;
    var t = e.containerInfo;
    (dn(function () {
      po(null, e, null, null);
    }),
      (t[yt] = null));
  }
};
function ho(e) {
  this._internalRoot = e;
}
ho.prototype.unstable_scheduleHydration = function (e) {
  if (e) {
    var t = Nc();
    e = { blockedOn: null, target: e, priority: t };
    for (var n = 0; n < Mt.length && t !== 0 && t < Mt[n].priority; n++);
    (Mt.splice(n, 0, e), n === 0 && Lc(e));
  }
};
function Ks(e) {
  return !(!e || (e.nodeType !== 1 && e.nodeType !== 9 && e.nodeType !== 11));
}
function mo(e) {
  return !(
    !e ||
    (e.nodeType !== 1 &&
      e.nodeType !== 9 &&
      e.nodeType !== 11 &&
      (e.nodeType !== 8 || e.nodeValue !== " react-mount-point-unstable "))
  );
}
function mu() {}
function pm(e, t, n, r, l) {
  if (l) {
    if (typeof r == "function") {
      var o = r;
      r = function () {
        var c = Gl(s);
        o.call(c);
      };
    }
    var s = Zd(t, r, e, 0, null, !1, !1, "", mu);
    return (
      (e._reactRootContainer = s),
      (e[yt] = s.current),
      Rr(e.nodeType === 8 ? e.parentNode : e),
      dn(),
      s
    );
  }
  for (; (l = e.lastChild); ) e.removeChild(l);
  if (typeof r == "function") {
    var a = r;
    r = function () {
      var c = Gl(u);
      a.call(c);
    };
  }
  var u = Ws(e, 0, !1, null, null, !1, !1, "", mu);
  return (
    (e._reactRootContainer = u),
    (e[yt] = u.current),
    Rr(e.nodeType === 8 ? e.parentNode : e),
    dn(function () {
      po(t, u, n, r);
    }),
    u
  );
}
function go(e, t, n, r, l) {
  var o = n._reactRootContainer;
  if (o) {
    var s = o;
    if (typeof l == "function") {
      var a = l;
      l = function () {
        var u = Gl(s);
        a.call(u);
      };
    }
    po(t, s, e, l);
  } else s = pm(n, t, e, l, r);
  return Gl(s);
}
zc = function (e) {
  switch (e.tag) {
    case 3:
      var t = e.stateNode;
      if (t.current.memoizedState.isDehydrated) {
        var n = fr(t.pendingLanes);
        n !== 0 &&
          (ds(t, n | 1), Ie(t, ae()), !(K & 6) && ((An = ae() + 500), Zt()));
      }
      break;
    case 13:
      (dn(function () {
        var r = St(e, 1);
        if (r !== null) {
          var l = Ce();
          tt(r, e, 1, l);
        }
      }),
        Hs(e, 1));
  }
};
fs = function (e) {
  if (e.tag === 13) {
    var t = St(e, 134217728);
    if (t !== null) {
      var n = Ce();
      tt(t, e, 134217728, n);
    }
    Hs(e, 134217728);
  }
};
Pc = function (e) {
  if (e.tag === 13) {
    var t = Vt(e),
      n = St(e, t);
    if (n !== null) {
      var r = Ce();
      tt(n, e, t, r);
    }
    Hs(e, t);
  }
};
Nc = function () {
  return J;
};
Rc = function (e, t) {
  var n = J;
  try {
    return ((J = e), t());
  } finally {
    J = n;
  }
};
di = function (e, t, n) {
  switch (t) {
    case "input":
      if ((li(e, n), (t = n.name), n.type === "radio" && t != null)) {
        for (n = e; n.parentNode; ) n = n.parentNode;
        for (
          n = n.querySelectorAll(
            "input[name=" + JSON.stringify("" + t) + '][type="radio"]',
          ),
            t = 0;
          t < n.length;
          t++
        ) {
          var r = n[t];
          if (r !== e && r.form === e.form) {
            var l = oo(r);
            if (!l) throw Error(L(90));
            (ac(r), li(r, l));
          }
        }
      }
      break;
    case "textarea":
      cc(e, n);
      break;
    case "select":
      ((t = n.value), t != null && Pn(e, !!n.multiple, t, !1));
  }
};
vc = Os;
xc = dn;
var hm = { usingClientEntryPoint: !1, Events: [Vr, kn, oo, mc, gc, Os] },
  rr = {
    findFiberByHostInstance: tn,
    bundleType: 0,
    version: "18.3.1",
    rendererPackageName: "react-dom",
  },
  mm = {
    bundleType: rr.bundleType,
    version: rr.version,
    rendererPackageName: rr.rendererPackageName,
    rendererConfig: rr.rendererConfig,
    overrideHookState: null,
    overrideHookStateDeletePath: null,
    overrideHookStateRenamePath: null,
    overrideProps: null,
    overridePropsDeletePath: null,
    overridePropsRenamePath: null,
    setErrorHandler: null,
    setSuspenseHandler: null,
    scheduleUpdate: null,
    currentDispatcherRef: kt.ReactCurrentDispatcher,
    findHostInstanceByFiber: function (e) {
      return ((e = wc(e)), e === null ? null : e.stateNode);
    },
    findFiberByHostInstance: rr.findFiberByHostInstance || fm,
    findHostInstancesForRefresh: null,
    scheduleRefresh: null,
    scheduleRoot: null,
    setRefreshHandler: null,
    getCurrentFiber: null,
    reconcilerVersion: "18.3.1-next-f1338f8080-20240426",
  };
if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u") {
  var cl = __REACT_DEVTOOLS_GLOBAL_HOOK__;
  if (!cl.isDisabled && cl.supportsFiber)
    try {
      ((to = cl.inject(mm)), (at = cl));
    } catch {}
}
$e.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = hm;
$e.createPortal = function (e, t) {
  var n = 2 < arguments.length && arguments[2] !== void 0 ? arguments[2] : null;
  if (!Ks(t)) throw Error(L(200));
  return dm(e, t, null, n);
};
$e.createRoot = function (e, t) {
  if (!Ks(e)) throw Error(L(299));
  var n = !1,
    r = "",
    l = qd;
  return (
    t != null &&
      (t.unstable_strictMode === !0 && (n = !0),
      t.identifierPrefix !== void 0 && (r = t.identifierPrefix),
      t.onRecoverableError !== void 0 && (l = t.onRecoverableError)),
    (t = Ws(e, 1, !1, null, null, n, !1, r, l)),
    (e[yt] = t.current),
    Rr(e.nodeType === 8 ? e.parentNode : e),
    new Vs(t)
  );
};
$e.findDOMNode = function (e) {
  if (e == null) return null;
  if (e.nodeType === 1) return e;
  var t = e._reactInternals;
  if (t === void 0)
    throw typeof e.render == "function"
      ? Error(L(188))
      : ((e = Object.keys(e).join(",")), Error(L(268, e)));
  return ((e = wc(t)), (e = e === null ? null : e.stateNode), e);
};
$e.flushSync = function (e) {
  return dn(e);
};
$e.hydrate = function (e, t, n) {
  if (!mo(t)) throw Error(L(200));
  return go(null, e, t, !0, n);
};
$e.hydrateRoot = function (e, t, n) {
  if (!Ks(e)) throw Error(L(405));
  var r = (n != null && n.hydratedSources) || null,
    l = !1,
    o = "",
    s = qd;
  if (
    (n != null &&
      (n.unstable_strictMode === !0 && (l = !0),
      n.identifierPrefix !== void 0 && (o = n.identifierPrefix),
      n.onRecoverableError !== void 0 && (s = n.onRecoverableError)),
    (t = Zd(t, null, e, 1, n ?? null, l, !1, o, s)),
    (e[yt] = t.current),
    Rr(e),
    r)
  )
    for (e = 0; e < r.length; e++)
      ((n = r[e]),
        (l = n._getVersion),
        (l = l(n._source)),
        t.mutableSourceEagerHydrationData == null
          ? (t.mutableSourceEagerHydrationData = [n, l])
          : t.mutableSourceEagerHydrationData.push(n, l));
  return new ho(t);
};
$e.render = function (e, t, n) {
  if (!mo(t)) throw Error(L(200));
  return go(null, e, t, !1, n);
};
$e.unmountComponentAtNode = function (e) {
  if (!mo(e)) throw Error(L(40));
  return e._reactRootContainer
    ? (dn(function () {
        go(null, null, e, !1, function () {
          ((e._reactRootContainer = null), (e[yt] = null));
        });
      }),
      !0)
    : !1;
};
$e.unstable_batchedUpdates = Os;
$e.unstable_renderSubtreeIntoContainer = function (e, t, n, r) {
  if (!mo(n)) throw Error(L(200));
  if (e == null || e._reactInternals === void 0) throw Error(L(38));
  return go(e, t, n, !1, r);
};
$e.version = "18.3.1-next-f1338f8080-20240426";
function ef() {
  if (
    !(
      typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ > "u" ||
      typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE != "function"
    )
  )
    try {
      __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(ef);
    } catch (e) {
      console.error(e);
    }
}
(ef(), (ec.exports = $e));
var gm = ec.exports,
  tf,
  gu = gm;
((tf = gu.createRoot), gu.hydrateRoot);
/**
 * @remix-run/router v1.23.3
 *
 * Copyright (c) Remix Software Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 *
 * @license MIT
 */ function $r() {
  return (
    ($r = Object.assign
      ? Object.assign.bind()
      : function (e) {
          for (var t = 1; t < arguments.length; t++) {
            var n = arguments[t];
            for (var r in n) ({}).hasOwnProperty.call(n, r) && (e[r] = n[r]);
          }
          return e;
        }),
    $r.apply(null, arguments)
  );
}
var Bt;
(function (e) {
  ((e.Pop = "POP"), (e.Push = "PUSH"), (e.Replace = "REPLACE"));
})(Bt || (Bt = {}));
const vu = "popstate";
function vm(e) {
  e === void 0 && (e = {});
  function t(r, l) {
    let { pathname: o, search: s, hash: a } = r.location;
    return Hi(
      "",
      { pathname: o, search: s, hash: a },
      (l.state && l.state.usr) || null,
      (l.state && l.state.key) || "default",
    );
  }
  function n(r, l) {
    return typeof l == "string" ? l : Zl(l);
  }
  return ym(t, n, null, e);
}
function le(e, t) {
  if (e === !1 || e === null || typeof e > "u") throw new Error(t);
}
function Qs(e, t) {
  if (!e) {
    typeof console < "u" && console.warn(t);
    try {
      throw new Error(t);
    } catch {}
  }
}
function xm() {
  return Math.random().toString(36).substr(2, 8);
}
function xu(e, t) {
  return { usr: e.state, key: e.key, idx: t };
}
function Hi(e, t, n, r) {
  return (
    n === void 0 && (n = null),
    $r(
      { pathname: typeof e == "string" ? e : e.pathname, search: "", hash: "" },
      typeof t == "string" ? Qn(t) : t,
      { state: n, key: (t && t.key) || r || xm() },
    )
  );
}
function Zl(e) {
  let { pathname: t = "/", search: n = "", hash: r = "" } = e;
  return (
    n && n !== "?" && (t += n.charAt(0) === "?" ? n : "?" + n),
    r && r !== "#" && (t += r.charAt(0) === "#" ? r : "#" + r),
    t
  );
}
function Qn(e) {
  let t = {};
  if (e) {
    let n = e.indexOf("#");
    n >= 0 && ((t.hash = e.substr(n)), (e = e.substr(0, n)));
    let r = e.indexOf("?");
    (r >= 0 && ((t.search = e.substr(r)), (e = e.substr(0, r))),
      e && (t.pathname = e));
  }
  return t;
}
function ym(e, t, n, r) {
  r === void 0 && (r = {});
  let { window: l = document.defaultView, v5Compat: o = !1 } = r,
    s = l.history,
    a = Bt.Pop,
    u = null,
    c = m();
  c == null && ((c = 0), s.replaceState($r({}, s.state, { idx: c }), ""));
  function m() {
    return (s.state || { idx: null }).idx;
  }
  function f() {
    a = Bt.Pop;
    let j = m(),
      p = j == null ? null : j - c;
    ((c = j), u && u({ action: a, location: k.location, delta: p }));
  }
  function g(j, p) {
    a = Bt.Push;
    let d = Hi(k.location, j, p);
    c = m() + 1;
    let h = xu(d, c),
      w = k.createHref(d);
    try {
      s.pushState(h, "", w);
    } catch (_) {
      if (_ instanceof DOMException && _.name === "DataCloneError") throw _;
      l.location.assign(w);
    }
    o && u && u({ action: a, location: k.location, delta: 1 });
  }
  function S(j, p) {
    a = Bt.Replace;
    let d = Hi(k.location, j, p);
    c = m();
    let h = xu(d, c),
      w = k.createHref(d);
    (s.replaceState(h, "", w),
      o && u && u({ action: a, location: k.location, delta: 0 }));
  }
  function y(j) {
    let p = l.location.origin !== "null" ? l.location.origin : l.location.href,
      d = typeof j == "string" ? j : Zl(j);
    return (
      (d = d.replace(/ $/, "%20")),
      le(
        p,
        "No window.location.(origin|href) available to create URL for href: " +
          d,
      ),
      new URL(d, p)
    );
  }
  let k = {
    get action() {
      return a;
    },
    get location() {
      return e(l, s);
    },
    listen(j) {
      if (u) throw new Error("A history only accepts one active listener");
      return (
        l.addEventListener(vu, f),
        (u = j),
        () => {
          (l.removeEventListener(vu, f), (u = null));
        }
      );
    },
    createHref(j) {
      return t(l, j);
    },
    createURL: y,
    encodeLocation(j) {
      let p = y(j);
      return { pathname: p.pathname, search: p.search, hash: p.hash };
    },
    push: g,
    replace: S,
    go(j) {
      return s.go(j);
    },
  };
  return k;
}
var yu;
(function (e) {
  ((e.data = "data"),
    (e.deferred = "deferred"),
    (e.redirect = "redirect"),
    (e.error = "error"));
})(yu || (yu = {}));
function Sm(e, t, n) {
  return (n === void 0 && (n = "/"), wm(e, t, n));
}
function wm(e, t, n, r) {
  let l = typeof t == "string" ? Qn(t) : t,
    o = Un(l.pathname || "/", n);
  if (o == null) return null;
  let s = nf(e);
  km(s);
  let a = null,
    u = Tm(o);
  for (let c = 0; a == null && c < s.length; ++c) a = Rm(s[c], u);
  return a;
}
function nf(e, t, n, r) {
  (t === void 0 && (t = []),
    n === void 0 && (n = []),
    r === void 0 && (r = ""));
  let l = (o, s, a) => {
    let u = {
      relativePath: a === void 0 ? o.path || "" : a,
      caseSensitive: o.caseSensitive === !0,
      childrenIndex: s,
      route: o,
    };
    u.relativePath.startsWith("/") &&
      (le(
        u.relativePath.startsWith(r),
        'Absolute route path "' +
          u.relativePath +
          '" nested under path ' +
          ('"' + r + '" is not valid. An absolute child route path ') +
          "must start with the combined path of all its parent routes.",
      ),
      (u.relativePath = u.relativePath.slice(r.length)));
    let c = Qt([r, u.relativePath]),
      m = n.concat(u);
    (o.children &&
      o.children.length > 0 &&
      (le(
        o.index !== !0,
        "Index routes must not have child routes. Please remove " +
          ('all child routes from route path "' + c + '".'),
      ),
      nf(o.children, t, m, c)),
      !(o.path == null && !o.index) &&
        t.push({ path: c, score: Pm(c, o.index), routesMeta: m }));
  };
  return (
    e.forEach((o, s) => {
      var a;
      if (o.path === "" || !((a = o.path) != null && a.includes("?"))) l(o, s);
      else for (let u of rf(o.path)) l(o, s, u);
    }),
    t
  );
}
function rf(e) {
  let t = e.split("/");
  if (t.length === 0) return [];
  let [n, ...r] = t,
    l = n.endsWith("?"),
    o = n.replace(/\?$/, "");
  if (r.length === 0) return l ? [o, ""] : [o];
  let s = rf(r.join("/")),
    a = [];
  return (
    a.push(...s.map((u) => (u === "" ? o : [o, u].join("/")))),
    l && a.push(...s),
    a.map((u) => (e.startsWith("/") && u === "" ? "/" : u))
  );
}
function km(e) {
  e.sort((t, n) =>
    t.score !== n.score
      ? n.score - t.score
      : Nm(
          t.routesMeta.map((r) => r.childrenIndex),
          n.routesMeta.map((r) => r.childrenIndex),
        ),
  );
}
const jm = /^:[\w-]+$/,
  _m = 3,
  Cm = 2,
  Em = 1,
  bm = 10,
  zm = -2,
  Su = (e) => e === "*";
function Pm(e, t) {
  let n = e.split("/"),
    r = n.length;
  return (
    n.some(Su) && (r += zm),
    t && (r += Cm),
    n
      .filter((l) => !Su(l))
      .reduce((l, o) => l + (jm.test(o) ? _m : o === "" ? Em : bm), r)
  );
}
function Nm(e, t) {
  return e.length === t.length && e.slice(0, -1).every((r, l) => r === t[l])
    ? e[e.length - 1] - t[t.length - 1]
    : 0;
}
function Rm(e, t, n) {
  let { routesMeta: r } = e,
    l = {},
    o = "/",
    s = [];
  for (let a = 0; a < r.length; ++a) {
    let u = r[a],
      c = a === r.length - 1,
      m = o === "/" ? t : t.slice(o.length) || "/",
      f = Vi(
        { path: u.relativePath, caseSensitive: u.caseSensitive, end: c },
        m,
      ),
      g = u.route;
    if (!f) return null;
    (Object.assign(l, f.params),
      s.push({
        params: l,
        pathname: Qt([o, f.pathname]),
        pathnameBase: Bm(Qt([o, f.pathnameBase])),
        route: g,
      }),
      f.pathnameBase !== "/" && (o = Qt([o, f.pathnameBase])));
  }
  return s;
}
function Vi(e, t) {
  typeof e == "string" && (e = { path: e, caseSensitive: !1, end: !0 });
  let [n, r] = Lm(e.path, e.caseSensitive, e.end),
    l = t.match(n);
  if (!l) return null;
  let o = l[0],
    s = o.replace(/(.)\/+$/, "$1"),
    a = l.slice(1);
  return {
    params: r.reduce((c, m, f) => {
      let { paramName: g, isOptional: S } = m;
      if (g === "*") {
        let k = a[f] || "";
        s = o.slice(0, o.length - k.length).replace(/(.)\/+$/, "$1");
      }
      const y = a[f];
      return (
        S && !y ? (c[g] = void 0) : (c[g] = (y || "").replace(/%2F/g, "/")),
        c
      );
    }, {}),
    pathname: o,
    pathnameBase: s,
    pattern: e,
  };
}
function Lm(e, t, n) {
  (t === void 0 && (t = !1),
    n === void 0 && (n = !0),
    Qs(
      e === "*" || !e.endsWith("*") || e.endsWith("/*"),
      'Route path "' +
        e +
        '" will be treated as if it were ' +
        ('"' + e.replace(/\*$/, "/*") + '" because the `*` character must ') +
        "always follow a `/` in the pattern. To get rid of this warning, " +
        ('please change the route path to "' + e.replace(/\*$/, "/*") + '".'),
    ));
  let r = [],
    l =
      "^" +
      e
        .replace(/\/*\*?$/, "")
        .replace(/^\/*/, "/")
        .replace(/[\\.*+^${}|()[\]]/g, "\\$&")
        .replace(
          /\/:([\w-]+)(\?)?/g,
          (s, a, u) => (
            r.push({ paramName: a, isOptional: u != null }),
            u ? "/?([^\\/]+)?" : "/([^\\/]+)"
          ),
        );
  return (
    e.endsWith("*")
      ? (r.push({ paramName: "*" }),
        (l += e === "*" || e === "/*" ? "(.*)$" : "(?:\\/(.+)|\\/*)$"))
      : n
        ? (l += "\\/*$")
        : e !== "" && e !== "/" && (l += "(?:(?=\\/|$))"),
    [new RegExp(l, t ? void 0 : "i"), r]
  );
}
function Tm(e) {
  try {
    return e
      .split("/")
      .map((t) => decodeURIComponent(t).replace(/\//g, "%2F"))
      .join("/");
  } catch (t) {
    return (
      Qs(
        !1,
        'The URL path "' +
          e +
          '" could not be decoded because it is is a malformed URL segment. This is probably due to a bad percent ' +
          ("encoding (" + t + ")."),
      ),
      e
    );
  }
}
function Un(e, t) {
  if (t === "/") return e;
  if (!e.toLowerCase().startsWith(t.toLowerCase())) return null;
  let n = t.endsWith("/") ? t.length - 1 : t.length,
    r = e.charAt(n);
  return r && r !== "/" ? null : e.slice(n) || "/";
}
const Mm = /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i,
  Im = (e) => Mm.test(e);
function Fm(e, t) {
  t === void 0 && (t = "/");
  let {
      pathname: n,
      search: r = "",
      hash: l = "",
    } = typeof e == "string" ? Qn(e) : e,
    o;
  if (n)
    if (Im(n)) o = n;
    else {
      if (n.includes("//")) {
        let s = n;
        ((n = lf(n)),
          Qs(
            !1,
            "Pathnames cannot have embedded double slashes - normalizing " +
              (s + " -> " + n),
          ));
      }
      n.startsWith("/") ? (o = wu(n.substring(1), "/")) : (o = wu(n, t));
    }
  else o = t;
  return { pathname: o, search: Om(r), hash: $m(l) };
}
function wu(e, t) {
  let n = t.replace(/\/+$/, "").split("/");
  return (
    e.split("/").forEach((l) => {
      l === ".." ? n.length > 1 && n.pop() : l !== "." && n.push(l);
    }),
    n.length > 1 ? n.join("/") : "/"
  );
}
function Yo(e, t, n, r) {
  return (
    "Cannot include a '" +
    e +
    "' character in a manually specified " +
    ("`to." +
      t +
      "` field [" +
      JSON.stringify(r) +
      "].  Please separate it out to the ") +
    ("`to." + n + "` field. Alternatively you may provide the full path as ") +
    'a string in <Link to="..."> and the router will parse it for you.'
  );
}
function Dm(e) {
  return e.filter(
    (t, n) => n === 0 || (t.route.path && t.route.path.length > 0),
  );
}
function Js(e, t) {
  let n = Dm(e);
  return t
    ? n.map((r, l) => (l === n.length - 1 ? r.pathname : r.pathnameBase))
    : n.map((r) => r.pathnameBase);
}
function Ys(e, t, n, r) {
  r === void 0 && (r = !1);
  let l;
  typeof e == "string"
    ? (l = Qn(e))
    : ((l = $r({}, e)),
      le(
        !l.pathname || !l.pathname.includes("?"),
        Yo("?", "pathname", "search", l),
      ),
      le(
        !l.pathname || !l.pathname.includes("#"),
        Yo("#", "pathname", "hash", l),
      ),
      le(!l.search || !l.search.includes("#"), Yo("#", "search", "hash", l)));
  let o = e === "" || l.pathname === "",
    s = o ? "/" : l.pathname,
    a;
  if (s == null) a = n;
  else {
    let f = t.length - 1;
    if (!r && s.startsWith("..")) {
      let g = s.split("/");
      for (; g[0] === ".."; ) (g.shift(), (f -= 1));
      l.pathname = g.join("/");
    }
    a = f >= 0 ? t[f] : "/";
  }
  let u = Fm(l, a),
    c = s && s !== "/" && s.endsWith("/"),
    m = (o || s === ".") && n.endsWith("/");
  return (!u.pathname.endsWith("/") && (c || m) && (u.pathname += "/"), u);
}
const lf = (e) => e.replace(/\/\/+/g, "/"),
  Qt = (e) => lf(e.join("/")),
  Bm = (e) => e.replace(/\/+$/, "").replace(/^\/*/, "/"),
  Om = (e) => (!e || e === "?" ? "" : e.startsWith("?") ? e : "?" + e),
  $m = (e) => (!e || e === "#" ? "" : e.startsWith("#") ? e : "#" + e);
function Am(e) {
  return (
    e != null &&
    typeof e.status == "number" &&
    typeof e.statusText == "string" &&
    typeof e.internal == "boolean" &&
    "data" in e
  );
}
const of = ["post", "put", "patch", "delete"];
new Set(of);
const Um = ["get", ...of];
new Set(Um);
/**
 * React Router v6.30.4
 *
 * Copyright (c) Remix Software Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 *
 * @license MIT
 */ function Ar() {
  return (
    (Ar = Object.assign
      ? Object.assign.bind()
      : function (e) {
          for (var t = 1; t < arguments.length; t++) {
            var n = arguments[t];
            for (var r in n) ({}).hasOwnProperty.call(n, r) && (e[r] = n[r]);
          }
          return e;
        }),
    Ar.apply(null, arguments)
  );
}
const vo = x.createContext(null),
  sf = x.createContext(null),
  jt = x.createContext(null),
  xo = x.createContext(null),
  _t = x.createContext({ outlet: null, matches: [], isDataRoute: !1 }),
  af = x.createContext(null);
function Wm(e, t) {
  let { relative: n } = t === void 0 ? {} : t;
  Jn() || le(!1);
  let { basename: r, navigator: l } = x.useContext(jt),
    { hash: o, pathname: s, search: a } = yo(e, { relative: n }),
    u = s;
  return (
    r !== "/" && (u = s === "/" ? r : Qt([r, s])),
    l.createHref({ pathname: u, search: a, hash: o })
  );
}
function Jn() {
  return x.useContext(xo) != null;
}
function mn() {
  return (Jn() || le(!1), x.useContext(xo).location);
}
function uf(e) {
  x.useContext(jt).static || x.useLayoutEffect(e);
}
function ct() {
  let { isDataRoute: e } = x.useContext(_t);
  return e ? lg() : Hm();
}
function Hm() {
  Jn() || le(!1);
  let e = x.useContext(vo),
    { basename: t, future: n, navigator: r } = x.useContext(jt),
    { matches: l } = x.useContext(_t),
    { pathname: o } = mn(),
    s = JSON.stringify(Js(l, n.v7_relativeSplatPath)),
    a = x.useRef(!1);
  return (
    uf(() => {
      a.current = !0;
    }),
    x.useCallback(
      function (c, m) {
        if ((m === void 0 && (m = {}), !a.current)) return;
        if (typeof c == "number") {
          r.go(c);
          return;
        }
        let f = Ys(c, JSON.parse(s), o, m.relative === "path");
        (e == null &&
          t !== "/" &&
          (f.pathname = f.pathname === "/" ? t : Qt([t, f.pathname])),
          (m.replace ? r.replace : r.push)(f, m.state, m));
      },
      [t, r, s, o, e],
    )
  );
}
const Vm = x.createContext(null);
function Km(e) {
  let t = x.useContext(_t).outlet;
  return t && x.createElement(Vm.Provider, { value: e }, t);
}
function yo(e, t) {
  let { relative: n } = t === void 0 ? {} : t,
    { future: r } = x.useContext(jt),
    { matches: l } = x.useContext(_t),
    { pathname: o } = mn(),
    s = JSON.stringify(Js(l, r.v7_relativeSplatPath));
  return x.useMemo(() => Ys(e, JSON.parse(s), o, n === "path"), [e, s, o, n]);
}
function Qm(e, t) {
  return Jm(e, t);
}
function Jm(e, t, n, r) {
  Jn() || le(!1);
  let { navigator: l } = x.useContext(jt),
    { matches: o } = x.useContext(_t),
    s = o[o.length - 1],
    a = s ? s.params : {};
  s && s.pathname;
  let u = s ? s.pathnameBase : "/";
  s && s.route;
  let c = mn(),
    m;
  if (t) {
    var f;
    let j = typeof t == "string" ? Qn(t) : t;
    (u === "/" || ((f = j.pathname) != null && f.startsWith(u)) || le(!1),
      (m = j));
  } else m = c;
  let g = m.pathname || "/",
    S = g;
  if (u !== "/") {
    let j = u.replace(/^\//, "").split("/");
    S = "/" + g.replace(/^\//, "").split("/").slice(j.length).join("/");
  }
  let y = Sm(e, { pathname: S }),
    k = qm(
      y &&
        y.map((j) =>
          Object.assign({}, j, {
            params: Object.assign({}, a, j.params),
            pathname: Qt([
              u,
              l.encodeLocation
                ? l.encodeLocation(j.pathname).pathname
                : j.pathname,
            ]),
            pathnameBase:
              j.pathnameBase === "/"
                ? u
                : Qt([
                    u,
                    l.encodeLocation
                      ? l.encodeLocation(j.pathnameBase).pathname
                      : j.pathnameBase,
                  ]),
          }),
        ),
      o,
      n,
      r,
    );
  return t && k
    ? x.createElement(
        xo.Provider,
        {
          value: {
            location: Ar(
              {
                pathname: "/",
                search: "",
                hash: "",
                state: null,
                key: "default",
              },
              m,
            ),
            navigationType: Bt.Pop,
          },
        },
        k,
      )
    : k;
}
function Ym() {
  let e = rg(),
    t = Am(e)
      ? e.status + " " + e.statusText
      : e instanceof Error
        ? e.message
        : JSON.stringify(e),
    n = e instanceof Error ? e.stack : null,
    l = { padding: "0.5rem", backgroundColor: "rgba(200,200,200, 0.5)" };
  return x.createElement(
    x.Fragment,
    null,
    x.createElement("h2", null, "Unexpected Application Error!"),
    x.createElement("h3", { style: { fontStyle: "italic" } }, t),
    n ? x.createElement("pre", { style: l }, n) : null,
    null,
  );
}
const Xm = x.createElement(Ym, null);
class Gm extends x.Component {
  constructor(t) {
    (super(t),
      (this.state = {
        location: t.location,
        revalidation: t.revalidation,
        error: t.error,
      }));
  }
  static getDerivedStateFromError(t) {
    return { error: t };
  }
  static getDerivedStateFromProps(t, n) {
    return n.location !== t.location ||
      (n.revalidation !== "idle" && t.revalidation === "idle")
      ? { error: t.error, location: t.location, revalidation: t.revalidation }
      : {
          error: t.error !== void 0 ? t.error : n.error,
          location: n.location,
          revalidation: t.revalidation || n.revalidation,
        };
  }
  componentDidCatch(t, n) {
    console.error(
      "React Router caught the following error during render",
      t,
      n,
    );
  }
  render() {
    return this.state.error !== void 0
      ? x.createElement(
          _t.Provider,
          { value: this.props.routeContext },
          x.createElement(af.Provider, {
            value: this.state.error,
            children: this.props.component,
          }),
        )
      : this.props.children;
  }
}
function Zm(e) {
  let { routeContext: t, match: n, children: r } = e,
    l = x.useContext(vo);
  return (
    l &&
      l.static &&
      l.staticContext &&
      (n.route.errorElement || n.route.ErrorBoundary) &&
      (l.staticContext._deepestRenderedBoundaryId = n.route.id),
    x.createElement(_t.Provider, { value: t }, r)
  );
}
function qm(e, t, n, r) {
  var l;
  if (
    (t === void 0 && (t = []),
    n === void 0 && (n = null),
    r === void 0 && (r = null),
    e == null)
  ) {
    var o;
    if (!n) return null;
    if (n.errors) e = n.matches;
    else if (
      (o = r) != null &&
      o.v7_partialHydration &&
      t.length === 0 &&
      !n.initialized &&
      n.matches.length > 0
    )
      e = n.matches;
    else return null;
  }
  let s = e,
    a = (l = n) == null ? void 0 : l.errors;
  if (a != null) {
    let m = s.findIndex(
      (f) => f.route.id && (a == null ? void 0 : a[f.route.id]) !== void 0,
    );
    (m >= 0 || le(!1), (s = s.slice(0, Math.min(s.length, m + 1))));
  }
  let u = !1,
    c = -1;
  if (n && r && r.v7_partialHydration)
    for (let m = 0; m < s.length; m++) {
      let f = s[m];
      if (
        ((f.route.HydrateFallback || f.route.hydrateFallbackElement) && (c = m),
        f.route.id)
      ) {
        let { loaderData: g, errors: S } = n,
          y =
            f.route.loader &&
            g[f.route.id] === void 0 &&
            (!S || S[f.route.id] === void 0);
        if (f.route.lazy || y) {
          ((u = !0), c >= 0 ? (s = s.slice(0, c + 1)) : (s = [s[0]]));
          break;
        }
      }
    }
  return s.reduceRight((m, f, g) => {
    let S,
      y = !1,
      k = null,
      j = null;
    n &&
      ((S = a && f.route.id ? a[f.route.id] : void 0),
      (k = f.route.errorElement || Xm),
      u &&
        (c < 0 && g === 0
          ? (og("route-fallback"), (y = !0), (j = null))
          : c === g &&
            ((y = !0), (j = f.route.hydrateFallbackElement || null))));
    let p = t.concat(s.slice(0, g + 1)),
      d = () => {
        let h;
        return (
          S
            ? (h = k)
            : y
              ? (h = j)
              : f.route.Component
                ? (h = x.createElement(f.route.Component, null))
                : f.route.element
                  ? (h = f.route.element)
                  : (h = m),
          x.createElement(Zm, {
            match: f,
            routeContext: { outlet: m, matches: p, isDataRoute: n != null },
            children: h,
          })
        );
      };
    return n && (f.route.ErrorBoundary || f.route.errorElement || g === 0)
      ? x.createElement(Gm, {
          location: n.location,
          revalidation: n.revalidation,
          component: k,
          error: S,
          children: d(),
          routeContext: { outlet: null, matches: p, isDataRoute: !0 },
        })
      : d();
  }, null);
}
var cf = (function (e) {
    return (
      (e.UseBlocker = "useBlocker"),
      (e.UseRevalidator = "useRevalidator"),
      (e.UseNavigateStable = "useNavigate"),
      e
    );
  })(cf || {}),
  df = (function (e) {
    return (
      (e.UseBlocker = "useBlocker"),
      (e.UseLoaderData = "useLoaderData"),
      (e.UseActionData = "useActionData"),
      (e.UseRouteError = "useRouteError"),
      (e.UseNavigation = "useNavigation"),
      (e.UseRouteLoaderData = "useRouteLoaderData"),
      (e.UseMatches = "useMatches"),
      (e.UseRevalidator = "useRevalidator"),
      (e.UseNavigateStable = "useNavigate"),
      (e.UseRouteId = "useRouteId"),
      e
    );
  })(df || {});
function eg(e) {
  let t = x.useContext(vo);
  return (t || le(!1), t);
}
function tg(e) {
  let t = x.useContext(sf);
  return (t || le(!1), t);
}
function ng(e) {
  let t = x.useContext(_t);
  return (t || le(!1), t);
}
function ff(e) {
  let t = ng(),
    n = t.matches[t.matches.length - 1];
  return (n.route.id || le(!1), n.route.id);
}
function rg() {
  var e;
  let t = x.useContext(af),
    n = tg(),
    r = ff();
  return t !== void 0 ? t : (e = n.errors) == null ? void 0 : e[r];
}
function lg() {
  let { router: e } = eg(cf.UseNavigateStable),
    t = ff(df.UseNavigateStable),
    n = x.useRef(!1);
  return (
    uf(() => {
      n.current = !0;
    }),
    x.useCallback(
      function (l, o) {
        (o === void 0 && (o = {}),
          n.current &&
            (typeof l == "number"
              ? e.navigate(l)
              : e.navigate(l, Ar({ fromRouteId: t }, o))));
      },
      [e, t],
    )
  );
}
const ku = {};
function og(e, t, n) {
  ku[e] || (ku[e] = !0);
}
function ig(e, t) {
  (e == null || e.v7_startTransition, e == null || e.v7_relativeSplatPath);
}
function pf(e) {
  let { to: t, replace: n, state: r, relative: l } = e;
  Jn() || le(!1);
  let { future: o, static: s } = x.useContext(jt),
    { matches: a } = x.useContext(_t),
    { pathname: u } = mn(),
    c = ct(),
    m = Ys(t, Js(a, o.v7_relativeSplatPath), u, l === "path"),
    f = JSON.stringify(m);
  return (
    x.useEffect(
      () => c(JSON.parse(f), { replace: n, state: r, relative: l }),
      [c, f, l, n, r],
    ),
    null
  );
}
function sg(e) {
  return Km(e.context);
}
function ot(e) {
  le(!1);
}
function ag(e) {
  let {
    basename: t = "/",
    children: n = null,
    location: r,
    navigationType: l = Bt.Pop,
    navigator: o,
    static: s = !1,
    future: a,
  } = e;
  Jn() && le(!1);
  let u = t.replace(/^\/*/, "/"),
    c = x.useMemo(
      () => ({
        basename: u,
        navigator: o,
        static: s,
        future: Ar({ v7_relativeSplatPath: !1 }, a),
      }),
      [u, a, o, s],
    );
  typeof r == "string" && (r = Qn(r));
  let {
      pathname: m = "/",
      search: f = "",
      hash: g = "",
      state: S = null,
      key: y = "default",
    } = r,
    k = x.useMemo(() => {
      let j = Un(m, u);
      return j == null
        ? null
        : {
            location: { pathname: j, search: f, hash: g, state: S, key: y },
            navigationType: l,
          };
    }, [u, m, f, g, S, y, l]);
  return k == null
    ? null
    : x.createElement(
        jt.Provider,
        { value: c },
        x.createElement(xo.Provider, { children: n, value: k }),
      );
}
function ug(e) {
  let { children: t, location: n } = e;
  return Qm(Ki(t), n);
}
new Promise(() => {});
function Ki(e, t) {
  t === void 0 && (t = []);
  let n = [];
  return (
    x.Children.forEach(e, (r, l) => {
      if (!x.isValidElement(r)) return;
      let o = [...t, l];
      if (r.type === x.Fragment) {
        n.push.apply(n, Ki(r.props.children, o));
        return;
      }
      (r.type !== ot && le(!1), !r.props.index || !r.props.children || le(!1));
      let s = {
        id: r.props.id || o.join("-"),
        caseSensitive: r.props.caseSensitive,
        element: r.props.element,
        Component: r.props.Component,
        index: r.props.index,
        path: r.props.path,
        loader: r.props.loader,
        action: r.props.action,
        errorElement: r.props.errorElement,
        ErrorBoundary: r.props.ErrorBoundary,
        hasErrorBoundary:
          r.props.ErrorBoundary != null || r.props.errorElement != null,
        shouldRevalidate: r.props.shouldRevalidate,
        handle: r.props.handle,
        lazy: r.props.lazy,
      };
      (r.props.children && (s.children = Ki(r.props.children, o)), n.push(s));
    }),
    n
  );
}
/**
 * React Router DOM v6.30.4
 *
 * Copyright (c) Remix Software Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 *
 * @license MIT
 */ function ql() {
  return (
    (ql = Object.assign
      ? Object.assign.bind()
      : function (e) {
          for (var t = 1; t < arguments.length; t++) {
            var n = arguments[t];
            for (var r in n) ({}).hasOwnProperty.call(n, r) && (e[r] = n[r]);
          }
          return e;
        }),
    ql.apply(null, arguments)
  );
}
function hf(e, t) {
  if (e == null) return {};
  var n = {};
  for (var r in e)
    if ({}.hasOwnProperty.call(e, r)) {
      if (t.indexOf(r) !== -1) continue;
      n[r] = e[r];
    }
  return n;
}
function cg(e) {
  return !!(e.metaKey || e.altKey || e.ctrlKey || e.shiftKey);
}
function dg(e, t) {
  return e.button === 0 && (!t || t === "_self") && !cg(e);
}
function Qi(e) {
  return (
    e === void 0 && (e = ""),
    new URLSearchParams(
      typeof e == "string" || Array.isArray(e) || e instanceof URLSearchParams
        ? e
        : Object.keys(e).reduce((t, n) => {
            let r = e[n];
            return t.concat(Array.isArray(r) ? r.map((l) => [n, l]) : [[n, r]]);
          }, []),
    )
  );
}
function fg(e, t) {
  let n = Qi(e);
  return (
    t &&
      t.forEach((r, l) => {
        n.has(l) ||
          t.getAll(l).forEach((o) => {
            n.append(l, o);
          });
      }),
    n
  );
}
const pg = [
    "onClick",
    "relative",
    "reloadDocument",
    "replace",
    "state",
    "target",
    "to",
    "preventScrollReset",
    "viewTransition",
  ],
  hg = [
    "aria-current",
    "caseSensitive",
    "className",
    "end",
    "style",
    "to",
    "viewTransition",
    "children",
  ],
  mg = "6";
try {
  window.__reactRouterVersion = mg;
} catch {}
const gg = x.createContext({ isTransitioning: !1 }),
  vg = "startTransition",
  ju = op[vg];
function xg(e) {
  let { basename: t, children: n, future: r, window: l } = e,
    o = x.useRef();
  o.current == null && (o.current = vm({ window: l, v5Compat: !0 }));
  let s = o.current,
    [a, u] = x.useState({ action: s.action, location: s.location }),
    { v7_startTransition: c } = r || {},
    m = x.useCallback(
      (f) => {
        c && ju ? ju(() => u(f)) : u(f);
      },
      [u, c],
    );
  return (
    x.useLayoutEffect(() => s.listen(m), [s, m]),
    x.useEffect(() => ig(r), [r]),
    x.createElement(ag, {
      basename: t,
      children: n,
      location: a.location,
      navigationType: a.action,
      navigator: s,
      future: r,
    })
  );
}
const yg =
    typeof window < "u" &&
    typeof window.document < "u" &&
    typeof window.document.createElement < "u",
  Sg = /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i,
  wg = x.forwardRef(function (t, n) {
    let {
        onClick: r,
        relative: l,
        reloadDocument: o,
        replace: s,
        state: a,
        target: u,
        to: c,
        preventScrollReset: m,
        viewTransition: f,
      } = t,
      g = hf(t, pg),
      { basename: S } = x.useContext(jt),
      y,
      k = !1;
    if (typeof c == "string" && Sg.test(c) && ((y = c), yg))
      try {
        let h = new URL(window.location.href),
          w = c.startsWith("//") ? new URL(h.protocol + c) : new URL(c),
          _ = Un(w.pathname, S);
        w.origin === h.origin && _ != null
          ? (c = _ + w.search + w.hash)
          : (k = !0);
      } catch {}
    let j = Wm(c, { relative: l }),
      p = _g(c, {
        replace: s,
        state: a,
        target: u,
        preventScrollReset: m,
        relative: l,
        viewTransition: f,
      });
    function d(h) {
      (r && r(h), h.defaultPrevented || p(h));
    }
    return x.createElement(
      "a",
      ql({}, g, { href: y || j, onClick: k || o ? r : d, ref: n, target: u }),
    );
  }),
  kg = x.forwardRef(function (t, n) {
    let {
        "aria-current": r = "page",
        caseSensitive: l = !1,
        className: o = "",
        end: s = !1,
        style: a,
        to: u,
        viewTransition: c,
        children: m,
      } = t,
      f = hf(t, hg),
      g = yo(u, { relative: f.relative }),
      S = mn(),
      y = x.useContext(sf),
      { navigator: k, basename: j } = x.useContext(jt),
      p = y != null && Cg(g) && c === !0,
      d = k.encodeLocation ? k.encodeLocation(g).pathname : g.pathname,
      h = S.pathname,
      w =
        y && y.navigation && y.navigation.location
          ? y.navigation.location.pathname
          : null;
    (l ||
      ((h = h.toLowerCase()),
      (w = w ? w.toLowerCase() : null),
      (d = d.toLowerCase())),
      w && j && (w = Un(w, j) || w));
    const _ = d !== "/" && d.endsWith("/") ? d.length - 1 : d.length;
    let E = h === d || (!s && h.startsWith(d) && h.charAt(_) === "/"),
      C =
        w != null &&
        (w === d || (!s && w.startsWith(d) && w.charAt(d.length) === "/")),
      v = { isActive: E, isPending: C, isTransitioning: p },
      N = E ? r : void 0,
      z;
    typeof o == "function"
      ? (z = o(v))
      : (z = [
          o,
          E ? "active" : null,
          C ? "pending" : null,
          p ? "transitioning" : null,
        ]
          .filter(Boolean)
          .join(" "));
    let R = typeof a == "function" ? a(v) : a;
    return x.createElement(
      wg,
      ql({}, f, {
        "aria-current": N,
        className: z,
        ref: n,
        style: R,
        to: u,
        viewTransition: c,
      }),
      typeof m == "function" ? m(v) : m,
    );
  });
var Ji;
(function (e) {
  ((e.UseScrollRestoration = "useScrollRestoration"),
    (e.UseSubmit = "useSubmit"),
    (e.UseSubmitFetcher = "useSubmitFetcher"),
    (e.UseFetcher = "useFetcher"),
    (e.useViewTransitionState = "useViewTransitionState"));
})(Ji || (Ji = {}));
var _u;
(function (e) {
  ((e.UseFetcher = "useFetcher"),
    (e.UseFetchers = "useFetchers"),
    (e.UseScrollRestoration = "useScrollRestoration"));
})(_u || (_u = {}));
function jg(e) {
  let t = x.useContext(vo);
  return (t || le(!1), t);
}
function _g(e, t) {
  let {
      target: n,
      replace: r,
      state: l,
      preventScrollReset: o,
      relative: s,
      viewTransition: a,
    } = t === void 0 ? {} : t,
    u = ct(),
    c = mn(),
    m = yo(e, { relative: s });
  return x.useCallback(
    (f) => {
      if (dg(f, n)) {
        f.preventDefault();
        let g = r !== void 0 ? r : Zl(c) === Zl(m);
        u(e, {
          replace: g,
          state: l,
          preventScrollReset: o,
          relative: s,
          viewTransition: a,
        });
      }
    },
    [c, u, m, r, l, n, e, o, s, a],
  );
}
function So(e) {
  let t = x.useRef(Qi(e)),
    n = x.useRef(!1),
    r = mn(),
    l = x.useMemo(() => fg(r.search, n.current ? null : t.current), [r.search]),
    o = ct(),
    s = x.useCallback(
      (a, u) => {
        const c = Qi(typeof a == "function" ? a(l) : a);
        ((n.current = !0), o("?" + c, u));
      },
      [o, l],
    );
  return [l, s];
}
function Cg(e, t) {
  t === void 0 && (t = {});
  let n = x.useContext(gg);
  n == null && le(!1);
  let { basename: r } = jg(Ji.useViewTransitionState),
    l = yo(e, { relative: t.relative });
  if (!n.isTransitioning) return !1;
  let o = Un(n.currentLocation.pathname, r) || n.currentLocation.pathname,
    s = Un(n.nextLocation.pathname, r) || n.nextLocation.pathname;
  return Vi(l.pathname, s) != null || Vi(l.pathname, o) != null;
}
const Cu = (e) => {
    let t;
    const n = new Set(),
      r = (c, m) => {
        const f = typeof c == "function" ? c(t) : c;
        if (!Object.is(f, t)) {
          const g = t;
          ((t =
            (m ?? (typeof f != "object" || f === null))
              ? f
              : Object.assign({}, t, f)),
            n.forEach((S) => S(t, g)));
        }
      },
      l = () => t,
      a = {
        setState: r,
        getState: l,
        getInitialState: () => u,
        subscribe: (c) => (n.add(c), () => n.delete(c)),
      },
      u = (t = e(r, l, a));
    return a;
  },
  Eg = (e) => (e ? Cu(e) : Cu),
  bg = (e) => e;
function zg(e, t = bg) {
  const n = ur.useSyncExternalStore(
    e.subscribe,
    ur.useCallback(() => t(e.getState()), [e, t]),
    ur.useCallback(() => t(e.getInitialState()), [e, t]),
  );
  return (ur.useDebugValue(n), n);
}
const Eu = (e) => {
    const t = Eg(e),
      n = (r) => zg(t, r);
    return (Object.assign(n, t), n);
  },
  Xs = (e) => (e ? Eu(e) : Eu);
function Pg(e, t) {
  let n;
  try {
    n = e();
  } catch {
    return;
  }
  return {
    getItem: (l) => {
      var o;
      const s = (u) => (u === null ? null : JSON.parse(u, void 0)),
        a = (o = n.getItem(l)) != null ? o : null;
      return a instanceof Promise ? a.then(s) : s(a);
    },
    setItem: (l, o) => n.setItem(l, JSON.stringify(o, void 0)),
    removeItem: (l) => n.removeItem(l),
  };
}
const Yi = (e) => (t) => {
    try {
      const n = e(t);
      return n instanceof Promise
        ? n
        : {
            then(r) {
              return Yi(r)(n);
            },
            catch(r) {
              return this;
            },
          };
    } catch (n) {
      return {
        then(r) {
          return this;
        },
        catch(r) {
          return Yi(r)(n);
        },
      };
    }
  },
  Ng = (e, t) => (n, r, l) => {
    let o = {
        storage: Pg(() => window.localStorage),
        partialize: (j) => j,
        version: 0,
        merge: (j, p) => ({ ...p, ...j }),
        ...t,
      },
      s = !1,
      a = 0;
    const u = new Set(),
      c = new Set();
    let m = o.storage;
    if (!m)
      return e(
        (...j) => {
          (console.warn(
            `[zustand persist middleware] Unable to update item '${o.name}', the given storage is currently unavailable.`,
          ),
            n(...j));
        },
        r,
        l,
      );
    const f = () => {
        const j = o.partialize({ ...r() });
        return m.setItem(o.name, { state: j, version: o.version });
      },
      g = l.setState;
    l.setState = (j, p) => (g(j, p), f());
    const S = e((...j) => (n(...j), f()), r, l);
    l.getInitialState = () => S;
    let y;
    const k = () => {
      var j, p;
      if (!m) return;
      const d = ++a;
      ((s = !1),
        u.forEach((w) => {
          var _;
          return w((_ = r()) != null ? _ : S);
        }));
      const h =
        ((p = o.onRehydrateStorage) == null
          ? void 0
          : p.call(o, (j = r()) != null ? j : S)) || void 0;
      return Yi(m.getItem.bind(m))(o.name)
        .then((w) => {
          if (w)
            if (typeof w.version == "number" && w.version !== o.version) {
              if (o.migrate) {
                const _ = o.migrate(w.state, w.version);
                return _ instanceof Promise ? _.then((E) => [!0, E]) : [!0, _];
              }
              console.error(
                "State loaded from storage couldn't be migrated since no migrate function was provided",
              );
            } else return [!1, w.state];
          return [!1, void 0];
        })
        .then((w) => {
          var _;
          if (d !== a) return;
          const [E, C] = w;
          if (((y = o.merge(C, (_ = r()) != null ? _ : S)), n(y, !0), E))
            return f();
        })
        .then(() => {
          d === a &&
            (h == null || h(r(), void 0),
            (y = r()),
            (s = !0),
            c.forEach((w) => w(y)));
        })
        .catch((w) => {
          d === a && (h == null || h(void 0, w));
        });
    };
    return (
      (l.persist = {
        setOptions: (j) => {
          ((o = { ...o, ...j }), j.storage && (m = j.storage));
        },
        clearStorage: () => {
          m == null || m.removeItem(o.name);
        },
        getOptions: () => o,
        rehydrate: () => k(),
        hasHydrated: () => s,
        onHydrate: (j) => (
          u.add(j),
          () => {
            u.delete(j);
          }
        ),
        onFinishHydration: (j) => (
          c.add(j),
          () => {
            c.delete(j);
          }
        ),
      }),
      o.skipHydration || k(),
      y || S
    );
  },
  mf = Ng,
  Le = Xs()(
    mf(
      (e) => ({
        token: null,
        username: null,
        mainEncryptionKey: null,
        encryptionEnabled: !0,
        setAuth: (t, n, r) =>
          e({ token: t, username: n, mainEncryptionKey: r }),
        setEncryptionEnabled: (t) => e({ encryptionEnabled: t }),
        logout: () =>
          e({ token: null, username: null, mainEncryptionKey: null }),
      }),
      {
        name: "rain-dms-auth",
        partialize: (e) => ({
          token: e.token,
          username: e.username,
          mainEncryptionKey: e.mainEncryptionKey,
          encryptionEnabled: e.encryptionEnabled,
        }),
      },
    ),
  ),
  Xi = {
    teal: {
      accent: "#14b8a6",
      dim: "#0d9488",
      glow: "rgba(20,184,166,0.12)",
      fg: "#0c1a1a",
    },
    sky: {
      accent: "#38bdf8",
      dim: "#0284c7",
      glow: "rgba(56,189,248,0.12)",
      fg: "#0c1a2e",
    },
    violet: {
      accent: "#a78bfa",
      dim: "#7c3aed",
      glow: "rgba(167,139,250,0.12)",
      fg: "#0c0c1a",
    },
    amber: {
      accent: "#f59e0b",
      dim: "#d97706",
      glow: "rgba(245,158,11,0.12)",
      fg: "#1a0e00",
    },
    rose: {
      accent: "#fb7185",
      dim: "#e11d48",
      glow: "rgba(251,113,133,0.12)",
      fg: "#1a0c0e",
    },
    lime: {
      accent: "#84cc16",
      dim: "#65a30d",
      glow: "rgba(132,204,22,0.12)",
      fg: "#0e1a02",
    },
  };
function gf(e) {
  const t = Xi[e],
    n = document.documentElement;
  (n.style.setProperty("--accent", t.accent),
    n.style.setProperty("--accent-dim", t.dim),
    n.style.setProperty("--accent-glow", t.glow),
    n.style.setProperty("--accent-fg", t.fg));
}
function Rg() {
  return typeof window < "u"
    ? `${window.location.origin}/api`
    : "https://localhost:3000/api";
}
function Lg(e) {
  return e.replace("/api", "");
}
function Tg(e) {
  return `${Lg(e)}/s3`;
}
const vf = [".pdf", ".png", ".jpg", ".jpeg", ".tiff", ".tif", ".bmp", ".webp"],
  Y = Xs()(
    mf(
      (e, t) => ({
        theme: "dark",
        apiUrl: Rg(),
        accent: "teal",
        lang: "en",
        simulatedTagPaths: [],
        allowedUploadExtensions: vf,
        toggleTheme: () => {
          const n = t().theme === "dark" ? "light" : "dark";
          (e({ theme: n }),
            n === "light"
              ? document.documentElement.classList.add("light")
              : document.documentElement.classList.remove("light"));
        },
        setApiUrl: (n) => e({ apiUrl: n.replace(/\/+$/, "") }),
        setAccent: (n) => {
          (e({ accent: n }), gf(n));
        },
        setLang: (n) => e({ lang: n }),
        setSimulatedTagPaths: (n) => e({ simulatedTagPaths: n }),
        setAllowedUploadExtensions: (n) => e({ allowedUploadExtensions: n }),
      }),
      { name: "rain-dms-settings" },
    ),
  );
typeof window < "u" &&
  setTimeout(() => {
    (gf(Y.getState().accent),
      Y.getState().theme === "light" &&
        document.documentElement.classList.add("light"));
  }, 0);
async function Mg(e) {
  const t = await e.arrayBuffer(),
    n = await crypto.subtle.digest("SHA-256", t);
  return Array.from(new Uint8Array(n))
    .map((r) => r.toString(16).padStart(2, "0"))
    .join("");
}
function Gs() {
  return Y.getState().apiUrl;
}
function xf(e) {
  const { token: t, username: n } = Le.getState(),
    r = {};
  return (
    t && (r.Authorization = t),
    n && (r["X-Username"] = n),
    { ...r, ...e }
  );
}
let bu = 0;
function Zs(e) {
  if (e !== 401 && e !== 403) return;
  const t = Date.now();
  if (t - bu < 500) return;
  bu = t;
  const { token: n, logout: r } = Le.getState();
  if (
    n &&
    (r(), typeof window < "u" && !window.location.pathname.startsWith("/login"))
  ) {
    const l = encodeURIComponent(
      window.location.pathname + window.location.search,
    );
    window.location.assign(`/login?next=${l}&reason=unauth`);
  }
}
async function Ct(e, t) {
  const n = `${Gs()}${e}`,
    r = await fetch(n, {
      ...t,
      headers: {
        "Content-Type": "application/json",
        ...xf(),
        ...(t == null ? void 0 : t.headers),
      },
    });
  if (!r.ok) {
    Zs(r.status);
    const l = await r.text().catch(() => "");
    throw new Error(`HTTP ${r.status}: ${l.slice(0, 200)}`);
  }
  return r.json();
}
const Ig = (e, t) =>
    Ct("/auth/signin", {
      method: "POST",
      body: JSON.stringify({ username: e, password: t }),
    }),
  Fg = (e, t) =>
    Ct("/auth/signup", {
      method: "POST",
      body: JSON.stringify({ username: e, password: t }),
    });
async function Dg(e = 0, t = 50, n) {
  const r = new URLSearchParams({ pageIdx: String(e), limit: String(t) });
  n && r.set("tag", n);
  const l = `${Gs()}/main_page?${r}`,
    o = await fetch(l, { headers: xf() });
  if (!o.ok) throw (Zs(o.status), new Error(`HTTP ${o.status}`));
  const s = await o.json(),
    a = parseInt(o.headers.get("X-Total-Count") ?? "0", 10),
    u = parseInt(o.headers.get("X-Page-Count") ?? "0", 10);
  return { data: s, totalCount: a, pageCount: u };
}
const Bg = (e, t) => {
    const n = new URLSearchParams({ query: e, ...t });
    return Ct(`/search?${n}`);
  },
  yf = (e) => Ct(`/pages?filepath=${encodeURIComponent(e)}`),
  Sf = (e) => Ct(`/document?filepath=${encodeURIComponent(e)}`),
  Og = () => Ct("/tags"),
  $g = () => Ct("/dashboard"),
  wf = (e) =>
    Ct(`/delete/consume?filepath=${encodeURIComponent(e)}`, {
      method: "DELETE",
    }),
  Ag = (e) =>
    Ct("/check/hash_exists", {
      method: "POST",
      body: JSON.stringify({ hash: e }),
    });
function Ug(e) {
  return `${Gs()}/download?fileKey=${encodeURIComponent(e)}`;
}
let lr = !1;
const Wg = new Set([
  ".ds_store",
  ".css",
  ".js",
  ".ts",
  ".tsx",
  ".jsx",
  ".html",
  ".htm",
  ".xml",
  ".json",
  ".yaml",
  ".yml",
  ".sh",
  ".bat",
  ".cmd",
  ".exe",
  ".dll",
  ".so",
  ".dylib",
  ".zip",
  ".tar",
  ".gz",
  ".bz2",
  ".7z",
  ".rar",
  ".map",
  ".lock",
  ".log",
  ".git",
  ".gitignore",
  ".env",
  ".ono",
  ".ini",
  ".cfg",
  ".conf",
  ".toml",
  ".rs",
  ".go",
  ".py",
  ".java",
  ".class",
  ".c",
  ".cpp",
  ".h",
  ".hpp",
  ".md",
  ".txt",
  ".csv",
  ".xls",
  ".xlsx",
  ".doc",
  ".docx",
  ".ppt",
  ".pptx",
]);
function Hg(e) {
  const t = e.lastIndexOf(".");
  return t < 0 ? "" : e.slice(t).toLowerCase();
}
function Vg(e, t) {
  const n = e.split("/").pop() ?? e;
  if (n.startsWith(".")) return !0;
  const r = Hg(n);
  return r ? (t.length > 0 ? !t.includes(r) : Wg.has(r)) : !0;
}
const qs = Xs((e, t) => ({
    jobs: [],
    isOpen: !1,
    isMinimized: !1,
    running: !1,
    lastCompletedAt: null,
    addFiles(n) {
      const r = Y.getState().allowedUploadExtensions ?? [],
        l = [],
        o = [];
      for (const { file: s, relativePath: a } of n) {
        const u = crypto.randomUUID();
        Vg(s.name, r)
          ? o.push({
              id: u,
              file: s,
              relativePath: a,
              status: { state: "skipped", reason: "extension" },
            })
          : l.push({
              id: u,
              file: s,
              relativePath: a,
              status: { state: "pending" },
            });
      }
      (l.sort((s, a) => s.file.size - a.file.size),
        e((s) => ({
          jobs: [...s.jobs, ...l, ...o],
          isOpen: !0,
          isMinimized: !1,
        })));
    },
    start() {
      const { jobs: n, running: r } = t();
      if (r) return;
      const l = n.filter((s) => s.status.state === "pending");
      if (!l.length) return;
      ((lr = !1),
        e({ running: !0 }),
        (async () => {
          const { apiUrl: s } = Y.getState(),
            { token: a, username: u } = Le.getState();
          for (const c of l) {
            if (lr) break;
            o(c.id, { state: "hashing" });
            let m;
            try {
              m = await Mg(c.file);
            } catch {
              o(c.id, { state: "error", message: "Hashing failed" });
              continue;
            }
            if (lr) break;
            try {
              const { exists: f } = await Ag(m);
              if (f) {
                o(c.id, { state: "duplicate" });
                continue;
              }
            } catch {}
            if (lr) break;
            o(c.id, { state: "uploading", progress: 0 });
            try {
              const f = new FormData();
              (f.append("file", c.file),
                f.append("relativePath", c.relativePath));
              const g = await fetch(`${s}/upload`, {
                method: "POST",
                headers: { Authorization: a ?? "", "X-Username": u ?? "" },
                body: f,
              });
              if (g.ok)
                (o(c.id, { state: "done" }),
                  e({ lastCompletedAt: Date.now() }));
              else {
                const S = await g.text().catch(() => "");
                o(c.id, {
                  state: "error",
                  message: `HTTP ${g.status}: ${S.slice(0, 80)}`,
                });
              }
            } catch (f) {
              o(c.id, { state: "error", message: f.message });
            }
          }
          e({ running: !1 });
        })());
      function o(s, a) {
        e((u) => ({
          jobs: u.jobs.map((c) => (c.id === s ? { ...c, status: a } : c)),
        }));
      }
    },
    abort() {
      ((lr = !0), e({ running: !1 }));
    },
    clearFinished() {
      e((n) => ({
        jobs: n.jobs.filter(
          (r) =>
            r.status.state === "pending" ||
            r.status.state === "hashing" ||
            r.status.state === "uploading",
        ),
      }));
    },
    toggle() {
      e((n) => ({ isOpen: !n.isOpen, isMinimized: !1 }));
    },
    minimize(n) {
      e({ isMinimized: n });
    },
    removeJob(n) {
      e((r) => ({ jobs: r.jobs.filter((l) => l.id !== n) }));
    },
  })),
  kf = {
    ft_noDocuments: "No documents.",
    ft_filterByPath: "Filter by path…",
    ft_clearFilter: "Clear",
    ft_collapseAll: "Collapse all",
    ft_expandAll: "Expand all",
    ft_toReview: "to review",
    ft_docs: "docs",
    ft_pathLabel: "path:",
    ft_copy: "copy",
    ft_copied: "✓ copied",
    ft_markTodo: "Mark as to-do",
    ft_markDone: "Mark as done",
    ft_showPath: "Show full S3 path",
    ft_openStats: "File stats",
    ft_pages: "p",
    ft_foldersToReview: (e) => `★ ${e} folder${e !== 1 ? "s" : ""} to review`,
    ft_italicNote: "italic = simulated",
    ul_dropHere: "Drop files or folders here",
    ul_folderNote: "Folder structure is preserved under your username",
    ul_browseFiles: "Browse files",
    ul_browseFolder: "Browse folder",
    ul_upload: (e) => `Upload ${e} file${e !== 1 ? "s" : ""}`,
    ul_close: "Close",
    ul_pending: "pending",
    ul_hashing: "hashing…",
    ul_duplicate: "duplicate",
    ul_uploading: "uploading…",
    ul_done: "done",
    sr_placeholder: "Search… tag:label or -exclude",
    sr_search: "Search",
    sr_after: "After",
    sr_before: "Before",
    sr_filterByTag: "Filter by tag",
    sr_noResults: "No results found.",
    sr_results: (e, t) =>
      `${e} hit${e !== 1 ? "s" : ""} across ${t} file${t !== 1 ? "s" : ""}`,
    sr_excluded: "excluded:",
    sr_page: "p.",
    sr_open: "Open",
    sr_groupByFile: "Group by file",
    sr_flat: "Flat",
    main_allDocuments: "All documents",
    main_tagLabel: "Tag:",
    main_tags: "Tags",
    main_all: "All",
    main_filterByFilename: "Filter by name…",
    main_newestFirst: "Newest first",
    main_oldestFirst: "Oldest first",
    main_nameAZ: "Name A–Z",
    main_mostPages: "Most pages",
    main_noDocuments: "No documents yet.",
    main_noMatch: (e) => `No documents matching "${e}"`,
    main_refresh: "Refresh",
    main_grid: "Grid",
    main_tree: "Tree",
    main_documents: (e) =>
      `${e.toLocaleString()} document${e !== 1 ? "s" : ""}`,
    st_language: "Language",
    st_langSub: "Interface language for labels and controls",
    st_english: "English",
    st_german: "Deutsch",
  },
  Kg = {
    ft_noDocuments: "Keine Dokumente.",
    ft_filterByPath: "Nach Pfad filtern…",
    ft_clearFilter: "Löschen",
    ft_collapseAll: "Alle einklappen",
    ft_expandAll: "Alle ausklappen",
    ft_toReview: "zu prüfen",
    ft_docs: "Dok.",
    ft_pathLabel: "Pfad:",
    ft_copy: "kopieren",
    ft_copied: "✓ kopiert",
    ft_markTodo: "Als zu erledigen markieren",
    ft_markDone: "Als erledigt markieren",
    ft_showPath: "Vollständigen S3-Pfad anzeigen",
    ft_openStats: "Dateistatistiken",
    ft_pages: "S.",
    ft_foldersToReview: (e) => `★ ${e} Ordner zu prüfen`,
    ft_italicNote: "kursiv = simuliert",
    ul_dropHere: "Dateien oder Ordner hierher ziehen",
    ul_folderNote: "Ordnerstruktur wird unter deinem Benutzernamen gespeichert",
    ul_browseFiles: "Dateien auswählen",
    ul_browseFolder: "Ordner auswählen",
    ul_upload: (e) => `${e} Datei${e !== 1 ? "en" : ""} hochladen`,
    ul_close: "Schließen",
    ul_pending: "ausstehend",
    ul_hashing: "wird gehasht…",
    ul_duplicate: "Duplikat",
    ul_uploading: "wird hochgeladen…",
    ul_done: "fertig",
    sr_placeholder: "Suchen… tag:Label oder -ausschließen",
    sr_search: "Suchen",
    sr_after: "Nach",
    sr_before: "Vor",
    sr_filterByTag: "Nach Tag filtern",
    sr_noResults: "Keine Ergebnisse gefunden.",
    sr_results: (e, t) => `${e} Treffer in ${t} Datei${t !== 1 ? "en" : ""}`,
    sr_excluded: "ausgeschlossen:",
    sr_page: "S.",
    sr_open: "Öffnen",
    sr_groupByFile: "Nach Datei gruppieren",
    sr_flat: "Liste",
    main_allDocuments: "Alle Dokumente",
    main_tagLabel: "Tag:",
    main_tags: "Tags",
    main_all: "Alle",
    main_filterByFilename: "Nach Name filtern…",
    main_newestFirst: "Neueste zuerst",
    main_oldestFirst: "Älteste zuerst",
    main_nameAZ: "Name A–Z",
    main_mostPages: "Meiste Seiten",
    main_noDocuments: "Noch keine Dokumente.",
    main_noMatch: (e) => `Keine Dokumente für „${e}"`,
    main_refresh: "Aktualisieren",
    main_grid: "Raster",
    main_tree: "Baum",
    main_documents: (e) =>
      `${e.toLocaleString()} Dokument${e !== 1 ? "e" : ""}`,
    st_language: "Sprache",
    st_langSub: "Sprache für Beschriftungen und Steuerelemente",
    st_english: "English",
    st_german: "Deutsch",
  },
  Qg = { en: kf, de: Kg };
function Et() {
  const e = Y((t) => t.lang);
  return Qg[e] ?? kf;
}
async function jf(e, t = "") {
  if (e.isFile)
    return new Promise((n, r) =>
      e.file((l) => n([{ file: l, relativePath: t + l.name }]), r),
    );
  if (e.isDirectory) {
    const n = e.createReader(),
      r = [];
    return (
      await new Promise((o, s) => {
        function a() {
          n.readEntries((u) => {
            if (!u.length) {
              o();
              return;
            }
            (r.push(...u), a());
          }, s);
        }
        a();
      }),
      (await Promise.all(r.map((o) => jf(o, t + e.name + "/")))).flat()
    );
  }
  return [];
}
function Jg(e) {
  return e < 1024
    ? `${e}B`
    : e < 1024 ** 2
      ? `${(e / 1024).toFixed(0)}KB`
      : `${(e / 1024 ** 2).toFixed(1)}MB`;
}
const Yg = {
    pending: "var(--text-3)",
    hashing: "var(--warn)",
    duplicate: "var(--text-3)",
    uploading: "var(--accent)",
    done: "var(--success)",
    skipped: "var(--text-3)",
    error: "var(--danger)",
  },
  Xg = (e) => {
    const t = e.status;
    return t.state === "error"
      ? `✗ ${t.message.slice(0, 50)}`
      : t.state === "skipped"
        ? "— skipped"
        : t.state === "uploading"
          ? `↑ ${t.progress}%`
          : ({
              pending: "·",
              hashing: "⟳ hashing…",
              duplicate: "= dup",
              done: "✓ done",
            }[t.state] ?? t.state);
  };
function Gg() {
  const e = Et(),
    {
      jobs: t,
      isOpen: n,
      isMinimized: r,
      running: l,
      addFiles: o,
      start: s,
      abort: a,
      clearFinished: u,
      toggle: c,
      minimize: m,
      removeJob: f,
    } = qs(),
    g = x.useRef(null),
    S = x.useRef(null),
    y = t.filter((v) => v.status.state === "pending").length,
    k = t.filter(
      (v) => v.status.state === "uploading" || v.status.state === "hashing",
    ).length,
    j = t.filter((v) => v.status.state === "done").length,
    p = t.filter((v) => v.status.state === "error").length,
    d = t.length,
    [h, w] = x.useState(!1),
    _ = (v) => {
      const N = Array.from(v.target.files ?? []);
      (o(N.map((z) => ({ file: z, relativePath: z.name }))),
        (v.target.value = ""));
    },
    E = (v) => {
      const N = Array.from(v.target.files ?? []);
      (o(
        N.map((z) => ({
          file: z,
          relativePath: z.webkitRelativePath || z.name,
        })),
      ),
        (v.target.value = ""));
    },
    C = x.useCallback(
      async (v) => {
        var R;
        (v.preventDefault(), w(!1));
        const N = Array.from(v.dataTransfer.items),
          z = [];
        for (const W of N) {
          if (W.kind !== "file") continue;
          const P = (R = W.webkitGetAsEntry) == null ? void 0 : R.call(W);
          if (P) z.push(...(await jf(P)));
          else {
            const O = W.getAsFile();
            O && z.push({ file: O, relativePath: O.name });
          }
        }
        z.length && o(z);
      },
      [o],
    );
  return n
    ? r
      ? i.jsxs("div", {
          onClick: () => m(!1),
          style: {
            position: "fixed",
            bottom: 20,
            right: 20,
            zIndex: 200,
            background: "var(--bg-surface)",
            border: "1px solid var(--border)",
            borderRadius: 10,
            padding: "8px 14px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 8,
            boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
            userSelect: "none",
          },
          children: [
            i.jsx(zu, {}),
            i.jsx("span", {
              style: {
                fontSize: "0.78rem",
                fontWeight: 600,
                color: "var(--text-1)",
              },
              children: "Uploads",
            }),
            k > 0 &&
              i.jsx("span", {
                style: {
                  background: "var(--accent)",
                  color: "var(--accent-fg)",
                  borderRadius: 999,
                  padding: "1px 7px",
                  fontSize: "0.65rem",
                  fontWeight: 700,
                },
                children: k,
              }),
            p > 0 &&
              i.jsx("span", {
                style: {
                  background: "var(--danger)",
                  color: "#fff",
                  borderRadius: 999,
                  padding: "1px 7px",
                  fontSize: "0.65rem",
                  fontWeight: 700,
                },
                children: p,
              }),
            l &&
              i.jsx("span", {
                style: {
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: "var(--accent)",
                  boxShadow: "0 0 6px var(--accent)",
                  animation: "pulse 1s infinite",
                },
              }),
          ],
        })
      : i.jsxs("div", {
          style: {
            position: "fixed",
            bottom: 20,
            right: 20,
            zIndex: 200,
            width: 400,
            maxWidth: "calc(100vw - 40px)",
            maxHeight: "70vh",
            display: "flex",
            flexDirection: "column",
            background: "var(--bg-surface)",
            border: "1px solid var(--border)",
            borderRadius: 12,
            boxShadow: "0 8px 48px rgba(0,0,0,0.5)",
            overflow: "hidden",
          },
          children: [
            i.jsxs("div", {
              style: {
                padding: "10px 12px",
                borderBottom: "1px solid var(--border-soft)",
                display: "flex",
                alignItems: "center",
                gap: 8,
                flexShrink: 0,
              },
              children: [
                i.jsx(zu, {}),
                i.jsxs("span", {
                  style: { fontWeight: 600, fontSize: "0.85rem", flex: 1 },
                  children: [
                    "Uploads",
                    d > 0 &&
                      i.jsxs("span", {
                        style: {
                          marginLeft: 6,
                          fontSize: "0.68rem",
                          color: "var(--text-3)",
                          fontFamily: "JetBrains Mono, monospace",
                        },
                        children: [
                          j,
                          "/",
                          d,
                          p > 0 &&
                            i.jsxs("span", {
                              style: { color: "var(--danger)", marginLeft: 4 },
                              children: ["· ", p, " err"],
                            }),
                        ],
                      }),
                  ],
                }),
                l
                  ? i.jsx("button", {
                      onClick: a,
                      style: {
                        ...or,
                        color: "var(--danger)",
                        borderColor: "rgba(248,113,113,0.3)",
                      },
                      title: "Abort",
                      children: "■ Stop",
                    })
                  : y > 0
                    ? i.jsxs("button", {
                        onClick: s,
                        style: {
                          ...or,
                          background: "var(--accent-glow)",
                          color: "var(--accent)",
                          borderColor: "var(--accent)",
                        },
                        children: ["▶ ", e.ul_upload(y)],
                      })
                    : null,
                d > 0 &&
                  i.jsx("button", {
                    onClick: u,
                    style: or,
                    title: "Clear done/error",
                    children: "✕ clear",
                  }),
                i.jsx("button", {
                  onClick: () => m(!0),
                  style: { ...or, fontSize: "0.7rem" },
                  title: "Minimize",
                  children: "▼",
                }),
                i.jsx("button", {
                  onClick: c,
                  style: { ...or, fontSize: "0.7rem" },
                  title: "Close",
                  children: "✕",
                }),
              ],
            }),
            i.jsxs("div", {
              onDragOver: (v) => {
                (v.preventDefault(), w(!0));
              },
              onDragLeave: () => w(!1),
              onDrop: C,
              style: {
                margin: "8px 10px 0",
                border: `1.5px dashed ${h ? "var(--accent)" : "var(--border)"}`,
                borderRadius: 7,
                padding: "10px 8px",
                textAlign: "center",
                background: h ? "var(--accent-glow)" : "transparent",
                transition: "border-color 0.12s, background 0.12s",
                flexShrink: 0,
              },
              children: [
                i.jsx("p", {
                  style: {
                    margin: "0 0 6px",
                    fontSize: "0.75rem",
                    color: "var(--text-2)",
                    fontWeight: 500,
                  },
                  children: e.ul_dropHere,
                }),
                i.jsxs("div", {
                  style: { display: "flex", gap: 5, justifyContent: "center" },
                  children: [
                    i.jsx("button", {
                      className: "btn btn-ghost",
                      style: { fontSize: "0.7rem", padding: "3px 9px" },
                      onClick: () => {
                        var v;
                        return (v = g.current) == null ? void 0 : v.click();
                      },
                      children: e.ul_browseFiles,
                    }),
                    i.jsx("button", {
                      className: "btn btn-ghost",
                      style: { fontSize: "0.7rem", padding: "3px 9px" },
                      onClick: () => {
                        var v;
                        return (v = S.current) == null ? void 0 : v.click();
                      },
                      children: e.ul_browseFolder,
                    }),
                  ],
                }),
                i.jsx("input", {
                  ref: g,
                  type: "file",
                  multiple: !0,
                  style: { display: "none" },
                  onChange: _,
                }),
                i.jsx("input", {
                  ref: S,
                  type: "file",
                  multiple: !0,
                  style: { display: "none" },
                  webkitdirectory: "true",
                  directory: "true",
                  onChange: E,
                }),
              ],
            }),
            t.length > 0 &&
              i.jsx("div", {
                style: {
                  flex: 1,
                  overflowY: "auto",
                  padding: "6px 10px 10px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                },
                children: t.map((v) =>
                  i.jsxs(
                    "div",
                    {
                      style: {
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        padding: "4px 7px",
                        background: "var(--bg-raised)",
                        borderRadius: 5,
                        minWidth: 0,
                      },
                      children: [
                        v.status.state === "uploading" &&
                          i.jsx("div", {
                            style: {
                              position: "absolute",
                              bottom: 0,
                              left: 0,
                              height: 2,
                              width: `${v.status.progress}%`,
                              background: "var(--accent)",
                              borderRadius: 1,
                              transition: "width 0.2s",
                            },
                          }),
                        i.jsxs("div", {
                          style: { flex: 1, minWidth: 0 },
                          children: [
                            i.jsx("p", {
                              style: {
                                margin: 0,
                                fontSize: "0.73rem",
                                color: "var(--text-1)",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              },
                              children: v.file.name,
                            }),
                            i.jsxs("p", {
                              style: {
                                margin: 0,
                                fontSize: "0.61rem",
                                color: "var(--text-3)",
                                fontFamily: "JetBrains Mono, monospace",
                              },
                              children: [
                                Jg(v.file.size),
                                v.relativePath !== v.file.name &&
                                  i.jsxs("span", {
                                    style: {
                                      marginLeft: 4,
                                      color: "var(--text-3)",
                                      fontSize: "0.58rem",
                                    },
                                    children: ["→ ", v.relativePath],
                                  }),
                              ],
                            }),
                          ],
                        }),
                        i.jsx("span", {
                          style: {
                            fontSize: "0.65rem",
                            color: Yg[v.status.state] ?? "var(--text-3)",
                            flexShrink: 0,
                            fontFamily: "JetBrains Mono, monospace",
                          },
                          children: Xg(v),
                        }),
                        (v.status.state === "error" ||
                          v.status.state === "skipped") &&
                          i.jsx("button", {
                            onClick: () => f(v.id),
                            style: {
                              background: "none",
                              border: "none",
                              cursor: "pointer",
                              color: "var(--text-3)",
                              fontSize: "0.6rem",
                              padding: "0 2px",
                              flexShrink: 0,
                            },
                            children: "✕",
                          }),
                      ],
                    },
                    v.id,
                  ),
                ),
              }),
          ],
        })
    : null;
}
const or = {
  background: "var(--bg-raised)",
  border: "1px solid var(--border)",
  borderRadius: 4,
  cursor: "pointer",
  color: "var(--text-2)",
  fontSize: "0.65rem",
  padding: "2px 7px",
  whiteSpace: "nowrap",
  flexShrink: 0,
};
function zu() {
  return i.jsxs("svg", {
    width: "13",
    height: "13",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "var(--accent)",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    style: { flexShrink: 0 },
    children: [
      i.jsx("polyline", { points: "16 16 12 12 8 16" }),
      i.jsx("line", { x1: "12", y1: "12", x2: "12", y2: "21" }),
      i.jsx("path", {
        d: "M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3",
      }),
    ],
  });
}
function Zg() {
  const e = Le((y) => y.logout),
    t = Le((y) => y.username),
    n = Y((y) => y.theme),
    r = Y((y) => y.toggleTheme),
    l = ct(),
    { isOpen: o, toggle: s, running: a, jobs: u } = qs(),
    c = u.filter(
      (y) => y.status.state === "uploading" || y.status.state === "hashing",
    ).length,
    m = u.filter((y) => y.status.state === "pending").length,
    f = u.filter((y) => y.status.state === "error").length,
    g = a ? c : m + f;
  function S() {
    (e(), l("/login", { replace: !0 }));
  }
  return i.jsxs("div", {
    style: { display: "flex", height: "100vh", overflow: "hidden" },
    children: [
      i.jsxs("aside", {
        style: {
          width: 210,
          flexShrink: 0,
          background: "var(--bg-surface)",
          borderRight: "1px solid var(--border)",
          display: "flex",
          flexDirection: "column",
        },
        children: [
          i.jsxs("div", {
            style: {
              padding: "16px 18px 12px",
              borderBottom: "1px solid var(--border-soft)",
            },
            children: [
              i.jsxs("div", {
                style: { display: "flex", alignItems: "center", gap: 8 },
                children: [
                  i.jsx(qg, {}),
                  i.jsxs("span", {
                    style: {
                      fontWeight: 700,
                      fontSize: "0.95rem",
                      color: "var(--text-1)",
                      letterSpacing: "-0.02em",
                    },
                    children: [
                      "rain",
                      i.jsx("span", {
                        style: { color: "var(--accent)" },
                        children: "·dms",
                      }),
                    ],
                  }),
                ],
              }),
              t &&
                i.jsx("p", {
                  style: {
                    margin: "5px 0 0",
                    fontSize: "0.68rem",
                    color: "var(--text-3)",
                    fontFamily: "JetBrains Mono, monospace",
                  },
                  children: t,
                }),
            ],
          }),
          i.jsx("div", {
            style: { padding: "10px 10px 4px" },
            children: i.jsxs("button", {
              className: "btn btn-primary",
              style: {
                width: "100%",
                justifyContent: "center",
                gap: 6,
                padding: "8px",
                position: "relative",
              },
              onClick: s,
              children: [
                i.jsx(e0, {}),
                " Upload",
                g > 0 &&
                  i.jsx("span", {
                    style: {
                      position: "absolute",
                      top: -5,
                      right: -5,
                      background: a
                        ? "var(--accent)"
                        : f > 0
                          ? "var(--danger)"
                          : "var(--warn)",
                      color: a ? "var(--accent-fg)" : "#fff",
                      borderRadius: 999,
                      minWidth: 17,
                      height: 17,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "0.6rem",
                      fontWeight: 700,
                      border: "2px solid var(--bg-surface)",
                      animation: a ? "pulse 1.2s ease-in-out infinite" : "none",
                      fontFamily: "JetBrains Mono, monospace",
                    },
                    children: g,
                  }),
              ],
            }),
          }),
          i.jsxs("nav", {
            style: {
              flex: 1,
              padding: "4px 6px",
              display: "flex",
              flexDirection: "column",
              gap: 1,
            },
            children: [
              i.jsx(dl, {
                to: "/",
                label: "Documents",
                icon: i.jsx(t0, {}),
                end: !0,
              }),
              i.jsx(dl, {
                to: "/search",
                label: "Search",
                icon: i.jsx(n0, {}),
              }),
              i.jsx(dl, { to: "/stats", label: "Stats", icon: i.jsx(r0, {}) }),
            ],
          }),
          i.jsxs("div", {
            style: {
              padding: "6px",
              borderTop: "1px solid var(--border-soft)",
              display: "flex",
              flexDirection: "column",
              gap: 1,
            },
            children: [
              i.jsx(dl, {
                to: "/settings",
                label: "Settings",
                icon: i.jsx(l0, {}),
              }),
              i.jsxs("button", {
                className: "btn btn-ghost",
                style: {
                  justifyContent: "flex-start",
                  gap: 8,
                  padding: "6px 10px",
                  fontSize: "0.82rem",
                },
                onClick: r,
                children: [
                  n === "dark" ? i.jsx(i0, {}) : i.jsx(s0, {}),
                  i.jsx("span", {
                    children: n === "dark" ? "Light mode" : "Dark mode",
                  }),
                ],
              }),
              i.jsxs("button", {
                className: "btn btn-ghost",
                style: {
                  justifyContent: "flex-start",
                  gap: 8,
                  padding: "6px 10px",
                  color: "var(--danger)",
                  fontSize: "0.82rem",
                },
                onClick: S,
                children: [
                  i.jsx(o0, {}),
                  i.jsx("span", { children: "Sign out" }),
                ],
              }),
            ],
          }),
        ],
      }),
      i.jsx("main", {
        style: {
          flex: 1,
          minWidth: 0,
          overflow: "auto",
          background: "var(--bg-base)",
        },
        children: i.jsx(sg, {}),
      }),
      i.jsx(Gg, {}),
    ],
  });
}
function dl({ to: e, label: t, icon: n, end: r }) {
  return i.jsxs(kg, {
    to: e,
    end: r,
    style: ({ isActive: l }) => ({
      display: "flex",
      alignItems: "center",
      gap: 8,
      padding: "6px 10px",
      borderRadius: 6,
      textDecoration: "none",
      fontSize: "0.82rem",
      fontWeight: 500,
      color: l ? "var(--accent)" : "var(--text-2)",
      background: l ? "var(--accent-glow)" : "transparent",
      transition: "background 0.1s, color 0.1s",
    }),
    children: [n, t],
  });
}
function qg() {
  return i.jsxs("svg", {
    width: "20",
    height: "20",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "var(--accent)",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    children: [
      i.jsx("path", { d: "M20 17.58A5 5 0 0 0 18 8h-1.26A8 8 0 1 0 4 16.25" }),
      i.jsx("line", { x1: "8", y1: "16", x2: "8", y2: "22" }),
      i.jsx("line", { x1: "8", y1: "22", x2: "6", y2: "19" }),
      i.jsx("line", { x1: "12", y1: "17", x2: "12", y2: "23" }),
      i.jsx("line", { x1: "12", y1: "23", x2: "10", y2: "20" }),
      i.jsx("line", { x1: "16", y1: "16", x2: "16", y2: "22" }),
      i.jsx("line", { x1: "16", y1: "22", x2: "14", y2: "19" }),
    ],
  });
}
function e0() {
  return i.jsxs("svg", {
    width: "13",
    height: "13",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2.5",
    strokeLinecap: "round",
    children: [
      i.jsx("line", { x1: "12", y1: "5", x2: "12", y2: "19" }),
      i.jsx("line", { x1: "5", y1: "12", x2: "19", y2: "12" }),
    ],
  });
}
function t0() {
  return i.jsxs("svg", {
    width: "14",
    height: "14",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    children: [
      i.jsx("path", {
        d: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z",
      }),
      i.jsx("polyline", { points: "14 2 14 8 20 8" }),
    ],
  });
}
function n0() {
  return i.jsxs("svg", {
    width: "14",
    height: "14",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    children: [
      i.jsx("circle", { cx: "11", cy: "11", r: "8" }),
      i.jsx("line", { x1: "21", y1: "21", x2: "16.65", y2: "16.65" }),
    ],
  });
}
function r0() {
  return i.jsxs("svg", {
    width: "14",
    height: "14",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    children: [
      i.jsx("line", { x1: "18", y1: "20", x2: "18", y2: "10" }),
      i.jsx("line", { x1: "12", y1: "20", x2: "12", y2: "4" }),
      i.jsx("line", { x1: "6", y1: "20", x2: "6", y2: "14" }),
    ],
  });
}
function l0() {
  return i.jsxs("svg", {
    width: "14",
    height: "14",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    children: [
      i.jsx("circle", { cx: "12", cy: "12", r: "3" }),
      i.jsx("path", {
        d: "M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z",
      }),
    ],
  });
}
function o0() {
  return i.jsxs("svg", {
    width: "14",
    height: "14",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    children: [
      i.jsx("path", { d: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" }),
      i.jsx("polyline", { points: "16 17 21 12 16 7" }),
      i.jsx("line", { x1: "21", y1: "12", x2: "9", y2: "12" }),
    ],
  });
}
function i0() {
  return i.jsxs("svg", {
    width: "14",
    height: "14",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    children: [
      i.jsx("circle", { cx: "12", cy: "12", r: "5" }),
      i.jsx("line", { x1: "12", y1: "1", x2: "12", y2: "3" }),
      i.jsx("line", { x1: "12", y1: "21", x2: "12", y2: "23" }),
      i.jsx("line", { x1: "4.22", y1: "4.22", x2: "5.64", y2: "5.64" }),
      i.jsx("line", { x1: "18.36", y1: "18.36", x2: "19.78", y2: "19.78" }),
      i.jsx("line", { x1: "1", y1: "12", x2: "3", y2: "12" }),
      i.jsx("line", { x1: "21", y1: "12", x2: "23", y2: "12" }),
      i.jsx("line", { x1: "4.22", y1: "19.78", x2: "5.64", y2: "18.36" }),
      i.jsx("line", { x1: "18.36", y1: "5.64", x2: "19.78", y2: "4.22" }),
    ],
  });
}
function s0() {
  return i.jsx("svg", {
    width: "14",
    height: "14",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    children: i.jsx("path", {
      d: "M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z",
    }),
  });
}
const Wn = 12;
function _f(e) {
  return Uint8Array.from(atob(e), (t) => t.charCodeAt(0));
}
function a0(e) {
  const t = new Uint8Array(Math.floor(e.length / 2));
  for (let n = 0; n + 1 < e.length; n += 2)
    t[n / 2] = parseInt(e.slice(n, n + 2), 16);
  return t;
}
function fn(e) {
  return e.buffer.slice(e.byteOffset, e.byteOffset + e.byteLength);
}
async function u0(e) {
  const t = new TextEncoder().encode(e),
    n = await crypto.subtle.digest("SHA-256", t);
  return crypto.subtle.importKey("raw", n, { name: "AES-GCM" }, !1, [
    "decrypt",
    "encrypt",
  ]);
}
async function ea(e) {
  return crypto.subtle.importKey("raw", fn(a0(e)), { name: "AES-GCM" }, !1, [
    "decrypt",
    "encrypt",
  ]);
}
async function Pu(e, t, n) {
  try {
    const r = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: fn(e) },
      n,
      fn(t),
    );
    return new TextDecoder().decode(r);
  } catch {
    return null;
  }
}
async function c0(e, t) {
  let n = e;
  try {
    const a = JSON.parse(n);
    typeof a == "string" && (n = a);
  } catch {}
  const r = _f(n),
    l = r.slice(0, Wn),
    o = r.slice(Wn),
    s = await Pu(l, o, await u0(t));
  if (s !== null) return s;
  if (/^[0-9a-fA-F]{64}$/.test(t)) {
    const a = await Pu(l, o, await ea(t));
    if (a !== null)
      return (
        console.info("[crypto] used direct-hex fallback (old server format)"),
        a
      );
  }
  throw new Error(
    "Failed to decrypt the main encryption key. Wrong password or incompatible server format.",
  );
}
async function d0(e, t) {
  let n = e;
  try {
    const u = JSON.parse(n);
    typeof u == "string" && (n = u);
  } catch {}
  const r = _f(n),
    l = r.slice(0, Wn),
    o = r.slice(Wn),
    s = await ea(t),
    a = await crypto.subtle.decrypt({ name: "AES-GCM", iv: fn(l) }, s, fn(o));
  return new TextDecoder().decode(a);
}
async function f0(e, t) {
  const n = new Uint8Array(e),
    r = n.slice(0, Wn),
    l = n.slice(Wn),
    o = await ea(t);
  return crypto.subtle.decrypt({ name: "AES-GCM", iv: fn(r) }, o, fn(l));
}
function p0() {
  const e = ct(),
    [t] = So(),
    n = Le((C) => C.setAuth),
    r = Y((C) => C.apiUrl),
    l = Y((C) => C.setApiUrl),
    o = (() => {
      const C = t.get("next");
      if (!C) return "/";
      try {
        const v = decodeURIComponent(C);
        return v.startsWith("/") ? v : "/";
      } catch {
        return "/";
      }
    })(),
    s = t.get("reason"),
    [a, u] = x.useState("signin"),
    [c, m] = x.useState(""),
    [f, g] = x.useState(""),
    [S, y] = x.useState(null),
    [k, j] = x.useState(!1),
    [p, d] = x.useState(!1),
    [h, w] = x.useState(r);
  function _() {
    l(h);
  }
  async function E(C) {
    (C.preventDefault(), y(null), j(!0), h !== r && l(h));
    try {
      if (a === "signup") {
        (await Fg(c.trim(), f), u("signin"), g(""), j(!1));
        return;
      }
      const v = await Ig(c.trim(), f);
      let N = null;
      if (v.encrypted_encrytion_key)
        try {
          N = await c0(v.encrypted_encrytion_key, f);
        } catch (z) {
          console.warn("[login] main key decrypt failed:", z);
        }
      (n(v.token, c.trim(), N), e(o, { replace: !0 }));
    } catch (v) {
      y(v.message ?? "Something went wrong");
    } finally {
      j(!1);
    }
  }
  return i.jsx("div", {
    style: {
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "var(--bg-base)",
      padding: 24,
    },
    children: i.jsxs("div", {
      style: { width: "100%", maxWidth: 400 },
      children: [
        i.jsxs("div", {
          style: { textAlign: "center", marginBottom: 28 },
          children: [
            i.jsx(h0, {}),
            i.jsxs("h1", {
              style: {
                margin: "10px 0 4px",
                fontSize: "1.65rem",
                fontWeight: 700,
                letterSpacing: "-0.03em",
                color: "var(--text-1)",
              },
              children: [
                "rain",
                i.jsx("span", {
                  style: { color: "var(--accent)" },
                  children: "-dms",
                }),
              ],
            }),
            i.jsx("p", {
              style: { margin: 0, fontSize: "0.8rem", color: "var(--text-3)" },
              children: "document management system",
            }),
          ],
        }),
        s === "unauth" &&
          i.jsx("p", {
            style: {
              margin: "0 0 14px",
              padding: "8px 12px",
              background: "rgba(245,158,11,0.08)",
              border: "1px solid rgba(245,158,11,0.3)",
              borderRadius: 6,
              color: "var(--warn)",
              fontSize: "0.78rem",
              textAlign: "center",
            },
            children: "Your session expired. Please sign in again.",
          }),
        i.jsxs("div", {
          className: "card",
          style: { padding: "24px 24px 20px" },
          children: [
            i.jsx("div", {
              style: {
                display: "flex",
                background: "var(--bg-raised)",
                borderRadius: 7,
                padding: 3,
                marginBottom: 20,
              },
              children: ["signin", "signup"].map((C) =>
                i.jsx(
                  "button",
                  {
                    onClick: () => {
                      (u(C), y(null));
                    },
                    style: {
                      flex: 1,
                      padding: "6px",
                      border: "none",
                      borderRadius: 5,
                      fontSize: "0.83rem",
                      fontWeight: 600,
                      cursor: "pointer",
                      transition: "background 0.15s, color 0.15s",
                      background: a === C ? "var(--bg-surface)" : "transparent",
                      color: a === C ? "var(--text-1)" : "var(--text-3)",
                      boxShadow: a === C ? "0 1px 3px rgba(0,0,0,0.2)" : "none",
                    },
                    children: C === "signin" ? "Sign in" : "Sign up",
                  },
                  C,
                ),
              ),
            }),
            i.jsxs("form", {
              onSubmit: E,
              style: { display: "flex", flexDirection: "column", gap: 13 },
              children: [
                i.jsxs("div", {
                  children: [
                    i.jsx("label", {
                      className: "label",
                      children: "Username",
                    }),
                    i.jsx("input", {
                      className: "input",
                      type: "text",
                      autoComplete: "username",
                      autoFocus: !0,
                      placeholder: "admin",
                      value: c,
                      onChange: (C) => m(C.target.value),
                      required: !0,
                    }),
                  ],
                }),
                i.jsxs("div", {
                  children: [
                    i.jsx("label", {
                      className: "label",
                      children: "Password",
                    }),
                    i.jsx("input", {
                      className: "input",
                      type: "password",
                      autoComplete:
                        a === "signup" ? "new-password" : "current-password",
                      placeholder: "••••••••",
                      value: f,
                      onChange: (C) => g(C.target.value),
                      required: !0,
                    }),
                  ],
                }),
                S &&
                  i.jsx("p", {
                    style: {
                      margin: 0,
                      padding: "8px 12px",
                      background: "rgba(248,113,113,0.08)",
                      border: "1px solid rgba(248,113,113,0.25)",
                      borderRadius: 6,
                      color: "var(--danger)",
                      fontSize: "0.8rem",
                    },
                    children: S,
                  }),
                i.jsx("button", {
                  className: "btn btn-primary",
                  type: "submit",
                  disabled: k,
                  style: {
                    justifyContent: "center",
                    padding: "9px",
                    marginTop: 2,
                    opacity: k ? 0.6 : 1,
                  },
                  children: k
                    ? "Working…"
                    : a === "signin"
                      ? "Sign in"
                      : "Create account",
                }),
              ],
            }),
            i.jsxs("div", {
              style: {
                marginTop: 16,
                borderTop: "1px solid var(--border-soft)",
                paddingTop: 12,
              },
              children: [
                i.jsxs("button", {
                  onClick: () => d((C) => !C),
                  style: {
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "var(--text-3)",
                    fontSize: "0.75rem",
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    padding: 0,
                  },
                  children: [
                    i.jsx("span", {
                      style: {
                        display: "inline-block",
                        transition: "transform 0.15s",
                        transform: p ? "rotate(90deg)" : "none",
                      },
                      children: "›",
                    }),
                    " ",
                    "Advanced",
                  ],
                }),
                p &&
                  i.jsxs("div", {
                    style: { marginTop: 10 },
                    children: [
                      i.jsx("label", {
                        className: "label",
                        children: "API base URL",
                      }),
                      i.jsxs("div", {
                        style: { display: "flex", gap: 6 },
                        children: [
                          i.jsx("input", {
                            className: "input",
                            value: h,
                            onChange: (C) => w(C.target.value),
                            placeholder: "https://192.168.1.188:7443/api",
                            style: {
                              fontFamily: "JetBrains Mono, monospace",
                              fontSize: "0.75rem",
                            },
                          }),
                          i.jsx("button", {
                            className: "btn btn-ghost",
                            type: "button",
                            onClick: _,
                            style: { flexShrink: 0, fontSize: "0.78rem" },
                            children: "Save",
                          }),
                        ],
                      }),
                      i.jsxs("p", {
                        style: {
                          margin: "5px 0 0",
                          fontSize: "0.7rem",
                          color: "var(--text-3)",
                        },
                        children: [
                          "Defaults to",
                          " ",
                          i.jsxs("span", {
                            className: "mono",
                            style: { color: "var(--text-2)" },
                            children: [window.location.origin, "/api"],
                          }),
                        ],
                      }),
                    ],
                  }),
              ],
            }),
          ],
        }),
        i.jsx("p", {
          style: {
            textAlign: "center",
            marginTop: 16,
            fontSize: "0.7rem",
            color: "var(--text-3)",
            fontFamily: "JetBrains Mono, monospace",
          },
          children: "self-hosted · end-to-end encrypted",
        }),
      ],
    }),
  });
}
function h0() {
  return i.jsxs("svg", {
    width: "44",
    height: "44",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "var(--accent)",
    strokeWidth: "1.5",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    style: { margin: "0 auto", display: "block" },
    children: [
      i.jsx("path", { d: "M20 17.58A5 5 0 0 0 18 8h-1.26A8 8 0 1 0 4 16.25" }),
      i.jsx("line", { x1: "8", y1: "16", x2: "8", y2: "22" }),
      i.jsx("line", { x1: "8", y1: "22", x2: "6", y2: "19" }),
      i.jsx("line", { x1: "12", y1: "17", x2: "12", y2: "23" }),
      i.jsx("line", { x1: "12", y1: "23", x2: "10", y2: "20" }),
      i.jsx("line", { x1: "16", y1: "16", x2: "16", y2: "22" }),
      i.jsx("line", { x1: "16", y1: "22", x2: "14", y2: "19" }),
    ],
  });
}
function m0(e, t) {
  var o;
  if (
    e[0] === 82 &&
    e[1] === 73 &&
    e[2] === 70 &&
    e[3] === 70 &&
    e[8] === 87 &&
    e[9] === 69 &&
    e[10] === 66 &&
    e[11] === 80
  )
    return "image/webp";
  if (e[0] === 255 && e[1] === 216 && e[2] === 255) return "image/jpeg";
  if (e[0] === 137 && e[1] === 80 && e[2] === 78 && e[3] === 71)
    return "image/png";
  const r =
    ((o = t
      .replace(/\.enc$/i, "")
      .split(".")
      .pop()) == null
      ? void 0
      : o.toLowerCase()) ?? "";
  return (
    {
      webp: "image/webp",
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
    }[r] ?? "image/jpeg"
  );
}
function g0(e, t) {
  return !e || /^https?:\/\//i.test(e)
    ? e
    : `${t.replace(/\/$/, "")}/${e.replace(/^\//, "")}`;
}
function wo({
  src: e,
  encryptedFileKey: t,
  alt: n = "",
  className: r,
  style: l,
  onLoad: o,
}) {
  const [s, a] = x.useState(null),
    [u, c] = x.useState(!1),
    m = x.useRef(null),
    f = Le((j) => j.mainEncryptionKey),
    g = Le((j) => j.token),
    S = Le((j) => j.username),
    y = Y((j) => j.apiUrl),
    k = Tg(y);
  return (
    x.useEffect(() => {
      if (!e) return;
      let j = !1;
      async function p() {
        c(!1);
        try {
          const d = g0(e, k),
            h = {};
          (g && (h.Authorization = g),
            S && ((h["X-Username"] = S), (h.username = S)));
          const w = await fetch(d, { headers: h });
          if (!w.ok)
            throw (Zs(w.status), new Error(`HTTP ${w.status} for ${d}`));
          let _ = await w.arrayBuffer();
          if (t && f)
            try {
              const z = await d0(t, f);
              _ = await f0(_, z);
            } catch (z) {
              console.warn("[AuthImage] decryption failed:", z, { src: e });
            }
          if (j) return;
          const E = new Uint8Array(_),
            C = m0(E, e),
            v = new Blob([_], { type: C }),
            N = URL.createObjectURL(v);
          (m.current && URL.revokeObjectURL(m.current), (m.current = N), a(N));
        } catch (d) {
          (console.warn("[AuthImage] load failed:", d, { src: e }), j || c(!0));
        }
      }
      return (
        p(),
        () => {
          j = !0;
        }
      );
    }, [e, t, f, k, g, S]),
    x.useEffect(
      () => () => {
        m.current && URL.revokeObjectURL(m.current);
      },
      [],
    ),
    u
      ? i.jsx("div", {
          className: r,
          style: {
            ...l,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "var(--bg-raised)",
            color: "var(--text-3)",
            fontSize: "0.7rem",
          },
          children: "—",
        })
      : s
        ? i.jsx("img", {
            src: s,
            alt: n,
            className: r,
            style: l,
            draggable: !1,
            onLoad: (j) => {
              const p = j.currentTarget;
              o == null || o(p.naturalWidth, p.naturalHeight);
            },
          })
        : i.jsx("div", {
            className: r,
            style: {
              ...l,
              background: "var(--bg-raised)",
              animation: "pulse 1.5s ease-in-out infinite",
            },
          })
  );
}
function v0(e) {
  if (!e) return "?";
  const t = e.split(".");
  return t.length > 1 ? t[t.length - 1].toUpperCase() : "?";
}
function x0(e) {
  return e
    ? (e.split("/").pop() ?? e)
        .replace(
          /-[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}(\.[^.]+)$/i,
          "$1",
        )
        .replace(
          /-\d{4}-\d{2}-\d{2}[T_]\d{2}[:\-]\d{2}[:\-]\d{2}[\.\dZ]*(\.[^.]+)$/i,
          "$1",
        )
    : "Unknown";
}
function y0(e) {
  if (!e) return "—";
  const t = Date.now() - new Date(e).getTime();
  return t < 6e4
    ? "just now"
    : t < 36e5
      ? `${Math.floor(t / 6e4)}m ago`
      : t < 864e5
        ? `${Math.floor(t / 36e5)}h ago`
        : `${Math.floor(t / 864e5)}d ago`;
}
function S0({ doc: e }) {
  var s;
  const t = ct(),
    [n, r] = x.useState(!1),
    l = v0(e.fileS3Key ?? ""),
    o = x0(e.fileS3Key ?? "");
  return e.fileS3Key
    ? i.jsxs("div", {
        className: "doc-card card cursor-pointer",
        onClick: () =>
          t(`/document?filepath=${encodeURIComponent(e.fileS3Key)}`),
        children: [
          i.jsxs("div", {
            style: {
              height: 130,
              overflow: "hidden",
              borderRadius: "9px 9px 0 0",
              background: "var(--bg-raised)",
              position: "relative",
            },
            children: [
              e.banner_img
                ? i.jsx(wo, {
                    src: e.banner_img,
                    encryptedFileKey: e.encrypted_file_key,
                    alt: o,
                    style: {
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    },
                  })
                : i.jsx("div", {
                    style: {
                      width: "100%",
                      height: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "var(--text-3)",
                      fontSize: "1.6rem",
                      fontFamily: "JetBrains Mono, monospace",
                      letterSpacing: "0.05em",
                    },
                    children: l,
                  }),
              i.jsx("span", {
                style: {
                  position: "absolute",
                  top: 7,
                  right: 7,
                  background: "var(--badge-bg)",
                  backdropFilter: "blur(8px)",
                  color: "var(--accent)",
                  fontSize: "0.62rem",
                  fontWeight: 700,
                  fontFamily: "JetBrains Mono, monospace",
                  padding: "2px 5px",
                  borderRadius: 4,
                  letterSpacing: "0.05em",
                  zIndex: 3,
                },
                children: l,
              }),
              i.jsx("button", {
                title: "Open file stats",
                "aria-label": "Open file stats",
                onClick: (a) => {
                  (a.stopPropagation(),
                    t(
                      `/file-stats?filepath=${encodeURIComponent(e.fileS3Key)}`,
                    ));
                },
                style: {
                  position: "absolute",
                  top: 7,
                  right: 38,
                  background: "var(--badge-bg)",
                  backdropFilter: "blur(8px)",
                  border: "none",
                  borderRadius: 4,
                  cursor: "pointer",
                  color: "var(--text-1)",
                  fontSize: "0.72rem",
                  padding: "3px 6px",
                  lineHeight: 1,
                  zIndex: 4,
                },
                children: "⎙",
              }),
              i.jsx("button", {
                title: "Show full path",
                "aria-label": "Show full path",
                onClick: (a) => {
                  (a.stopPropagation(), r((u) => !u));
                },
                style: {
                  position: "absolute",
                  top: 7,
                  left: 7,
                  background: "var(--badge-bg)",
                  backdropFilter: "blur(8px)",
                  border: "none",
                  borderRadius: 4,
                  cursor: "pointer",
                  color: "var(--text-1)",
                  fontSize: "0.72rem",
                  padding: "3px 6px",
                  lineHeight: 1,
                  opacity: n ? 1 : 0.65,
                  transition: "opacity 0.15s",
                  zIndex: 4,
                },
                className: "card-info-btn",
                children: "ⓘ",
              }),
              n &&
                i.jsxs("div", {
                  onClick: (a) => a.stopPropagation(),
                  style: {
                    position: "absolute",
                    inset: 0,
                    background: "var(--overlay-bg)",
                    backdropFilter: "blur(3px)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "8px",
                    gap: 6,
                    zIndex: 5,
                  },
                  children: [
                    i.jsx("span", {
                      style: {
                        fontSize: "0.6rem",
                        fontFamily: "JetBrains Mono, monospace",
                        color: "var(--text-1)",
                        wordBreak: "break-all",
                        textAlign: "center",
                        lineHeight: 1.5,
                      },
                      children: e.fileS3Key,
                    }),
                    i.jsx("button", {
                      onClick: (a) => {
                        (a.stopPropagation(), r(!1));
                      },
                      className: "btn btn-ghost",
                      style: { fontSize: "0.65rem", padding: "2px 8px" },
                      children: "Close",
                    }),
                  ],
                }),
            ],
          }),
          i.jsxs("div", {
            style: { padding: "9px 11px 11px" },
            children: [
              i.jsx("p", {
                style: {
                  margin: 0,
                  fontSize: "0.78rem",
                  fontWeight: 600,
                  color: "var(--text-1)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  fontFamily: "JetBrains Mono, monospace",
                },
                title: o,
                children: o,
              }),
              i.jsxs("div", {
                style: {
                  display: "flex",
                  gap: 8,
                  alignItems: "center",
                  marginTop: 5,
                },
                children: [
                  i.jsx("span", {
                    style: { fontSize: "0.68rem", color: "var(--text-3)" },
                    children: y0(e.created_at),
                  }),
                  i.jsxs("span", {
                    style: {
                      fontSize: "0.68rem",
                      color: "var(--text-3)",
                      marginLeft: "auto",
                    },
                    children: [e.page_count, "p"],
                  }),
                ],
              }),
              ((s = e.assigned_tags) == null ? void 0 : s.length) > 0 &&
                i.jsxs("div", {
                  style: {
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 3,
                    marginTop: 7,
                  },
                  children: [
                    e.assigned_tags
                      .slice(0, 3)
                      .map((a) =>
                        i.jsx(
                          "span",
                          {
                            className: "tag",
                            style: { pointerEvents: "none" },
                            children: a,
                          },
                          a,
                        ),
                      ),
                    e.assigned_tags.length > 3 &&
                      i.jsxs("span", {
                        style: { fontSize: "0.65rem", color: "var(--text-3)" },
                        children: ["+", e.assigned_tags.length - 3],
                      }),
                  ],
                }),
            ],
          }),
          i.jsx("style", {
            children:
              ".doc-card:hover .card-info-btn { opacity: 1 !important; }",
          }),
        ],
      })
    : null;
}
function w0(e, t) {
  var l;
  const n = { name: "", fullPath: "", children: new Map(), docCount: 0 };
  for (const o of e) {
    if (!(o != null && o.fileS3Key)) continue;
    const s =
      (l = o.assigned_tags) != null && l.length
        ? o.assigned_tags
        : ["Untagged"];
    let a = n;
    for (let c = 0; c < s.length; c++) {
      const m = s[c];
      (a.children.has(m) ||
        a.children.set(m, {
          name: m,
          fullPath: s.slice(0, c + 1).join("/"),
          children: new Map(),
          docCount: 0,
        }),
        (a = a.children.get(m)));
    }
    const u = `__doc__${o.fileS3Key}`;
    a.children.set(u, {
      name: Gi(o.fileS3Key.split("/").pop() ?? o.fileS3Key),
      fullPath: o.fileS3Key,
      children: new Map(),
      doc: o,
      docCount: 1,
    });
  }
  for (const o of t) {
    const s = o
      .split("/")
      .map((u) => u.trim())
      .filter(Boolean);
    let a = n;
    for (let u = 0; u < s.length; u++) {
      const c = s[u];
      (a.children.has(c) ||
        a.children.set(c, {
          name: c,
          fullPath: s.slice(0, u + 1).join("/"),
          children: new Map(),
          isSimulated: !0,
          docCount: 0,
        }),
        (a = a.children.get(c)));
    }
  }
  function r(o) {
    if (o.doc) return 1;
    let s = 0;
    for (const a of o.children.values()) s += r(a);
    return ((o.docCount = s), s);
  }
  return (r(n), n);
}
function Gi(e) {
  return e
    .replace(
      /-[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}(\.[^.]+)$/i,
      "$1",
    )
    .replace(
      /-\d{4}-\d{2}-\d{2}[T_]\d{2}[:\-]\d{2}[:\-]\d{2}[\.\dZ]*(\.[^.]+)$/i,
      "$1",
    );
}
function Cf(e, t, n) {
  switch (n) {
    case "alpha":
    case "name_asc":
      return Gi(e.fileS3Key).localeCompare(Gi(t.fileS3Key), void 0, {
        numeric: !0,
        sensitivity: "base",
      });
    case "date_desc":
      return (
        new Date(t.created_at).getTime() - new Date(e.created_at).getTime()
      );
    case "date_asc":
      return (
        new Date(e.created_at).getTime() - new Date(t.created_at).getTime()
      );
    case "pages_desc":
      return (t.page_count ?? 0) - (e.page_count ?? 0);
  }
}
function k0() {
  try {
    return new Set(JSON.parse(localStorage.getItem("rain-dms-todo") ?? "[]"));
  } catch {
    return new Set();
  }
}
function j0(e) {
  localStorage.setItem("rain-dms-todo", JSON.stringify([...e]));
}
function Ef(e, t) {
  var r;
  if (!t) return !0;
  const n = t.toLowerCase();
  if (
    e.name.toLowerCase().includes(n) ||
    ((r = e.doc) != null && r.fileS3Key.toLowerCase().includes(n))
  )
    return !0;
  for (const l of e.children.values()) if (Ef(l, t)) return !0;
  return !1;
}
function bf(e, t) {
  var r;
  if (!t) return !0;
  const n = t.toLowerCase();
  if ((r = e.doc) != null && r.fileS3Key.toLowerCase().includes(n)) return !0;
  for (const l of e.children.values()) if (bf(l, n)) return !0;
  return !1;
}
function zf({
  node: e,
  depth: t,
  todo: n,
  onToggleTodo: r,
  filter: l,
  sortKey: o,
  pathFilter: s,
  selectedPath: a,
  onSelect: u,
  openSet: c,
  onToggleOpen: m,
}) {
  var O;
  const f = ct(),
    g = Et(),
    S = !!e.doc,
    y = S ? !1 : c.has(e.fullPath),
    [k, j] = x.useState(!1),
    [p, d] = x.useState(!1),
    [h, w] = x.useState(!1),
    _ = n.has(e.fullPath),
    E = !!e.isSimulated && !S,
    C = a === ((O = e.doc) == null ? void 0 : O.fileS3Key);
  if ((l && !Ef(e, l)) || (s && !bf(e, s))) return null;
  const v = 20,
    N = 8 + t * v,
    z = 8 + t * v + 7,
    R = [...e.children.values()].sort(($, Q) => {
      const T = !!$.doc,
        b = !!Q.doc;
      return o === "alpha" || o === "name_asc"
        ? $.name.localeCompare(Q.name, void 0, { numeric: !0 })
        : T !== b
          ? T
            ? 1
            : -1
          : T && b && $.doc && Q.doc
            ? Cf($.doc, Q.doc, o)
            : $.name.localeCompare(Q.name, void 0, { numeric: !0 });
    });
  function W($) {
    var Q;
    (Q = navigator.clipboard) == null ||
      Q.writeText($).then(
        () => {
          (w(!0), setTimeout(() => w(!1), 1400));
        },
        () => {},
      );
  }
  const P = C ? "var(--accent-glow)" : k ? "var(--bg-hover)" : "transparent";
  return i.jsxs("div", {
    style: { position: "relative" },
    children: [
      i.jsxs("div", {
        className: "tree-row",
        onMouseEnter: () => j(!0),
        onMouseLeave: () => j(!1),
        onClick: () => {
          S && e.doc
            ? (u(e.doc),
              f(`/document?filepath=${encodeURIComponent(e.doc.fileS3Key)}`))
            : (m(e.fullPath), u(null));
        },
        onContextMenu: ($) => {
          !S || !e.doc || ($.preventDefault(), u(e.doc));
        },
        style: {
          display: "flex",
          alignItems: "center",
          gap: 4,
          paddingLeft: N,
          paddingRight: 6,
          paddingTop: 3,
          paddingBottom: 3,
          borderRadius: 5,
          cursor: S ? "pointer" : "default",
          background: P,
          userSelect: "none",
          position: "relative",
        },
        children: [
          !S && e.children.size > 0
            ? i.jsx(E0, { open: y })
            : i.jsx("span", { style: { width: 9, flexShrink: 0 } }),
          S ? i.jsx(_0, {}) : i.jsx(C0, { open: y, simulated: E }),
          i.jsx("span", {
            style: {
              flex: 1,
              fontSize: S ? "0.76rem" : "0.8rem",
              fontFamily: S ? "JetBrains Mono, monospace" : void 0,
              fontWeight: S ? 400 : t === 0 ? 600 : 500,
              color: S
                ? C
                  ? "var(--accent)"
                  : "var(--text-1)"
                : E
                  ? "var(--text-3)"
                  : t === 0
                    ? "var(--text-1)"
                    : "var(--text-2)",
              fontStyle: E ? "italic" : "normal",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              letterSpacing: S ? "0" : "-0.01em",
            },
            children: e.name,
          }),
          !S &&
            e.docCount > 0 &&
            i.jsx("span", {
              style: {
                fontSize: "0.6rem",
                color: _ ? "var(--warn)" : "var(--text-3)",
                background: _ ? "rgba(251,191,36,0.1)" : "var(--bg-raised)",
                border: `1px solid ${_ ? "rgba(251,191,36,0.25)" : "var(--border-soft)"}`,
                borderRadius: 10,
                padding: "0 5px",
                lineHeight: "16px",
                flexShrink: 0,
                fontFamily: "JetBrains Mono, monospace",
                minWidth: 20,
                textAlign: "center",
              },
              children: e.docCount,
            }),
          S &&
            i.jsxs("span", {
              style: {
                fontSize: "0.6rem",
                color: "var(--text-3)",
                flexShrink: 0,
              },
              children: [e.doc.page_count, g.ft_pages],
            }),
          k &&
            i.jsxs("div", {
              style: { display: "flex", gap: 1, flexShrink: 0, marginLeft: 2 },
              onClick: ($) => $.stopPropagation(),
              children: [
                !S &&
                  i.jsx(fl, {
                    title: _ ? g.ft_markDone : g.ft_markTodo,
                    onClick: () => r(e.fullPath),
                    active: _,
                    activeColor: "var(--warn)",
                    children: _ ? "★" : "☆",
                  }),
                S &&
                  i.jsxs(i.Fragment, {
                    children: [
                      i.jsx(fl, {
                        title: g.ft_showPath,
                        onClick: () => d(($) => !$),
                        active: p,
                        children: "ⓘ",
                      }),
                      i.jsx(fl, {
                        title: g.ft_openStats,
                        onClick: () =>
                          e.doc &&
                          f(
                            `/file-stats?filepath=${encodeURIComponent(e.doc.fileS3Key)}`,
                          ),
                        children: "⎙",
                      }),
                      p &&
                        i.jsx(fl, {
                          title: h ? g.ft_copied : g.ft_copy,
                          onClick: () => W(e.doc.fileS3Key),
                          active: h,
                          activeColor: "var(--accent)",
                          children: h ? "✓" : "⎘",
                        }),
                    ],
                  }),
              ],
            }),
          p &&
            S &&
            i.jsx("div", {
              onClick: ($) => $.stopPropagation(),
              style: {
                position: "absolute",
                bottom: "calc(100% + 4px)",
                left: N,
                background: "var(--bg-raised)",
                border: "1px solid var(--border)",
                borderRadius: 6,
                padding: "5px 9px",
                fontSize: "0.61rem",
                fontFamily: "JetBrains Mono, monospace",
                color: "var(--text-2)",
                wordBreak: "break-all",
                maxWidth: 320,
                zIndex: 50,
                boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
                pointerEvents: "none",
                lineHeight: 1.6,
              },
              children: e.doc.fileS3Key,
            }),
        ],
      }),
      !S &&
        _ &&
        y &&
        i.jsx("div", {
          style: { paddingLeft: N + v, paddingBottom: 2 },
          children: i.jsxs("span", {
            style: {
              fontSize: "0.58rem",
              color: "var(--warn)",
              fontWeight: 600,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
            },
            children: ["★ ", g.ft_toReview],
          }),
        }),
      !S &&
        y &&
        R.length > 0 &&
        i.jsxs(i.Fragment, {
          children: [
            i.jsx("div", {
              style: {
                position: "absolute",
                left: z,
                top: 26,
                bottom: 4,
                width: 1,
                background: "var(--border-soft)",
                pointerEvents: "none",
                zIndex: 0,
              },
            }),
            R.map(($) =>
              i.jsx(
                zf,
                {
                  node: $,
                  depth: t + 1,
                  todo: n,
                  onToggleTodo: r,
                  filter: l,
                  sortKey: o,
                  pathFilter: s,
                  selectedPath: a,
                  onSelect: u,
                  openSet: c,
                  onToggleOpen: m,
                },
                $.fullPath + $.name,
              ),
            ),
          ],
        }),
    ],
  });
}
function fl({ children: e, title: t, onClick: n, active: r, activeColor: l }) {
  return i.jsx("button", {
    title: t,
    onClick: n,
    style: {
      background: r ? "var(--accent-glow)" : "none",
      border: "none",
      cursor: "pointer",
      color: r ? (l ?? "var(--accent)") : "var(--text-3)",
      fontSize: "0.65rem",
      padding: "2px 4px",
      borderRadius: 3,
      lineHeight: 1,
      transition: "color 0.1s, background 0.1s",
    },
    children: e,
  });
}
function _0() {
  return i.jsxs("svg", {
    width: "11",
    height: "11",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "var(--accent)",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    style: { flexShrink: 0, opacity: 0.8 },
    children: [
      i.jsx("path", {
        d: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z",
      }),
      i.jsx("polyline", { points: "14 2 14 8 20 8" }),
    ],
  });
}
function C0({ open: e, simulated: t }) {
  const n = t ? "var(--text-3)" : "var(--text-2)";
  return i.jsx("svg", {
    width: "12",
    height: "12",
    viewBox: "0 0 24 24",
    fill: e ? "var(--accent-glow)" : "none",
    stroke: e ? "var(--accent)" : n,
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    style: { flexShrink: 0 },
    children: i.jsx("path", {
      d: "M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z",
    }),
  });
}
function E0({ open: e }) {
  return i.jsx("svg", {
    width: "8",
    height: "8",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "var(--text-3)",
    strokeWidth: "2.5",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    style: {
      flexShrink: 0,
      transform: e ? "rotate(90deg)" : "none",
      transition: "transform 0.13s",
    },
    children: i.jsx("polyline", { points: "9 18 15 12 9 6" }),
  });
}
function b0({
  documents: e,
  simulatedTagPaths: t = [],
  filter: n = "",
  sortKey: r,
  selectedPath: l = null,
  onSelect: o,
}) {
  const s = Et(),
    [a, u] = x.useState(() => k0()),
    [c, m] = x.useState(""),
    f = x.useRef(null),
    [g, S] = x.useState(() => new Set()),
    y = x.useMemo(() => w0(e, t), [e, t]),
    k = x.useRef(!1);
  x.useEffect(() => {
    if (k.current || y.children.size === 0) return;
    k.current = !0;
    const v = new Set();
    for (const N of y.children.values())
      if (!N.doc && (v.add(N.fullPath), N.children.size <= 8))
        for (const z of N.children.values()) z.doc || v.add(z.fullPath);
    S(v);
  }, [y]);
  const j = x.useCallback((v) => {
    S((N) => {
      const z = new Set(N);
      return (z.has(v) ? z.delete(v) : z.add(v), z);
    });
  }, []);
  function p() {
    S(new Set());
  }
  function d() {
    const v = new Set();
    function N(z) {
      !z.doc && z.fullPath && v.add(z.fullPath);
      for (const R of z.children.values()) N(R);
    }
    (N(y), S(v));
  }
  const h = x.useCallback((v) => {
      u((N) => {
        const z = new Set(N);
        return (z.has(v) ? z.delete(v) : z.add(v), j0(z), z);
      });
    }, []),
    w = x.useMemo(
      () => (l ? (e.find((v) => v.fileS3Key === l) ?? null) : null),
      [e, l],
    );
  function _(v) {
    o == null || o(v);
  }
  if (y.children.size === 0)
    return i.jsxs("div", {
      style: {
        padding: "40px 20px",
        textAlign: "center",
        color: "var(--text-3)",
      },
      children: [
        i.jsx("svg", {
          width: "32",
          height: "32",
          viewBox: "0 0 24 24",
          fill: "none",
          stroke: "currentColor",
          strokeWidth: "1.5",
          strokeLinecap: "round",
          strokeLinejoin: "round",
          style: { marginBottom: 10, opacity: 0.4 },
          children: i.jsx("path", {
            d: "M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z",
          }),
        }),
        i.jsx("p", {
          style: { margin: 0, fontSize: "0.82rem" },
          children: s.ft_noDocuments,
        }),
      ],
    });
  const E = a.size,
    C = [...y.children.values()].sort((v, N) => {
      const z = !!v.doc,
        R = !!N.doc;
      if (r === "alpha" || r === "name_asc")
        return v.name.localeCompare(N.name, void 0, { numeric: !0 });
      if (z !== R) return z ? 1 : -1;
      const W = a.has(v.fullPath),
        P = a.has(N.fullPath);
      return W !== P
        ? W
          ? -1
          : 1
        : z && R && v.doc && N.doc
          ? Cf(v.doc, N.doc, r)
          : v.name.localeCompare(N.name);
    });
  return i.jsxs("div", {
    className: "card",
    style: {
      padding: 0,
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
    },
    children: [
      i.jsxs("div", {
        style: {
          padding: "6px 8px",
          borderBottom: "1px solid var(--border-soft)",
          display: "flex",
          flexDirection: "column",
          gap: 5,
          flexShrink: 0,
        },
        children: [
          i.jsxs("div", {
            style: { display: "flex", gap: 5, alignItems: "center" },
            children: [
              i.jsxs("div", {
                style: { position: "relative", flex: 1 },
                children: [
                  i.jsxs("svg", {
                    width: "11",
                    height: "11",
                    viewBox: "0 0 24 24",
                    fill: "none",
                    stroke: "var(--text-3)",
                    strokeWidth: "2",
                    strokeLinecap: "round",
                    strokeLinejoin: "round",
                    style: {
                      position: "absolute",
                      left: 7,
                      top: "50%",
                      transform: "translateY(-50%)",
                      pointerEvents: "none",
                    },
                    children: [
                      i.jsx("circle", { cx: "11", cy: "11", r: "8" }),
                      i.jsx("line", {
                        x1: "21",
                        y1: "21",
                        x2: "16.65",
                        y2: "16.65",
                      }),
                    ],
                  }),
                  i.jsx("input", {
                    ref: f,
                    value: c,
                    onChange: (v) => m(v.target.value),
                    placeholder: s.ft_filterByPath,
                    className: "input",
                    style: {
                      paddingLeft: 24,
                      fontSize: "0.74rem",
                      fontFamily: "JetBrains Mono, monospace",
                    },
                  }),
                  c &&
                    i.jsx("button", {
                      onClick: () => m(""),
                      title: s.ft_clearFilter,
                      style: {
                        position: "absolute",
                        right: 4,
                        top: "50%",
                        transform: "translateY(-50%)",
                        background: "transparent",
                        border: "none",
                        color: "var(--text-3)",
                        cursor: "pointer",
                        fontSize: "0.68rem",
                        padding: "0 5px",
                      },
                      children: "✕",
                    }),
                ],
              }),
              i.jsx("button", {
                onClick: p,
                title: s.ft_collapseAll,
                style: {
                  background: "none",
                  border: "1px solid var(--border-soft)",
                  borderRadius: 4,
                  cursor: "pointer",
                  color: "var(--text-3)",
                  fontSize: "0.62rem",
                  padding: "3px 6px",
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                },
                children: i.jsx(P0, {}),
              }),
              i.jsx("button", {
                onClick: d,
                title: s.ft_expandAll,
                style: {
                  background: "none",
                  border: "1px solid var(--border-soft)",
                  borderRadius: 4,
                  cursor: "pointer",
                  color: "var(--text-3)",
                  fontSize: "0.62rem",
                  padding: "3px 6px",
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                },
                children: i.jsx(N0, {}),
              }),
            ],
          }),
          w && i.jsx(z0, { doc: w }),
          (E > 0 || t.length > 0) &&
            i.jsxs("div", {
              style: {
                display: "flex",
                gap: 10,
                fontSize: "0.63rem",
                color: "var(--text-3)",
                paddingLeft: 2,
              },
              children: [
                E > 0 &&
                  i.jsx("span", {
                    style: { color: "var(--warn)" },
                    children: s.ft_foldersToReview(E),
                  }),
                t.length > 0 &&
                  i.jsxs("span", {
                    children: [
                      i.jsx("em", { children: "italic" }),
                      " = ",
                      s.ft_italicNote.split(" = ")[1] ?? "simulated",
                    ],
                  }),
              ],
            }),
        ],
      }),
      i.jsx("div", {
        style: { flex: 1, overflowY: "auto", padding: "4px 4px 8px" },
        children: C.map((v) =>
          i.jsx(
            zf,
            {
              node: v,
              depth: 0,
              todo: a,
              onToggleTodo: h,
              filter: n,
              sortKey: r,
              pathFilter: c,
              selectedPath: l,
              onSelect: _,
              openSet: g,
              onToggleOpen: j,
            },
            v.fullPath + v.name,
          ),
        ),
      }),
    ],
  });
}
function z0({ doc: e }) {
  const t = Et(),
    [n, r] = x.useState(!1);
  function l() {
    var o;
    (o = navigator.clipboard) == null ||
      o.writeText(e.fileS3Key).then(
        () => {
          (r(!0), setTimeout(() => r(!1), 1400));
        },
        () => {},
      );
  }
  return i.jsxs("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 6,
      background: "var(--bg-raised)",
      border: "1px solid var(--border-soft)",
      borderRadius: 6,
      padding: "4px 8px",
      fontSize: "0.64rem",
      fontFamily: "JetBrains Mono, monospace",
    },
    title: e.fileS3Key,
    children: [
      i.jsx("span", {
        style: { color: "var(--text-3)", flexShrink: 0 },
        children: t.ft_pathLabel,
      }),
      i.jsx("span", {
        style: {
          flex: 1,
          minWidth: 0,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          color: "var(--text-2)",
        },
        children: e.fileS3Key,
      }),
      i.jsx("button", {
        onClick: l,
        title: n ? t.ft_copied : t.ft_copy,
        style: {
          background: n ? "var(--accent-glow)" : "transparent",
          border: `1px solid ${n ? "var(--accent)" : "var(--border)"}`,
          color: n ? "var(--accent)" : "var(--text-2)",
          borderRadius: 4,
          padding: "1px 7px",
          cursor: "pointer",
          fontSize: "0.63rem",
          flexShrink: 0,
        },
        children: n ? t.ft_copied : t.ft_copy,
      }),
    ],
  });
}
function P0() {
  return i.jsx("svg", {
    width: "11",
    height: "11",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    children: i.jsx("polyline", { points: "15 18 9 12 15 6" }),
  });
}
function N0() {
  return i.jsx("svg", {
    width: "11",
    height: "11",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    children: i.jsx("polyline", { points: "9 18 15 12 9 6" }),
  });
}
function Zi(e) {
  return ((e == null ? void 0 : e.split("/").pop()) ?? e ?? "")
    .replace(
      /-[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}(\.[^.]+)$/i,
      "$1",
    )
    .replace(
      /-\d{4}-\d{2}-\d{2}[T_]\d{2}[:\-]\d{2}[:\-]\d{2}[\.\dZ]*(\.[^.]+)$/i,
      "$1",
    );
}
function R0(e, t) {
  const n = [...e];
  switch (t) {
    case "date_asc":
      return n.sort(
        (r, l) =>
          new Date(r.created_at).getTime() - new Date(l.created_at).getTime(),
      );
    case "name_asc":
      return n.sort((r, l) => Zi(r.fileS3Key).localeCompare(Zi(l.fileS3Key)));
    case "pages_desc":
      return n.sort((r, l) => (l.page_count ?? 0) - (r.page_count ?? 0));
    default:
      return n.sort(
        (r, l) =>
          new Date(l.created_at).getTime() - new Date(r.created_at).getTime(),
      );
  }
}
const Nu = 48;
function L0() {
  const e = Et(),
    [t, n] = x.useState([]),
    [r, l] = x.useState(0),
    [o, s] = x.useState(0),
    [a, u] = x.useState([]),
    [c, m] = x.useState(),
    [f, g] = x.useState("grid"),
    [S, y] = x.useState("date_desc"),
    [k, j] = x.useState(""),
    [p, d] = x.useState(null),
    [h, w] = x.useState(!0),
    [_, E] = x.useState(null),
    [C, v] = x.useState(new Set()),
    [N, z] = x.useState(!1),
    [R, W] = x.useState(!1),
    [P, O] = x.useState(!1),
    $ = Y((F) => F.simulatedTagPaths),
    Q = qs((F) => F.lastCompletedAt),
    T = x.useCallback(async () => {
      (w(!0), E(null));
      try {
        const F = await Dg(o, Nu, c);
        (n(F.data), l(F.totalCount));
      } catch (F) {
        E(F.message);
      } finally {
        w(!1);
      }
    }, [o, c]);
  (x.useEffect(() => {
    T();
  }, [T, Q]),
    x.useEffect(() => {
      Og()
        .then((F) => u(F.tags.slice(0, 80)))
        .catch(() => {});
    }, []));
  const b = Math.max(1, Math.ceil(r / Nu)),
    M = R0(t, S).filter((F) => {
      if (!k) return !0;
      const ve = k.toLowerCase();
      return (
        Zi(F.fileS3Key).toLowerCase().includes(ve) ||
        F.fileS3Key.toLowerCase().includes(ve)
      );
    });
  function B(F) {
    v((ve) => {
      const xe = new Set(ve);
      return (xe.has(F) ? xe.delete(F) : xe.add(F), xe);
    });
  }
  function V() {
    v(new Set(M.map((F) => F.fileS3Key)));
  }
  function U() {
    (v(new Set()), z(!1), O(!1));
  }
  async function dt() {
    if (!P) {
      O(!0);
      return;
    }
    W(!0);
    const F = [...C];
    for (const ve of F)
      try {
        await wf(ve);
      } catch {}
    (W(!1), U(), T());
  }
  return i.jsxs("div", {
    style: { display: "flex", height: "100%" },
    children: [
      a.length > 0 &&
        i.jsxs("aside", {
          style: {
            width: 176,
            flexShrink: 0,
            borderRight: "1px solid var(--border)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            background: "var(--bg-surface)",
          },
          children: [
            i.jsx("div", {
              style: {
                padding: "10px 8px 6px",
                borderBottom: "1px solid var(--border-soft)",
                flexShrink: 0,
              },
              children: i.jsx("p", {
                className: "label",
                style: { paddingLeft: 4 },
                children: e.main_tags,
              }),
            }),
            i.jsxs("div", {
              style: { overflowY: "auto", flex: 1, padding: "4px 6px 8px" },
              children: [
                i.jsx(Ru, {
                  label: e.main_all,
                  count: r,
                  active: !c,
                  onClick: () => {
                    (m(void 0), s(0));
                  },
                }),
                a.map((F) =>
                  i.jsx(
                    Ru,
                    {
                      label: F.tag,
                      count: F.doc_count,
                      active: c === F.tag,
                      onClick: () => {
                        (m(F.tag), s(0));
                      },
                    },
                    F.tag,
                  ),
                ),
              ],
            }),
          ],
        }),
      i.jsxs("div", {
        style: {
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        },
        children: [
          i.jsxs("div", {
            style: {
              padding: "8px 14px",
              borderBottom: "1px solid var(--border)",
              display: "flex",
              alignItems: "center",
              gap: 7,
              flexShrink: 0,
              background: "var(--bg-surface)",
              flexWrap: "wrap",
            },
            children: [
              i.jsxs("div", {
                children: [
                  i.jsx("h2", {
                    style: {
                      margin: 0,
                      fontSize: "0.87rem",
                      fontWeight: 600,
                      color: "var(--text-1)",
                    },
                    children: c
                      ? i.jsxs(i.Fragment, {
                          children: [
                            i.jsxs("span", {
                              style: {
                                color: "var(--text-3)",
                                fontWeight: 400,
                              },
                              children: [e.main_tagLabel, " "],
                            }),
                            i.jsx("span", { className: "tag", children: c }),
                          ],
                        })
                      : e.main_allDocuments,
                  }),
                  i.jsx("p", {
                    style: {
                      margin: 0,
                      fontSize: "0.66rem",
                      color: "var(--text-3)",
                    },
                    children: e.main_documents(r),
                  }),
                ],
              }),
              i.jsx("button", {
                onClick: () => {
                  (z((F) => !F), U());
                },
                style: {
                  ...ir,
                  background: N ? "var(--accent-glow)" : void 0,
                  color: N ? "var(--accent)" : "var(--text-2)",
                  borderColor: N ? "var(--accent)" : void 0,
                },
                title: "Bulk select",
                children: "☑ Select",
              }),
              N &&
                C.size > 0 &&
                i.jsxs("div", {
                  style: { display: "flex", gap: 5, alignItems: "center" },
                  children: [
                    i.jsxs("span", {
                      style: {
                        fontSize: "0.73rem",
                        color: "var(--text-2)",
                        fontFamily: "JetBrains Mono, monospace",
                      },
                      children: [C.size, " selected"],
                    }),
                    i.jsxs("button", {
                      onClick: V,
                      style: ir,
                      children: ["all ", M.length],
                    }),
                    i.jsx("button", {
                      onClick: U,
                      style: ir,
                      children: "none",
                    }),
                    i.jsx("button", {
                      onClick: dt,
                      disabled: R,
                      style: {
                        ...ir,
                        background: P ? "rgba(248,113,113,0.15)" : void 0,
                        color: "var(--danger)",
                        borderColor: "rgba(248,113,113,0.35)",
                      },
                      children: R
                        ? "…"
                        : P
                          ? `⚠ Confirm delete ${C.size}`
                          : `✗ Delete ${C.size}`,
                    }),
                    P &&
                      i.jsx("button", {
                        onClick: () => O(!1),
                        style: ir,
                        children: "cancel",
                      }),
                  ],
                }),
              i.jsxs("div", {
                style: { position: "relative", marginLeft: "auto" },
                children: [
                  i.jsxs("svg", {
                    width: "11",
                    height: "11",
                    viewBox: "0 0 24 24",
                    fill: "none",
                    stroke: "var(--text-3)",
                    strokeWidth: "2",
                    strokeLinecap: "round",
                    strokeLinejoin: "round",
                    style: {
                      position: "absolute",
                      left: 7,
                      top: "50%",
                      transform: "translateY(-50%)",
                      pointerEvents: "none",
                    },
                    children: [
                      i.jsx("circle", { cx: "11", cy: "11", r: "8" }),
                      i.jsx("line", {
                        x1: "21",
                        y1: "21",
                        x2: "16.65",
                        y2: "16.65",
                      }),
                    ],
                  }),
                  i.jsx("input", {
                    value: k,
                    onChange: (F) => j(F.target.value),
                    placeholder: e.main_filterByFilename,
                    className: "input",
                    style: { paddingLeft: 26, width: 175, fontSize: "0.77rem" },
                  }),
                  k &&
                    i.jsx("button", {
                      onClick: () => j(""),
                      style: {
                        position: "absolute",
                        right: 5,
                        top: "50%",
                        transform: "translateY(-50%)",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: "var(--text-3)",
                        fontSize: "0.7rem",
                      },
                      children: "✕",
                    }),
                ],
              }),
              i.jsxs("select", {
                value: S,
                onChange: (F) => y(F.target.value),
                style: {
                  background: "var(--bg-raised)",
                  border: "1px solid var(--border)",
                  borderRadius: 6,
                  color: "var(--text-2)",
                  fontSize: "0.77rem",
                  padding: "4px 8px",
                  outline: "none",
                  cursor: "pointer",
                },
                children: [
                  i.jsx("option", {
                    value: "date_desc",
                    children: e.main_newestFirst,
                  }),
                  i.jsx("option", {
                    value: "date_asc",
                    children: e.main_oldestFirst,
                  }),
                  i.jsx("option", {
                    value: "name_asc",
                    children: e.main_nameAZ,
                  }),
                  i.jsx("option", {
                    value: "pages_desc",
                    children: e.main_mostPages,
                  }),
                ],
              }),
              i.jsxs("div", {
                style: {
                  display: "flex",
                  background: "var(--bg-raised)",
                  border: "1px solid var(--border)",
                  borderRadius: 5,
                  overflow: "hidden",
                },
                children: [
                  i.jsx(Lu, {
                    active: f === "grid",
                    onClick: () => g("grid"),
                    title: e.main_grid,
                    children: i.jsx(T0, {}),
                  }),
                  i.jsx(Lu, {
                    active: f === "tree",
                    onClick: () => g("tree"),
                    title: e.main_tree,
                    children: i.jsx(M0, {}),
                  }),
                ],
              }),
              i.jsx("button", {
                className: "btn btn-ghost",
                onClick: T,
                style: { padding: "4px 8px" },
                title: e.main_refresh,
                disabled: h,
                children: i.jsx(I0, { spin: h }),
              }),
            ],
          }),
          i.jsxs("div", {
            style: {
              flex: 1,
              overflowY: "auto",
              padding: f === "tree" ? 0 : "14px",
            },
            children: [
              _ &&
                i.jsx("div", {
                  style: {
                    margin: "0 14px 12px",
                    padding: "9px 13px",
                    background: "rgba(248,113,113,0.07)",
                    border: "1px solid rgba(248,113,113,0.2)",
                    borderRadius: 7,
                    color: "var(--danger)",
                    fontSize: "0.8rem",
                  },
                  children: _,
                }),
              !h &&
                M.length === 0 &&
                !_ &&
                i.jsx("div", {
                  style: {
                    textAlign: "center",
                    padding: "60px 24px",
                    color: "var(--text-3)",
                  },
                  children: i.jsx("p", {
                    style: { fontSize: "0.85rem" },
                    children: k ? e.main_noMatch(k) : e.main_noDocuments,
                  }),
                }),
              f === "grid"
                ? i.jsx("div", {
                    style: {
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fill, minmax(188px,1fr))",
                      gap: 13,
                    },
                    children: h
                      ? Array.from({ length: 12 }).map((F, ve) =>
                          i.jsx(
                            "div",
                            {
                              className: "card",
                              style: {
                                height: 185,
                                animation: "pulse 1.5s ease-in-out infinite",
                              },
                            },
                            ve,
                          ),
                        )
                      : M.map((F) =>
                          i.jsxs(
                            "div",
                            {
                              style: { position: "relative" },
                              onClick: N ? () => B(F.fileS3Key) : void 0,
                              children: [
                                N &&
                                  i.jsx("div", {
                                    style: {
                                      position: "absolute",
                                      top: 8,
                                      left: 8,
                                      zIndex: 10,
                                      width: 18,
                                      height: 18,
                                      borderRadius: 4,
                                      background: C.has(F.fileS3Key)
                                        ? "var(--accent)"
                                        : "rgba(0,0,0,0.5)",
                                      border: `2px solid ${C.has(F.fileS3Key) ? "var(--accent)" : "rgba(255,255,255,0.5)"}`,
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      color: "#fff",
                                      fontSize: "0.65rem",
                                      fontWeight: 700,
                                      cursor: "pointer",
                                      transition: "background 0.1s",
                                    },
                                    children: C.has(F.fileS3Key) ? "✓" : "",
                                  }),
                                i.jsx(S0, { doc: F }),
                              ],
                            },
                            F.fileS3Key,
                          ),
                        ),
                  })
                : i.jsx(b0, {
                    documents: M,
                    simulatedTagPaths: $,
                    filter: k,
                    sortKey: S,
                    selectedPath: p,
                    onSelect: (F) =>
                      d((F == null ? void 0 : F.fileS3Key) ?? null),
                  }),
            ],
          }),
          b > 1 &&
            i.jsxs("div", {
              style: {
                padding: "6px 16px",
                borderTop: "1px solid var(--border)",
                display: "flex",
                alignItems: "center",
                gap: 8,
                justifyContent: "center",
                flexShrink: 0,
                background: "var(--bg-surface)",
              },
              children: [
                i.jsx("button", {
                  className: "btn btn-ghost",
                  disabled: o === 0,
                  onClick: () => s((F) => F - 1),
                  style: { padding: "3px 10px" },
                  children: "←",
                }),
                i.jsxs("span", {
                  style: {
                    fontSize: "0.77rem",
                    color: "var(--text-2)",
                    fontFamily: "JetBrains Mono, monospace",
                  },
                  children: [o + 1, " / ", b],
                }),
                i.jsx("button", {
                  className: "btn btn-ghost",
                  disabled: o >= b - 1,
                  onClick: () => s((F) => F + 1),
                  style: { padding: "3px 10px" },
                  children: "→",
                }),
              ],
            }),
        ],
      }),
    ],
  });
}
const ir = {
  background: "var(--bg-raised)",
  border: "1px solid var(--border)",
  borderRadius: 5,
  cursor: "pointer",
  color: "var(--text-2)",
  fontSize: "0.73rem",
  padding: "4px 8px",
  whiteSpace: "nowrap",
  flexShrink: 0,
};
function Ru({ label: e, count: t, active: n, onClick: r }) {
  return i.jsxs("button", {
    onClick: r,
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      width: "100%",
      padding: "4px 8px",
      border: "none",
      borderRadius: 5,
      cursor: "pointer",
      fontSize: "0.77rem",
      fontWeight: n ? 600 : 400,
      background: n ? "var(--accent-glow)" : "transparent",
      color: n ? "var(--accent)" : "var(--text-2)",
      transition: "background 0.1s",
      marginBottom: 1,
      borderLeft: n ? "2px solid var(--accent)" : "2px solid transparent",
    },
    children: [
      i.jsx("span", {
        style: {
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          maxWidth: 112,
        },
        children: e,
      }),
      i.jsx("span", {
        style: {
          fontSize: "0.61rem",
          color: "var(--text-3)",
          flexShrink: 0,
          fontFamily: "JetBrains Mono, monospace",
        },
        children: t,
      }),
    ],
  });
}
function Lu({ active: e, onClick: t, title: n, children: r }) {
  return i.jsx("button", {
    onClick: t,
    title: n,
    style: {
      padding: "5px 8px",
      border: "none",
      background: e ? "var(--accent-glow)" : "transparent",
      color: e ? "var(--accent)" : "var(--text-3)",
      cursor: "pointer",
      transition: "background 0.1s",
      display: "flex",
      alignItems: "center",
    },
    children: r,
  });
}
function T0() {
  return i.jsxs("svg", {
    width: "13",
    height: "13",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    children: [
      i.jsx("rect", { x: "3", y: "3", width: "7", height: "7" }),
      i.jsx("rect", { x: "14", y: "3", width: "7", height: "7" }),
      i.jsx("rect", { x: "14", y: "14", width: "7", height: "7" }),
      i.jsx("rect", { x: "3", y: "14", width: "7", height: "7" }),
    ],
  });
}
function M0() {
  return i.jsxs("svg", {
    width: "13",
    height: "13",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    children: [
      i.jsx("line", { x1: "6", y1: "3", x2: "6", y2: "15" }),
      i.jsx("circle", { cx: "18", cy: "6", r: "3" }),
      i.jsx("circle", { cx: "6", cy: "18", r: "3" }),
      i.jsx("path", { d: "M18 9a9 9 0 0 1-9 9" }),
    ],
  });
}
function I0({ spin: e }) {
  return i.jsxs("svg", {
    width: "13",
    height: "13",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    style: { animation: e ? "spin 1s linear infinite" : "none" },
    children: [
      i.jsx("polyline", { points: "23 4 23 10 17 10" }),
      i.jsx("path", { d: "M20.49 15a9 9 0 1 1-2.12-9.36L23 10" }),
    ],
  });
}
function Pf(e) {
  return e
    ? (e.split("/").pop() ?? e)
        .replace(
          /-[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}(\.[^.]+)$/i,
          "$1",
        )
        .replace(
          /-\d{4}-\d{2}-\d{2}[T_]\d{2}[:\-]\d{2}[:\-]\d{2}[\.\dZ]*(\.[^.]+)$/i,
          "$1",
        )
    : "";
}
function Nf(e) {
  const t = e.split(/(__HL__|__\/HL__)/g),
    n = [];
  let r = !1;
  for (const l of t) {
    if (l === "__HL__") {
      r = !0;
      continue;
    }
    if (l === "__/HL__") {
      r = !1;
      continue;
    }
    r
      ? n.push(i.jsx("mark", { className: "hl", children: l }, n.length))
      : n.push(l);
  }
  return n;
}
function F0({ filepath: e, hits: t, totalHits: n, baseIndex: r, onJump: l }) {
  const o = Et(),
    s = Pf(e),
    a = t[0];
  return i.jsxs("div", {
    className: "card",
    style: { padding: 0, overflow: "hidden" },
    children: [
      i.jsxs("div", {
        style: {
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "8px 12px",
          background: "var(--bg-raised)",
          borderBottom: "1px solid var(--border-soft)",
        },
        children: [
          a.banner_img &&
            i.jsx("div", {
              style: {
                width: 32,
                height: 32,
                borderRadius: 4,
                overflow: "hidden",
                flexShrink: 0,
                background: "var(--bg-base)",
              },
              children: i.jsx(wo, {
                src: a.banner_img,
                alt: "",
                style: { width: "100%", height: "100%", objectFit: "cover" },
              }),
            }),
          i.jsxs("div", {
            style: { flex: 1, minWidth: 0 },
            children: [
              i.jsx("p", {
                style: {
                  margin: 0,
                  fontSize: "0.78rem",
                  fontWeight: 600,
                  color: "var(--text-1)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  fontFamily: "JetBrains Mono, monospace",
                },
                title: s,
                children: s,
              }),
              i.jsxs("p", {
                style: {
                  margin: 0,
                  fontSize: "0.63rem",
                  color: "var(--text-3)",
                },
                children: [
                  t.length,
                  " hit",
                  t.length !== 1 ? "s" : "",
                  " · ",
                  e.split("/").slice(0, -1).join("/"),
                ],
              }),
            ],
          }),
          a.assigned_tags &&
            a.assigned_tags.length > 0 &&
            i.jsx("div", {
              style: { display: "flex", gap: 3, flexShrink: 0 },
              children: a.assigned_tags
                .slice(0, 2)
                .map((u) =>
                  i.jsx(
                    "span",
                    {
                      className: "tag",
                      style: {
                        fontSize: "0.6rem",
                        padding: "0 5px",
                        pointerEvents: "none",
                      },
                      children: u,
                    },
                    u,
                  ),
                ),
            }),
        ],
      }),
      i.jsx("div", {
        style: { display: "flex", flexDirection: "column" },
        children: t.map((u, c) => {
          const m = r + c,
            f = (u.formatted_text ?? u.searchable_text ?? "").slice(0, 280);
          return i.jsxs(
            "div",
            {
              style: {
                display: "flex",
                gap: 10,
                padding: "7px 12px",
                borderBottom:
                  c < t.length - 1 ? "1px solid var(--border-soft)" : "none",
                cursor: "pointer",
                transition: "background 0.1s",
              },
              onMouseEnter: (g) =>
                (g.currentTarget.style.background = "var(--bg-raised)"),
              onMouseLeave: (g) =>
                (g.currentTarget.style.background = "transparent"),
              onClick: () => l(u, m),
              children: [
                i.jsxs("span", {
                  style: {
                    fontSize: "0.58rem",
                    color: "var(--accent)",
                    fontFamily: "JetBrains Mono, monospace",
                    background: "var(--accent-glow)",
                    padding: "2px 5px",
                    borderRadius: 3,
                    flexShrink: 0,
                    alignSelf: "flex-start",
                    marginTop: 1,
                    whiteSpace: "nowrap",
                  },
                  children: [o.sr_page, u.pageIdx + 1],
                }),
                f &&
                  i.jsx("p", {
                    style: {
                      margin: 0,
                      fontSize: "0.72rem",
                      color: "var(--text-2)",
                      lineHeight: 1.5,
                      flex: 1,
                      minWidth: 0,
                      wordBreak: "break-word",
                      display: "-webkit-box",
                      WebkitBoxOrient: "vertical",
                      WebkitLineClamp: 2,
                      overflow: "hidden",
                    },
                    children: Nf(f),
                  }),
                i.jsx("button", {
                  style: {
                    background: "var(--accent-glow)",
                    border: "1px solid var(--accent)",
                    color: "var(--accent)",
                    padding: "3px 9px",
                    borderRadius: 4,
                    fontSize: "0.68rem",
                    cursor: "pointer",
                    fontWeight: 600,
                    fontFamily: "JetBrains Mono, monospace",
                    flexShrink: 0,
                    alignSelf: "center",
                  },
                  onClick: (g) => {
                    (g.stopPropagation(), l(u, m));
                  },
                  children: o.sr_open,
                }),
              ],
            },
            `${u.pageIdx}_${c}`,
          );
        }),
      }),
    ],
  });
}
function D0({ hit: e, index: t, totalHits: n, onJump: r }) {
  const l = Et(),
    [o, s] = x.useState(!1),
    a = (e.formatted_text ?? e.searchable_text ?? "").slice(0, 320),
    u = Pf(e.filepath ?? "");
  return i.jsxs("div", {
    className: "card",
    style: {
      padding: 0,
      display: "flex",
      alignItems: "stretch",
      overflow: "hidden",
      minHeight: 80,
      cursor: "pointer",
      transition: "border-color 0.15s",
    },
    onMouseEnter: (c) => (c.currentTarget.style.borderColor = "var(--accent)"),
    onMouseLeave: (c) => (c.currentTarget.style.borderColor = "var(--border)"),
    onClick: r,
    children: [
      e.banner_img &&
        i.jsx("div", {
          style: { width: 80, flexShrink: 0, background: "var(--bg-raised)" },
          children: i.jsx(wo, {
            src: e.banner_img,
            alt: "",
            style: {
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            },
          }),
        }),
      i.jsxs("div", {
        style: {
          padding: "8px 11px",
          flex: 1,
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
          gap: 3,
        },
        children: [
          i.jsxs("div", {
            style: { display: "flex", alignItems: "center", gap: 5 },
            children: [
              i.jsxs("span", {
                style: {
                  fontSize: "0.58rem",
                  color: "var(--accent)",
                  fontFamily: "JetBrains Mono, monospace",
                  background: "var(--accent-glow)",
                  padding: "1px 5px",
                  borderRadius: 3,
                  flexShrink: 0,
                },
                children: [t + 1, "/", n],
              }),
              i.jsx("p", {
                className: "mono",
                style: {
                  margin: 0,
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  color: "var(--text-1)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  flex: 1,
                },
                title: u,
                children: u,
              }),
              i.jsx("button", {
                title: "Full path",
                onClick: (c) => {
                  (c.stopPropagation(), s((m) => !m));
                },
                style: {
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--text-3)",
                  fontSize: "0.68rem",
                  padding: "2px 4px",
                  borderRadius: 3,
                  flexShrink: 0,
                },
                children: "ⓘ",
              }),
            ],
          }),
          i.jsxs("p", {
            style: {
              margin: 0,
              fontSize: "0.61rem",
              color: "var(--text-3)",
              display: "flex",
              alignItems: "center",
              gap: 5,
            },
            children: [
              i.jsxs("span", { children: [l.sr_page, e.pageIdx + 1] }),
              e.assigned_tags &&
                e.assigned_tags.length > 0 &&
                i.jsx("span", {
                  style: { display: "flex", gap: 3 },
                  children: e.assigned_tags
                    .slice(0, 3)
                    .map((c) =>
                      i.jsx(
                        "span",
                        {
                          className: "tag",
                          style: {
                            pointerEvents: "none",
                            fontSize: "0.6rem",
                            padding: "0 5px",
                          },
                          children: c,
                        },
                        c,
                      ),
                    ),
                }),
            ],
          }),
          o &&
            i.jsx("p", {
              className: "mono",
              style: {
                margin: 0,
                fontSize: "0.59rem",
                color: "var(--text-2)",
                wordBreak: "break-all",
                background: "var(--bg-raised)",
                padding: "3px 5px",
                borderRadius: 3,
              },
              children: e.filepath,
            }),
          a &&
            i.jsx("p", {
              style: {
                margin: 0,
                fontSize: "0.71rem",
                color: "var(--text-2)",
                lineHeight: 1.45,
                display: "-webkit-box",
                WebkitBoxOrient: "vertical",
                WebkitLineClamp: 2,
                overflow: "hidden",
                wordBreak: "break-word",
              },
              children: Nf(a),
            }),
        ],
      }),
      i.jsx("div", {
        style: {
          display: "flex",
          alignItems: "center",
          padding: "0 10px",
          flexShrink: 0,
        },
        children: i.jsx("button", {
          onClick: (c) => {
            (c.stopPropagation(), r());
          },
          style: {
            background: "var(--accent-glow)",
            border: "1px solid var(--accent)",
            color: "var(--accent)",
            padding: "5px 11px",
            borderRadius: 5,
            fontSize: "0.68rem",
            cursor: "pointer",
            fontWeight: 600,
            fontFamily: "JetBrains Mono, monospace",
          },
          children: l.sr_open,
        }),
      }),
    ],
  });
}
function B0() {
  const e = Et(),
    [t, n] = So(),
    r = ct(),
    l = x.useRef(null),
    [o, s] = x.useState(t.get("q") ?? ""),
    [a, u] = x.useState(null),
    [c, m] = x.useState(!1),
    [f, g] = x.useState(null),
    [S, y] = x.useState(""),
    [k, j] = x.useState(""),
    [p, d] = x.useState(null),
    [h, w] = x.useState(!0),
    _ = Y((P) => P.apiUrl);
  function E(P) {
    return P
      ? /^https?:\/\//i.test(P)
        ? P
        : `${_}/download?fileKey=${encodeURIComponent(P)}`
      : null;
  }
  x.useEffect(() => {
    function P(O) {
      var $, Q;
      (O.key === "/" &&
        document.activeElement !== l.current &&
        (O.preventDefault(), ($ = l.current) == null || $.focus()),
        O.key === "Escape" &&
          document.activeElement === l.current &&
          ((Q = l.current) == null || Q.blur()));
    }
    return (
      window.addEventListener("keydown", P),
      () => window.removeEventListener("keydown", P)
    );
  }, []);
  async function C(P, O) {
    const $ = O ? `${P} tag:${O}`.trim() : P.trim();
    if (!(!$ && !S && !k)) {
      (m(!0), g(null));
      try {
        const Q = {};
        (S && (Q.created_after = S), k && (Q.created_before = k));
        const T = await Bg($, Q);
        (u(T), n({ q: $ }, { replace: !0 }));
      } catch (Q) {
        g(Q.message);
      } finally {
        m(!1);
      }
    }
  }
  x.useEffect(() => {
    const P = t.get("q");
    P && (s(P), C(P));
  }, []);
  const v =
      a != null && a.tag_facets
        ? Object.entries(a.tag_facets).sort((P, O) => O[1] - P[1])
        : [],
    N = ((a == null ? void 0 : a.hits) ?? []).map((P) => {
      var O;
      return {
        filepath: P.filepath,
        pageIdx:
          typeof P.pageIdx == "string" ? parseInt(P.pageIdx, 10) : P.pageIdx,
        fileId: P.file_id,
        banner_img: E(P.banner_img) ?? void 0,
        assigned_tags: P.assigned_tags,
        searchable_text: P.searchable_text,
        formatted_text: (O = P._formatted) == null ? void 0 : O.searchable_text,
      };
    }),
    z = x.useMemo(() => {
      const P = new Map();
      for (const O of N) {
        const $ = P.get(O.filepath) ?? [];
        ($.push(O), P.set(O.filepath, $));
      }
      return Array.from(P.entries());
    }, [N]);
  function R(P, O) {
    r(
      `/document?filepath=${encodeURIComponent(P.filepath)}&page=${P.pageIdx}&q=${encodeURIComponent(o)}&hit=${O}`,
    );
  }
  const W = new Set(N.map((P) => P.filepath)).size;
  return i.jsxs("div", {
    style: { display: "flex", height: "100%", overflow: "hidden" },
    children: [
      i.jsxs("div", {
        style: {
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        },
        children: [
          i.jsxs("div", {
            style: {
              padding: "12px 16px",
              borderBottom: "1px solid var(--border)",
              flexShrink: 0,
              background: "var(--bg-surface)",
            },
            children: [
              i.jsxs("form", {
                onSubmit: (P) => {
                  (P.preventDefault(), d(null), C(o));
                },
                style: { display: "flex", gap: 7 },
                children: [
                  i.jsxs("div", {
                    style: { flex: 1, position: "relative" },
                    children: [
                      i.jsxs("svg", {
                        width: "13",
                        height: "13",
                        viewBox: "0 0 24 24",
                        fill: "none",
                        stroke: "var(--text-3)",
                        strokeWidth: "2",
                        strokeLinecap: "round",
                        strokeLinejoin: "round",
                        style: {
                          position: "absolute",
                          left: 9,
                          top: "50%",
                          transform: "translateY(-50%)",
                          pointerEvents: "none",
                        },
                        children: [
                          i.jsx("circle", { cx: "11", cy: "11", r: "8" }),
                          i.jsx("line", {
                            x1: "21",
                            y1: "21",
                            x2: "16.65",
                            y2: "16.65",
                          }),
                        ],
                      }),
                      i.jsx("input", {
                        ref: l,
                        className: "input",
                        style: {
                          paddingLeft: 30,
                          paddingRight: o ? 28 : void 0,
                        },
                        placeholder: e.sr_placeholder,
                        value: o,
                        onChange: (P) => s(P.target.value),
                        autoFocus: !0,
                      }),
                      o &&
                        i.jsx("button", {
                          type: "button",
                          onClick: () => {
                            var P;
                            (s(""),
                              u(null),
                              (P = l.current) == null || P.focus());
                          },
                          style: {
                            position: "absolute",
                            right: 7,
                            top: "50%",
                            transform: "translateY(-50%)",
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            color: "var(--text-3)",
                            fontSize: "0.72rem",
                            padding: "0 2px",
                          },
                          children: "✕",
                        }),
                    ],
                  }),
                  i.jsx("button", {
                    className: "btn btn-primary",
                    type: "submit",
                    disabled: c,
                    style: { flexShrink: 0 },
                    children: c ? "…" : e.sr_search,
                  }),
                ],
              }),
              i.jsxs("div", {
                style: { display: "flex", gap: 8, marginTop: 8 },
                children: [
                  i.jsxs("div", {
                    style: { flex: 1 },
                    children: [
                      i.jsx("label", {
                        className: "label",
                        children: e.sr_after,
                      }),
                      i.jsx("input", {
                        className: "input",
                        type: "date",
                        value: S,
                        onChange: (P) => y(P.target.value),
                      }),
                    ],
                  }),
                  i.jsxs("div", {
                    style: { flex: 1 },
                    children: [
                      i.jsx("label", {
                        className: "label",
                        children: e.sr_before,
                      }),
                      i.jsx("input", {
                        className: "input",
                        type: "date",
                        value: k,
                        onChange: (P) => j(P.target.value),
                      }),
                    ],
                  }),
                  i.jsx("div", {
                    style: {
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "flex-end",
                    },
                    children: i.jsx("button", {
                      type: "button",
                      onClick: () => w((P) => !P),
                      className: "btn btn-ghost",
                      style: {
                        fontSize: "0.72rem",
                        padding: "4px 9px",
                        borderColor: h ? "var(--accent)" : void 0,
                        color: h ? "var(--accent)" : void 0,
                      },
                      title: h ? e.sr_flat : e.sr_groupByFile,
                      children: h ? e.sr_flat : e.sr_groupByFile,
                    }),
                  }),
                ],
              }),
              a &&
                i.jsxs("div", {
                  style: {
                    marginTop: 7,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  },
                  children: [
                    i.jsxs("p", {
                      style: {
                        margin: 0,
                        fontSize: "0.7rem",
                        color: "var(--text-3)",
                      },
                      children: [
                        e.sr_results(N.length, W),
                        a.excludedTerms.length > 0 &&
                          i.jsxs(i.Fragment, {
                            children: [
                              " · ",
                              i.jsxs("span", {
                                style: { color: "var(--danger)" },
                                children: [
                                  e.sr_excluded,
                                  " ",
                                  a.excludedTerms.join(", "),
                                ],
                              }),
                            ],
                          }),
                      ],
                    }),
                    a.cleanQuery &&
                      o !== a.cleanQuery &&
                      i.jsxs("span", {
                        style: {
                          fontSize: "0.63rem",
                          color: "var(--text-3)",
                          fontFamily: "JetBrains Mono, monospace",
                          background: "var(--bg-raised)",
                          padding: "1px 6px",
                          borderRadius: 3,
                        },
                        children: ["↳ ", a.cleanQuery],
                      }),
                  ],
                }),
              !a &&
                !c &&
                i.jsxs("p", {
                  style: {
                    margin: "6px 0 0",
                    fontSize: "0.63rem",
                    color: "var(--text-3)",
                  },
                  children: [
                    "Press ",
                    i.jsx("kbd", {
                      style: {
                        background: "var(--bg-raised)",
                        border: "1px solid var(--border)",
                        borderRadius: 3,
                        padding: "0 4px",
                        fontFamily: "JetBrains Mono, monospace",
                        fontSize: "0.62rem",
                      },
                      children: "/",
                    }),
                    " to focus",
                  ],
                }),
            ],
          }),
          i.jsxs("div", {
            style: {
              flex: 1,
              overflowY: "auto",
              padding: "12px 16px",
              display: "flex",
              flexDirection: "column",
              gap: 8,
            },
            children: [
              f &&
                i.jsx("div", {
                  style: {
                    padding: "8px 12px",
                    background: "rgba(248,113,113,0.07)",
                    border: "1px solid rgba(248,113,113,0.2)",
                    borderRadius: 7,
                    color: "var(--danger)",
                    fontSize: "0.8rem",
                  },
                  children: f,
                }),
              c &&
                i.jsx("div", {
                  style: { display: "flex", flexDirection: "column", gap: 6 },
                  children: [80, 100, 70].map((P, O) =>
                    i.jsx(
                      "div",
                      {
                        className: "card",
                        style: {
                          height: P,
                          animation: "pulse 1.5s ease-in-out infinite",
                        },
                      },
                      O,
                    ),
                  ),
                }),
              !c &&
                !f &&
                N.length === 0 &&
                a &&
                i.jsx("div", {
                  style: {
                    textAlign: "center",
                    padding: "48px",
                    color: "var(--text-3)",
                  },
                  children: i.jsx("p", {
                    style: { fontSize: "0.85rem" },
                    children: e.sr_noResults,
                  }),
                }),
              !c && h
                ? z.map(([P, O], $) => {
                    const Q = z
                      .slice(0, $)
                      .reduce((T, [, b]) => T + b.length, 0);
                    return i.jsx(
                      F0,
                      {
                        filepath: P,
                        hits: O,
                        totalHits: N.length,
                        baseIndex: Q,
                        onJump: (T, b) => R(T, b),
                      },
                      P,
                    );
                  })
                : !c &&
                  N.map((P, O) =>
                    i.jsx(
                      D0,
                      {
                        hit: P,
                        index: O,
                        totalHits: N.length,
                        onJump: () => R(P, O),
                      },
                      `${P.fileId}_${P.pageIdx}_${O}`,
                    ),
                  ),
            ],
          }),
        ],
      }),
      v.length > 0 &&
        i.jsxs("aside", {
          style: {
            width: 160,
            flexShrink: 0,
            borderLeft: "1px solid var(--border)",
            padding: "12px 6px",
            overflowY: "auto",
            background: "var(--bg-surface)",
          },
          children: [
            i.jsx("p", {
              className: "label",
              style: { paddingLeft: 4, marginBottom: 6 },
              children: e.sr_filterByTag,
            }),
            v.map(([P, O]) =>
              i.jsxs(
                "button",
                {
                  onClick: () => {
                    const $ = p === P ? null : P;
                    (d($), C(o, $));
                  },
                  style: {
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    width: "100%",
                    padding: "4px 8px",
                    border: "none",
                    borderRadius: 5,
                    cursor: "pointer",
                    fontSize: "0.77rem",
                    fontWeight: 500,
                    background: p === P ? "var(--accent-glow)" : "transparent",
                    color: p === P ? "var(--accent)" : "var(--text-2)",
                    transition: "background 0.1s",
                    marginBottom: 1,
                  },
                  children: [
                    i.jsx("span", {
                      style: {
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        maxWidth: 100,
                      },
                      children: P,
                    }),
                    i.jsx("span", {
                      style: {
                        fontSize: "0.61rem",
                        color: "var(--text-3)",
                        flexShrink: 0,
                        fontFamily: "JetBrains Mono, monospace",
                      },
                      children: O,
                    }),
                  ],
                },
                P,
              ),
            ),
          ],
        }),
    ],
  });
}
const ta = "rain-dms-local";
function pl() {
  return { markers: {}, reminders: {} };
}
function Tu() {
  if (typeof localStorage > "u") return pl();
  try {
    const e = localStorage.getItem(ta);
    if (!e) return pl();
    const t = JSON.parse(e);
    return !t || typeof t != "object"
      ? pl()
      : { markers: t.markers ?? {}, reminders: t.reminders ?? {} };
  } catch {
    return pl();
  }
}
function O0(e) {
  if (!(typeof localStorage > "u"))
    try {
      localStorage.setItem(ta, JSON.stringify(e));
    } catch {}
}
function Rf(e) {
  const [t, n] = x.useState(() => Tu());
  x.useEffect(() => {
    function u(c) {
      c.key === ta && n(Tu());
    }
    return (
      window.addEventListener("storage", u),
      () => window.removeEventListener("storage", u)
    );
  }, []);
  const r = x.useCallback((u) => {
      n((c) => {
        const m = u(c);
        return (O0(m), m);
      });
    }, []),
    l = e ? (t.markers[e] ?? []) : [],
    o = e
      ? (t.reminders[e] ?? { at: null, note: null, done_at: null })
      : { at: null, note: null, done_at: null },
    s = x.useCallback(
      (u) => {
        e &&
          r((c) => {
            const m = typeof u == "function" ? u : () => u;
            return {
              ...c,
              markers: { ...c.markers, [e]: m(c.markers[e] ?? []) },
            };
          });
      },
      [e, r],
    ),
    a = x.useCallback(
      (u) => {
        e &&
          r((c) => {
            const m = { ...c.reminders };
            return (
              u == null ? delete m[e] : (m[e] = u),
              { ...c, reminders: m }
            );
          });
      },
      [e, r],
    );
  return { store: t, markers: l, reminder: o, setMarkers: s, setReminder: a };
}
function $0(e) {
  if (!e) return [];
  if (typeof e == "object" && !Array.isArray(e) && "lines" in e)
    return Mu(e.lines);
  if (Array.isArray(e)) {
    if (e.length === 0) return [];
    if ("boxes" in e[0]) return Mu(e);
    if ("boundingBox" in e[0]) return e.map(Lf);
    if ("bbox" in e[0])
      return e.map((t) => ({
        text: t.text,
        confidence: t.confidence,
        x: t.bbox.x,
        y: t.bbox.y,
        w: t.bbox.width,
        h: t.bbox.height,
      }));
  }
  return [];
}
function Mu(e) {
  return e.flatMap((t) => t.boxes.map(Lf));
}
function Lf(e) {
  const t = e.boundingBox.upLeftPoint,
    n = e.boundingBox.downRightPoint;
  return {
    text: e.text,
    confidence: e.confidence,
    x: t.x,
    y: t.y,
    w: n.x - t.x,
    h: n.y - t.y,
  };
}
function A0(e) {
  return e
    ? (e.split("/").pop() ?? e)
        .replace(
          /-[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}(\.[^.]+)$/i,
          "$1",
        )
        .replace(
          /-\d{4}-\d{2}-\d{2}[T_]\d{2}[:\-]\d{2}[:\-]\d{2}[\.\dZ]*(\.[^.]+)$/i,
          "$1",
        )
    : "Unknown";
}
function U0(e) {
  return (e || "")
    .replace(/tag:\S+/g, "")
    .split(/\s+/)
    .filter((t) => t && !t.startsWith("-"))
    .map((t) => t.toLowerCase());
}
const W0 = 16,
  Iu = 2;
function H0() {
  var sa;
  const [e] = So(),
    t = e.get("filepath") ?? "",
    n = parseInt(e.get("page") ?? "", 10) || 0,
    r = e.get("q") ?? "",
    l = ct(),
    [o, s] = x.useState(null),
    [a, u] = x.useState([]),
    [c, m] = x.useState(!0),
    [f, g] = x.useState(null),
    [S, y] = x.useState(!1),
    [k, j] = x.useState(!1),
    [p, d] = x.useState(!1),
    [h, w] = x.useState(!0),
    [_, E] = x.useState("view"),
    [C, v] = x.useState(null),
    [N, z] = x.useState(800),
    [R, W] = x.useState(0),
    [P, O] = x.useState(0),
    [$, Q] = x.useState(800),
    T = x.useRef(null),
    b = x.useMemo(() => U0(r), [r]),
    { markers: M, setMarkers: B } = Rf(t);
  x.useEffect(() => {
    if (!t) {
      l("/", { replace: !0 });
      return;
    }
    (m(!0),
      Promise.all([Sf(t), yf(t)])
        .then(([D, A]) => {
          (s(D), u(A.pages));
        })
        .catch((D) => g(D.message))
        .finally(() => m(!1)));
  }, [t, l]);
  function V(D, A, G) {
    if (!t) return;
    const ie = `ocr_${G}_${D}`;
    if (M.find((Ue) => Ue.box_key === ie)) {
      (B((Ue) => Ue.filter((Af) => Af.box_key !== ie)), C === ie && v(null));
      return;
    }
    const ye = {
      box_key: ie,
      page_idx: G,
      kind: "ocr",
      x: A.x,
      y: A.y,
      w: A.w,
      h: A.h,
      note: null,
      created_at: new Date().toISOString(),
    };
    (B((Ue) => [...Ue, ye]), v(ie));
  }
  function U(D, A, G) {
    if (!t) return;
    const ie = {
      box_key: `drawn_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      page_idx: D,
      kind: "drawn",
      x: A.x,
      y: A.y,
      w: A.w,
      h: A.h,
      note: null,
      created_at: new Date().toISOString(),
    };
    (B((rt) => [...rt, ie]), v(ie.box_key));
  }
  function dt(D, A) {
    B((G) => G.map((ie) => (ie.box_key === D ? { ...ie, note: A } : ie)));
  }
  function F(D) {
    (B((A) => A.filter((G) => G.box_key !== D)), C === D && v(null));
  }
  async function ve() {
    if (!k) {
      j(!0);
      return;
    }
    y(!0);
    try {
      (await wf(t), l("/", { replace: !0 }));
    } catch (D) {
      (g(D.message), y(!1), j(!1));
    }
  }
  const xe = A0((o == null ? void 0 : o.fileS3Key) ?? ""),
    bt = o == null ? void 0 : o.encrypted_file_key,
    ze = x.useMemo(() => a.map((D) => ({ page: D, boxes: $0(D.ocr) })), [a]),
    Ye = x.useMemo(() => ze.reduce((D, A) => D + A.boxes.length, 0), [ze]),
    te = x.useMemo(() => {
      const D = [];
      return (
        ze.forEach(({ boxes: A }, G) => {
          A.forEach((ie, rt) => {
            b.some((ye) => (ie.text ?? "").toLowerCase().includes(ye)) &&
              D.push({ pageIdx: G, boxIdx: rt, text: ie.text });
          });
        }),
        D
      );
    }, [ze, b]),
    [Yn, Qr] = x.useState(0);
  (x.useEffect(() => {
    Qr(0);
  }, [t]),
    x.useEffect(() => {
      const D = T.current;
      if (!D) return;
      const A = () => {
        const ie = Math.max(360, Math.min(D.clientWidth - 48, 1100));
        (z(ie), Q(D.clientHeight));
      };
      A();
      const G = new ResizeObserver(A);
      return (G.observe(D), () => G.disconnect());
    }, []));
  const [Tf, Mf] = x.useState(0.707),
    ko = N / Tf,
    zt = ko + W0,
    If = Math.max(0, Math.floor(P / zt) - Iu),
    Ff = Math.min(a.length - 1, Math.ceil((P + $) / zt) + Iu),
    Df = a.length === 0 ? 0 : a.length * zt + 40;
  function Bf(D) {
    O(D.currentTarget.scrollTop);
    const A = Math.min(
      a.length - 1,
      Math.max(0, Math.floor(D.currentTarget.scrollTop / zt)),
    );
    W(A);
  }
  function na(D) {
    const A = D * zt;
    T.current && T.current.scrollTo({ top: A, behavior: "smooth" });
  }
  const ra = x.useMemo(() => {
    var A;
    return !r || n > 0 ? n : (((A = te[0]) == null ? void 0 : A.pageIdx) ?? 0);
  }, [r, n, te]);
  (x.useEffect(() => {
    if (c || a.length === 0) return;
    const D = requestAnimationFrame(() => {
      na(Math.min(ra, a.length - 1));
    });
    return () => cancelAnimationFrame(D);
  }, [c, a.length, ra]),
    x.useEffect(() => {
      if (te.length === 0) return;
      const D = te[Yn];
      if (!D) return;
      const A = D.pageIdx * zt;
      if (!T.current) return;
      T.current.scrollTo({ top: A, behavior: "smooth" });
      const G = setTimeout(() => {
        var rt;
        const ie =
          (rt = T.current) == null
            ? void 0
            : rt.querySelector("[data-active-box='true']");
        ie &&
          ie.scrollIntoView({
            behavior: "smooth",
            block: "center",
            inline: "nearest",
          });
      }, 320);
      return () => clearTimeout(G);
    }, [Yn, te.length]));
  const Of = x.useMemo(() => {
      const D = new Map(),
        A = te[Yn];
      return (A && D.set(A.pageIdx, A.boxIdx), D);
    }, [te, Yn]),
    $f = b.length > 0 && te.length > 0,
    [la, oa] = x.useState(!1),
    ia = x.useRef(0);
  return (
    ia.current !== te.length && ((ia.current = te.length), la && oa(!1)),
    c
      ? i.jsx(Fu, {
          children: i.jsx("p", {
            style: { color: "var(--text-3)", fontSize: "0.85rem" },
            children: "Loading…",
          }),
        })
      : f || !o
        ? i.jsxs("div", {
            style: { padding: 24 },
            children: [
              i.jsx("p", {
                style: { color: "var(--danger)", fontSize: "0.85rem" },
                children: f ?? "Document not found.",
              }),
              i.jsx("button", {
                className: "btn btn-ghost",
                onClick: () => l(-1),
                style: { marginTop: 8 },
                children: "← Back",
              }),
            ],
          })
        : i.jsxs("div", {
            style: {
              display: "flex",
              flexDirection: "column",
              height: "100%",
              overflow: "hidden",
            },
            children: [
              i.jsxs("div", {
                style: {
                  padding: "8px 12px",
                  borderBottom: "1px solid var(--border)",
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                  flexShrink: 0,
                  flexWrap: "wrap",
                  background: "var(--bg-surface)",
                },
                children: [
                  i.jsx("button", {
                    className: "btn btn-ghost",
                    onClick: () => l(-1),
                    style: { padding: "3px 8px", fontSize: "0.78rem" },
                    children: "← Back",
                  }),
                  i.jsxs("div", {
                    style: { flex: 1, overflow: "hidden", minWidth: 0 },
                    children: [
                      i.jsxs("div", {
                        style: {
                          display: "flex",
                          alignItems: "center",
                          gap: 5,
                        },
                        children: [
                          i.jsx("p", {
                            className: "mono",
                            style: {
                              margin: 0,
                              fontSize: "0.76rem",
                              color: "var(--text-1)",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            },
                            title: o.fileS3Key,
                            children: xe,
                          }),
                          i.jsx("button", {
                            title: p ? "Hide path" : "Show full S3 path",
                            "aria-label": "Show full path",
                            onClick: () => d((D) => !D),
                            style: {
                              background: "rgba(0,0,0,0.5)",
                              border: "none",
                              cursor: "pointer",
                              color: "var(--text-1)",
                              fontSize: "0.72rem",
                              padding: "2px 6px",
                              borderRadius: 4,
                              flexShrink: 0,
                              lineHeight: 1,
                            },
                            children: "ⓘ",
                          }),
                        ],
                      }),
                      p &&
                        i.jsx("p", {
                          className: "mono",
                          style: {
                            margin: "2px 0 0",
                            fontSize: "0.62rem",
                            color: "var(--text-2)",
                            wordBreak: "break-all",
                            background: "var(--bg-raised)",
                            padding: "4px 6px",
                            borderRadius: 4,
                          },
                          children: o.fileS3Key,
                        }),
                      r &&
                        i.jsxs("p", {
                          style: {
                            margin: "2px 0 0",
                            fontSize: "0.66rem",
                            color: "var(--accent)",
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                          },
                          children: [
                            i.jsxs("span", {
                              style: {
                                fontFamily: "JetBrains Mono, monospace",
                                background: "var(--accent-glow)",
                                padding: "1px 6px",
                                borderRadius: 3,
                                fontWeight: 600,
                              },
                              children: ["“", r, "”"],
                            }),
                            i.jsxs("span", {
                              children: [
                                te.length,
                                " match",
                                te.length !== 1 ? "es" : "",
                                " in this file",
                              ],
                            }),
                          ],
                        }),
                      i.jsxs("p", {
                        style: {
                          margin: 0,
                          fontSize: "0.64rem",
                          color: "var(--text-3)",
                        },
                        children: [
                          "page ",
                          R + 1,
                          " / ",
                          a.length,
                          (sa = o.assigned_tags) != null && sa.length
                            ? " · " + o.assigned_tags.join(", ")
                            : "",
                          Ye > 0 && ` · ${Ye} OCR boxes`,
                        ],
                      }),
                    ],
                  }),
                  i.jsxs("div", {
                    style: { display: "flex", gap: 5, flexShrink: 0 },
                    children: [
                      $f &&
                        i.jsxs("div", {
                          style: {
                            display: "flex",
                            alignItems: "stretch",
                            gap: 0,
                            background: "var(--accent-glow)",
                            border:
                              "1.5px solid color-mix(in srgb, var(--accent) 70%, transparent)",
                            borderRadius: 7,
                            overflow: "hidden",
                            boxShadow:
                              "0 0 0 4px color-mix(in srgb, var(--accent) 18%, transparent)",
                            animation: la
                              ? "none"
                              : "ocr-blink-border 1.4s ease-in-out 3, hit-pill-persist 1.8s ease-in-out 1.4s infinite",
                          },
                          children: [
                            i.jsx("button", {
                              onClick: () =>
                                Qr((D) => (D - 1 + te.length) % te.length),
                              style: hl,
                              title: "Previous hit",
                              "aria-label": "Previous hit",
                              children: "↑",
                            }),
                            i.jsxs("button", {
                              onClick: () => {
                                Qr(0);
                                const D = te[0];
                                D &&
                                  T.current &&
                                  T.current.scrollTo({
                                    top: D.pageIdx * zt,
                                    behavior: "smooth",
                                  });
                              },
                              title: "Jump to first hit",
                              "aria-label": "Jump to first hit",
                              style: {
                                ...hl,
                                padding: "3px 9px",
                                fontSize: "0.72rem",
                                fontFamily: "JetBrains Mono, monospace",
                                fontWeight: 700,
                                letterSpacing: "0.04em",
                                borderLeft:
                                  "1px solid color-mix(in srgb, var(--accent) 35%, transparent)",
                                borderRight:
                                  "1px solid color-mix(in srgb, var(--accent) 35%, transparent)",
                                display: "flex",
                                alignItems: "center",
                                gap: 5,
                              },
                              children: [
                                i.jsx("span", {
                                  style: { fontSize: "0.78rem" },
                                  children: "●",
                                }),
                                i.jsxs("span", {
                                  children: ["HIT ", Yn + 1, "/", te.length],
                                }),
                              ],
                            }),
                            i.jsx("button", {
                              onClick: () => Qr((D) => (D + 1) % te.length),
                              style: hl,
                              title: "Next hit",
                              "aria-label": "Next hit",
                              children: "↓",
                            }),
                            i.jsx("button", {
                              onClick: () => oa(!0),
                              style: {
                                ...hl,
                                fontSize: "0.62rem",
                                padding: "2px 6px",
                                borderLeft:
                                  "1px solid color-mix(in srgb, var(--accent) 25%, transparent)",
                                opacity: 0.6,
                              },
                              title: "Dismiss glow",
                              "aria-label": "Dismiss",
                              children: "✕",
                            }),
                          ],
                        }),
                      Ye > 0 &&
                        i.jsx("button", {
                          className: `btn ${h ? "btn-primary" : "btn-ghost"}`,
                          onClick: () => w((D) => !D),
                          style: { fontSize: "0.72rem" },
                          children: "OCR",
                        }),
                      i.jsx("button", {
                        className: `btn ${_ !== "view" ? "btn-primary" : "btn-ghost"}`,
                        onClick: () =>
                          E((D) => (D === "draw" ? "view" : "draw")),
                        style: { fontSize: "0.72rem" },
                        title:
                          _ === "draw"
                            ? "Drawing mode: drag a rectangle on a page to create a marker"
                            : "Switch to draw mode to create a new marker",
                        children: _ === "draw" ? "Drawing…" : "✎ Mark",
                      }),
                      M.length > 0 &&
                        i.jsxs("span", {
                          style: {
                            fontSize: "0.68rem",
                            color: "var(--warn)",
                            fontFamily: "JetBrains Mono, monospace",
                            background: "var(--bg-raised)",
                            padding: "2px 7px",
                            borderRadius: 4,
                          },
                          children: [
                            M.length,
                            " marker",
                            M.length !== 1 ? "s" : "",
                          ],
                        }),
                      i.jsx("a", {
                        href: Ug(o.fileS3Key),
                        download: !0,
                        className: "btn btn-ghost",
                        style: { fontSize: "0.72rem", textDecoration: "none" },
                        children: "↓",
                      }),
                      i.jsx("button", {
                        className: "btn btn-danger",
                        onClick: ve,
                        disabled: S,
                        style: { fontSize: "0.72rem" },
                        children: S ? "…" : k ? "Confirm?" : "Delete",
                      }),
                      k &&
                        !S &&
                        i.jsx("button", {
                          className: "btn btn-ghost",
                          onClick: () => j(!1),
                          style: { fontSize: "0.72rem" },
                          children: "✕",
                        }),
                    ],
                  }),
                ],
              }),
              a.length > 1 &&
                i.jsxs("div", {
                  style: {
                    padding: "5px 12px",
                    borderBottom: "1px solid var(--border-soft)",
                    display: "flex",
                    gap: 4,
                    alignItems: "center",
                    flexShrink: 0,
                    background: "var(--bg-surface)",
                    overflowX: "auto",
                  },
                  children: [
                    i.jsx("span", {
                      style: {
                        fontSize: "0.65rem",
                        color: "var(--text-3)",
                        flexShrink: 0,
                        marginRight: 4,
                        letterSpacing: "0.05em",
                        textTransform: "uppercase",
                      },
                      children: "pages",
                    }),
                    a.map((D, A) =>
                      i.jsx(
                        "button",
                        {
                          onClick: () => na(A),
                          style: {
                            padding: "2px 7px",
                            borderRadius: 4,
                            fontSize: "0.68rem",
                            background:
                              R === A
                                ? "var(--accent-glow)"
                                : "var(--bg-raised)",
                            border: `1px solid ${R === A ? "var(--accent)" : "var(--border)"}`,
                            color: R === A ? "var(--accent)" : "var(--text-2)",
                            cursor: "pointer",
                            flexShrink: 0,
                          },
                          children: D.pageIdx + 1,
                        },
                        D.pageIdx,
                      ),
                    ),
                  ],
                }),
              i.jsx("div", {
                ref: T,
                onScroll: Bf,
                style: { flex: 1, overflowY: "auto", position: "relative" },
                children: i.jsxs("div", {
                  style: { height: Df, position: "relative" },
                  children: [
                    ze.length === 0 &&
                      i.jsx(Fu, {
                        children: i.jsx("p", {
                          style: { color: "var(--text-3)" },
                          children: "No pages available.",
                        }),
                      }),
                    ze.map(({ page: D, boxes: A }, G) => {
                      const ie = G >= If && G <= Ff,
                        rt = G * zt + 20;
                      return ie
                        ? i.jsx(
                            V0,
                            {
                              page: D,
                              boxes: A,
                              showOcr: h,
                              markersMode: _,
                              markers: M.filter((ye) => ye.page_idx === G),
                              encryptedFileKey: bt,
                              width: N,
                              height: ko,
                              index: G,
                              highlightTokens: b,
                              activeHighlightIdx: Of.get(G),
                              onAspectRatio: (ye, Ue) => {
                                ye && Ue && G === 0 && Mf(ye / Ue);
                              },
                              top: rt,
                              onToggleBoxMarker: (ye, Ue) => V(ye, Ue, G),
                              onAddDrawnMarker: (ye) => U(G, ye),
                              onRemoveMarker: (ye) => F(ye),
                              noteMarkerKey: C,
                              onSaveNote: (ye, Ue) => dt(ye, Ue),
                              onCloseNote: () => v(null),
                            },
                            D.pageIdx,
                          )
                        : i.jsxs(
                            "div",
                            {
                              id: `page-${G}`,
                              style: {
                                position: "absolute",
                                top: rt,
                                left: 0,
                                right: 0,
                                height: ko,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "var(--text-3)",
                                fontSize: "0.7rem",
                                fontFamily: "JetBrains Mono, monospace",
                              },
                              children: ["page ", D.pageIdx + 1],
                            },
                            D.pageIdx,
                          );
                    }),
                  ],
                }),
              }),
            ],
          })
  );
}
function V0({
  page: e,
  boxes: t,
  showOcr: n,
  markersMode: r,
  markers: l,
  encryptedFileKey: o,
  width: s,
  height: a,
  index: u,
  highlightTokens: c,
  activeHighlightIdx: m,
  onAspectRatio: f,
  top: g,
  onToggleBoxMarker: S,
  onAddDrawnMarker: y,
  onRemoveMarker: k,
  noteMarkerKey: j,
  onSaveNote: p,
  onCloseNote: d,
}) {
  const [h, w] = x.useState(null);
  return i.jsxs("div", {
    id: `page-${u}`,
    style: {
      position: "absolute",
      top: g,
      left: "50%",
      transform: "translateX(-50%)",
      width: s,
      background: "#fff",
      boxShadow: "0 4px 28px rgba(0,0,0,0.45)",
      borderRadius: 4,
      overflow: "hidden",
      height: a,
    },
    children: [
      i.jsx(wo, {
        src: e.banner_img,
        encryptedFileKey: o,
        alt: `Page ${e.pageIdx + 1}`,
        onLoad: (_, E) => {
          (w({ w: _, h: E }), f == null || f(_, E));
        },
        style: {
          display: "block",
          width: "100%",
          height: "100%",
          objectFit: "contain",
          background: "#fff",
        },
      }),
      n &&
        t.length > 0 &&
        h &&
        i.jsx(K0, {
          boxes: t,
          markers: l,
          naturalWidth: h.w,
          naturalHeight: h.h,
          highlightTokens: c,
          activeHighlightIdx: m,
          markersMode: r,
          onToggleBoxMarker: S,
          onAddDrawnMarker: y,
          onRemoveMarker: k,
          noteMarkerKey: j,
          onSaveNote: p,
          onCloseNote: d,
        }),
    ],
  });
}
function K0({
  boxes: e,
  markers: t,
  naturalWidth: n,
  naturalHeight: r,
  highlightTokens: l,
  activeHighlightIdx: o,
  markersMode: s,
  onToggleBoxMarker: a,
  onAddDrawnMarker: u,
  onRemoveMarker: c,
  noteMarkerKey: m,
  onSaveNote: f,
  onCloseNote: g,
}) {
  var $, Q;
  const [S, y] = x.useState(null),
    [k, j] = x.useState(null),
    p = x.useRef(null),
    [d, h] = x.useState(null),
    w = new Map();
  t.forEach((T) => {
    if (T.kind === "ocr") {
      const b = T.box_key.match(/^ocr_(\d+)_(\d+)$/);
      b && w.set(parseInt(b[2], 10), T);
    }
  });
  const _ = l ?? [],
    E = e
      .map((T, b) => ({
        i: b,
        match:
          _.length > 0 &&
          _.some((M) => (T.text ?? "").toLowerCase().includes(M)),
      }))
      .filter((T) => T.match)
      .map((T) => T.i),
    C = o != null ? E.indexOf(o) : -1,
    v = S != null ? e[S] : null;
  function N(T, b) {
    var U;
    const M = (U = p.current) == null ? void 0 : U.getBoundingClientRect();
    if (!M) return { x: 0, y: 0 };
    const B = (T - M.left) / M.width,
      V = (b - M.top) / M.height;
    return { x: Math.round(B * n), y: Math.round(V * r) };
  }
  function z(T) {
    if (s !== "draw" || T.button !== 0 || T.target.closest("[data-box-key]"))
      return;
    const { x: b, y: M } = N(T.clientX, T.clientY);
    h({ startX: b, startY: M, x: b, y: M });
  }
  function R(T) {
    var M;
    const b = (M = p.current) == null ? void 0 : M.getBoundingClientRect();
    if ((b && j({ x: T.clientX - b.left, y: T.clientY - b.top }), d)) {
      const { x: B, y: V } = N(T.clientX, T.clientY);
      h((U) => U && { ...U, x: B, y: V });
    }
  }
  function W() {
    if (!d) return;
    const T = Math.min(d.startX, d.x),
      b = Math.min(d.startY, d.y),
      M = Math.max(d.startX, d.x),
      B = Math.max(d.startY, d.y),
      V = M - T,
      U = B - b;
    (h(null),
      V > 10 &&
        U > 10 &&
        u({ x: T, y: b, w: V, h: U, text: "", confidence: null }));
  }
  function P() {
    (y(null), j(null), d && h(null));
  }
  const O = t.filter((T) => T.kind === "drawn");
  return i.jsxs("div", {
    ref: p,
    onMouseDown: z,
    onMouseMove: R,
    onMouseUp: W,
    onMouseLeave: P,
    style: {
      position: "absolute",
      inset: 0,
      pointerEvents: "none",
      cursor: s === "draw" ? "crosshair" : "default",
    },
    children: [
      e.map((T, b) => {
        const M = T.confidence ?? 1,
          B = b === S,
          V = E.includes(b),
          U = C >= 0 && E[C] === b,
          F = !!w.get(b),
          ve =
            M > 0.85
              ? "var(--ocr-conf-high)"
              : M > 0.6
                ? "var(--ocr-conf-mid)"
                : "var(--ocr-conf-low)",
          xe = U
            ? "var(--ocr-active-border)"
            : F
              ? "var(--ocr-marker-border)"
              : V
                ? "var(--ocr-match-border)"
                : B
                  ? "var(--ocr-active-border)"
                  : ve,
          bt = U
            ? "var(--ocr-active-bg)"
            : F
              ? "var(--ocr-marker-bg)"
              : V || B
                ? "var(--ocr-match-bg)"
                : "transparent";
        return i.jsx(
          "div",
          {
            "data-box-key": `ocr_${b}`,
            onMouseEnter: (ze) => {
              var te;
              y(b);
              const Ye =
                (te = p.current) == null ? void 0 : te.getBoundingClientRect();
              Ye && j({ x: ze.clientX - Ye.left, y: ze.clientY - Ye.top });
            },
            onMouseMove: (ze) => {
              var te;
              if (S !== b) return;
              const Ye =
                (te = p.current) == null ? void 0 : te.getBoundingClientRect();
              Ye && j({ x: ze.clientX - Ye.left, y: ze.clientY - Ye.top });
            },
            onContextMenu: (ze) => {
              (ze.preventDefault(), a(b, T));
            },
            onDoubleClick: () => a(b, T),
            className: U ? "ocr-active-blink" : void 0,
            "data-active-box": U ? "true" : void 0,
            style: {
              position: "absolute",
              left: `${(T.x / n) * 100}%`,
              top: `${(T.y / r) * 100}%`,
              width: `${(T.w / n) * 100}%`,
              height: `${(T.h / r) * 100}%`,
              border: `2px solid ${xe}`,
              background: bt,
              cursor: "crosshair",
              boxSizing: "border-box",
              transition: "background 0.08s, border-color 0.08s",
              zIndex: U ? 4 : F ? 3 : V ? 2 : 1,
              pointerEvents: "auto",
              borderRadius: 2,
            },
          },
          b,
        );
      }),
      O.map((T) =>
        i.jsx(
          "div",
          {
            "data-box-key": T.box_key,
            style: {
              position: "absolute",
              left: `${(T.x / n) * 100}%`,
              top: `${(T.y / r) * 100}%`,
              width: `${(T.w / n) * 100}%`,
              height: `${(T.h / r) * 100}%`,
              border: "2px dashed var(--ocr-marker-border)",
              background: "var(--ocr-marker-bg)",
              zIndex: 5,
              pointerEvents: "auto",
              boxSizing: "border-box",
            },
            onDoubleClick: () => c(T.box_key),
            children:
              T.note &&
              i.jsxs("div", {
                style: {
                  position: "absolute",
                  top: -22,
                  left: 0,
                  fontSize: "0.66rem",
                  background: "var(--ocr-tooltip-bg)",
                  color: "var(--ocr-tooltip-fg)",
                  padding: "2px 6px",
                  borderRadius: 4,
                  border: "1px solid var(--ocr-marker-border)",
                  whiteSpace: "nowrap",
                  maxWidth: 320,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                },
                title: T.note,
                children: ["✎ ", T.note],
              }),
          },
          T.box_key,
        ),
      ),
      d &&
        i.jsx("div", {
          style: {
            position: "absolute",
            left: `${(Math.min(d.startX, d.x) / n) * 100}%`,
            top: `${(Math.min(d.startY, d.y) / r) * 100}%`,
            width: `${(Math.abs(d.x - d.startX) / n) * 100}%`,
            height: `${(Math.abs(d.y - d.startY) / r) * 100}%`,
            border: "2px dashed var(--ocr-marker-border)",
            background: "var(--ocr-marker-bg)",
            zIndex: 6,
            pointerEvents: "none",
            boxSizing: "border-box",
          },
        }),
      v &&
        k &&
        i.jsxs("div", {
          style: {
            position: "absolute",
            left: Math.min(
              k.x + 14,
              ((($ = p.current) == null ? void 0 : $.clientWidth) ?? 0) - 260,
            ),
            top: Math.min(
              k.y + 14,
              (((Q = p.current) == null ? void 0 : Q.clientHeight) ?? 0) - 70,
            ),
            background: "var(--ocr-tooltip-bg)",
            border: "1px solid var(--ocr-tooltip-border)",
            borderRadius: 6,
            padding: "8px 10px",
            color: "var(--ocr-tooltip-fg)",
            pointerEvents: "none",
            zIndex: 8,
            boxShadow: "0 8px 24px rgba(0,0,0,0.85)",
            maxWidth: 260,
          },
          children: [
            i.jsx("div", {
              style: {
                fontSize: "0.82rem",
                fontWeight: 500,
                lineHeight: 1.4,
                color: "var(--ocr-tooltip-fg)",
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
              },
              children: v.text || "(empty)",
            }),
            i.jsxs("div", {
              style: {
                marginTop: 6,
                display: "flex",
                alignItems: "center",
                gap: 5,
                flexWrap: "wrap",
              },
              children: [
                v.confidence != null &&
                  i.jsxs("span", {
                    style: {
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 5,
                      padding: "2px 7px",
                      borderRadius: 999,
                      background:
                        v.confidence > 0.85
                          ? "var(--ocr-conf-high)"
                          : v.confidence > 0.6
                            ? "var(--ocr-conf-mid)"
                            : "var(--ocr-conf-low)",
                      fontSize: "0.7rem",
                      fontFamily: "JetBrains Mono, monospace",
                      fontWeight: 600,
                      color: "var(--ocr-tooltip-fg)",
                      letterSpacing: "0.04em",
                    },
                    children: ["conf ", (v.confidence * 100).toFixed(0), "%"],
                  }),
                i.jsx("span", {
                  style: { fontSize: "0.62rem", color: "var(--text-3)" },
                  children: w.has(S ?? -1)
                    ? "marked · double-click to unmark"
                    : "double-click to mark",
                }),
              ],
            }),
          ],
        }),
      m &&
        (() => {
          const T = t.find((b) => b.box_key === m);
          return T
            ? i.jsx(Q0, {
                marker: T,
                naturalWidth: n,
                naturalHeight: r,
                onSave: (b) => f(T.box_key, b),
                onClose: g,
                onDelete: () => {
                  (c(T.box_key), g());
                },
              })
            : null;
        })(),
    ],
  });
}
function Q0({
  marker: e,
  naturalWidth: t,
  naturalHeight: n,
  onSave: r,
  onClose: l,
  onDelete: o,
}) {
  const [s, a] = x.useState(e.note ?? "");
  return i.jsxs("div", {
    style: {
      position: "absolute",
      left: `${((e.x + e.w + 8) / t) * 100}%`,
      top: `${(e.y / n) * 100}%`,
      background: "var(--ocr-tooltip-bg)",
      border: "1px solid var(--ocr-marker-border)",
      borderRadius: 6,
      padding: 8,
      zIndex: 9,
      width: 220,
      boxShadow: "0 8px 24px rgba(0,0,0,0.7)",
      pointerEvents: "auto",
    },
    onClick: (u) => u.stopPropagation(),
    children: [
      i.jsx("textarea", {
        autoFocus: !0,
        value: s,
        onChange: (u) => a(u.target.value),
        placeholder: "Note for this marker…",
        rows: 3,
        style: {
          width: "100%",
          background: "var(--bg-raised)",
          color: "var(--ocr-tooltip-fg)",
          border: "1px solid var(--border)",
          borderRadius: 4,
          padding: 5,
          fontSize: "0.76rem",
          fontFamily: "inherit",
          resize: "vertical",
        },
      }),
      i.jsxs("div", {
        style: {
          marginTop: 6,
          display: "flex",
          gap: 4,
          justifyContent: "flex-end",
        },
        children: [
          i.jsx("button", {
            className: "btn btn-ghost",
            onClick: o,
            style: { fontSize: "0.68rem", padding: "3px 7px" },
            children: "Delete",
          }),
          i.jsx("button", {
            className: "btn btn-ghost",
            onClick: l,
            style: { fontSize: "0.68rem", padding: "3px 7px" },
            children: "Close",
          }),
          i.jsx("button", {
            className: "btn btn-primary",
            onClick: () => {
              (r(s), l());
            },
            style: { fontSize: "0.68rem", padding: "3px 9px" },
            children: "Save",
          }),
        ],
      }),
    ],
  });
}
function Fu({ children: e }) {
  return i.jsx("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      height: "100%",
    },
    children: e,
  });
}
const hl = {
  background: "transparent",
  border: "none",
  color: "var(--accent)",
  cursor: "pointer",
  fontSize: "0.85rem",
  padding: "2px 6px",
  borderRadius: 3,
  lineHeight: 1,
};
function Du(e) {
  return e < 1024
    ? `${e} B`
    : e < 1024 ** 2
      ? `${(e / 1024).toFixed(1)} KB`
      : e < 1024 ** 3
        ? `${(e / 1024 ** 2).toFixed(1)} MB`
        : `${(e / 1024 ** 3).toFixed(2)} GB`;
}
function J0(e) {
  return e < 60
    ? `${e}s`
    : e < 3600
      ? `${Math.round(e / 60)}m ${e % 60}s`
      : `${(e / 3600).toFixed(1)}h`;
}
function ml(e) {
  return e ? `${e.toFixed(1)} p/min` : "—";
}
function Bu({ value: e, max: t, warn: n }) {
  const r = t > 0 ? Math.min(100, (e / t) * 100) : 0;
  return i.jsx("div", {
    style: {
      height: 8,
      background: "var(--bg-raised)",
      borderRadius: 999,
      overflow: "hidden",
      width: "100%",
    },
    children: i.jsx("div", {
      style: {
        height: "100%",
        width: `${r}%`,
        background: n && r > 60 ? "var(--warn)" : "var(--accent)",
        borderRadius: 999,
        transition: "width 0.6s cubic-bezier(0.4,0,0.2,1)",
        boxShadow: r > 0 ? "0 0 6px var(--accent)" : "none",
      },
    }),
  });
}
function Y0({ data: e }) {
  if (!e.length)
    return i.jsx("div", {
      style: {
        height: 36,
        color: "var(--text-3)",
        fontSize: "0.7rem",
        display: "flex",
        alignItems: "center",
      },
      children: "no data",
    });
  const t = Math.max(...e, 1);
  return i.jsx("div", {
    style: { display: "flex", alignItems: "flex-end", gap: 2, height: 36 },
    children: e.map((n, r) =>
      i.jsx(
        "div",
        {
          title: `${n} docs`,
          style: {
            flex: 1,
            minWidth: 3,
            height: `${Math.max(4, (n / t) * 100)}%`,
            background: n > 0 ? "var(--accent)" : "var(--bg-raised)",
            borderRadius: "2px 2px 0 0",
            opacity: 0.7 + (r / e.length) * 0.3,
            transition: "height 0.4s",
          },
        },
        r,
      ),
    ),
  });
}
function ft({ value: e, suffix: t = "" }) {
  const [n, r] = x.useState(0),
    l = x.useRef(null);
  return (
    x.useEffect(() => {
      const o = e,
        s = 700,
        a = performance.now(),
        u = n;
      function c(m) {
        const f = Math.min(1, (m - a) / s),
          g = 1 - Math.pow(1 - f, 3);
        (r(Math.round(u + (o - u) * g)),
          f < 1 && (l.current = requestAnimationFrame(c)));
      }
      return (
        (l.current = requestAnimationFrame(c)),
        () => {
          l.current && cancelAnimationFrame(l.current);
        }
      );
    }, [e]),
    i.jsxs(i.Fragment, { children: [n.toLocaleString(), t] })
  );
}
function Pe({ label: e, value: t, sub: n, accent: r, warn: l, mono: o }) {
  return i.jsxs("div", {
    className: "card",
    style: { padding: "14px 16px" },
    children: [
      i.jsx("p", {
        style: {
          margin: 0,
          fontSize: "0.63rem",
          color: "var(--text-3)",
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.07em",
        },
        children: e,
      }),
      i.jsx("p", {
        style: {
          margin: "5px 0 0",
          fontSize: "1.45rem",
          fontWeight: 700,
          lineHeight: 1,
          color: l ? "var(--warn)" : r ? "var(--accent)" : "var(--text-1)",
          fontFamily: o ? "JetBrains Mono, monospace" : void 0,
        },
        children: t,
      }),
      n &&
        i.jsx("p", {
          style: {
            margin: "4px 0 0",
            fontSize: "0.67rem",
            color: "var(--text-3)",
          },
          children: n,
        }),
    ],
  });
}
function Ou({ worker: e, type: t }) {
  const n = e.active || e.ack_per_sec > 0;
  return i.jsxs("div", {
    className: "card",
    style: {
      padding: "10px 12px",
      display: "flex",
      alignItems: "center",
      gap: 10,
    },
    children: [
      i.jsx("div", {
        style: {
          width: 7,
          height: 7,
          borderRadius: "50%",
          flexShrink: 0,
          background: n ? "var(--success)" : "var(--text-3)",
          boxShadow: n ? "0 0 6px var(--success)" : "none",
          transition: "background 0.4s, box-shadow 0.4s",
        },
      }),
      i.jsxs("div", {
        style: { flex: 1, overflow: "hidden" },
        children: [
          i.jsx("p", {
            className: "mono",
            style: {
              margin: 0,
              fontSize: "0.72rem",
              color: "var(--text-1)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            },
            children: e.peerHost ?? e.ip ?? e.id,
          }),
          i.jsxs("p", {
            style: { margin: 0, fontSize: "0.65rem", color: "var(--text-3)" },
            children: [
              t === "ocr" ? "OCR" : "Merge",
              " · pf ",
              e.prefetch ?? "—",
              e.unacked > 0 &&
                i.jsxs("span", {
                  style: { color: "var(--warn)", marginLeft: 6 },
                  children: [e.unacked, " unacked"],
                }),
            ],
          }),
        ],
      }),
      i.jsx("div", {
        style: { textAlign: "right", flexShrink: 0 },
        children: i.jsx("p", {
          style: {
            margin: 0,
            fontSize: "0.72rem",
            color: n ? "var(--accent)" : "var(--text-3)",
            fontFamily: "JetBrains Mono, monospace",
          },
          children:
            e.ack_per_sec > 0 ? `${e.ack_per_sec.toFixed(2)}/s` : "idle",
        }),
      }),
    ],
  });
}
function sr({ label: e, children: t }) {
  return i.jsxs("div", {
    style: { marginBottom: 24 },
    children: [
      i.jsxs("h3", {
        style: {
          margin: "0 0 10px",
          fontSize: "0.72rem",
          fontWeight: 700,
          color: "var(--text-3)",
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          display: "flex",
          alignItems: "center",
          gap: 8,
        },
        children: [
          e,
          i.jsx("div", {
            style: { flex: 1, height: 1, background: "var(--border-soft)" },
          }),
        ],
      }),
      t,
    ],
  });
}
function X0() {
  var C;
  const [e, t] = x.useState(null),
    [n, r] = x.useState(!0),
    [l, o] = x.useState(null),
    [s, a] = x.useState(null);
  async function u() {
    (r(!0), o(null));
    try {
      const v = await $g();
      (t(v), a(new Date()));
    } catch (v) {
      o(v.message);
    } finally {
      r(!1);
    }
  }
  x.useEffect(() => {
    u();
    const v = setInterval(u, 5e3);
    return () => clearInterval(v);
  }, []);
  const c = (e == null ? void 0 : e.stats) ?? {},
    m = (e == null ? void 0 : e.workers) ?? {},
    f = m.ocr ?? [],
    g = m.merge ?? [],
    S = c.sparkline ?? [],
    y = c.by_extension ?? {},
    k = c.biggest_files ?? [],
    j =
      c.total_pages > 0
        ? Math.round((c.total_size_bytes ?? 0) / c.total_pages / 1024)
        : null,
    p = c.pages_per_minute_30s,
    d = c.pages_per_minute_60s,
    h = c.eta_seconds,
    w = c.ocr_queue_length ?? 0,
    _ = c.merge_queue_length ?? 0,
    E = Math.max(100, w, _);
  return i.jsxs("div", {
    style: { padding: "18px 24px", overflowY: "auto", height: "100%" },
    children: [
      i.jsxs("div", {
        style: {
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 20,
        },
        children: [
          i.jsx("h2", {
            style: {
              margin: 0,
              fontSize: "1rem",
              fontWeight: 700,
              color: "var(--text-1)",
            },
            children: "System Stats",
          }),
          i.jsx("button", {
            className: "btn btn-ghost",
            onClick: u,
            disabled: n,
            style: { fontSize: "0.72rem", padding: "3px 8px" },
            children: n ? "…" : "↻ Refresh",
          }),
          s &&
            i.jsxs("span", {
              style: {
                fontSize: "0.64rem",
                color: "var(--text-3)",
                fontFamily: "JetBrains Mono, monospace",
              },
              children: ["auto-refresh 5s · last ", s.toLocaleTimeString()],
            }),
        ],
      }),
      l &&
        i.jsx("div", {
          style: {
            marginBottom: 16,
            padding: "9px 13px",
            background: "rgba(248,113,113,0.07)",
            border: "1px solid rgba(248,113,113,0.2)",
            borderRadius: 7,
            color: "var(--danger)",
            fontSize: "0.8rem",
          },
          children: l,
        }),
      i.jsxs(sr, {
        label: "Documents",
        children: [
          i.jsxs("div", {
            style: {
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(140px,1fr))",
              gap: 10,
              marginBottom: 14,
            },
            children: [
              i.jsx(Pe, {
                label: "Total",
                value: i.jsx(ft, { value: c.total_documents ?? 0 }),
                accent: !0,
              }),
              i.jsx(Pe, {
                label: "+1h",
                value: i.jsx(ft, { value: c.added_last_1h ?? 0 }),
              }),
              i.jsx(Pe, {
                label: "+24h",
                value: i.jsx(ft, { value: c.added_last_24h ?? 0 }),
              }),
              i.jsx(Pe, {
                label: "+7d",
                value: i.jsx(ft, { value: c.added_last_7d ?? 0 }),
              }),
              i.jsx(Pe, {
                label: "+30d",
                value: i.jsx(ft, { value: c.added_last_30d ?? 0 }),
              }),
              i.jsx(Pe, {
                label: "Total pages",
                value: i.jsx(ft, { value: c.total_pages ?? 0 }),
                sub: `avg ${((C = c.avg_pages_per_doc) == null ? void 0 : C.toFixed(1)) ?? "—"} p/doc`,
              }),
              i.jsx(Pe, {
                label: "OCR coverage",
                value:
                  c.ocr_coverage_pct != null
                    ? i.jsxs(i.Fragment, {
                        children: [c.ocr_coverage_pct, "%"],
                      })
                    : "—",
                sub: `${c.pages_with_ocr ?? 0} / ${c.total_pages ?? 0} pages`,
                accent: c.ocr_coverage_pct === 100,
                warn: c.ocr_coverage_pct != null && c.ocr_coverage_pct < 50,
              }),
              i.jsx(Pe, {
                label: "Est. storage",
                value: Du(c.total_size_bytes ?? 0),
                sub: j ? `~${j} KB/page` : void 0,
                mono: !0,
              }),
            ],
          }),
          S.length > 0 &&
            i.jsxs("div", {
              className: "card",
              style: { padding: "12px 14px" },
              children: [
                i.jsx("p", {
                  style: {
                    margin: "0 0 8px",
                    fontSize: "0.63rem",
                    color: "var(--text-3)",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.07em",
                  },
                  children: "Documents added — last 24h (by hour)",
                }),
                i.jsx(Y0, { data: S }),
              ],
            }),
        ],
      }),
      i.jsxs(sr, {
        label: "OCR Pipeline",
        children: [
          i.jsxs("div", {
            style: {
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(140px,1fr))",
              gap: 10,
              marginBottom: 14,
            },
            children: [
              i.jsx(Pe, {
                label: "OCR queue",
                value: i.jsx(ft, { value: w }),
                warn: w > 20,
                mono: !0,
              }),
              i.jsx(Pe, {
                label: "Merge queue",
                value: i.jsx(ft, { value: _ }),
                warn: _ > 10,
                mono: !0,
              }),
              i.jsx(Pe, {
                label: "Processing",
                value: i.jsx(ft, { value: c.currently_processing ?? 0 }),
                accent: c.currently_processing > 0,
                mono: !0,
              }),
              i.jsx(Pe, { label: "30s rate", value: ml(p), mono: !0 }),
              i.jsx(Pe, { label: "60s rate", value: ml(d), mono: !0 }),
              i.jsx(Pe, {
                label: "ETA",
                value: h != null ? J0(h) : "—",
                warn: h != null && h > 600,
                mono: !0,
              }),
            ],
          }),
          i.jsxs("div", {
            className: "card",
            style: {
              padding: "12px 14px",
              display: "flex",
              flexDirection: "column",
              gap: 10,
            },
            children: [
              i.jsxs("div", {
                children: [
                  i.jsxs("div", {
                    style: {
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: 5,
                    },
                    children: [
                      i.jsx("span", {
                        style: {
                          fontSize: "0.68rem",
                          color: "var(--text-2)",
                          fontWeight: 600,
                        },
                        children: "OCR queue",
                      }),
                      i.jsxs("span", {
                        style: {
                          fontSize: "0.68rem",
                          color: "var(--text-3)",
                          fontFamily: "JetBrains Mono, monospace",
                        },
                        children: [w, " jobs"],
                      }),
                    ],
                  }),
                  i.jsx(Bu, { value: w, max: E, warn: !0 }),
                ],
              }),
              i.jsxs("div", {
                children: [
                  i.jsxs("div", {
                    style: {
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: 5,
                    },
                    children: [
                      i.jsx("span", {
                        style: {
                          fontSize: "0.68rem",
                          color: "var(--text-2)",
                          fontWeight: 600,
                        },
                        children: "Merge queue",
                      }),
                      i.jsxs("span", {
                        style: {
                          fontSize: "0.68rem",
                          color: "var(--text-3)",
                          fontFamily: "JetBrains Mono, monospace",
                        },
                        children: [_, " jobs"],
                      }),
                    ],
                  }),
                  i.jsx(Bu, { value: _, max: E }),
                ],
              }),
              (p || d) &&
                i.jsxs("div", {
                  children: [
                    i.jsxs("div", {
                      style: {
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: 5,
                      },
                      children: [
                        i.jsx("span", {
                          style: {
                            fontSize: "0.68rem",
                            color: "var(--text-2)",
                            fontWeight: 600,
                          },
                          children: "Throughput (30s vs 60s)",
                        }),
                        i.jsxs("span", {
                          style: {
                            fontSize: "0.68rem",
                            color: "var(--text-3)",
                            fontFamily: "JetBrains Mono, monospace",
                          },
                          children: [ml(p), " · ", ml(d)],
                        }),
                      ],
                    }),
                    i.jsx("div", {
                      style: {
                        height: 8,
                        background: "var(--bg-raised)",
                        borderRadius: 999,
                        overflow: "hidden",
                        position: "relative",
                      },
                      children: i.jsx("div", {
                        style: {
                          height: "100%",
                          width: `${Math.min(100, ((p ?? 0) / Math.max(p ?? 1, d ?? 1, 1)) * 100)}%`,
                          background: "var(--accent)",
                          borderRadius: 999,
                          transition: "width 0.6s",
                          opacity: 0.7,
                        },
                      }),
                    }),
                  ],
                }),
            ],
          }),
        ],
      }),
      (f.length > 0 || g.length > 0) &&
        i.jsx(sr, {
          label: `Workers (${f.length} OCR · ${g.length} merge)`,
          children: i.jsxs("div", {
            style: {
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
              gap: 8,
            },
            children: [
              f.map((v) => i.jsx(Ou, { worker: v, type: "ocr" }, v.id)),
              g.map((v) => i.jsx(Ou, { worker: v, type: "merge" }, v.id)),
            ],
          }),
        }),
      Object.keys(y).length > 0 &&
        i.jsx(sr, {
          label: "By extension",
          children: i.jsx("div", {
            className: "card",
            style: {
              padding: "12px 14px",
              display: "flex",
              flexDirection: "column",
              gap: 8,
            },
            children: Object.entries(y)
              .sort(([, v], [, N]) => N - v)
              .map(([v, N]) => {
                const z = Object.values(y).reduce((W, P) => W + P, 0),
                  R = z > 0 ? (N / z) * 100 : 0;
                return i.jsxs(
                  "div",
                  {
                    children: [
                      i.jsxs("div", {
                        style: {
                          display: "flex",
                          justifyContent: "space-between",
                          marginBottom: 3,
                        },
                        children: [
                          i.jsxs("span", {
                            style: {
                              fontSize: "0.7rem",
                              color: "var(--text-2)",
                              fontFamily: "JetBrains Mono, monospace",
                              fontWeight: 600,
                            },
                            children: [".", v],
                          }),
                          i.jsxs("span", {
                            style: {
                              fontSize: "0.67rem",
                              color: "var(--text-3)",
                              fontFamily: "JetBrains Mono, monospace",
                            },
                            children: [N, " · ", R.toFixed(1), "%"],
                          }),
                        ],
                      }),
                      i.jsx("div", {
                        style: {
                          height: 5,
                          background: "var(--bg-raised)",
                          borderRadius: 999,
                          overflow: "hidden",
                        },
                        children: i.jsx("div", {
                          style: {
                            height: "100%",
                            width: `${R}%`,
                            background: "var(--accent)",
                            borderRadius: 999,
                            transition: "width 0.6s",
                            opacity: 0.75,
                          },
                        }),
                      }),
                    ],
                  },
                  v,
                );
              }),
          }),
        }),
      k.length > 0 &&
        i.jsx(sr, {
          label: "Largest files (by page count)",
          children: i.jsx("div", {
            className: "card",
            style: {
              padding: "10px 14px",
              display: "flex",
              flexDirection: "column",
              gap: 6,
            },
            children: k.slice(0, 10).map((v, N) => {
              var z;
              return i.jsxs(
                "div",
                {
                  style: {
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "3px 0",
                    borderBottom:
                      N < 9 ? "1px solid var(--border-soft)" : "none",
                  },
                  children: [
                    i.jsxs("span", {
                      style: {
                        fontSize: "0.61rem",
                        color: "var(--text-3)",
                        fontFamily: "JetBrains Mono, monospace",
                        width: 16,
                        flexShrink: 0,
                      },
                      children: ["#", N + 1],
                    }),
                    i.jsx("span", {
                      style: {
                        flex: 1,
                        fontSize: "0.7rem",
                        color: "var(--text-2)",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        fontFamily: "JetBrains Mono, monospace",
                      },
                      title: v.filepath,
                      children:
                        ((z = v.filepath) == null
                          ? void 0
                          : z.split("/").pop()) ?? v.filepath,
                    }),
                    i.jsxs("span", {
                      style: {
                        fontSize: "0.66rem",
                        color: "var(--text-3)",
                        flexShrink: 0,
                        fontFamily: "JetBrains Mono, monospace",
                      },
                      children: [v.page_count, "p"],
                    }),
                    i.jsx("span", {
                      style: {
                        fontSize: "0.64rem",
                        color: "var(--text-3)",
                        flexShrink: 0,
                        fontFamily: "JetBrains Mono, monospace",
                      },
                      children: Du(v.size_bytes ?? 0),
                    }),
                  ],
                },
                v.filepath,
              );
            }),
          }),
        }),
    ],
  });
}
function Nt({ title: e, children: t }) {
  return i.jsxs("div", {
    style: { marginBottom: 24 },
    children: [
      i.jsx("h3", {
        style: {
          margin: "0 0 8px",
          fontSize: "0.68rem",
          fontWeight: 600,
          color: "var(--text-3)",
          textTransform: "uppercase",
          letterSpacing: "0.07em",
        },
        children: e,
      }),
      i.jsx("div", {
        className: "card",
        style: { overflow: "hidden" },
        children: t,
      }),
    ],
  });
}
function Rt({ label: e, sub: t, last: n, children: r }) {
  return i.jsxs("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 16,
      padding: "11px 14px",
      borderBottom: n ? "none" : "1px solid var(--border-soft)",
      transition: "background 0.1s",
    },
    onMouseEnter: (l) =>
      (l.currentTarget.style.background = "var(--bg-raised)"),
    onMouseLeave: (l) => (l.currentTarget.style.background = "transparent"),
    children: [
      i.jsxs("div", {
        style: { flex: 1 },
        children: [
          i.jsx("p", {
            style: {
              margin: 0,
              fontSize: "0.83rem",
              color: "var(--text-1)",
              fontWeight: 500,
            },
            children: e,
          }),
          t &&
            i.jsx("p", {
              style: {
                margin: "2px 0 0",
                fontSize: "0.7rem",
                color: "var(--text-3)",
                lineHeight: 1.4,
              },
              children: t,
            }),
        ],
      }),
      i.jsx("div", { style: { flexShrink: 0 }, children: r }),
    ],
  });
}
function G0({ value: e, onChange: t }) {
  return i.jsx("button", {
    onClick: () => t(!e),
    style: {
      width: 38,
      height: 20,
      borderRadius: 999,
      border: "none",
      cursor: "pointer",
      background: e ? "var(--accent)" : "var(--bg-hover)",
      position: "relative",
      transition: "background 0.2s",
    },
    children: i.jsx("div", {
      style: {
        position: "absolute",
        top: 2,
        left: e ? 19 : 2,
        width: 16,
        height: 16,
        borderRadius: "50%",
        background: "#fff",
        transition: "left 0.2s",
        boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
      },
    }),
  });
}
const $u = {
  teal: "Teal",
  sky: "Sky",
  violet: "Violet",
  amber: "Amber",
  rose: "Rose",
  lime: "Lime",
};
function Z0() {
  const e = Y((R) => R.theme),
    t = Y((R) => R.toggleTheme),
    n = Y((R) => R.apiUrl),
    r = Y((R) => R.setApiUrl),
    l = Y((R) => R.accent),
    o = Y((R) => R.setAccent),
    s = Y((R) => R.simulatedTagPaths),
    a = Y((R) => R.setSimulatedTagPaths),
    u = Y((R) => R.lang),
    c = Y((R) => R.setLang),
    m = Y((R) => R.allowedUploadExtensions),
    f = Y((R) => R.setAllowedUploadExtensions),
    g = Et(),
    S = Le((R) => R.username),
    y = Le((R) => R.mainEncryptionKey),
    k = Le((R) => R.encryptionEnabled),
    j = Le((R) => R.setEncryptionEnabled),
    [p, d] = x.useState(n),
    [h, w] = x.useState(!1),
    [_, E] = x.useState(
      s.join(`
`),
    ),
    [C, v] = x.useState(!1);
  function N() {
    (r(p), w(!0), setTimeout(() => w(!1), 2e3));
  }
  function z() {
    const R = _.split(
      `
`,
    )
      .map((W) => W.trim())
      .filter(Boolean);
    (a(R), v(!0), setTimeout(() => v(!1), 2e3));
  }
  return i.jsxs("div", {
    style: {
      padding: "22px",
      maxWidth: 580,
      margin: "0 auto",
      overflowY: "auto",
      height: "100%",
    },
    children: [
      i.jsx("h2", {
        style: { margin: "0 0 20px", fontSize: "0.95rem", fontWeight: 700 },
        children: "Settings",
      }),
      i.jsx(Nt, {
        title: g.st_language,
        children: i.jsx(Rt, {
          label: g.st_language,
          sub: g.st_langSub,
          last: !0,
          children: i.jsx("div", {
            style: { display: "flex", gap: 5 },
            children: ["en", "de"].map((R) =>
              i.jsx(
                "button",
                {
                  onClick: () => c(R),
                  className: "btn",
                  style: {
                    fontSize: "0.78rem",
                    padding: "4px 12px",
                    background:
                      u === R ? "var(--accent-glow)" : "var(--bg-raised)",
                    border: `1px solid ${u === R ? "var(--accent)" : "var(--border)"}`,
                    color: u === R ? "var(--accent)" : "var(--text-2)",
                  },
                  children: R === "en" ? g.st_english : g.st_german,
                },
                R,
              ),
            ),
          }),
        }),
      }),
      i.jsx(Nt, {
        title: "Upload filters",
        children: i.jsx(Rt, {
          label: "Allowed file extensions",
          sub: "Only files with these extensions will be accepted. One per line (with dot). Clear to disable filter.",
          last: !0,
          children: i.jsxs("div", {
            style: { display: "flex", flexDirection: "column", gap: 6 },
            children: [
              i.jsx("textarea", {
                className: "input",
                style: {
                  minHeight: 80,
                  fontFamily: "JetBrains Mono, monospace",
                  fontSize: "0.75rem",
                  resize: "vertical",
                },
                value: m.join(`
`),
                onChange: (R) => {
                  const W = R.target.value
                    .split(
                      `
`,
                    )
                    .map((P) => P.trim().toLowerCase())
                    .filter((P) => P.startsWith("."));
                  f(W);
                },
                placeholder: `.pdf
.png
.jpg`,
              }),
              i.jsxs("div", {
                style: { display: "flex", gap: 5 },
                children: [
                  i.jsx("button", {
                    className: "btn btn-ghost",
                    style: { fontSize: "0.72rem" },
                    onClick: () => f(vf),
                    children: "Reset to defaults",
                  }),
                  i.jsx("button", {
                    className: "btn btn-ghost",
                    style: { fontSize: "0.72rem" },
                    onClick: () => f([]),
                    children: "Clear (block-list mode)",
                  }),
                ],
              }),
              i.jsxs("p", {
                style: {
                  margin: 0,
                  fontSize: "0.66rem",
                  color: "var(--text-3)",
                },
                children: [
                  "Current: ",
                  m.length ? m.join(" ") : "using built-in block-list",
                ],
              }),
            ],
          }),
        }),
      }),
      i.jsxs(Nt, {
        title: "Appearance",
        children: [
          i.jsx(Rt, {
            label: "Theme",
            sub: `Currently ${e} mode`,
            children: i.jsx("button", {
              className: "btn btn-ghost",
              onClick: t,
              style: { fontSize: "0.78rem" },
              children: e === "dark" ? "☀ Light" : "☾ Dark",
            }),
          }),
          i.jsxs("div", {
            style: { padding: "12px 14px" },
            children: [
              i.jsx("p", {
                style: {
                  margin: "0 0 9px",
                  fontSize: "0.83rem",
                  fontWeight: 500,
                  color: "var(--text-1)",
                },
                children: "Accent colour",
              }),
              i.jsx("div", {
                style: { display: "flex", gap: 7, flexWrap: "wrap" },
                children: Object.keys(Xi).map((R) => {
                  const W = Xi[R],
                    P = l === R;
                  return i.jsxs(
                    "button",
                    {
                      onClick: () => o(R),
                      title: $u[R],
                      style: {
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        padding: "5px 11px",
                        border: `2px solid ${P ? W.accent : "transparent"}`,
                        borderRadius: 7,
                        background: P ? W.glow : "var(--bg-raised)",
                        cursor: "pointer",
                        transition: "all 0.15s",
                      },
                      children: [
                        i.jsx("span", {
                          style: {
                            width: 10,
                            height: 10,
                            borderRadius: "50%",
                            background: W.accent,
                            flexShrink: 0,
                            boxShadow: `0 0 5px ${W.accent}77`,
                          },
                        }),
                        i.jsx("span", {
                          style: {
                            fontSize: "0.75rem",
                            fontWeight: 500,
                            color: P ? W.accent : "var(--text-2)",
                          },
                          children: $u[R],
                        }),
                      ],
                    },
                    R,
                  );
                }),
              }),
              i.jsx("p", {
                style: {
                  margin: "7px 0 0",
                  fontSize: "0.67rem",
                  color: "var(--text-3)",
                },
                children:
                  "Changes apply instantly and persist across sessions.",
              }),
            ],
          }),
        ],
      }),
      i.jsx(Nt, {
        title: "Tree — Simulated folders",
        children: i.jsxs("div", {
          style: { padding: "12px 14px" },
          children: [
            i.jsx("p", {
              style: {
                margin: "0 0 6px",
                fontSize: "0.83rem",
                color: "var(--text-1)",
                fontWeight: 500,
              },
              children: "Virtual folder paths",
            }),
            i.jsxs("p", {
              style: {
                margin: "0 0 8px",
                fontSize: "0.72rem",
                color: "var(--text-3)",
                lineHeight: 1.5,
              },
              children: [
                "Enter one tag path per line. Use",
                " ",
                i.jsx("span", {
                  className: "mono",
                  style: { color: "var(--text-2)" },
                  children: "/",
                }),
                " ",
                "to nest folders, e.g.",
                " ",
                i.jsx("span", {
                  className: "mono",
                  style: { color: "var(--text-2)" },
                  children: "Finance/2024/Q1",
                }),
                ". These appear as ",
                i.jsx("em", { children: "italic" }),
                " ghost folders in the tag tree — useful for planning your structure without touching any documents.",
              ],
            }),
            i.jsx("textarea", {
              value: _,
              onChange: (R) => E(R.target.value),
              placeholder: `Finance/2024/Q1
Legal/Contracts
HR/Onboarding`,
              rows: 5,
              style: {
                width: "100%",
                background: "var(--bg-raised)",
                border: "1px solid var(--border)",
                borderRadius: 6,
                color: "var(--text-1)",
                fontFamily: "JetBrains Mono, monospace",
                fontSize: "0.75rem",
                padding: "8px 10px",
                outline: "none",
                resize: "vertical",
                lineHeight: 1.7,
              },
            }),
            i.jsxs("div", {
              style: {
                display: "flex",
                justifyContent: "flex-end",
                marginTop: 8,
                gap: 6,
              },
              children: [
                s.length > 0 &&
                  i.jsx("button", {
                    className: "btn btn-ghost",
                    style: { fontSize: "0.75rem" },
                    onClick: () => {
                      (E(""), a([]));
                    },
                    children: "Clear",
                  }),
                i.jsx("button", {
                  className: "btn btn-primary",
                  style: { fontSize: "0.75rem" },
                  onClick: z,
                  children: C ? "✓ Saved" : "Apply",
                }),
              ],
            }),
            s.length > 0 &&
              i.jsxs("p", {
                style: {
                  margin: "6px 0 0",
                  fontSize: "0.68rem",
                  color: "var(--text-3)",
                },
                children: [
                  s.length,
                  " simulated path",
                  s.length !== 1 ? "s" : "",
                  " active. Switch to Tree → By tags in Documents to preview.",
                ],
              }),
          ],
        }),
      }),
      i.jsx(Nt, {
        title: "Connection",
        children: i.jsxs("div", {
          style: { padding: "12px 14px" },
          children: [
            i.jsx("label", { className: "label", children: "API base URL" }),
            i.jsxs("div", {
              style: { display: "flex", gap: 7, marginTop: 4 },
              children: [
                i.jsx("input", {
                  className: "input",
                  value: p,
                  onChange: (R) => d(R.target.value),
                  placeholder: "https://192.168.1.188:7443/api",
                  style: {
                    flex: 1,
                    fontFamily: "JetBrains Mono, monospace",
                    fontSize: "0.75rem",
                  },
                }),
                i.jsx("button", {
                  className: "btn btn-primary",
                  onClick: N,
                  style: { flexShrink: 0, fontSize: "0.78rem" },
                  children: h ? "✓" : "Save",
                }),
              ],
            }),
            i.jsxs("p", {
              style: {
                margin: "5px 0 0",
                fontSize: "0.67rem",
                color: "var(--text-3)",
              },
              children: [
                "Auto-detected from",
                " ",
                i.jsxs("span", {
                  className: "mono",
                  style: { color: "var(--text-2)" },
                  children: [window.location.origin, "/api"],
                }),
                " ",
                "on first load.",
              ],
            }),
          ],
        }),
      }),
      i.jsxs(Nt, {
        title: "Encryption",
        children: [
          i.jsx(Rt, {
            label: "Client-side decryption",
            sub: "Decrypt files and banner images in-browser using your password-derived key",
            children: i.jsx(G0, { value: k, onChange: j }),
          }),
          i.jsxs("div", {
            style: { padding: "10px 14px" },
            children: [
              i.jsx("p", {
                style: {
                  margin: "0 0 5px",
                  fontSize: "0.78rem",
                  color: "var(--text-2)",
                  fontWeight: 500,
                },
                children: "Main encryption key",
              }),
              i.jsx("div", {
                className: "mono",
                style: {
                  padding: "7px 9px",
                  background: "var(--bg-raised)",
                  borderRadius: 6,
                  fontSize: "0.68rem",
                  border: "1px solid var(--border)",
                  color: y ? "var(--success)" : "var(--text-3)",
                  wordBreak: "break-all",
                },
                children: y
                  ? `${y.slice(0, 16)}… (${y.length} chars) — unlocked ✓`
                  : "Not available — sign in again to derive from password",
              }),
            ],
          }),
        ],
      }),
      i.jsx(Nt, {
        title: "Account",
        children: i.jsx(Rt, {
          label: "Signed in as",
          sub: "JWT stored in localStorage",
          last: !0,
          children: i.jsx("span", {
            className: "mono",
            style: { fontSize: "0.8rem", color: "var(--accent)" },
            children: S ?? "—",
          }),
        }),
      }),
      i.jsxs(Nt, {
        title: "About",
        children: [
          i.jsx(Rt, {
            label: "rain·dms",
            sub: "Self-hosted document management system",
            children: i.jsx("span", {
              style: { fontSize: "0.72rem", color: "var(--text-3)" },
              children: "v1.0.0",
            }),
          }),
          i.jsx(Rt, {
            label: "Stack",
            sub: "Bun · Hono · SeaweedFS · RabbitMQ · PaddleOCR · Meilisearch",
            children: i.jsx("span", {
              className: "mono",
              style: { fontSize: "0.67rem", color: "var(--text-3)" },
              children: "self-hosted",
            }),
          }),
          i.jsx(Rt, {
            label: "OCR format",
            sub: "upLeftPoint / downRightPoint bounding boxes · PP-OCRv5",
            last: !0,
            children: i.jsx("a", {
              href: "https://github.com/ninja-boldo",
              target: "_blank",
              rel: "noopener noreferrer",
              className: "btn btn-ghost",
              style: { fontSize: "0.72rem", textDecoration: "none" },
              children: "GitHub ↗",
            }),
          }),
        ],
      }),
    ],
  });
}
function q0(e) {
  return e
    ? (e.split("/").pop() ?? e)
        .replace(
          /-[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}(\.[^.]+)$/i,
          "$1",
        )
        .replace(
          /-\d{4}-\d{2}-\d{2}[T_]\d{2}[:\-]\d{2}[:\-]\d{2}[\.\dZ]*(\.[^.]+)$/i,
          "$1",
        )
    : "";
}
function Au(e) {
  if (!e) return "—";
  const t = new Date(e);
  return Number.isNaN(t.getTime())
    ? "—"
    : t.toLocaleString(void 0, {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
}
function Uu(e) {
  if (!e) return "—";
  const t = new Date(e).getTime(),
    n = Date.now() - t;
  return n < 6e4
    ? "just now"
    : n < 36e5
      ? `${Math.floor(n / 6e4)}m ago`
      : n < 864e5
        ? `${Math.floor(n / 36e5)}h ago`
        : `${Math.floor(n / 864e5)}d ago`;
}
function ev(e) {
  if (!e) return "";
  const t = new Date(e);
  if (Number.isNaN(t.getTime())) return "";
  const n = (r) => String(r).padStart(2, "0");
  return `${t.getFullYear()}-${n(t.getMonth() + 1)}-${n(t.getDate())}T${n(t.getHours())}:${n(t.getMinutes())}`;
}
function tv(e) {
  let t = 0;
  function n(r) {
    if (r) {
      if (Array.isArray(r)) {
        r.forEach(n);
        return;
      }
      if (typeof r == "object") {
        if (Array.isArray(r.boxes)) {
          ((t += r.boxes.length), r.boxes.forEach(n));
          return;
        }
        if (Array.isArray(r.lines)) {
          r.lines.forEach(n);
          return;
        }
        Array.isArray(r.words) && r.words.forEach(n);
      }
    }
  }
  return (e.forEach((r) => n(r.ocr)), t);
}
function nv() {
  var C;
  const [e] = So(),
    t = ct(),
    n = e.get("filepath") ?? "",
    [r, l] = x.useState(null),
    [o, s] = x.useState(!0),
    [a, u] = x.useState(null),
    [c, m] = x.useState(""),
    [f, g] = x.useState(""),
    { markers: S, reminder: y, setMarkers: k, setReminder: j } = Rf(n || null);
  (x.useEffect(() => {
    n &&
      (s(!0),
      u(null),
      Promise.all([Sf(n), yf(n)])
        .then(([v, N]) => {
          l({ doc: v, pageCount: N.pages.length, totalBoxes: tv(N.pages) });
        })
        .catch((v) => u(v.message))
        .finally(() => s(!1)));
  }, [n]),
    x.useEffect(() => {
      (m(ev(y.at)), g(y.note ?? ""));
    }, [y.at, y.note]));
  function p() {
    const v = c && c.length > 0 ? new Date(c).toISOString() : null;
    j({ at: v, note: f || null, done_at: y.done_at });
  }
  function d() {
    j({ at: y.at, note: y.note, done_at: new Date().toISOString() });
  }
  function h(v) {
    k((N) => N.filter((z) => z.box_key !== v.box_key));
  }
  function w() {
    (typeof window < "u" &&
      !window.confirm("Remove all markers on this file?")) ||
      k([]);
  }
  if (!n)
    return i.jsxs("div", {
      style: { padding: 24 },
      children: [
        i.jsx("p", {
          style: { color: "var(--danger)" },
          children: "Missing filepath.",
        }),
        i.jsx("button", {
          className: "btn btn-ghost",
          onClick: () => t(-1),
          children: "← Back",
        }),
      ],
    });
  const _ = q0(n),
    E = r == null ? void 0 : r.doc;
  return i.jsxs("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      height: "100%",
      overflow: "hidden",
    },
    children: [
      i.jsxs("div", {
        style: {
          padding: "8px 12px",
          borderBottom: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          gap: 7,
          flexShrink: 0,
          background: "var(--bg-surface)",
        },
        children: [
          i.jsx("button", {
            className: "btn btn-ghost",
            onClick: () => t(-1),
            style: { padding: "3px 8px", fontSize: "0.78rem" },
            children: "← Back",
          }),
          i.jsx("button", {
            className: "btn btn-ghost",
            onClick: () => t(`/document?filepath=${encodeURIComponent(n)}`),
            style: { padding: "3px 8px", fontSize: "0.78rem" },
            children: "Open document",
          }),
          i.jsxs("div", {
            style: { flex: 1, minWidth: 0, overflow: "hidden" },
            children: [
              i.jsx("p", {
                className: "mono",
                style: {
                  margin: 0,
                  fontSize: "0.78rem",
                  fontWeight: 600,
                  color: "var(--text-1)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                },
                title: n,
                children: _,
              }),
              i.jsx("p", {
                style: {
                  margin: 0,
                  fontSize: "0.64rem",
                  color: "var(--text-3)",
                  fontFamily: "JetBrains Mono, monospace",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                },
                title: n,
                children: n,
              }),
            ],
          }),
        ],
      }),
      i.jsxs("div", {
        style: { flex: 1, overflowY: "auto", padding: "18px 22px" },
        children: [
          o &&
            !r &&
            i.jsx("p", {
              style: { color: "var(--text-3)" },
              children: "Loading…",
            }),
          a &&
            i.jsx("p", {
              style: {
                color: "var(--danger)",
                padding: "8px 12px",
                background: "rgba(248,113,113,0.07)",
                border: "1px solid rgba(248,113,113,0.2)",
                borderRadius: 6,
                fontSize: "0.8rem",
                marginBottom: 14,
              },
              children: a,
            }),
          r &&
            i.jsxs(i.Fragment, {
              children: [
                i.jsxs("div", {
                  style: {
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                    gap: 10,
                    marginBottom: 18,
                  },
                  children: [
                    i.jsx(ar, { label: "Pages", value: String(r.pageCount) }),
                    i.jsx(ar, {
                      label: "OCR boxes",
                      value: r.totalBoxes.toLocaleString(),
                    }),
                    i.jsx(ar, {
                      label: "Markers",
                      value: String(S.length),
                      accent: S.length > 0,
                    }),
                    i.jsx(ar, {
                      label: "Tags",
                      value: String(
                        ((C = E == null ? void 0 : E.assigned_tags) == null
                          ? void 0
                          : C.length) ?? 0,
                      ),
                    }),
                    i.jsx(ar, {
                      label: "Encrypted",
                      value: E != null && E.encrypted_file_key ? "yes" : "no",
                    }),
                  ],
                }),
                i.jsxs(Xo, {
                  title: "Ingest timeline",
                  children: [
                    i.jsx(Go, {
                      label: "Created at",
                      value: Au(E == null ? void 0 : E.created_at),
                      hint: Uu(E == null ? void 0 : E.created_at),
                    }),
                    i.jsx(Go, {
                      label: "File ID",
                      value:
                        (E == null ? void 0 : E.file_id) != null
                          ? String(E.file_id)
                          : "—",
                    }),
                    (E == null ? void 0 : E.assigned_tags) &&
                      E.assigned_tags.length > 0 &&
                      i.jsx(Go, {
                        label: "Tags",
                        value: i.jsx("div", {
                          style: { display: "flex", flexWrap: "wrap", gap: 4 },
                          children: E.assigned_tags.map((v) =>
                            i.jsx("span", { className: "tag", children: v }, v),
                          ),
                        }),
                      }),
                  ],
                }),
                i.jsxs(Xo, {
                  title: "Reminder",
                  right:
                    y.at && !y.done_at
                      ? i.jsx("span", {
                          style: {
                            color: "var(--accent)",
                            fontSize: "0.7rem",
                            fontWeight: 600,
                          },
                          children: "ACTIVE",
                        })
                      : y.done_at
                        ? i.jsx("span", {
                            style: {
                              color: "var(--success)",
                              fontSize: "0.7rem",
                              fontWeight: 600,
                            },
                            children: "DONE",
                          })
                        : i.jsx("span", {
                            style: {
                              color: "var(--text-3)",
                              fontSize: "0.7rem",
                            },
                            children: "none",
                          }),
                  children: [
                    i.jsxs("div", {
                      style: {
                        display: "flex",
                        gap: 8,
                        alignItems: "center",
                        flexWrap: "wrap",
                      },
                      children: [
                        i.jsx("input", {
                          type: "datetime-local",
                          className: "input",
                          value: c,
                          onChange: (v) => m(v.target.value),
                          style: { width: 230, fontSize: "0.78rem" },
                        }),
                        i.jsx("input", {
                          type: "text",
                          className: "input",
                          placeholder: "Note (optional)",
                          value: f,
                          onChange: (v) => g(v.target.value),
                          style: {
                            flex: 1,
                            minWidth: 200,
                            fontSize: "0.78rem",
                          },
                        }),
                        i.jsx("button", {
                          className: "btn btn-primary",
                          onClick: p,
                          style: { fontSize: "0.78rem" },
                          children: "Save reminder",
                        }),
                        i.jsx("button", {
                          className: "btn btn-ghost",
                          onClick: d,
                          disabled: !y.at,
                          style: { fontSize: "0.78rem" },
                          children: "Mark done",
                        }),
                        i.jsx("button", {
                          className: "btn btn-ghost",
                          onClick: () => j(null),
                          disabled: !y.at && !y.note,
                          style: { fontSize: "0.78rem" },
                          children: "Clear",
                        }),
                      ],
                    }),
                    y.at &&
                      i.jsxs("p", {
                        style: {
                          margin: "8px 0 0",
                          fontSize: "0.7rem",
                          color: "var(--text-3)",
                        },
                        children: [
                          Au(y.at),
                          y.done_at &&
                            i.jsxs(i.Fragment, {
                              children: [" ", "· marked done ", Uu(y.done_at)],
                            }),
                        ],
                      }),
                    i.jsx("p", {
                      style: {
                        margin: "6px 0 0",
                        fontSize: "0.65rem",
                        color: "var(--text-3)",
                      },
                      children:
                        "Reminders live in your browser's localStorage. They don't sync across devices.",
                    }),
                  ],
                }),
                i.jsx(Xo, {
                  title: `Markers (${S.length})`,
                  right:
                    S.length > 0
                      ? i.jsx("button", {
                          className: "btn btn-ghost",
                          onClick: w,
                          style: { fontSize: "0.7rem", padding: "3px 8px" },
                          children: "Remove all",
                        })
                      : void 0,
                  children:
                    S.length === 0
                      ? i.jsxs("p", {
                          style: {
                            margin: 0,
                            fontSize: "0.78rem",
                            color: "var(--text-3)",
                          },
                          children: [
                            "No markers yet. Open the document, switch to ",
                            i.jsx("b", { children: "✎ Mark" }),
                            " mode, double-click an OCR box or drag a rectangle to create one.",
                          ],
                        })
                      : i.jsx("div", {
                          style: {
                            display: "grid",
                            gridTemplateColumns:
                              "repeat(auto-fill, minmax(220px, 1fr))",
                            gap: 10,
                          },
                          children: S.map((v) =>
                            i.jsxs(
                              "div",
                              {
                                className: "card-sm",
                                style: {
                                  padding: 9,
                                  display: "flex",
                                  flexDirection: "column",
                                  gap: 6,
                                },
                                children: [
                                  i.jsxs("div", {
                                    style: {
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 6,
                                    },
                                    children: [
                                      i.jsx("span", {
                                        style: {
                                          fontSize: "0.6rem",
                                          padding: "1px 5px",
                                          borderRadius: 3,
                                          background:
                                            v.kind === "drawn"
                                              ? "var(--warn)"
                                              : "var(--accent-glow)",
                                          color:
                                            v.kind === "drawn"
                                              ? "var(--bg-base)"
                                              : "var(--accent)",
                                          fontFamily:
                                            "JetBrains Mono, monospace",
                                          fontWeight: 600,
                                          textTransform: "uppercase",
                                        },
                                        children:
                                          v.kind === "drawn" ? "drawn" : "ocr",
                                      }),
                                      i.jsxs("span", {
                                        style: {
                                          fontSize: "0.7rem",
                                          color: "var(--text-2)",
                                          fontFamily:
                                            "JetBrains Mono, monospace",
                                        },
                                        children: ["page ", v.page_idx + 1],
                                      }),
                                    ],
                                  }),
                                  v.note &&
                                    i.jsx("p", {
                                      style: {
                                        margin: 0,
                                        fontSize: "0.74rem",
                                        color: "var(--text-1)",
                                        lineHeight: 1.4,
                                        wordBreak: "break-word",
                                      },
                                      children: v.note,
                                    }),
                                  i.jsxs("p", {
                                    style: {
                                      margin: 0,
                                      fontSize: "0.62rem",
                                      color: "var(--text-3)",
                                      fontFamily: "JetBrains Mono, monospace",
                                    },
                                    children: [
                                      "x:",
                                      v.x,
                                      " y:",
                                      v.y,
                                      " · ",
                                      v.w,
                                      "×",
                                      v.h,
                                    ],
                                  }),
                                  i.jsxs("div", {
                                    style: {
                                      display: "flex",
                                      gap: 6,
                                      marginTop: 2,
                                    },
                                    children: [
                                      i.jsx("button", {
                                        className: "btn btn-ghost",
                                        onClick: () =>
                                          (window.location.href = `/document?filepath=${encodeURIComponent(n)}&page=${v.page_idx}`),
                                        style: {
                                          fontSize: "0.7rem",
                                          padding: "3px 8px",
                                          flex: 1,
                                        },
                                        children: "Open",
                                      }),
                                      i.jsx("button", {
                                        className: "btn btn-danger",
                                        onClick: () => h(v),
                                        style: {
                                          fontSize: "0.7rem",
                                          padding: "3px 8px",
                                        },
                                        children: "✕",
                                      }),
                                    ],
                                  }),
                                ],
                              },
                              v.box_key,
                            ),
                          ),
                        }),
                }),
              ],
            }),
        ],
      }),
    ],
  });
}
function ar({ label: e, value: t, accent: n }) {
  return i.jsxs("div", {
    className: "card",
    style: { padding: "11px 13px", borderColor: n ? "var(--accent)" : void 0 },
    children: [
      i.jsx("div", {
        style: {
          fontSize: "0.62rem",
          fontWeight: 600,
          letterSpacing: "0.07em",
          textTransform: "uppercase",
          color: "var(--text-3)",
        },
        children: e,
      }),
      i.jsx("div", {
        style: {
          marginTop: 4,
          fontSize: "1.05rem",
          fontWeight: 700,
          color: n ? "var(--accent)" : "var(--text-1)",
          fontFamily: "JetBrains Mono, monospace",
          letterSpacing: "-0.01em",
        },
        children: t,
      }),
    ],
  });
}
function Xo({ title: e, children: t, right: n }) {
  return i.jsxs("div", {
    className: "card",
    style: { padding: "14px 16px", marginBottom: 14 },
    children: [
      i.jsxs("div", {
        style: {
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 10,
        },
        children: [
          i.jsx("h3", {
            style: {
              margin: 0,
              fontSize: "0.78rem",
              fontWeight: 600,
              color: "var(--text-1)",
              letterSpacing: "0.02em",
            },
            children: e,
          }),
          n,
        ],
      }),
      t,
    ],
  });
}
function Go({ label: e, value: t, hint: n }) {
  return i.jsxs("div", {
    style: {
      display: "flex",
      alignItems: "baseline",
      padding: "5px 0",
      borderTop: "1px solid var(--border-soft)",
      gap: 12,
    },
    children: [
      i.jsx("div", {
        style: {
          width: 130,
          flexShrink: 0,
          fontSize: "0.7rem",
          color: "var(--text-3)",
        },
        children: e,
      }),
      i.jsx("div", {
        style: {
          flex: 1,
          minWidth: 0,
          fontSize: "0.78rem",
          color: "var(--text-1)",
        },
        children: t,
      }),
      n &&
        i.jsx("div", {
          style: { fontSize: "0.68rem", color: "var(--text-3)", flexShrink: 0 },
          children: n,
        }),
    ],
  });
}
function rv({ children: e }) {
  return Le((n) => n.token)
    ? i.jsx(i.Fragment, { children: e })
    : i.jsx(pf, { to: "/login", replace: !0 });
}
function lv() {
  return i.jsx(xg, {
    children: i.jsxs(ug, {
      children: [
        i.jsx(ot, { path: "/login", element: i.jsx(p0, {}) }),
        i.jsxs(ot, {
          path: "/",
          element: i.jsx(rv, { children: i.jsx(Zg, {}) }),
          children: [
            i.jsx(ot, { index: !0, element: i.jsx(L0, {}) }),
            i.jsx(ot, { path: "search", element: i.jsx(B0, {}) }),
            i.jsx(ot, { path: "document", element: i.jsx(H0, {}) }),
            i.jsx(ot, { path: "file-stats", element: i.jsx(nv, {}) }),
            i.jsx(ot, { path: "stats", element: i.jsx(X0, {}) }),
            i.jsx(ot, { path: "settings", element: i.jsx(Z0, {}) }),
          ],
        }),
        i.jsx(ot, { path: "*", element: i.jsx(pf, { to: "/", replace: !0 }) }),
      ],
    }),
  });
}
const ov = Y.getState().theme;
ov === "light"
  ? document.documentElement.classList.add("light")
  : document.documentElement.classList.remove("light");
tf(document.getElementById("root")).render(
  i.jsx(x.StrictMode, { children: i.jsx(lv, {}) }),
);
