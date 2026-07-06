function Ep(e, t) {
  for (var n = 0; n < t.length; n++) {
    const r = t[n];
    if (typeof r != "string" && !Array.isArray(r)) {
      for (const i in r)
        if (i !== "default" && !(i in e)) {
          const o = Object.getOwnPropertyDescriptor(r, i);
          o &&
            Object.defineProperty(
              e,
              i,
              o.get ? o : { enumerable: !0, get: () => r[i] },
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
  for (const i of document.querySelectorAll('link[rel="modulepreload"]')) r(i);
  new MutationObserver((i) => {
    for (const o of i)
      if (o.type === "childList")
        for (const s of o.addedNodes)
          s.tagName === "LINK" && s.rel === "modulepreload" && r(s);
  }).observe(document, { childList: !0, subtree: !0 });
  function n(i) {
    const o = {};
    return (
      i.integrity && (o.integrity = i.integrity),
      i.referrerPolicy && (o.referrerPolicy = i.referrerPolicy),
      i.crossOrigin === "use-credentials"
        ? (o.credentials = "include")
        : i.crossOrigin === "anonymous"
          ? (o.credentials = "omit")
          : (o.credentials = "same-origin"),
      o
    );
  }
  function r(i) {
    if (i.ep) return;
    i.ep = !0;
    const o = n(i);
    fetch(i.href, o);
  }
})();
function zp(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default")
    ? e.default
    : e;
}
var Mc = { exports: {} },
  zo = {},
  Ic = { exports: {} },
  J = {};
/**
 * @license React
 * react.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ var ci = Symbol.for("react.element"),
  Rp = Symbol.for("react.portal"),
  Pp = Symbol.for("react.fragment"),
  Tp = Symbol.for("react.strict_mode"),
  Mp = Symbol.for("react.profiler"),
  Ip = Symbol.for("react.provider"),
  Lp = Symbol.for("react.context"),
  Np = Symbol.for("react.forward_ref"),
  Op = Symbol.for("react.suspense"),
  Dp = Symbol.for("react.memo"),
  $p = Symbol.for("react.lazy"),
  Va = Symbol.iterator;
function Ap(e) {
  return e === null || typeof e != "object"
    ? null
    : ((e = (Va && e[Va]) || e["@@iterator"]),
      typeof e == "function" ? e : null);
}
var Lc = {
    isMounted: function () {
      return !1;
    },
    enqueueForceUpdate: function () {},
    enqueueReplaceState: function () {},
    enqueueSetState: function () {},
  },
  Nc = Object.assign,
  Oc = {};
function sr(e, t, n) {
  ((this.props = e),
    (this.context = t),
    (this.refs = Oc),
    (this.updater = n || Lc));
}
sr.prototype.isReactComponent = {};
sr.prototype.setState = function (e, t) {
  if (typeof e != "object" && typeof e != "function" && e != null)
    throw Error(
      "setState(...): takes an object of state variables to update or a function which returns an object of state variables.",
    );
  this.updater.enqueueSetState(this, e, t, "setState");
};
sr.prototype.forceUpdate = function (e) {
  this.updater.enqueueForceUpdate(this, e, "forceUpdate");
};
function Dc() {}
Dc.prototype = sr.prototype;
function Is(e, t, n) {
  ((this.props = e),
    (this.context = t),
    (this.refs = Oc),
    (this.updater = n || Lc));
}
var Ls = (Is.prototype = new Dc());
Ls.constructor = Is;
Nc(Ls, sr.prototype);
Ls.isPureReactComponent = !0;
var Ka = Array.isArray,
  $c = Object.prototype.hasOwnProperty,
  Ns = { current: null },
  Ac = { key: !0, ref: !0, __self: !0, __source: !0 };
function Fc(e, t, n) {
  var r,
    i = {},
    o = null,
    s = null;
  if (t != null)
    for (r in (t.ref !== void 0 && (s = t.ref),
    t.key !== void 0 && (o = "" + t.key),
    t))
      $c.call(t, r) && !Ac.hasOwnProperty(r) && (i[r] = t[r]);
  var a = arguments.length - 2;
  if (a === 1) i.children = n;
  else if (1 < a) {
    for (var u = Array(a), c = 0; c < a; c++) u[c] = arguments[c + 2];
    i.children = u;
  }
  if (e && e.defaultProps)
    for (r in ((a = e.defaultProps), a)) i[r] === void 0 && (i[r] = a[r]);
  return {
    $$typeof: ci,
    type: e,
    key: o,
    ref: s,
    props: i,
    _owner: Ns.current,
  };
}
function Fp(e, t) {
  return {
    $$typeof: ci,
    type: e.type,
    key: t,
    ref: e.ref,
    props: e.props,
    _owner: e._owner,
  };
}
function Os(e) {
  return typeof e == "object" && e !== null && e.$$typeof === ci;
}
function Bp(e) {
  var t = { "=": "=0", ":": "=2" };
  return (
    "$" +
    e.replace(/[=:]/g, function (n) {
      return t[n];
    })
  );
}
var Ja = /\/+/g;
function Xo(e, t) {
  return typeof e == "object" && e !== null && e.key != null
    ? Bp("" + e.key)
    : t.toString(36);
}
function Wi(e, t, n, r, i) {
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
          case ci:
          case Rp:
            s = !0;
        }
    }
  if (s)
    return (
      (s = e),
      (i = i(s)),
      (e = r === "" ? "." + Xo(s, 0) : r),
      Ka(i)
        ? ((n = ""),
          e != null && (n = e.replace(Ja, "$&/") + "/"),
          Wi(i, t, n, "", function (c) {
            return c;
          }))
        : i != null &&
          (Os(i) &&
            (i = Fp(
              i,
              n +
                (!i.key || (s && s.key === i.key)
                  ? ""
                  : ("" + i.key).replace(Ja, "$&/") + "/") +
                e,
            )),
          t.push(i)),
      1
    );
  if (((s = 0), (r = r === "" ? "." : r + ":"), Ka(e)))
    for (var a = 0; a < e.length; a++) {
      o = e[a];
      var u = r + Xo(o, a);
      s += Wi(o, t, n, u, i);
    }
  else if (((u = Ap(e)), typeof u == "function"))
    for (e = u.call(e), a = 0; !(o = e.next()).done; )
      ((o = o.value), (u = r + Xo(o, a++)), (s += Wi(o, t, n, u, i)));
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
function vi(e, t, n) {
  if (e == null) return e;
  var r = [],
    i = 0;
  return (
    Wi(e, r, "", "", function (o) {
      return t.call(n, o, i++);
    }),
    r
  );
}
function Wp(e) {
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
var Le = { current: null },
  Ui = { transition: null },
  Up = {
    ReactCurrentDispatcher: Le,
    ReactCurrentBatchConfig: Ui,
    ReactCurrentOwner: Ns,
  };
function Bc() {
  throw Error("act(...) is not supported in production builds of React.");
}
J.Children = {
  map: vi,
  forEach: function (e, t, n) {
    vi(
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
      vi(e, function () {
        t++;
      }),
      t
    );
  },
  toArray: function (e) {
    return (
      vi(e, function (t) {
        return t;
      }) || []
    );
  },
  only: function (e) {
    if (!Os(e))
      throw Error(
        "React.Children.only expected to receive a single React element child.",
      );
    return e;
  },
};
J.Component = sr;
J.Fragment = Pp;
J.Profiler = Mp;
J.PureComponent = Is;
J.StrictMode = Tp;
J.Suspense = Op;
J.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = Up;
J.act = Bc;
J.cloneElement = function (e, t, n) {
  if (e == null)
    throw Error(
      "React.cloneElement(...): The argument must be a React element, but you passed " +
        e +
        ".",
    );
  var r = Nc({}, e.props),
    i = e.key,
    o = e.ref,
    s = e._owner;
  if (t != null) {
    if (
      (t.ref !== void 0 && ((o = t.ref), (s = Ns.current)),
      t.key !== void 0 && (i = "" + t.key),
      e.type && e.type.defaultProps)
    )
      var a = e.type.defaultProps;
    for (u in t)
      $c.call(t, u) &&
        !Ac.hasOwnProperty(u) &&
        (r[u] = t[u] === void 0 && a !== void 0 ? a[u] : t[u]);
  }
  var u = arguments.length - 2;
  if (u === 1) r.children = n;
  else if (1 < u) {
    a = Array(u);
    for (var c = 0; c < u; c++) a[c] = arguments[c + 2];
    r.children = a;
  }
  return { $$typeof: ci, type: e.type, key: i, ref: o, props: r, _owner: s };
};
J.createContext = function (e) {
  return (
    (e = {
      $$typeof: Lp,
      _currentValue: e,
      _currentValue2: e,
      _threadCount: 0,
      Provider: null,
      Consumer: null,
      _defaultValue: null,
      _globalName: null,
    }),
    (e.Provider = { $$typeof: Ip, _context: e }),
    (e.Consumer = e)
  );
};
J.createElement = Fc;
J.createFactory = function (e) {
  var t = Fc.bind(null, e);
  return ((t.type = e), t);
};
J.createRef = function () {
  return { current: null };
};
J.forwardRef = function (e) {
  return { $$typeof: Np, render: e };
};
J.isValidElement = Os;
J.lazy = function (e) {
  return { $$typeof: $p, _payload: { _status: -1, _result: e }, _init: Wp };
};
J.memo = function (e, t) {
  return { $$typeof: Dp, type: e, compare: t === void 0 ? null : t };
};
J.startTransition = function (e) {
  var t = Ui.transition;
  Ui.transition = {};
  try {
    e();
  } finally {
    Ui.transition = t;
  }
};
J.unstable_act = Bc;
J.useCallback = function (e, t) {
  return Le.current.useCallback(e, t);
};
J.useContext = function (e) {
  return Le.current.useContext(e);
};
J.useDebugValue = function () {};
J.useDeferredValue = function (e) {
  return Le.current.useDeferredValue(e);
};
J.useEffect = function (e, t) {
  return Le.current.useEffect(e, t);
};
J.useId = function () {
  return Le.current.useId();
};
J.useImperativeHandle = function (e, t, n) {
  return Le.current.useImperativeHandle(e, t, n);
};
J.useInsertionEffect = function (e, t) {
  return Le.current.useInsertionEffect(e, t);
};
J.useLayoutEffect = function (e, t) {
  return Le.current.useLayoutEffect(e, t);
};
J.useMemo = function (e, t) {
  return Le.current.useMemo(e, t);
};
J.useReducer = function (e, t, n) {
  return Le.current.useReducer(e, t, n);
};
J.useRef = function (e) {
  return Le.current.useRef(e);
};
J.useState = function (e) {
  return Le.current.useState(e);
};
J.useSyncExternalStore = function (e, t, n) {
  return Le.current.useSyncExternalStore(e, t, n);
};
J.useTransition = function () {
  return Le.current.useTransition();
};
J.version = "18.3.1";
Ic.exports = J;
var v = Ic.exports;
const Er = zp(v),
  Hp = Ep({ __proto__: null, default: Er }, [v]);
/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ var Vp = v,
  Kp = Symbol.for("react.element"),
  Jp = Symbol.for("react.fragment"),
  Qp = Object.prototype.hasOwnProperty,
  Yp = Vp.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,
  Gp = { key: !0, ref: !0, __self: !0, __source: !0 };
function Wc(e, t, n) {
  var r,
    i = {},
    o = null,
    s = null;
  (n !== void 0 && (o = "" + n),
    t.key !== void 0 && (o = "" + t.key),
    t.ref !== void 0 && (s = t.ref));
  for (r in t) Qp.call(t, r) && !Gp.hasOwnProperty(r) && (i[r] = t[r]);
  if (e && e.defaultProps)
    for (r in ((t = e.defaultProps), t)) i[r] === void 0 && (i[r] = t[r]);
  return {
    $$typeof: Kp,
    type: e,
    key: o,
    ref: s,
    props: i,
    _owner: Yp.current,
  };
}
zo.Fragment = Jp;
zo.jsx = Wc;
zo.jsxs = Wc;
Mc.exports = zo;
var l = Mc.exports,
  Uc = { exports: {} },
  Ye = {},
  Hc = { exports: {} },
  Vc = {};
/**
 * @license React
 * scheduler.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ (function (e) {
  function t(y, E) {
    var j = y.length;
    y.push(E);
    e: for (; 0 < j; ) {
      var N = (j - 1) >>> 1,
        T = y[N];
      if (0 < i(T, E)) ((y[N] = E), (y[j] = T), (j = N));
      else break e;
    }
  }
  function n(y) {
    return y.length === 0 ? null : y[0];
  }
  function r(y) {
    if (y.length === 0) return null;
    var E = y[0],
      j = y.pop();
    if (j !== E) {
      y[0] = j;
      e: for (var N = 0, T = y.length, B = T >>> 1; N < B; ) {
        var W = 2 * (N + 1) - 1,
          he = y[W],
          ye = W + 1,
          Oe = y[ye];
        if (0 > i(he, j))
          ye < T && 0 > i(Oe, he)
            ? ((y[N] = Oe), (y[ye] = j), (N = ye))
            : ((y[N] = he), (y[W] = j), (N = W));
        else if (ye < T && 0 > i(Oe, j)) ((y[N] = Oe), (y[ye] = j), (N = ye));
        else break e;
      }
    }
    return E;
  }
  function i(y, E) {
    var j = y.sortIndex - E.sortIndex;
    return j !== 0 ? j : y.id - E.id;
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
    d = 1,
    p = null,
    g = 3,
    k = !1,
    x = !1,
    _ = !1,
    S = typeof setTimeout == "function" ? setTimeout : null,
    h = typeof clearTimeout == "function" ? clearTimeout : null,
    f = typeof setImmediate < "u" ? setImmediate : null;
  typeof navigator < "u" &&
    navigator.scheduling !== void 0 &&
    navigator.scheduling.isInputPending !== void 0 &&
    navigator.scheduling.isInputPending.bind(navigator.scheduling);
  function m(y) {
    for (var E = n(c); E !== null; ) {
      if (E.callback === null) r(c);
      else if (E.startTime <= y)
        (r(c), (E.sortIndex = E.expirationTime), t(u, E));
      else break;
      E = n(c);
    }
  }
  function w(y) {
    if (((_ = !1), m(y), !x))
      if (n(u) !== null) ((x = !0), Q(C));
      else {
        var E = n(c);
        E !== null && G(w, E.startTime - y);
      }
  }
  function C(y, E) {
    ((x = !1), _ && ((_ = !1), h(P), (P = -1)), (k = !0));
    var j = g;
    try {
      for (
        m(E), p = n(u);
        p !== null && (!(p.expirationTime > E) || (y && !A()));
      ) {
        var N = p.callback;
        if (typeof N == "function") {
          ((p.callback = null), (g = p.priorityLevel));
          var T = N(p.expirationTime <= E);
          ((E = e.unstable_now()),
            typeof T == "function" ? (p.callback = T) : p === n(u) && r(u),
            m(E));
        } else r(u);
        p = n(u);
      }
      if (p !== null) var B = !0;
      else {
        var W = n(c);
        (W !== null && G(w, W.startTime - E), (B = !1));
      }
      return B;
    } finally {
      ((p = null), (g = j), (k = !1));
    }
  }
  var R = !1,
    z = null,
    P = -1,
    L = 5,
    b = -1;
  function A() {
    return !(e.unstable_now() - b < L);
  }
  function F() {
    if (z !== null) {
      var y = e.unstable_now();
      b = y;
      var E = !0;
      try {
        E = z(!0, y);
      } finally {
        E ? V() : ((R = !1), (z = null));
      }
    } else R = !1;
  }
  var V;
  if (typeof f == "function")
    V = function () {
      f(F);
    };
  else if (typeof MessageChannel < "u") {
    var U = new MessageChannel(),
      M = U.port2;
    ((U.port1.onmessage = F),
      (V = function () {
        M.postMessage(null);
      }));
  } else
    V = function () {
      S(F, 0);
    };
  function Q(y) {
    ((z = y), R || ((R = !0), V()));
  }
  function G(y, E) {
    P = S(function () {
      y(e.unstable_now());
    }, E);
  }
  ((e.unstable_IdlePriority = 5),
    (e.unstable_ImmediatePriority = 1),
    (e.unstable_LowPriority = 4),
    (e.unstable_NormalPriority = 3),
    (e.unstable_Profiling = null),
    (e.unstable_UserBlockingPriority = 2),
    (e.unstable_cancelCallback = function (y) {
      y.callback = null;
    }),
    (e.unstable_continueExecution = function () {
      x || k || ((x = !0), Q(C));
    }),
    (e.unstable_forceFrameRate = function (y) {
      0 > y || 125 < y
        ? console.error(
            "forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported",
          )
        : (L = 0 < y ? Math.floor(1e3 / y) : 5);
    }),
    (e.unstable_getCurrentPriorityLevel = function () {
      return g;
    }),
    (e.unstable_getFirstCallbackNode = function () {
      return n(u);
    }),
    (e.unstable_next = function (y) {
      switch (g) {
        case 1:
        case 2:
        case 3:
          var E = 3;
          break;
        default:
          E = g;
      }
      var j = g;
      g = E;
      try {
        return y();
      } finally {
        g = j;
      }
    }),
    (e.unstable_pauseExecution = function () {}),
    (e.unstable_requestPaint = function () {}),
    (e.unstable_runWithPriority = function (y, E) {
      switch (y) {
        case 1:
        case 2:
        case 3:
        case 4:
        case 5:
          break;
        default:
          y = 3;
      }
      var j = g;
      g = y;
      try {
        return E();
      } finally {
        g = j;
      }
    }),
    (e.unstable_scheduleCallback = function (y, E, j) {
      var N = e.unstable_now();
      switch (
        (typeof j == "object" && j !== null
          ? ((j = j.delay), (j = typeof j == "number" && 0 < j ? N + j : N))
          : (j = N),
        y)
      ) {
        case 1:
          var T = -1;
          break;
        case 2:
          T = 250;
          break;
        case 5:
          T = 1073741823;
          break;
        case 4:
          T = 1e4;
          break;
        default:
          T = 5e3;
      }
      return (
        (T = j + T),
        (y = {
          id: d++,
          callback: E,
          priorityLevel: y,
          startTime: j,
          expirationTime: T,
          sortIndex: -1,
        }),
        j > N
          ? ((y.sortIndex = j),
            t(c, y),
            n(u) === null &&
              y === n(c) &&
              (_ ? (h(P), (P = -1)) : (_ = !0), G(w, j - N)))
          : ((y.sortIndex = T), t(u, y), x || k || ((x = !0), Q(C))),
        y
      );
    }),
    (e.unstable_shouldYield = A),
    (e.unstable_wrapCallback = function (y) {
      var E = g;
      return function () {
        var j = g;
        g = E;
        try {
          return y.apply(this, arguments);
        } finally {
          g = j;
        }
      };
    }));
})(Vc);
Hc.exports = Vc;
var Xp = Hc.exports;
/**
 * @license React
 * react-dom.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ var Zp = v,
  Qe = Xp;
function I(e) {
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
var Kc = new Set(),
  Ur = {};
function Cn(e, t) {
  (Xn(e, t), Xn(e + "Capture", t));
}
function Xn(e, t) {
  for (Ur[e] = t, e = 0; e < t.length; e++) Kc.add(t[e]);
}
var Rt = !(
    typeof window > "u" ||
    typeof window.document > "u" ||
    typeof window.document.createElement > "u"
  ),
  Rl = Object.prototype.hasOwnProperty,
  qp =
    /^[:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD][:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\-.0-9\u00B7\u0300-\u036F\u203F-\u2040]*$/,
  Qa = {},
  Ya = {};
function eh(e) {
  return Rl.call(Ya, e)
    ? !0
    : Rl.call(Qa, e)
      ? !1
      : qp.test(e)
        ? (Ya[e] = !0)
        : ((Qa[e] = !0), !1);
}
function th(e, t, n, r) {
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
function nh(e, t, n, r) {
  if (t === null || typeof t > "u" || th(e, t, n, r)) return !0;
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
function Ne(e, t, n, r, i, o, s) {
  ((this.acceptsBooleans = t === 2 || t === 3 || t === 4),
    (this.attributeName = r),
    (this.attributeNamespace = i),
    (this.mustUseProperty = n),
    (this.propertyName = e),
    (this.type = t),
    (this.sanitizeURL = o),
    (this.removeEmptyString = s));
}
var Ce = {};
"children dangerouslySetInnerHTML defaultValue defaultChecked innerHTML suppressContentEditableWarning suppressHydrationWarning style"
  .split(" ")
  .forEach(function (e) {
    Ce[e] = new Ne(e, 0, !1, e, null, !1, !1);
  });
[
  ["acceptCharset", "accept-charset"],
  ["className", "class"],
  ["htmlFor", "for"],
  ["httpEquiv", "http-equiv"],
].forEach(function (e) {
  var t = e[0];
  Ce[t] = new Ne(t, 1, !1, e[1], null, !1, !1);
});
["contentEditable", "draggable", "spellCheck", "value"].forEach(function (e) {
  Ce[e] = new Ne(e, 2, !1, e.toLowerCase(), null, !1, !1);
});
[
  "autoReverse",
  "externalResourcesRequired",
  "focusable",
  "preserveAlpha",
].forEach(function (e) {
  Ce[e] = new Ne(e, 2, !1, e, null, !1, !1);
});
"allowFullScreen async autoFocus autoPlay controls default defer disabled disablePictureInPicture disableRemotePlayback formNoValidate hidden loop noModule noValidate open playsInline readOnly required reversed scoped seamless itemScope"
  .split(" ")
  .forEach(function (e) {
    Ce[e] = new Ne(e, 3, !1, e.toLowerCase(), null, !1, !1);
  });
["checked", "multiple", "muted", "selected"].forEach(function (e) {
  Ce[e] = new Ne(e, 3, !0, e, null, !1, !1);
});
["capture", "download"].forEach(function (e) {
  Ce[e] = new Ne(e, 4, !1, e, null, !1, !1);
});
["cols", "rows", "size", "span"].forEach(function (e) {
  Ce[e] = new Ne(e, 6, !1, e, null, !1, !1);
});
["rowSpan", "start"].forEach(function (e) {
  Ce[e] = new Ne(e, 5, !1, e.toLowerCase(), null, !1, !1);
});
var Ds = /[\-:]([a-z])/g;
function $s(e) {
  return e[1].toUpperCase();
}
"accent-height alignment-baseline arabic-form baseline-shift cap-height clip-path clip-rule color-interpolation color-interpolation-filters color-profile color-rendering dominant-baseline enable-background fill-opacity fill-rule flood-color flood-opacity font-family font-size font-size-adjust font-stretch font-style font-variant font-weight glyph-name glyph-orientation-horizontal glyph-orientation-vertical horiz-adv-x horiz-origin-x image-rendering letter-spacing lighting-color marker-end marker-mid marker-start overline-position overline-thickness paint-order panose-1 pointer-events rendering-intent shape-rendering stop-color stop-opacity strikethrough-position strikethrough-thickness stroke-dasharray stroke-dashoffset stroke-linecap stroke-linejoin stroke-miterlimit stroke-opacity stroke-width text-anchor text-decoration text-rendering underline-position underline-thickness unicode-bidi unicode-range units-per-em v-alphabetic v-hanging v-ideographic v-mathematical vector-effect vert-adv-y vert-origin-x vert-origin-y word-spacing writing-mode xmlns:xlink x-height"
  .split(" ")
  .forEach(function (e) {
    var t = e.replace(Ds, $s);
    Ce[t] = new Ne(t, 1, !1, e, null, !1, !1);
  });
"xlink:actuate xlink:arcrole xlink:role xlink:show xlink:title xlink:type"
  .split(" ")
  .forEach(function (e) {
    var t = e.replace(Ds, $s);
    Ce[t] = new Ne(t, 1, !1, e, "http://www.w3.org/1999/xlink", !1, !1);
  });
["xml:base", "xml:lang", "xml:space"].forEach(function (e) {
  var t = e.replace(Ds, $s);
  Ce[t] = new Ne(t, 1, !1, e, "http://www.w3.org/XML/1998/namespace", !1, !1);
});
["tabIndex", "crossOrigin"].forEach(function (e) {
  Ce[e] = new Ne(e, 1, !1, e.toLowerCase(), null, !1, !1);
});
Ce.xlinkHref = new Ne(
  "xlinkHref",
  1,
  !1,
  "xlink:href",
  "http://www.w3.org/1999/xlink",
  !0,
  !1,
);
["src", "href", "action", "formAction"].forEach(function (e) {
  Ce[e] = new Ne(e, 1, !1, e.toLowerCase(), null, !0, !0);
});
function As(e, t, n, r) {
  var i = Ce.hasOwnProperty(t) ? Ce[t] : null;
  (i !== null
    ? i.type !== 0
    : r ||
      !(2 < t.length) ||
      (t[0] !== "o" && t[0] !== "O") ||
      (t[1] !== "n" && t[1] !== "N")) &&
    (nh(t, n, i, r) && (n = null),
    r || i === null
      ? eh(t) && (n === null ? e.removeAttribute(t) : e.setAttribute(t, "" + n))
      : i.mustUseProperty
        ? (e[i.propertyName] = n === null ? (i.type === 3 ? !1 : "") : n)
        : ((t = i.attributeName),
          (r = i.attributeNamespace),
          n === null
            ? e.removeAttribute(t)
            : ((i = i.type),
              (n = i === 3 || (i === 4 && n === !0) ? "" : "" + n),
              r ? e.setAttributeNS(r, t, n) : e.setAttribute(t, n))));
}
var It = Zp.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED,
  xi = Symbol.for("react.element"),
  In = Symbol.for("react.portal"),
  Ln = Symbol.for("react.fragment"),
  Fs = Symbol.for("react.strict_mode"),
  Pl = Symbol.for("react.profiler"),
  Jc = Symbol.for("react.provider"),
  Qc = Symbol.for("react.context"),
  Bs = Symbol.for("react.forward_ref"),
  Tl = Symbol.for("react.suspense"),
  Ml = Symbol.for("react.suspense_list"),
  Ws = Symbol.for("react.memo"),
  $t = Symbol.for("react.lazy"),
  Yc = Symbol.for("react.offscreen"),
  Ga = Symbol.iterator;
function hr(e) {
  return e === null || typeof e != "object"
    ? null
    : ((e = (Ga && e[Ga]) || e["@@iterator"]),
      typeof e == "function" ? e : null);
}
var ue = Object.assign,
  Zo;
function zr(e) {
  if (Zo === void 0)
    try {
      throw Error();
    } catch (n) {
      var t = n.stack.trim().match(/\n( *(at )?)/);
      Zo = (t && t[1]) || "";
    }
  return (
    `
` +
    Zo +
    e
  );
}
var qo = !1;
function el(e, t) {
  if (!e || qo) return "";
  qo = !0;
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
        var i = c.stack.split(`
`),
          o = r.stack.split(`
`),
          s = i.length - 1,
          a = o.length - 1;
        1 <= s && 0 <= a && i[s] !== o[a];
      )
        a--;
      for (; 1 <= s && 0 <= a; s--, a--)
        if (i[s] !== o[a]) {
          if (s !== 1 || a !== 1)
            do
              if ((s--, a--, 0 > a || i[s] !== o[a])) {
                var u =
                  `
` + i[s].replace(" at new ", " at ");
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
    ((qo = !1), (Error.prepareStackTrace = n));
  }
  return (e = e ? e.displayName || e.name : "") ? zr(e) : "";
}
function rh(e) {
  switch (e.tag) {
    case 5:
      return zr(e.type);
    case 16:
      return zr("Lazy");
    case 13:
      return zr("Suspense");
    case 19:
      return zr("SuspenseList");
    case 0:
    case 2:
    case 15:
      return ((e = el(e.type, !1)), e);
    case 11:
      return ((e = el(e.type.render, !1)), e);
    case 1:
      return ((e = el(e.type, !0)), e);
    default:
      return "";
  }
}
function Il(e) {
  if (e == null) return null;
  if (typeof e == "function") return e.displayName || e.name || null;
  if (typeof e == "string") return e;
  switch (e) {
    case Ln:
      return "Fragment";
    case In:
      return "Portal";
    case Pl:
      return "Profiler";
    case Fs:
      return "StrictMode";
    case Tl:
      return "Suspense";
    case Ml:
      return "SuspenseList";
  }
  if (typeof e == "object")
    switch (e.$$typeof) {
      case Qc:
        return (e.displayName || "Context") + ".Consumer";
      case Jc:
        return (e._context.displayName || "Context") + ".Provider";
      case Bs:
        var t = e.render;
        return (
          (e = e.displayName),
          e ||
            ((e = t.displayName || t.name || ""),
            (e = e !== "" ? "ForwardRef(" + e + ")" : "ForwardRef")),
          e
        );
      case Ws:
        return (
          (t = e.displayName || null),
          t !== null ? t : Il(e.type) || "Memo"
        );
      case $t:
        ((t = e._payload), (e = e._init));
        try {
          return Il(e(t));
        } catch {}
    }
  return null;
}
function ih(e) {
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
      return Il(t);
    case 8:
      return t === Fs ? "StrictMode" : "Mode";
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
function en(e) {
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
function Gc(e) {
  var t = e.type;
  return (
    (e = e.nodeName) &&
    e.toLowerCase() === "input" &&
    (t === "checkbox" || t === "radio")
  );
}
function oh(e) {
  var t = Gc(e) ? "checked" : "value",
    n = Object.getOwnPropertyDescriptor(e.constructor.prototype, t),
    r = "" + e[t];
  if (
    !e.hasOwnProperty(t) &&
    typeof n < "u" &&
    typeof n.get == "function" &&
    typeof n.set == "function"
  ) {
    var i = n.get,
      o = n.set;
    return (
      Object.defineProperty(e, t, {
        configurable: !0,
        get: function () {
          return i.call(this);
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
function yi(e) {
  e._valueTracker || (e._valueTracker = oh(e));
}
function Xc(e) {
  if (!e) return !1;
  var t = e._valueTracker;
  if (!t) return !0;
  var n = t.getValue(),
    r = "";
  return (
    e && (r = Gc(e) ? (e.checked ? "true" : "false") : e.value),
    (e = r),
    e !== n ? (t.setValue(e), !0) : !1
  );
}
function eo(e) {
  if (((e = e || (typeof document < "u" ? document : void 0)), typeof e > "u"))
    return null;
  try {
    return e.activeElement || e.body;
  } catch {
    return e.body;
  }
}
function Ll(e, t) {
  var n = t.checked;
  return ue({}, t, {
    defaultChecked: void 0,
    defaultValue: void 0,
    value: void 0,
    checked: n ?? e._wrapperState.initialChecked,
  });
}
function Xa(e, t) {
  var n = t.defaultValue == null ? "" : t.defaultValue,
    r = t.checked != null ? t.checked : t.defaultChecked;
  ((n = en(t.value != null ? t.value : n)),
    (e._wrapperState = {
      initialChecked: r,
      initialValue: n,
      controlled:
        t.type === "checkbox" || t.type === "radio"
          ? t.checked != null
          : t.value != null,
    }));
}
function Zc(e, t) {
  ((t = t.checked), t != null && As(e, "checked", t, !1));
}
function Nl(e, t) {
  Zc(e, t);
  var n = en(t.value),
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
    ? Ol(e, t.type, n)
    : t.hasOwnProperty("defaultValue") && Ol(e, t.type, en(t.defaultValue)),
    t.checked == null &&
      t.defaultChecked != null &&
      (e.defaultChecked = !!t.defaultChecked));
}
function Za(e, t, n) {
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
function Ol(e, t, n) {
  (t !== "number" || eo(e.ownerDocument) !== e) &&
    (n == null
      ? (e.defaultValue = "" + e._wrapperState.initialValue)
      : e.defaultValue !== "" + n && (e.defaultValue = "" + n));
}
var Rr = Array.isArray;
function Vn(e, t, n, r) {
  if (((e = e.options), t)) {
    t = {};
    for (var i = 0; i < n.length; i++) t["$" + n[i]] = !0;
    for (n = 0; n < e.length; n++)
      ((i = t.hasOwnProperty("$" + e[n].value)),
        e[n].selected !== i && (e[n].selected = i),
        i && r && (e[n].defaultSelected = !0));
  } else {
    for (n = "" + en(n), t = null, i = 0; i < e.length; i++) {
      if (e[i].value === n) {
        ((e[i].selected = !0), r && (e[i].defaultSelected = !0));
        return;
      }
      t !== null || e[i].disabled || (t = e[i]);
    }
    t !== null && (t.selected = !0);
  }
}
function Dl(e, t) {
  if (t.dangerouslySetInnerHTML != null) throw Error(I(91));
  return ue({}, t, {
    value: void 0,
    defaultValue: void 0,
    children: "" + e._wrapperState.initialValue,
  });
}
function qa(e, t) {
  var n = t.value;
  if (n == null) {
    if (((n = t.children), (t = t.defaultValue), n != null)) {
      if (t != null) throw Error(I(92));
      if (Rr(n)) {
        if (1 < n.length) throw Error(I(93));
        n = n[0];
      }
      t = n;
    }
    (t == null && (t = ""), (n = t));
  }
  e._wrapperState = { initialValue: en(n) };
}
function qc(e, t) {
  var n = en(t.value),
    r = en(t.defaultValue);
  (n != null &&
    ((n = "" + n),
    n !== e.value && (e.value = n),
    t.defaultValue == null && e.defaultValue !== n && (e.defaultValue = n)),
    r != null && (e.defaultValue = "" + r));
}
function eu(e) {
  var t = e.textContent;
  t === e._wrapperState.initialValue && t !== "" && t !== null && (e.value = t);
}
function ed(e) {
  switch (e) {
    case "svg":
      return "http://www.w3.org/2000/svg";
    case "math":
      return "http://www.w3.org/1998/Math/MathML";
    default:
      return "http://www.w3.org/1999/xhtml";
  }
}
function $l(e, t) {
  return e == null || e === "http://www.w3.org/1999/xhtml"
    ? ed(t)
    : e === "http://www.w3.org/2000/svg" && t === "foreignObject"
      ? "http://www.w3.org/1999/xhtml"
      : e;
}
var Si,
  td = (function (e) {
    return typeof MSApp < "u" && MSApp.execUnsafeLocalFunction
      ? function (t, n, r, i) {
          MSApp.execUnsafeLocalFunction(function () {
            return e(t, n, r, i);
          });
        }
      : e;
  })(function (e, t) {
    if (e.namespaceURI !== "http://www.w3.org/2000/svg" || "innerHTML" in e)
      e.innerHTML = t;
    else {
      for (
        Si = Si || document.createElement("div"),
          Si.innerHTML = "<svg>" + t.valueOf().toString() + "</svg>",
          t = Si.firstChild;
        e.firstChild;
      )
        e.removeChild(e.firstChild);
      for (; t.firstChild; ) e.appendChild(t.firstChild);
    }
  });
function Hr(e, t) {
  if (t) {
    var n = e.firstChild;
    if (n && n === e.lastChild && n.nodeType === 3) {
      n.nodeValue = t;
      return;
    }
  }
  e.textContent = t;
}
var Ir = {
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
  lh = ["Webkit", "ms", "Moz", "O"];
Object.keys(Ir).forEach(function (e) {
  lh.forEach(function (t) {
    ((t = t + e.charAt(0).toUpperCase() + e.substring(1)), (Ir[t] = Ir[e]));
  });
});
function nd(e, t, n) {
  return t == null || typeof t == "boolean" || t === ""
    ? ""
    : n || typeof t != "number" || t === 0 || (Ir.hasOwnProperty(e) && Ir[e])
      ? ("" + t).trim()
      : t + "px";
}
function rd(e, t) {
  e = e.style;
  for (var n in t)
    if (t.hasOwnProperty(n)) {
      var r = n.indexOf("--") === 0,
        i = nd(n, t[n], r);
      (n === "float" && (n = "cssFloat"), r ? e.setProperty(n, i) : (e[n] = i));
    }
}
var sh = ue(
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
function Al(e, t) {
  if (t) {
    if (sh[e] && (t.children != null || t.dangerouslySetInnerHTML != null))
      throw Error(I(137, e));
    if (t.dangerouslySetInnerHTML != null) {
      if (t.children != null) throw Error(I(60));
      if (
        typeof t.dangerouslySetInnerHTML != "object" ||
        !("__html" in t.dangerouslySetInnerHTML)
      )
        throw Error(I(61));
    }
    if (t.style != null && typeof t.style != "object") throw Error(I(62));
  }
}
function Fl(e, t) {
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
var Bl = null;
function Us(e) {
  return (
    (e = e.target || e.srcElement || window),
    e.correspondingUseElement && (e = e.correspondingUseElement),
    e.nodeType === 3 ? e.parentNode : e
  );
}
var Wl = null,
  Kn = null,
  Jn = null;
function tu(e) {
  if ((e = pi(e))) {
    if (typeof Wl != "function") throw Error(I(280));
    var t = e.stateNode;
    t && ((t = Io(t)), Wl(e.stateNode, e.type, t));
  }
}
function id(e) {
  Kn ? (Jn ? Jn.push(e) : (Jn = [e])) : (Kn = e);
}
function od() {
  if (Kn) {
    var e = Kn,
      t = Jn;
    if (((Jn = Kn = null), tu(e), t)) for (e = 0; e < t.length; e++) tu(t[e]);
  }
}
function ld(e, t) {
  return e(t);
}
function sd() {}
var tl = !1;
function ad(e, t, n) {
  if (tl) return e(t, n);
  tl = !0;
  try {
    return ld(e, t, n);
  } finally {
    ((tl = !1), (Kn !== null || Jn !== null) && (sd(), od()));
  }
}
function Vr(e, t) {
  var n = e.stateNode;
  if (n === null) return null;
  var r = Io(n);
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
  if (n && typeof n != "function") throw Error(I(231, t, typeof n));
  return n;
}
var Ul = !1;
if (Rt)
  try {
    var gr = {};
    (Object.defineProperty(gr, "passive", {
      get: function () {
        Ul = !0;
      },
    }),
      window.addEventListener("test", gr, gr),
      window.removeEventListener("test", gr, gr));
  } catch {
    Ul = !1;
  }
function ah(e, t, n, r, i, o, s, a, u) {
  var c = Array.prototype.slice.call(arguments, 3);
  try {
    t.apply(n, c);
  } catch (d) {
    this.onError(d);
  }
}
var Lr = !1,
  to = null,
  no = !1,
  Hl = null,
  uh = {
    onError: function (e) {
      ((Lr = !0), (to = e));
    },
  };
function ch(e, t, n, r, i, o, s, a, u) {
  ((Lr = !1), (to = null), ah.apply(uh, arguments));
}
function dh(e, t, n, r, i, o, s, a, u) {
  if ((ch.apply(this, arguments), Lr)) {
    if (Lr) {
      var c = to;
      ((Lr = !1), (to = null));
    } else throw Error(I(198));
    no || ((no = !0), (Hl = c));
  }
}
function En(e) {
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
function ud(e) {
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
function nu(e) {
  if (En(e) !== e) throw Error(I(188));
}
function fh(e) {
  var t = e.alternate;
  if (!t) {
    if (((t = En(e)), t === null)) throw Error(I(188));
    return t !== e ? null : e;
  }
  for (var n = e, r = t; ; ) {
    var i = n.return;
    if (i === null) break;
    var o = i.alternate;
    if (o === null) {
      if (((r = i.return), r !== null)) {
        n = r;
        continue;
      }
      break;
    }
    if (i.child === o.child) {
      for (o = i.child; o; ) {
        if (o === n) return (nu(i), e);
        if (o === r) return (nu(i), t);
        o = o.sibling;
      }
      throw Error(I(188));
    }
    if (n.return !== r.return) ((n = i), (r = o));
    else {
      for (var s = !1, a = i.child; a; ) {
        if (a === n) {
          ((s = !0), (n = i), (r = o));
          break;
        }
        if (a === r) {
          ((s = !0), (r = i), (n = o));
          break;
        }
        a = a.sibling;
      }
      if (!s) {
        for (a = o.child; a; ) {
          if (a === n) {
            ((s = !0), (n = o), (r = i));
            break;
          }
          if (a === r) {
            ((s = !0), (r = o), (n = i));
            break;
          }
          a = a.sibling;
        }
        if (!s) throw Error(I(189));
      }
    }
    if (n.alternate !== r) throw Error(I(190));
  }
  if (n.tag !== 3) throw Error(I(188));
  return n.stateNode.current === n ? e : t;
}
function cd(e) {
  return ((e = fh(e)), e !== null ? dd(e) : null);
}
function dd(e) {
  if (e.tag === 5 || e.tag === 6) return e;
  for (e = e.child; e !== null; ) {
    var t = dd(e);
    if (t !== null) return t;
    e = e.sibling;
  }
  return null;
}
var fd = Qe.unstable_scheduleCallback,
  ru = Qe.unstable_cancelCallback,
  ph = Qe.unstable_shouldYield,
  hh = Qe.unstable_requestPaint,
  fe = Qe.unstable_now,
  gh = Qe.unstable_getCurrentPriorityLevel,
  Hs = Qe.unstable_ImmediatePriority,
  pd = Qe.unstable_UserBlockingPriority,
  ro = Qe.unstable_NormalPriority,
  mh = Qe.unstable_LowPriority,
  hd = Qe.unstable_IdlePriority,
  Ro = null,
  yt = null;
function vh(e) {
  if (yt && typeof yt.onCommitFiberRoot == "function")
    try {
      yt.onCommitFiberRoot(Ro, e, void 0, (e.current.flags & 128) === 128);
    } catch {}
}
var ct = Math.clz32 ? Math.clz32 : Sh,
  xh = Math.log,
  yh = Math.LN2;
function Sh(e) {
  return ((e >>>= 0), e === 0 ? 32 : (31 - ((xh(e) / yh) | 0)) | 0);
}
var _i = 64,
  wi = 4194304;
function Pr(e) {
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
function io(e, t) {
  var n = e.pendingLanes;
  if (n === 0) return 0;
  var r = 0,
    i = e.suspendedLanes,
    o = e.pingedLanes,
    s = n & 268435455;
  if (s !== 0) {
    var a = s & ~i;
    a !== 0 ? (r = Pr(a)) : ((o &= s), o !== 0 && (r = Pr(o)));
  } else ((s = n & ~i), s !== 0 ? (r = Pr(s)) : o !== 0 && (r = Pr(o)));
  if (r === 0) return 0;
  if (
    t !== 0 &&
    t !== r &&
    !(t & i) &&
    ((i = r & -r), (o = t & -t), i >= o || (i === 16 && (o & 4194240) !== 0))
  )
    return t;
  if ((r & 4 && (r |= n & 16), (t = e.entangledLanes), t !== 0))
    for (e = e.entanglements, t &= r; 0 < t; )
      ((n = 31 - ct(t)), (i = 1 << n), (r |= e[n]), (t &= ~i));
  return r;
}
function _h(e, t) {
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
function wh(e, t) {
  for (
    var n = e.suspendedLanes,
      r = e.pingedLanes,
      i = e.expirationTimes,
      o = e.pendingLanes;
    0 < o;
  ) {
    var s = 31 - ct(o),
      a = 1 << s,
      u = i[s];
    (u === -1
      ? (!(a & n) || a & r) && (i[s] = _h(a, t))
      : u <= t && (e.expiredLanes |= a),
      (o &= ~a));
  }
}
function Vl(e) {
  return (
    (e = e.pendingLanes & -1073741825),
    e !== 0 ? e : e & 1073741824 ? 1073741824 : 0
  );
}
function gd() {
  var e = _i;
  return ((_i <<= 1), !(_i & 4194240) && (_i = 64), e);
}
function nl(e) {
  for (var t = [], n = 0; 31 > n; n++) t.push(e);
  return t;
}
function di(e, t, n) {
  ((e.pendingLanes |= t),
    t !== 536870912 && ((e.suspendedLanes = 0), (e.pingedLanes = 0)),
    (e = e.eventTimes),
    (t = 31 - ct(t)),
    (e[t] = n));
}
function kh(e, t) {
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
    var i = 31 - ct(n),
      o = 1 << i;
    ((t[i] = 0), (r[i] = -1), (e[i] = -1), (n &= ~o));
  }
}
function Vs(e, t) {
  var n = (e.entangledLanes |= t);
  for (e = e.entanglements; n; ) {
    var r = 31 - ct(n),
      i = 1 << r;
    ((i & t) | (e[r] & t) && (e[r] |= t), (n &= ~i));
  }
}
var X = 0;
function md(e) {
  return (
    (e &= -e),
    1 < e ? (4 < e ? (e & 268435455 ? 16 : 536870912) : 4) : 1
  );
}
var vd,
  Ks,
  xd,
  yd,
  Sd,
  Kl = !1,
  ki = [],
  Vt = null,
  Kt = null,
  Jt = null,
  Kr = new Map(),
  Jr = new Map(),
  Ft = [],
  jh =
    "mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset submit".split(
      " ",
    );
function iu(e, t) {
  switch (e) {
    case "focusin":
    case "focusout":
      Vt = null;
      break;
    case "dragenter":
    case "dragleave":
      Kt = null;
      break;
    case "mouseover":
    case "mouseout":
      Jt = null;
      break;
    case "pointerover":
    case "pointerout":
      Kr.delete(t.pointerId);
      break;
    case "gotpointercapture":
    case "lostpointercapture":
      Jr.delete(t.pointerId);
  }
}
function mr(e, t, n, r, i, o) {
  return e === null || e.nativeEvent !== o
    ? ((e = {
        blockedOn: t,
        domEventName: n,
        eventSystemFlags: r,
        nativeEvent: o,
        targetContainers: [i],
      }),
      t !== null && ((t = pi(t)), t !== null && Ks(t)),
      e)
    : ((e.eventSystemFlags |= r),
      (t = e.targetContainers),
      i !== null && t.indexOf(i) === -1 && t.push(i),
      e);
}
function bh(e, t, n, r, i) {
  switch (t) {
    case "focusin":
      return ((Vt = mr(Vt, e, t, n, r, i)), !0);
    case "dragenter":
      return ((Kt = mr(Kt, e, t, n, r, i)), !0);
    case "mouseover":
      return ((Jt = mr(Jt, e, t, n, r, i)), !0);
    case "pointerover":
      var o = i.pointerId;
      return (Kr.set(o, mr(Kr.get(o) || null, e, t, n, r, i)), !0);
    case "gotpointercapture":
      return (
        (o = i.pointerId),
        Jr.set(o, mr(Jr.get(o) || null, e, t, n, r, i)),
        !0
      );
  }
  return !1;
}
function _d(e) {
  var t = gn(e.target);
  if (t !== null) {
    var n = En(t);
    if (n !== null) {
      if (((t = n.tag), t === 13)) {
        if (((t = ud(n)), t !== null)) {
          ((e.blockedOn = t),
            Sd(e.priority, function () {
              xd(n);
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
function Hi(e) {
  if (e.blockedOn !== null) return !1;
  for (var t = e.targetContainers; 0 < t.length; ) {
    var n = Jl(e.domEventName, e.eventSystemFlags, t[0], e.nativeEvent);
    if (n === null) {
      n = e.nativeEvent;
      var r = new n.constructor(n.type, n);
      ((Bl = r), n.target.dispatchEvent(r), (Bl = null));
    } else return ((t = pi(n)), t !== null && Ks(t), (e.blockedOn = n), !1);
    t.shift();
  }
  return !0;
}
function ou(e, t, n) {
  Hi(e) && n.delete(t);
}
function Ch() {
  ((Kl = !1),
    Vt !== null && Hi(Vt) && (Vt = null),
    Kt !== null && Hi(Kt) && (Kt = null),
    Jt !== null && Hi(Jt) && (Jt = null),
    Kr.forEach(ou),
    Jr.forEach(ou));
}
function vr(e, t) {
  e.blockedOn === t &&
    ((e.blockedOn = null),
    Kl ||
      ((Kl = !0),
      Qe.unstable_scheduleCallback(Qe.unstable_NormalPriority, Ch)));
}
function Qr(e) {
  function t(i) {
    return vr(i, e);
  }
  if (0 < ki.length) {
    vr(ki[0], e);
    for (var n = 1; n < ki.length; n++) {
      var r = ki[n];
      r.blockedOn === e && (r.blockedOn = null);
    }
  }
  for (
    Vt !== null && vr(Vt, e),
      Kt !== null && vr(Kt, e),
      Jt !== null && vr(Jt, e),
      Kr.forEach(t),
      Jr.forEach(t),
      n = 0;
    n < Ft.length;
    n++
  )
    ((r = Ft[n]), r.blockedOn === e && (r.blockedOn = null));
  for (; 0 < Ft.length && ((n = Ft[0]), n.blockedOn === null); )
    (_d(n), n.blockedOn === null && Ft.shift());
}
var Qn = It.ReactCurrentBatchConfig,
  oo = !0;
function Eh(e, t, n, r) {
  var i = X,
    o = Qn.transition;
  Qn.transition = null;
  try {
    ((X = 1), Js(e, t, n, r));
  } finally {
    ((X = i), (Qn.transition = o));
  }
}
function zh(e, t, n, r) {
  var i = X,
    o = Qn.transition;
  Qn.transition = null;
  try {
    ((X = 4), Js(e, t, n, r));
  } finally {
    ((X = i), (Qn.transition = o));
  }
}
function Js(e, t, n, r) {
  if (oo) {
    var i = Jl(e, t, n, r);
    if (i === null) (fl(e, t, r, lo, n), iu(e, r));
    else if (bh(i, e, t, n, r)) r.stopPropagation();
    else if ((iu(e, r), t & 4 && -1 < jh.indexOf(e))) {
      for (; i !== null; ) {
        var o = pi(i);
        if (
          (o !== null && vd(o),
          (o = Jl(e, t, n, r)),
          o === null && fl(e, t, r, lo, n),
          o === i)
        )
          break;
        i = o;
      }
      i !== null && r.stopPropagation();
    } else fl(e, t, r, null, n);
  }
}
var lo = null;
function Jl(e, t, n, r) {
  if (((lo = null), (e = Us(r)), (e = gn(e)), e !== null))
    if (((t = En(e)), t === null)) e = null;
    else if (((n = t.tag), n === 13)) {
      if (((e = ud(t)), e !== null)) return e;
      e = null;
    } else if (n === 3) {
      if (t.stateNode.current.memoizedState.isDehydrated)
        return t.tag === 3 ? t.stateNode.containerInfo : null;
      e = null;
    } else t !== e && (e = null);
  return ((lo = e), null);
}
function wd(e) {
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
      switch (gh()) {
        case Hs:
          return 1;
        case pd:
          return 4;
        case ro:
        case mh:
          return 16;
        case hd:
          return 536870912;
        default:
          return 16;
      }
    default:
      return 16;
  }
}
var Wt = null,
  Qs = null,
  Vi = null;
function kd() {
  if (Vi) return Vi;
  var e,
    t = Qs,
    n = t.length,
    r,
    i = "value" in Wt ? Wt.value : Wt.textContent,
    o = i.length;
  for (e = 0; e < n && t[e] === i[e]; e++);
  var s = n - e;
  for (r = 1; r <= s && t[n - r] === i[o - r]; r++);
  return (Vi = i.slice(e, 1 < r ? 1 - r : void 0));
}
function Ki(e) {
  var t = e.keyCode;
  return (
    "charCode" in e
      ? ((e = e.charCode), e === 0 && t === 13 && (e = 13))
      : (e = t),
    e === 10 && (e = 13),
    32 <= e || e === 13 ? e : 0
  );
}
function ji() {
  return !0;
}
function lu() {
  return !1;
}
function Ge(e) {
  function t(n, r, i, o, s) {
    ((this._reactName = n),
      (this._targetInst = i),
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
        ? ji
        : lu),
      (this.isPropagationStopped = lu),
      this
    );
  }
  return (
    ue(t.prototype, {
      preventDefault: function () {
        this.defaultPrevented = !0;
        var n = this.nativeEvent;
        n &&
          (n.preventDefault
            ? n.preventDefault()
            : typeof n.returnValue != "unknown" && (n.returnValue = !1),
          (this.isDefaultPrevented = ji));
      },
      stopPropagation: function () {
        var n = this.nativeEvent;
        n &&
          (n.stopPropagation
            ? n.stopPropagation()
            : typeof n.cancelBubble != "unknown" && (n.cancelBubble = !0),
          (this.isPropagationStopped = ji));
      },
      persist: function () {},
      isPersistent: ji,
    }),
    t
  );
}
var ar = {
    eventPhase: 0,
    bubbles: 0,
    cancelable: 0,
    timeStamp: function (e) {
      return e.timeStamp || Date.now();
    },
    defaultPrevented: 0,
    isTrusted: 0,
  },
  Ys = Ge(ar),
  fi = ue({}, ar, { view: 0, detail: 0 }),
  Rh = Ge(fi),
  rl,
  il,
  xr,
  Po = ue({}, fi, {
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
    getModifierState: Gs,
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
        : (e !== xr &&
            (xr && e.type === "mousemove"
              ? ((rl = e.screenX - xr.screenX), (il = e.screenY - xr.screenY))
              : (il = rl = 0),
            (xr = e)),
          rl);
    },
    movementY: function (e) {
      return "movementY" in e ? e.movementY : il;
    },
  }),
  su = Ge(Po),
  Ph = ue({}, Po, { dataTransfer: 0 }),
  Th = Ge(Ph),
  Mh = ue({}, fi, { relatedTarget: 0 }),
  ol = Ge(Mh),
  Ih = ue({}, ar, { animationName: 0, elapsedTime: 0, pseudoElement: 0 }),
  Lh = Ge(Ih),
  Nh = ue({}, ar, {
    clipboardData: function (e) {
      return "clipboardData" in e ? e.clipboardData : window.clipboardData;
    },
  }),
  Oh = Ge(Nh),
  Dh = ue({}, ar, { data: 0 }),
  au = Ge(Dh),
  $h = {
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
  Ah = {
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
  Fh = {
    Alt: "altKey",
    Control: "ctrlKey",
    Meta: "metaKey",
    Shift: "shiftKey",
  };
function Bh(e) {
  var t = this.nativeEvent;
  return t.getModifierState ? t.getModifierState(e) : (e = Fh[e]) ? !!t[e] : !1;
}
function Gs() {
  return Bh;
}
var Wh = ue({}, fi, {
    key: function (e) {
      if (e.key) {
        var t = $h[e.key] || e.key;
        if (t !== "Unidentified") return t;
      }
      return e.type === "keypress"
        ? ((e = Ki(e)), e === 13 ? "Enter" : String.fromCharCode(e))
        : e.type === "keydown" || e.type === "keyup"
          ? Ah[e.keyCode] || "Unidentified"
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
    getModifierState: Gs,
    charCode: function (e) {
      return e.type === "keypress" ? Ki(e) : 0;
    },
    keyCode: function (e) {
      return e.type === "keydown" || e.type === "keyup" ? e.keyCode : 0;
    },
    which: function (e) {
      return e.type === "keypress"
        ? Ki(e)
        : e.type === "keydown" || e.type === "keyup"
          ? e.keyCode
          : 0;
    },
  }),
  Uh = Ge(Wh),
  Hh = ue({}, Po, {
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
  uu = Ge(Hh),
  Vh = ue({}, fi, {
    touches: 0,
    targetTouches: 0,
    changedTouches: 0,
    altKey: 0,
    metaKey: 0,
    ctrlKey: 0,
    shiftKey: 0,
    getModifierState: Gs,
  }),
  Kh = Ge(Vh),
  Jh = ue({}, ar, { propertyName: 0, elapsedTime: 0, pseudoElement: 0 }),
  Qh = Ge(Jh),
  Yh = ue({}, Po, {
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
  Gh = Ge(Yh),
  Xh = [9, 13, 27, 32],
  Xs = Rt && "CompositionEvent" in window,
  Nr = null;
Rt && "documentMode" in document && (Nr = document.documentMode);
var Zh = Rt && "TextEvent" in window && !Nr,
  jd = Rt && (!Xs || (Nr && 8 < Nr && 11 >= Nr)),
  cu = " ",
  du = !1;
function bd(e, t) {
  switch (e) {
    case "keyup":
      return Xh.indexOf(t.keyCode) !== -1;
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
function Cd(e) {
  return ((e = e.detail), typeof e == "object" && "data" in e ? e.data : null);
}
var Nn = !1;
function qh(e, t) {
  switch (e) {
    case "compositionend":
      return Cd(t);
    case "keypress":
      return t.which !== 32 ? null : ((du = !0), cu);
    case "textInput":
      return ((e = t.data), e === cu && du ? null : e);
    default:
      return null;
  }
}
function eg(e, t) {
  if (Nn)
    return e === "compositionend" || (!Xs && bd(e, t))
      ? ((e = kd()), (Vi = Qs = Wt = null), (Nn = !1), e)
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
      return jd && t.locale !== "ko" ? null : t.data;
    default:
      return null;
  }
}
var tg = {
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
function fu(e) {
  var t = e && e.nodeName && e.nodeName.toLowerCase();
  return t === "input" ? !!tg[e.type] : t === "textarea";
}
function Ed(e, t, n, r) {
  (id(r),
    (t = so(t, "onChange")),
    0 < t.length &&
      ((n = new Ys("onChange", "change", null, n, r)),
      e.push({ event: n, listeners: t })));
}
var Or = null,
  Yr = null;
function ng(e) {
  $d(e, 0);
}
function To(e) {
  var t = $n(e);
  if (Xc(t)) return e;
}
function rg(e, t) {
  if (e === "change") return t;
}
var zd = !1;
if (Rt) {
  var ll;
  if (Rt) {
    var sl = "oninput" in document;
    if (!sl) {
      var pu = document.createElement("div");
      (pu.setAttribute("oninput", "return;"),
        (sl = typeof pu.oninput == "function"));
    }
    ll = sl;
  } else ll = !1;
  zd = ll && (!document.documentMode || 9 < document.documentMode);
}
function hu() {
  Or && (Or.detachEvent("onpropertychange", Rd), (Yr = Or = null));
}
function Rd(e) {
  if (e.propertyName === "value" && To(Yr)) {
    var t = [];
    (Ed(t, Yr, e, Us(e)), ad(ng, t));
  }
}
function ig(e, t, n) {
  e === "focusin"
    ? (hu(), (Or = t), (Yr = n), Or.attachEvent("onpropertychange", Rd))
    : e === "focusout" && hu();
}
function og(e) {
  if (e === "selectionchange" || e === "keyup" || e === "keydown")
    return To(Yr);
}
function lg(e, t) {
  if (e === "click") return To(t);
}
function sg(e, t) {
  if (e === "input" || e === "change") return To(t);
}
function ag(e, t) {
  return (e === t && (e !== 0 || 1 / e === 1 / t)) || (e !== e && t !== t);
}
var ft = typeof Object.is == "function" ? Object.is : ag;
function Gr(e, t) {
  if (ft(e, t)) return !0;
  if (typeof e != "object" || e === null || typeof t != "object" || t === null)
    return !1;
  var n = Object.keys(e),
    r = Object.keys(t);
  if (n.length !== r.length) return !1;
  for (r = 0; r < n.length; r++) {
    var i = n[r];
    if (!Rl.call(t, i) || !ft(e[i], t[i])) return !1;
  }
  return !0;
}
function gu(e) {
  for (; e && e.firstChild; ) e = e.firstChild;
  return e;
}
function mu(e, t) {
  var n = gu(e);
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
    n = gu(n);
  }
}
function Pd(e, t) {
  return e && t
    ? e === t
      ? !0
      : e && e.nodeType === 3
        ? !1
        : t && t.nodeType === 3
          ? Pd(e, t.parentNode)
          : "contains" in e
            ? e.contains(t)
            : e.compareDocumentPosition
              ? !!(e.compareDocumentPosition(t) & 16)
              : !1
    : !1;
}
function Td() {
  for (var e = window, t = eo(); t instanceof e.HTMLIFrameElement; ) {
    try {
      var n = typeof t.contentWindow.location.href == "string";
    } catch {
      n = !1;
    }
    if (n) e = t.contentWindow;
    else break;
    t = eo(e.document);
  }
  return t;
}
function Zs(e) {
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
function ug(e) {
  var t = Td(),
    n = e.focusedElem,
    r = e.selectionRange;
  if (
    t !== n &&
    n &&
    n.ownerDocument &&
    Pd(n.ownerDocument.documentElement, n)
  ) {
    if (r !== null && Zs(n)) {
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
        var i = n.textContent.length,
          o = Math.min(r.start, i);
        ((r = r.end === void 0 ? o : Math.min(r.end, i)),
          !e.extend && o > r && ((i = r), (r = o), (o = i)),
          (i = mu(n, o)));
        var s = mu(n, r);
        i &&
          s &&
          (e.rangeCount !== 1 ||
            e.anchorNode !== i.node ||
            e.anchorOffset !== i.offset ||
            e.focusNode !== s.node ||
            e.focusOffset !== s.offset) &&
          ((t = t.createRange()),
          t.setStart(i.node, i.offset),
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
var cg = Rt && "documentMode" in document && 11 >= document.documentMode,
  On = null,
  Ql = null,
  Dr = null,
  Yl = !1;
function vu(e, t, n) {
  var r = n.window === n ? n.document : n.nodeType === 9 ? n : n.ownerDocument;
  Yl ||
    On == null ||
    On !== eo(r) ||
    ((r = On),
    "selectionStart" in r && Zs(r)
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
    (Dr && Gr(Dr, r)) ||
      ((Dr = r),
      (r = so(Ql, "onSelect")),
      0 < r.length &&
        ((t = new Ys("onSelect", "select", null, t, n)),
        e.push({ event: t, listeners: r }),
        (t.target = On))));
}
function bi(e, t) {
  var n = {};
  return (
    (n[e.toLowerCase()] = t.toLowerCase()),
    (n["Webkit" + e] = "webkit" + t),
    (n["Moz" + e] = "moz" + t),
    n
  );
}
var Dn = {
    animationend: bi("Animation", "AnimationEnd"),
    animationiteration: bi("Animation", "AnimationIteration"),
    animationstart: bi("Animation", "AnimationStart"),
    transitionend: bi("Transition", "TransitionEnd"),
  },
  al = {},
  Md = {};
Rt &&
  ((Md = document.createElement("div").style),
  "AnimationEvent" in window ||
    (delete Dn.animationend.animation,
    delete Dn.animationiteration.animation,
    delete Dn.animationstart.animation),
  "TransitionEvent" in window || delete Dn.transitionend.transition);
function Mo(e) {
  if (al[e]) return al[e];
  if (!Dn[e]) return e;
  var t = Dn[e],
    n;
  for (n in t) if (t.hasOwnProperty(n) && n in Md) return (al[e] = t[n]);
  return e;
}
var Id = Mo("animationend"),
  Ld = Mo("animationiteration"),
  Nd = Mo("animationstart"),
  Od = Mo("transitionend"),
  Dd = new Map(),
  xu =
    "abort auxClick cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(
      " ",
    );
function nn(e, t) {
  (Dd.set(e, t), Cn(t, [e]));
}
for (var ul = 0; ul < xu.length; ul++) {
  var cl = xu[ul],
    dg = cl.toLowerCase(),
    fg = cl[0].toUpperCase() + cl.slice(1);
  nn(dg, "on" + fg);
}
nn(Id, "onAnimationEnd");
nn(Ld, "onAnimationIteration");
nn(Nd, "onAnimationStart");
nn("dblclick", "onDoubleClick");
nn("focusin", "onFocus");
nn("focusout", "onBlur");
nn(Od, "onTransitionEnd");
Xn("onMouseEnter", ["mouseout", "mouseover"]);
Xn("onMouseLeave", ["mouseout", "mouseover"]);
Xn("onPointerEnter", ["pointerout", "pointerover"]);
Xn("onPointerLeave", ["pointerout", "pointerover"]);
Cn(
  "onChange",
  "change click focusin focusout input keydown keyup selectionchange".split(
    " ",
  ),
);
Cn(
  "onSelect",
  "focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(
    " ",
  ),
);
Cn("onBeforeInput", ["compositionend", "keypress", "textInput", "paste"]);
Cn(
  "onCompositionEnd",
  "compositionend focusout keydown keypress keyup mousedown".split(" "),
);
Cn(
  "onCompositionStart",
  "compositionstart focusout keydown keypress keyup mousedown".split(" "),
);
Cn(
  "onCompositionUpdate",
  "compositionupdate focusout keydown keypress keyup mousedown".split(" "),
);
var Tr =
    "abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(
      " ",
    ),
  pg = new Set("cancel close invalid load scroll toggle".split(" ").concat(Tr));
function yu(e, t, n) {
  var r = e.type || "unknown-event";
  ((e.currentTarget = n), dh(r, t, void 0, e), (e.currentTarget = null));
}
function $d(e, t) {
  t = (t & 4) !== 0;
  for (var n = 0; n < e.length; n++) {
    var r = e[n],
      i = r.event;
    r = r.listeners;
    e: {
      var o = void 0;
      if (t)
        for (var s = r.length - 1; 0 <= s; s--) {
          var a = r[s],
            u = a.instance,
            c = a.currentTarget;
          if (((a = a.listener), u !== o && i.isPropagationStopped())) break e;
          (yu(i, a, c), (o = u));
        }
      else
        for (s = 0; s < r.length; s++) {
          if (
            ((a = r[s]),
            (u = a.instance),
            (c = a.currentTarget),
            (a = a.listener),
            u !== o && i.isPropagationStopped())
          )
            break e;
          (yu(i, a, c), (o = u));
        }
    }
  }
  if (no) throw ((e = Hl), (no = !1), (Hl = null), e);
}
function ne(e, t) {
  var n = t[es];
  n === void 0 && (n = t[es] = new Set());
  var r = e + "__bubble";
  n.has(r) || (Ad(t, e, 2, !1), n.add(r));
}
function dl(e, t, n) {
  var r = 0;
  (t && (r |= 4), Ad(n, e, r, t));
}
var Ci = "_reactListening" + Math.random().toString(36).slice(2);
function Xr(e) {
  if (!e[Ci]) {
    ((e[Ci] = !0),
      Kc.forEach(function (n) {
        n !== "selectionchange" && (pg.has(n) || dl(n, !1, e), dl(n, !0, e));
      }));
    var t = e.nodeType === 9 ? e : e.ownerDocument;
    t === null || t[Ci] || ((t[Ci] = !0), dl("selectionchange", !1, t));
  }
}
function Ad(e, t, n, r) {
  switch (wd(t)) {
    case 1:
      var i = Eh;
      break;
    case 4:
      i = zh;
      break;
    default:
      i = Js;
  }
  ((n = i.bind(null, t, n, e)),
    (i = void 0),
    !Ul ||
      (t !== "touchstart" && t !== "touchmove" && t !== "wheel") ||
      (i = !0),
    r
      ? i !== void 0
        ? e.addEventListener(t, n, { capture: !0, passive: i })
        : e.addEventListener(t, n, !0)
      : i !== void 0
        ? e.addEventListener(t, n, { passive: i })
        : e.addEventListener(t, n, !1));
}
function fl(e, t, n, r, i) {
  var o = r;
  if (!(t & 1) && !(t & 2) && r !== null)
    e: for (;;) {
      if (r === null) return;
      var s = r.tag;
      if (s === 3 || s === 4) {
        var a = r.stateNode.containerInfo;
        if (a === i || (a.nodeType === 8 && a.parentNode === i)) break;
        if (s === 4)
          for (s = r.return; s !== null; ) {
            var u = s.tag;
            if (
              (u === 3 || u === 4) &&
              ((u = s.stateNode.containerInfo),
              u === i || (u.nodeType === 8 && u.parentNode === i))
            )
              return;
            s = s.return;
          }
        for (; a !== null; ) {
          if (((s = gn(a)), s === null)) return;
          if (((u = s.tag), u === 5 || u === 6)) {
            r = o = s;
            continue e;
          }
          a = a.parentNode;
        }
      }
      r = r.return;
    }
  ad(function () {
    var c = o,
      d = Us(n),
      p = [];
    e: {
      var g = Dd.get(e);
      if (g !== void 0) {
        var k = Ys,
          x = e;
        switch (e) {
          case "keypress":
            if (Ki(n) === 0) break e;
          case "keydown":
          case "keyup":
            k = Uh;
            break;
          case "focusin":
            ((x = "focus"), (k = ol));
            break;
          case "focusout":
            ((x = "blur"), (k = ol));
            break;
          case "beforeblur":
          case "afterblur":
            k = ol;
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
            k = su;
            break;
          case "drag":
          case "dragend":
          case "dragenter":
          case "dragexit":
          case "dragleave":
          case "dragover":
          case "dragstart":
          case "drop":
            k = Th;
            break;
          case "touchcancel":
          case "touchend":
          case "touchmove":
          case "touchstart":
            k = Kh;
            break;
          case Id:
          case Ld:
          case Nd:
            k = Lh;
            break;
          case Od:
            k = Qh;
            break;
          case "scroll":
            k = Rh;
            break;
          case "wheel":
            k = Gh;
            break;
          case "copy":
          case "cut":
          case "paste":
            k = Oh;
            break;
          case "gotpointercapture":
          case "lostpointercapture":
          case "pointercancel":
          case "pointerdown":
          case "pointermove":
          case "pointerout":
          case "pointerover":
          case "pointerup":
            k = uu;
        }
        var _ = (t & 4) !== 0,
          S = !_ && e === "scroll",
          h = _ ? (g !== null ? g + "Capture" : null) : g;
        _ = [];
        for (var f = c, m; f !== null; ) {
          m = f;
          var w = m.stateNode;
          if (
            (m.tag === 5 &&
              w !== null &&
              ((m = w),
              h !== null && ((w = Vr(f, h)), w != null && _.push(Zr(f, w, m)))),
            S)
          )
            break;
          f = f.return;
        }
        0 < _.length &&
          ((g = new k(g, x, null, n, d)), p.push({ event: g, listeners: _ }));
      }
    }
    if (!(t & 7)) {
      e: {
        if (
          ((g = e === "mouseover" || e === "pointerover"),
          (k = e === "mouseout" || e === "pointerout"),
          g &&
            n !== Bl &&
            (x = n.relatedTarget || n.fromElement) &&
            (gn(x) || x[Pt]))
        )
          break e;
        if (
          (k || g) &&
          ((g =
            d.window === d
              ? d
              : (g = d.ownerDocument)
                ? g.defaultView || g.parentWindow
                : window),
          k
            ? ((x = n.relatedTarget || n.toElement),
              (k = c),
              (x = x ? gn(x) : null),
              x !== null &&
                ((S = En(x)), x !== S || (x.tag !== 5 && x.tag !== 6)) &&
                (x = null))
            : ((k = null), (x = c)),
          k !== x)
        ) {
          if (
            ((_ = su),
            (w = "onMouseLeave"),
            (h = "onMouseEnter"),
            (f = "mouse"),
            (e === "pointerout" || e === "pointerover") &&
              ((_ = uu),
              (w = "onPointerLeave"),
              (h = "onPointerEnter"),
              (f = "pointer")),
            (S = k == null ? g : $n(k)),
            (m = x == null ? g : $n(x)),
            (g = new _(w, f + "leave", k, n, d)),
            (g.target = S),
            (g.relatedTarget = m),
            (w = null),
            gn(d) === c &&
              ((_ = new _(h, f + "enter", x, n, d)),
              (_.target = m),
              (_.relatedTarget = S),
              (w = _)),
            (S = w),
            k && x)
          )
            t: {
              for (_ = k, h = x, f = 0, m = _; m; m = Rn(m)) f++;
              for (m = 0, w = h; w; w = Rn(w)) m++;
              for (; 0 < f - m; ) ((_ = Rn(_)), f--);
              for (; 0 < m - f; ) ((h = Rn(h)), m--);
              for (; f--; ) {
                if (_ === h || (h !== null && _ === h.alternate)) break t;
                ((_ = Rn(_)), (h = Rn(h)));
              }
              _ = null;
            }
          else _ = null;
          (k !== null && Su(p, g, k, _, !1),
            x !== null && S !== null && Su(p, S, x, _, !0));
        }
      }
      e: {
        if (
          ((g = c ? $n(c) : window),
          (k = g.nodeName && g.nodeName.toLowerCase()),
          k === "select" || (k === "input" && g.type === "file"))
        )
          var C = rg;
        else if (fu(g))
          if (zd) C = sg;
          else {
            C = og;
            var R = ig;
          }
        else
          (k = g.nodeName) &&
            k.toLowerCase() === "input" &&
            (g.type === "checkbox" || g.type === "radio") &&
            (C = lg);
        if (C && (C = C(e, c))) {
          Ed(p, C, n, d);
          break e;
        }
        (R && R(e, g, c),
          e === "focusout" &&
            (R = g._wrapperState) &&
            R.controlled &&
            g.type === "number" &&
            Ol(g, "number", g.value));
      }
      switch (((R = c ? $n(c) : window), e)) {
        case "focusin":
          (fu(R) || R.contentEditable === "true") &&
            ((On = R), (Ql = c), (Dr = null));
          break;
        case "focusout":
          Dr = Ql = On = null;
          break;
        case "mousedown":
          Yl = !0;
          break;
        case "contextmenu":
        case "mouseup":
        case "dragend":
          ((Yl = !1), vu(p, n, d));
          break;
        case "selectionchange":
          if (cg) break;
        case "keydown":
        case "keyup":
          vu(p, n, d);
      }
      var z;
      if (Xs)
        e: {
          switch (e) {
            case "compositionstart":
              var P = "onCompositionStart";
              break e;
            case "compositionend":
              P = "onCompositionEnd";
              break e;
            case "compositionupdate":
              P = "onCompositionUpdate";
              break e;
          }
          P = void 0;
        }
      else
        Nn
          ? bd(e, n) && (P = "onCompositionEnd")
          : e === "keydown" && n.keyCode === 229 && (P = "onCompositionStart");
      (P &&
        (jd &&
          n.locale !== "ko" &&
          (Nn || P !== "onCompositionStart"
            ? P === "onCompositionEnd" && Nn && (z = kd())
            : ((Wt = d),
              (Qs = "value" in Wt ? Wt.value : Wt.textContent),
              (Nn = !0))),
        (R = so(c, P)),
        0 < R.length &&
          ((P = new au(P, e, null, n, d)),
          p.push({ event: P, listeners: R }),
          z ? (P.data = z) : ((z = Cd(n)), z !== null && (P.data = z)))),
        (z = Zh ? qh(e, n) : eg(e, n)) &&
          ((c = so(c, "onBeforeInput")),
          0 < c.length &&
            ((d = new au("onBeforeInput", "beforeinput", null, n, d)),
            p.push({ event: d, listeners: c }),
            (d.data = z))));
    }
    $d(p, t);
  });
}
function Zr(e, t, n) {
  return { instance: e, listener: t, currentTarget: n };
}
function so(e, t) {
  for (var n = t + "Capture", r = []; e !== null; ) {
    var i = e,
      o = i.stateNode;
    (i.tag === 5 &&
      o !== null &&
      ((i = o),
      (o = Vr(e, n)),
      o != null && r.unshift(Zr(e, o, i)),
      (o = Vr(e, t)),
      o != null && r.push(Zr(e, o, i))),
      (e = e.return));
  }
  return r;
}
function Rn(e) {
  if (e === null) return null;
  do e = e.return;
  while (e && e.tag !== 5);
  return e || null;
}
function Su(e, t, n, r, i) {
  for (var o = t._reactName, s = []; n !== null && n !== r; ) {
    var a = n,
      u = a.alternate,
      c = a.stateNode;
    if (u !== null && u === r) break;
    (a.tag === 5 &&
      c !== null &&
      ((a = c),
      i
        ? ((u = Vr(n, o)), u != null && s.unshift(Zr(n, u, a)))
        : i || ((u = Vr(n, o)), u != null && s.push(Zr(n, u, a)))),
      (n = n.return));
  }
  s.length !== 0 && e.push({ event: t, listeners: s });
}
var hg = /\r\n?/g,
  gg = /\u0000|\uFFFD/g;
function _u(e) {
  return (typeof e == "string" ? e : "" + e)
    .replace(
      hg,
      `
`,
    )
    .replace(gg, "");
}
function Ei(e, t, n) {
  if (((t = _u(t)), _u(e) !== t && n)) throw Error(I(425));
}
function ao() {}
var Gl = null,
  Xl = null;
function Zl(e, t) {
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
var ql = typeof setTimeout == "function" ? setTimeout : void 0,
  mg = typeof clearTimeout == "function" ? clearTimeout : void 0,
  wu = typeof Promise == "function" ? Promise : void 0,
  vg =
    typeof queueMicrotask == "function"
      ? queueMicrotask
      : typeof wu < "u"
        ? function (e) {
            return wu.resolve(null).then(e).catch(xg);
          }
        : ql;
function xg(e) {
  setTimeout(function () {
    throw e;
  });
}
function pl(e, t) {
  var n = t,
    r = 0;
  do {
    var i = n.nextSibling;
    if ((e.removeChild(n), i && i.nodeType === 8))
      if (((n = i.data), n === "/$")) {
        if (r === 0) {
          (e.removeChild(i), Qr(t));
          return;
        }
        r--;
      } else (n !== "$" && n !== "$?" && n !== "$!") || r++;
    n = i;
  } while (n);
  Qr(t);
}
function Qt(e) {
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
function ku(e) {
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
var ur = Math.random().toString(36).slice(2),
  vt = "__reactFiber$" + ur,
  qr = "__reactProps$" + ur,
  Pt = "__reactContainer$" + ur,
  es = "__reactEvents$" + ur,
  yg = "__reactListeners$" + ur,
  Sg = "__reactHandles$" + ur;
function gn(e) {
  var t = e[vt];
  if (t) return t;
  for (var n = e.parentNode; n; ) {
    if ((t = n[Pt] || n[vt])) {
      if (
        ((n = t.alternate),
        t.child !== null || (n !== null && n.child !== null))
      )
        for (e = ku(e); e !== null; ) {
          if ((n = e[vt])) return n;
          e = ku(e);
        }
      return t;
    }
    ((e = n), (n = e.parentNode));
  }
  return null;
}
function pi(e) {
  return (
    (e = e[vt] || e[Pt]),
    !e || (e.tag !== 5 && e.tag !== 6 && e.tag !== 13 && e.tag !== 3) ? null : e
  );
}
function $n(e) {
  if (e.tag === 5 || e.tag === 6) return e.stateNode;
  throw Error(I(33));
}
function Io(e) {
  return e[qr] || null;
}
var ts = [],
  An = -1;
function rn(e) {
  return { current: e };
}
function re(e) {
  0 > An || ((e.current = ts[An]), (ts[An] = null), An--);
}
function ee(e, t) {
  (An++, (ts[An] = e.current), (e.current = t));
}
var tn = {},
  Te = rn(tn),
  Fe = rn(!1),
  Sn = tn;
function Zn(e, t) {
  var n = e.type.contextTypes;
  if (!n) return tn;
  var r = e.stateNode;
  if (r && r.__reactInternalMemoizedUnmaskedChildContext === t)
    return r.__reactInternalMemoizedMaskedChildContext;
  var i = {},
    o;
  for (o in n) i[o] = t[o];
  return (
    r &&
      ((e = e.stateNode),
      (e.__reactInternalMemoizedUnmaskedChildContext = t),
      (e.__reactInternalMemoizedMaskedChildContext = i)),
    i
  );
}
function Be(e) {
  return ((e = e.childContextTypes), e != null);
}
function uo() {
  (re(Fe), re(Te));
}
function ju(e, t, n) {
  if (Te.current !== tn) throw Error(I(168));
  (ee(Te, t), ee(Fe, n));
}
function Fd(e, t, n) {
  var r = e.stateNode;
  if (((t = t.childContextTypes), typeof r.getChildContext != "function"))
    return n;
  r = r.getChildContext();
  for (var i in r) if (!(i in t)) throw Error(I(108, ih(e) || "Unknown", i));
  return ue({}, n, r);
}
function co(e) {
  return (
    (e =
      ((e = e.stateNode) && e.__reactInternalMemoizedMergedChildContext) || tn),
    (Sn = Te.current),
    ee(Te, e),
    ee(Fe, Fe.current),
    !0
  );
}
function bu(e, t, n) {
  var r = e.stateNode;
  if (!r) throw Error(I(169));
  (n
    ? ((e = Fd(e, t, Sn)),
      (r.__reactInternalMemoizedMergedChildContext = e),
      re(Fe),
      re(Te),
      ee(Te, e))
    : re(Fe),
    ee(Fe, n));
}
var bt = null,
  Lo = !1,
  hl = !1;
function Bd(e) {
  bt === null ? (bt = [e]) : bt.push(e);
}
function _g(e) {
  ((Lo = !0), Bd(e));
}
function on() {
  if (!hl && bt !== null) {
    hl = !0;
    var e = 0,
      t = X;
    try {
      var n = bt;
      for (X = 1; e < n.length; e++) {
        var r = n[e];
        do r = r(!0);
        while (r !== null);
      }
      ((bt = null), (Lo = !1));
    } catch (i) {
      throw (bt !== null && (bt = bt.slice(e + 1)), fd(Hs, on), i);
    } finally {
      ((X = t), (hl = !1));
    }
  }
  return null;
}
var Fn = [],
  Bn = 0,
  fo = null,
  po = 0,
  Ze = [],
  qe = 0,
  _n = null,
  Ct = 1,
  Et = "";
function pn(e, t) {
  ((Fn[Bn++] = po), (Fn[Bn++] = fo), (fo = e), (po = t));
}
function Wd(e, t, n) {
  ((Ze[qe++] = Ct), (Ze[qe++] = Et), (Ze[qe++] = _n), (_n = e));
  var r = Ct;
  e = Et;
  var i = 32 - ct(r) - 1;
  ((r &= ~(1 << i)), (n += 1));
  var o = 32 - ct(t) + i;
  if (30 < o) {
    var s = i - (i % 5);
    ((o = (r & ((1 << s) - 1)).toString(32)),
      (r >>= s),
      (i -= s),
      (Ct = (1 << (32 - ct(t) + i)) | (n << i) | r),
      (Et = o + e));
  } else ((Ct = (1 << o) | (n << i) | r), (Et = e));
}
function qs(e) {
  e.return !== null && (pn(e, 1), Wd(e, 1, 0));
}
function ea(e) {
  for (; e === fo; )
    ((fo = Fn[--Bn]), (Fn[Bn] = null), (po = Fn[--Bn]), (Fn[Bn] = null));
  for (; e === _n; )
    ((_n = Ze[--qe]),
      (Ze[qe] = null),
      (Et = Ze[--qe]),
      (Ze[qe] = null),
      (Ct = Ze[--qe]),
      (Ze[qe] = null));
}
var Je = null,
  Ke = null,
  ie = !1,
  at = null;
function Ud(e, t) {
  var n = et(5, null, null, 0);
  ((n.elementType = "DELETED"),
    (n.stateNode = t),
    (n.return = e),
    (t = e.deletions),
    t === null ? ((e.deletions = [n]), (e.flags |= 16)) : t.push(n));
}
function Cu(e, t) {
  switch (e.tag) {
    case 5:
      var n = e.type;
      return (
        (t =
          t.nodeType !== 1 || n.toLowerCase() !== t.nodeName.toLowerCase()
            ? null
            : t),
        t !== null
          ? ((e.stateNode = t), (Je = e), (Ke = Qt(t.firstChild)), !0)
          : !1
      );
    case 6:
      return (
        (t = e.pendingProps === "" || t.nodeType !== 3 ? null : t),
        t !== null ? ((e.stateNode = t), (Je = e), (Ke = null), !0) : !1
      );
    case 13:
      return (
        (t = t.nodeType !== 8 ? null : t),
        t !== null
          ? ((n = _n !== null ? { id: Ct, overflow: Et } : null),
            (e.memoizedState = {
              dehydrated: t,
              treeContext: n,
              retryLane: 1073741824,
            }),
            (n = et(18, null, null, 0)),
            (n.stateNode = t),
            (n.return = e),
            (e.child = n),
            (Je = e),
            (Ke = null),
            !0)
          : !1
      );
    default:
      return !1;
  }
}
function ns(e) {
  return (e.mode & 1) !== 0 && (e.flags & 128) === 0;
}
function rs(e) {
  if (ie) {
    var t = Ke;
    if (t) {
      var n = t;
      if (!Cu(e, t)) {
        if (ns(e)) throw Error(I(418));
        t = Qt(n.nextSibling);
        var r = Je;
        t && Cu(e, t)
          ? Ud(r, n)
          : ((e.flags = (e.flags & -4097) | 2), (ie = !1), (Je = e));
      }
    } else {
      if (ns(e)) throw Error(I(418));
      ((e.flags = (e.flags & -4097) | 2), (ie = !1), (Je = e));
    }
  }
}
function Eu(e) {
  for (e = e.return; e !== null && e.tag !== 5 && e.tag !== 3 && e.tag !== 13; )
    e = e.return;
  Je = e;
}
function zi(e) {
  if (e !== Je) return !1;
  if (!ie) return (Eu(e), (ie = !0), !1);
  var t;
  if (
    ((t = e.tag !== 3) &&
      !(t = e.tag !== 5) &&
      ((t = e.type),
      (t = t !== "head" && t !== "body" && !Zl(e.type, e.memoizedProps))),
    t && (t = Ke))
  ) {
    if (ns(e)) throw (Hd(), Error(I(418)));
    for (; t; ) (Ud(e, t), (t = Qt(t.nextSibling)));
  }
  if ((Eu(e), e.tag === 13)) {
    if (((e = e.memoizedState), (e = e !== null ? e.dehydrated : null), !e))
      throw Error(I(317));
    e: {
      for (e = e.nextSibling, t = 0; e; ) {
        if (e.nodeType === 8) {
          var n = e.data;
          if (n === "/$") {
            if (t === 0) {
              Ke = Qt(e.nextSibling);
              break e;
            }
            t--;
          } else (n !== "$" && n !== "$!" && n !== "$?") || t++;
        }
        e = e.nextSibling;
      }
      Ke = null;
    }
  } else Ke = Je ? Qt(e.stateNode.nextSibling) : null;
  return !0;
}
function Hd() {
  for (var e = Ke; e; ) e = Qt(e.nextSibling);
}
function qn() {
  ((Ke = Je = null), (ie = !1));
}
function ta(e) {
  at === null ? (at = [e]) : at.push(e);
}
var wg = It.ReactCurrentBatchConfig;
function yr(e, t, n) {
  if (
    ((e = n.ref), e !== null && typeof e != "function" && typeof e != "object")
  ) {
    if (n._owner) {
      if (((n = n._owner), n)) {
        if (n.tag !== 1) throw Error(I(309));
        var r = n.stateNode;
      }
      if (!r) throw Error(I(147, e));
      var i = r,
        o = "" + e;
      return t !== null &&
        t.ref !== null &&
        typeof t.ref == "function" &&
        t.ref._stringRef === o
        ? t.ref
        : ((t = function (s) {
            var a = i.refs;
            s === null ? delete a[o] : (a[o] = s);
          }),
          (t._stringRef = o),
          t);
    }
    if (typeof e != "string") throw Error(I(284));
    if (!n._owner) throw Error(I(290, e));
  }
  return e;
}
function Ri(e, t) {
  throw (
    (e = Object.prototype.toString.call(t)),
    Error(
      I(
        31,
        e === "[object Object]"
          ? "object with keys {" + Object.keys(t).join(", ") + "}"
          : e,
      ),
    )
  );
}
function zu(e) {
  var t = e._init;
  return t(e._payload);
}
function Vd(e) {
  function t(h, f) {
    if (e) {
      var m = h.deletions;
      m === null ? ((h.deletions = [f]), (h.flags |= 16)) : m.push(f);
    }
  }
  function n(h, f) {
    if (!e) return null;
    for (; f !== null; ) (t(h, f), (f = f.sibling));
    return null;
  }
  function r(h, f) {
    for (h = new Map(); f !== null; )
      (f.key !== null ? h.set(f.key, f) : h.set(f.index, f), (f = f.sibling));
    return h;
  }
  function i(h, f) {
    return ((h = Zt(h, f)), (h.index = 0), (h.sibling = null), h);
  }
  function o(h, f, m) {
    return (
      (h.index = m),
      e
        ? ((m = h.alternate),
          m !== null
            ? ((m = m.index), m < f ? ((h.flags |= 2), f) : m)
            : ((h.flags |= 2), f))
        : ((h.flags |= 1048576), f)
    );
  }
  function s(h) {
    return (e && h.alternate === null && (h.flags |= 2), h);
  }
  function a(h, f, m, w) {
    return f === null || f.tag !== 6
      ? ((f = _l(m, h.mode, w)), (f.return = h), f)
      : ((f = i(f, m)), (f.return = h), f);
  }
  function u(h, f, m, w) {
    var C = m.type;
    return C === Ln
      ? d(h, f, m.props.children, w, m.key)
      : f !== null &&
          (f.elementType === C ||
            (typeof C == "object" &&
              C !== null &&
              C.$$typeof === $t &&
              zu(C) === f.type))
        ? ((w = i(f, m.props)), (w.ref = yr(h, f, m)), (w.return = h), w)
        : ((w = qi(m.type, m.key, m.props, null, h.mode, w)),
          (w.ref = yr(h, f, m)),
          (w.return = h),
          w);
  }
  function c(h, f, m, w) {
    return f === null ||
      f.tag !== 4 ||
      f.stateNode.containerInfo !== m.containerInfo ||
      f.stateNode.implementation !== m.implementation
      ? ((f = wl(m, h.mode, w)), (f.return = h), f)
      : ((f = i(f, m.children || [])), (f.return = h), f);
  }
  function d(h, f, m, w, C) {
    return f === null || f.tag !== 7
      ? ((f = yn(m, h.mode, w, C)), (f.return = h), f)
      : ((f = i(f, m)), (f.return = h), f);
  }
  function p(h, f, m) {
    if ((typeof f == "string" && f !== "") || typeof f == "number")
      return ((f = _l("" + f, h.mode, m)), (f.return = h), f);
    if (typeof f == "object" && f !== null) {
      switch (f.$$typeof) {
        case xi:
          return (
            (m = qi(f.type, f.key, f.props, null, h.mode, m)),
            (m.ref = yr(h, null, f)),
            (m.return = h),
            m
          );
        case In:
          return ((f = wl(f, h.mode, m)), (f.return = h), f);
        case $t:
          var w = f._init;
          return p(h, w(f._payload), m);
      }
      if (Rr(f) || hr(f))
        return ((f = yn(f, h.mode, m, null)), (f.return = h), f);
      Ri(h, f);
    }
    return null;
  }
  function g(h, f, m, w) {
    var C = f !== null ? f.key : null;
    if ((typeof m == "string" && m !== "") || typeof m == "number")
      return C !== null ? null : a(h, f, "" + m, w);
    if (typeof m == "object" && m !== null) {
      switch (m.$$typeof) {
        case xi:
          return m.key === C ? u(h, f, m, w) : null;
        case In:
          return m.key === C ? c(h, f, m, w) : null;
        case $t:
          return ((C = m._init), g(h, f, C(m._payload), w));
      }
      if (Rr(m) || hr(m)) return C !== null ? null : d(h, f, m, w, null);
      Ri(h, m);
    }
    return null;
  }
  function k(h, f, m, w, C) {
    if ((typeof w == "string" && w !== "") || typeof w == "number")
      return ((h = h.get(m) || null), a(f, h, "" + w, C));
    if (typeof w == "object" && w !== null) {
      switch (w.$$typeof) {
        case xi:
          return (
            (h = h.get(w.key === null ? m : w.key) || null),
            u(f, h, w, C)
          );
        case In:
          return (
            (h = h.get(w.key === null ? m : w.key) || null),
            c(f, h, w, C)
          );
        case $t:
          var R = w._init;
          return k(h, f, m, R(w._payload), C);
      }
      if (Rr(w) || hr(w)) return ((h = h.get(m) || null), d(f, h, w, C, null));
      Ri(f, w);
    }
    return null;
  }
  function x(h, f, m, w) {
    for (
      var C = null, R = null, z = f, P = (f = 0), L = null;
      z !== null && P < m.length;
      P++
    ) {
      z.index > P ? ((L = z), (z = null)) : (L = z.sibling);
      var b = g(h, z, m[P], w);
      if (b === null) {
        z === null && (z = L);
        break;
      }
      (e && z && b.alternate === null && t(h, z),
        (f = o(b, f, P)),
        R === null ? (C = b) : (R.sibling = b),
        (R = b),
        (z = L));
    }
    if (P === m.length) return (n(h, z), ie && pn(h, P), C);
    if (z === null) {
      for (; P < m.length; P++)
        ((z = p(h, m[P], w)),
          z !== null &&
            ((f = o(z, f, P)),
            R === null ? (C = z) : (R.sibling = z),
            (R = z)));
      return (ie && pn(h, P), C);
    }
    for (z = r(h, z); P < m.length; P++)
      ((L = k(z, h, P, m[P], w)),
        L !== null &&
          (e && L.alternate !== null && z.delete(L.key === null ? P : L.key),
          (f = o(L, f, P)),
          R === null ? (C = L) : (R.sibling = L),
          (R = L)));
    return (
      e &&
        z.forEach(function (A) {
          return t(h, A);
        }),
      ie && pn(h, P),
      C
    );
  }
  function _(h, f, m, w) {
    var C = hr(m);
    if (typeof C != "function") throw Error(I(150));
    if (((m = C.call(m)), m == null)) throw Error(I(151));
    for (
      var R = (C = null), z = f, P = (f = 0), L = null, b = m.next();
      z !== null && !b.done;
      P++, b = m.next()
    ) {
      z.index > P ? ((L = z), (z = null)) : (L = z.sibling);
      var A = g(h, z, b.value, w);
      if (A === null) {
        z === null && (z = L);
        break;
      }
      (e && z && A.alternate === null && t(h, z),
        (f = o(A, f, P)),
        R === null ? (C = A) : (R.sibling = A),
        (R = A),
        (z = L));
    }
    if (b.done) return (n(h, z), ie && pn(h, P), C);
    if (z === null) {
      for (; !b.done; P++, b = m.next())
        ((b = p(h, b.value, w)),
          b !== null &&
            ((f = o(b, f, P)),
            R === null ? (C = b) : (R.sibling = b),
            (R = b)));
      return (ie && pn(h, P), C);
    }
    for (z = r(h, z); !b.done; P++, b = m.next())
      ((b = k(z, h, P, b.value, w)),
        b !== null &&
          (e && b.alternate !== null && z.delete(b.key === null ? P : b.key),
          (f = o(b, f, P)),
          R === null ? (C = b) : (R.sibling = b),
          (R = b)));
    return (
      e &&
        z.forEach(function (F) {
          return t(h, F);
        }),
      ie && pn(h, P),
      C
    );
  }
  function S(h, f, m, w) {
    if (
      (typeof m == "object" &&
        m !== null &&
        m.type === Ln &&
        m.key === null &&
        (m = m.props.children),
      typeof m == "object" && m !== null)
    ) {
      switch (m.$$typeof) {
        case xi:
          e: {
            for (var C = m.key, R = f; R !== null; ) {
              if (R.key === C) {
                if (((C = m.type), C === Ln)) {
                  if (R.tag === 7) {
                    (n(h, R.sibling),
                      (f = i(R, m.props.children)),
                      (f.return = h),
                      (h = f));
                    break e;
                  }
                } else if (
                  R.elementType === C ||
                  (typeof C == "object" &&
                    C !== null &&
                    C.$$typeof === $t &&
                    zu(C) === R.type)
                ) {
                  (n(h, R.sibling),
                    (f = i(R, m.props)),
                    (f.ref = yr(h, R, m)),
                    (f.return = h),
                    (h = f));
                  break e;
                }
                n(h, R);
                break;
              } else t(h, R);
              R = R.sibling;
            }
            m.type === Ln
              ? ((f = yn(m.props.children, h.mode, w, m.key)),
                (f.return = h),
                (h = f))
              : ((w = qi(m.type, m.key, m.props, null, h.mode, w)),
                (w.ref = yr(h, f, m)),
                (w.return = h),
                (h = w));
          }
          return s(h);
        case In:
          e: {
            for (R = m.key; f !== null; ) {
              if (f.key === R)
                if (
                  f.tag === 4 &&
                  f.stateNode.containerInfo === m.containerInfo &&
                  f.stateNode.implementation === m.implementation
                ) {
                  (n(h, f.sibling),
                    (f = i(f, m.children || [])),
                    (f.return = h),
                    (h = f));
                  break e;
                } else {
                  n(h, f);
                  break;
                }
              else t(h, f);
              f = f.sibling;
            }
            ((f = wl(m, h.mode, w)), (f.return = h), (h = f));
          }
          return s(h);
        case $t:
          return ((R = m._init), S(h, f, R(m._payload), w));
      }
      if (Rr(m)) return x(h, f, m, w);
      if (hr(m)) return _(h, f, m, w);
      Ri(h, m);
    }
    return (typeof m == "string" && m !== "") || typeof m == "number"
      ? ((m = "" + m),
        f !== null && f.tag === 6
          ? (n(h, f.sibling), (f = i(f, m)), (f.return = h), (h = f))
          : (n(h, f), (f = _l(m, h.mode, w)), (f.return = h), (h = f)),
        s(h))
      : n(h, f);
  }
  return S;
}
var er = Vd(!0),
  Kd = Vd(!1),
  ho = rn(null),
  go = null,
  Wn = null,
  na = null;
function ra() {
  na = Wn = go = null;
}
function ia(e) {
  var t = ho.current;
  (re(ho), (e._currentValue = t));
}
function is(e, t, n) {
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
function Yn(e, t) {
  ((go = e),
    (na = Wn = null),
    (e = e.dependencies),
    e !== null &&
      e.firstContext !== null &&
      (e.lanes & t && ($e = !0), (e.firstContext = null)));
}
function nt(e) {
  var t = e._currentValue;
  if (na !== e)
    if (((e = { context: e, memoizedValue: t, next: null }), Wn === null)) {
      if (go === null) throw Error(I(308));
      ((Wn = e), (go.dependencies = { lanes: 0, firstContext: e }));
    } else Wn = Wn.next = e;
  return t;
}
var mn = null;
function oa(e) {
  mn === null ? (mn = [e]) : mn.push(e);
}
function Jd(e, t, n, r) {
  var i = t.interleaved;
  return (
    i === null ? ((n.next = n), oa(t)) : ((n.next = i.next), (i.next = n)),
    (t.interleaved = n),
    Tt(e, r)
  );
}
function Tt(e, t) {
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
var At = !1;
function la(e) {
  e.updateQueue = {
    baseState: e.memoizedState,
    firstBaseUpdate: null,
    lastBaseUpdate: null,
    shared: { pending: null, interleaved: null, lanes: 0 },
    effects: null,
  };
}
function Qd(e, t) {
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
function zt(e, t) {
  return {
    eventTime: e,
    lane: t,
    tag: 0,
    payload: null,
    callback: null,
    next: null,
  };
}
function Yt(e, t, n) {
  var r = e.updateQueue;
  if (r === null) return null;
  if (((r = r.shared), Y & 2)) {
    var i = r.pending;
    return (
      i === null ? (t.next = t) : ((t.next = i.next), (i.next = t)),
      (r.pending = t),
      Tt(e, n)
    );
  }
  return (
    (i = r.interleaved),
    i === null ? ((t.next = t), oa(r)) : ((t.next = i.next), (i.next = t)),
    (r.interleaved = t),
    Tt(e, n)
  );
}
function Ji(e, t, n) {
  if (
    ((t = t.updateQueue), t !== null && ((t = t.shared), (n & 4194240) !== 0))
  ) {
    var r = t.lanes;
    ((r &= e.pendingLanes), (n |= r), (t.lanes = n), Vs(e, n));
  }
}
function Ru(e, t) {
  var n = e.updateQueue,
    r = e.alternate;
  if (r !== null && ((r = r.updateQueue), n === r)) {
    var i = null,
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
        (o === null ? (i = o = s) : (o = o.next = s), (n = n.next));
      } while (n !== null);
      o === null ? (i = o = t) : (o = o.next = t);
    } else i = o = t;
    ((n = {
      baseState: r.baseState,
      firstBaseUpdate: i,
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
function mo(e, t, n, r) {
  var i = e.updateQueue;
  At = !1;
  var o = i.firstBaseUpdate,
    s = i.lastBaseUpdate,
    a = i.shared.pending;
  if (a !== null) {
    i.shared.pending = null;
    var u = a,
      c = u.next;
    ((u.next = null), s === null ? (o = c) : (s.next = c), (s = u));
    var d = e.alternate;
    d !== null &&
      ((d = d.updateQueue),
      (a = d.lastBaseUpdate),
      a !== s &&
        (a === null ? (d.firstBaseUpdate = c) : (a.next = c),
        (d.lastBaseUpdate = u)));
  }
  if (o !== null) {
    var p = i.baseState;
    ((s = 0), (d = c = u = null), (a = o));
    do {
      var g = a.lane,
        k = a.eventTime;
      if ((r & g) === g) {
        d !== null &&
          (d = d.next =
            {
              eventTime: k,
              lane: 0,
              tag: a.tag,
              payload: a.payload,
              callback: a.callback,
              next: null,
            });
        e: {
          var x = e,
            _ = a;
          switch (((g = t), (k = n), _.tag)) {
            case 1:
              if (((x = _.payload), typeof x == "function")) {
                p = x.call(k, p, g);
                break e;
              }
              p = x;
              break e;
            case 3:
              x.flags = (x.flags & -65537) | 128;
            case 0:
              if (
                ((x = _.payload),
                (g = typeof x == "function" ? x.call(k, p, g) : x),
                g == null)
              )
                break e;
              p = ue({}, p, g);
              break e;
            case 2:
              At = !0;
          }
        }
        a.callback !== null &&
          a.lane !== 0 &&
          ((e.flags |= 64),
          (g = i.effects),
          g === null ? (i.effects = [a]) : g.push(a));
      } else
        ((k = {
          eventTime: k,
          lane: g,
          tag: a.tag,
          payload: a.payload,
          callback: a.callback,
          next: null,
        }),
          d === null ? ((c = d = k), (u = p)) : (d = d.next = k),
          (s |= g));
      if (((a = a.next), a === null)) {
        if (((a = i.shared.pending), a === null)) break;
        ((g = a),
          (a = g.next),
          (g.next = null),
          (i.lastBaseUpdate = g),
          (i.shared.pending = null));
      }
    } while (!0);
    if (
      (d === null && (u = p),
      (i.baseState = u),
      (i.firstBaseUpdate = c),
      (i.lastBaseUpdate = d),
      (t = i.shared.interleaved),
      t !== null)
    ) {
      i = t;
      do ((s |= i.lane), (i = i.next));
      while (i !== t);
    } else o === null && (i.shared.lanes = 0);
    ((kn |= s), (e.lanes = s), (e.memoizedState = p));
  }
}
function Pu(e, t, n) {
  if (((e = t.effects), (t.effects = null), e !== null))
    for (t = 0; t < e.length; t++) {
      var r = e[t],
        i = r.callback;
      if (i !== null) {
        if (((r.callback = null), (r = n), typeof i != "function"))
          throw Error(I(191, i));
        i.call(r);
      }
    }
}
var hi = {},
  St = rn(hi),
  ei = rn(hi),
  ti = rn(hi);
function vn(e) {
  if (e === hi) throw Error(I(174));
  return e;
}
function sa(e, t) {
  switch ((ee(ti, t), ee(ei, e), ee(St, hi), (e = t.nodeType), e)) {
    case 9:
    case 11:
      t = (t = t.documentElement) ? t.namespaceURI : $l(null, "");
      break;
    default:
      ((e = e === 8 ? t.parentNode : t),
        (t = e.namespaceURI || null),
        (e = e.tagName),
        (t = $l(t, e)));
  }
  (re(St), ee(St, t));
}
function tr() {
  (re(St), re(ei), re(ti));
}
function Yd(e) {
  vn(ti.current);
  var t = vn(St.current),
    n = $l(t, e.type);
  t !== n && (ee(ei, e), ee(St, n));
}
function aa(e) {
  ei.current === e && (re(St), re(ei));
}
var le = rn(0);
function vo(e) {
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
var gl = [];
function ua() {
  for (var e = 0; e < gl.length; e++)
    gl[e]._workInProgressVersionPrimary = null;
  gl.length = 0;
}
var Qi = It.ReactCurrentDispatcher,
  ml = It.ReactCurrentBatchConfig,
  wn = 0,
  se = null,
  ve = null,
  Se = null,
  xo = !1,
  $r = !1,
  ni = 0,
  kg = 0;
function ze() {
  throw Error(I(321));
}
function ca(e, t) {
  if (t === null) return !1;
  for (var n = 0; n < t.length && n < e.length; n++)
    if (!ft(e[n], t[n])) return !1;
  return !0;
}
function da(e, t, n, r, i, o) {
  if (
    ((wn = o),
    (se = t),
    (t.memoizedState = null),
    (t.updateQueue = null),
    (t.lanes = 0),
    (Qi.current = e === null || e.memoizedState === null ? Eg : zg),
    (e = n(r, i)),
    $r)
  ) {
    o = 0;
    do {
      if ((($r = !1), (ni = 0), 25 <= o)) throw Error(I(301));
      ((o += 1),
        (Se = ve = null),
        (t.updateQueue = null),
        (Qi.current = Rg),
        (e = n(r, i)));
    } while ($r);
  }
  if (
    ((Qi.current = yo),
    (t = ve !== null && ve.next !== null),
    (wn = 0),
    (Se = ve = se = null),
    (xo = !1),
    t)
  )
    throw Error(I(300));
  return e;
}
function fa() {
  var e = ni !== 0;
  return ((ni = 0), e);
}
function mt() {
  var e = {
    memoizedState: null,
    baseState: null,
    baseQueue: null,
    queue: null,
    next: null,
  };
  return (Se === null ? (se.memoizedState = Se = e) : (Se = Se.next = e), Se);
}
function rt() {
  if (ve === null) {
    var e = se.alternate;
    e = e !== null ? e.memoizedState : null;
  } else e = ve.next;
  var t = Se === null ? se.memoizedState : Se.next;
  if (t !== null) ((Se = t), (ve = e));
  else {
    if (e === null) throw Error(I(310));
    ((ve = e),
      (e = {
        memoizedState: ve.memoizedState,
        baseState: ve.baseState,
        baseQueue: ve.baseQueue,
        queue: ve.queue,
        next: null,
      }),
      Se === null ? (se.memoizedState = Se = e) : (Se = Se.next = e));
  }
  return Se;
}
function ri(e, t) {
  return typeof t == "function" ? t(e) : t;
}
function vl(e) {
  var t = rt(),
    n = t.queue;
  if (n === null) throw Error(I(311));
  n.lastRenderedReducer = e;
  var r = ve,
    i = r.baseQueue,
    o = n.pending;
  if (o !== null) {
    if (i !== null) {
      var s = i.next;
      ((i.next = o.next), (o.next = s));
    }
    ((r.baseQueue = i = o), (n.pending = null));
  }
  if (i !== null) {
    ((o = i.next), (r = r.baseState));
    var a = (s = null),
      u = null,
      c = o;
    do {
      var d = c.lane;
      if ((wn & d) === d)
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
        var p = {
          lane: d,
          action: c.action,
          hasEagerState: c.hasEagerState,
          eagerState: c.eagerState,
          next: null,
        };
        (u === null ? ((a = u = p), (s = r)) : (u = u.next = p),
          (se.lanes |= d),
          (kn |= d));
      }
      c = c.next;
    } while (c !== null && c !== o);
    (u === null ? (s = r) : (u.next = a),
      ft(r, t.memoizedState) || ($e = !0),
      (t.memoizedState = r),
      (t.baseState = s),
      (t.baseQueue = u),
      (n.lastRenderedState = r));
  }
  if (((e = n.interleaved), e !== null)) {
    i = e;
    do ((o = i.lane), (se.lanes |= o), (kn |= o), (i = i.next));
    while (i !== e);
  } else i === null && (n.lanes = 0);
  return [t.memoizedState, n.dispatch];
}
function xl(e) {
  var t = rt(),
    n = t.queue;
  if (n === null) throw Error(I(311));
  n.lastRenderedReducer = e;
  var r = n.dispatch,
    i = n.pending,
    o = t.memoizedState;
  if (i !== null) {
    n.pending = null;
    var s = (i = i.next);
    do ((o = e(o, s.action)), (s = s.next));
    while (s !== i);
    (ft(o, t.memoizedState) || ($e = !0),
      (t.memoizedState = o),
      t.baseQueue === null && (t.baseState = o),
      (n.lastRenderedState = o));
  }
  return [o, r];
}
function Gd() {}
function Xd(e, t) {
  var n = se,
    r = rt(),
    i = t(),
    o = !ft(r.memoizedState, i);
  if (
    (o && ((r.memoizedState = i), ($e = !0)),
    (r = r.queue),
    pa(ef.bind(null, n, r, e), [e]),
    r.getSnapshot !== t || o || (Se !== null && Se.memoizedState.tag & 1))
  ) {
    if (
      ((n.flags |= 2048),
      ii(9, qd.bind(null, n, r, i, t), void 0, null),
      _e === null)
    )
      throw Error(I(349));
    wn & 30 || Zd(n, t, i);
  }
  return i;
}
function Zd(e, t, n) {
  ((e.flags |= 16384),
    (e = { getSnapshot: t, value: n }),
    (t = se.updateQueue),
    t === null
      ? ((t = { lastEffect: null, stores: null }),
        (se.updateQueue = t),
        (t.stores = [e]))
      : ((n = t.stores), n === null ? (t.stores = [e]) : n.push(e)));
}
function qd(e, t, n, r) {
  ((t.value = n), (t.getSnapshot = r), tf(t) && nf(e));
}
function ef(e, t, n) {
  return n(function () {
    tf(t) && nf(e);
  });
}
function tf(e) {
  var t = e.getSnapshot;
  e = e.value;
  try {
    var n = t();
    return !ft(e, n);
  } catch {
    return !0;
  }
}
function nf(e) {
  var t = Tt(e, 1);
  t !== null && dt(t, e, 1, -1);
}
function Tu(e) {
  var t = mt();
  return (
    typeof e == "function" && (e = e()),
    (t.memoizedState = t.baseState = e),
    (e = {
      pending: null,
      interleaved: null,
      lanes: 0,
      dispatch: null,
      lastRenderedReducer: ri,
      lastRenderedState: e,
    }),
    (t.queue = e),
    (e = e.dispatch = Cg.bind(null, se, e)),
    [t.memoizedState, e]
  );
}
function ii(e, t, n, r) {
  return (
    (e = { tag: e, create: t, destroy: n, deps: r, next: null }),
    (t = se.updateQueue),
    t === null
      ? ((t = { lastEffect: null, stores: null }),
        (se.updateQueue = t),
        (t.lastEffect = e.next = e))
      : ((n = t.lastEffect),
        n === null
          ? (t.lastEffect = e.next = e)
          : ((r = n.next), (n.next = e), (e.next = r), (t.lastEffect = e))),
    e
  );
}
function rf() {
  return rt().memoizedState;
}
function Yi(e, t, n, r) {
  var i = mt();
  ((se.flags |= e),
    (i.memoizedState = ii(1 | t, n, void 0, r === void 0 ? null : r)));
}
function No(e, t, n, r) {
  var i = rt();
  r = r === void 0 ? null : r;
  var o = void 0;
  if (ve !== null) {
    var s = ve.memoizedState;
    if (((o = s.destroy), r !== null && ca(r, s.deps))) {
      i.memoizedState = ii(t, n, o, r);
      return;
    }
  }
  ((se.flags |= e), (i.memoizedState = ii(1 | t, n, o, r)));
}
function Mu(e, t) {
  return Yi(8390656, 8, e, t);
}
function pa(e, t) {
  return No(2048, 8, e, t);
}
function of(e, t) {
  return No(4, 2, e, t);
}
function lf(e, t) {
  return No(4, 4, e, t);
}
function sf(e, t) {
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
function af(e, t, n) {
  return (
    (n = n != null ? n.concat([e]) : null),
    No(4, 4, sf.bind(null, t, e), n)
  );
}
function ha() {}
function uf(e, t) {
  var n = rt();
  t = t === void 0 ? null : t;
  var r = n.memoizedState;
  return r !== null && t !== null && ca(t, r[1])
    ? r[0]
    : ((n.memoizedState = [e, t]), e);
}
function cf(e, t) {
  var n = rt();
  t = t === void 0 ? null : t;
  var r = n.memoizedState;
  return r !== null && t !== null && ca(t, r[1])
    ? r[0]
    : ((e = e()), (n.memoizedState = [e, t]), e);
}
function df(e, t, n) {
  return wn & 21
    ? (ft(n, t) || ((n = gd()), (se.lanes |= n), (kn |= n), (e.baseState = !0)),
      t)
    : (e.baseState && ((e.baseState = !1), ($e = !0)), (e.memoizedState = n));
}
function jg(e, t) {
  var n = X;
  ((X = n !== 0 && 4 > n ? n : 4), e(!0));
  var r = ml.transition;
  ml.transition = {};
  try {
    (e(!1), t());
  } finally {
    ((X = n), (ml.transition = r));
  }
}
function ff() {
  return rt().memoizedState;
}
function bg(e, t, n) {
  var r = Xt(e);
  if (
    ((n = {
      lane: r,
      action: n,
      hasEagerState: !1,
      eagerState: null,
      next: null,
    }),
    pf(e))
  )
    hf(t, n);
  else if (((n = Jd(e, t, n, r)), n !== null)) {
    var i = Ie();
    (dt(n, e, r, i), gf(n, t, r));
  }
}
function Cg(e, t, n) {
  var r = Xt(e),
    i = { lane: r, action: n, hasEagerState: !1, eagerState: null, next: null };
  if (pf(e)) hf(t, i);
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
        if (((i.hasEagerState = !0), (i.eagerState = a), ft(a, s))) {
          var u = t.interleaved;
          (u === null
            ? ((i.next = i), oa(t))
            : ((i.next = u.next), (u.next = i)),
            (t.interleaved = i));
          return;
        }
      } catch {
      } finally {
      }
    ((n = Jd(e, t, i, r)),
      n !== null && ((i = Ie()), dt(n, e, r, i), gf(n, t, r)));
  }
}
function pf(e) {
  var t = e.alternate;
  return e === se || (t !== null && t === se);
}
function hf(e, t) {
  $r = xo = !0;
  var n = e.pending;
  (n === null ? (t.next = t) : ((t.next = n.next), (n.next = t)),
    (e.pending = t));
}
function gf(e, t, n) {
  if (n & 4194240) {
    var r = t.lanes;
    ((r &= e.pendingLanes), (n |= r), (t.lanes = n), Vs(e, n));
  }
}
var yo = {
    readContext: nt,
    useCallback: ze,
    useContext: ze,
    useEffect: ze,
    useImperativeHandle: ze,
    useInsertionEffect: ze,
    useLayoutEffect: ze,
    useMemo: ze,
    useReducer: ze,
    useRef: ze,
    useState: ze,
    useDebugValue: ze,
    useDeferredValue: ze,
    useTransition: ze,
    useMutableSource: ze,
    useSyncExternalStore: ze,
    useId: ze,
    unstable_isNewReconciler: !1,
  },
  Eg = {
    readContext: nt,
    useCallback: function (e, t) {
      return ((mt().memoizedState = [e, t === void 0 ? null : t]), e);
    },
    useContext: nt,
    useEffect: Mu,
    useImperativeHandle: function (e, t, n) {
      return (
        (n = n != null ? n.concat([e]) : null),
        Yi(4194308, 4, sf.bind(null, t, e), n)
      );
    },
    useLayoutEffect: function (e, t) {
      return Yi(4194308, 4, e, t);
    },
    useInsertionEffect: function (e, t) {
      return Yi(4, 2, e, t);
    },
    useMemo: function (e, t) {
      var n = mt();
      return (
        (t = t === void 0 ? null : t),
        (e = e()),
        (n.memoizedState = [e, t]),
        e
      );
    },
    useReducer: function (e, t, n) {
      var r = mt();
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
        (e = e.dispatch = bg.bind(null, se, e)),
        [r.memoizedState, e]
      );
    },
    useRef: function (e) {
      var t = mt();
      return ((e = { current: e }), (t.memoizedState = e));
    },
    useState: Tu,
    useDebugValue: ha,
    useDeferredValue: function (e) {
      return (mt().memoizedState = e);
    },
    useTransition: function () {
      var e = Tu(!1),
        t = e[0];
      return ((e = jg.bind(null, e[1])), (mt().memoizedState = e), [t, e]);
    },
    useMutableSource: function () {},
    useSyncExternalStore: function (e, t, n) {
      var r = se,
        i = mt();
      if (ie) {
        if (n === void 0) throw Error(I(407));
        n = n();
      } else {
        if (((n = t()), _e === null)) throw Error(I(349));
        wn & 30 || Zd(r, t, n);
      }
      i.memoizedState = n;
      var o = { value: n, getSnapshot: t };
      return (
        (i.queue = o),
        Mu(ef.bind(null, r, o, e), [e]),
        (r.flags |= 2048),
        ii(9, qd.bind(null, r, o, n, t), void 0, null),
        n
      );
    },
    useId: function () {
      var e = mt(),
        t = _e.identifierPrefix;
      if (ie) {
        var n = Et,
          r = Ct;
        ((n = (r & ~(1 << (32 - ct(r) - 1))).toString(32) + n),
          (t = ":" + t + "R" + n),
          (n = ni++),
          0 < n && (t += "H" + n.toString(32)),
          (t += ":"));
      } else ((n = kg++), (t = ":" + t + "r" + n.toString(32) + ":"));
      return (e.memoizedState = t);
    },
    unstable_isNewReconciler: !1,
  },
  zg = {
    readContext: nt,
    useCallback: uf,
    useContext: nt,
    useEffect: pa,
    useImperativeHandle: af,
    useInsertionEffect: of,
    useLayoutEffect: lf,
    useMemo: cf,
    useReducer: vl,
    useRef: rf,
    useState: function () {
      return vl(ri);
    },
    useDebugValue: ha,
    useDeferredValue: function (e) {
      var t = rt();
      return df(t, ve.memoizedState, e);
    },
    useTransition: function () {
      var e = vl(ri)[0],
        t = rt().memoizedState;
      return [e, t];
    },
    useMutableSource: Gd,
    useSyncExternalStore: Xd,
    useId: ff,
    unstable_isNewReconciler: !1,
  },
  Rg = {
    readContext: nt,
    useCallback: uf,
    useContext: nt,
    useEffect: pa,
    useImperativeHandle: af,
    useInsertionEffect: of,
    useLayoutEffect: lf,
    useMemo: cf,
    useReducer: xl,
    useRef: rf,
    useState: function () {
      return xl(ri);
    },
    useDebugValue: ha,
    useDeferredValue: function (e) {
      var t = rt();
      return ve === null ? (t.memoizedState = e) : df(t, ve.memoizedState, e);
    },
    useTransition: function () {
      var e = xl(ri)[0],
        t = rt().memoizedState;
      return [e, t];
    },
    useMutableSource: Gd,
    useSyncExternalStore: Xd,
    useId: ff,
    unstable_isNewReconciler: !1,
  };
function lt(e, t) {
  if (e && e.defaultProps) {
    ((t = ue({}, t)), (e = e.defaultProps));
    for (var n in e) t[n] === void 0 && (t[n] = e[n]);
    return t;
  }
  return t;
}
function os(e, t, n, r) {
  ((t = e.memoizedState),
    (n = n(r, t)),
    (n = n == null ? t : ue({}, t, n)),
    (e.memoizedState = n),
    e.lanes === 0 && (e.updateQueue.baseState = n));
}
var Oo = {
  isMounted: function (e) {
    return (e = e._reactInternals) ? En(e) === e : !1;
  },
  enqueueSetState: function (e, t, n) {
    e = e._reactInternals;
    var r = Ie(),
      i = Xt(e),
      o = zt(r, i);
    ((o.payload = t),
      n != null && (o.callback = n),
      (t = Yt(e, o, i)),
      t !== null && (dt(t, e, i, r), Ji(t, e, i)));
  },
  enqueueReplaceState: function (e, t, n) {
    e = e._reactInternals;
    var r = Ie(),
      i = Xt(e),
      o = zt(r, i);
    ((o.tag = 1),
      (o.payload = t),
      n != null && (o.callback = n),
      (t = Yt(e, o, i)),
      t !== null && (dt(t, e, i, r), Ji(t, e, i)));
  },
  enqueueForceUpdate: function (e, t) {
    e = e._reactInternals;
    var n = Ie(),
      r = Xt(e),
      i = zt(n, r);
    ((i.tag = 2),
      t != null && (i.callback = t),
      (t = Yt(e, i, r)),
      t !== null && (dt(t, e, r, n), Ji(t, e, r)));
  },
};
function Iu(e, t, n, r, i, o, s) {
  return (
    (e = e.stateNode),
    typeof e.shouldComponentUpdate == "function"
      ? e.shouldComponentUpdate(r, o, s)
      : t.prototype && t.prototype.isPureReactComponent
        ? !Gr(n, r) || !Gr(i, o)
        : !0
  );
}
function mf(e, t, n) {
  var r = !1,
    i = tn,
    o = t.contextType;
  return (
    typeof o == "object" && o !== null
      ? (o = nt(o))
      : ((i = Be(t) ? Sn : Te.current),
        (r = t.contextTypes),
        (o = (r = r != null) ? Zn(e, i) : tn)),
    (t = new t(n, o)),
    (e.memoizedState = t.state !== null && t.state !== void 0 ? t.state : null),
    (t.updater = Oo),
    (e.stateNode = t),
    (t._reactInternals = e),
    r &&
      ((e = e.stateNode),
      (e.__reactInternalMemoizedUnmaskedChildContext = i),
      (e.__reactInternalMemoizedMaskedChildContext = o)),
    t
  );
}
function Lu(e, t, n, r) {
  ((e = t.state),
    typeof t.componentWillReceiveProps == "function" &&
      t.componentWillReceiveProps(n, r),
    typeof t.UNSAFE_componentWillReceiveProps == "function" &&
      t.UNSAFE_componentWillReceiveProps(n, r),
    t.state !== e && Oo.enqueueReplaceState(t, t.state, null));
}
function ls(e, t, n, r) {
  var i = e.stateNode;
  ((i.props = n), (i.state = e.memoizedState), (i.refs = {}), la(e));
  var o = t.contextType;
  (typeof o == "object" && o !== null
    ? (i.context = nt(o))
    : ((o = Be(t) ? Sn : Te.current), (i.context = Zn(e, o))),
    (i.state = e.memoizedState),
    (o = t.getDerivedStateFromProps),
    typeof o == "function" && (os(e, t, o, n), (i.state = e.memoizedState)),
    typeof t.getDerivedStateFromProps == "function" ||
      typeof i.getSnapshotBeforeUpdate == "function" ||
      (typeof i.UNSAFE_componentWillMount != "function" &&
        typeof i.componentWillMount != "function") ||
      ((t = i.state),
      typeof i.componentWillMount == "function" && i.componentWillMount(),
      typeof i.UNSAFE_componentWillMount == "function" &&
        i.UNSAFE_componentWillMount(),
      t !== i.state && Oo.enqueueReplaceState(i, i.state, null),
      mo(e, n, i, r),
      (i.state = e.memoizedState)),
    typeof i.componentDidMount == "function" && (e.flags |= 4194308));
}
function nr(e, t) {
  try {
    var n = "",
      r = t;
    do ((n += rh(r)), (r = r.return));
    while (r);
    var i = n;
  } catch (o) {
    i =
      `
Error generating stack: ` +
      o.message +
      `
` +
      o.stack;
  }
  return { value: e, source: t, stack: i, digest: null };
}
function yl(e, t, n) {
  return { value: e, source: null, stack: n ?? null, digest: t ?? null };
}
function ss(e, t) {
  try {
    console.error(t.value);
  } catch (n) {
    setTimeout(function () {
      throw n;
    });
  }
}
var Pg = typeof WeakMap == "function" ? WeakMap : Map;
function vf(e, t, n) {
  ((n = zt(-1, n)), (n.tag = 3), (n.payload = { element: null }));
  var r = t.value;
  return (
    (n.callback = function () {
      (_o || ((_o = !0), (vs = r)), ss(e, t));
    }),
    n
  );
}
function xf(e, t, n) {
  ((n = zt(-1, n)), (n.tag = 3));
  var r = e.type.getDerivedStateFromError;
  if (typeof r == "function") {
    var i = t.value;
    ((n.payload = function () {
      return r(i);
    }),
      (n.callback = function () {
        ss(e, t);
      }));
  }
  var o = e.stateNode;
  return (
    o !== null &&
      typeof o.componentDidCatch == "function" &&
      (n.callback = function () {
        (ss(e, t),
          typeof r != "function" &&
            (Gt === null ? (Gt = new Set([this])) : Gt.add(this)));
        var s = t.stack;
        this.componentDidCatch(t.value, {
          componentStack: s !== null ? s : "",
        });
      }),
    n
  );
}
function Nu(e, t, n) {
  var r = e.pingCache;
  if (r === null) {
    r = e.pingCache = new Pg();
    var i = new Set();
    r.set(t, i);
  } else ((i = r.get(t)), i === void 0 && ((i = new Set()), r.set(t, i)));
  i.has(n) || (i.add(n), (e = Hg.bind(null, e, t, n)), t.then(e, e));
}
function Ou(e) {
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
function Du(e, t, n, r, i) {
  return e.mode & 1
    ? ((e.flags |= 65536), (e.lanes = i), e)
    : (e === t
        ? (e.flags |= 65536)
        : ((e.flags |= 128),
          (n.flags |= 131072),
          (n.flags &= -52805),
          n.tag === 1 &&
            (n.alternate === null
              ? (n.tag = 17)
              : ((t = zt(-1, 1)), (t.tag = 2), Yt(n, t, 1))),
          (n.lanes |= 1)),
      e);
}
var Tg = It.ReactCurrentOwner,
  $e = !1;
function Me(e, t, n, r) {
  t.child = e === null ? Kd(t, null, n, r) : er(t, e.child, n, r);
}
function $u(e, t, n, r, i) {
  n = n.render;
  var o = t.ref;
  return (
    Yn(t, i),
    (r = da(e, t, n, r, o, i)),
    (n = fa()),
    e !== null && !$e
      ? ((t.updateQueue = e.updateQueue),
        (t.flags &= -2053),
        (e.lanes &= ~i),
        Mt(e, t, i))
      : (ie && n && qs(t), (t.flags |= 1), Me(e, t, r, i), t.child)
  );
}
function Au(e, t, n, r, i) {
  if (e === null) {
    var o = n.type;
    return typeof o == "function" &&
      !wa(o) &&
      o.defaultProps === void 0 &&
      n.compare === null &&
      n.defaultProps === void 0
      ? ((t.tag = 15), (t.type = o), yf(e, t, o, r, i))
      : ((e = qi(n.type, null, r, t, t.mode, i)),
        (e.ref = t.ref),
        (e.return = t),
        (t.child = e));
  }
  if (((o = e.child), !(e.lanes & i))) {
    var s = o.memoizedProps;
    if (
      ((n = n.compare), (n = n !== null ? n : Gr), n(s, r) && e.ref === t.ref)
    )
      return Mt(e, t, i);
  }
  return (
    (t.flags |= 1),
    (e = Zt(o, r)),
    (e.ref = t.ref),
    (e.return = t),
    (t.child = e)
  );
}
function yf(e, t, n, r, i) {
  if (e !== null) {
    var o = e.memoizedProps;
    if (Gr(o, r) && e.ref === t.ref)
      if ((($e = !1), (t.pendingProps = r = o), (e.lanes & i) !== 0))
        e.flags & 131072 && ($e = !0);
      else return ((t.lanes = e.lanes), Mt(e, t, i));
  }
  return as(e, t, n, r, i);
}
function Sf(e, t, n) {
  var r = t.pendingProps,
    i = r.children,
    o = e !== null ? e.memoizedState : null;
  if (r.mode === "hidden")
    if (!(t.mode & 1))
      ((t.memoizedState = { baseLanes: 0, cachePool: null, transitions: null }),
        ee(Hn, Ve),
        (Ve |= n));
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
          ee(Hn, Ve),
          (Ve |= e),
          null
        );
      ((t.memoizedState = { baseLanes: 0, cachePool: null, transitions: null }),
        (r = o !== null ? o.baseLanes : n),
        ee(Hn, Ve),
        (Ve |= r));
    }
  else
    (o !== null ? ((r = o.baseLanes | n), (t.memoizedState = null)) : (r = n),
      ee(Hn, Ve),
      (Ve |= r));
  return (Me(e, t, i, n), t.child);
}
function _f(e, t) {
  var n = t.ref;
  ((e === null && n !== null) || (e !== null && e.ref !== n)) &&
    ((t.flags |= 512), (t.flags |= 2097152));
}
function as(e, t, n, r, i) {
  var o = Be(n) ? Sn : Te.current;
  return (
    (o = Zn(t, o)),
    Yn(t, i),
    (n = da(e, t, n, r, o, i)),
    (r = fa()),
    e !== null && !$e
      ? ((t.updateQueue = e.updateQueue),
        (t.flags &= -2053),
        (e.lanes &= ~i),
        Mt(e, t, i))
      : (ie && r && qs(t), (t.flags |= 1), Me(e, t, n, i), t.child)
  );
}
function Fu(e, t, n, r, i) {
  if (Be(n)) {
    var o = !0;
    co(t);
  } else o = !1;
  if ((Yn(t, i), t.stateNode === null))
    (Gi(e, t), mf(t, n, r), ls(t, n, r, i), (r = !0));
  else if (e === null) {
    var s = t.stateNode,
      a = t.memoizedProps;
    s.props = a;
    var u = s.context,
      c = n.contextType;
    typeof c == "object" && c !== null
      ? (c = nt(c))
      : ((c = Be(n) ? Sn : Te.current), (c = Zn(t, c)));
    var d = n.getDerivedStateFromProps,
      p =
        typeof d == "function" ||
        typeof s.getSnapshotBeforeUpdate == "function";
    (p ||
      (typeof s.UNSAFE_componentWillReceiveProps != "function" &&
        typeof s.componentWillReceiveProps != "function") ||
      ((a !== r || u !== c) && Lu(t, s, r, c)),
      (At = !1));
    var g = t.memoizedState;
    ((s.state = g),
      mo(t, r, s, i),
      (u = t.memoizedState),
      a !== r || g !== u || Fe.current || At
        ? (typeof d == "function" && (os(t, n, d, r), (u = t.memoizedState)),
          (a = At || Iu(t, n, a, r, g, u, c))
            ? (p ||
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
      Qd(e, t),
      (a = t.memoizedProps),
      (c = t.type === t.elementType ? a : lt(t.type, a)),
      (s.props = c),
      (p = t.pendingProps),
      (g = s.context),
      (u = n.contextType),
      typeof u == "object" && u !== null
        ? (u = nt(u))
        : ((u = Be(n) ? Sn : Te.current), (u = Zn(t, u))));
    var k = n.getDerivedStateFromProps;
    ((d =
      typeof k == "function" ||
      typeof s.getSnapshotBeforeUpdate == "function") ||
      (typeof s.UNSAFE_componentWillReceiveProps != "function" &&
        typeof s.componentWillReceiveProps != "function") ||
      ((a !== p || g !== u) && Lu(t, s, r, u)),
      (At = !1),
      (g = t.memoizedState),
      (s.state = g),
      mo(t, r, s, i));
    var x = t.memoizedState;
    a !== p || g !== x || Fe.current || At
      ? (typeof k == "function" && (os(t, n, k, r), (x = t.memoizedState)),
        (c = At || Iu(t, n, c, r, g, x, u) || !1)
          ? (d ||
              (typeof s.UNSAFE_componentWillUpdate != "function" &&
                typeof s.componentWillUpdate != "function") ||
              (typeof s.componentWillUpdate == "function" &&
                s.componentWillUpdate(r, x, u),
              typeof s.UNSAFE_componentWillUpdate == "function" &&
                s.UNSAFE_componentWillUpdate(r, x, u)),
            typeof s.componentDidUpdate == "function" && (t.flags |= 4),
            typeof s.getSnapshotBeforeUpdate == "function" && (t.flags |= 1024))
          : (typeof s.componentDidUpdate != "function" ||
              (a === e.memoizedProps && g === e.memoizedState) ||
              (t.flags |= 4),
            typeof s.getSnapshotBeforeUpdate != "function" ||
              (a === e.memoizedProps && g === e.memoizedState) ||
              (t.flags |= 1024),
            (t.memoizedProps = r),
            (t.memoizedState = x)),
        (s.props = r),
        (s.state = x),
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
  return us(e, t, n, r, o, i);
}
function us(e, t, n, r, i, o) {
  _f(e, t);
  var s = (t.flags & 128) !== 0;
  if (!r && !s) return (i && bu(t, n, !1), Mt(e, t, o));
  ((r = t.stateNode), (Tg.current = t));
  var a =
    s && typeof n.getDerivedStateFromError != "function" ? null : r.render();
  return (
    (t.flags |= 1),
    e !== null && s
      ? ((t.child = er(t, e.child, null, o)), (t.child = er(t, null, a, o)))
      : Me(e, t, a, o),
    (t.memoizedState = r.state),
    i && bu(t, n, !0),
    t.child
  );
}
function wf(e) {
  var t = e.stateNode;
  (t.pendingContext
    ? ju(e, t.pendingContext, t.pendingContext !== t.context)
    : t.context && ju(e, t.context, !1),
    sa(e, t.containerInfo));
}
function Bu(e, t, n, r, i) {
  return (qn(), ta(i), (t.flags |= 256), Me(e, t, n, r), t.child);
}
var cs = { dehydrated: null, treeContext: null, retryLane: 0 };
function ds(e) {
  return { baseLanes: e, cachePool: null, transitions: null };
}
function kf(e, t, n) {
  var r = t.pendingProps,
    i = le.current,
    o = !1,
    s = (t.flags & 128) !== 0,
    a;
  if (
    ((a = s) ||
      (a = e !== null && e.memoizedState === null ? !1 : (i & 2) !== 0),
    a
      ? ((o = !0), (t.flags &= -129))
      : (e === null || e.memoizedState !== null) && (i |= 1),
    ee(le, i & 1),
    e === null)
  )
    return (
      rs(t),
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
                : (o = Ao(s, r, 0, null)),
              (e = yn(e, r, n, null)),
              (o.return = t),
              (e.return = t),
              (o.sibling = e),
              (t.child = o),
              (t.child.memoizedState = ds(n)),
              (t.memoizedState = cs),
              e)
            : ga(t, s))
    );
  if (((i = e.memoizedState), i !== null && ((a = i.dehydrated), a !== null)))
    return Mg(e, t, s, r, a, i, n);
  if (o) {
    ((o = r.fallback), (s = t.mode), (i = e.child), (a = i.sibling));
    var u = { mode: "hidden", children: r.children };
    return (
      !(s & 1) && t.child !== i
        ? ((r = t.child),
          (r.childLanes = 0),
          (r.pendingProps = u),
          (t.deletions = null))
        : ((r = Zt(i, u)), (r.subtreeFlags = i.subtreeFlags & 14680064)),
      a !== null ? (o = Zt(a, o)) : ((o = yn(o, s, n, null)), (o.flags |= 2)),
      (o.return = t),
      (r.return = t),
      (r.sibling = o),
      (t.child = r),
      (r = o),
      (o = t.child),
      (s = e.child.memoizedState),
      (s =
        s === null
          ? ds(n)
          : {
              baseLanes: s.baseLanes | n,
              cachePool: null,
              transitions: s.transitions,
            }),
      (o.memoizedState = s),
      (o.childLanes = e.childLanes & ~n),
      (t.memoizedState = cs),
      r
    );
  }
  return (
    (o = e.child),
    (e = o.sibling),
    (r = Zt(o, { mode: "visible", children: r.children })),
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
function ga(e, t) {
  return (
    (t = Ao({ mode: "visible", children: t }, e.mode, 0, null)),
    (t.return = e),
    (e.child = t)
  );
}
function Pi(e, t, n, r) {
  return (
    r !== null && ta(r),
    er(t, e.child, null, n),
    (e = ga(t, t.pendingProps.children)),
    (e.flags |= 2),
    (t.memoizedState = null),
    e
  );
}
function Mg(e, t, n, r, i, o, s) {
  if (n)
    return t.flags & 256
      ? ((t.flags &= -257), (r = yl(Error(I(422)))), Pi(e, t, s, r))
      : t.memoizedState !== null
        ? ((t.child = e.child), (t.flags |= 128), null)
        : ((o = r.fallback),
          (i = t.mode),
          (r = Ao({ mode: "visible", children: r.children }, i, 0, null)),
          (o = yn(o, i, s, null)),
          (o.flags |= 2),
          (r.return = t),
          (o.return = t),
          (r.sibling = o),
          (t.child = r),
          t.mode & 1 && er(t, e.child, null, s),
          (t.child.memoizedState = ds(s)),
          (t.memoizedState = cs),
          o);
  if (!(t.mode & 1)) return Pi(e, t, s, null);
  if (i.data === "$!") {
    if (((r = i.nextSibling && i.nextSibling.dataset), r)) var a = r.dgst;
    return (
      (r = a),
      (o = Error(I(419))),
      (r = yl(o, r, void 0)),
      Pi(e, t, s, r)
    );
  }
  if (((a = (s & e.childLanes) !== 0), $e || a)) {
    if (((r = _e), r !== null)) {
      switch (s & -s) {
        case 4:
          i = 2;
          break;
        case 16:
          i = 8;
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
          i = 32;
          break;
        case 536870912:
          i = 268435456;
          break;
        default:
          i = 0;
      }
      ((i = i & (r.suspendedLanes | s) ? 0 : i),
        i !== 0 &&
          i !== o.retryLane &&
          ((o.retryLane = i), Tt(e, i), dt(r, e, i, -1)));
    }
    return (_a(), (r = yl(Error(I(421)))), Pi(e, t, s, r));
  }
  return i.data === "$?"
    ? ((t.flags |= 128),
      (t.child = e.child),
      (t = Vg.bind(null, e)),
      (i._reactRetry = t),
      null)
    : ((e = o.treeContext),
      (Ke = Qt(i.nextSibling)),
      (Je = t),
      (ie = !0),
      (at = null),
      e !== null &&
        ((Ze[qe++] = Ct),
        (Ze[qe++] = Et),
        (Ze[qe++] = _n),
        (Ct = e.id),
        (Et = e.overflow),
        (_n = t)),
      (t = ga(t, r.children)),
      (t.flags |= 4096),
      t);
}
function Wu(e, t, n) {
  e.lanes |= t;
  var r = e.alternate;
  (r !== null && (r.lanes |= t), is(e.return, t, n));
}
function Sl(e, t, n, r, i) {
  var o = e.memoizedState;
  o === null
    ? (e.memoizedState = {
        isBackwards: t,
        rendering: null,
        renderingStartTime: 0,
        last: r,
        tail: n,
        tailMode: i,
      })
    : ((o.isBackwards = t),
      (o.rendering = null),
      (o.renderingStartTime = 0),
      (o.last = r),
      (o.tail = n),
      (o.tailMode = i));
}
function jf(e, t, n) {
  var r = t.pendingProps,
    i = r.revealOrder,
    o = r.tail;
  if ((Me(e, t, r.children, n), (r = le.current), r & 2))
    ((r = (r & 1) | 2), (t.flags |= 128));
  else {
    if (e !== null && e.flags & 128)
      e: for (e = t.child; e !== null; ) {
        if (e.tag === 13) e.memoizedState !== null && Wu(e, n, t);
        else if (e.tag === 19) Wu(e, n, t);
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
  if ((ee(le, r), !(t.mode & 1))) t.memoizedState = null;
  else
    switch (i) {
      case "forwards":
        for (n = t.child, i = null; n !== null; )
          ((e = n.alternate),
            e !== null && vo(e) === null && (i = n),
            (n = n.sibling));
        ((n = i),
          n === null
            ? ((i = t.child), (t.child = null))
            : ((i = n.sibling), (n.sibling = null)),
          Sl(t, !1, i, n, o));
        break;
      case "backwards":
        for (n = null, i = t.child, t.child = null; i !== null; ) {
          if (((e = i.alternate), e !== null && vo(e) === null)) {
            t.child = i;
            break;
          }
          ((e = i.sibling), (i.sibling = n), (n = i), (i = e));
        }
        Sl(t, !0, n, null, o);
        break;
      case "together":
        Sl(t, !1, null, null, void 0);
        break;
      default:
        t.memoizedState = null;
    }
  return t.child;
}
function Gi(e, t) {
  !(t.mode & 1) &&
    e !== null &&
    ((e.alternate = null), (t.alternate = null), (t.flags |= 2));
}
function Mt(e, t, n) {
  if (
    (e !== null && (t.dependencies = e.dependencies),
    (kn |= t.lanes),
    !(n & t.childLanes))
  )
    return null;
  if (e !== null && t.child !== e.child) throw Error(I(153));
  if (t.child !== null) {
    for (
      e = t.child, n = Zt(e, e.pendingProps), t.child = n, n.return = t;
      e.sibling !== null;
    )
      ((e = e.sibling),
        (n = n.sibling = Zt(e, e.pendingProps)),
        (n.return = t));
    n.sibling = null;
  }
  return t.child;
}
function Ig(e, t, n) {
  switch (t.tag) {
    case 3:
      (wf(t), qn());
      break;
    case 5:
      Yd(t);
      break;
    case 1:
      Be(t.type) && co(t);
      break;
    case 4:
      sa(t, t.stateNode.containerInfo);
      break;
    case 10:
      var r = t.type._context,
        i = t.memoizedProps.value;
      (ee(ho, r._currentValue), (r._currentValue = i));
      break;
    case 13:
      if (((r = t.memoizedState), r !== null))
        return r.dehydrated !== null
          ? (ee(le, le.current & 1), (t.flags |= 128), null)
          : n & t.child.childLanes
            ? kf(e, t, n)
            : (ee(le, le.current & 1),
              (e = Mt(e, t, n)),
              e !== null ? e.sibling : null);
      ee(le, le.current & 1);
      break;
    case 19:
      if (((r = (n & t.childLanes) !== 0), e.flags & 128)) {
        if (r) return jf(e, t, n);
        t.flags |= 128;
      }
      if (
        ((i = t.memoizedState),
        i !== null &&
          ((i.rendering = null), (i.tail = null), (i.lastEffect = null)),
        ee(le, le.current),
        r)
      )
        break;
      return null;
    case 22:
    case 23:
      return ((t.lanes = 0), Sf(e, t, n));
  }
  return Mt(e, t, n);
}
var bf, fs, Cf, Ef;
bf = function (e, t) {
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
fs = function () {};
Cf = function (e, t, n, r) {
  var i = e.memoizedProps;
  if (i !== r) {
    ((e = t.stateNode), vn(St.current));
    var o = null;
    switch (n) {
      case "input":
        ((i = Ll(e, i)), (r = Ll(e, r)), (o = []));
        break;
      case "select":
        ((i = ue({}, i, { value: void 0 })),
          (r = ue({}, r, { value: void 0 })),
          (o = []));
        break;
      case "textarea":
        ((i = Dl(e, i)), (r = Dl(e, r)), (o = []));
        break;
      default:
        typeof i.onClick != "function" &&
          typeof r.onClick == "function" &&
          (e.onclick = ao);
    }
    Al(n, r);
    var s;
    n = null;
    for (c in i)
      if (!r.hasOwnProperty(c) && i.hasOwnProperty(c) && i[c] != null)
        if (c === "style") {
          var a = i[c];
          for (s in a) a.hasOwnProperty(s) && (n || (n = {}), (n[s] = ""));
        } else
          c !== "dangerouslySetInnerHTML" &&
            c !== "children" &&
            c !== "suppressContentEditableWarning" &&
            c !== "suppressHydrationWarning" &&
            c !== "autoFocus" &&
            (Ur.hasOwnProperty(c)
              ? o || (o = [])
              : (o = o || []).push(c, null));
    for (c in r) {
      var u = r[c];
      if (
        ((a = i != null ? i[c] : void 0),
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
                (Ur.hasOwnProperty(c)
                  ? (u != null && c === "onScroll" && ne("scroll", e),
                    o || a === u || (o = []))
                  : (o = o || []).push(c, u));
    }
    n && (o = o || []).push("style", n);
    var c = o;
    (t.updateQueue = c) && (t.flags |= 4);
  }
};
Ef = function (e, t, n, r) {
  n !== r && (t.flags |= 4);
};
function Sr(e, t) {
  if (!ie)
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
function Re(e) {
  var t = e.alternate !== null && e.alternate.child === e.child,
    n = 0,
    r = 0;
  if (t)
    for (var i = e.child; i !== null; )
      ((n |= i.lanes | i.childLanes),
        (r |= i.subtreeFlags & 14680064),
        (r |= i.flags & 14680064),
        (i.return = e),
        (i = i.sibling));
  else
    for (i = e.child; i !== null; )
      ((n |= i.lanes | i.childLanes),
        (r |= i.subtreeFlags),
        (r |= i.flags),
        (i.return = e),
        (i = i.sibling));
  return ((e.subtreeFlags |= r), (e.childLanes = n), t);
}
function Lg(e, t, n) {
  var r = t.pendingProps;
  switch ((ea(t), t.tag)) {
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
      return (Re(t), null);
    case 1:
      return (Be(t.type) && uo(), Re(t), null);
    case 3:
      return (
        (r = t.stateNode),
        tr(),
        re(Fe),
        re(Te),
        ua(),
        r.pendingContext &&
          ((r.context = r.pendingContext), (r.pendingContext = null)),
        (e === null || e.child === null) &&
          (zi(t)
            ? (t.flags |= 4)
            : e === null ||
              (e.memoizedState.isDehydrated && !(t.flags & 256)) ||
              ((t.flags |= 1024), at !== null && (Ss(at), (at = null)))),
        fs(e, t),
        Re(t),
        null
      );
    case 5:
      aa(t);
      var i = vn(ti.current);
      if (((n = t.type), e !== null && t.stateNode != null))
        (Cf(e, t, n, r, i),
          e.ref !== t.ref && ((t.flags |= 512), (t.flags |= 2097152)));
      else {
        if (!r) {
          if (t.stateNode === null) throw Error(I(166));
          return (Re(t), null);
        }
        if (((e = vn(St.current)), zi(t))) {
          ((r = t.stateNode), (n = t.type));
          var o = t.memoizedProps;
          switch (((r[vt] = t), (r[qr] = o), (e = (t.mode & 1) !== 0), n)) {
            case "dialog":
              (ne("cancel", r), ne("close", r));
              break;
            case "iframe":
            case "object":
            case "embed":
              ne("load", r);
              break;
            case "video":
            case "audio":
              for (i = 0; i < Tr.length; i++) ne(Tr[i], r);
              break;
            case "source":
              ne("error", r);
              break;
            case "img":
            case "image":
            case "link":
              (ne("error", r), ne("load", r));
              break;
            case "details":
              ne("toggle", r);
              break;
            case "input":
              (Xa(r, o), ne("invalid", r));
              break;
            case "select":
              ((r._wrapperState = { wasMultiple: !!o.multiple }),
                ne("invalid", r));
              break;
            case "textarea":
              (qa(r, o), ne("invalid", r));
          }
          (Al(n, o), (i = null));
          for (var s in o)
            if (o.hasOwnProperty(s)) {
              var a = o[s];
              s === "children"
                ? typeof a == "string"
                  ? r.textContent !== a &&
                    (o.suppressHydrationWarning !== !0 &&
                      Ei(r.textContent, a, e),
                    (i = ["children", a]))
                  : typeof a == "number" &&
                    r.textContent !== "" + a &&
                    (o.suppressHydrationWarning !== !0 &&
                      Ei(r.textContent, a, e),
                    (i = ["children", "" + a]))
                : Ur.hasOwnProperty(s) &&
                  a != null &&
                  s === "onScroll" &&
                  ne("scroll", r);
            }
          switch (n) {
            case "input":
              (yi(r), Za(r, o, !0));
              break;
            case "textarea":
              (yi(r), eu(r));
              break;
            case "select":
            case "option":
              break;
            default:
              typeof o.onClick == "function" && (r.onclick = ao);
          }
          ((r = i), (t.updateQueue = r), r !== null && (t.flags |= 4));
        } else {
          ((s = i.nodeType === 9 ? i : i.ownerDocument),
            e === "http://www.w3.org/1999/xhtml" && (e = ed(n)),
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
            (e[vt] = t),
            (e[qr] = r),
            bf(e, t, !1, !1),
            (t.stateNode = e));
          e: {
            switch (((s = Fl(n, r)), n)) {
              case "dialog":
                (ne("cancel", e), ne("close", e), (i = r));
                break;
              case "iframe":
              case "object":
              case "embed":
                (ne("load", e), (i = r));
                break;
              case "video":
              case "audio":
                for (i = 0; i < Tr.length; i++) ne(Tr[i], e);
                i = r;
                break;
              case "source":
                (ne("error", e), (i = r));
                break;
              case "img":
              case "image":
              case "link":
                (ne("error", e), ne("load", e), (i = r));
                break;
              case "details":
                (ne("toggle", e), (i = r));
                break;
              case "input":
                (Xa(e, r), (i = Ll(e, r)), ne("invalid", e));
                break;
              case "option":
                i = r;
                break;
              case "select":
                ((e._wrapperState = { wasMultiple: !!r.multiple }),
                  (i = ue({}, r, { value: void 0 })),
                  ne("invalid", e));
                break;
              case "textarea":
                (qa(e, r), (i = Dl(e, r)), ne("invalid", e));
                break;
              default:
                i = r;
            }
            (Al(n, i), (a = i));
            for (o in a)
              if (a.hasOwnProperty(o)) {
                var u = a[o];
                o === "style"
                  ? rd(e, u)
                  : o === "dangerouslySetInnerHTML"
                    ? ((u = u ? u.__html : void 0), u != null && td(e, u))
                    : o === "children"
                      ? typeof u == "string"
                        ? (n !== "textarea" || u !== "") && Hr(e, u)
                        : typeof u == "number" && Hr(e, "" + u)
                      : o !== "suppressContentEditableWarning" &&
                        o !== "suppressHydrationWarning" &&
                        o !== "autoFocus" &&
                        (Ur.hasOwnProperty(o)
                          ? u != null && o === "onScroll" && ne("scroll", e)
                          : u != null && As(e, o, u, s));
              }
            switch (n) {
              case "input":
                (yi(e), Za(e, r, !1));
                break;
              case "textarea":
                (yi(e), eu(e));
                break;
              case "option":
                r.value != null && e.setAttribute("value", "" + en(r.value));
                break;
              case "select":
                ((e.multiple = !!r.multiple),
                  (o = r.value),
                  o != null
                    ? Vn(e, !!r.multiple, o, !1)
                    : r.defaultValue != null &&
                      Vn(e, !!r.multiple, r.defaultValue, !0));
                break;
              default:
                typeof i.onClick == "function" && (e.onclick = ao);
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
      return (Re(t), null);
    case 6:
      if (e && t.stateNode != null) Ef(e, t, e.memoizedProps, r);
      else {
        if (typeof r != "string" && t.stateNode === null) throw Error(I(166));
        if (((n = vn(ti.current)), vn(St.current), zi(t))) {
          if (
            ((r = t.stateNode),
            (n = t.memoizedProps),
            (r[vt] = t),
            (o = r.nodeValue !== n) && ((e = Je), e !== null))
          )
            switch (e.tag) {
              case 3:
                Ei(r.nodeValue, n, (e.mode & 1) !== 0);
                break;
              case 5:
                e.memoizedProps.suppressHydrationWarning !== !0 &&
                  Ei(r.nodeValue, n, (e.mode & 1) !== 0);
            }
          o && (t.flags |= 4);
        } else
          ((r = (n.nodeType === 9 ? n : n.ownerDocument).createTextNode(r)),
            (r[vt] = t),
            (t.stateNode = r));
      }
      return (Re(t), null);
    case 13:
      if (
        (re(le),
        (r = t.memoizedState),
        e === null ||
          (e.memoizedState !== null && e.memoizedState.dehydrated !== null))
      ) {
        if (ie && Ke !== null && t.mode & 1 && !(t.flags & 128))
          (Hd(), qn(), (t.flags |= 98560), (o = !1));
        else if (((o = zi(t)), r !== null && r.dehydrated !== null)) {
          if (e === null) {
            if (!o) throw Error(I(318));
            if (
              ((o = t.memoizedState),
              (o = o !== null ? o.dehydrated : null),
              !o)
            )
              throw Error(I(317));
            o[vt] = t;
          } else
            (qn(),
              !(t.flags & 128) && (t.memoizedState = null),
              (t.flags |= 4));
          (Re(t), (o = !1));
        } else (at !== null && (Ss(at), (at = null)), (o = !0));
        if (!o) return t.flags & 65536 ? t : null;
      }
      return t.flags & 128
        ? ((t.lanes = n), t)
        : ((r = r !== null),
          r !== (e !== null && e.memoizedState !== null) &&
            r &&
            ((t.child.flags |= 8192),
            t.mode & 1 &&
              (e === null || le.current & 1 ? xe === 0 && (xe = 3) : _a())),
          t.updateQueue !== null && (t.flags |= 4),
          Re(t),
          null);
    case 4:
      return (
        tr(),
        fs(e, t),
        e === null && Xr(t.stateNode.containerInfo),
        Re(t),
        null
      );
    case 10:
      return (ia(t.type._context), Re(t), null);
    case 17:
      return (Be(t.type) && uo(), Re(t), null);
    case 19:
      if ((re(le), (o = t.memoizedState), o === null)) return (Re(t), null);
      if (((r = (t.flags & 128) !== 0), (s = o.rendering), s === null))
        if (r) Sr(o, !1);
        else {
          if (xe !== 0 || (e !== null && e.flags & 128))
            for (e = t.child; e !== null; ) {
              if (((s = vo(e)), s !== null)) {
                for (
                  t.flags |= 128,
                    Sr(o, !1),
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
                return (ee(le, (le.current & 1) | 2), t.child);
              }
              e = e.sibling;
            }
          o.tail !== null &&
            fe() > rr &&
            ((t.flags |= 128), (r = !0), Sr(o, !1), (t.lanes = 4194304));
        }
      else {
        if (!r)
          if (((e = vo(s)), e !== null)) {
            if (
              ((t.flags |= 128),
              (r = !0),
              (n = e.updateQueue),
              n !== null && ((t.updateQueue = n), (t.flags |= 4)),
              Sr(o, !0),
              o.tail === null && o.tailMode === "hidden" && !s.alternate && !ie)
            )
              return (Re(t), null);
          } else
            2 * fe() - o.renderingStartTime > rr &&
              n !== 1073741824 &&
              ((t.flags |= 128), (r = !0), Sr(o, !1), (t.lanes = 4194304));
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
          (o.renderingStartTime = fe()),
          (t.sibling = null),
          (n = le.current),
          ee(le, r ? (n & 1) | 2 : n & 1),
          t)
        : (Re(t), null);
    case 22:
    case 23:
      return (
        Sa(),
        (r = t.memoizedState !== null),
        e !== null && (e.memoizedState !== null) !== r && (t.flags |= 8192),
        r && t.mode & 1
          ? Ve & 1073741824 && (Re(t), t.subtreeFlags & 6 && (t.flags |= 8192))
          : Re(t),
        null
      );
    case 24:
      return null;
    case 25:
      return null;
  }
  throw Error(I(156, t.tag));
}
function Ng(e, t) {
  switch ((ea(t), t.tag)) {
    case 1:
      return (
        Be(t.type) && uo(),
        (e = t.flags),
        e & 65536 ? ((t.flags = (e & -65537) | 128), t) : null
      );
    case 3:
      return (
        tr(),
        re(Fe),
        re(Te),
        ua(),
        (e = t.flags),
        e & 65536 && !(e & 128) ? ((t.flags = (e & -65537) | 128), t) : null
      );
    case 5:
      return (aa(t), null);
    case 13:
      if (
        (re(le), (e = t.memoizedState), e !== null && e.dehydrated !== null)
      ) {
        if (t.alternate === null) throw Error(I(340));
        qn();
      }
      return (
        (e = t.flags),
        e & 65536 ? ((t.flags = (e & -65537) | 128), t) : null
      );
    case 19:
      return (re(le), null);
    case 4:
      return (tr(), null);
    case 10:
      return (ia(t.type._context), null);
    case 22:
    case 23:
      return (Sa(), null);
    case 24:
      return null;
    default:
      return null;
  }
}
var Ti = !1,
  Pe = !1,
  Og = typeof WeakSet == "function" ? WeakSet : Set,
  D = null;
function Un(e, t) {
  var n = e.ref;
  if (n !== null)
    if (typeof n == "function")
      try {
        n(null);
      } catch (r) {
        de(e, t, r);
      }
    else n.current = null;
}
function ps(e, t, n) {
  try {
    n();
  } catch (r) {
    de(e, t, r);
  }
}
var Uu = !1;
function Dg(e, t) {
  if (((Gl = oo), (e = Td()), Zs(e))) {
    if ("selectionStart" in e)
      var n = { start: e.selectionStart, end: e.selectionEnd };
    else
      e: {
        n = ((n = e.ownerDocument) && n.defaultView) || window;
        var r = n.getSelection && n.getSelection();
        if (r && r.rangeCount !== 0) {
          n = r.anchorNode;
          var i = r.anchorOffset,
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
            d = 0,
            p = e,
            g = null;
          t: for (;;) {
            for (
              var k;
              p !== n || (i !== 0 && p.nodeType !== 3) || (a = s + i),
                p !== o || (r !== 0 && p.nodeType !== 3) || (u = s + r),
                p.nodeType === 3 && (s += p.nodeValue.length),
                (k = p.firstChild) !== null;
            )
              ((g = p), (p = k));
            for (;;) {
              if (p === e) break t;
              if (
                (g === n && ++c === i && (a = s),
                g === o && ++d === r && (u = s),
                (k = p.nextSibling) !== null)
              )
                break;
              ((p = g), (g = p.parentNode));
            }
            p = k;
          }
          n = a === -1 || u === -1 ? null : { start: a, end: u };
        } else n = null;
      }
    n = n || { start: 0, end: 0 };
  } else n = null;
  for (Xl = { focusedElem: e, selectionRange: n }, oo = !1, D = t; D !== null; )
    if (((t = D), (e = t.child), (t.subtreeFlags & 1028) !== 0 && e !== null))
      ((e.return = t), (D = e));
    else
      for (; D !== null; ) {
        t = D;
        try {
          var x = t.alternate;
          if (t.flags & 1024)
            switch (t.tag) {
              case 0:
              case 11:
              case 15:
                break;
              case 1:
                if (x !== null) {
                  var _ = x.memoizedProps,
                    S = x.memoizedState,
                    h = t.stateNode,
                    f = h.getSnapshotBeforeUpdate(
                      t.elementType === t.type ? _ : lt(t.type, _),
                      S,
                    );
                  h.__reactInternalSnapshotBeforeUpdate = f;
                }
                break;
              case 3:
                var m = t.stateNode.containerInfo;
                m.nodeType === 1
                  ? (m.textContent = "")
                  : m.nodeType === 9 &&
                    m.documentElement &&
                    m.removeChild(m.documentElement);
                break;
              case 5:
              case 6:
              case 4:
              case 17:
                break;
              default:
                throw Error(I(163));
            }
        } catch (w) {
          de(t, t.return, w);
        }
        if (((e = t.sibling), e !== null)) {
          ((e.return = t.return), (D = e));
          break;
        }
        D = t.return;
      }
  return ((x = Uu), (Uu = !1), x);
}
function Ar(e, t, n) {
  var r = t.updateQueue;
  if (((r = r !== null ? r.lastEffect : null), r !== null)) {
    var i = (r = r.next);
    do {
      if ((i.tag & e) === e) {
        var o = i.destroy;
        ((i.destroy = void 0), o !== void 0 && ps(t, n, o));
      }
      i = i.next;
    } while (i !== r);
  }
}
function Do(e, t) {
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
function hs(e) {
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
function zf(e) {
  var t = e.alternate;
  (t !== null && ((e.alternate = null), zf(t)),
    (e.child = null),
    (e.deletions = null),
    (e.sibling = null),
    e.tag === 5 &&
      ((t = e.stateNode),
      t !== null &&
        (delete t[vt], delete t[qr], delete t[es], delete t[yg], delete t[Sg])),
    (e.stateNode = null),
    (e.return = null),
    (e.dependencies = null),
    (e.memoizedProps = null),
    (e.memoizedState = null),
    (e.pendingProps = null),
    (e.stateNode = null),
    (e.updateQueue = null));
}
function Rf(e) {
  return e.tag === 5 || e.tag === 3 || e.tag === 4;
}
function Hu(e) {
  e: for (;;) {
    for (; e.sibling === null; ) {
      if (e.return === null || Rf(e.return)) return null;
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
function gs(e, t, n) {
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
          n != null || t.onclick !== null || (t.onclick = ao)));
  else if (r !== 4 && ((e = e.child), e !== null))
    for (gs(e, t, n), e = e.sibling; e !== null; )
      (gs(e, t, n), (e = e.sibling));
}
function ms(e, t, n) {
  var r = e.tag;
  if (r === 5 || r === 6)
    ((e = e.stateNode), t ? n.insertBefore(e, t) : n.appendChild(e));
  else if (r !== 4 && ((e = e.child), e !== null))
    for (ms(e, t, n), e = e.sibling; e !== null; )
      (ms(e, t, n), (e = e.sibling));
}
var je = null,
  st = !1;
function Dt(e, t, n) {
  for (n = n.child; n !== null; ) (Pf(e, t, n), (n = n.sibling));
}
function Pf(e, t, n) {
  if (yt && typeof yt.onCommitFiberUnmount == "function")
    try {
      yt.onCommitFiberUnmount(Ro, n);
    } catch {}
  switch (n.tag) {
    case 5:
      Pe || Un(n, t);
    case 6:
      var r = je,
        i = st;
      ((je = null),
        Dt(e, t, n),
        (je = r),
        (st = i),
        je !== null &&
          (st
            ? ((e = je),
              (n = n.stateNode),
              e.nodeType === 8 ? e.parentNode.removeChild(n) : e.removeChild(n))
            : je.removeChild(n.stateNode)));
      break;
    case 18:
      je !== null &&
        (st
          ? ((e = je),
            (n = n.stateNode),
            e.nodeType === 8
              ? pl(e.parentNode, n)
              : e.nodeType === 1 && pl(e, n),
            Qr(e))
          : pl(je, n.stateNode));
      break;
    case 4:
      ((r = je),
        (i = st),
        (je = n.stateNode.containerInfo),
        (st = !0),
        Dt(e, t, n),
        (je = r),
        (st = i));
      break;
    case 0:
    case 11:
    case 14:
    case 15:
      if (
        !Pe &&
        ((r = n.updateQueue), r !== null && ((r = r.lastEffect), r !== null))
      ) {
        i = r = r.next;
        do {
          var o = i,
            s = o.destroy;
          ((o = o.tag),
            s !== void 0 && (o & 2 || o & 4) && ps(n, t, s),
            (i = i.next));
        } while (i !== r);
      }
      Dt(e, t, n);
      break;
    case 1:
      if (
        !Pe &&
        (Un(n, t),
        (r = n.stateNode),
        typeof r.componentWillUnmount == "function")
      )
        try {
          ((r.props = n.memoizedProps),
            (r.state = n.memoizedState),
            r.componentWillUnmount());
        } catch (a) {
          de(n, t, a);
        }
      Dt(e, t, n);
      break;
    case 21:
      Dt(e, t, n);
      break;
    case 22:
      n.mode & 1
        ? ((Pe = (r = Pe) || n.memoizedState !== null), Dt(e, t, n), (Pe = r))
        : Dt(e, t, n);
      break;
    default:
      Dt(e, t, n);
  }
}
function Vu(e) {
  var t = e.updateQueue;
  if (t !== null) {
    e.updateQueue = null;
    var n = e.stateNode;
    (n === null && (n = e.stateNode = new Og()),
      t.forEach(function (r) {
        var i = Kg.bind(null, e, r);
        n.has(r) || (n.add(r), r.then(i, i));
      }));
  }
}
function ot(e, t) {
  var n = t.deletions;
  if (n !== null)
    for (var r = 0; r < n.length; r++) {
      var i = n[r];
      try {
        var o = e,
          s = t,
          a = s;
        e: for (; a !== null; ) {
          switch (a.tag) {
            case 5:
              ((je = a.stateNode), (st = !1));
              break e;
            case 3:
              ((je = a.stateNode.containerInfo), (st = !0));
              break e;
            case 4:
              ((je = a.stateNode.containerInfo), (st = !0));
              break e;
          }
          a = a.return;
        }
        if (je === null) throw Error(I(160));
        (Pf(o, s, i), (je = null), (st = !1));
        var u = i.alternate;
        (u !== null && (u.return = null), (i.return = null));
      } catch (c) {
        de(i, t, c);
      }
    }
  if (t.subtreeFlags & 12854)
    for (t = t.child; t !== null; ) (Tf(t, e), (t = t.sibling));
}
function Tf(e, t) {
  var n = e.alternate,
    r = e.flags;
  switch (e.tag) {
    case 0:
    case 11:
    case 14:
    case 15:
      if ((ot(t, e), ht(e), r & 4)) {
        try {
          (Ar(3, e, e.return), Do(3, e));
        } catch (_) {
          de(e, e.return, _);
        }
        try {
          Ar(5, e, e.return);
        } catch (_) {
          de(e, e.return, _);
        }
      }
      break;
    case 1:
      (ot(t, e), ht(e), r & 512 && n !== null && Un(n, n.return));
      break;
    case 5:
      if (
        (ot(t, e),
        ht(e),
        r & 512 && n !== null && Un(n, n.return),
        e.flags & 32)
      ) {
        var i = e.stateNode;
        try {
          Hr(i, "");
        } catch (_) {
          de(e, e.return, _);
        }
      }
      if (r & 4 && ((i = e.stateNode), i != null)) {
        var o = e.memoizedProps,
          s = n !== null ? n.memoizedProps : o,
          a = e.type,
          u = e.updateQueue;
        if (((e.updateQueue = null), u !== null))
          try {
            (a === "input" && o.type === "radio" && o.name != null && Zc(i, o),
              Fl(a, s));
            var c = Fl(a, o);
            for (s = 0; s < u.length; s += 2) {
              var d = u[s],
                p = u[s + 1];
              d === "style"
                ? rd(i, p)
                : d === "dangerouslySetInnerHTML"
                  ? td(i, p)
                  : d === "children"
                    ? Hr(i, p)
                    : As(i, d, p, c);
            }
            switch (a) {
              case "input":
                Nl(i, o);
                break;
              case "textarea":
                qc(i, o);
                break;
              case "select":
                var g = i._wrapperState.wasMultiple;
                i._wrapperState.wasMultiple = !!o.multiple;
                var k = o.value;
                k != null
                  ? Vn(i, !!o.multiple, k, !1)
                  : g !== !!o.multiple &&
                    (o.defaultValue != null
                      ? Vn(i, !!o.multiple, o.defaultValue, !0)
                      : Vn(i, !!o.multiple, o.multiple ? [] : "", !1));
            }
            i[qr] = o;
          } catch (_) {
            de(e, e.return, _);
          }
      }
      break;
    case 6:
      if ((ot(t, e), ht(e), r & 4)) {
        if (e.stateNode === null) throw Error(I(162));
        ((i = e.stateNode), (o = e.memoizedProps));
        try {
          i.nodeValue = o;
        } catch (_) {
          de(e, e.return, _);
        }
      }
      break;
    case 3:
      if (
        (ot(t, e), ht(e), r & 4 && n !== null && n.memoizedState.isDehydrated)
      )
        try {
          Qr(t.containerInfo);
        } catch (_) {
          de(e, e.return, _);
        }
      break;
    case 4:
      (ot(t, e), ht(e));
      break;
    case 13:
      (ot(t, e),
        ht(e),
        (i = e.child),
        i.flags & 8192 &&
          ((o = i.memoizedState !== null),
          (i.stateNode.isHidden = o),
          !o ||
            (i.alternate !== null && i.alternate.memoizedState !== null) ||
            (xa = fe())),
        r & 4 && Vu(e));
      break;
    case 22:
      if (
        ((d = n !== null && n.memoizedState !== null),
        e.mode & 1 ? ((Pe = (c = Pe) || d), ot(t, e), (Pe = c)) : ot(t, e),
        ht(e),
        r & 8192)
      ) {
        if (
          ((c = e.memoizedState !== null),
          (e.stateNode.isHidden = c) && !d && e.mode & 1)
        )
          for (D = e, d = e.child; d !== null; ) {
            for (p = D = d; D !== null; ) {
              switch (((g = D), (k = g.child), g.tag)) {
                case 0:
                case 11:
                case 14:
                case 15:
                  Ar(4, g, g.return);
                  break;
                case 1:
                  Un(g, g.return);
                  var x = g.stateNode;
                  if (typeof x.componentWillUnmount == "function") {
                    ((r = g), (n = g.return));
                    try {
                      ((t = r),
                        (x.props = t.memoizedProps),
                        (x.state = t.memoizedState),
                        x.componentWillUnmount());
                    } catch (_) {
                      de(r, n, _);
                    }
                  }
                  break;
                case 5:
                  Un(g, g.return);
                  break;
                case 22:
                  if (g.memoizedState !== null) {
                    Ju(p);
                    continue;
                  }
              }
              k !== null ? ((k.return = g), (D = k)) : Ju(p);
            }
            d = d.sibling;
          }
        e: for (d = null, p = e; ; ) {
          if (p.tag === 5) {
            if (d === null) {
              d = p;
              try {
                ((i = p.stateNode),
                  c
                    ? ((o = i.style),
                      typeof o.setProperty == "function"
                        ? o.setProperty("display", "none", "important")
                        : (o.display = "none"))
                    : ((a = p.stateNode),
                      (u = p.memoizedProps.style),
                      (s =
                        u != null && u.hasOwnProperty("display")
                          ? u.display
                          : null),
                      (a.style.display = nd("display", s))));
              } catch (_) {
                de(e, e.return, _);
              }
            }
          } else if (p.tag === 6) {
            if (d === null)
              try {
                p.stateNode.nodeValue = c ? "" : p.memoizedProps;
              } catch (_) {
                de(e, e.return, _);
              }
          } else if (
            ((p.tag !== 22 && p.tag !== 23) ||
              p.memoizedState === null ||
              p === e) &&
            p.child !== null
          ) {
            ((p.child.return = p), (p = p.child));
            continue;
          }
          if (p === e) break e;
          for (; p.sibling === null; ) {
            if (p.return === null || p.return === e) break e;
            (d === p && (d = null), (p = p.return));
          }
          (d === p && (d = null),
            (p.sibling.return = p.return),
            (p = p.sibling));
        }
      }
      break;
    case 19:
      (ot(t, e), ht(e), r & 4 && Vu(e));
      break;
    case 21:
      break;
    default:
      (ot(t, e), ht(e));
  }
}
function ht(e) {
  var t = e.flags;
  if (t & 2) {
    try {
      e: {
        for (var n = e.return; n !== null; ) {
          if (Rf(n)) {
            var r = n;
            break e;
          }
          n = n.return;
        }
        throw Error(I(160));
      }
      switch (r.tag) {
        case 5:
          var i = r.stateNode;
          r.flags & 32 && (Hr(i, ""), (r.flags &= -33));
          var o = Hu(e);
          ms(e, o, i);
          break;
        case 3:
        case 4:
          var s = r.stateNode.containerInfo,
            a = Hu(e);
          gs(e, a, s);
          break;
        default:
          throw Error(I(161));
      }
    } catch (u) {
      de(e, e.return, u);
    }
    e.flags &= -3;
  }
  t & 4096 && (e.flags &= -4097);
}
function $g(e, t, n) {
  ((D = e), Mf(e));
}
function Mf(e, t, n) {
  for (var r = (e.mode & 1) !== 0; D !== null; ) {
    var i = D,
      o = i.child;
    if (i.tag === 22 && r) {
      var s = i.memoizedState !== null || Ti;
      if (!s) {
        var a = i.alternate,
          u = (a !== null && a.memoizedState !== null) || Pe;
        a = Ti;
        var c = Pe;
        if (((Ti = s), (Pe = u) && !c))
          for (D = i; D !== null; )
            ((s = D),
              (u = s.child),
              s.tag === 22 && s.memoizedState !== null
                ? Qu(i)
                : u !== null
                  ? ((u.return = s), (D = u))
                  : Qu(i));
        for (; o !== null; ) ((D = o), Mf(o), (o = o.sibling));
        ((D = i), (Ti = a), (Pe = c));
      }
      Ku(e);
    } else
      i.subtreeFlags & 8772 && o !== null ? ((o.return = i), (D = o)) : Ku(e);
  }
}
function Ku(e) {
  for (; D !== null; ) {
    var t = D;
    if (t.flags & 8772) {
      var n = t.alternate;
      try {
        if (t.flags & 8772)
          switch (t.tag) {
            case 0:
            case 11:
            case 15:
              Pe || Do(5, t);
              break;
            case 1:
              var r = t.stateNode;
              if (t.flags & 4 && !Pe)
                if (n === null) r.componentDidMount();
                else {
                  var i =
                    t.elementType === t.type
                      ? n.memoizedProps
                      : lt(t.type, n.memoizedProps);
                  r.componentDidUpdate(
                    i,
                    n.memoizedState,
                    r.__reactInternalSnapshotBeforeUpdate,
                  );
                }
              var o = t.updateQueue;
              o !== null && Pu(t, o, r);
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
                Pu(t, s, n);
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
                  var d = c.memoizedState;
                  if (d !== null) {
                    var p = d.dehydrated;
                    p !== null && Qr(p);
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
              throw Error(I(163));
          }
        Pe || (t.flags & 512 && hs(t));
      } catch (g) {
        de(t, t.return, g);
      }
    }
    if (t === e) {
      D = null;
      break;
    }
    if (((n = t.sibling), n !== null)) {
      ((n.return = t.return), (D = n));
      break;
    }
    D = t.return;
  }
}
function Ju(e) {
  for (; D !== null; ) {
    var t = D;
    if (t === e) {
      D = null;
      break;
    }
    var n = t.sibling;
    if (n !== null) {
      ((n.return = t.return), (D = n));
      break;
    }
    D = t.return;
  }
}
function Qu(e) {
  for (; D !== null; ) {
    var t = D;
    try {
      switch (t.tag) {
        case 0:
        case 11:
        case 15:
          var n = t.return;
          try {
            Do(4, t);
          } catch (u) {
            de(t, n, u);
          }
          break;
        case 1:
          var r = t.stateNode;
          if (typeof r.componentDidMount == "function") {
            var i = t.return;
            try {
              r.componentDidMount();
            } catch (u) {
              de(t, i, u);
            }
          }
          var o = t.return;
          try {
            hs(t);
          } catch (u) {
            de(t, o, u);
          }
          break;
        case 5:
          var s = t.return;
          try {
            hs(t);
          } catch (u) {
            de(t, s, u);
          }
      }
    } catch (u) {
      de(t, t.return, u);
    }
    if (t === e) {
      D = null;
      break;
    }
    var a = t.sibling;
    if (a !== null) {
      ((a.return = t.return), (D = a));
      break;
    }
    D = t.return;
  }
}
var Ag = Math.ceil,
  So = It.ReactCurrentDispatcher,
  ma = It.ReactCurrentOwner,
  tt = It.ReactCurrentBatchConfig,
  Y = 0,
  _e = null,
  ge = null,
  be = 0,
  Ve = 0,
  Hn = rn(0),
  xe = 0,
  oi = null,
  kn = 0,
  $o = 0,
  va = 0,
  Fr = null,
  De = null,
  xa = 0,
  rr = 1 / 0,
  jt = null,
  _o = !1,
  vs = null,
  Gt = null,
  Mi = !1,
  Ut = null,
  wo = 0,
  Br = 0,
  xs = null,
  Xi = -1,
  Zi = 0;
function Ie() {
  return Y & 6 ? fe() : Xi !== -1 ? Xi : (Xi = fe());
}
function Xt(e) {
  return e.mode & 1
    ? Y & 2 && be !== 0
      ? be & -be
      : wg.transition !== null
        ? (Zi === 0 && (Zi = gd()), Zi)
        : ((e = X),
          e !== 0 || ((e = window.event), (e = e === void 0 ? 16 : wd(e.type))),
          e)
    : 1;
}
function dt(e, t, n, r) {
  if (50 < Br) throw ((Br = 0), (xs = null), Error(I(185)));
  (di(e, n, r),
    (!(Y & 2) || e !== _e) &&
      (e === _e && (!(Y & 2) && ($o |= n), xe === 4 && Bt(e, be)),
      We(e, r),
      n === 1 && Y === 0 && !(t.mode & 1) && ((rr = fe() + 500), Lo && on())));
}
function We(e, t) {
  var n = e.callbackNode;
  wh(e, t);
  var r = io(e, e === _e ? be : 0);
  if (r === 0)
    (n !== null && ru(n), (e.callbackNode = null), (e.callbackPriority = 0));
  else if (((t = r & -r), e.callbackPriority !== t)) {
    if ((n != null && ru(n), t === 1))
      (e.tag === 0 ? _g(Yu.bind(null, e)) : Bd(Yu.bind(null, e)),
        vg(function () {
          !(Y & 6) && on();
        }),
        (n = null));
    else {
      switch (md(r)) {
        case 1:
          n = Hs;
          break;
        case 4:
          n = pd;
          break;
        case 16:
          n = ro;
          break;
        case 536870912:
          n = hd;
          break;
        default:
          n = ro;
      }
      n = Ff(n, If.bind(null, e));
    }
    ((e.callbackPriority = t), (e.callbackNode = n));
  }
}
function If(e, t) {
  if (((Xi = -1), (Zi = 0), Y & 6)) throw Error(I(327));
  var n = e.callbackNode;
  if (Gn() && e.callbackNode !== n) return null;
  var r = io(e, e === _e ? be : 0);
  if (r === 0) return null;
  if (r & 30 || r & e.expiredLanes || t) t = ko(e, r);
  else {
    t = r;
    var i = Y;
    Y |= 2;
    var o = Nf();
    (_e !== e || be !== t) && ((jt = null), (rr = fe() + 500), xn(e, t));
    do
      try {
        Wg();
        break;
      } catch (a) {
        Lf(e, a);
      }
    while (!0);
    (ra(),
      (So.current = o),
      (Y = i),
      ge !== null ? (t = 0) : ((_e = null), (be = 0), (t = xe)));
  }
  if (t !== 0) {
    if (
      (t === 2 && ((i = Vl(e)), i !== 0 && ((r = i), (t = ys(e, i)))), t === 1)
    )
      throw ((n = oi), xn(e, 0), Bt(e, r), We(e, fe()), n);
    if (t === 6) Bt(e, r);
    else {
      if (
        ((i = e.current.alternate),
        !(r & 30) &&
          !Fg(i) &&
          ((t = ko(e, r)),
          t === 2 && ((o = Vl(e)), o !== 0 && ((r = o), (t = ys(e, o)))),
          t === 1))
      )
        throw ((n = oi), xn(e, 0), Bt(e, r), We(e, fe()), n);
      switch (((e.finishedWork = i), (e.finishedLanes = r), t)) {
        case 0:
        case 1:
          throw Error(I(345));
        case 2:
          hn(e, De, jt);
          break;
        case 3:
          if (
            (Bt(e, r), (r & 130023424) === r && ((t = xa + 500 - fe()), 10 < t))
          ) {
            if (io(e, 0) !== 0) break;
            if (((i = e.suspendedLanes), (i & r) !== r)) {
              (Ie(), (e.pingedLanes |= e.suspendedLanes & i));
              break;
            }
            e.timeoutHandle = ql(hn.bind(null, e, De, jt), t);
            break;
          }
          hn(e, De, jt);
          break;
        case 4:
          if ((Bt(e, r), (r & 4194240) === r)) break;
          for (t = e.eventTimes, i = -1; 0 < r; ) {
            var s = 31 - ct(r);
            ((o = 1 << s), (s = t[s]), s > i && (i = s), (r &= ~o));
          }
          if (
            ((r = i),
            (r = fe() - r),
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
                          : 1960 * Ag(r / 1960)) - r),
            10 < r)
          ) {
            e.timeoutHandle = ql(hn.bind(null, e, De, jt), r);
            break;
          }
          hn(e, De, jt);
          break;
        case 5:
          hn(e, De, jt);
          break;
        default:
          throw Error(I(329));
      }
    }
  }
  return (We(e, fe()), e.callbackNode === n ? If.bind(null, e) : null);
}
function ys(e, t) {
  var n = Fr;
  return (
    e.current.memoizedState.isDehydrated && (xn(e, t).flags |= 256),
    (e = ko(e, t)),
    e !== 2 && ((t = De), (De = n), t !== null && Ss(t)),
    e
  );
}
function Ss(e) {
  De === null ? (De = e) : De.push.apply(De, e);
}
function Fg(e) {
  for (var t = e; ; ) {
    if (t.flags & 16384) {
      var n = t.updateQueue;
      if (n !== null && ((n = n.stores), n !== null))
        for (var r = 0; r < n.length; r++) {
          var i = n[r],
            o = i.getSnapshot;
          i = i.value;
          try {
            if (!ft(o(), i)) return !1;
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
function Bt(e, t) {
  for (
    t &= ~va,
      t &= ~$o,
      e.suspendedLanes |= t,
      e.pingedLanes &= ~t,
      e = e.expirationTimes;
    0 < t;
  ) {
    var n = 31 - ct(t),
      r = 1 << n;
    ((e[n] = -1), (t &= ~r));
  }
}
function Yu(e) {
  if (Y & 6) throw Error(I(327));
  Gn();
  var t = io(e, 0);
  if (!(t & 1)) return (We(e, fe()), null);
  var n = ko(e, t);
  if (e.tag !== 0 && n === 2) {
    var r = Vl(e);
    r !== 0 && ((t = r), (n = ys(e, r)));
  }
  if (n === 1) throw ((n = oi), xn(e, 0), Bt(e, t), We(e, fe()), n);
  if (n === 6) throw Error(I(345));
  return (
    (e.finishedWork = e.current.alternate),
    (e.finishedLanes = t),
    hn(e, De, jt),
    We(e, fe()),
    null
  );
}
function ya(e, t) {
  var n = Y;
  Y |= 1;
  try {
    return e(t);
  } finally {
    ((Y = n), Y === 0 && ((rr = fe() + 500), Lo && on()));
  }
}
function jn(e) {
  Ut !== null && Ut.tag === 0 && !(Y & 6) && Gn();
  var t = Y;
  Y |= 1;
  var n = tt.transition,
    r = X;
  try {
    if (((tt.transition = null), (X = 1), e)) return e();
  } finally {
    ((X = r), (tt.transition = n), (Y = t), !(Y & 6) && on());
  }
}
function Sa() {
  ((Ve = Hn.current), re(Hn));
}
function xn(e, t) {
  ((e.finishedWork = null), (e.finishedLanes = 0));
  var n = e.timeoutHandle;
  if ((n !== -1 && ((e.timeoutHandle = -1), mg(n)), ge !== null))
    for (n = ge.return; n !== null; ) {
      var r = n;
      switch ((ea(r), r.tag)) {
        case 1:
          ((r = r.type.childContextTypes), r != null && uo());
          break;
        case 3:
          (tr(), re(Fe), re(Te), ua());
          break;
        case 5:
          aa(r);
          break;
        case 4:
          tr();
          break;
        case 13:
          re(le);
          break;
        case 19:
          re(le);
          break;
        case 10:
          ia(r.type._context);
          break;
        case 22:
        case 23:
          Sa();
      }
      n = n.return;
    }
  if (
    ((_e = e),
    (ge = e = Zt(e.current, null)),
    (be = Ve = t),
    (xe = 0),
    (oi = null),
    (va = $o = kn = 0),
    (De = Fr = null),
    mn !== null)
  ) {
    for (t = 0; t < mn.length; t++)
      if (((n = mn[t]), (r = n.interleaved), r !== null)) {
        n.interleaved = null;
        var i = r.next,
          o = n.pending;
        if (o !== null) {
          var s = o.next;
          ((o.next = i), (r.next = s));
        }
        n.pending = r;
      }
    mn = null;
  }
  return e;
}
function Lf(e, t) {
  do {
    var n = ge;
    try {
      if ((ra(), (Qi.current = yo), xo)) {
        for (var r = se.memoizedState; r !== null; ) {
          var i = r.queue;
          (i !== null && (i.pending = null), (r = r.next));
        }
        xo = !1;
      }
      if (
        ((wn = 0),
        (Se = ve = se = null),
        ($r = !1),
        (ni = 0),
        (ma.current = null),
        n === null || n.return === null)
      ) {
        ((xe = 1), (oi = t), (ge = null));
        break;
      }
      e: {
        var o = e,
          s = n.return,
          a = n,
          u = t;
        if (
          ((t = be),
          (a.flags |= 32768),
          u !== null && typeof u == "object" && typeof u.then == "function")
        ) {
          var c = u,
            d = a,
            p = d.tag;
          if (!(d.mode & 1) && (p === 0 || p === 11 || p === 15)) {
            var g = d.alternate;
            g
              ? ((d.updateQueue = g.updateQueue),
                (d.memoizedState = g.memoizedState),
                (d.lanes = g.lanes))
              : ((d.updateQueue = null), (d.memoizedState = null));
          }
          var k = Ou(s);
          if (k !== null) {
            ((k.flags &= -257),
              Du(k, s, a, o, t),
              k.mode & 1 && Nu(o, c, t),
              (t = k),
              (u = c));
            var x = t.updateQueue;
            if (x === null) {
              var _ = new Set();
              (_.add(u), (t.updateQueue = _));
            } else x.add(u);
            break e;
          } else {
            if (!(t & 1)) {
              (Nu(o, c, t), _a());
              break e;
            }
            u = Error(I(426));
          }
        } else if (ie && a.mode & 1) {
          var S = Ou(s);
          if (S !== null) {
            (!(S.flags & 65536) && (S.flags |= 256),
              Du(S, s, a, o, t),
              ta(nr(u, a)));
            break e;
          }
        }
        ((o = u = nr(u, a)),
          xe !== 4 && (xe = 2),
          Fr === null ? (Fr = [o]) : Fr.push(o),
          (o = s));
        do {
          switch (o.tag) {
            case 3:
              ((o.flags |= 65536), (t &= -t), (o.lanes |= t));
              var h = vf(o, u, t);
              Ru(o, h);
              break e;
            case 1:
              a = u;
              var f = o.type,
                m = o.stateNode;
              if (
                !(o.flags & 128) &&
                (typeof f.getDerivedStateFromError == "function" ||
                  (m !== null &&
                    typeof m.componentDidCatch == "function" &&
                    (Gt === null || !Gt.has(m))))
              ) {
                ((o.flags |= 65536), (t &= -t), (o.lanes |= t));
                var w = xf(o, a, t);
                Ru(o, w);
                break e;
              }
          }
          o = o.return;
        } while (o !== null);
      }
      Df(n);
    } catch (C) {
      ((t = C), ge === n && n !== null && (ge = n = n.return));
      continue;
    }
    break;
  } while (!0);
}
function Nf() {
  var e = So.current;
  return ((So.current = yo), e === null ? yo : e);
}
function _a() {
  ((xe === 0 || xe === 3 || xe === 2) && (xe = 4),
    _e === null || (!(kn & 268435455) && !($o & 268435455)) || Bt(_e, be));
}
function ko(e, t) {
  var n = Y;
  Y |= 2;
  var r = Nf();
  (_e !== e || be !== t) && ((jt = null), xn(e, t));
  do
    try {
      Bg();
      break;
    } catch (i) {
      Lf(e, i);
    }
  while (!0);
  if ((ra(), (Y = n), (So.current = r), ge !== null)) throw Error(I(261));
  return ((_e = null), (be = 0), xe);
}
function Bg() {
  for (; ge !== null; ) Of(ge);
}
function Wg() {
  for (; ge !== null && !ph(); ) Of(ge);
}
function Of(e) {
  var t = Af(e.alternate, e, Ve);
  ((e.memoizedProps = e.pendingProps),
    t === null ? Df(e) : (ge = t),
    (ma.current = null));
}
function Df(e) {
  var t = e;
  do {
    var n = t.alternate;
    if (((e = t.return), t.flags & 32768)) {
      if (((n = Ng(n, t)), n !== null)) {
        ((n.flags &= 32767), (ge = n));
        return;
      }
      if (e !== null)
        ((e.flags |= 32768), (e.subtreeFlags = 0), (e.deletions = null));
      else {
        ((xe = 6), (ge = null));
        return;
      }
    } else if (((n = Lg(n, t, Ve)), n !== null)) {
      ge = n;
      return;
    }
    if (((t = t.sibling), t !== null)) {
      ge = t;
      return;
    }
    ge = t = e;
  } while (t !== null);
  xe === 0 && (xe = 5);
}
function hn(e, t, n) {
  var r = X,
    i = tt.transition;
  try {
    ((tt.transition = null), (X = 1), Ug(e, t, n, r));
  } finally {
    ((tt.transition = i), (X = r));
  }
  return null;
}
function Ug(e, t, n, r) {
  do Gn();
  while (Ut !== null);
  if (Y & 6) throw Error(I(327));
  n = e.finishedWork;
  var i = e.finishedLanes;
  if (n === null) return null;
  if (((e.finishedWork = null), (e.finishedLanes = 0), n === e.current))
    throw Error(I(177));
  ((e.callbackNode = null), (e.callbackPriority = 0));
  var o = n.lanes | n.childLanes;
  if (
    (kh(e, o),
    e === _e && ((ge = _e = null), (be = 0)),
    (!(n.subtreeFlags & 2064) && !(n.flags & 2064)) ||
      Mi ||
      ((Mi = !0),
      Ff(ro, function () {
        return (Gn(), null);
      })),
    (o = (n.flags & 15990) !== 0),
    n.subtreeFlags & 15990 || o)
  ) {
    ((o = tt.transition), (tt.transition = null));
    var s = X;
    X = 1;
    var a = Y;
    ((Y |= 4),
      (ma.current = null),
      Dg(e, n),
      Tf(n, e),
      ug(Xl),
      (oo = !!Gl),
      (Xl = Gl = null),
      (e.current = n),
      $g(n),
      hh(),
      (Y = a),
      (X = s),
      (tt.transition = o));
  } else e.current = n;
  if (
    (Mi && ((Mi = !1), (Ut = e), (wo = i)),
    (o = e.pendingLanes),
    o === 0 && (Gt = null),
    vh(n.stateNode),
    We(e, fe()),
    t !== null)
  )
    for (r = e.onRecoverableError, n = 0; n < t.length; n++)
      ((i = t[n]), r(i.value, { componentStack: i.stack, digest: i.digest }));
  if (_o) throw ((_o = !1), (e = vs), (vs = null), e);
  return (
    wo & 1 && e.tag !== 0 && Gn(),
    (o = e.pendingLanes),
    o & 1 ? (e === xs ? Br++ : ((Br = 0), (xs = e))) : (Br = 0),
    on(),
    null
  );
}
function Gn() {
  if (Ut !== null) {
    var e = md(wo),
      t = tt.transition,
      n = X;
    try {
      if (((tt.transition = null), (X = 16 > e ? 16 : e), Ut === null))
        var r = !1;
      else {
        if (((e = Ut), (Ut = null), (wo = 0), Y & 6)) throw Error(I(331));
        var i = Y;
        for (Y |= 4, D = e.current; D !== null; ) {
          var o = D,
            s = o.child;
          if (D.flags & 16) {
            var a = o.deletions;
            if (a !== null) {
              for (var u = 0; u < a.length; u++) {
                var c = a[u];
                for (D = c; D !== null; ) {
                  var d = D;
                  switch (d.tag) {
                    case 0:
                    case 11:
                    case 15:
                      Ar(8, d, o);
                  }
                  var p = d.child;
                  if (p !== null) ((p.return = d), (D = p));
                  else
                    for (; D !== null; ) {
                      d = D;
                      var g = d.sibling,
                        k = d.return;
                      if ((zf(d), d === c)) {
                        D = null;
                        break;
                      }
                      if (g !== null) {
                        ((g.return = k), (D = g));
                        break;
                      }
                      D = k;
                    }
                }
              }
              var x = o.alternate;
              if (x !== null) {
                var _ = x.child;
                if (_ !== null) {
                  x.child = null;
                  do {
                    var S = _.sibling;
                    ((_.sibling = null), (_ = S));
                  } while (_ !== null);
                }
              }
              D = o;
            }
          }
          if (o.subtreeFlags & 2064 && s !== null) ((s.return = o), (D = s));
          else
            e: for (; D !== null; ) {
              if (((o = D), o.flags & 2048))
                switch (o.tag) {
                  case 0:
                  case 11:
                  case 15:
                    Ar(9, o, o.return);
                }
              var h = o.sibling;
              if (h !== null) {
                ((h.return = o.return), (D = h));
                break e;
              }
              D = o.return;
            }
        }
        var f = e.current;
        for (D = f; D !== null; ) {
          s = D;
          var m = s.child;
          if (s.subtreeFlags & 2064 && m !== null) ((m.return = s), (D = m));
          else
            e: for (s = f; D !== null; ) {
              if (((a = D), a.flags & 2048))
                try {
                  switch (a.tag) {
                    case 0:
                    case 11:
                    case 15:
                      Do(9, a);
                  }
                } catch (C) {
                  de(a, a.return, C);
                }
              if (a === s) {
                D = null;
                break e;
              }
              var w = a.sibling;
              if (w !== null) {
                ((w.return = a.return), (D = w));
                break e;
              }
              D = a.return;
            }
        }
        if (
          ((Y = i), on(), yt && typeof yt.onPostCommitFiberRoot == "function")
        )
          try {
            yt.onPostCommitFiberRoot(Ro, e);
          } catch {}
        r = !0;
      }
      return r;
    } finally {
      ((X = n), (tt.transition = t));
    }
  }
  return !1;
}
function Gu(e, t, n) {
  ((t = nr(n, t)),
    (t = vf(e, t, 1)),
    (e = Yt(e, t, 1)),
    (t = Ie()),
    e !== null && (di(e, 1, t), We(e, t)));
}
function de(e, t, n) {
  if (e.tag === 3) Gu(e, e, n);
  else
    for (; t !== null; ) {
      if (t.tag === 3) {
        Gu(t, e, n);
        break;
      } else if (t.tag === 1) {
        var r = t.stateNode;
        if (
          typeof t.type.getDerivedStateFromError == "function" ||
          (typeof r.componentDidCatch == "function" &&
            (Gt === null || !Gt.has(r)))
        ) {
          ((e = nr(n, e)),
            (e = xf(t, e, 1)),
            (t = Yt(t, e, 1)),
            (e = Ie()),
            t !== null && (di(t, 1, e), We(t, e)));
          break;
        }
      }
      t = t.return;
    }
}
function Hg(e, t, n) {
  var r = e.pingCache;
  (r !== null && r.delete(t),
    (t = Ie()),
    (e.pingedLanes |= e.suspendedLanes & n),
    _e === e &&
      (be & n) === n &&
      (xe === 4 || (xe === 3 && (be & 130023424) === be && 500 > fe() - xa)
        ? xn(e, 0)
        : (va |= n)),
    We(e, t));
}
function $f(e, t) {
  t === 0 &&
    (e.mode & 1
      ? ((t = wi), (wi <<= 1), !(wi & 130023424) && (wi = 4194304))
      : (t = 1));
  var n = Ie();
  ((e = Tt(e, t)), e !== null && (di(e, t, n), We(e, n)));
}
function Vg(e) {
  var t = e.memoizedState,
    n = 0;
  (t !== null && (n = t.retryLane), $f(e, n));
}
function Kg(e, t) {
  var n = 0;
  switch (e.tag) {
    case 13:
      var r = e.stateNode,
        i = e.memoizedState;
      i !== null && (n = i.retryLane);
      break;
    case 19:
      r = e.stateNode;
      break;
    default:
      throw Error(I(314));
  }
  (r !== null && r.delete(t), $f(e, n));
}
var Af;
Af = function (e, t, n) {
  if (e !== null)
    if (e.memoizedProps !== t.pendingProps || Fe.current) $e = !0;
    else {
      if (!(e.lanes & n) && !(t.flags & 128)) return (($e = !1), Ig(e, t, n));
      $e = !!(e.flags & 131072);
    }
  else (($e = !1), ie && t.flags & 1048576 && Wd(t, po, t.index));
  switch (((t.lanes = 0), t.tag)) {
    case 2:
      var r = t.type;
      (Gi(e, t), (e = t.pendingProps));
      var i = Zn(t, Te.current);
      (Yn(t, n), (i = da(null, t, r, e, i, n)));
      var o = fa();
      return (
        (t.flags |= 1),
        typeof i == "object" &&
        i !== null &&
        typeof i.render == "function" &&
        i.$$typeof === void 0
          ? ((t.tag = 1),
            (t.memoizedState = null),
            (t.updateQueue = null),
            Be(r) ? ((o = !0), co(t)) : (o = !1),
            (t.memoizedState =
              i.state !== null && i.state !== void 0 ? i.state : null),
            la(t),
            (i.updater = Oo),
            (t.stateNode = i),
            (i._reactInternals = t),
            ls(t, r, e, n),
            (t = us(null, t, r, !0, o, n)))
          : ((t.tag = 0), ie && o && qs(t), Me(null, t, i, n), (t = t.child)),
        t
      );
    case 16:
      r = t.elementType;
      e: {
        switch (
          (Gi(e, t),
          (e = t.pendingProps),
          (i = r._init),
          (r = i(r._payload)),
          (t.type = r),
          (i = t.tag = Qg(r)),
          (e = lt(r, e)),
          i)
        ) {
          case 0:
            t = as(null, t, r, e, n);
            break e;
          case 1:
            t = Fu(null, t, r, e, n);
            break e;
          case 11:
            t = $u(null, t, r, e, n);
            break e;
          case 14:
            t = Au(null, t, r, lt(r.type, e), n);
            break e;
        }
        throw Error(I(306, r, ""));
      }
      return t;
    case 0:
      return (
        (r = t.type),
        (i = t.pendingProps),
        (i = t.elementType === r ? i : lt(r, i)),
        as(e, t, r, i, n)
      );
    case 1:
      return (
        (r = t.type),
        (i = t.pendingProps),
        (i = t.elementType === r ? i : lt(r, i)),
        Fu(e, t, r, i, n)
      );
    case 3:
      e: {
        if ((wf(t), e === null)) throw Error(I(387));
        ((r = t.pendingProps),
          (o = t.memoizedState),
          (i = o.element),
          Qd(e, t),
          mo(t, r, null, n));
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
            ((i = nr(Error(I(423)), t)), (t = Bu(e, t, r, n, i)));
            break e;
          } else if (r !== i) {
            ((i = nr(Error(I(424)), t)), (t = Bu(e, t, r, n, i)));
            break e;
          } else
            for (
              Ke = Qt(t.stateNode.containerInfo.firstChild),
                Je = t,
                ie = !0,
                at = null,
                n = Kd(t, null, r, n),
                t.child = n;
              n;
            )
              ((n.flags = (n.flags & -3) | 4096), (n = n.sibling));
        else {
          if ((qn(), r === i)) {
            t = Mt(e, t, n);
            break e;
          }
          Me(e, t, r, n);
        }
        t = t.child;
      }
      return t;
    case 5:
      return (
        Yd(t),
        e === null && rs(t),
        (r = t.type),
        (i = t.pendingProps),
        (o = e !== null ? e.memoizedProps : null),
        (s = i.children),
        Zl(r, i) ? (s = null) : o !== null && Zl(r, o) && (t.flags |= 32),
        _f(e, t),
        Me(e, t, s, n),
        t.child
      );
    case 6:
      return (e === null && rs(t), null);
    case 13:
      return kf(e, t, n);
    case 4:
      return (
        sa(t, t.stateNode.containerInfo),
        (r = t.pendingProps),
        e === null ? (t.child = er(t, null, r, n)) : Me(e, t, r, n),
        t.child
      );
    case 11:
      return (
        (r = t.type),
        (i = t.pendingProps),
        (i = t.elementType === r ? i : lt(r, i)),
        $u(e, t, r, i, n)
      );
    case 7:
      return (Me(e, t, t.pendingProps, n), t.child);
    case 8:
      return (Me(e, t, t.pendingProps.children, n), t.child);
    case 12:
      return (Me(e, t, t.pendingProps.children, n), t.child);
    case 10:
      e: {
        if (
          ((r = t.type._context),
          (i = t.pendingProps),
          (o = t.memoizedProps),
          (s = i.value),
          ee(ho, r._currentValue),
          (r._currentValue = s),
          o !== null)
        )
          if (ft(o.value, s)) {
            if (o.children === i.children && !Fe.current) {
              t = Mt(e, t, n);
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
                      ((u = zt(-1, n & -n)), (u.tag = 2));
                      var c = o.updateQueue;
                      if (c !== null) {
                        c = c.shared;
                        var d = c.pending;
                        (d === null
                          ? (u.next = u)
                          : ((u.next = d.next), (d.next = u)),
                          (c.pending = u));
                      }
                    }
                    ((o.lanes |= n),
                      (u = o.alternate),
                      u !== null && (u.lanes |= n),
                      is(o.return, n, t),
                      (a.lanes |= n));
                    break;
                  }
                  u = u.next;
                }
              } else if (o.tag === 10) s = o.type === t.type ? null : o.child;
              else if (o.tag === 18) {
                if (((s = o.return), s === null)) throw Error(I(341));
                ((s.lanes |= n),
                  (a = s.alternate),
                  a !== null && (a.lanes |= n),
                  is(s, n, t),
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
        (Me(e, t, i.children, n), (t = t.child));
      }
      return t;
    case 9:
      return (
        (i = t.type),
        (r = t.pendingProps.children),
        Yn(t, n),
        (i = nt(i)),
        (r = r(i)),
        (t.flags |= 1),
        Me(e, t, r, n),
        t.child
      );
    case 14:
      return (
        (r = t.type),
        (i = lt(r, t.pendingProps)),
        (i = lt(r.type, i)),
        Au(e, t, r, i, n)
      );
    case 15:
      return yf(e, t, t.type, t.pendingProps, n);
    case 17:
      return (
        (r = t.type),
        (i = t.pendingProps),
        (i = t.elementType === r ? i : lt(r, i)),
        Gi(e, t),
        (t.tag = 1),
        Be(r) ? ((e = !0), co(t)) : (e = !1),
        Yn(t, n),
        mf(t, r, i),
        ls(t, r, i, n),
        us(null, t, r, !0, e, n)
      );
    case 19:
      return jf(e, t, n);
    case 22:
      return Sf(e, t, n);
  }
  throw Error(I(156, t.tag));
};
function Ff(e, t) {
  return fd(e, t);
}
function Jg(e, t, n, r) {
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
function et(e, t, n, r) {
  return new Jg(e, t, n, r);
}
function wa(e) {
  return ((e = e.prototype), !(!e || !e.isReactComponent));
}
function Qg(e) {
  if (typeof e == "function") return wa(e) ? 1 : 0;
  if (e != null) {
    if (((e = e.$$typeof), e === Bs)) return 11;
    if (e === Ws) return 14;
  }
  return 2;
}
function Zt(e, t) {
  var n = e.alternate;
  return (
    n === null
      ? ((n = et(e.tag, t, e.key, e.mode)),
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
function qi(e, t, n, r, i, o) {
  var s = 2;
  if (((r = e), typeof e == "function")) wa(e) && (s = 1);
  else if (typeof e == "string") s = 5;
  else
    e: switch (e) {
      case Ln:
        return yn(n.children, i, o, t);
      case Fs:
        ((s = 8), (i |= 8));
        break;
      case Pl:
        return (
          (e = et(12, n, t, i | 2)),
          (e.elementType = Pl),
          (e.lanes = o),
          e
        );
      case Tl:
        return ((e = et(13, n, t, i)), (e.elementType = Tl), (e.lanes = o), e);
      case Ml:
        return ((e = et(19, n, t, i)), (e.elementType = Ml), (e.lanes = o), e);
      case Yc:
        return Ao(n, i, o, t);
      default:
        if (typeof e == "object" && e !== null)
          switch (e.$$typeof) {
            case Jc:
              s = 10;
              break e;
            case Qc:
              s = 9;
              break e;
            case Bs:
              s = 11;
              break e;
            case Ws:
              s = 14;
              break e;
            case $t:
              ((s = 16), (r = null));
              break e;
          }
        throw Error(I(130, e == null ? e : typeof e, ""));
    }
  return (
    (t = et(s, n, t, i)),
    (t.elementType = e),
    (t.type = r),
    (t.lanes = o),
    t
  );
}
function yn(e, t, n, r) {
  return ((e = et(7, e, r, t)), (e.lanes = n), e);
}
function Ao(e, t, n, r) {
  return (
    (e = et(22, e, r, t)),
    (e.elementType = Yc),
    (e.lanes = n),
    (e.stateNode = { isHidden: !1 }),
    e
  );
}
function _l(e, t, n) {
  return ((e = et(6, e, null, t)), (e.lanes = n), e);
}
function wl(e, t, n) {
  return (
    (t = et(4, e.children !== null ? e.children : [], e.key, t)),
    (t.lanes = n),
    (t.stateNode = {
      containerInfo: e.containerInfo,
      pendingChildren: null,
      implementation: e.implementation,
    }),
    t
  );
}
function Yg(e, t, n, r, i) {
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
    (this.eventTimes = nl(0)),
    (this.expirationTimes = nl(-1)),
    (this.entangledLanes =
      this.finishedLanes =
      this.mutableReadLanes =
      this.expiredLanes =
      this.pingedLanes =
      this.suspendedLanes =
      this.pendingLanes =
        0),
    (this.entanglements = nl(0)),
    (this.identifierPrefix = r),
    (this.onRecoverableError = i),
    (this.mutableSourceEagerHydrationData = null));
}
function ka(e, t, n, r, i, o, s, a, u) {
  return (
    (e = new Yg(e, t, n, a, u)),
    t === 1 ? ((t = 1), o === !0 && (t |= 8)) : (t = 0),
    (o = et(3, null, null, t)),
    (e.current = o),
    (o.stateNode = e),
    (o.memoizedState = {
      element: r,
      isDehydrated: n,
      cache: null,
      transitions: null,
      pendingSuspenseBoundaries: null,
    }),
    la(o),
    e
  );
}
function Gg(e, t, n) {
  var r = 3 < arguments.length && arguments[3] !== void 0 ? arguments[3] : null;
  return {
    $$typeof: In,
    key: r == null ? null : "" + r,
    children: e,
    containerInfo: t,
    implementation: n,
  };
}
function Bf(e) {
  if (!e) return tn;
  e = e._reactInternals;
  e: {
    if (En(e) !== e || e.tag !== 1) throw Error(I(170));
    var t = e;
    do {
      switch (t.tag) {
        case 3:
          t = t.stateNode.context;
          break e;
        case 1:
          if (Be(t.type)) {
            t = t.stateNode.__reactInternalMemoizedMergedChildContext;
            break e;
          }
      }
      t = t.return;
    } while (t !== null);
    throw Error(I(171));
  }
  if (e.tag === 1) {
    var n = e.type;
    if (Be(n)) return Fd(e, n, t);
  }
  return t;
}
function Wf(e, t, n, r, i, o, s, a, u) {
  return (
    (e = ka(n, r, !0, e, i, o, s, a, u)),
    (e.context = Bf(null)),
    (n = e.current),
    (r = Ie()),
    (i = Xt(n)),
    (o = zt(r, i)),
    (o.callback = t ?? null),
    Yt(n, o, i),
    (e.current.lanes = i),
    di(e, i, r),
    We(e, r),
    e
  );
}
function Fo(e, t, n, r) {
  var i = t.current,
    o = Ie(),
    s = Xt(i);
  return (
    (n = Bf(n)),
    t.context === null ? (t.context = n) : (t.pendingContext = n),
    (t = zt(o, s)),
    (t.payload = { element: e }),
    (r = r === void 0 ? null : r),
    r !== null && (t.callback = r),
    (e = Yt(i, t, s)),
    e !== null && (dt(e, i, s, o), Ji(e, i, s)),
    s
  );
}
function jo(e) {
  if (((e = e.current), !e.child)) return null;
  switch (e.child.tag) {
    case 5:
      return e.child.stateNode;
    default:
      return e.child.stateNode;
  }
}
function Xu(e, t) {
  if (((e = e.memoizedState), e !== null && e.dehydrated !== null)) {
    var n = e.retryLane;
    e.retryLane = n !== 0 && n < t ? n : t;
  }
}
function ja(e, t) {
  (Xu(e, t), (e = e.alternate) && Xu(e, t));
}
function Xg() {
  return null;
}
var Uf =
  typeof reportError == "function"
    ? reportError
    : function (e) {
        console.error(e);
      };
function ba(e) {
  this._internalRoot = e;
}
Bo.prototype.render = ba.prototype.render = function (e) {
  var t = this._internalRoot;
  if (t === null) throw Error(I(409));
  Fo(e, t, null, null);
};
Bo.prototype.unmount = ba.prototype.unmount = function () {
  var e = this._internalRoot;
  if (e !== null) {
    this._internalRoot = null;
    var t = e.containerInfo;
    (jn(function () {
      Fo(null, e, null, null);
    }),
      (t[Pt] = null));
  }
};
function Bo(e) {
  this._internalRoot = e;
}
Bo.prototype.unstable_scheduleHydration = function (e) {
  if (e) {
    var t = yd();
    e = { blockedOn: null, target: e, priority: t };
    for (var n = 0; n < Ft.length && t !== 0 && t < Ft[n].priority; n++);
    (Ft.splice(n, 0, e), n === 0 && _d(e));
  }
};
function Ca(e) {
  return !(!e || (e.nodeType !== 1 && e.nodeType !== 9 && e.nodeType !== 11));
}
function Wo(e) {
  return !(
    !e ||
    (e.nodeType !== 1 &&
      e.nodeType !== 9 &&
      e.nodeType !== 11 &&
      (e.nodeType !== 8 || e.nodeValue !== " react-mount-point-unstable "))
  );
}
function Zu() {}
function Zg(e, t, n, r, i) {
  if (i) {
    if (typeof r == "function") {
      var o = r;
      r = function () {
        var c = jo(s);
        o.call(c);
      };
    }
    var s = Wf(t, r, e, 0, null, !1, !1, "", Zu);
    return (
      (e._reactRootContainer = s),
      (e[Pt] = s.current),
      Xr(e.nodeType === 8 ? e.parentNode : e),
      jn(),
      s
    );
  }
  for (; (i = e.lastChild); ) e.removeChild(i);
  if (typeof r == "function") {
    var a = r;
    r = function () {
      var c = jo(u);
      a.call(c);
    };
  }
  var u = ka(e, 0, !1, null, null, !1, !1, "", Zu);
  return (
    (e._reactRootContainer = u),
    (e[Pt] = u.current),
    Xr(e.nodeType === 8 ? e.parentNode : e),
    jn(function () {
      Fo(t, u, n, r);
    }),
    u
  );
}
function Uo(e, t, n, r, i) {
  var o = n._reactRootContainer;
  if (o) {
    var s = o;
    if (typeof i == "function") {
      var a = i;
      i = function () {
        var u = jo(s);
        a.call(u);
      };
    }
    Fo(t, s, e, i);
  } else s = Zg(n, t, e, i, r);
  return jo(s);
}
vd = function (e) {
  switch (e.tag) {
    case 3:
      var t = e.stateNode;
      if (t.current.memoizedState.isDehydrated) {
        var n = Pr(t.pendingLanes);
        n !== 0 &&
          (Vs(t, n | 1), We(t, fe()), !(Y & 6) && ((rr = fe() + 500), on()));
      }
      break;
    case 13:
      (jn(function () {
        var r = Tt(e, 1);
        if (r !== null) {
          var i = Ie();
          dt(r, e, 1, i);
        }
      }),
        ja(e, 1));
  }
};
Ks = function (e) {
  if (e.tag === 13) {
    var t = Tt(e, 134217728);
    if (t !== null) {
      var n = Ie();
      dt(t, e, 134217728, n);
    }
    ja(e, 134217728);
  }
};
xd = function (e) {
  if (e.tag === 13) {
    var t = Xt(e),
      n = Tt(e, t);
    if (n !== null) {
      var r = Ie();
      dt(n, e, t, r);
    }
    ja(e, t);
  }
};
yd = function () {
  return X;
};
Sd = function (e, t) {
  var n = X;
  try {
    return ((X = e), t());
  } finally {
    X = n;
  }
};
Wl = function (e, t, n) {
  switch (t) {
    case "input":
      if ((Nl(e, n), (t = n.name), n.type === "radio" && t != null)) {
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
            var i = Io(r);
            if (!i) throw Error(I(90));
            (Xc(r), Nl(r, i));
          }
        }
      }
      break;
    case "textarea":
      qc(e, n);
      break;
    case "select":
      ((t = n.value), t != null && Vn(e, !!n.multiple, t, !1));
  }
};
ld = ya;
sd = jn;
var qg = { usingClientEntryPoint: !1, Events: [pi, $n, Io, id, od, ya] },
  _r = {
    findFiberByHostInstance: gn,
    bundleType: 0,
    version: "18.3.1",
    rendererPackageName: "react-dom",
  },
  em = {
    bundleType: _r.bundleType,
    version: _r.version,
    rendererPackageName: _r.rendererPackageName,
    rendererConfig: _r.rendererConfig,
    overrideHookState: null,
    overrideHookStateDeletePath: null,
    overrideHookStateRenamePath: null,
    overrideProps: null,
    overridePropsDeletePath: null,
    overridePropsRenamePath: null,
    setErrorHandler: null,
    setSuspenseHandler: null,
    scheduleUpdate: null,
    currentDispatcherRef: It.ReactCurrentDispatcher,
    findHostInstanceByFiber: function (e) {
      return ((e = cd(e)), e === null ? null : e.stateNode);
    },
    findFiberByHostInstance: _r.findFiberByHostInstance || Xg,
    findHostInstancesForRefresh: null,
    scheduleRefresh: null,
    scheduleRoot: null,
    setRefreshHandler: null,
    getCurrentFiber: null,
    reconcilerVersion: "18.3.1-next-f1338f8080-20240426",
  };
if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u") {
  var Ii = __REACT_DEVTOOLS_GLOBAL_HOOK__;
  if (!Ii.isDisabled && Ii.supportsFiber)
    try {
      ((Ro = Ii.inject(em)), (yt = Ii));
    } catch {}
}
Ye.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = qg;
Ye.createPortal = function (e, t) {
  var n = 2 < arguments.length && arguments[2] !== void 0 ? arguments[2] : null;
  if (!Ca(t)) throw Error(I(200));
  return Gg(e, t, null, n);
};
Ye.createRoot = function (e, t) {
  if (!Ca(e)) throw Error(I(299));
  var n = !1,
    r = "",
    i = Uf;
  return (
    t != null &&
      (t.unstable_strictMode === !0 && (n = !0),
      t.identifierPrefix !== void 0 && (r = t.identifierPrefix),
      t.onRecoverableError !== void 0 && (i = t.onRecoverableError)),
    (t = ka(e, 1, !1, null, null, n, !1, r, i)),
    (e[Pt] = t.current),
    Xr(e.nodeType === 8 ? e.parentNode : e),
    new ba(t)
  );
};
Ye.findDOMNode = function (e) {
  if (e == null) return null;
  if (e.nodeType === 1) return e;
  var t = e._reactInternals;
  if (t === void 0)
    throw typeof e.render == "function"
      ? Error(I(188))
      : ((e = Object.keys(e).join(",")), Error(I(268, e)));
  return ((e = cd(t)), (e = e === null ? null : e.stateNode), e);
};
Ye.flushSync = function (e) {
  return jn(e);
};
Ye.hydrate = function (e, t, n) {
  if (!Wo(t)) throw Error(I(200));
  return Uo(null, e, t, !0, n);
};
Ye.hydrateRoot = function (e, t, n) {
  if (!Ca(e)) throw Error(I(405));
  var r = (n != null && n.hydratedSources) || null,
    i = !1,
    o = "",
    s = Uf;
  if (
    (n != null &&
      (n.unstable_strictMode === !0 && (i = !0),
      n.identifierPrefix !== void 0 && (o = n.identifierPrefix),
      n.onRecoverableError !== void 0 && (s = n.onRecoverableError)),
    (t = Wf(t, null, e, 1, n ?? null, i, !1, o, s)),
    (e[Pt] = t.current),
    Xr(e),
    r)
  )
    for (e = 0; e < r.length; e++)
      ((n = r[e]),
        (i = n._getVersion),
        (i = i(n._source)),
        t.mutableSourceEagerHydrationData == null
          ? (t.mutableSourceEagerHydrationData = [n, i])
          : t.mutableSourceEagerHydrationData.push(n, i));
  return new Bo(t);
};
Ye.render = function (e, t, n) {
  if (!Wo(t)) throw Error(I(200));
  return Uo(null, e, t, !1, n);
};
Ye.unmountComponentAtNode = function (e) {
  if (!Wo(e)) throw Error(I(40));
  return e._reactRootContainer
    ? (jn(function () {
        Uo(null, null, e, !1, function () {
          ((e._reactRootContainer = null), (e[Pt] = null));
        });
      }),
      !0)
    : !1;
};
Ye.unstable_batchedUpdates = ya;
Ye.unstable_renderSubtreeIntoContainer = function (e, t, n, r) {
  if (!Wo(n)) throw Error(I(200));
  if (e == null || e._reactInternals === void 0) throw Error(I(38));
  return Uo(e, t, n, !1, r);
};
Ye.version = "18.3.1-next-f1338f8080-20240426";
function Hf() {
  if (
    !(
      typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ > "u" ||
      typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE != "function"
    )
  )
    try {
      __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(Hf);
    } catch (e) {
      console.error(e);
    }
}
(Hf(), (Uc.exports = Ye));
var Ea = Uc.exports,
  Vf,
  qu = Ea;
((Vf = qu.createRoot), qu.hydrateRoot);
/**
 * @remix-run/router v1.23.3
 *
 * Copyright (c) Remix Software Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 *
 * @license MIT
 */ function li() {
  return (
    (li = Object.assign
      ? Object.assign.bind()
      : function (e) {
          for (var t = 1; t < arguments.length; t++) {
            var n = arguments[t];
            for (var r in n) ({}).hasOwnProperty.call(n, r) && (e[r] = n[r]);
          }
          return e;
        }),
    li.apply(null, arguments)
  );
}
var Ht;
(function (e) {
  ((e.Pop = "POP"), (e.Push = "PUSH"), (e.Replace = "REPLACE"));
})(Ht || (Ht = {}));
const ec = "popstate";
function tm(e) {
  e === void 0 && (e = {});
  function t(r, i) {
    let { pathname: o, search: s, hash: a } = r.location;
    return _s(
      "",
      { pathname: o, search: s, hash: a },
      (i.state && i.state.usr) || null,
      (i.state && i.state.key) || "default",
    );
  }
  function n(r, i) {
    return typeof i == "string" ? i : bo(i);
  }
  return rm(t, n, null, e);
}
function ae(e, t) {
  if (e === !1 || e === null || typeof e > "u") throw new Error(t);
}
function za(e, t) {
  if (!e) {
    typeof console < "u" && console.warn(t);
    try {
      throw new Error(t);
    } catch {}
  }
}
function nm() {
  return Math.random().toString(36).substr(2, 8);
}
function tc(e, t) {
  return { usr: e.state, key: e.key, idx: t };
}
function _s(e, t, n, r) {
  return (
    n === void 0 && (n = null),
    li(
      { pathname: typeof e == "string" ? e : e.pathname, search: "", hash: "" },
      typeof t == "string" ? cr(t) : t,
      { state: n, key: (t && t.key) || r || nm() },
    )
  );
}
function bo(e) {
  let { pathname: t = "/", search: n = "", hash: r = "" } = e;
  return (
    n && n !== "?" && (t += n.charAt(0) === "?" ? n : "?" + n),
    r && r !== "#" && (t += r.charAt(0) === "#" ? r : "#" + r),
    t
  );
}
function cr(e) {
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
function rm(e, t, n, r) {
  r === void 0 && (r = {});
  let { window: i = document.defaultView, v5Compat: o = !1 } = r,
    s = i.history,
    a = Ht.Pop,
    u = null,
    c = d();
  c == null && ((c = 0), s.replaceState(li({}, s.state, { idx: c }), ""));
  function d() {
    return (s.state || { idx: null }).idx;
  }
  function p() {
    a = Ht.Pop;
    let S = d(),
      h = S == null ? null : S - c;
    ((c = S), u && u({ action: a, location: _.location, delta: h }));
  }
  function g(S, h) {
    a = Ht.Push;
    let f = _s(_.location, S, h);
    c = d() + 1;
    let m = tc(f, c),
      w = _.createHref(f);
    try {
      s.pushState(m, "", w);
    } catch (C) {
      if (C instanceof DOMException && C.name === "DataCloneError") throw C;
      i.location.assign(w);
    }
    o && u && u({ action: a, location: _.location, delta: 1 });
  }
  function k(S, h) {
    a = Ht.Replace;
    let f = _s(_.location, S, h);
    c = d();
    let m = tc(f, c),
      w = _.createHref(f);
    (s.replaceState(m, "", w),
      o && u && u({ action: a, location: _.location, delta: 0 }));
  }
  function x(S) {
    let h = i.location.origin !== "null" ? i.location.origin : i.location.href,
      f = typeof S == "string" ? S : bo(S);
    return (
      (f = f.replace(/ $/, "%20")),
      ae(
        h,
        "No window.location.(origin|href) available to create URL for href: " +
          f,
      ),
      new URL(f, h)
    );
  }
  let _ = {
    get action() {
      return a;
    },
    get location() {
      return e(i, s);
    },
    listen(S) {
      if (u) throw new Error("A history only accepts one active listener");
      return (
        i.addEventListener(ec, p),
        (u = S),
        () => {
          (i.removeEventListener(ec, p), (u = null));
        }
      );
    },
    createHref(S) {
      return t(i, S);
    },
    createURL: x,
    encodeLocation(S) {
      let h = x(S);
      return { pathname: h.pathname, search: h.search, hash: h.hash };
    },
    push: g,
    replace: k,
    go(S) {
      return s.go(S);
    },
  };
  return _;
}
var nc;
(function (e) {
  ((e.data = "data"),
    (e.deferred = "deferred"),
    (e.redirect = "redirect"),
    (e.error = "error"));
})(nc || (nc = {}));
function im(e, t, n) {
  return (n === void 0 && (n = "/"), om(e, t, n));
}
function om(e, t, n, r) {
  let i = typeof t == "string" ? cr(t) : t,
    o = ir(i.pathname || "/", n);
  if (o == null) return null;
  let s = Kf(e);
  lm(s);
  let a = null,
    u = vm(o);
  for (let c = 0; a == null && c < s.length; ++c) a = gm(s[c], u);
  return a;
}
function Kf(e, t, n, r) {
  (t === void 0 && (t = []),
    n === void 0 && (n = []),
    r === void 0 && (r = ""));
  let i = (o, s, a) => {
    let u = {
      relativePath: a === void 0 ? o.path || "" : a,
      caseSensitive: o.caseSensitive === !0,
      childrenIndex: s,
      route: o,
    };
    u.relativePath.startsWith("/") &&
      (ae(
        u.relativePath.startsWith(r),
        'Absolute route path "' +
          u.relativePath +
          '" nested under path ' +
          ('"' + r + '" is not valid. An absolute child route path ') +
          "must start with the combined path of all its parent routes.",
      ),
      (u.relativePath = u.relativePath.slice(r.length)));
    let c = qt([r, u.relativePath]),
      d = n.concat(u);
    (o.children &&
      o.children.length > 0 &&
      (ae(
        o.index !== !0,
        "Index routes must not have child routes. Please remove " +
          ('all child routes from route path "' + c + '".'),
      ),
      Kf(o.children, t, d, c)),
      !(o.path == null && !o.index) &&
        t.push({ path: c, score: pm(c, o.index), routesMeta: d }));
  };
  return (
    e.forEach((o, s) => {
      var a;
      if (o.path === "" || !((a = o.path) != null && a.includes("?"))) i(o, s);
      else for (let u of Jf(o.path)) i(o, s, u);
    }),
    t
  );
}
function Jf(e) {
  let t = e.split("/");
  if (t.length === 0) return [];
  let [n, ...r] = t,
    i = n.endsWith("?"),
    o = n.replace(/\?$/, "");
  if (r.length === 0) return i ? [o, ""] : [o];
  let s = Jf(r.join("/")),
    a = [];
  return (
    a.push(...s.map((u) => (u === "" ? o : [o, u].join("/")))),
    i && a.push(...s),
    a.map((u) => (e.startsWith("/") && u === "" ? "/" : u))
  );
}
function lm(e) {
  e.sort((t, n) =>
    t.score !== n.score
      ? n.score - t.score
      : hm(
          t.routesMeta.map((r) => r.childrenIndex),
          n.routesMeta.map((r) => r.childrenIndex),
        ),
  );
}
const sm = /^:[\w-]+$/,
  am = 3,
  um = 2,
  cm = 1,
  dm = 10,
  fm = -2,
  rc = (e) => e === "*";
function pm(e, t) {
  let n = e.split("/"),
    r = n.length;
  return (
    n.some(rc) && (r += fm),
    t && (r += um),
    n
      .filter((i) => !rc(i))
      .reduce((i, o) => i + (sm.test(o) ? am : o === "" ? cm : dm), r)
  );
}
function hm(e, t) {
  return e.length === t.length && e.slice(0, -1).every((r, i) => r === t[i])
    ? e[e.length - 1] - t[t.length - 1]
    : 0;
}
function gm(e, t, n) {
  let { routesMeta: r } = e,
    i = {},
    o = "/",
    s = [];
  for (let a = 0; a < r.length; ++a) {
    let u = r[a],
      c = a === r.length - 1,
      d = o === "/" ? t : t.slice(o.length) || "/",
      p = ws(
        { path: u.relativePath, caseSensitive: u.caseSensitive, end: c },
        d,
      ),
      g = u.route;
    if (!p) return null;
    (Object.assign(i, p.params),
      s.push({
        params: i,
        pathname: qt([o, p.pathname]),
        pathnameBase: wm(qt([o, p.pathnameBase])),
        route: g,
      }),
      p.pathnameBase !== "/" && (o = qt([o, p.pathnameBase])));
  }
  return s;
}
function ws(e, t) {
  typeof e == "string" && (e = { path: e, caseSensitive: !1, end: !0 });
  let [n, r] = mm(e.path, e.caseSensitive, e.end),
    i = t.match(n);
  if (!i) return null;
  let o = i[0],
    s = o.replace(/(.)\/+$/, "$1"),
    a = i.slice(1);
  return {
    params: r.reduce((c, d, p) => {
      let { paramName: g, isOptional: k } = d;
      if (g === "*") {
        let _ = a[p] || "";
        s = o.slice(0, o.length - _.length).replace(/(.)\/+$/, "$1");
      }
      const x = a[p];
      return (
        k && !x ? (c[g] = void 0) : (c[g] = (x || "").replace(/%2F/g, "/")),
        c
      );
    }, {}),
    pathname: o,
    pathnameBase: s,
    pattern: e,
  };
}
function mm(e, t, n) {
  (t === void 0 && (t = !1),
    n === void 0 && (n = !0),
    za(
      e === "*" || !e.endsWith("*") || e.endsWith("/*"),
      'Route path "' +
        e +
        '" will be treated as if it were ' +
        ('"' + e.replace(/\*$/, "/*") + '" because the `*` character must ') +
        "always follow a `/` in the pattern. To get rid of this warning, " +
        ('please change the route path to "' + e.replace(/\*$/, "/*") + '".'),
    ));
  let r = [],
    i =
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
        (i += e === "*" || e === "/*" ? "(.*)$" : "(?:\\/(.+)|\\/*)$"))
      : n
        ? (i += "\\/*$")
        : e !== "" && e !== "/" && (i += "(?:(?=\\/|$))"),
    [new RegExp(i, t ? void 0 : "i"), r]
  );
}
function vm(e) {
  try {
    return e
      .split("/")
      .map((t) => decodeURIComponent(t).replace(/\//g, "%2F"))
      .join("/");
  } catch (t) {
    return (
      za(
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
function ir(e, t) {
  if (t === "/") return e;
  if (!e.toLowerCase().startsWith(t.toLowerCase())) return null;
  let n = t.endsWith("/") ? t.length - 1 : t.length,
    r = e.charAt(n);
  return r && r !== "/" ? null : e.slice(n) || "/";
}
const xm = /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i,
  ym = (e) => xm.test(e);
function Sm(e, t) {
  t === void 0 && (t = "/");
  let {
      pathname: n,
      search: r = "",
      hash: i = "",
    } = typeof e == "string" ? cr(e) : e,
    o;
  if (n)
    if (ym(n)) o = n;
    else {
      if (n.includes("//")) {
        let s = n;
        ((n = Qf(n)),
          za(
            !1,
            "Pathnames cannot have embedded double slashes - normalizing " +
              (s + " -> " + n),
          ));
      }
      n.startsWith("/") ? (o = ic(n.substring(1), "/")) : (o = ic(n, t));
    }
  else o = t;
  return { pathname: o, search: km(r), hash: jm(i) };
}
function ic(e, t) {
  let n = t.replace(/\/+$/, "").split("/");
  return (
    e.split("/").forEach((i) => {
      i === ".." ? n.length > 1 && n.pop() : i !== "." && n.push(i);
    }),
    n.length > 1 ? n.join("/") : "/"
  );
}
function kl(e, t, n, r) {
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
function _m(e) {
  return e.filter(
    (t, n) => n === 0 || (t.route.path && t.route.path.length > 0),
  );
}
function Ra(e, t) {
  let n = _m(e);
  return t
    ? n.map((r, i) => (i === n.length - 1 ? r.pathname : r.pathnameBase))
    : n.map((r) => r.pathnameBase);
}
function Pa(e, t, n, r) {
  r === void 0 && (r = !1);
  let i;
  typeof e == "string"
    ? (i = cr(e))
    : ((i = li({}, e)),
      ae(
        !i.pathname || !i.pathname.includes("?"),
        kl("?", "pathname", "search", i),
      ),
      ae(
        !i.pathname || !i.pathname.includes("#"),
        kl("#", "pathname", "hash", i),
      ),
      ae(!i.search || !i.search.includes("#"), kl("#", "search", "hash", i)));
  let o = e === "" || i.pathname === "",
    s = o ? "/" : i.pathname,
    a;
  if (s == null) a = n;
  else {
    let p = t.length - 1;
    if (!r && s.startsWith("..")) {
      let g = s.split("/");
      for (; g[0] === ".."; ) (g.shift(), (p -= 1));
      i.pathname = g.join("/");
    }
    a = p >= 0 ? t[p] : "/";
  }
  let u = Sm(i, a),
    c = s && s !== "/" && s.endsWith("/"),
    d = (o || s === ".") && n.endsWith("/");
  return (!u.pathname.endsWith("/") && (c || d) && (u.pathname += "/"), u);
}
const Qf = (e) => e.replace(/\/\/+/g, "/"),
  qt = (e) => Qf(e.join("/")),
  wm = (e) => e.replace(/\/+$/, "").replace(/^\/*/, "/"),
  km = (e) => (!e || e === "?" ? "" : e.startsWith("?") ? e : "?" + e),
  jm = (e) => (!e || e === "#" ? "" : e.startsWith("#") ? e : "#" + e);
function bm(e) {
  return (
    e != null &&
    typeof e.status == "number" &&
    typeof e.statusText == "string" &&
    typeof e.internal == "boolean" &&
    "data" in e
  );
}
const Yf = ["post", "put", "patch", "delete"];
new Set(Yf);
const Cm = ["get", ...Yf];
new Set(Cm);
/**
 * React Router v6.30.4
 *
 * Copyright (c) Remix Software Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 *
 * @license MIT
 */ function si() {
  return (
    (si = Object.assign
      ? Object.assign.bind()
      : function (e) {
          for (var t = 1; t < arguments.length; t++) {
            var n = arguments[t];
            for (var r in n) ({}).hasOwnProperty.call(n, r) && (e[r] = n[r]);
          }
          return e;
        }),
    si.apply(null, arguments)
  );
}
const Ho = v.createContext(null),
  Gf = v.createContext(null),
  Lt = v.createContext(null),
  Vo = v.createContext(null),
  Nt = v.createContext({ outlet: null, matches: [], isDataRoute: !1 }),
  Xf = v.createContext(null);
function Em(e, t) {
  let { relative: n } = t === void 0 ? {} : t;
  dr() || ae(!1);
  let { basename: r, navigator: i } = v.useContext(Lt),
    { hash: o, pathname: s, search: a } = Ko(e, { relative: n }),
    u = s;
  return (
    r !== "/" && (u = s === "/" ? r : qt([r, s])),
    i.createHref({ pathname: u, search: a, hash: o })
  );
}
function dr() {
  return v.useContext(Vo) != null;
}
function ln() {
  return (dr() || ae(!1), v.useContext(Vo).location);
}
function Zf(e) {
  v.useContext(Lt).static || v.useLayoutEffect(e);
}
function pt() {
  let { isDataRoute: e } = v.useContext(Nt);
  return e ? Wm() : zm();
}
function zm() {
  dr() || ae(!1);
  let e = v.useContext(Ho),
    { basename: t, future: n, navigator: r } = v.useContext(Lt),
    { matches: i } = v.useContext(Nt),
    { pathname: o } = ln(),
    s = JSON.stringify(Ra(i, n.v7_relativeSplatPath)),
    a = v.useRef(!1);
  return (
    Zf(() => {
      a.current = !0;
    }),
    v.useCallback(
      function (c, d) {
        if ((d === void 0 && (d = {}), !a.current)) return;
        if (typeof c == "number") {
          r.go(c);
          return;
        }
        let p = Pa(c, JSON.parse(s), o, d.relative === "path");
        (e == null &&
          t !== "/" &&
          (p.pathname = p.pathname === "/" ? t : qt([t, p.pathname])),
          (d.replace ? r.replace : r.push)(p, d.state, d));
      },
      [t, r, s, o, e],
    )
  );
}
const Rm = v.createContext(null);
function Pm(e) {
  let t = v.useContext(Nt).outlet;
  return t && v.createElement(Rm.Provider, { value: e }, t);
}
function Ko(e, t) {
  let { relative: n } = t === void 0 ? {} : t,
    { future: r } = v.useContext(Lt),
    { matches: i } = v.useContext(Nt),
    { pathname: o } = ln(),
    s = JSON.stringify(Ra(i, r.v7_relativeSplatPath));
  return v.useMemo(() => Pa(e, JSON.parse(s), o, n === "path"), [e, s, o, n]);
}
function Tm(e, t) {
  return Mm(e, t);
}
function Mm(e, t, n, r) {
  dr() || ae(!1);
  let { navigator: i } = v.useContext(Lt),
    { matches: o } = v.useContext(Nt),
    s = o[o.length - 1],
    a = s ? s.params : {};
  s && s.pathname;
  let u = s ? s.pathnameBase : "/";
  s && s.route;
  let c = ln(),
    d;
  if (t) {
    var p;
    let S = typeof t == "string" ? cr(t) : t;
    (u === "/" || ((p = S.pathname) != null && p.startsWith(u)) || ae(!1),
      (d = S));
  } else d = c;
  let g = d.pathname || "/",
    k = g;
  if (u !== "/") {
    let S = u.replace(/^\//, "").split("/");
    k = "/" + g.replace(/^\//, "").split("/").slice(S.length).join("/");
  }
  let x = im(e, { pathname: k }),
    _ = Dm(
      x &&
        x.map((S) =>
          Object.assign({}, S, {
            params: Object.assign({}, a, S.params),
            pathname: qt([
              u,
              i.encodeLocation
                ? i.encodeLocation(S.pathname).pathname
                : S.pathname,
            ]),
            pathnameBase:
              S.pathnameBase === "/"
                ? u
                : qt([
                    u,
                    i.encodeLocation
                      ? i.encodeLocation(S.pathnameBase).pathname
                      : S.pathnameBase,
                  ]),
          }),
        ),
      o,
      n,
      r,
    );
  return t && _
    ? v.createElement(
        Vo.Provider,
        {
          value: {
            location: si(
              {
                pathname: "/",
                search: "",
                hash: "",
                state: null,
                key: "default",
              },
              d,
            ),
            navigationType: Ht.Pop,
          },
        },
        _,
      )
    : _;
}
function Im() {
  let e = Bm(),
    t = bm(e)
      ? e.status + " " + e.statusText
      : e instanceof Error
        ? e.message
        : JSON.stringify(e),
    n = e instanceof Error ? e.stack : null,
    i = { padding: "0.5rem", backgroundColor: "rgba(200,200,200, 0.5)" };
  return v.createElement(
    v.Fragment,
    null,
    v.createElement("h2", null, "Unexpected Application Error!"),
    v.createElement("h3", { style: { fontStyle: "italic" } }, t),
    n ? v.createElement("pre", { style: i }, n) : null,
    null,
  );
}
const Lm = v.createElement(Im, null);
class Nm extends v.Component {
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
      ? v.createElement(
          Nt.Provider,
          { value: this.props.routeContext },
          v.createElement(Xf.Provider, {
            value: this.state.error,
            children: this.props.component,
          }),
        )
      : this.props.children;
  }
}
function Om(e) {
  let { routeContext: t, match: n, children: r } = e,
    i = v.useContext(Ho);
  return (
    i &&
      i.static &&
      i.staticContext &&
      (n.route.errorElement || n.route.ErrorBoundary) &&
      (i.staticContext._deepestRenderedBoundaryId = n.route.id),
    v.createElement(Nt.Provider, { value: t }, r)
  );
}
function Dm(e, t, n, r) {
  var i;
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
    a = (i = n) == null ? void 0 : i.errors;
  if (a != null) {
    let d = s.findIndex(
      (p) => p.route.id && (a == null ? void 0 : a[p.route.id]) !== void 0,
    );
    (d >= 0 || ae(!1), (s = s.slice(0, Math.min(s.length, d + 1))));
  }
  let u = !1,
    c = -1;
  if (n && r && r.v7_partialHydration)
    for (let d = 0; d < s.length; d++) {
      let p = s[d];
      if (
        ((p.route.HydrateFallback || p.route.hydrateFallbackElement) && (c = d),
        p.route.id)
      ) {
        let { loaderData: g, errors: k } = n,
          x =
            p.route.loader &&
            g[p.route.id] === void 0 &&
            (!k || k[p.route.id] === void 0);
        if (p.route.lazy || x) {
          ((u = !0), c >= 0 ? (s = s.slice(0, c + 1)) : (s = [s[0]]));
          break;
        }
      }
    }
  return s.reduceRight((d, p, g) => {
    let k,
      x = !1,
      _ = null,
      S = null;
    n &&
      ((k = a && p.route.id ? a[p.route.id] : void 0),
      (_ = p.route.errorElement || Lm),
      u &&
        (c < 0 && g === 0
          ? (Um("route-fallback"), (x = !0), (S = null))
          : c === g &&
            ((x = !0), (S = p.route.hydrateFallbackElement || null))));
    let h = t.concat(s.slice(0, g + 1)),
      f = () => {
        let m;
        return (
          k
            ? (m = _)
            : x
              ? (m = S)
              : p.route.Component
                ? (m = v.createElement(p.route.Component, null))
                : p.route.element
                  ? (m = p.route.element)
                  : (m = d),
          v.createElement(Om, {
            match: p,
            routeContext: { outlet: d, matches: h, isDataRoute: n != null },
            children: m,
          })
        );
      };
    return n && (p.route.ErrorBoundary || p.route.errorElement || g === 0)
      ? v.createElement(Nm, {
          location: n.location,
          revalidation: n.revalidation,
          component: _,
          error: k,
          children: f(),
          routeContext: { outlet: null, matches: h, isDataRoute: !0 },
        })
      : f();
  }, null);
}
var qf = (function (e) {
    return (
      (e.UseBlocker = "useBlocker"),
      (e.UseRevalidator = "useRevalidator"),
      (e.UseNavigateStable = "useNavigate"),
      e
    );
  })(qf || {}),
  ep = (function (e) {
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
  })(ep || {});
function $m(e) {
  let t = v.useContext(Ho);
  return (t || ae(!1), t);
}
function Am(e) {
  let t = v.useContext(Gf);
  return (t || ae(!1), t);
}
function Fm(e) {
  let t = v.useContext(Nt);
  return (t || ae(!1), t);
}
function tp(e) {
  let t = Fm(),
    n = t.matches[t.matches.length - 1];
  return (n.route.id || ae(!1), n.route.id);
}
function Bm() {
  var e;
  let t = v.useContext(Xf),
    n = Am(),
    r = tp();
  return t !== void 0 ? t : (e = n.errors) == null ? void 0 : e[r];
}
function Wm() {
  let { router: e } = $m(qf.UseNavigateStable),
    t = tp(ep.UseNavigateStable),
    n = v.useRef(!1);
  return (
    Zf(() => {
      n.current = !0;
    }),
    v.useCallback(
      function (i, o) {
        (o === void 0 && (o = {}),
          n.current &&
            (typeof i == "number"
              ? e.navigate(i)
              : e.navigate(i, si({ fromRouteId: t }, o))));
      },
      [e, t],
    )
  );
}
const oc = {};
function Um(e, t, n) {
  oc[e] || (oc[e] = !0);
}
function Hm(e, t) {
  (e == null || e.v7_startTransition, e == null || e.v7_relativeSplatPath);
}
function np(e) {
  let { to: t, replace: n, state: r, relative: i } = e;
  dr() || ae(!1);
  let { future: o, static: s } = v.useContext(Lt),
    { matches: a } = v.useContext(Nt),
    { pathname: u } = ln(),
    c = pt(),
    d = Pa(t, Ra(a, o.v7_relativeSplatPath), u, i === "path"),
    p = JSON.stringify(d);
  return (
    v.useEffect(
      () => c(JSON.parse(p), { replace: n, state: r, relative: i }),
      [c, p, i, n, r],
    ),
    null
  );
}
function Vm(e) {
  return Pm(e.context);
}
function gt(e) {
  ae(!1);
}
function Km(e) {
  let {
    basename: t = "/",
    children: n = null,
    location: r,
    navigationType: i = Ht.Pop,
    navigator: o,
    static: s = !1,
    future: a,
  } = e;
  dr() && ae(!1);
  let u = t.replace(/^\/*/, "/"),
    c = v.useMemo(
      () => ({
        basename: u,
        navigator: o,
        static: s,
        future: si({ v7_relativeSplatPath: !1 }, a),
      }),
      [u, a, o, s],
    );
  typeof r == "string" && (r = cr(r));
  let {
      pathname: d = "/",
      search: p = "",
      hash: g = "",
      state: k = null,
      key: x = "default",
    } = r,
    _ = v.useMemo(() => {
      let S = ir(d, u);
      return S == null
        ? null
        : {
            location: { pathname: S, search: p, hash: g, state: k, key: x },
            navigationType: i,
          };
    }, [u, d, p, g, k, x, i]);
  return _ == null
    ? null
    : v.createElement(
        Lt.Provider,
        { value: c },
        v.createElement(Vo.Provider, { children: n, value: _ }),
      );
}
function Jm(e) {
  let { children: t, location: n } = e;
  return Tm(ks(t), n);
}
new Promise(() => {});
function ks(e, t) {
  t === void 0 && (t = []);
  let n = [];
  return (
    v.Children.forEach(e, (r, i) => {
      if (!v.isValidElement(r)) return;
      let o = [...t, i];
      if (r.type === v.Fragment) {
        n.push.apply(n, ks(r.props.children, o));
        return;
      }
      (r.type !== gt && ae(!1), !r.props.index || !r.props.children || ae(!1));
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
      (r.props.children && (s.children = ks(r.props.children, o)), n.push(s));
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
 */ function Co() {
  return (
    (Co = Object.assign
      ? Object.assign.bind()
      : function (e) {
          for (var t = 1; t < arguments.length; t++) {
            var n = arguments[t];
            for (var r in n) ({}).hasOwnProperty.call(n, r) && (e[r] = n[r]);
          }
          return e;
        }),
    Co.apply(null, arguments)
  );
}
function rp(e, t) {
  if (e == null) return {};
  var n = {};
  for (var r in e)
    if ({}.hasOwnProperty.call(e, r)) {
      if (t.indexOf(r) !== -1) continue;
      n[r] = e[r];
    }
  return n;
}
function Qm(e) {
  return !!(e.metaKey || e.altKey || e.ctrlKey || e.shiftKey);
}
function Ym(e, t) {
  return e.button === 0 && (!t || t === "_self") && !Qm(e);
}
function js(e) {
  return (
    e === void 0 && (e = ""),
    new URLSearchParams(
      typeof e == "string" || Array.isArray(e) || e instanceof URLSearchParams
        ? e
        : Object.keys(e).reduce((t, n) => {
            let r = e[n];
            return t.concat(Array.isArray(r) ? r.map((i) => [n, i]) : [[n, r]]);
          }, []),
    )
  );
}
function Gm(e, t) {
  let n = js(e);
  return (
    t &&
      t.forEach((r, i) => {
        n.has(i) ||
          t.getAll(i).forEach((o) => {
            n.append(i, o);
          });
      }),
    n
  );
}
const Xm = [
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
  Zm = [
    "aria-current",
    "caseSensitive",
    "className",
    "end",
    "style",
    "to",
    "viewTransition",
    "children",
  ],
  qm = "6";
try {
  window.__reactRouterVersion = qm;
} catch {}
const e0 = v.createContext({ isTransitioning: !1 }),
  t0 = "startTransition",
  lc = Hp[t0];
function n0(e) {
  let { basename: t, children: n, future: r, window: i } = e,
    o = v.useRef();
  o.current == null && (o.current = tm({ window: i, v5Compat: !0 }));
  let s = o.current,
    [a, u] = v.useState({ action: s.action, location: s.location }),
    { v7_startTransition: c } = r || {},
    d = v.useCallback(
      (p) => {
        c && lc ? lc(() => u(p)) : u(p);
      },
      [u, c],
    );
  return (
    v.useLayoutEffect(() => s.listen(d), [s, d]),
    v.useEffect(() => Hm(r), [r]),
    v.createElement(Km, {
      basename: t,
      children: n,
      location: a.location,
      navigationType: a.action,
      navigator: s,
      future: r,
    })
  );
}
const r0 =
    typeof window < "u" &&
    typeof window.document < "u" &&
    typeof window.document.createElement < "u",
  i0 = /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i,
  o0 = v.forwardRef(function (t, n) {
    let {
        onClick: r,
        relative: i,
        reloadDocument: o,
        replace: s,
        state: a,
        target: u,
        to: c,
        preventScrollReset: d,
        viewTransition: p,
      } = t,
      g = rp(t, Xm),
      { basename: k } = v.useContext(Lt),
      x,
      _ = !1;
    if (typeof c == "string" && i0.test(c) && ((x = c), r0))
      try {
        let m = new URL(window.location.href),
          w = c.startsWith("//") ? new URL(m.protocol + c) : new URL(c),
          C = ir(w.pathname, k);
        w.origin === m.origin && C != null
          ? (c = C + w.search + w.hash)
          : (_ = !0);
      } catch {}
    let S = Em(c, { relative: i }),
      h = a0(c, {
        replace: s,
        state: a,
        target: u,
        preventScrollReset: d,
        relative: i,
        viewTransition: p,
      });
    function f(m) {
      (r && r(m), m.defaultPrevented || h(m));
    }
    return v.createElement(
      "a",
      Co({}, g, { href: x || S, onClick: _ || o ? r : f, ref: n, target: u }),
    );
  }),
  l0 = v.forwardRef(function (t, n) {
    let {
        "aria-current": r = "page",
        caseSensitive: i = !1,
        className: o = "",
        end: s = !1,
        style: a,
        to: u,
        viewTransition: c,
        children: d,
      } = t,
      p = rp(t, Zm),
      g = Ko(u, { relative: p.relative }),
      k = ln(),
      x = v.useContext(Gf),
      { navigator: _, basename: S } = v.useContext(Lt),
      h = x != null && u0(g) && c === !0,
      f = _.encodeLocation ? _.encodeLocation(g).pathname : g.pathname,
      m = k.pathname,
      w =
        x && x.navigation && x.navigation.location
          ? x.navigation.location.pathname
          : null;
    (i ||
      ((m = m.toLowerCase()),
      (w = w ? w.toLowerCase() : null),
      (f = f.toLowerCase())),
      w && S && (w = ir(w, S) || w));
    const C = f !== "/" && f.endsWith("/") ? f.length - 1 : f.length;
    let R = m === f || (!s && m.startsWith(f) && m.charAt(C) === "/"),
      z =
        w != null &&
        (w === f || (!s && w.startsWith(f) && w.charAt(f.length) === "/")),
      P = { isActive: R, isPending: z, isTransitioning: h },
      L = R ? r : void 0,
      b;
    typeof o == "function"
      ? (b = o(P))
      : (b = [
          o,
          R ? "active" : null,
          z ? "pending" : null,
          h ? "transitioning" : null,
        ]
          .filter(Boolean)
          .join(" "));
    let A = typeof a == "function" ? a(P) : a;
    return v.createElement(
      o0,
      Co({}, p, {
        "aria-current": L,
        className: b,
        ref: n,
        style: A,
        to: u,
        viewTransition: c,
      }),
      typeof d == "function" ? d(P) : d,
    );
  });
var bs;
(function (e) {
  ((e.UseScrollRestoration = "useScrollRestoration"),
    (e.UseSubmit = "useSubmit"),
    (e.UseSubmitFetcher = "useSubmitFetcher"),
    (e.UseFetcher = "useFetcher"),
    (e.useViewTransitionState = "useViewTransitionState"));
})(bs || (bs = {}));
var sc;
(function (e) {
  ((e.UseFetcher = "useFetcher"),
    (e.UseFetchers = "useFetchers"),
    (e.UseScrollRestoration = "useScrollRestoration"));
})(sc || (sc = {}));
function s0(e) {
  let t = v.useContext(Ho);
  return (t || ae(!1), t);
}
function a0(e, t) {
  let {
      target: n,
      replace: r,
      state: i,
      preventScrollReset: o,
      relative: s,
      viewTransition: a,
    } = t === void 0 ? {} : t,
    u = pt(),
    c = ln(),
    d = Ko(e, { relative: s });
  return v.useCallback(
    (p) => {
      if (Ym(p, n)) {
        p.preventDefault();
        let g = r !== void 0 ? r : bo(c) === bo(d);
        u(e, {
          replace: g,
          state: i,
          preventScrollReset: o,
          relative: s,
          viewTransition: a,
        });
      }
    },
    [c, u, d, r, i, n, e, o, s, a],
  );
}
function Jo(e) {
  let t = v.useRef(js(e)),
    n = v.useRef(!1),
    r = ln(),
    i = v.useMemo(() => Gm(r.search, n.current ? null : t.current), [r.search]),
    o = pt(),
    s = v.useCallback(
      (a, u) => {
        const c = js(typeof a == "function" ? a(i) : a);
        ((n.current = !0), o("?" + c, u));
      },
      [o, i],
    );
  return [i, s];
}
function u0(e, t) {
  t === void 0 && (t = {});
  let n = v.useContext(e0);
  n == null && ae(!1);
  let { basename: r } = s0(bs.useViewTransitionState),
    i = Ko(e, { relative: t.relative });
  if (!n.isTransitioning) return !1;
  let o = ir(n.currentLocation.pathname, r) || n.currentLocation.pathname,
    s = ir(n.nextLocation.pathname, r) || n.nextLocation.pathname;
  return ws(i.pathname, s) != null || ws(i.pathname, o) != null;
}
const ac = (e) => {
    let t;
    const n = new Set(),
      r = (c, d) => {
        const p = typeof c == "function" ? c(t) : c;
        if (!Object.is(p, t)) {
          const g = t;
          ((t =
            (d ?? (typeof p != "object" || p === null))
              ? p
              : Object.assign({}, t, p)),
            n.forEach((k) => k(t, g)));
        }
      },
      i = () => t,
      a = {
        setState: r,
        getState: i,
        getInitialState: () => u,
        subscribe: (c) => (n.add(c), () => n.delete(c)),
      },
      u = (t = e(r, i, a));
    return a;
  },
  c0 = (e) => (e ? ac(e) : ac),
  d0 = (e) => e;
function f0(e, t = d0) {
  const n = Er.useSyncExternalStore(
    e.subscribe,
    Er.useCallback(() => t(e.getState()), [e, t]),
    Er.useCallback(() => t(e.getInitialState()), [e, t]),
  );
  return (Er.useDebugValue(n), n);
}
const uc = (e) => {
    const t = c0(e),
      n = (r) => f0(t, r);
    return (Object.assign(n, t), n);
  },
  gi = (e) => (e ? uc(e) : uc);
function p0(e, t) {
  let n;
  try {
    n = e();
  } catch {
    return;
  }
  return {
    getItem: (i) => {
      var o;
      const s = (u) => (u === null ? null : JSON.parse(u, void 0)),
        a = (o = n.getItem(i)) != null ? o : null;
      return a instanceof Promise ? a.then(s) : s(a);
    },
    setItem: (i, o) => n.setItem(i, JSON.stringify(o, void 0)),
    removeItem: (i) => n.removeItem(i),
  };
}
const Cs = (e) => (t) => {
    try {
      const n = e(t);
      return n instanceof Promise
        ? n
        : {
            then(r) {
              return Cs(r)(n);
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
          return Cs(r)(n);
        },
      };
    }
  },
  h0 = (e, t) => (n, r, i) => {
    let o = {
        storage: p0(() => window.localStorage),
        partialize: (S) => S,
        version: 0,
        merge: (S, h) => ({ ...h, ...S }),
        ...t,
      },
      s = !1,
      a = 0;
    const u = new Set(),
      c = new Set();
    let d = o.storage;
    if (!d)
      return e(
        (...S) => {
          (console.warn(
            `[zustand persist middleware] Unable to update item '${o.name}', the given storage is currently unavailable.`,
          ),
            n(...S));
        },
        r,
        i,
      );
    const p = () => {
        const S = o.partialize({ ...r() });
        return d.setItem(o.name, { state: S, version: o.version });
      },
      g = i.setState;
    i.setState = (S, h) => (g(S, h), p());
    const k = e((...S) => (n(...S), p()), r, i);
    i.getInitialState = () => k;
    let x;
    const _ = () => {
      var S, h;
      if (!d) return;
      const f = ++a;
      ((s = !1),
        u.forEach((w) => {
          var C;
          return w((C = r()) != null ? C : k);
        }));
      const m =
        ((h = o.onRehydrateStorage) == null
          ? void 0
          : h.call(o, (S = r()) != null ? S : k)) || void 0;
      return Cs(d.getItem.bind(d))(o.name)
        .then((w) => {
          if (w)
            if (typeof w.version == "number" && w.version !== o.version) {
              if (o.migrate) {
                const C = o.migrate(w.state, w.version);
                return C instanceof Promise ? C.then((R) => [!0, R]) : [!0, C];
              }
              console.error(
                "State loaded from storage couldn't be migrated since no migrate function was provided",
              );
            } else return [!1, w.state];
          return [!1, void 0];
        })
        .then((w) => {
          var C;
          if (f !== a) return;
          const [R, z] = w;
          if (((x = o.merge(z, (C = r()) != null ? C : k)), n(x, !0), R))
            return p();
        })
        .then(() => {
          f === a &&
            (m == null || m(r(), void 0),
            (x = r()),
            (s = !0),
            c.forEach((w) => w(x)));
        })
        .catch((w) => {
          f === a && (m == null || m(void 0, w));
        });
    };
    return (
      (i.persist = {
        setOptions: (S) => {
          ((o = { ...o, ...S }), S.storage && (d = S.storage));
        },
        clearStorage: () => {
          d == null || d.removeItem(o.name);
        },
        getOptions: () => o,
        rehydrate: () => _(),
        hasHydrated: () => s,
        onHydrate: (S) => (
          u.add(S),
          () => {
            u.delete(S);
          }
        ),
        onFinishHydration: (S) => (
          c.add(S),
          () => {
            c.delete(S);
          }
        ),
      }),
      o.skipHydration || _(),
      x || k
    );
  },
  ip = h0,
  Ae = gi()(
    ip(
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
  );
function Ta(e) {
  const t = e.replace("#", "").trim(),
    n =
      t.length === 3
        ? t
            .split("")
            .map((i) => i + i)
            .join("")
        : t,
    r = parseInt(n, 16) || 0;
  return [(r >> 16) & 255, (r >> 8) & 255, r & 255];
}
function g0(e, t, n) {
  const r = (i) => Math.max(0, Math.min(255, Math.round(i)));
  return (
    "#" +
    [r(e), r(t), r(n)].map((i) => i.toString(16).padStart(2, "0")).join("")
  );
}
function m0(e, t, n) {
  const [r, i, o] = Ta(e),
    [s, a, u] = t;
  return g0(r + (s - r) * n, i + (a - i) * n, o + (u - o) * n);
}
function v0(e, t = 0.18) {
  return m0(e, [0, 0, 0], t);
}
function kt(e, t) {
  const [n, r, i] = Ta(e);
  return `rgba(${n}, ${r}, ${i}, ${t})`;
}
function x0(e) {
  const [t, n, r] = Ta(e).map((i) => {
    const o = i / 255;
    return o <= 0.03928 ? o / 12.92 : Math.pow((o + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * t + 0.7152 * n + 0.0722 * r;
}
function y0(e) {
  return x0(e) > 0.42 ? "#1a1206" : "#fff8ee";
}
function S0(e) {
  return /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.test(e.trim());
}
function _0(e) {
  const t = e.trim();
  return t.startsWith("#") ? t : `#${t}`;
}
const Es = {
  amber: {
    accent: "#e8973a",
    dim: "#c9772a",
    glow: "rgba(232,151,58,0.14)",
    fg: "#1a0e00",
  },
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
function w0(e) {
  return { accent: e, dim: v0(e, 0.16), glow: kt(e, 0.14), fg: y0(e) };
}
function zs(e, t) {
  const n =
      e === "custom" && t && S0(t)
        ? w0(_0(t))
        : Es[e === "custom" ? "amber" : e],
    r = document.documentElement;
  (r.style.setProperty("--accent", n.accent),
    r.style.setProperty("--accent-dim", n.dim),
    r.style.setProperty("--accent-glow", n.glow),
    r.style.setProperty("--accent-fg", n.fg),
    r.style.setProperty("--ocr-match-border", kt(n.accent, 0.95)),
    r.style.setProperty("--ocr-match-bg", kt(n.accent, 0.22)),
    r.style.setProperty("--ocr-active-border", n.accent),
    r.style.setProperty("--ocr-active-bg", kt(n.accent, 0.42)),
    r.style.setProperty("--ocr-halo-strong", kt(n.accent, 0.85)),
    r.style.setProperty("--ocr-halo-soft", kt(n.accent, 0.3)),
    r.style.setProperty("--ocr-halo-none", kt(n.accent, 0)),
    r.style.setProperty("--ocr-pill-ring", kt(n.accent, 0.3)),
    r.style.setProperty("--ocr-pill-ring-fade", kt(n.accent, 0)),
    r.style.setProperty("--ocr-tooltip-border", n.accent));
}
function k0() {
  return typeof window < "u"
    ? `${window.location.origin}/api`
    : "https://localhost:3000/api";
}
function j0(e) {
  return e.replace("/api", "");
}
function b0(e) {
  return `${j0(e)}/s3`;
}
const op = [".pdf", ".png", ".jpg", ".jpeg", ".tiff", ".tif", ".bmp", ".webp"],
  K = gi()(
    ip(
      (e, t) => ({
        theme: "dark",
        apiUrl: k0(),
        accent: "amber",
        customAccent: null,
        lang: "en",
        simulatedTagPaths: [],
        allowedUploadExtensions: op,
        urlSubstitutions: [],
        dismissedOrigins: [],
        toggleTheme: () => {
          const n = t().theme === "dark" ? "light" : "dark";
          (e({ theme: n }),
            n === "light"
              ? document.documentElement.classList.add("light")
              : document.documentElement.classList.remove("light"));
        },
        setApiUrl: (n) => e({ apiUrl: n.replace(/\/+$/, "") }),
        setAccent: (n) => {
          (e({ accent: n }), zs(n, t().customAccent));
        },
        setCustomAccent: (n) => {
          (e({ accent: "custom", customAccent: n }), zs("custom", n));
        },
        setLang: (n) => e({ lang: n }),
        setSimulatedTagPaths: (n) => e({ simulatedTagPaths: n }),
        setAllowedUploadExtensions: (n) => e({ allowedUploadExtensions: n }),
        addUrlSubstitution: (n, r) => {
          const i = t().urlSubstitutions.filter((o) => o.from !== n);
          e({
            urlSubstitutions: [...i, { from: n, to: r }],
            dismissedOrigins: t().dismissedOrigins.filter((o) => o !== n),
          });
        },
        removeUrlSubstitution: (n) =>
          e({
            urlSubstitutions: t().urlSubstitutions.filter((r) => r.from !== n),
          }),
        dismissOrigin: (n) => {
          t().dismissedOrigins.includes(n) ||
            e({ dismissedOrigins: [...t().dismissedOrigins, n] });
        },
      }),
      { name: "rain-dms-settings" },
    ),
  );
typeof window < "u" &&
  setTimeout(() => {
    const e = K.getState();
    (zs(e.accent, e.customAccent),
      e.theme === "light" && document.documentElement.classList.add("light"));
  }, 0);
async function C0(e) {
  const t = await e.arrayBuffer(),
    n = await crypto.subtle.digest("SHA-256", t);
  return Array.from(new Uint8Array(n))
    .map((r) => r.toString(16).padStart(2, "0"))
    .join("");
}
const E0 = 50,
  un = new Map();
function cc(e) {
  return e === "error" ? 8e3 : e === "info" ? 5e3 : 3500;
}
const xt = gi((e, t) => ({
  toasts: [],
  errorLog: [],
  push: (n, r, i) => {
    const o = t().toasts.find(
      (c) => c.kind === n && c.title === r && c.message === i,
    );
    if (o) {
      e((p) => ({
        toasts: p.toasts.map((g) =>
          g.id === o.id
            ? { ...g, count: g.count + 1, createdAt: Date.now() }
            : g,
        ),
        errorLog: p.errorLog.map((g) =>
          g.id === o.id
            ? { ...g, count: g.count + 1, createdAt: Date.now(), read: !1 }
            : g,
        ),
      }));
      const c = un.get(o.id);
      c && clearTimeout(c);
      const d = setTimeout(() => t().dismiss(o.id), cc(n));
      un.set(o.id, d);
      return;
    }
    const s =
        typeof crypto < "u" && crypto.randomUUID
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random()}`,
      a = {
        id: s,
        kind: n,
        title: r,
        message: i,
        createdAt: Date.now(),
        count: 1,
      };
    e((c) => ({
      toasts: [...c.toasts, a],
      errorLog:
        n === "error"
          ? [{ ...a, read: !1 }, ...c.errorLog].slice(0, E0)
          : c.errorLog,
    }));
    const u = setTimeout(() => t().dismiss(s), cc(n));
    un.set(s, u);
  },
  dismiss: (n) => {
    const r = un.get(n);
    (r && clearTimeout(r),
      un.delete(n),
      e((i) => ({ toasts: i.toasts.filter((o) => o.id !== n) })));
  },
  clear: () => {
    (un.forEach((n) => clearTimeout(n)), un.clear(), e({ toasts: [] }));
  },
  markRead: (n) =>
    e((r) => ({
      errorLog: r.errorLog.map((i) => (i.id === n ? { ...i, read: !0 } : i)),
    })),
  markAllRead: () =>
    e((n) => ({ errorLog: n.errorLog.map((r) => ({ ...r, read: !0 })) })),
  clearLog: () => e({ errorLog: [] }),
}));
function ai(e, t) {
  const n = t instanceof Error ? t.message : typeof t == "string" ? t : void 0;
  xt.getState().push("error", e, n);
}
function z0(e, t) {
  xt.getState().push("info", e, t);
}
function or(e, t) {
  xt.getState().push("success", e, t);
}
const Ma = {
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
    ft_select: "Select",
    ft_selected: (e) => `${e} selected`,
    ft_delete: (e) => `Delete ${e}`,
    ft_confirmDelete: (e) => `⚠ Confirm delete ${e}`,
    ul_dropHere: "Drop files or folders here",
    ul_folderNote: "Folder structure is preserved under your username",
    ul_browseFiles: "Browse files",
    ul_browseFolder: "Browse folder",
    ul_upload: (e) => `Upload ${e} file${e !== 1 ? "s" : ""}`,
    ul_close: "Close",
    ul_clear: "✕ clear",
    ul_minimize: "Minimize",
    ul_stop: "■ Stop",
    ul_pending: "pending",
    ul_hashing: "hashing…",
    ul_duplicate: "duplicate",
    ul_uploading: "uploading…",
    ul_done: "done",
    ul_skipped: "— skipped",
    ul_uploadsTitle: "Uploads",
    ul_eta: (e) => `ETA ${e}`,
    ul_queue: (e) => `${e} in queue`,
    ul_batchOk: (e, t, n) => `${e}/${t} files uploaded in ${n}s`,
    ul_batchErr: (e, t, n, r) => `${e}/${t} uploaded, ${n} failed (${r}s)`,
    ul_parallel: (e) => `${e} parallel`,
    ul_reqPerSec: (e) => `${e} req/s`,
    ul_uploadingCount: (e) => `uploading ${e}`,
    sr_placeholder: "Search… tag:label or -exclude",
    sr_search: "Search",
    sr_after: "After",
    sr_before: "Before",
    sr_filterByTag: "Filter by tag",
    sr_noResults: "No results found.",
    sr_welcomeTitle: "Search across every document",
    sr_welcomeBody:
      "Full text, OCR'd content, and tags — all in one place. Try an example, or just start typing.",
    sr_exTag: "tag:invoices",
    sr_exExclude: "report -draft",
    sr_exPhrase: '"quarterly summary"',
    sr_noResultsHint:
      "Try a shorter or more general query, or remove the date filter.",
    sr_results: (e, t) =>
      `${e} hit${e !== 1 ? "s" : ""} across ${t} file${t !== 1 ? "s" : ""}`,
    sr_excluded: "excluded:",
    sr_page: "p.",
    sr_open: "Open",
    sr_groupByFile: "Group by file",
    sr_flat: "Flat",
    sr_recent: "Recent searches",
    sr_clearRecent: "Clear",
    sr_searching: "Searching…",
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
    main_selected: (e) => `${e} selected`,
    main_allOnPage: (e) => `all ${e}`,
    main_none: "none",
    main_cancel: "cancel",
    main_deleting: "Deleting…",
    main_loadingMore: "Loading more…",
    main_loadedOf: (e, t) => `${e} of ${t} loaded — scroll for more`,
    main_loadedAll: (e) => `${e} loaded — that's everything`,
    main_select: "Select",
    doc_loading: "Loading…",
    doc_notFound: "Document not found.",
    doc_back: "← Back",
    doc_openFile: "Open document",
    doc_page: (e, t) => `page ${e} / ${t}`,
    doc_pages: "pages",
    doc_ocr: "OCR",
    doc_mark: "✎ Mark",
    doc_drawing: "Drawing…",
    doc_marker: (e) => `${e} marker${e !== 1 ? "s" : ""}`,
    doc_download: "↓",
    doc_delete: "Delete",
    doc_confirmDelete: "Confirm?",
    doc_matches: (e) => `${e} match${e !== 1 ? "es" : ""} in this file`,
    doc_jumpFirst: "Jump to first hit",
    doc_prevHit: "Previous hit",
    doc_nextHit: "Next hit",
    doc_dismiss: "Dismiss glow",
    doc_showPath: "Show full S3 path",
    doc_hidePath: "Hide path",
    doc_ingested: "ingested",
    doc_pipeline: "pipeline started",
    doc_fileId: "file id",
    doc_pagesLabel: "pages",
    doc_tags: "tags",
    doc_ocrBoxes: "OCR boxes",
    doc_size: "size",
    doc_markModeHint: "Drag a rectangle on a page to create a marker",
    doc_markModeHint2: "Switch to draw mode to create a new marker",
    doc_doubleClickMark: "double-click to mark",
    doc_doubleClickUnmark: "marked · double-click to unmark",
    doc_empty: "(empty)",
    doc_confidence: (e) => `conf ${e}%`,
    doc_notePlaceholder: "Note for this marker…",
    doc_noteSave: "Save",
    doc_noteClose: "Close",
    doc_noteDelete: "Delete",
    doc_noPages: "No pages available.",
    st_title: "System Stats",
    st_refresh: "↻ Refresh",
    st_autoRefresh: "auto-refresh 5s",
    st_last: (e) => `last ${e}`,
    st_documents: "Documents",
    st_total: "Total",
    st_1h: "+1h",
    st_24h: "+24h",
    st_7d: "+7d",
    st_30d: "+30d",
    st_totalPages: "Total pages",
    st_avgPages: (e) => `avg ${e} p/doc`,
    st_ocrCoverage: "OCR coverage",
    st_ocrPages: (e, t) => `${e} / ${t} pages`,
    st_storage: "Est. storage",
    st_kbPerPage: (e) => `~${e} KB/page`,
    st_sparkline: "Documents added — last 24h (by hour)",
    st_sparklineDaily: "Documents added — last 30 days (by day)",
    st_ingestAvg: "Avg ingest time",
    st_ingestMedian: "Median ingest time",
    st_ingestRange: "Ingest range (min–max)",
    st_ingestSample: "Sample size",
    st_topTags: "Top tags",
    st_ocrPipeline: "OCR Pipeline",
    st_ocrQueue: "OCR queue",
    st_mergeQueue: "Merge queue",
    st_processing: "Processing",
    st_rate30: "30s rate",
    st_rate60: "60s rate",
    st_eta: "ETA",
    st_jobs: (e) => `${e} jobs`,
    st_throughput: "Throughput (30s vs 60s)",
    st_workers: (e, t) => `Workers (${e} OCR · ${t} merge)`,
    st_byExt: "By extension",
    st_biggest: "Largest files (by page count)",
    st_idle: "idle",
    st_perSec: (e) => `${e}/s`,
    st_unacked: (e) => `${e} unacked`,
    st_ocr: "OCR",
    st_merge: "Merge",
    st_pf: (e) => `pf ${e}`,
    st_pMinute: "p/min",
    st_language: "Language",
    st_langSub: "Interface language for labels and controls",
    st_english: "English",
    st_german: "Deutsch",
    st_settings: "Settings",
    st_appearance: "Appearance",
    st_theme: "Theme",
    st_themeSub: (e) => `Currently ${e} mode`,
    st_accent: "Accent colour",
    st_accentHint: "Changes apply instantly and persist across sessions.",
    st_accentCustom: "Custom",
    st_accentCustomHint:
      "Pick any colour — the rest of the palette is derived automatically.",
    st_urlSubs: "Base URL substitutions",
    st_urlSubsHint:
      "When banner images or file downloads are served from a different address than this page (often triggering CORS errors), you can substitute the address. Only applies to fetching files — never to uploads.",
    st_urlSubsEmpty: "No substitutions active.",
    st_urlSubsRevoke: "Revoke",
    st_reminders: "Pending reminders",
    st_remindersEmpty: "No reminders set. Open a file's info page to add one.",
    st_reminderOverdue: "overdue",
    st_reminderNoDate: "no date",
    st_reminderMarkDone: "Done",
    st_reminderOpenFile: "Open",
    st_downloads: "Agent downloads",
    st_downloadsTotal: "Total downloads",
    st_downloadsBytes: "Total bytes served",
    st_downloadsRate: "Downloads/min (30s · 60s)",
    st_downloadsInFlight: "In flight",
    st_downloadsRecent: "Recent files",
    st_downloadsNoRecent: "No recent downloads recorded.",
    st_encStatus: "Status",
    st_encUnlocked: "Unlocked ✓",
    st_encLocked: "Locked — sign in again to unlock",
    st_account: "Account",
    st_signedInAs: "Signed in as",
    st_about: "About",
    st_aboutSub: "Self-hosted document management system",
    st_source: "Source",
    st_clientDecrypt: "Client-side decryption",
    st_clientDecryptSub:
      "Decrypt files and thumbnails in-browser using your password-derived key",
    st_tree: "Tree — Simulated folders",
    st_simulatedPaths: "Virtual folder paths",
    st_simulatedHint: "Enter one tag path per line. Use / to nest folders.",
    st_simulatedExample: `Finance/2024/Q1
Legal/Contracts
HR/Onboarding`,
    st_simulatedActive: (e) =>
      `${e} simulated path${e !== 1 ? "s" : ""} active. Switch to Tree in Documents to preview.`,
    st_apply: "Apply",
    st_saved: "✓ Saved",
    st_clear: "Clear",
    st_connection: "Connection",
    st_apiUrl: "API base URL",
    st_apiUrlHint: (e) => `Auto-detected from ${e}/api on first load.`,
    st_encryption: "Encryption",
    st_uploadFilters: "Upload filters",
    st_allowedExt: "Allowed file extensions",
    st_allowedExtSub:
      "Only files with these extensions will be accepted. One per line (with dot). Clear to disable filter.",
    st_resetDefaults: "Reset to defaults",
    st_blockMode: "Clear (block-list mode)",
    st_current: (e, t) => (e ? `Current: ${e}` : `Current: ${t}`),
    st_currentFallback: "using built-in block-list",
    st_dms: "rain·dms",
    st_dmsSub: "Self-hosted document management system",
    st_version: "v1.0.0",
    st_selfHosted: "self-hosted",
    st_github: "GitHub ↗",
    lg_signin: "Sign in",
    lg_signup: "Sign up",
    lg_username: "Username",
    lg_password: "Password",
    lg_create: "Create account",
    lg_working: "Working…",
    lg_sessionExpired: "Your session expired. Please sign in again.",
    lg_advanced: "Advanced",
    lg_apiUrl: "API base URL",
    lg_apiUrlHint: (e) => `Defaults to ${e}/api`,
    lg_apiUrlPh: "https://192.168.1.188:7443/api",
    lg_save: "Save",
    lg_dmsSub: "document management system",
    lg_tagline: "self-hosted · end-to-end encrypted",
    lg_something: "Something went wrong",
    nav_documents: "Documents",
    nav_search: "Search",
    nav_stats: "Stats",
    nav_settings: "Settings",
    nav_signOut: "Sign out",
    nav_lightMode: "Light mode",
    nav_darkMode: "Dark mode",
    nav_upload: "Upload",
    nav_menu: "Menu",
    dc_justNow: "just now",
    dc_minAgo: (e) => `${e}m ago`,
    dc_hAgo: (e) => `${e}h ago`,
    dc_dAgo: (e) => `${e}d ago`,
    dc_openStats: "Open file stats",
    dc_showPath: "Show full path",
    dc_close: "Close",
    dc_more: (e) => `+${e}`,
    fs_loading: "Loading…",
    fs_missing: "Missing filepath.",
    fs_back: "← Back",
    fs_open: "Open document",
    fs_pages: "Pages",
    fs_ocrBoxes: "OCR boxes",
    fs_markers: "Markers",
    fs_tags: "Tags",
    fs_encrypted: "Encrypted",
    fs_yes: "yes",
    fs_no: "no",
    fs_timeline: "Ingest timeline",
    fs_created: "Created at",
    fs_pipelineAt: "Pipeline started",
    fs_fileId: "File ID",
    fs_ocrPages: "Pages with OCR",
    fs_size: "File size",
    fs_path: "S3 path",
    fs_reminder: "Reminder",
    fs_reminderNote: "Note (optional)",
    fs_saveReminder: "Save reminder",
    fs_markDone: "Mark done",
    fs_active: "ACTIVE",
    fs_done: "DONE",
    fs_reminderHint:
      "Reminders live in your browser's localStorage. They don't sync across devices.",
    fs_markersTitle: (e) => `Markers (${e})`,
    fs_removeAll: "Remove all",
    fs_removeAllConfirm: "Remove all markers on this file?",
    fs_noMarkers:
      "No markers yet. Open the document, switch to ✎ Mark mode, double-click an OCR box or drag a rectangle to create one.",
    fs_drawn: "drawn",
    fs_ocr: "ocr",
    fs_pageN: (e) => `page ${e}`,
    fs_xy: (e, t, n, r) => `x:${e} y:${t} · ${n}×${r}`,
    fs_openBtn: "Open",
    err_generic: "Something went wrong",
    err_network: "Network error",
    err_unauth: "Session expired — please sign in again",
    err_delete: (e) => `Failed to delete ${e} file${e !== 1 ? "s" : ""}`,
    err_dismiss: "Dismiss",
    err_menuTitle: "Errors",
    err_menuEmpty: "No errors — all clear.",
    err_clearAll: "Clear all",
    err_viewDetails: "View details",
    err_hideDetails: "Hide details",
    toast_info: "Info",
    toast_error: "Error",
    toast_success: "Success",
    url_mismatchTitle: "Fix file loading?",
    url_mismatchBody: (e, t) =>
      `Images and files are configured to load from ${e}, which differs from this page's address (${t}) — that mismatch is a common cause of CORS errors. Replace ${e} with ${t} for file downloads? Uploads are never affected, and you can revoke this later in Settings.`,
    url_accept: "Yes, use this address",
    url_decline: "No thanks",
  },
  R0 = {
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
    ft_select: "Auswählen",
    ft_selected: (e) => `${e} ausgewählt`,
    ft_delete: (e) => `${e} löschen`,
    ft_confirmDelete: (e) => `⚠ ${e} wirklich löschen`,
    ul_dropHere: "Dateien oder Ordner hierher ziehen",
    ul_folderNote: "Ordnerstruktur wird unter deinem Benutzernamen gespeichert",
    ul_browseFiles: "Dateien auswählen",
    ul_browseFolder: "Ordner auswählen",
    ul_upload: (e) => `${e} Datei${e !== 1 ? "en" : ""} hochladen`,
    ul_close: "Schließen",
    ul_clear: "✕ leeren",
    ul_minimize: "Minimieren",
    ul_stop: "■ Stopp",
    ul_pending: "ausstehend",
    ul_hashing: "wird gehasht…",
    ul_duplicate: "Duplikat",
    ul_uploading: "wird hochgeladen…",
    ul_done: "fertig",
    ul_skipped: "— übersprungen",
    ul_uploadsTitle: "Uploads",
    ul_eta: (e) => `ETA ${e}`,
    ul_queue: (e) => `${e} in der Warteschlange`,
    ul_batchOk: (e, t, n) => `${e}/${t} Dateien in ${n}s hochgeladen`,
    ul_batchErr: (e, t, n, r) =>
      `${e}/${t} hochgeladen, ${n} fehlgeschlagen (${r}s)`,
    ul_parallel: (e) => `${e} parallel`,
    ul_reqPerSec: (e) => `${e} Anfr./s`,
    ul_uploadingCount: (e) => `${e} werden hochgeladen`,
    sr_placeholder: "Suchen… tag:Label oder -ausschließen",
    sr_search: "Suchen",
    sr_after: "Nach",
    sr_before: "Vor",
    sr_filterByTag: "Nach Tag filtern",
    sr_noResults: "Keine Ergebnisse gefunden.",
    sr_welcomeTitle: "Durchsuche alle Dokumente",
    sr_welcomeBody:
      "Volltext, OCR-Inhalte und Tags — alles an einem Ort. Probier ein Beispiel oder fang einfach an zu tippen.",
    sr_exTag: "tag:rechnungen",
    sr_exExclude: "bericht -entwurf",
    sr_exPhrase: '"Quartalsübersicht"',
    sr_noResultsHint:
      "Versuche eine kürzere oder allgemeinere Suche, oder entferne den Datumsfilter.",
    sr_results: (e, t) => `${e} Treffer in ${t} Datei${t !== 1 ? "en" : ""}`,
    sr_excluded: "ausgeschlossen:",
    sr_page: "S.",
    sr_open: "Öffnen",
    sr_groupByFile: "Nach Datei gruppieren",
    sr_flat: "Liste",
    sr_recent: "Letzte Suchen",
    sr_clearRecent: "Leeren",
    sr_searching: "Suche…",
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
    main_selected: (e) => `${e} ausgewählt`,
    main_allOnPage: (e) => `alle ${e}`,
    main_none: "keine",
    main_cancel: "abbrechen",
    main_deleting: "Wird gelöscht…",
    main_loadingMore: "Lade mehr…",
    main_loadedOf: (e, t) => `${e} von ${t} geladen — scrollen für mehr`,
    main_loadedAll: (e) => `${e} geladen — das war's`,
    main_select: "Auswählen",
    doc_loading: "Lade…",
    doc_notFound: "Dokument nicht gefunden.",
    doc_back: "← Zurück",
    doc_openFile: "Dokument öffnen",
    doc_page: (e, t) => `Seite ${e} / ${t}`,
    doc_pages: "Seiten",
    doc_ocr: "OCR",
    doc_mark: "✎ Markieren",
    doc_drawing: "Zeichne…",
    doc_marker: (e) => `${e} Markierung${e !== 1 ? "en" : ""}`,
    doc_download: "↓",
    doc_delete: "Löschen",
    doc_confirmDelete: "Bestätigen?",
    doc_matches: (e) => `${e} Treffer in dieser Datei`,
    doc_jumpFirst: "Zum ersten Treffer",
    doc_prevHit: "Vorheriger Treffer",
    doc_nextHit: "Nächster Treffer",
    doc_dismiss: "Hervorhebung ausblenden",
    doc_showPath: "Vollständigen S3-Pfad anzeigen",
    doc_hidePath: "Pfad ausblenden",
    doc_ingested: "aufgenommen",
    doc_pipeline: "Pipeline gestartet",
    doc_fileId: "Datei-ID",
    doc_pagesLabel: "Seiten",
    doc_tags: "Tags",
    doc_ocrBoxes: "OCR-Boxen",
    doc_size: "Größe",
    doc_markModeHint:
      "Ziehe ein Rechteck auf einer Seite, um eine Markierung zu erstellen",
    doc_markModeHint2:
      "Wechsle in den Zeichenmodus, um eine Markierung zu erstellen",
    doc_doubleClickMark: "Doppelklicken zum Markieren",
    doc_doubleClickUnmark: "markiert · Doppelklicken zum Aufheben",
    doc_empty: "(leer)",
    doc_confidence: (e) => `Konfidenz ${e}%`,
    doc_notePlaceholder: "Notiz für diese Markierung…",
    doc_noteSave: "Speichern",
    doc_noteClose: "Schließen",
    doc_noteDelete: "Löschen",
    doc_noPages: "Keine Seiten verfügbar.",
    st_title: "Systemstatistiken",
    st_refresh: "↻ Aktualisieren",
    st_autoRefresh: "Auto-Aktualisierung 5s",
    st_last: (e) => `zuletzt ${e}`,
    st_documents: "Dokumente",
    st_total: "Gesamt",
    st_1h: "+1h",
    st_24h: "+24h",
    st_7d: "+7T",
    st_30d: "+30T",
    st_totalPages: "Seiten gesamt",
    st_avgPages: (e) => `⌀ ${e} S./Dok.`,
    st_ocrCoverage: "OCR-Abdeckung",
    st_ocrPages: (e, t) => `${e} / ${t} Seiten`,
    st_storage: "Speicher (geschätzt)",
    st_kbPerPage: (e) => `~${e} KB/Seite`,
    st_sparkline: "Hinzugefügte Dokumente — letzte 24h (stündlich)",
    st_sparklineDaily: "Hinzugefügte Dokumente — letzte 30 Tage (täglich)",
    st_ingestAvg: "Ø Ingest-Zeit",
    st_ingestMedian: "Median Ingest-Zeit",
    st_ingestRange: "Ingest-Spanne (min–max)",
    st_ingestSample: "Stichprobengröße",
    st_topTags: "Top-Tags",
    st_ocrPipeline: "OCR-Pipeline",
    st_ocrQueue: "OCR-Warteschlange",
    st_mergeQueue: "Merge-Warteschlange",
    st_processing: "In Verarbeitung",
    st_rate30: "Rate 30s",
    st_rate60: "Rate 60s",
    st_eta: "ETA",
    st_jobs: (e) => `${e} Jobs`,
    st_throughput: "Durchsatz (30s vs 60s)",
    st_workers: (e, t) => `Worker (${e} OCR · ${t} Merge)`,
    st_byExt: "Nach Erweiterung",
    st_biggest: "Größte Dateien (nach Seitenzahl)",
    st_idle: "inaktiv",
    st_perSec: (e) => `${e}/s`,
    st_unacked: (e) => `${e} unbestätigt`,
    st_ocr: "OCR",
    st_merge: "Merge",
    st_pf: (e) => `pf ${e}`,
    st_pMinute: "S./min",
    st_language: "Sprache",
    st_langSub: "Sprache für Beschriftungen und Steuerelemente",
    st_english: "English",
    st_german: "Deutsch",
    st_settings: "Einstellungen",
    st_appearance: "Darstellung",
    st_theme: "Theme",
    st_themeSub: (e) => `Aktuell ${e}-Modus`,
    st_accent: "Akzentfarbe",
    st_accentHint: "Änderungen werden sofort übernommen und bleiben erhalten.",
    st_accentCustom: "Eigene Farbe",
    st_accentCustomHint:
      "Wähle eine beliebige Farbe — der Rest der Palette wird automatisch abgeleitet.",
    st_urlSubs: "Basis-URL-Ersetzungen",
    st_urlSubsHint:
      "Wenn Vorschaubilder oder Downloads von einer anderen Adresse als dieser Seite geladen werden (oft Ursache von CORS-Fehlern), kannst du die Adresse ersetzen. Gilt nur zum Abrufen von Dateien — nie beim Hochladen.",
    st_urlSubsEmpty: "Keine Ersetzungen aktiv.",
    st_urlSubsRevoke: "Widerrufen",
    st_reminders: "Offene Erinnerungen",
    st_remindersEmpty:
      "Keine Erinnerungen gesetzt. Öffne die Info-Seite einer Datei, um eine anzulegen.",
    st_reminderOverdue: "überfällig",
    st_reminderNoDate: "kein Datum",
    st_reminderMarkDone: "Erledigt",
    st_reminderOpenFile: "Öffnen",
    st_downloads: "Agenten-Downloads",
    st_downloadsTotal: "Downloads gesamt",
    st_downloadsBytes: "Übertragene Bytes gesamt",
    st_downloadsRate: "Downloads/min (30s · 60s)",
    st_downloadsInFlight: "In Bearbeitung",
    st_downloadsRecent: "Letzte Dateien",
    st_downloadsNoRecent: "Keine kürzlichen Downloads erfasst.",
    st_encStatus: "Status",
    st_encUnlocked: "Entsperrt ✓",
    st_encLocked: "Gesperrt — erneut anmelden zum Entsperren",
    st_account: "Konto",
    st_signedInAs: "Angemeldet als",
    st_about: "Über",
    st_aboutSub: "Selbst gehostetes Dokumentenmanagementsystem",
    st_source: "Quellcode",
    st_clientDecrypt: "Client-seitige Entschlüsselung",
    st_clientDecryptSub:
      "Dateien und Vorschaubilder im Browser mit deinem passwortabgeleiteten Schlüssel entschlüsseln",
    st_tree: "Baum — Simulierte Ordner",
    st_simulatedPaths: "Virtuelle Ordnerpfade",
    st_simulatedHint: "Pro Zeile ein Pfad. Mit / verschachteln.",
    st_simulatedExample: `Finanzen/2024/Q1
Recht/Verträge
HR/Einarbeitung`,
    st_simulatedActive: (e) =>
      `${e} simulierte${e !== 1 ? "" : "r"} Pfad${e !== 1 ? "e" : ""} aktiv. Wechsle in Dokumenten zur Baumansicht zur Vorschau.`,
    st_apply: "Übernehmen",
    st_saved: "✓ Gespeichert",
    st_clear: "Leeren",
    st_connection: "Verbindung",
    st_apiUrl: "API-Basis-URL",
    st_apiUrlHint: (e) => `Beim ersten Laden automatisch aus ${e}/api erkannt.`,
    st_encryption: "Verschlüsselung",
    st_uploadFilters: "Upload-Filter",
    st_allowedExt: "Erlaubte Dateiendungen",
    st_allowedExtSub:
      "Nur Dateien mit diesen Endungen werden akzeptiert. Eine pro Zeile (mit Punkt). Leeren deaktiviert den Filter.",
    st_resetDefaults: "Auf Standard zurücksetzen",
    st_blockMode: "Leeren (Blacklist-Modus)",
    st_current: (e, t) => (e ? `Aktuell: ${e}` : `Aktuell: ${t}`),
    st_currentFallback: "eingebaute Blacklist",
    st_dms: "rain·dms",
    st_dmsSub: "Selbstgehostetes Dokumentenmanagementsystem",
    st_version: "v1.0.0",
    st_selfHosted: "selbstgehostet",
    st_github: "GitHub ↗",
    lg_signin: "Anmelden",
    lg_signup: "Registrieren",
    lg_username: "Benutzername",
    lg_password: "Passwort",
    lg_create: "Konto erstellen",
    lg_working: "Lädt…",
    lg_sessionExpired:
      "Deine Sitzung ist abgelaufen. Bitte melde dich erneut an.",
    lg_advanced: "Erweitert",
    lg_apiUrl: "API-Basis-URL",
    lg_apiUrlHint: (e) => `Standard: ${e}/api`,
    lg_apiUrlPh: "https://192.168.1.188:7443/api",
    lg_save: "Speichern",
    lg_dmsSub: "Dokumentenmanagementsystem",
    lg_tagline: "selbstgehostet · Ende-zu-Ende-verschlüsselt",
    lg_something: "Etwas ist schiefgelaufen",
    nav_documents: "Dokumente",
    nav_search: "Suche",
    nav_stats: "Statistik",
    nav_settings: "Einstellungen",
    nav_signOut: "Abmelden",
    nav_lightMode: "Heller Modus",
    nav_darkMode: "Dunkler Modus",
    nav_upload: "Hochladen",
    nav_menu: "Menü",
    dc_justNow: "gerade eben",
    dc_minAgo: (e) => `vor ${e} Min.`,
    dc_hAgo: (e) => `vor ${e} Std.`,
    dc_dAgo: (e) => `vor ${e} Tagen`,
    dc_openStats: "Dateistatistiken öffnen",
    dc_showPath: "Vollständigen Pfad anzeigen",
    dc_close: "Schließen",
    dc_more: (e) => `+${e}`,
    fs_loading: "Lade…",
    fs_missing: "Dateipfad fehlt.",
    fs_back: "← Zurück",
    fs_open: "Dokument öffnen",
    fs_pages: "Seiten",
    fs_ocrBoxes: "OCR-Boxen",
    fs_markers: "Markierungen",
    fs_tags: "Tags",
    fs_encrypted: "Verschlüsselt",
    fs_yes: "ja",
    fs_no: "nein",
    fs_timeline: "Aufnahme-Zeitachse",
    fs_created: "Erstellt am",
    fs_pipelineAt: "Pipeline gestartet",
    fs_fileId: "Datei-ID",
    fs_ocrPages: "Seiten mit OCR",
    fs_size: "Dateigröße",
    fs_path: "S3-Pfad",
    fs_reminder: "Erinnerung",
    fs_reminderNote: "Notiz (optional)",
    fs_saveReminder: "Erinnerung speichern",
    fs_markDone: "Als erledigt markieren",
    fs_active: "AKTIV",
    fs_done: "ERLEDIGT",
    fs_reminderHint:
      "Erinnerungen werden im localStorage deines Browsers gespeichert und nicht zwischen Geräten synchronisiert.",
    fs_markersTitle: (e) => `Markierungen (${e})`,
    fs_removeAll: "Alle entfernen",
    fs_removeAllConfirm: "Alle Markierungen in dieser Datei entfernen?",
    fs_noMarkers:
      "Noch keine Markierungen. Öffne das Dokument, wechsle in den ✎ Markieren-Modus, doppelklicke eine OCR-Box oder ziehe ein Rechteck.",
    fs_drawn: "gezeichnet",
    fs_ocr: "ocr",
    fs_pageN: (e) => `Seite ${e}`,
    fs_xy: (e, t, n, r) => `x:${e} y:${t} · ${n}×${r}`,
    fs_openBtn: "Öffnen",
    err_generic: "Etwas ist schiefgelaufen",
    err_network: "Netzwerkfehler",
    err_unauth: "Sitzung abgelaufen — bitte erneut anmelden",
    err_delete: (e) =>
      `${e} Datei${e !== 1 ? "en" : ""} konnte${e !== 1 ? "n" : ""} nicht gelöscht werden`,
    err_dismiss: "Schließen",
    err_menuTitle: "Fehler",
    err_menuEmpty: "Keine Fehler — alles in Ordnung.",
    err_clearAll: "Alle löschen",
    err_viewDetails: "Details anzeigen",
    err_hideDetails: "Details ausblenden",
    toast_info: "Info",
    toast_error: "Fehler",
    toast_success: "Erfolg",
    url_mismatchTitle: "Dateiladen reparieren?",
    url_mismatchBody: (e, t) =>
      `Bilder und Dateien werden aktuell von ${e} geladen, was von der Adresse dieser Seite (${t}) abweicht — das ist eine häufige Ursache für CORS-Fehler. ${e} beim Herunterladen durch ${t} ersetzen? Uploads sind davon nie betroffen, und du kannst dies später in den Einstellungen widerrufen.`,
    url_accept: "Ja, diese Adresse verwenden",
    url_decline: "Nein danke",
  },
  lp = { en: Ma, de: R0 };
function pe() {
  const e = K((t) => t.lang);
  return lp[e] ?? Ma;
}
function ut() {
  const e = K.getState().lang;
  return lp[e] ?? Ma;
}
const Rs = gi((e, t) => ({
  pendingOrigin: null,
  requestSubstitution: (n) => {
    t().pendingOrigin || e({ pendingOrigin: n });
  },
  clearPending: () => e({ pendingOrigin: null }),
}));
function P0(e) {
  try {
    return new URL(e).origin;
  } catch {
    return null;
  }
}
function Ps(e) {
  const t = K.getState().urlSubstitutions;
  for (const { from: n, to: r } of t)
    if (e.startsWith(n)) return r + e.slice(n.length);
  return (T0(e), e);
}
function T0(e) {
  if (typeof window > "u") return;
  const t = P0(e),
    n = window.location.origin;
  if (!t || t === n) return;
  const { dismissedOrigins: r } = K.getState();
  r.includes(t) || Rs.getState().requestSubstitution(t);
}
function Ia() {
  return K.getState().apiUrl;
}
function sp(e) {
  const { token: t, username: n } = Ae.getState(),
    r = {};
  return (
    t && (r.Authorization = t),
    n && (r["X-Username"] = n),
    { ...r, ...e }
  );
}
let dc = 0;
function La(e) {
  if (e !== 401 && e !== 403) return;
  const t = Date.now();
  if (t - dc < 500) return;
  dc = t;
  const { token: n, logout: r } = Ae.getState();
  if (
    n &&
    (r(),
    z0(ut().toast_info, ut().err_unauth),
    typeof window < "u" && !window.location.pathname.startsWith("/login"))
  ) {
    const i = encodeURIComponent(
      window.location.pathname + window.location.search,
    );
    window.location.assign(`/login?next=${i}&reason=unauth`);
  }
}
async function Ot(e, t, n) {
  const r = `${Ia()}${e}`;
  let i;
  try {
    i = await fetch(r, {
      ...t,
      headers: {
        "Content-Type": "application/json",
        ...sp(),
        ...(t == null ? void 0 : t.headers),
      },
    });
  } catch (o) {
    throw (
      (n != null && n.silent) ||
        ai(ut().toast_error, `${ut().err_network} — ${e}`),
      o instanceof Error ? o : new Error(ut().err_network)
    );
  }
  if (!i.ok) {
    La(i.status);
    const o = await i.text().catch(() => ""),
      s = `HTTP ${i.status}${o ? `: ${o.slice(0, 200)}` : ""}`;
    throw (
      !(n != null && n.silent) &&
        i.status !== 401 &&
        i.status !== 403 &&
        ai(ut().toast_error, s),
      new Error(s)
    );
  }
  return i.json();
}
const M0 = (e, t) =>
    Ot("/auth/signin", {
      method: "POST",
      body: JSON.stringify({ username: e, password: t }),
    }),
  I0 = (e, t) =>
    Ot("/auth/signup", {
      method: "POST",
      body: JSON.stringify({ username: e, password: t }),
    });
async function fc(e = 0, t = 50, n) {
  const r = new URLSearchParams({ pageIdx: String(e), limit: String(t) });
  n && r.set("tag", n);
  const i = `${Ia()}/main_page?${r}`;
  let o;
  try {
    o = await fetch(i, { headers: sp() });
  } catch (c) {
    throw (
      ai(ut().toast_error, ut().err_network),
      c instanceof Error ? c : new Error(ut().err_network)
    );
  }
  if (!o.ok)
    throw (
      La(o.status),
      o.status !== 401 &&
        o.status !== 403 &&
        ai(ut().toast_error, `HTTP ${o.status}`),
      new Error(`HTTP ${o.status}`)
    );
  const s = await o.json(),
    a = parseInt(o.headers.get("X-Total-Count") ?? "0", 10),
    u = parseInt(o.headers.get("X-Page-Count") ?? "0", 10);
  return { data: s, totalCount: a, pageCount: u };
}
const L0 = (e, t) => {
    const n = new URLSearchParams({ query: e, ...t });
    return Ot(`/search?${n}`);
  },
  ap = (e) => Ot(`/pages?filepath=${encodeURIComponent(e)}`),
  up = (e) => Ot(`/document?filepath=${encodeURIComponent(e)}`),
  N0 = () => Ot("/tags"),
  O0 = () => Ot("/dashboard"),
  Na = (e) =>
    Ot(`/delete/consume?filepath=${encodeURIComponent(e)}`, {
      method: "DELETE",
    }),
  D0 = (e) =>
    Ot(
      "/check/hash_exists",
      { method: "POST", body: JSON.stringify({ hash: e }) },
      { silent: !0 },
    );
function $0(e) {
  return Ps(`${Ia()}/download?fileKey=${encodeURIComponent(e)}`);
}
const A0 = 4;
let cn = !1;
const Mr = [];
let _t = null;
function cp() {
  Mr.push(Date.now());
}
function F0() {
  const e = Date.now() - 1e3;
  for (; Mr.length && Mr[0] < e; ) Mr.shift();
  return Mr.length;
}
const B0 = new Set([
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
function W0(e) {
  const t = e.lastIndexOf(".");
  return t < 0 ? "" : e.slice(t).toLowerCase();
}
function U0(e, t) {
  const n = e.split("/").pop() ?? e;
  if (n.startsWith(".")) return !0;
  const r = W0(n);
  return r ? (t.length > 0 ? !t.includes(r) : B0.has(r)) : !0;
}
function H0(e, t, n, r) {
  return (
    cp(),
    new Promise((i, o) => {
      const s = new XMLHttpRequest();
      s.open("POST", e, !0);
      for (const [a, u] of Object.entries(n)) u && s.setRequestHeader(a, u);
      ((s.upload.onprogress = (a) => {
        a.lengthComputable && r(Math.round((a.loaded / a.total) * 100));
      }),
        (s.onload = () => {
          i({
            ok: s.status >= 200 && s.status < 300,
            status: s.status,
            text: s.responseText,
          });
        }),
        (s.onerror = () => o(new Error("Network error"))),
        (s.onabort = () => o(new Error("Aborted"))),
        s.send(t));
    })
  );
}
const Oa = gi((e, t) => ({
  jobs: [],
  isOpen: !1,
  isMinimized: !1,
  running: !1,
  lastCompletedAt: null,
  activeWorkers: 0,
  requestsPerSecond: 0,
  addFiles(n) {
    const r = K.getState().allowedUploadExtensions ?? [],
      i = [],
      o = [];
    for (const { file: s, relativePath: a } of n) {
      const u = crypto.randomUUID();
      U0(s.name, r)
        ? o.push({
            id: u,
            file: s,
            relativePath: a,
            status: { state: "skipped", reason: "extension" },
          })
        : i.push({
            id: u,
            file: s,
            relativePath: a,
            status: { state: "pending" },
          });
    }
    (i.sort((s, a) => s.file.size - a.file.size),
      e((s) => ({
        jobs: [...s.jobs, ...i, ...o],
        isOpen: !0,
        isMinimized: !1,
      })));
  },
  start() {
    const { jobs: n, running: r } = t();
    if (r) return;
    const i = n.filter((a) => a.status.state === "pending");
    if (!i.length) return;
    ((cn = !1),
      e({ running: !0, activeWorkers: 0 }),
      _t && clearInterval(_t),
      (_t = setInterval(() => {
        e({ requestsPerSecond: F0() });
      }, 250)));
    function o(a, u) {
      e((c) => ({
        jobs: c.jobs.map((d) => (d.id === a ? { ...d, status: u } : d)),
      }));
    }
    async function s(a) {
      if (cn) return;
      (e((c) => ({ activeWorkers: c.activeWorkers + 1 })),
        o(a.id, { state: "hashing" }));
      let u;
      try {
        u = await C0(a.file);
      } catch {
        (o(a.id, { state: "error", message: "Hashing failed" }),
          e((c) => ({ activeWorkers: Math.max(0, c.activeWorkers - 1) })));
        return;
      }
      if (cn) {
        e((c) => ({ activeWorkers: Math.max(0, c.activeWorkers - 1) }));
        return;
      }
      try {
        cp();
        const { exists: c } = await D0(u);
        if (c) {
          (o(a.id, { state: "duplicate" }),
            e((d) => ({ activeWorkers: Math.max(0, d.activeWorkers - 1) })));
          return;
        }
      } catch {}
      if (cn) {
        e((c) => ({ activeWorkers: Math.max(0, c.activeWorkers - 1) }));
        return;
      }
      o(a.id, { state: "uploading", progress: 0 });
      try {
        const { apiUrl: c } = K.getState(),
          { token: d, username: p } = Ae.getState(),
          g = new FormData();
        (g.append("file", a.file), g.append("relativePath", a.relativePath));
        const k = await H0(
          `${c}/upload`,
          g,
          { Authorization: d ?? "", "X-Username": p ?? "" },
          (x) => o(a.id, { state: "uploading", progress: x }),
        );
        k.ok
          ? (o(a.id, { state: "done" }), e({ lastCompletedAt: Date.now() }))
          : o(a.id, {
              state: "error",
              message: `HTTP ${k.status}: ${k.text.slice(0, 80)}`,
            });
      } catch (c) {
        o(a.id, { state: "error", message: c.message ?? "Upload failed" });
      } finally {
        e((c) => ({ activeWorkers: Math.max(0, c.activeWorkers - 1) }));
      }
    }
    (async () => {
      let a = 0;
      const u = Date.now();
      async function c() {
        for (; !cn; ) {
          const p = a++;
          if (p >= i.length) return;
          await s(i[p]);
        }
      }
      const d = Math.min(A0, i.length);
      if (
        (await Promise.all(Array.from({ length: d }, () => c())),
        _t && (clearInterval(_t), (_t = null)),
        e({ running: !1, activeWorkers: 0, requestsPerSecond: 0 }),
        !cn && i.length > 1)
      ) {
        const p = t().jobs,
          g = new Set(i.map((h) => h.id)),
          k = p.filter((h) => g.has(h.id) && h.status.state === "error").length,
          x = p.filter((h) => g.has(h.id) && h.status.state === "done").length,
          _ = Math.max(1, Math.round((Date.now() - u) / 1e3)),
          S = ut();
        k > 0
          ? ai(S.toast_error, S.ul_batchErr(x, i.length, k, _))
          : x > 0 && or(S.toast_success, S.ul_batchOk(x, i.length, _));
      }
    })();
  },
  abort() {
    ((cn = !0),
      _t && (clearInterval(_t), (_t = null)),
      e({ running: !1, activeWorkers: 0, requestsPerSecond: 0 }));
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
    e((r) => ({ jobs: r.jobs.filter((i) => i.id !== n) }));
  },
}));
async function dp(e, t = "") {
  if (e.isFile)
    return new Promise((n, r) =>
      e.file((i) => n([{ file: i, relativePath: t + i.name }]), r),
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
      (await Promise.all(r.map((o) => dp(o, t + e.name + "/")))).flat()
    );
  }
  return [];
}
function V0(e) {
  return e < 1024
    ? `${e}B`
    : e < 1024 ** 2
      ? `${(e / 1024).toFixed(0)}KB`
      : `${(e / 1024 ** 2).toFixed(1)}MB`;
}
const K0 = {
    pending: "var(--text-3)",
    hashing: "var(--warn)",
    duplicate: "var(--text-3)",
    uploading: "var(--accent)",
    done: "var(--success)",
    skipped: "var(--text-3)",
    error: "var(--danger)",
  },
  J0 = (e, t) => {
    const n = e.status;
    return n.state === "error"
      ? `✗ ${n.message.slice(0, 50)}`
      : n.state === "skipped"
        ? t.ul_skipped
        : n.state === "uploading"
          ? `↑ ${n.progress}%`
          : n.state === "pending"
            ? "·"
            : n.state === "hashing"
              ? `⟳ ${t.ul_hashing}`
              : n.state === "duplicate"
                ? `= ${t.ul_duplicate}`
                : n.state === "done"
                  ? `✓ ${t.ul_done}`
                  : (n.state ?? "");
  };
function Q0() {
  const e = pe(),
    {
      jobs: t,
      isOpen: n,
      isMinimized: r,
      running: i,
      activeWorkers: o,
      requestsPerSecond: s,
      addFiles: a,
      start: u,
      abort: c,
      clearFinished: d,
      toggle: p,
      minimize: g,
      removeJob: k,
    } = Oa(),
    x = v.useRef(null),
    _ = v.useRef(null),
    S = t.filter((b) => b.status.state === "pending").length,
    h = t.filter(
      (b) => b.status.state === "uploading" || b.status.state === "hashing",
    ).length,
    f = t.filter((b) => b.status.state === "done").length,
    m = t.filter((b) => b.status.state === "error").length,
    w = t.length,
    [C, R] = v.useState(!1),
    z = (b) => {
      const A = Array.from(b.target.files ?? []);
      (a(A.map((F) => ({ file: F, relativePath: F.name }))),
        (b.target.value = ""));
    },
    P = (b) => {
      const A = Array.from(b.target.files ?? []);
      (a(
        A.map((F) => ({
          file: F,
          relativePath: F.webkitRelativePath || F.name,
        })),
      ),
        (b.target.value = ""));
    },
    L = v.useCallback(
      async (b) => {
        var V;
        (b.preventDefault(), R(!1));
        const A = Array.from(b.dataTransfer.items),
          F = [];
        for (const U of A) {
          if (U.kind !== "file") continue;
          const M = (V = U.webkitGetAsEntry) == null ? void 0 : V.call(U);
          if (M) F.push(...(await dp(M)));
          else {
            const Q = U.getAsFile();
            Q && F.push({ file: Q, relativePath: Q.name });
          }
        }
        F.length && a(F);
      },
      [a],
    );
  return n
    ? r
      ? l.jsxs("div", {
          className: "upload-panel-shell",
          onClick: () => g(!1),
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
            flexWrap: "wrap",
            maxWidth: "calc(100vw - 40px)",
          },
          children: [
            l.jsx(hc, {}),
            l.jsx("span", {
              style: {
                fontSize: "0.78rem",
                fontWeight: 600,
                color: "var(--text-1)",
              },
              children: e.ul_uploadsTitle,
            }),
            i &&
              o > 0 &&
              l.jsxs("span", {
                style: {
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  background: "var(--accent-glow)",
                  color: "var(--accent)",
                  borderRadius: 999,
                  padding: "1px 7px",
                  fontSize: "0.62rem",
                  fontWeight: 700,
                  fontFamily: "JetBrains Mono, monospace",
                },
                children: [l.jsx(pc, {}), e.ul_parallel(o)],
              }),
            h > 0 &&
              !i &&
              l.jsx("span", {
                style: {
                  background: "var(--accent)",
                  color: "var(--accent-fg)",
                  borderRadius: 999,
                  padding: "1px 7px",
                  fontSize: "0.65rem",
                  fontWeight: 700,
                },
                children: h,
              }),
            m > 0 &&
              l.jsx("span", {
                style: {
                  background: "var(--danger)",
                  color: "#fff",
                  borderRadius: 999,
                  padding: "1px 7px",
                  fontSize: "0.65rem",
                  fontWeight: 700,
                },
                children: m,
              }),
            i &&
              l.jsx("span", {
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
      : l.jsxs("div", {
          className: "upload-panel-shell",
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
            l.jsxs("div", {
              style: {
                padding: "10px 12px",
                borderBottom: "1px solid var(--border-soft)",
                display: "flex",
                alignItems: "center",
                gap: 8,
                rowGap: 6,
                flexWrap: "wrap",
                flexShrink: 0,
              },
              children: [
                l.jsx(hc, {}),
                l.jsxs("span", {
                  style: {
                    fontWeight: 600,
                    fontSize: "0.85rem",
                    flex: "1 1 auto",
                    minWidth: 60,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  },
                  children: [
                    e.ul_uploadsTitle,
                    w > 0 &&
                      l.jsxs("span", {
                        style: {
                          marginLeft: 6,
                          fontSize: "0.68rem",
                          color: "var(--text-3)",
                          fontFamily: "JetBrains Mono, monospace",
                        },
                        children: [
                          f,
                          "/",
                          w,
                          m > 0 &&
                            l.jsxs("span", {
                              style: { color: "var(--danger)", marginLeft: 4 },
                              children: ["· ", m, " err"],
                            }),
                        ],
                      }),
                  ],
                }),
                i &&
                  o > 0 &&
                  l.jsxs("span", {
                    title: e.ul_reqPerSec(s),
                    style: {
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      background: "var(--accent-glow)",
                      color: "var(--accent)",
                      borderRadius: 999,
                      padding: "2px 8px",
                      fontSize: "0.63rem",
                      fontWeight: 700,
                      fontFamily: "JetBrains Mono, monospace",
                      flexShrink: 0,
                    },
                    children: [
                      l.jsx(pc, {}),
                      e.ul_parallel(o),
                      l.jsxs("span", {
                        style: { opacity: 0.7 },
                        children: ["· ", e.ul_reqPerSec(s)],
                      }),
                    ],
                  }),
                i
                  ? l.jsx("button", {
                      onClick: c,
                      style: {
                        ...wr,
                        color: "var(--danger)",
                        borderColor: "rgba(248,113,113,0.3)",
                      },
                      title: e.ul_stop,
                      children: e.ul_stop,
                    })
                  : S > 0
                    ? l.jsxs("button", {
                        onClick: u,
                        style: {
                          ...wr,
                          background: "var(--accent-glow)",
                          color: "var(--accent)",
                          borderColor: "var(--accent)",
                        },
                        children: ["▶ ", e.ul_upload(S)],
                      })
                    : null,
                w > 0 &&
                  l.jsx("button", {
                    onClick: d,
                    style: wr,
                    title: e.ul_clear,
                    children: e.ul_clear,
                  }),
                l.jsx("button", {
                  onClick: () => g(!0),
                  style: { ...wr, fontSize: "0.7rem" },
                  title: e.ul_minimize,
                  children: "▼",
                }),
                l.jsx("button", {
                  onClick: p,
                  style: { ...wr, fontSize: "0.7rem" },
                  title: e.ul_close,
                  children: "✕",
                }),
              ],
            }),
            l.jsxs("div", {
              onDragOver: (b) => {
                (b.preventDefault(), R(!0));
              },
              onDragLeave: () => R(!1),
              onDrop: L,
              style: {
                margin: "8px 10px 0",
                border: `1.5px dashed ${C ? "var(--accent)" : "var(--border)"}`,
                borderRadius: 7,
                padding: "10px 8px",
                textAlign: "center",
                background: C ? "var(--accent-glow)" : "transparent",
                transition: "border-color 0.12s, background 0.12s",
                flexShrink: 0,
              },
              children: [
                l.jsx("p", {
                  style: {
                    margin: "0 0 6px",
                    fontSize: "0.75rem",
                    color: "var(--text-2)",
                    fontWeight: 500,
                  },
                  children: e.ul_dropHere,
                }),
                l.jsxs("div", {
                  style: { display: "flex", gap: 5, justifyContent: "center" },
                  children: [
                    l.jsx("button", {
                      className: "btn btn-ghost",
                      style: { fontSize: "0.7rem", padding: "3px 9px" },
                      onClick: () => {
                        var b;
                        return (b = x.current) == null ? void 0 : b.click();
                      },
                      children: e.ul_browseFiles,
                    }),
                    l.jsx("button", {
                      className: "btn btn-ghost",
                      style: { fontSize: "0.7rem", padding: "3px 9px" },
                      onClick: () => {
                        var b;
                        return (b = _.current) == null ? void 0 : b.click();
                      },
                      children: e.ul_browseFolder,
                    }),
                  ],
                }),
                l.jsx("input", {
                  ref: x,
                  type: "file",
                  multiple: !0,
                  style: { display: "none" },
                  onChange: z,
                }),
                l.jsx("input", {
                  ref: _,
                  type: "file",
                  multiple: !0,
                  style: { display: "none" },
                  webkitdirectory: "true",
                  directory: "true",
                  onChange: P,
                }),
              ],
            }),
            t.length > 0 &&
              l.jsx("div", {
                style: {
                  flex: 1,
                  overflowY: "auto",
                  padding: "6px 10px 10px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                },
                children: t.map((b) =>
                  l.jsxs(
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
                        b.status.state === "uploading" &&
                          l.jsx("div", {
                            style: {
                              position: "absolute",
                              bottom: 0,
                              left: 0,
                              height: 2,
                              width: `${b.status.progress}%`,
                              background: "var(--accent)",
                              borderRadius: 1,
                              transition: "width 0.2s",
                            },
                          }),
                        l.jsxs("div", {
                          style: { flex: 1, minWidth: 0 },
                          children: [
                            l.jsx("p", {
                              style: {
                                margin: 0,
                                fontSize: "0.73rem",
                                color: "var(--text-1)",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              },
                              children: b.file.name,
                            }),
                            l.jsxs("p", {
                              style: {
                                margin: 0,
                                fontSize: "0.61rem",
                                color: "var(--text-3)",
                                fontFamily: "JetBrains Mono, monospace",
                              },
                              children: [
                                V0(b.file.size),
                                b.relativePath !== b.file.name &&
                                  l.jsxs("span", {
                                    style: {
                                      marginLeft: 4,
                                      color: "var(--text-3)",
                                      fontSize: "0.58rem",
                                    },
                                    children: ["→ ", b.relativePath],
                                  }),
                              ],
                            }),
                          ],
                        }),
                        l.jsx("span", {
                          style: {
                            fontSize: "0.65rem",
                            color: K0[b.status.state] ?? "var(--text-3)",
                            flexShrink: 0,
                            fontFamily: "JetBrains Mono, monospace",
                          },
                          children: J0(b, e),
                        }),
                        (b.status.state === "error" ||
                          b.status.state === "skipped") &&
                          l.jsx("button", {
                            onClick: () => k(b.id),
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
                    b.id,
                  ),
                ),
              }),
          ],
        })
    : null;
}
const wr = {
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
function pc() {
  return l.jsx("span", {
    style: {
      width: 6,
      height: 6,
      borderRadius: "50%",
      background: "var(--accent)",
      boxShadow: "0 0 5px var(--accent)",
      animation: "pulse 0.9s ease-in-out infinite",
      flexShrink: 0,
    },
  });
}
function hc() {
  return l.jsxs("svg", {
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
      l.jsx("polyline", { points: "16 16 12 12 8 16" }),
      l.jsx("line", { x1: "12", y1: "12", x2: "12", y2: "21" }),
      l.jsx("path", {
        d: "M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3",
      }),
    ],
  });
}
const Y0 = {
  error: {
    border: "rgba(248,113,113,0.4)",
    bg: "rgba(248,113,113,0.1)",
    fg: "var(--danger)",
  },
  success: {
    border: "rgba(52,211,153,0.4)",
    bg: "rgba(52,211,153,0.1)",
    fg: "var(--success)",
  },
  info: {
    border: "rgba(56,189,248,0.4)",
    bg: "rgba(56,189,248,0.1)",
    fg: "#38bdf8",
  },
};
function G0({ kind: e }) {
  return e === "error"
    ? l.jsxs("svg", {
        width: "15",
        height: "15",
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: "2",
        strokeLinecap: "round",
        strokeLinejoin: "round",
        children: [
          l.jsx("circle", { cx: "12", cy: "12", r: "10" }),
          l.jsx("line", { x1: "12", y1: "8", x2: "12", y2: "12" }),
          l.jsx("line", { x1: "12", y1: "16", x2: "12.01", y2: "16" }),
        ],
      })
    : e === "success"
      ? l.jsxs("svg", {
          width: "15",
          height: "15",
          viewBox: "0 0 24 24",
          fill: "none",
          stroke: "currentColor",
          strokeWidth: "2",
          strokeLinecap: "round",
          strokeLinejoin: "round",
          children: [
            l.jsx("path", { d: "M22 11.08V12a10 10 0 1 1-5.93-9.14" }),
            l.jsx("polyline", { points: "22 4 12 14.01 9 11.01" }),
          ],
        })
      : l.jsxs("svg", {
          width: "15",
          height: "15",
          viewBox: "0 0 24 24",
          fill: "none",
          stroke: "currentColor",
          strokeWidth: "2",
          strokeLinecap: "round",
          strokeLinejoin: "round",
          children: [
            l.jsx("circle", { cx: "12", cy: "12", r: "10" }),
            l.jsx("line", { x1: "12", y1: "16", x2: "12", y2: "12" }),
            l.jsx("line", { x1: "12", y1: "8", x2: "12.01", y2: "8" }),
          ],
        });
}
function X0() {
  const e = pe(),
    t = xt((i) => i.toasts),
    n = xt((i) => i.dismiss),
    r = xt((i) => i.markRead);
  return t.length === 0
    ? null
    : l.jsxs("div", {
        style: {
          position: "fixed",
          top: 14,
          right: 14,
          zIndex: 400,
          display: "flex",
          flexDirection: "column",
          gap: 8,
          width: 340,
          maxWidth: "calc(100vw - 28px)",
          pointerEvents: "none",
        },
        children: [
          t.map((i) => {
            const o = Y0[i.kind];
            return l.jsxs(
              "div",
              {
                role: "alert",
                onClick: () => {
                  i.kind === "error" && r(i.id);
                },
                style: {
                  pointerEvents: "auto",
                  background: "var(--bg-surface)",
                  border: `1px solid ${o.border}`,
                  borderRadius: 9,
                  boxShadow: "0 8px 30px rgba(0,0,0,0.35)",
                  padding: "9px 10px 9px 11px",
                  display: "flex",
                  gap: 9,
                  alignItems: "flex-start",
                  animation: "toast-in 0.16s ease-out",
                },
                children: [
                  l.jsx("div", {
                    style: { color: o.fg, flexShrink: 0, marginTop: 1 },
                    children: l.jsx(G0, { kind: i.kind }),
                  }),
                  l.jsxs("div", {
                    style: { flex: 1, minWidth: 0 },
                    children: [
                      l.jsxs("div", {
                        style: {
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          fontSize: "0.78rem",
                          fontWeight: 600,
                          color: "var(--text-1)",
                        },
                        children: [
                          i.title,
                          i.count > 1 &&
                            l.jsxs("span", {
                              style: {
                                fontSize: "0.62rem",
                                fontWeight: 700,
                                color: o.fg,
                                background: o.bg,
                                border: `1px solid ${o.border}`,
                                borderRadius: 999,
                                padding: "0 5px",
                                fontFamily: "JetBrains Mono, monospace",
                              },
                              children: ["×", i.count],
                            }),
                        ],
                      }),
                      i.message &&
                        l.jsx("p", {
                          style: {
                            margin: "3px 0 0",
                            fontSize: "0.71rem",
                            color: "var(--text-2)",
                            lineHeight: 1.4,
                            wordBreak: "break-word",
                            fontFamily: "JetBrains Mono, monospace",
                          },
                          children: i.message,
                        }),
                    ],
                  }),
                  l.jsx("button", {
                    onClick: (s) => {
                      (s.stopPropagation(),
                        i.kind === "error" && r(i.id),
                        n(i.id));
                    },
                    title: e.err_dismiss,
                    "aria-label": e.err_dismiss,
                    style: {
                      background: "none",
                      border: "none",
                      color: "var(--text-3)",
                      cursor: "pointer",
                      fontSize: "0.75rem",
                      padding: "0 2px",
                      flexShrink: 0,
                      lineHeight: 1,
                    },
                    children: "✕",
                  }),
                ],
              },
              i.id,
            );
          }),
          l.jsx("style", {
            children: `
        @keyframes toast-in {
          from { opacity: 0; transform: translateX(12px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `,
          }),
        ],
      });
}
function Z0() {
  const e = pe(),
    t = Rs((s) => s.pendingOrigin),
    n = Rs((s) => s.clearPending),
    r = K((s) => s.addUrlSubstitution),
    i = K((s) => s.dismissOrigin);
  if (!t || typeof window > "u") return null;
  const o = window.location.origin;
  return l.jsxs("div", {
    role: "alertdialog",
    style: {
      position: "fixed",
      left: 12,
      right: 12,
      bottom: 12,
      zIndex: 500,
      maxWidth: 480,
      margin: "0 auto",
      background: "var(--bg-surface)",
      border: "1px solid var(--border)",
      borderRadius: "var(--radius-lg, 14px)",
      boxShadow: "0 16px 40px rgba(0,0,0,0.4)",
      padding: "14px 16px",
    },
    children: [
      l.jsx("p", {
        style: {
          margin: "0 0 4px",
          fontSize: "0.85rem",
          fontWeight: 700,
          color: "var(--text-1)",
        },
        children: e.url_mismatchTitle,
      }),
      l.jsx("p", {
        style: {
          margin: "0 0 12px",
          fontSize: "0.76rem",
          color: "var(--text-2)",
          lineHeight: 1.5,
        },
        children: e.url_mismatchBody(t, o),
      }),
      l.jsxs("div", {
        style: { display: "flex", gap: 8, justifyContent: "flex-end" },
        children: [
          l.jsx("button", {
            className: "btn btn-ghost",
            style: { fontSize: "0.78rem" },
            onClick: () => {
              (i(t), n());
            },
            children: e.url_decline,
          }),
          l.jsx("button", {
            className: "btn btn-primary",
            style: { fontSize: "0.78rem" },
            onClick: () => {
              (r(t, o), n());
            },
            children: e.url_accept,
          }),
        ],
      }),
    ],
  });
}
function q0() {
  return l.jsxs("svg", {
    width: "16",
    height: "16",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    children: [
      l.jsx("path", { d: "M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" }),
      l.jsx("path", { d: "M10.3 21a1.94 1.94 0 0 0 3.4 0" }),
    ],
  });
}
function gc() {
  const e = pe(),
    t = xt((x) => x.errorLog),
    n = xt((x) => x.markRead),
    r = xt((x) => x.markAllRead),
    i = xt((x) => x.clearLog),
    [o, s] = v.useState(!1),
    [a, u] = v.useState(null),
    [c, d] = v.useState(null),
    p = v.useRef(null),
    g = t.filter((x) => !x.read).length;
  function k() {
    if (!o && p.current) {
      const x = p.current.getBoundingClientRect();
      (d({
        top: x.bottom + 6,
        right: Math.max(12, window.innerWidth - x.right),
      }),
        r());
    }
    s((x) => !x);
  }
  return (
    v.useEffect(() => {
      if (!o) return;
      function x() {
        if (!p.current) return;
        const _ = p.current.getBoundingClientRect();
        d({
          top: _.bottom + 6,
          right: Math.max(12, window.innerWidth - _.right),
        });
      }
      return (
        window.addEventListener("resize", x),
        () => window.removeEventListener("resize", x)
      );
    }, [o]),
    l.jsxs("div", {
      style: { position: "relative" },
      children: [
        l.jsxs("button", {
          ref: p,
          onClick: k,
          title: e.err_menuTitle,
          "aria-label": e.err_menuTitle,
          style: {
            position: "relative",
            background: "none",
            border: "1px solid var(--border-soft)",
            borderRadius: 8,
            padding: "6px 9px",
            cursor: "pointer",
            color: g > 0 ? "var(--danger)" : "var(--text-2)",
            display: "flex",
          },
          children: [
            l.jsx(q0, {}),
            g > 0 &&
              l.jsx("span", {
                style: {
                  position: "absolute",
                  top: -4,
                  right: -4,
                  background: "var(--danger)",
                  color: "#fff",
                  borderRadius: 999,
                  fontSize: "0.58rem",
                  fontWeight: 700,
                  minWidth: 14,
                  height: 14,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "0 3px",
                  lineHeight: 1,
                },
                children: g > 9 ? "9+" : g,
              }),
          ],
        }),
        o &&
          c &&
          Ea.createPortal(
            l.jsxs(l.Fragment, {
              children: [
                l.jsx("div", {
                  onClick: () => s(!1),
                  style: { position: "fixed", inset: 0, zIndex: 900 },
                }),
                l.jsxs("div", {
                  style: {
                    position: "fixed",
                    top: c.top,
                    right: c.right,
                    width: 320,
                    maxWidth: "calc(100vw - 24px)",
                    maxHeight: "min(420px, calc(100vh - 80px))",
                    overflowY: "auto",
                    background: "var(--bg-surface)",
                    border: "1px solid var(--border)",
                    borderRadius: 10,
                    boxShadow: "0 12px 36px rgba(0,0,0,0.45)",
                    zIndex: 901,
                  },
                  children: [
                    l.jsxs("div", {
                      style: {
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "9px 12px",
                        borderBottom: "1px solid var(--border-soft)",
                      },
                      children: [
                        l.jsx("span", {
                          style: {
                            fontSize: "0.78rem",
                            fontWeight: 700,
                            color: "var(--text-1)",
                          },
                          children: e.err_menuTitle,
                        }),
                        t.length > 0 &&
                          l.jsx("button", {
                            onClick: i,
                            style: {
                              background: "none",
                              border: "none",
                              color: "var(--text-3)",
                              fontSize: "0.68rem",
                              cursor: "pointer",
                              textDecoration: "underline",
                            },
                            children: e.err_clearAll,
                          }),
                      ],
                    }),
                    t.length === 0
                      ? l.jsx("p", {
                          style: {
                            margin: 0,
                            padding: "18px 12px",
                            fontSize: "0.76rem",
                            color: "var(--text-3)",
                            textAlign: "center",
                          },
                          children: e.err_menuEmpty,
                        })
                      : t.map((x) => {
                          const _ = a === x.id;
                          return l.jsxs(
                            "div",
                            {
                              style: {
                                borderBottom: "1px solid var(--border-soft)",
                              },
                              children: [
                                l.jsxs("button", {
                                  onClick: () => {
                                    (n(x.id),
                                      u((S) => (S === x.id ? null : x.id)));
                                  },
                                  style: {
                                    width: "100%",
                                    textAlign: "left",
                                    background: "none",
                                    border: "none",
                                    cursor: "pointer",
                                    padding: "8px 12px",
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 2,
                                  },
                                  children: [
                                    l.jsxs("span", {
                                      style: {
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 6,
                                        fontSize: "0.76rem",
                                        fontWeight: 600,
                                        color: "var(--text-1)",
                                      },
                                      children: [
                                        !x.read &&
                                          l.jsx("span", {
                                            style: {
                                              width: 6,
                                              height: 6,
                                              borderRadius: "50%",
                                              background: "var(--danger)",
                                              flexShrink: 0,
                                            },
                                          }),
                                        x.title,
                                        x.count > 1 &&
                                          l.jsxs("span", {
                                            style: {
                                              color: "var(--text-3)",
                                              fontWeight: 400,
                                            },
                                            children: ["×", x.count],
                                          }),
                                      ],
                                    }),
                                    l.jsx("span", {
                                      style: {
                                        fontSize: "0.64rem",
                                        color: "var(--text-3)",
                                      },
                                      children: new Date(
                                        x.createdAt,
                                      ).toLocaleString(),
                                    }),
                                  ],
                                }),
                                _ &&
                                  l.jsx("div", {
                                    style: { padding: "0 12px 10px" },
                                    children: l.jsx("p", {
                                      style: {
                                        margin: 0,
                                        fontSize: "0.7rem",
                                        color: "var(--text-2)",
                                        fontFamily: "JetBrains Mono, monospace",
                                        background: "var(--bg-raised)",
                                        border: "1px solid var(--border-soft)",
                                        borderRadius: 6,
                                        padding: "8px 9px",
                                        whiteSpace: "pre-wrap",
                                        wordBreak: "break-word",
                                      },
                                      children: x.message || e.err_menuEmpty,
                                    }),
                                  }),
                              ],
                            },
                            x.id,
                          );
                        }),
                  ],
                }),
              ],
            }),
            document.body,
          ),
      ],
    })
  );
}
const Da = "rain-dms-local",
  ui = "rain-dms-local-change";
function Li() {
  return { markers: {}, reminders: {} };
}
function Wr() {
  if (typeof localStorage > "u") return Li();
  try {
    const e = localStorage.getItem(Da);
    if (!e) return Li();
    const t = JSON.parse(e);
    return !t || typeof t != "object"
      ? Li()
      : { markers: t.markers ?? {}, reminders: t.reminders ?? {} };
  } catch {
    return Li();
  }
}
function fp(e) {
  if (!(typeof localStorage > "u"))
    try {
      (localStorage.setItem(Da, JSON.stringify(e)),
        window.dispatchEvent(new CustomEvent(ui)));
    } catch {}
}
function mc() {
  const e = Wr();
  return Object.entries(e.reminders).map(([t, n]) => ({ filepath: t, ...n }));
}
function pp() {
  const [e, t] = v.useState(() => mc());
  return (
    v.useEffect(() => {
      function n() {
        t(mc());
      }
      return (
        window.addEventListener("storage", n),
        window.addEventListener(ui, n),
        () => {
          (window.removeEventListener("storage", n),
            window.removeEventListener(ui, n));
        }
      );
    }, []),
    e
  );
}
function ev(e) {
  const t = Wr(),
    n = t.reminders[e];
  n &&
    fp({
      ...t,
      reminders: {
        ...t.reminders,
        [e]: { ...n, done_at: new Date().toISOString() },
      },
    });
}
function hp(e) {
  const [t, n] = v.useState(() => Wr());
  v.useEffect(() => {
    function u(d) {
      d.key === Da && n(Wr());
    }
    function c() {
      n(Wr());
    }
    return (
      window.addEventListener("storage", u),
      window.addEventListener(ui, c),
      () => {
        (window.removeEventListener("storage", u),
          window.removeEventListener(ui, c));
      }
    );
  }, []);
  const r = v.useCallback((u) => {
      n((c) => {
        const d = u(c);
        return (fp(d), d);
      });
    }, []),
    i = e ? (t.markers[e] ?? []) : [],
    o = e
      ? (t.reminders[e] ?? { at: null, note: null, done_at: null })
      : { at: null, note: null, done_at: null },
    s = v.useCallback(
      (u) => {
        e &&
          r((c) => {
            const d = typeof u == "function" ? u : () => u;
            return {
              ...c,
              markers: { ...c.markers, [e]: d(c.markers[e] ?? []) },
            };
          });
      },
      [e, r],
    ),
    a = v.useCallback(
      (u) => {
        e &&
          r((c) => {
            const d = { ...c.reminders };
            return (
              u == null ? delete d[e] : (d[e] = u),
              { ...c, reminders: d }
            );
          });
      },
      [e, r],
    );
  return { store: t, markers: i, reminder: o, setMarkers: s, setReminder: a };
}
function tv() {
  const e = pe(),
    t = Ae((w) => w.logout),
    n = Ae((w) => w.username),
    r = K((w) => w.theme),
    i = K((w) => w.toggleTheme),
    o = pt(),
    s = ln(),
    [a, u] = v.useState(!1),
    { isOpen: c, toggle: d, running: p, jobs: g } = Oa(),
    x = pp().filter((w) => !w.done_at).length,
    _ = g.filter(
      (w) => w.status.state === "uploading" || w.status.state === "hashing",
    ).length,
    S = g.filter((w) => w.status.state === "pending").length,
    h = g.filter((w) => w.status.state === "error").length,
    f = p ? _ : S + h;
  v.useEffect(() => {
    u(!1);
  }, [s.pathname]);
  function m() {
    (t(), o("/login", { replace: !0 }));
  }
  return l.jsxs("div", {
    className: "app-shell",
    children: [
      l.jsxs("div", {
        className: "app-topbar",
        children: [
          l.jsx("button", {
            onClick: () => u((w) => !w),
            "aria-label": e.nav_menu,
            style: {
              background: "none",
              border: "1px solid var(--border-soft)",
              borderRadius: 8,
              padding: "6px 9px",
              cursor: "pointer",
              color: "var(--text-1)",
              display: "flex",
            },
            children: l.jsx(nv, {}),
          }),
          l.jsxs("div", {
            style: { display: "flex", alignItems: "center", gap: 6 },
            children: [
              l.jsx(vc, {}),
              l.jsxs("span", {
                style: {
                  fontWeight: 700,
                  fontSize: "0.9rem",
                  color: "var(--text-1)",
                  letterSpacing: "-0.02em",
                },
                children: [
                  "rain",
                  l.jsx("span", {
                    style: { color: "var(--accent)" },
                    children: "·dms",
                  }),
                ],
              }),
            ],
          }),
          l.jsx("div", {
            style: { marginLeft: "auto" },
            children: l.jsx(gc, {}),
          }),
        ],
      }),
      l.jsx("div", {
        className: `app-backdrop${a ? " open" : ""}`,
        onClick: () => u(!1),
      }),
      l.jsxs("aside", {
        className: `app-sidebar${a ? " open" : ""}`,
        children: [
          l.jsxs("div", {
            style: {
              padding: "16px 18px 12px",
              borderBottom: "1px solid var(--border-soft)",
            },
            children: [
              l.jsxs("div", {
                style: {
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                },
                children: [
                  l.jsxs("div", {
                    style: { display: "flex", alignItems: "center", gap: 8 },
                    children: [
                      l.jsx(vc, {}),
                      l.jsxs("span", {
                        style: {
                          fontWeight: 700,
                          fontSize: "0.95rem",
                          color: "var(--text-1)",
                          letterSpacing: "-0.02em",
                        },
                        children: [
                          "rain",
                          l.jsx("span", {
                            style: { color: "var(--accent)" },
                            children: "·dms",
                          }),
                        ],
                      }),
                    ],
                  }),
                  l.jsx(gc, {}),
                ],
              }),
              n &&
                l.jsx("p", {
                  style: {
                    margin: "5px 0 0",
                    fontSize: "0.68rem",
                    color: "var(--text-3)",
                    fontFamily: "JetBrains Mono, monospace",
                  },
                  children: n,
                }),
            ],
          }),
          l.jsx("div", {
            style: { padding: "10px 10px 4px" },
            children: l.jsxs("button", {
              className: "btn btn-primary",
              style: {
                width: "100%",
                justifyContent: "center",
                gap: 6,
                padding: "8px",
                position: "relative",
              },
              onClick: d,
              children: [
                l.jsx(rv, {}),
                " ",
                e.nav_upload,
                f > 0 &&
                  l.jsx("span", {
                    style: {
                      position: "absolute",
                      top: -5,
                      right: -5,
                      background: p
                        ? "var(--accent)"
                        : h > 0
                          ? "var(--danger)"
                          : "var(--warn)",
                      color: p ? "var(--accent-fg)" : "#fff",
                      borderRadius: 999,
                      minWidth: 17,
                      height: 17,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "0.6rem",
                      fontWeight: 700,
                      border: "2px solid var(--bg-surface)",
                      animation: p ? "pulse 1.2s ease-in-out infinite" : "none",
                      fontFamily: "JetBrains Mono, monospace",
                    },
                    children: f,
                  }),
              ],
            }),
          }),
          l.jsxs("nav", {
            style: {
              flex: 1,
              padding: "4px 6px",
              display: "flex",
              flexDirection: "column",
              gap: 1,
            },
            children: [
              l.jsx(Ni, {
                to: "/",
                label: e.nav_documents,
                icon: l.jsx(iv, {}),
                end: !0,
              }),
              l.jsx(Ni, {
                to: "/search",
                label: e.nav_search,
                icon: l.jsx(ov, {}),
              }),
              l.jsx(Ni, {
                to: "/stats",
                label: e.nav_stats,
                icon: l.jsx(lv, {}),
                badge: x,
              }),
            ],
          }),
          l.jsxs("div", {
            style: {
              padding: "6px",
              borderTop: "1px solid var(--border-soft)",
              display: "flex",
              flexDirection: "column",
              gap: 1,
            },
            children: [
              l.jsx(Ni, {
                to: "/settings",
                label: e.nav_settings,
                icon: l.jsx(sv, {}),
              }),
              l.jsxs("button", {
                className: "btn btn-ghost",
                style: {
                  justifyContent: "flex-start",
                  gap: 8,
                  padding: "6px 10px",
                  fontSize: "0.82rem",
                },
                onClick: i,
                children: [
                  r === "dark" ? l.jsx(uv, {}) : l.jsx(cv, {}),
                  l.jsx("span", {
                    children: r === "dark" ? e.nav_lightMode : e.nav_darkMode,
                  }),
                ],
              }),
              l.jsxs("button", {
                className: "btn btn-ghost",
                style: {
                  justifyContent: "flex-start",
                  gap: 8,
                  padding: "6px 10px",
                  color: "var(--danger)",
                  fontSize: "0.82rem",
                },
                onClick: m,
                children: [
                  l.jsx(av, {}),
                  l.jsx("span", { children: e.nav_signOut }),
                ],
              }),
            ],
          }),
        ],
      }),
      l.jsx("main", { className: "app-main", children: l.jsx(Vm, {}) }),
      l.jsx(Q0, {}),
      l.jsx(X0, {}),
      l.jsx(Z0, {}),
    ],
  });
}
function Ni({ to: e, label: t, icon: n, end: r, badge: i }) {
  return l.jsxs(l0, {
    to: e,
    end: r,
    style: ({ isActive: o }) => ({
      display: "flex",
      alignItems: "center",
      gap: 8,
      padding: "6px 10px",
      borderRadius: 6,
      textDecoration: "none",
      fontSize: "0.82rem",
      fontWeight: 500,
      color: o ? "var(--accent)" : "var(--text-2)",
      background: o ? "var(--accent-glow)" : "transparent",
      transition: "background 0.1s, color 0.1s",
    }),
    children: [
      n,
      l.jsx("span", { style: { flex: 1 }, children: t }),
      !!i &&
        l.jsx("span", {
          style: {
            background: "var(--accent)",
            color: "var(--accent-fg)",
            borderRadius: 999,
            fontSize: "0.62rem",
            fontWeight: 700,
            padding: "0 6px",
            fontFamily: "JetBrains Mono, monospace",
          },
          children: i,
        }),
    ],
  });
}
function nv() {
  return l.jsxs("svg", {
    width: "16",
    height: "16",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2.2",
    strokeLinecap: "round",
    children: [
      l.jsx("line", { x1: "4", y1: "7", x2: "20", y2: "7" }),
      l.jsx("line", { x1: "4", y1: "12", x2: "20", y2: "12" }),
      l.jsx("line", { x1: "4", y1: "17", x2: "20", y2: "17" }),
    ],
  });
}
function vc() {
  return l.jsxs("svg", {
    width: "20",
    height: "20",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "var(--accent)",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    children: [
      l.jsx("path", { d: "M20 17.58A5 5 0 0 0 18 8h-1.26A8 8 0 1 0 4 16.25" }),
      l.jsx("line", { x1: "8", y1: "16", x2: "8", y2: "22" }),
      l.jsx("line", { x1: "8", y1: "22", x2: "6", y2: "19" }),
      l.jsx("line", { x1: "12", y1: "17", x2: "12", y2: "23" }),
      l.jsx("line", { x1: "12", y1: "23", x2: "10", y2: "20" }),
      l.jsx("line", { x1: "16", y1: "16", x2: "16", y2: "22" }),
      l.jsx("line", { x1: "16", y1: "22", x2: "14", y2: "19" }),
    ],
  });
}
function rv() {
  return l.jsxs("svg", {
    width: "13",
    height: "13",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2.5",
    strokeLinecap: "round",
    children: [
      l.jsx("line", { x1: "12", y1: "5", x2: "12", y2: "19" }),
      l.jsx("line", { x1: "5", y1: "12", x2: "19", y2: "12" }),
    ],
  });
}
function iv() {
  return l.jsxs("svg", {
    width: "14",
    height: "14",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    children: [
      l.jsx("path", {
        d: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z",
      }),
      l.jsx("polyline", { points: "14 2 14 8 20 8" }),
    ],
  });
}
function ov() {
  return l.jsxs("svg", {
    width: "14",
    height: "14",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    children: [
      l.jsx("circle", { cx: "11", cy: "11", r: "8" }),
      l.jsx("line", { x1: "21", y1: "21", x2: "16.65", y2: "16.65" }),
    ],
  });
}
function lv() {
  return l.jsxs("svg", {
    width: "14",
    height: "14",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    children: [
      l.jsx("line", { x1: "18", y1: "20", x2: "18", y2: "10" }),
      l.jsx("line", { x1: "12", y1: "20", x2: "12", y2: "4" }),
      l.jsx("line", { x1: "6", y1: "20", x2: "6", y2: "14" }),
    ],
  });
}
function sv() {
  return l.jsxs("svg", {
    width: "14",
    height: "14",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    children: [
      l.jsx("circle", { cx: "12", cy: "12", r: "3" }),
      l.jsx("path", {
        d: "M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z",
      }),
    ],
  });
}
function av() {
  return l.jsxs("svg", {
    width: "14",
    height: "14",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    children: [
      l.jsx("path", { d: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" }),
      l.jsx("polyline", { points: "16 17 21 12 16 7" }),
      l.jsx("line", { x1: "21", y1: "12", x2: "9", y2: "12" }),
    ],
  });
}
function uv() {
  return l.jsxs("svg", {
    width: "14",
    height: "14",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    children: [
      l.jsx("circle", { cx: "12", cy: "12", r: "5" }),
      l.jsx("line", { x1: "12", y1: "1", x2: "12", y2: "3" }),
      l.jsx("line", { x1: "12", y1: "21", x2: "12", y2: "23" }),
      l.jsx("line", { x1: "4.22", y1: "4.22", x2: "5.64", y2: "5.64" }),
      l.jsx("line", { x1: "18.36", y1: "18.36", x2: "19.78", y2: "19.78" }),
      l.jsx("line", { x1: "1", y1: "12", x2: "3", y2: "12" }),
      l.jsx("line", { x1: "21", y1: "12", x2: "23", y2: "12" }),
      l.jsx("line", { x1: "4.22", y1: "19.78", x2: "5.64", y2: "18.36" }),
      l.jsx("line", { x1: "18.36", y1: "5.64", x2: "19.78", y2: "4.22" }),
    ],
  });
}
function cv() {
  return l.jsx("svg", {
    width: "14",
    height: "14",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    children: l.jsx("path", {
      d: "M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z",
    }),
  });
}
const lr = 12;
function gp(e) {
  return Uint8Array.from(atob(e), (t) => t.charCodeAt(0));
}
function dv(e) {
  const t = new Uint8Array(Math.floor(e.length / 2));
  for (let n = 0; n + 1 < e.length; n += 2)
    t[n / 2] = parseInt(e.slice(n, n + 2), 16);
  return t;
}
function bn(e) {
  return e.buffer.slice(e.byteOffset, e.byteOffset + e.byteLength);
}
async function fv(e) {
  const t = new TextEncoder().encode(e),
    n = await crypto.subtle.digest("SHA-256", t);
  return crypto.subtle.importKey("raw", n, { name: "AES-GCM" }, !1, [
    "decrypt",
    "encrypt",
  ]);
}
async function $a(e) {
  return crypto.subtle.importKey("raw", bn(dv(e)), { name: "AES-GCM" }, !1, [
    "decrypt",
    "encrypt",
  ]);
}
async function xc(e, t, n) {
  try {
    const r = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: bn(e) },
      n,
      bn(t),
    );
    return new TextDecoder().decode(r);
  } catch {
    return null;
  }
}
async function pv(e, t) {
  let n = e;
  try {
    const a = JSON.parse(n);
    typeof a == "string" && (n = a);
  } catch {}
  const r = gp(n),
    i = r.slice(0, lr),
    o = r.slice(lr),
    s = await xc(i, o, await fv(t));
  if (s !== null) return s;
  if (/^[0-9a-fA-F]{64}$/.test(t)) {
    const a = await xc(i, o, await $a(t));
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
async function hv(e, t) {
  let n = e;
  try {
    const u = JSON.parse(n);
    typeof u == "string" && (n = u);
  } catch {}
  const r = gp(n),
    i = r.slice(0, lr),
    o = r.slice(lr),
    s = await $a(t),
    a = await crypto.subtle.decrypt({ name: "AES-GCM", iv: bn(i) }, s, bn(o));
  return new TextDecoder().decode(a);
}
async function gv(e, t) {
  const n = new Uint8Array(e),
    r = n.slice(0, lr),
    i = n.slice(lr),
    o = await $a(t);
  return crypto.subtle.decrypt({ name: "AES-GCM", iv: bn(r) }, o, bn(i));
}
function mv() {
  const e = pe(),
    t = pt(),
    [n] = Jo(),
    r = Ae((b) => b.setAuth),
    i = K((b) => b.apiUrl),
    o = K((b) => b.setApiUrl),
    s = K((b) => b.lang),
    a = K((b) => b.setLang),
    u = (() => {
      const b = n.get("next");
      if (!b) return "/";
      try {
        const A = decodeURIComponent(b);
        return A.startsWith("/") ? A : "/";
      } catch {
        return "/";
      }
    })(),
    c = n.get("reason"),
    [d, p] = v.useState("signin"),
    [g, k] = v.useState(""),
    [x, _] = v.useState(""),
    [S, h] = v.useState(null),
    [f, m] = v.useState(!1),
    [w, C] = v.useState(!1),
    [R, z] = v.useState(i);
  function P() {
    o(R);
  }
  async function L(b) {
    (b.preventDefault(), h(null), m(!0), R !== i && o(R));
    try {
      if (d === "signup") {
        (await I0(g.trim(), x), p("signin"), _(""), m(!1));
        return;
      }
      const A = await M0(g.trim(), x);
      let F = null;
      if (A.encrypted_encrytion_key)
        try {
          F = await pv(A.encrypted_encrytion_key, x);
        } catch (V) {
          console.warn("[login] main key decrypt failed:", V);
        }
      (r(A.token, g.trim(), F), t(u, { replace: !0 }));
    } catch (A) {
      h(A.message ?? e.lg_something);
    } finally {
      m(!1);
    }
  }
  return l.jsx("div", {
    style: {
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "var(--bg-base)",
      padding: 24,
    },
    children: l.jsxs("div", {
      style: { width: "100%", maxWidth: 400 },
      children: [
        l.jsx("div", {
          style: {
            display: "flex",
            justifyContent: "center",
            gap: 4,
            marginBottom: 12,
          },
          children: ["en", "de"].map((b) =>
            l.jsx(
              "button",
              {
                onClick: () => a(b),
                style: {
                  background: s === b ? "var(--accent-glow)" : "none",
                  border: `1px solid ${s === b ? "var(--accent)" : "var(--border-soft)"}`,
                  borderRadius: 5,
                  cursor: "pointer",
                  color: s === b ? "var(--accent)" : "var(--text-3)",
                  fontSize: "0.68rem",
                  fontWeight: 600,
                  padding: "2px 9px",
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                },
                children: b,
              },
              b,
            ),
          ),
        }),
        l.jsxs("div", {
          style: { textAlign: "center", marginBottom: 28 },
          children: [
            l.jsx(vv, {}),
            l.jsxs("h1", {
              style: {
                margin: "10px 0 4px",
                fontSize: "1.65rem",
                fontWeight: 700,
                letterSpacing: "-0.03em",
                color: "var(--text-1)",
              },
              children: [
                "rain",
                l.jsx("span", {
                  style: { color: "var(--accent)" },
                  children: "-dms",
                }),
              ],
            }),
            l.jsx("p", {
              style: { margin: 0, fontSize: "0.8rem", color: "var(--text-3)" },
              children: e.lg_dmsSub,
            }),
          ],
        }),
        c === "unauth" &&
          l.jsx("p", {
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
            children: e.lg_sessionExpired,
          }),
        l.jsxs("div", {
          className: "card",
          style: { padding: "24px 24px 20px" },
          children: [
            l.jsx("div", {
              style: {
                display: "flex",
                background: "var(--bg-raised)",
                borderRadius: 7,
                padding: 3,
                marginBottom: 20,
              },
              children: ["signin", "signup"].map((b) =>
                l.jsx(
                  "button",
                  {
                    onClick: () => {
                      (p(b), h(null));
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
                      background: d === b ? "var(--bg-surface)" : "transparent",
                      color: d === b ? "var(--text-1)" : "var(--text-3)",
                      boxShadow: d === b ? "0 1px 3px rgba(0,0,0,0.2)" : "none",
                    },
                    children: b === "signin" ? e.lg_signin : e.lg_signup,
                  },
                  b,
                ),
              ),
            }),
            l.jsxs("form", {
              onSubmit: L,
              style: { display: "flex", flexDirection: "column", gap: 13 },
              children: [
                l.jsxs("div", {
                  children: [
                    l.jsx("label", {
                      className: "label",
                      children: e.lg_username,
                    }),
                    l.jsx("input", {
                      className: "input",
                      type: "text",
                      autoComplete: "username",
                      autoFocus: !0,
                      placeholder: "admin",
                      value: g,
                      onChange: (b) => k(b.target.value),
                      required: !0,
                    }),
                  ],
                }),
                l.jsxs("div", {
                  children: [
                    l.jsx("label", {
                      className: "label",
                      children: e.lg_password,
                    }),
                    l.jsx("input", {
                      className: "input",
                      type: "password",
                      autoComplete:
                        d === "signup" ? "new-password" : "current-password",
                      placeholder: "••••••••",
                      value: x,
                      onChange: (b) => _(b.target.value),
                      required: !0,
                    }),
                  ],
                }),
                S &&
                  l.jsx("p", {
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
                l.jsx("button", {
                  className: "btn btn-primary",
                  type: "submit",
                  disabled: f,
                  style: {
                    justifyContent: "center",
                    padding: "9px",
                    marginTop: 2,
                    opacity: f ? 0.6 : 1,
                  },
                  children: f
                    ? e.lg_working
                    : d === "signin"
                      ? e.lg_signin
                      : e.lg_create,
                }),
              ],
            }),
            l.jsxs("div", {
              style: {
                marginTop: 16,
                borderTop: "1px solid var(--border-soft)",
                paddingTop: 12,
              },
              children: [
                l.jsxs("button", {
                  onClick: () => C((b) => !b),
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
                    l.jsx("span", {
                      style: {
                        display: "inline-block",
                        transition: "transform 0.15s",
                        transform: w ? "rotate(90deg)" : "none",
                      },
                      children: "›",
                    }),
                    " ",
                    e.lg_advanced,
                  ],
                }),
                w &&
                  l.jsxs("div", {
                    style: { marginTop: 10 },
                    children: [
                      l.jsx("label", {
                        className: "label",
                        children: e.lg_apiUrl,
                      }),
                      l.jsxs("div", {
                        style: { display: "flex", gap: 6 },
                        children: [
                          l.jsx("input", {
                            className: "input",
                            value: R,
                            onChange: (b) => z(b.target.value),
                            placeholder: e.lg_apiUrlPh,
                            style: {
                              fontFamily: "JetBrains Mono, monospace",
                              fontSize: "0.75rem",
                            },
                          }),
                          l.jsx("button", {
                            className: "btn btn-ghost",
                            type: "button",
                            onClick: P,
                            style: { flexShrink: 0, fontSize: "0.78rem" },
                            children: e.lg_save,
                          }),
                        ],
                      }),
                      l.jsx("p", {
                        style: {
                          margin: "5px 0 0",
                          fontSize: "0.7rem",
                          color: "var(--text-3)",
                        },
                        children: e.lg_apiUrlHint(window.location.origin),
                      }),
                    ],
                  }),
              ],
            }),
          ],
        }),
        l.jsx("p", {
          style: {
            textAlign: "center",
            marginTop: 16,
            fontSize: "0.7rem",
            color: "var(--text-3)",
            fontFamily: "JetBrains Mono, monospace",
          },
          children: e.lg_tagline,
        }),
      ],
    }),
  });
}
function vv() {
  return l.jsxs("svg", {
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
      l.jsx("path", { d: "M20 17.58A5 5 0 0 0 18 8h-1.26A8 8 0 1 0 4 16.25" }),
      l.jsx("line", { x1: "8", y1: "16", x2: "8", y2: "22" }),
      l.jsx("line", { x1: "8", y1: "22", x2: "6", y2: "19" }),
      l.jsx("line", { x1: "12", y1: "17", x2: "12", y2: "23" }),
      l.jsx("line", { x1: "12", y1: "23", x2: "10", y2: "20" }),
      l.jsx("line", { x1: "16", y1: "16", x2: "16", y2: "22" }),
      l.jsx("line", { x1: "16", y1: "22", x2: "14", y2: "19" }),
    ],
  });
}
function xv(e, t, n) {
  const r = new Array(e);
  return new Proxy(r, {
    get(i, o, s) {
      if (typeof o == "string") {
        const a = o.charCodeAt(0);
        if (a >= 48 && a <= 57) {
          const u = +o;
          if (Number.isInteger(u) && u >= 0 && u < e) {
            let c = i[u];
            if (!c) {
              const d = t[u * 2];
              c = i[u] = {
                index: u,
                key: n(u),
                start: d,
                size: t[u * 2 + 1],
                end: d + t[u * 2 + 1],
                lane: 0,
              };
            }
            return c;
          }
        }
        if (o === "length") return e;
      }
      return Reflect.get(i, o, s);
    },
  });
}
function Pn(e, t, n) {
  let r = n.initialDeps ?? [],
    i,
    o = !0;
  function s() {
    const a = e();
    return (
      (a.length !== r.length || a.some((c, d) => r[d] !== c)) &&
        ((r = a),
        (i = t(...a)),
        n != null &&
          n.onChange &&
          !(o && n.skipInitialOnChange) &&
          n.onChange(i),
        (o = !1)),
      i
    );
  }
  return (
    (s.updateDeps = (a) => {
      r = a;
    }),
    s
  );
}
function yc(e, t) {
  if (e === void 0) throw new Error("Unexpected undefined");
  return e;
}
const yv = (e, t) => Math.abs(e - t) < 1.01,
  Sv = (e, t, n) => {
    let r;
    return function (...i) {
      (e.clearTimeout(r), (r = e.setTimeout(() => t.apply(this, i), n)));
    };
  };
let kr;
const jl = () => {
    if (kr !== void 0) return kr;
    if (typeof navigator > "u") return (kr = !1);
    if (/iP(hone|od|ad)/.test(navigator.userAgent)) return (kr = !0);
    const e = navigator.maxTouchPoints;
    return (kr = navigator.platform === "MacIntel" && e !== void 0 && e > 0);
  },
  Sc = (e) => {
    const { offsetWidth: t, offsetHeight: n } = e;
    return { width: t, height: n };
  },
  _v = (e) => e,
  wv = (e) => {
    const t = Math.max(e.startIndex - e.overscan, 0),
      r = Math.min(e.endIndex + e.overscan, e.count - 1) - t + 1,
      i = new Array(r);
    for (let o = 0; o < r; o++) i[o] = t + o;
    return i;
  },
  kv = (e, t) => {
    const n = e.scrollElement;
    if (!n) return;
    const r = e.targetWindow;
    if (!r) return;
    const i = (s) => {
      const { width: a, height: u } = s;
      t({ width: Math.round(a), height: Math.round(u) });
    };
    if ((i(Sc(n)), !r.ResizeObserver)) return () => {};
    const o = new r.ResizeObserver((s) => {
      const a = () => {
        const u = s[0];
        if (u != null && u.borderBoxSize) {
          const c = u.borderBoxSize[0];
          if (c) {
            i({ width: c.inlineSize, height: c.blockSize });
            return;
          }
        }
        i(Sc(n));
      };
      e.options.useAnimationFrameWithResizeObserver
        ? requestAnimationFrame(a)
        : a();
    });
    return (
      o.observe(n, { box: "border-box" }),
      () => {
        o.unobserve(n);
      }
    );
  },
  Eo = { passive: !0 },
  jv = typeof window > "u" ? !0 : "onscrollend" in window,
  bv = (e, t, n) => {
    const r = e.scrollElement;
    if (!r) return;
    const i = e.targetWindow;
    if (!i) return;
    const o = e.options.useScrollendEvent && jv;
    let s = 0;
    const a = o ? null : Sv(i, () => t(s, !1), e.options.isScrollingResetDelay),
      u = (p) => () => {
        ((s = n(r)), a == null || a(), t(s, p));
      },
      c = u(!0),
      d = u(!1);
    return (
      r.addEventListener("scroll", c, Eo),
      o && r.addEventListener("scrollend", d, Eo),
      () => {
        (r.removeEventListener("scroll", c),
          o && r.removeEventListener("scrollend", d));
      }
    );
  },
  Cv = (e, t) =>
    bv(e, t, (n) => {
      const { horizontal: r, isRtl: i } = e.options;
      return r ? n.scrollLeft * ((i && -1) || 1) : n.scrollTop;
    }),
  Ev = (e, t, n) => {
    if (n.options.useCachedMeasurements) {
      const r = n.indexFromElement(e),
        i = n.options.getItemKey(r);
      return n.itemSizeCache.get(i) ?? n.options.estimateSize(r);
    }
    if (t != null && t.borderBoxSize) {
      const r = t.borderBoxSize[0];
      if (r)
        return Math.round(r[n.options.horizontal ? "inlineSize" : "blockSize"]);
    }
    if (!t) {
      const r = n.indexFromElement(e),
        i = n.options.getItemKey(r),
        o = n.itemSizeCache.get(i);
      if (o !== void 0) return o;
    }
    return e[n.options.horizontal ? "offsetWidth" : "offsetHeight"];
  },
  zv = (e, { adjustments: t = 0, behavior: n }, r) => {
    var i, o;
    (o = (i = r.scrollElement) == null ? void 0 : i.scrollTo) == null ||
      o.call(i, {
        [r.options.horizontal ? "left" : "top"]: e + t,
        behavior: n,
      });
  },
  Rv = zv;
class Pv {
  constructor(t) {
    ((this.unsubs = []),
      (this.scrollElement = null),
      (this.targetWindow = null),
      (this.isScrolling = !1),
      (this.scrollState = null),
      (this.measurementsCache = []),
      (this._flatMeasurements = null),
      (this.itemSizeCache = new Map()),
      (this.itemSizeCacheVersion = 0),
      (this.laneAssignments = new Map()),
      (this.pendingMin = null),
      (this.prevLanes = void 0),
      (this.lanesChangedFlag = !1),
      (this.lanesSettling = !1),
      (this.pendingScrollAnchor = null),
      (this.scrollRect = null),
      (this.scrollOffset = null),
      (this.scrollDirection = null),
      (this.scrollAdjustments = 0),
      (this._iosDeferredAdjustment = 0),
      (this._iosTouching = !1),
      (this._iosJustTouchEnded = !1),
      (this._iosTouchEndTimerId = null),
      (this._intendedScrollOffset = null),
      (this.elementsCache = new Map()),
      (this.now = () => {
        var n, r, i;
        return (
          ((i =
            (r = (n = this.targetWindow) == null ? void 0 : n.performance) ==
            null
              ? void 0
              : r.now) == null
            ? void 0
            : i.call(r)) ?? Date.now()
        );
      }),
      (this.observer = (() => {
        let n = null;
        const r = () =>
          n ||
          (!this.targetWindow || !this.targetWindow.ResizeObserver
            ? null
            : (n = new this.targetWindow.ResizeObserver((i) => {
                i.forEach((o) => {
                  const s = () => {
                    const a = o.target,
                      u = this.indexFromElement(a);
                    if (!a.isConnected) {
                      this.observer.unobserve(a);
                      for (const [c, d] of this.elementsCache)
                        if (d === a) {
                          this.elementsCache.delete(c);
                          break;
                        }
                      return;
                    }
                    this.shouldMeasureDuringScroll(u) &&
                      this.resizeItem(
                        u,
                        this.options.measureElement(a, o, this),
                      );
                  };
                  this.options.useAnimationFrameWithResizeObserver
                    ? requestAnimationFrame(s)
                    : s();
                });
              })));
        return {
          disconnect: () => {
            var i;
            ((i = r()) == null || i.disconnect(), (n = null));
          },
          observe: (i) => {
            var o;
            return (o = r()) == null
              ? void 0
              : o.observe(i, { box: "border-box" });
          },
          unobserve: (i) => {
            var o;
            return (o = r()) == null ? void 0 : o.unobserve(i);
          },
        };
      })()),
      (this.range = null),
      (this.setOptions = (n) => {
        var r, i;
        const o = {
          debug: !1,
          initialOffset: 0,
          overscan: 1,
          paddingStart: 0,
          paddingEnd: 0,
          scrollPaddingStart: 0,
          scrollPaddingEnd: 0,
          horizontal: !1,
          getItemKey: _v,
          rangeExtractor: wv,
          onChange: () => {},
          measureElement: Ev,
          initialRect: { width: 0, height: 0 },
          scrollMargin: 0,
          gap: 0,
          indexAttribute: "data-index",
          initialMeasurementsCache: [],
          lanes: 1,
          anchorTo: "start",
          followOnAppend: !1,
          scrollEndThreshold: 1,
          isScrollingResetDelay: 150,
          enabled: !0,
          isRtl: !1,
          useScrollendEvent: !1,
          useAnimationFrameWithResizeObserver: !1,
          laneAssignmentMode: "estimate",
          useCachedMeasurements: !1,
        };
        for (const g in n) {
          const k = n[g];
          k !== void 0 && (o[g] = k);
        }
        const s = this.options;
        let a = null,
          u = null,
          c = !1;
        if (
          s !== void 0 &&
          s.enabled &&
          o.enabled &&
          o.anchorTo === "end" &&
          this.scrollElement !== null
        ) {
          const g = s.count,
            k = o.count,
            x = this.getMeasurements(),
            _ =
              g > 0
                ? (((r = x[0]) == null ? void 0 : r.key) ?? s.getItemKey(0))
                : null,
            S =
              g > 0
                ? (((i = x[g - 1]) == null ? void 0 : i.key) ??
                  s.getItemKey(g - 1))
                : null;
          if (
            k !== g ||
            (g > 0 &&
              k > 0 &&
              (o.getItemKey(0) !== _ || o.getItemKey(k - 1) !== S))
          ) {
            c = !0;
            const m =
              g > 0
                ? (this.getVirtualItemForOffset(this.getScrollOffset()) ?? x[0])
                : null;
            m && (a = [m.key, this.getScrollOffset() - m.start]);
            const w =
              o.followOnAppend === !0 ? "auto" : o.followOnAppend || null;
            w &&
              k > g &&
              this.isAtEnd(s.scrollEndThreshold) &&
              (g === 0 || o.getItemKey(k - 1) !== S) &&
              (u = w);
          }
        }
        ((this.options = o),
          c && ((this.pendingMin = 0), this.itemSizeCacheVersion++));
        let d = !1,
          p = 0;
        if (a && this.scrollOffset !== null) {
          const [g, k] = a,
            x = this.getMeasurements(),
            { count: _, getItemKey: S } = this.options;
          let h = 0;
          for (; h < _ && S(h) !== g; ) h++;
          if (h < _) {
            const f = x[h];
            if (f) {
              const m = f.start + k;
              m !== this.scrollOffset &&
                ((p = m - this.scrollOffset),
                (this.scrollOffset = m),
                (d = !0));
            }
          }
        }
        (d || u) &&
          (this.pendingScrollAnchor = [d ? a[0] : null, d ? a[1] : 0, u, p]);
      }),
      (this.notify = (n) => {
        var r, i;
        (i = (r = this.options).onChange) == null || i.call(r, this, n);
      }),
      (this.maybeNotify = Pn(
        () => (
          this.calculateRange(),
          [
            this.isScrolling,
            this.range ? this.range.startIndex : null,
            this.range ? this.range.endIndex : null,
          ]
        ),
        (n) => {
          this.notify(n);
        },
        {
          key: !1,
          debug: () => this.options.debug,
          initialDeps: [
            this.isScrolling,
            this.range ? this.range.startIndex : null,
            this.range ? this.range.endIndex : null,
          ],
        },
      )),
      (this.cleanup = () => {
        (this.unsubs.filter(Boolean).forEach((n) => n()),
          (this.unsubs = []),
          this.observer.disconnect(),
          this.rafId != null &&
            this.targetWindow &&
            (this.targetWindow.cancelAnimationFrame(this.rafId),
            (this.rafId = null)),
          (this.scrollState = null),
          (this.scrollElement = null),
          (this.targetWindow = null));
      }),
      (this._didMount = () => () => {
        this.cleanup();
      }),
      (this._willUpdate = () => {
        var n;
        const r = this.options.enabled ? this.options.getScrollElement() : null;
        if (this.scrollElement !== r) {
          if ((this.cleanup(), !r)) {
            this.maybeNotify();
            return;
          }
          if (
            ((this.scrollElement = r),
            this.scrollElement && "ownerDocument" in this.scrollElement
              ? (this.targetWindow =
                  this.scrollElement.ownerDocument.defaultView)
              : (this.targetWindow =
                  ((n = this.scrollElement) == null ? void 0 : n.window) ??
                  null),
            this.elementsCache.forEach((o) => {
              this.observer.observe(o);
            }),
            this.unsubs.push(
              this.options.observeElementRect(this, (o) => {
                ((this.scrollRect = o), this.maybeNotify());
              }),
            ),
            this.unsubs.push(
              this.options.observeElementOffset(this, (o, s) => {
                if (
                  s &&
                  this._intendedScrollOffset === null &&
                  o === this.scrollOffset
                )
                  return;
                (this._intendedScrollOffset !== null &&
                  Math.abs(o - this._intendedScrollOffset) < 1.5 &&
                  (o = this._intendedScrollOffset),
                  (this._intendedScrollOffset = null),
                  (this.scrollAdjustments = 0));
                const a = this.getScrollOffset();
                ((this.scrollDirection = s
                  ? a === o
                    ? this.scrollDirection
                    : a < o
                      ? "forward"
                      : "backward"
                  : null),
                  (this.scrollOffset = o),
                  (this.isScrolling = s),
                  this._flushIosDeferredIfReady(),
                  this.scrollState && this.scheduleScrollReconcile(),
                  this.maybeNotify());
              }),
            ),
            "addEventListener" in this.scrollElement)
          ) {
            const o = this.scrollElement,
              s = () => {
                ((this._iosTouching = !0),
                  (this._iosJustTouchEnded = !1),
                  this._iosTouchEndTimerId !== null &&
                    this.targetWindow != null &&
                    (this.targetWindow.clearTimeout(this._iosTouchEndTimerId),
                    (this._iosTouchEndTimerId = null)));
              },
              a = () => {
                ((this._iosTouching = !1),
                  !(!jl() || this.targetWindow == null) &&
                    ((this._iosJustTouchEnded = !0),
                    (this._iosTouchEndTimerId = this.targetWindow.setTimeout(
                      () => {
                        ((this._iosJustTouchEnded = !1),
                          (this._iosTouchEndTimerId = null),
                          this._flushIosDeferredIfReady());
                      },
                      150,
                    ))));
              };
            (o.addEventListener("touchstart", s, Eo),
              o.addEventListener("touchend", a, Eo),
              this.unsubs.push(() => {
                (o.removeEventListener("touchstart", s),
                  o.removeEventListener("touchend", a),
                  this._iosTouchEndTimerId !== null &&
                    this.targetWindow != null &&
                    (this.targetWindow.clearTimeout(this._iosTouchEndTimerId),
                    (this._iosTouchEndTimerId = null)));
              }));
          }
          this._scrollToOffset(this.getScrollOffset(), {
            adjustments: void 0,
            behavior: void 0,
          });
        }
        const i = this.pendingScrollAnchor;
        if (
          ((this.pendingScrollAnchor = null),
          i && this.scrollElement && this.options.enabled)
        ) {
          const [o, s, a, u] = i;
          (o !== null &&
            !a &&
            (jl() &&
            (this.isScrolling || this._iosTouching || this._iosJustTouchEnded)
              ? u !== 0 && (this._iosDeferredAdjustment += u)
              : this._scrollToOffset(this.getScrollOffset(), {
                  adjustments: void 0,
                  behavior: void 0,
                })),
            a && this.scrollToEnd({ behavior: a }));
        }
      }),
      (this._flushIosDeferredIfReady = () => {
        if (
          this._iosDeferredAdjustment === 0 ||
          this.isScrolling ||
          this._iosTouching ||
          this._iosJustTouchEnded
        )
          return;
        const n = this.getScrollOffset(),
          r = this.getMaxScrollOffset();
        if (n < 0 || n > r) return;
        const i = this._iosDeferredAdjustment;
        ((this._iosDeferredAdjustment = 0),
          this._scrollToOffset(n, {
            adjustments: (this.scrollAdjustments += i),
            behavior: void 0,
          }));
      }),
      (this.rafId = null),
      (this.getSize = () =>
        this.options.enabled
          ? ((this.scrollRect = this.scrollRect ?? this.options.initialRect),
            this.scrollRect[this.options.horizontal ? "width" : "height"])
          : ((this.scrollRect = null), 0)),
      (this.getScrollOffset = () =>
        this.options.enabled
          ? ((this.scrollOffset =
              this.scrollOffset ??
              (typeof this.options.initialOffset == "function"
                ? this.options.initialOffset()
                : this.options.initialOffset)),
            this.scrollOffset)
          : ((this.scrollOffset = null), 0)),
      (this.getFurthestMeasurement = (n, r) => {
        const i = new Map(),
          o = new Map();
        for (let s = r - 1; s >= 0; s--) {
          const a = n[s];
          if (i.has(a.lane)) continue;
          const u = o.get(a.lane);
          if (
            (u == null || a.end > u.end
              ? o.set(a.lane, a)
              : a.end < u.end && i.set(a.lane, !0),
            i.size === this.options.lanes)
          )
            break;
        }
        return o.size === this.options.lanes
          ? Array.from(o.values()).sort((s, a) =>
              s.end === a.end ? s.index - a.index : s.end - a.end,
            )[0]
          : void 0;
      }),
      (this.getMeasurementOptions = Pn(
        () => [
          this.options.count,
          this.options.paddingStart,
          this.options.scrollMargin,
          this.options.getItemKey,
          this.options.enabled,
          this.options.lanes,
          this.options.laneAssignmentMode,
        ],
        (n, r, i, o, s, a, u) => (
          this.prevLanes !== void 0 &&
            this.prevLanes !== a &&
            (this.lanesChangedFlag = !0),
          (this.prevLanes = a),
          (this.pendingMin = null),
          {
            count: n,
            paddingStart: r,
            scrollMargin: i,
            getItemKey: o,
            enabled: s,
            lanes: a,
            laneAssignmentMode: u,
          }
        ),
        { key: !1 },
      )),
      (this.getMeasurements = Pn(
        () => [this.getMeasurementOptions(), this.itemSizeCacheVersion],
        (
          {
            count: n,
            paddingStart: r,
            scrollMargin: i,
            getItemKey: o,
            enabled: s,
            lanes: a,
            laneAssignmentMode: u,
          },
          c,
        ) => {
          const d = this.itemSizeCache;
          if (!s)
            return (
              (this.measurementsCache = []),
              this.itemSizeCache.clear(),
              this.laneAssignments.clear(),
              []
            );
          if (this.laneAssignments.size > n)
            for (const x of this.laneAssignments.keys())
              x >= n && this.laneAssignments.delete(x);
          (this.lanesChangedFlag &&
            ((this.lanesChangedFlag = !1),
            (this.lanesSettling = !0),
            (this.measurementsCache = []),
            this.itemSizeCache.clear(),
            this.laneAssignments.clear(),
            (this.pendingMin = null)),
            this.measurementsCache.length === 0 &&
              !this.lanesSettling &&
              ((this.measurementsCache = this.options.initialMeasurementsCache),
              this.measurementsCache.forEach((x) => {
                this.itemSizeCache.set(x.key, x.size);
              })));
          const p = this.lanesSettling ? 0 : (this.pendingMin ?? 0);
          if (
            ((this.pendingMin = null),
            this.lanesSettling &&
              this.measurementsCache.length === n &&
              (this.lanesSettling = !1),
            a === 1)
          ) {
            const x = this.options.gap,
              _ = n * 2;
            let S = this._flatMeasurements;
            if (!S || S.length < _) {
              const m = new Float64Array(_);
              (S && p > 0 && m.set(S.subarray(0, p * 2)),
                (S = m),
                (this._flatMeasurements = S));
            }
            let h;
            if (p === 0) h = r + i;
            else {
              const m = p - 1;
              h = S[m * 2] + S[m * 2 + 1] + x;
            }
            for (let m = p; m < n; m++) {
              const w = o(m),
                C = d.get(w),
                R = typeof C == "number" ? C : this.options.estimateSize(m);
              ((S[m * 2] = h), (S[m * 2 + 1] = R), (h += R + x));
            }
            const f = xv(n, S, o);
            return ((this.measurementsCache = f), f);
          }
          const g = this.measurementsCache.slice(0, p),
            k = new Array(a).fill(void 0);
          for (let x = 0; x < p; x++) {
            const _ = g[x];
            _ && (k[_.lane] = x);
          }
          for (let x = p; x < n; x++) {
            const _ = o(x),
              S = this.laneAssignments.get(x);
            let h, f;
            const m = u === "estimate" || d.has(_);
            if (S !== void 0 && this.options.lanes > 1) {
              h = S;
              const z = k[h],
                P = z !== void 0 ? g[z] : void 0;
              f = P ? P.end + this.options.gap : r + i;
            } else {
              const z =
                this.options.lanes === 1
                  ? g[x - 1]
                  : this.getFurthestMeasurement(g, x);
              ((f = z ? z.end + this.options.gap : r + i),
                (h = z ? z.lane : x % this.options.lanes),
                this.options.lanes > 1 && m && this.laneAssignments.set(x, h));
            }
            const w = d.get(_),
              C = typeof w == "number" ? w : this.options.estimateSize(x),
              R = f + C;
            ((g[x] = { index: x, start: f, size: C, end: R, key: _, lane: h }),
              (k[h] = x));
          }
          return ((this.measurementsCache = g), g);
        },
        { key: !1, debug: () => this.options.debug },
      )),
      (this.calculateRange = Pn(
        () => [
          this.getMeasurements(),
          this.getSize(),
          this.getScrollOffset(),
          this.options.lanes,
        ],
        (n, r, i, o) =>
          n.length === 0 || r === 0
            ? ((this.range = null), null)
            : ((this.range = Mv(
                n,
                r,
                i,
                o,
                o === 1 && this._flatMeasurements != null
                  ? this._flatMeasurements
                  : null,
              )),
              this.range),
        { key: !1, debug: () => this.options.debug },
      )),
      (this.getVirtualIndexes = Pn(
        () => {
          let n = null,
            r = null;
          const i = this.calculateRange();
          return (
            i && ((n = i.startIndex), (r = i.endIndex)),
            this.maybeNotify.updateDeps([this.isScrolling, n, r]),
            [
              this.options.rangeExtractor,
              this.options.overscan,
              this.options.count,
              n,
              r,
            ]
          );
        },
        (n, r, i, o, s) =>
          o === null || s === null
            ? []
            : n({ startIndex: o, endIndex: s, overscan: r, count: i }),
        { key: !1, debug: () => this.options.debug },
      )),
      (this.indexFromElement = (n) => {
        const r = this.options.indexAttribute,
          i = n.getAttribute(r);
        return i
          ? parseInt(i, 10)
          : (console.warn(
              `Missing attribute name '${r}={index}' on measured element.`,
            ),
            -1);
      }),
      (this.shouldMeasureDuringScroll = (n) => {
        var r;
        if (!this.scrollState || this.scrollState.behavior !== "smooth")
          return !0;
        const i =
          this.scrollState.index ??
          ((r = this.getVirtualItemForOffset(
            this.scrollState.lastTargetOffset,
          )) == null
            ? void 0
            : r.index);
        if (i !== void 0 && this.range) {
          const o = Math.max(
              this.options.overscan,
              Math.ceil((this.range.endIndex - this.range.startIndex) / 2),
            ),
            s = Math.max(0, i - o),
            a = Math.min(this.options.count - 1, i + o);
          return n >= s && n <= a;
        }
        return !0;
      }),
      (this.measureElement = (n) => {
        if (!n) {
          this.elementsCache.forEach((s, a) => {
            s.isConnected ||
              (this.observer.unobserve(s), this.elementsCache.delete(a));
          });
          return;
        }
        const r = this.indexFromElement(n),
          i = this.options.getItemKey(r),
          o = this.elementsCache.get(i);
        (o !== n &&
          (o && this.observer.unobserve(o),
          this.observer.observe(n),
          this.elementsCache.set(i, n)),
          (!this.isScrolling || this.scrollState) &&
            this.shouldMeasureDuringScroll(r) &&
            this.resizeItem(r, this.options.measureElement(n, void 0, this)));
      }),
      (this.resizeItem = (n, r) => {
        var i, o;
        if (n < 0 || n >= this.options.count) return;
        let s, a, u;
        const c = this._flatMeasurements;
        if (this.options.lanes === 1 && c !== null)
          ((u = this.options.getItemKey(n)),
            (a = c[n * 2]),
            (s = c[n * 2 + 1]));
        else {
          const g = this.measurementsCache[n];
          if (!g) return;
          ((u = g.key), (a = g.start), (s = g.size));
        }
        const d = this.itemSizeCache.get(u) ?? s,
          p = r - d;
        if (p !== 0) {
          const g =
              this.options.anchorTo === "end" &&
              ((i = this.scrollState) == null ? void 0 : i.behavior) !==
                "smooth" &&
              this.getVirtualDistanceFromEnd() <=
                this.options.scrollEndThreshold,
            k = g ? this.getTotalSize() : 0,
            x =
              ((o = this.scrollState) == null ? void 0 : o.behavior) !==
                "smooth" &&
              (this.shouldAdjustScrollPositionOnItemSizeChange !== void 0
                ? this.shouldAdjustScrollPositionOnItemSizeChange(
                    this.measurementsCache[n] ?? {
                      index: n,
                      key: u,
                      start: a,
                      size: s,
                      end: a + s,
                      lane: 0,
                    },
                    p,
                    this,
                  )
                : a < this.getScrollOffset() + this.scrollAdjustments &&
                  (!this.itemSizeCache.has(u) ||
                    this.scrollDirection !== "backward"));
          ((this.pendingMin === null || n < this.pendingMin) &&
            (this.pendingMin = n),
            this.itemSizeCache.set(u, r),
            this.itemSizeCacheVersion++,
            g
              ? this.applyScrollAdjustment(this.getTotalSize() - k)
              : x && this.applyScrollAdjustment(p),
            this.notify(!1));
        }
      }),
      (this.getVirtualItems = Pn(
        () => [this.getVirtualIndexes(), this.getMeasurements()],
        (n, r) => {
          const i = [];
          for (let o = 0, s = n.length; o < s; o++) {
            const a = n[o],
              u = r[a];
            i.push(u);
          }
          return i;
        },
        { key: !1, debug: () => this.options.debug },
      )),
      (this.getVirtualItemForOffset = (n) => {
        const r = this.getMeasurements();
        if (r.length === 0) return;
        const i = this._flatMeasurements,
          o = this.options.lanes === 1 && i != null,
          s = mp(
            0,
            r.length - 1,
            o ? (a) => i[a * 2] : (a) => yc(r[a]).start,
            n,
          );
        return yc(r[s]);
      }),
      (this.getMaxScrollOffset = () => {
        if (!this.scrollElement) return 0;
        if ("scrollHeight" in this.scrollElement)
          return this.options.horizontal
            ? this.scrollElement.scrollWidth - this.scrollElement.clientWidth
            : this.scrollElement.scrollHeight - this.scrollElement.clientHeight;
        {
          const n = this.scrollElement.document.documentElement;
          return this.options.horizontal
            ? n.scrollWidth - this.scrollElement.innerWidth
            : n.scrollHeight - this.scrollElement.innerHeight;
        }
      }),
      (this.getVirtualDistanceFromEnd = () =>
        Math.max(
          this.getTotalSize() - this.getSize() - this.getScrollOffset(),
          0,
        )),
      (this.getDistanceFromEnd = () =>
        Math.max(this.getMaxScrollOffset() - this.getScrollOffset(), 0)),
      (this.isAtEnd = (n = this.options.scrollEndThreshold) =>
        this.getDistanceFromEnd() <= n),
      (this.getOffsetForAlignment = (n, r, i = 0) => {
        if (!this.scrollElement) return 0;
        const o = this.getSize(),
          s = this.getScrollOffset();
        (r === "auto" && (r = n >= s + o ? "end" : "start"),
          r === "center" ? (n += (i - o) / 2) : r === "end" && (n -= o));
        const a = this.getMaxScrollOffset();
        return Math.max(Math.min(a, n), 0);
      }),
      (this.getOffsetForIndex = (n, r = "auto") => {
        n = Math.max(0, Math.min(n, this.options.count - 1));
        const i = this.getSize(),
          o = this.getScrollOffset(),
          s = this.measurementsCache[n];
        if (!s) return;
        if (r === "auto")
          if (s.end >= o + i - this.options.scrollPaddingEnd) r = "end";
          else if (s.start <= o + this.options.scrollPaddingStart) r = "start";
          else return [o, r];
        if (r === "end" && n === this.options.count - 1)
          return [this.getMaxScrollOffset(), r];
        const a =
          r === "end"
            ? s.end + this.options.scrollPaddingEnd
            : s.start - this.options.scrollPaddingStart;
        return [this.getOffsetForAlignment(a, r, s.size), r];
      }),
      (this.scrollToOffset = (
        n,
        { align: r = "start", behavior: i = "auto" } = {},
      ) => {
        const o = this.getOffsetForAlignment(n, r),
          s = this.now();
        ((this.scrollState = {
          index: null,
          align: r,
          behavior: i,
          startedAt: s,
          lastTargetOffset: o,
          stableFrames: 0,
        }),
          this._scrollToOffset(o, { adjustments: void 0, behavior: i }),
          this.scheduleScrollReconcile());
      }),
      (this.scrollToIndex = (
        n,
        { align: r = "auto", behavior: i = "auto" } = {},
      ) => {
        n = Math.max(0, Math.min(n, this.options.count - 1));
        const o = this.getOffsetForIndex(n, r);
        if (!o) return;
        const [s, a] = o,
          u = this.now();
        ((this.scrollState = {
          index: n,
          align: a,
          behavior: i,
          startedAt: u,
          lastTargetOffset: s,
          stableFrames: 0,
        }),
          this._scrollToOffset(s, { adjustments: void 0, behavior: i }),
          this.scheduleScrollReconcile());
      }),
      (this.scrollBy = (n, { behavior: r = "auto" } = {}) => {
        const i = this.getScrollOffset() + n,
          o = this.now();
        ((this.scrollState = {
          index: null,
          align: "start",
          behavior: r,
          startedAt: o,
          lastTargetOffset: i,
          stableFrames: 0,
        }),
          this._scrollToOffset(i, { adjustments: void 0, behavior: r }),
          this.scheduleScrollReconcile());
      }),
      (this.scrollToEnd = ({ behavior: n = "auto" } = {}) => {
        if (this.options.count > 0) {
          this.scrollToIndex(this.options.count - 1, {
            align: "end",
            behavior: n,
          });
          return;
        }
        this.scrollToOffset(Math.max(this.getTotalSize() - this.getSize(), 0), {
          behavior: n,
        });
      }),
      (this.getTotalSize = () => {
        var n;
        const r = this.getMeasurements();
        let i;
        if (r.length === 0) i = this.options.paddingStart;
        else if (this.options.lanes === 1) {
          const o = r.length - 1,
            s = this._flatMeasurements;
          s != null
            ? (i = s[o * 2] + s[o * 2 + 1])
            : (i = ((n = r[o]) == null ? void 0 : n.end) ?? 0);
        } else {
          const o = Array(this.options.lanes).fill(null);
          let s = r.length - 1;
          for (; s >= 0 && o.some((a) => a === null); ) {
            const a = r[s];
            (o[a.lane] === null && (o[a.lane] = a.end), s--);
          }
          i = Math.max(...o.filter((a) => a !== null));
        }
        return Math.max(
          i - this.options.scrollMargin + this.options.paddingEnd,
          0,
        );
      }),
      (this.takeSnapshot = () => {
        const n = [];
        if (this.itemSizeCache.size === 0) return n;
        const r = this.getMeasurements();
        for (const i of r)
          i &&
            this.itemSizeCache.has(i.key) &&
            n.push({
              index: i.index,
              key: i.key,
              start: i.start,
              size: i.size,
              end: i.end,
              lane: i.lane,
            });
        return n;
      }),
      (this._scrollToOffset = (n, { adjustments: r, behavior: i }) => {
        ((this._intendedScrollOffset = n + (r ?? 0)),
          this.options.scrollToFn(n, { behavior: i, adjustments: r }, this));
      }),
      (this.measure = () => {
        ((this.pendingMin = null),
          this.itemSizeCache.clear(),
          this.laneAssignments.clear(),
          this.itemSizeCacheVersion++,
          this.notify(!1));
      }),
      this.setOptions(t));
  }
  applyScrollAdjustment(t, n) {
    t !== 0 &&
      (jl() &&
      (this.isScrolling || this._iosTouching || this._iosJustTouchEnded)
        ? (this._iosDeferredAdjustment += t)
        : (this._scrollToOffset(this.getScrollOffset(), {
            adjustments: (this.scrollAdjustments += t),
            behavior: n,
          }),
          this.scrollOffset !== null &&
            ((this.scrollOffset += this.scrollAdjustments),
            (this.scrollAdjustments = 0))));
  }
  scheduleScrollReconcile() {
    if (!this.targetWindow) {
      this.scrollState = null;
      return;
    }
    this.rafId == null &&
      (this.rafId = this.targetWindow.requestAnimationFrame(() => {
        ((this.rafId = null), this.reconcileScroll());
      }));
  }
  reconcileScroll() {
    if (!this.scrollState || !this.scrollElement) return;
    if (this.now() - this.scrollState.startedAt > 5e3) {
      this.scrollState = null;
      return;
    }
    const r =
        this.scrollState.index != null
          ? this.getOffsetForIndex(
              this.scrollState.index,
              this.scrollState.align,
            )
          : void 0,
      i = r ? r[0] : this.scrollState.lastTargetOffset,
      o = 1,
      s = i !== this.scrollState.lastTargetOffset;
    if (!s && yv(i, this.getScrollOffset())) {
      if (
        (this.scrollState.stableFrames++, this.scrollState.stableFrames >= o)
      ) {
        (this.getScrollOffset() !== i &&
          this._scrollToOffset(i, { adjustments: void 0, behavior: "auto" }),
          (this.scrollState = null));
        return;
      }
    } else if (((this.scrollState.stableFrames = 0), s)) {
      const a = this.getSize() || 600,
        u = Math.abs(i - this.getScrollOffset()),
        c = this.scrollState.behavior === "smooth" && u > a;
      ((this.scrollState.lastTargetOffset = i),
        c || (this.scrollState.behavior = "auto"),
        this._scrollToOffset(i, {
          adjustments: void 0,
          behavior: c ? "smooth" : "auto",
        }));
    }
    this.scheduleScrollReconcile();
  }
}
const mp = (e, t, n, r) => {
  for (; e <= t; ) {
    const i = ((e + t) / 2) | 0,
      o = n(i);
    if (o < r) e = i + 1;
    else if (o > r) t = i - 1;
    else return i;
  }
  return e > 0 ? e - 1 : 0;
};
function Tv(e, t, n) {
  let r = 0;
  for (; r <= t; ) {
    const i = ((r + t) / 2) | 0,
      o = e[i * 2];
    if (o < n) r = i + 1;
    else if (o > n) t = i - 1;
    else return i;
  }
  return r > 0 ? r - 1 : 0;
}
function Mv(e, t, n, r, i) {
  const o = e.length - 1;
  if (e.length <= r) return { startIndex: 0, endIndex: o };
  if (r === 1 && i !== null) {
    const c = Tv(i, o, n);
    let d = c;
    const p = n + t;
    for (; d < o && i[d * 2] + i[d * 2 + 1] < p; ) d++;
    return { startIndex: c, endIndex: d };
  }
  let a = mp(0, o, (c) => e[c].start, n),
    u = a;
  if (r === 1) for (; u < o && e[u].end < n + t; ) u++;
  else if (r > 1) {
    const c = Array(r).fill(0);
    for (; u < o && c.some((p) => p < n + t); ) {
      const p = e[u];
      ((c[p.lane] = p.end), u++);
    }
    const d = Array(r).fill(n + t);
    for (; a >= 0 && d.some((p) => p >= n); ) {
      const p = e[a];
      ((d[p.lane] = p.start), a--);
    }
    ((a = Math.max(0, a - (a % r))), (u = Math.min(o, u + (r - 1 - (u % r)))));
  }
  return { startIndex: a, endIndex: u };
}
const bl = typeof document < "u" ? v.useLayoutEffect : v.useEffect;
function Iv({
  useFlushSync: e = !0,
  directDomUpdates: t = !1,
  directDomUpdatesMode: n = "transform",
  ...r
}) {
  const i = v.useReducer((c) => c + 1, 0)[1],
    o = v.useRef({
      enabled: t,
      mode: n,
      container: null,
      lastSize: null,
      lastPositions: new WeakMap(),
      prevRange: null,
    });
  ((o.current.enabled = t), (o.current.mode = n));
  const s = (c) => {
      const d = o.current;
      if (!d.enabled || !d.container) return;
      const p = c.getTotalSize();
      if (p !== d.lastSize) {
        d.lastSize = p;
        const h = c.options.horizontal ? "width" : "height";
        d.container.style[h] = `${p}px`;
      }
      const g = !!c.options.horizontal,
        k = d.mode === "transform",
        x = g ? "left" : "top",
        _ = c.options.scrollMargin,
        S = c.getVirtualItems();
      for (const h of S) {
        const f = h.start - _,
          m = c.elementsCache.get(h.key);
        m &&
          d.lastPositions.get(m) !== f &&
          (d.lastPositions.set(m, f),
          k
            ? (m.style.transform = g
                ? `translate3d(${f}px, 0, 0)`
                : `translate3d(0, ${f}px, 0)`)
            : (m.style[x] = `${f}px`));
      }
    },
    a = {
      ...r,
      onChange: (c, d) => {
        var p;
        const g = o.current;
        let k = !0;
        if (g.enabled) {
          s(c);
          const x = c.range,
            _ = g.prevRange;
          ((k =
            !_ ||
            _.isScrolling !== c.isScrolling ||
            _.startIndex !== (x == null ? void 0 : x.startIndex) ||
            _.endIndex !== (x == null ? void 0 : x.endIndex)),
            k &&
              (g.prevRange = x
                ? {
                    startIndex: x.startIndex,
                    endIndex: x.endIndex,
                    isScrolling: c.isScrolling,
                  }
                : null));
        }
        (k && (e && d ? Ea.flushSync(i) : i()),
          (p = r.onChange) == null || p.call(r, c, d));
      },
    },
    [u] = v.useState(() => {
      const c = new Pv(a);
      return Object.assign(c, {
        containerRef: (d) => {
          const p = o.current;
          if (((p.container = d), (p.lastSize = null), d && p.enabled)) {
            const g = c.getTotalSize();
            p.lastSize = g;
            const k = c.options.horizontal ? "width" : "height";
            d.style[k] = `${g}px`;
          }
        },
      });
    });
  return (
    u.setOptions(a),
    bl(() => u._didMount(), []),
    bl(() => u._willUpdate()),
    bl(() => {
      s(u);
    }),
    u
  );
}
function Lv(e) {
  return Iv({
    observeElementRect: kv,
    observeElementOffset: Cv,
    scrollToFn: Rv,
    ...e,
  });
}
function Nv(e, t) {
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
function Ov(e, t) {
  return (
    e &&
    (/^https?:\/\//i.test(e)
      ? Ps(e)
      : Ps(`${t.replace(/\/$/, "")}/${e.replace(/^\//, "")}`))
  );
}
function Qo({
  src: e,
  encryptedFileKey: t,
  alt: n = "",
  className: r,
  style: i,
  onLoad: o,
  eager: s = !1,
}) {
  const [a, u] = v.useState(null),
    [c, d] = v.useState(!1),
    p = v.useRef(null),
    g = Ae((C) => C.mainEncryptionKey),
    k = Ae((C) => C.token),
    x = Ae((C) => C.username),
    _ = K((C) => C.apiUrl),
    S = b0(_),
    h = K((C) => C.urlSubstitutions),
    f = v.useRef(null),
    [m, w] = v.useState(s);
  return (
    v.useEffect(() => {
      if (s || m) return;
      const C = f.current;
      if (!C || typeof IntersectionObserver > "u") {
        w(!0);
        return;
      }
      const R = new IntersectionObserver(
        (z) => {
          var P;
          (P = z[0]) != null && P.isIntersecting && (w(!0), R.disconnect());
        },
        { rootMargin: "400px" },
      );
      return (R.observe(C), () => R.disconnect());
    }, [s, m]),
    v.useEffect(() => {
      if (!e || !m) return;
      let C = !1;
      async function R() {
        d(!1);
        try {
          const z = Ov(e, S),
            P = {};
          (k && (P.Authorization = k),
            x && ((P["X-Username"] = x), (P.username = x)));
          const L = await fetch(z, { headers: P });
          if (!L.ok)
            throw (La(L.status), new Error(`HTTP ${L.status} for ${z}`));
          let b = await L.arrayBuffer();
          if (t && g)
            try {
              const M = await hv(t, g);
              b = await gv(b, M);
            } catch (M) {
              console.warn("[AuthImage] decryption failed:", M, { src: e });
            }
          if (C) return;
          const A = new Uint8Array(b),
            F = Nv(A, e),
            V = new Blob([b], { type: F }),
            U = URL.createObjectURL(V);
          (p.current && URL.revokeObjectURL(p.current), (p.current = U), u(U));
        } catch (z) {
          (console.warn("[AuthImage] load failed:", z, { src: e }), C || d(!0));
        }
      }
      return (
        R(),
        () => {
          C = !0;
        }
      );
    }, [e, m, t, g, S, k, x, h]),
    v.useEffect(
      () => () => {
        p.current && URL.revokeObjectURL(p.current);
      },
      [],
    ),
    c
      ? l.jsx("div", {
          ref: f,
          className: r,
          style: {
            ...i,
            minHeight: (i == null ? void 0 : i.minHeight) ?? "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "var(--bg-raised)",
            color: "var(--text-3)",
            fontSize: "0.7rem",
          },
          children: "—",
        })
      : a
        ? l.jsx("img", {
            ref: f,
            src: a,
            alt: n,
            className: r,
            style: i,
            draggable: !1,
            loading: "lazy",
            decoding: "async",
            onLoad: (C) => {
              const R = C.currentTarget;
              o == null || o(R.naturalWidth, R.naturalHeight);
            },
          })
        : l.jsx("div", {
            ref: f,
            className: r,
            style: {
              ...i,
              minHeight:
                (i == null ? void 0 : i.minHeight) ??
                (i == null ? void 0 : i.height) ??
                "100%",
              minWidth:
                (i == null ? void 0 : i.minWidth) ??
                (i == null ? void 0 : i.width),
              background: "var(--bg-raised)",
              animation: m ? "authimg-shimmer 1.6s linear infinite" : void 0,
              backgroundImage: m
                ? "linear-gradient(90deg, var(--bg-raised) 0%, var(--bg-hover) 50%, var(--bg-raised) 100%)"
                : void 0,
              backgroundSize: "200% 100%",
            },
          })
  );
}
function Dv(e) {
  if (!e) return "?";
  const t = e.split(".");
  return t.length > 1 ? t[t.length - 1].toUpperCase() : "?";
}
function $v(e) {
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
function Av(e) {
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
function Fv({ doc: e }) {
  var a;
  const t = pe(),
    n = pt(),
    [r, i] = v.useState(!1),
    o = Dv(e.fileS3Key ?? ""),
    s = $v(e.fileS3Key ?? "");
  return e.fileS3Key
    ? l.jsxs("div", {
        className: "doc-card card cursor-pointer",
        onClick: () =>
          n(`/document?filepath=${encodeURIComponent(e.fileS3Key)}`),
        style: { minWidth: 0, overflow: "hidden" },
        children: [
          l.jsxs("div", {
            style: {
              height: 130,
              overflow: "hidden",
              borderRadius: "9px 9px 0 0",
              background: "var(--bg-raised)",
              position: "relative",
            },
            children: [
              e.banner_img
                ? l.jsx(Qo, {
                    src: e.banner_img,
                    encryptedFileKey: e.encrypted_file_key,
                    alt: s,
                    style: {
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    },
                  })
                : l.jsx("div", {
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
                    children: o,
                  }),
              l.jsx("span", {
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
                children: o,
              }),
              l.jsx("button", {
                title: t.ft_openStats,
                "aria-label": t.ft_openStats,
                onClick: (u) => {
                  (u.stopPropagation(),
                    n(
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
              l.jsx("button", {
                title: t.ft_showPath,
                "aria-label": t.ft_showPath,
                onClick: (u) => {
                  (u.stopPropagation(), i((c) => !c));
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
                  opacity: r ? 1 : 0.65,
                  transition: "opacity 0.15s",
                  zIndex: 4,
                },
                className: "card-info-btn",
                children: "ⓘ",
              }),
              r &&
                l.jsxs("div", {
                  onClick: (u) => u.stopPropagation(),
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
                    l.jsx("span", {
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
                    l.jsx("button", {
                      onClick: (u) => {
                        (u.stopPropagation(), i(!1));
                      },
                      className: "btn btn-ghost",
                      style: { fontSize: "0.65rem", padding: "2px 8px" },
                      children: "Close",
                    }),
                  ],
                }),
            ],
          }),
          l.jsxs("div", {
            style: {
              padding: "9px 11px 11px",
              minWidth: 0,
              overflow: "hidden",
            },
            children: [
              l.jsx("p", {
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
              l.jsxs("div", {
                style: {
                  display: "flex",
                  gap: 8,
                  alignItems: "center",
                  marginTop: 5,
                },
                children: [
                  l.jsx("span", {
                    style: { fontSize: "0.68rem", color: "var(--text-3)" },
                    children: Av(e.created_at),
                  }),
                  l.jsxs("span", {
                    style: {
                      fontSize: "0.68rem",
                      color: "var(--text-3)",
                      marginLeft: "auto",
                    },
                    children: [e.page_count, "p"],
                  }),
                ],
              }),
              ((a = e.assigned_tags) == null ? void 0 : a.length) > 0 &&
                l.jsxs("div", {
                  style: {
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 3,
                    marginTop: 7,
                    minWidth: 0,
                    maxWidth: "100%",
                    overflow: "hidden",
                  },
                  children: [
                    e.assigned_tags
                      .slice(0, 3)
                      .map((u) =>
                        l.jsx(
                          "span",
                          {
                            className: "tag",
                            style: {
                              pointerEvents: "none",
                              maxWidth: "100%",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              minWidth: 0,
                            },
                            title: u,
                            children: u,
                          },
                          u,
                        ),
                      ),
                    e.assigned_tags.length > 3 &&
                      l.jsxs("span", {
                        style: { fontSize: "0.65rem", color: "var(--text-3)" },
                        children: ["+", e.assigned_tags.length - 3],
                      }),
                  ],
                }),
            ],
          }),
          l.jsx("style", {
            children:
              ".doc-card:hover .card-info-btn { opacity: 1 !important; }",
          }),
        ],
      })
    : null;
}
function Bv(e, t) {
  var i;
  const n = { name: "", fullPath: "", children: new Map(), docCount: 0 };
  for (const o of e) {
    if (!(o != null && o.fileS3Key)) continue;
    const s =
      (i = o.assigned_tags) != null && i.length
        ? o.assigned_tags
        : ["Untagged"];
    let a = n;
    for (let c = 0; c < s.length; c++) {
      const d = s[c];
      (a.children.has(d) ||
        a.children.set(d, {
          name: d,
          fullPath: s.slice(0, c + 1).join("/"),
          children: new Map(),
          docCount: 0,
        }),
        (a = a.children.get(d)));
    }
    const u = `__doc__${o.fileS3Key}`;
    a.children.set(u, {
      name: Ts(o.fileS3Key.split("/").pop() ?? o.fileS3Key),
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
function Ts(e) {
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
function vp(e, t, n) {
  switch (n) {
    case "alpha":
    case "name_asc":
      return Ts(e.fileS3Key).localeCompare(Ts(t.fileS3Key), void 0, {
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
const Oi = {
  background: "none",
  border: "1px solid var(--border-soft)",
  borderRadius: 4,
  cursor: "pointer",
  color: "var(--text-3)",
  fontSize: "0.66rem",
  padding: "2px 7px",
  whiteSpace: "nowrap",
  fontFamily: "JetBrains Mono, monospace",
};
function Wv() {
  try {
    return new Set(JSON.parse(localStorage.getItem("rain-dms-todo") ?? "[]"));
  } catch {
    return new Set();
  }
}
function Uv(e) {
  localStorage.setItem("rain-dms-todo", JSON.stringify([...e]));
}
function xp(e, t) {
  var r;
  if (!t) return !0;
  const n = t.toLowerCase();
  if (
    e.name.toLowerCase().includes(n) ||
    ((r = e.doc) != null && r.fileS3Key.toLowerCase().includes(n))
  )
    return !0;
  for (const i of e.children.values()) if (xp(i, t)) return !0;
  return !1;
}
function yp(e, t) {
  var r;
  if (!t) return !0;
  const n = t.toLowerCase();
  if ((r = e.doc) != null && r.fileS3Key.toLowerCase().includes(n)) return !0;
  for (const i of e.children.values()) if (yp(i, n)) return !0;
  return !1;
}
function Sp({
  node: e,
  depth: t,
  todo: n,
  onToggleTodo: r,
  filter: i,
  sortKey: o,
  pathFilter: s,
  selectedPath: a,
  onSelect: u,
  openSet: c,
  onToggleOpen: d,
  pickMode: p,
  picked: g,
  onTogglePick: k,
}) {
  var y;
  const x = pt(),
    _ = pe(),
    S = !!e.doc,
    h = S ? !1 : c.has(e.fullPath),
    [f, m] = v.useState(!1),
    [w, C] = v.useState(!1),
    [R, z] = v.useState(!1),
    P = n.has(e.fullPath),
    L = !!e.isSimulated && !S,
    b = a === ((y = e.doc) == null ? void 0 : y.fileS3Key),
    A = S && !!e.doc && g.has(e.doc.fileS3Key);
  if ((i && !xp(e, i)) || (s && !yp(e, s))) return null;
  const F = 20,
    V = 8 + t * F,
    U = 8 + t * F + 7,
    M = [...e.children.values()].sort((E, j) => {
      const N = !!E.doc,
        T = !!j.doc;
      return o === "alpha" || o === "name_asc"
        ? E.name.localeCompare(j.name, void 0, { numeric: !0 })
        : N !== T
          ? N
            ? 1
            : -1
          : N && T && E.doc && j.doc
            ? vp(E.doc, j.doc, o)
            : E.name.localeCompare(j.name, void 0, { numeric: !0 });
    });
  function Q(E) {
    var j;
    (j = navigator.clipboard) == null ||
      j.writeText(E).then(
        () => {
          (z(!0), setTimeout(() => z(!1), 1400));
        },
        () => {},
      );
  }
  const G =
    A || b ? "var(--accent-glow)" : f ? "var(--bg-hover)" : "transparent";
  return l.jsxs("div", {
    style: { position: "relative" },
    children: [
      l.jsxs("div", {
        className: "tree-row",
        onMouseEnter: () => m(!0),
        onMouseLeave: () => m(!1),
        onClick: () => {
          S && e.doc
            ? p
              ? k(e.doc.fileS3Key)
              : (u(e.doc),
                x(`/document?filepath=${encodeURIComponent(e.doc.fileS3Key)}`))
            : (d(e.fullPath), u(null));
        },
        onContextMenu: (E) => {
          !S || !e.doc || (E.preventDefault(), u(e.doc));
        },
        style: {
          display: "flex",
          alignItems: "center",
          gap: 4,
          paddingLeft: V,
          paddingRight: 6,
          paddingTop: 3,
          paddingBottom: 3,
          borderRadius: 5,
          cursor: S ? "pointer" : "default",
          background: G,
          userSelect: "none",
          position: "relative",
        },
        children: [
          !S && e.children.size > 0
            ? l.jsx(Kv, { open: h })
            : l.jsx("span", { style: { width: 9, flexShrink: 0 } }),
          p &&
            S &&
            l.jsx("span", {
              style: {
                width: 13,
                height: 13,
                borderRadius: 3,
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: A ? "var(--accent)" : "transparent",
                border: `1.5px solid ${A ? "var(--accent)" : "var(--border)"}`,
                color: "var(--accent-fg)",
                fontSize: "0.55rem",
                fontWeight: 700,
              },
              children: A ? "✓" : "",
            }),
          S ? l.jsx(Hv, {}) : l.jsx(Vv, { open: h, simulated: L }),
          l.jsx("span", {
            style: {
              flex: 1,
              fontSize: S ? "0.76rem" : "0.8rem",
              fontFamily: S ? "JetBrains Mono, monospace" : void 0,
              fontWeight: S ? 400 : t === 0 ? 600 : 500,
              color: S
                ? b
                  ? "var(--accent)"
                  : "var(--text-1)"
                : L
                  ? "var(--text-3)"
                  : t === 0
                    ? "var(--text-1)"
                    : "var(--text-2)",
              fontStyle: L ? "italic" : "normal",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              letterSpacing: S ? "0" : "-0.01em",
            },
            children: e.name,
          }),
          !S &&
            e.docCount > 0 &&
            l.jsx("span", {
              style: {
                fontSize: "0.6rem",
                color: P ? "var(--warn)" : "var(--text-3)",
                background: P ? "rgba(251,191,36,0.1)" : "var(--bg-raised)",
                border: `1px solid ${P ? "rgba(251,191,36,0.25)" : "var(--border-soft)"}`,
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
            l.jsxs("span", {
              style: {
                fontSize: "0.6rem",
                color: "var(--text-3)",
                flexShrink: 0,
              },
              children: [e.doc.page_count, _.ft_pages],
            }),
          f &&
            l.jsxs("div", {
              style: { display: "flex", gap: 1, flexShrink: 0, marginLeft: 2 },
              onClick: (E) => E.stopPropagation(),
              children: [
                !S &&
                  l.jsx(Di, {
                    title: P ? _.ft_markDone : _.ft_markTodo,
                    onClick: () => r(e.fullPath),
                    active: P,
                    activeColor: "var(--warn)",
                    children: P ? "★" : "☆",
                  }),
                S &&
                  l.jsxs(l.Fragment, {
                    children: [
                      l.jsx(Di, {
                        title: _.ft_showPath,
                        onClick: () => C((E) => !E),
                        active: w,
                        children: "ⓘ",
                      }),
                      l.jsx(Di, {
                        title: _.ft_openStats,
                        onClick: () =>
                          e.doc &&
                          x(
                            `/file-stats?filepath=${encodeURIComponent(e.doc.fileS3Key)}`,
                          ),
                        children: "⎙",
                      }),
                      w &&
                        l.jsx(Di, {
                          title: R ? _.ft_copied : _.ft_copy,
                          onClick: () => Q(e.doc.fileS3Key),
                          active: R,
                          activeColor: "var(--accent)",
                          children: R ? "✓" : "⎘",
                        }),
                    ],
                  }),
              ],
            }),
          w &&
            S &&
            l.jsx("div", {
              onClick: (E) => E.stopPropagation(),
              style: {
                position: "absolute",
                bottom: "calc(100% + 4px)",
                left: V,
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
        P &&
        h &&
        l.jsx("div", {
          style: { paddingLeft: V + F, paddingBottom: 2 },
          children: l.jsxs("span", {
            style: {
              fontSize: "0.58rem",
              color: "var(--warn)",
              fontWeight: 600,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
            },
            children: ["★ ", _.ft_toReview],
          }),
        }),
      !S &&
        h &&
        M.length > 0 &&
        l.jsxs(l.Fragment, {
          children: [
            l.jsx("div", {
              style: {
                position: "absolute",
                left: U,
                top: 26,
                bottom: 4,
                width: 1,
                background: "var(--border-soft)",
                pointerEvents: "none",
                zIndex: 0,
              },
            }),
            M.map((E) =>
              l.jsx(
                Sp,
                {
                  node: E,
                  depth: t + 1,
                  todo: n,
                  onToggleTodo: r,
                  filter: i,
                  sortKey: o,
                  pathFilter: s,
                  selectedPath: a,
                  onSelect: u,
                  openSet: c,
                  onToggleOpen: d,
                  pickMode: p,
                  picked: g,
                  onTogglePick: k,
                },
                E.fullPath + E.name,
              ),
            ),
          ],
        }),
    ],
  });
}
function Di({ children: e, title: t, onClick: n, active: r, activeColor: i }) {
  return l.jsx("button", {
    title: t,
    onClick: n,
    style: {
      background: r ? "var(--accent-glow)" : "none",
      border: "none",
      cursor: "pointer",
      color: r ? (i ?? "var(--accent)") : "var(--text-3)",
      fontSize: "0.65rem",
      padding: "2px 4px",
      borderRadius: 3,
      lineHeight: 1,
      transition: "color 0.1s, background 0.1s",
    },
    children: e,
  });
}
function Hv() {
  return l.jsxs("svg", {
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
      l.jsx("path", {
        d: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z",
      }),
      l.jsx("polyline", { points: "14 2 14 8 20 8" }),
    ],
  });
}
function Vv({ open: e, simulated: t }) {
  const n = t ? "var(--text-3)" : "var(--text-2)";
  return l.jsx("svg", {
    width: "12",
    height: "12",
    viewBox: "0 0 24 24",
    fill: e ? "var(--accent-glow)" : "none",
    stroke: e ? "var(--accent)" : n,
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    style: { flexShrink: 0 },
    children: l.jsx("path", {
      d: "M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z",
    }),
  });
}
function Kv({ open: e }) {
  return l.jsx("svg", {
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
    children: l.jsx("polyline", { points: "9 18 15 12 9 6" }),
  });
}
function Jv({
  documents: e,
  simulatedTagPaths: t = [],
  filter: n = "",
  sortKey: r,
  selectedPath: i = null,
  onSelect: o,
  onChanged: s,
}) {
  const a = pe(),
    [u, c] = v.useState(() => Wv()),
    [d, p] = v.useState(""),
    g = v.useRef(null),
    [k, x] = v.useState(!1),
    [_, S] = v.useState(new Set()),
    [h, f] = v.useState(!1),
    [m, w] = v.useState(!1);
  function C(T) {
    S((B) => {
      const W = new Set(B);
      return (W.has(T) ? W.delete(T) : W.add(T), W);
    });
  }
  function R() {
    S(new Set(e.map((T) => T.fileS3Key)));
  }
  function z() {
    (S(new Set()), f(!1));
  }
  function P() {
    (x((T) => !T), z());
  }
  async function L() {
    if (!h) {
      f(!0);
      return;
    }
    w(!0);
    const T = [..._];
    let B = 0;
    for (const W of T)
      try {
        (await Na(W), B++);
      } catch {}
    (w(!1),
      z(),
      x(!1),
      B > 0 && or(a.toast_success, `${B}/${T.length}`),
      s == null || s());
  }
  const [b, A] = v.useState(() => new Set()),
    F = v.useMemo(() => Bv(e, t), [e, t]),
    V = v.useRef(!1);
  v.useEffect(() => {
    if (V.current || F.children.size === 0) return;
    V.current = !0;
    const T = new Set();
    for (const B of F.children.values())
      if (!B.doc && (T.add(B.fullPath), B.children.size <= 8))
        for (const W of B.children.values()) W.doc || T.add(W.fullPath);
    A(T);
  }, [F]);
  const U = v.useCallback((T) => {
    A((B) => {
      const W = new Set(B);
      return (W.has(T) ? W.delete(T) : W.add(T), W);
    });
  }, []);
  function M() {
    A(new Set());
  }
  function Q() {
    const T = new Set();
    function B(W) {
      !W.doc && W.fullPath && T.add(W.fullPath);
      for (const he of W.children.values()) B(he);
    }
    (B(F), A(T));
  }
  const G = v.useCallback((T) => {
      c((B) => {
        const W = new Set(B);
        return (W.has(T) ? W.delete(T) : W.add(T), Uv(W), W);
      });
    }, []),
    y = v.useMemo(
      () => (i ? (e.find((T) => T.fileS3Key === i) ?? null) : null),
      [e, i],
    );
  function E(T) {
    o == null || o(T);
  }
  if (F.children.size === 0)
    return l.jsxs("div", {
      style: {
        padding: "40px 20px",
        textAlign: "center",
        color: "var(--text-3)",
      },
      children: [
        l.jsx("svg", {
          width: "32",
          height: "32",
          viewBox: "0 0 24 24",
          fill: "none",
          stroke: "currentColor",
          strokeWidth: "1.5",
          strokeLinecap: "round",
          strokeLinejoin: "round",
          style: { marginBottom: 10, opacity: 0.4 },
          children: l.jsx("path", {
            d: "M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z",
          }),
        }),
        l.jsx("p", {
          style: { margin: 0, fontSize: "0.82rem" },
          children: a.ft_noDocuments,
        }),
      ],
    });
  const j = u.size,
    N = [...F.children.values()].sort((T, B) => {
      const W = !!T.doc,
        he = !!B.doc;
      if (r === "alpha" || r === "name_asc")
        return T.name.localeCompare(B.name, void 0, { numeric: !0 });
      if (W !== he) return W ? 1 : -1;
      const ye = u.has(T.fullPath),
        Oe = u.has(B.fullPath);
      return ye !== Oe
        ? ye
          ? -1
          : 1
        : W && he && T.doc && B.doc
          ? vp(T.doc, B.doc, r)
          : T.name.localeCompare(B.name);
    });
  return l.jsxs("div", {
    className: "card",
    style: {
      padding: 0,
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
    },
    children: [
      l.jsxs("div", {
        style: {
          padding: "6px 8px",
          borderBottom: "1px solid var(--border-soft)",
          display: "flex",
          flexDirection: "column",
          gap: 5,
          flexShrink: 0,
        },
        children: [
          l.jsxs("div", {
            style: { display: "flex", gap: 5, alignItems: "center" },
            children: [
              l.jsxs("div", {
                style: { position: "relative", flex: 1 },
                children: [
                  l.jsxs("svg", {
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
                      l.jsx("circle", { cx: "11", cy: "11", r: "8" }),
                      l.jsx("line", {
                        x1: "21",
                        y1: "21",
                        x2: "16.65",
                        y2: "16.65",
                      }),
                    ],
                  }),
                  l.jsx("input", {
                    ref: g,
                    value: d,
                    onChange: (T) => p(T.target.value),
                    placeholder: a.ft_filterByPath,
                    className: "input",
                    style: {
                      paddingLeft: 24,
                      fontSize: "0.74rem",
                      fontFamily: "JetBrains Mono, monospace",
                    },
                  }),
                  d &&
                    l.jsx("button", {
                      onClick: () => p(""),
                      title: a.ft_clearFilter,
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
              l.jsx("button", {
                onClick: M,
                title: a.ft_collapseAll,
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
                children: l.jsx(Yv, {}),
              }),
              l.jsx("button", {
                onClick: Q,
                title: a.ft_expandAll,
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
                children: l.jsx(Gv, {}),
              }),
              l.jsxs("button", {
                onClick: P,
                title: a.ft_select,
                style: {
                  background: k ? "var(--accent-glow)" : "none",
                  border: `1px solid ${k ? "var(--accent)" : "var(--border-soft)"}`,
                  borderRadius: 4,
                  cursor: "pointer",
                  color: k ? "var(--accent)" : "var(--text-3)",
                  fontSize: "0.62rem",
                  padding: "3px 7px",
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                  fontWeight: k ? 600 : 400,
                },
                children: ["☑ ", a.ft_select],
              }),
            ],
          }),
          k &&
            l.jsxs("div", {
              style: {
                display: "flex",
                gap: 6,
                alignItems: "center",
                padding: "2px 2px 0",
                flexWrap: "wrap",
              },
              children: [
                l.jsx("span", {
                  style: {
                    fontSize: "0.68rem",
                    color: "var(--text-2)",
                    fontFamily: "JetBrains Mono, monospace",
                  },
                  children: a.ft_selected(_.size),
                }),
                l.jsx("button", { onClick: R, style: Oi, children: e.length }),
                l.jsx("button", {
                  onClick: z,
                  style: Oi,
                  disabled: _.size === 0,
                  children: "✕",
                }),
                _.size > 0 &&
                  l.jsx("button", {
                    onClick: L,
                    disabled: m,
                    style: {
                      ...Oi,
                      color: "var(--danger)",
                      borderColor: "rgba(248,113,113,0.35)",
                      background: h ? "rgba(248,113,113,0.15)" : void 0,
                      marginLeft: "auto",
                    },
                    children: m
                      ? a.main_deleting
                      : h
                        ? a.ft_confirmDelete(_.size)
                        : a.ft_delete(_.size),
                  }),
                h &&
                  l.jsx("button", {
                    onClick: () => f(!1),
                    style: Oi,
                    children: a.main_cancel,
                  }),
              ],
            }),
          y && l.jsx(Qv, { doc: y }),
          (j > 0 || t.length > 0) &&
            l.jsxs("div", {
              style: {
                display: "flex",
                gap: 10,
                fontSize: "0.63rem",
                color: "var(--text-3)",
                paddingLeft: 2,
              },
              children: [
                j > 0 &&
                  l.jsx("span", {
                    style: { color: "var(--warn)" },
                    children: a.ft_foldersToReview(j),
                  }),
                t.length > 0 &&
                  l.jsxs("span", {
                    children: [
                      l.jsx("em", { children: "italic" }),
                      " =",
                      " ",
                      a.ft_italicNote.split(" = ")[1] ?? "simulated",
                    ],
                  }),
              ],
            }),
        ],
      }),
      l.jsx("div", {
        style: { flex: 1, overflowY: "auto", padding: "4px 4px 8px" },
        children: N.map((T) =>
          l.jsx(
            Sp,
            {
              node: T,
              depth: 0,
              todo: u,
              onToggleTodo: G,
              filter: n,
              sortKey: r,
              pathFilter: d,
              selectedPath: i,
              onSelect: E,
              openSet: b,
              onToggleOpen: U,
              pickMode: k,
              picked: _,
              onTogglePick: C,
            },
            T.fullPath + T.name,
          ),
        ),
      }),
    ],
  });
}
function Qv({ doc: e }) {
  const t = pe(),
    [n, r] = v.useState(!1);
  function i() {
    var o;
    (o = navigator.clipboard) == null ||
      o.writeText(e.fileS3Key).then(
        () => {
          (r(!0), setTimeout(() => r(!1), 1400));
        },
        () => {},
      );
  }
  return l.jsxs("div", {
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
      l.jsx("span", {
        style: { color: "var(--text-3)", flexShrink: 0 },
        children: t.ft_pathLabel,
      }),
      l.jsx("span", {
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
      l.jsx("button", {
        onClick: i,
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
function Yv() {
  return l.jsx("svg", {
    width: "11",
    height: "11",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    children: l.jsx("polyline", { points: "15 18 9 12 15 6" }),
  });
}
function Gv() {
  return l.jsx("svg", {
    width: "11",
    height: "11",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    children: l.jsx("polyline", { points: "9 18 15 12 9 6" }),
  });
}
const Xv = 188,
  $i = 13,
  _c = 215,
  Zv = 4;
function Ms(e) {
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
function qv(e, t) {
  const n = [...e];
  switch (t) {
    case "date_asc":
      return n.sort(
        (r, i) =>
          new Date(r.created_at).getTime() - new Date(i.created_at).getTime(),
      );
    case "name_asc":
      return n.sort((r, i) => Ms(r.fileS3Key).localeCompare(Ms(i.fileS3Key)));
    case "pages_desc":
      return n.sort((r, i) => (i.page_count ?? 0) - (r.page_count ?? 0));
    default:
      return n.sort(
        (r, i) =>
          new Date(i.created_at).getTime() - new Date(r.created_at).getTime(),
      );
  }
}
const Cl = 100;
function ex() {
  const e = pe(),
    [t, n] = v.useState([]),
    [r, i] = v.useState(0),
    [o, s] = v.useState(0),
    [a, u] = v.useState(!0),
    [c, d] = v.useState([]),
    [p, g] = v.useState(),
    [k, x] = v.useState("grid"),
    [_, S] = v.useState("date_desc"),
    [h, f] = v.useState(""),
    [m, w] = v.useState(null),
    [C, R] = v.useState(!0),
    [z, P] = v.useState(!1),
    [L, b] = v.useState(null),
    [A, F] = v.useState(new Set()),
    [V, U] = v.useState(!1),
    [M, Q] = v.useState(!1),
    [G, y] = v.useState(!1),
    E = K((O) => O.simulatedTagPaths),
    j = Oa((O) => O.lastCompletedAt),
    N = v.useRef(!1),
    T = v.useCallback(async () => {
      (R(!0), b(null), (N.current = !0));
      try {
        const O = await fc(0, Cl, p);
        (n(O.data), i(O.totalCount), s(1), u(O.data.length < O.totalCount));
      } catch (O) {
        b(O.message);
      } finally {
        (R(!1), (N.current = !1));
      }
    }, [p]),
    B = v.useCallback(async () => {
      if (!(N.current || !a)) {
        ((N.current = !0), P(!0));
        try {
          const O = await fc(o, Cl, p);
          (n((q) => {
            const Ee = new Set(q.map((we) => we.fileS3Key));
            return [...q, ...O.data.filter((we) => !Ee.has(we.fileS3Key))];
          }),
            i(O.totalCount),
            s((q) => q + 1),
            u((o + 1) * Cl < O.totalCount && O.data.length > 0));
        } catch (O) {
          b(O.message);
        } finally {
          (P(!1), (N.current = !1));
        }
      }
    }, [o, a, p]);
  (v.useEffect(() => {
    T();
  }, [T, j]),
    v.useEffect(() => {
      N0()
        .then((O) => d(O.tags.slice(0, 80)))
        .catch(() => {});
    }, []),
    v.useEffect(() => {
      if (k !== "tree" || !a || C) return;
      const O = setTimeout(() => B(), 60);
      return () => clearTimeout(O);
    }, [k, a, C, t.length, B]));
  const W = v.useRef(null);
  v.useEffect(() => {
    if (k === "tree") return;
    const O = W.current;
    if (!O) return;
    const q = new IntersectionObserver(
      (Ee) => {
        var we;
        (we = Ee[0]) != null && we.isIntersecting && B();
      },
      { rootMargin: "600px" },
    );
    return (q.observe(O), () => q.disconnect());
  }, [k, B]);
  const he = v.useRef(null),
    [ye, Oe] = v.useState(0);
  v.useLayoutEffect(() => {
    const O = he.current;
    if (!O) return;
    const q = new ResizeObserver((Ee) => {
      var mi;
      const we = ((mi = Ee[0]) == null ? void 0 : mi.contentRect.width) ?? 0;
      Oe(we);
    });
    return (q.observe(O), Oe(O.clientWidth), () => q.disconnect());
  }, []);
  const it = qv(t, _).filter((O) => {
      if (!h) return !0;
      const q = h.toLowerCase();
      return (
        Ms(O.fileS3Key).toLowerCase().includes(q) ||
        O.fileS3Key.toLowerCase().includes(q)
      );
    }),
    Z = v.useMemo(() => {
      if (ye <= 0) return 1;
      const O = ye - 28;
      return Math.max(1, Math.floor((O + $i) / (Xv + $i)));
    }, [ye]),
    sn = v.useMemo(() => Math.ceil(it.length / Z), [it.length, Z]),
    me = Lv({
      count: sn,
      getScrollElement: () => he.current,
      estimateSize: () => _c,
      overscan: Zv,
    }),
    an = me.getVirtualItems();
  function zn(O) {
    F((q) => {
      const Ee = new Set(q);
      return (Ee.has(O) ? Ee.delete(O) : Ee.add(O), Ee);
    });
  }
  function Yo() {
    F(new Set(it.map((O) => O.fileS3Key)));
  }
  function fr() {
    (F(new Set()), U(!1), y(!1));
  }
  async function pr() {
    if (!G) {
      y(!0);
      return;
    }
    Q(!0);
    const O = [...A];
    let q = 0;
    for (const Ee of O)
      try {
        (await Na(Ee), q++);
      } catch {}
    (Q(!1), fr(), T(), q > 0 && or(e.toast_success, `${q}/${O.length}`));
  }
  return l.jsxs("div", {
    className: "split-panel",
    style: { height: "100%" },
    children: [
      c.length > 0 &&
        l.jsxs("aside", {
          className: "split-secondary",
          style: {
            width: 176,
            flexShrink: 0,
            borderRight: "1px solid var(--border)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            background: "var(--bg-surface)",
            maxHeight: "34vh",
          },
          children: [
            l.jsx("div", {
              style: {
                padding: "10px 8px 6px",
                borderBottom: "1px solid var(--border-soft)",
                flexShrink: 0,
              },
              children: l.jsx("p", {
                className: "label",
                style: { paddingLeft: 4 },
                children: e.main_tags,
              }),
            }),
            l.jsxs("div", {
              style: { overflowY: "auto", flex: 1, padding: "4px 6px 8px" },
              children: [
                l.jsx(wc, {
                  label: e.main_all,
                  count: r,
                  active: !p,
                  onClick: () => g(void 0),
                }),
                c.map((O) =>
                  l.jsx(
                    wc,
                    {
                      label: O.tag,
                      count: O.doc_count,
                      active: p === O.tag,
                      onClick: () => g(O.tag),
                    },
                    O.tag,
                  ),
                ),
              ],
            }),
          ],
        }),
      l.jsxs("div", {
        className: "split-primary",
        style: { display: "flex", flexDirection: "column", overflow: "hidden" },
        children: [
          l.jsxs("div", {
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
              l.jsxs("div", {
                children: [
                  l.jsx("h2", {
                    style: {
                      margin: 0,
                      fontSize: "0.87rem",
                      fontWeight: 600,
                      color: "var(--text-1)",
                    },
                    children: p
                      ? l.jsxs(l.Fragment, {
                          children: [
                            l.jsxs("span", {
                              style: {
                                color: "var(--text-3)",
                                fontWeight: 400,
                              },
                              children: [e.main_tagLabel, " "],
                            }),
                            l.jsx("span", { className: "tag", children: p }),
                          ],
                        })
                      : e.main_allDocuments,
                  }),
                  l.jsx("p", {
                    style: {
                      margin: 0,
                      fontSize: "0.66rem",
                      color: "var(--text-3)",
                    },
                    children: e.main_documents(r),
                  }),
                ],
              }),
              l.jsxs("button", {
                onClick: () => {
                  (U((O) => !O), fr());
                },
                style: {
                  ...jr,
                  background: V ? "var(--accent-glow)" : void 0,
                  color: V ? "var(--accent)" : "var(--text-2)",
                  borderColor: V ? "var(--accent)" : void 0,
                },
                title: e.main_select,
                children: ["☑ ", e.main_select],
              }),
              V &&
                A.size > 0 &&
                l.jsxs("div", {
                  style: { display: "flex", gap: 5, alignItems: "center" },
                  children: [
                    l.jsx("span", {
                      style: {
                        fontSize: "0.73rem",
                        color: "var(--text-2)",
                        fontFamily: "JetBrains Mono, monospace",
                      },
                      children: e.main_selected(A.size),
                    }),
                    l.jsx("button", {
                      onClick: Yo,
                      style: jr,
                      children: e.main_allOnPage(it.length),
                    }),
                    l.jsx("button", {
                      onClick: fr,
                      style: jr,
                      children: e.main_none,
                    }),
                    l.jsx("button", {
                      onClick: pr,
                      disabled: M,
                      style: {
                        ...jr,
                        background: G ? "rgba(248,113,113,0.15)" : void 0,
                        color: "var(--danger)",
                        borderColor: "rgba(248,113,113,0.35)",
                      },
                      children: M
                        ? e.main_deleting
                        : G
                          ? e.ft_confirmDelete(A.size)
                          : `✗ ${e.ft_delete(A.size)}`,
                    }),
                    G &&
                      l.jsx("button", {
                        onClick: () => y(!1),
                        style: jr,
                        children: e.main_cancel,
                      }),
                  ],
                }),
              l.jsxs("div", {
                style: { position: "relative", marginLeft: "auto" },
                children: [
                  l.jsxs("svg", {
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
                      l.jsx("circle", { cx: "11", cy: "11", r: "8" }),
                      l.jsx("line", {
                        x1: "21",
                        y1: "21",
                        x2: "16.65",
                        y2: "16.65",
                      }),
                    ],
                  }),
                  l.jsx("input", {
                    value: h,
                    onChange: (O) => f(O.target.value),
                    placeholder: e.main_filterByFilename,
                    className: "input",
                    style: { paddingLeft: 26, width: 175, fontSize: "0.77rem" },
                  }),
                  h &&
                    l.jsx("button", {
                      onClick: () => f(""),
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
              l.jsxs("select", {
                value: _,
                onChange: (O) => S(O.target.value),
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
                  l.jsx("option", {
                    value: "date_desc",
                    children: e.main_newestFirst,
                  }),
                  l.jsx("option", {
                    value: "date_asc",
                    children: e.main_oldestFirst,
                  }),
                  l.jsx("option", {
                    value: "name_asc",
                    children: e.main_nameAZ,
                  }),
                  l.jsx("option", {
                    value: "pages_desc",
                    children: e.main_mostPages,
                  }),
                ],
              }),
              l.jsxs("div", {
                style: {
                  display: "flex",
                  background: "var(--bg-raised)",
                  border: "1px solid var(--border)",
                  borderRadius: 5,
                  overflow: "hidden",
                },
                children: [
                  l.jsx(kc, {
                    active: k === "grid",
                    onClick: () => x("grid"),
                    title: e.main_grid,
                    children: l.jsx(tx, {}),
                  }),
                  l.jsx(kc, {
                    active: k === "tree",
                    onClick: () => x("tree"),
                    title: e.main_tree,
                    children: l.jsx(nx, {}),
                  }),
                ],
              }),
              l.jsx("button", {
                className: "btn btn-ghost",
                onClick: T,
                style: { padding: "4px 8px" },
                title: e.main_refresh,
                disabled: C,
                children: l.jsx(rx, { spin: C }),
              }),
            ],
          }),
          l.jsxs("div", {
            ref: k === "tree" ? null : he,
            style: {
              flex: 1,
              overflowY: "auto",
              padding: k === "tree" ? 0 : "14px",
            },
            children: [
              L &&
                l.jsx("div", {
                  style: {
                    margin: "0 14px 12px",
                    padding: "9px 13px",
                    background: "rgba(248,113,113,0.07)",
                    border: "1px solid rgba(248,113,113,0.2)",
                    borderRadius: 7,
                    color: "var(--danger)",
                    fontSize: "0.8rem",
                  },
                  children: L,
                }),
              !C &&
                it.length === 0 &&
                !L &&
                l.jsx("div", {
                  style: {
                    textAlign: "center",
                    padding: "60px 24px",
                    color: "var(--text-3)",
                  },
                  children: l.jsx("p", {
                    style: { fontSize: "0.85rem" },
                    children: h ? e.main_noMatch(h) : e.main_noDocuments,
                  }),
                }),
              k === "grid"
                ? C
                  ? l.jsx("div", {
                      style: {
                        display: "grid",
                        gridTemplateColumns: `repeat(${Math.max(1, Z)}, 1fr)`,
                        gap: $i,
                      },
                      children: Array.from({ length: Math.max(1, Z) * 2 }).map(
                        (O, q) =>
                          l.jsx(
                            "div",
                            {
                              className: "card",
                              style: {
                                height: _c - 30,
                                animation: "pulse 1.5s ease-in-out infinite",
                              },
                            },
                            q,
                          ),
                      ),
                    })
                  : l.jsx("div", {
                      style: {
                        height: me.getTotalSize(),
                        position: "relative",
                        width: "100%",
                      },
                      children: an.map((O) => {
                        const q = O.index * Z,
                          Ee = it.slice(q, q + Z);
                        return l.jsx(
                          "div",
                          {
                            "data-index": O.index,
                            style: {
                              position: "absolute",
                              top: O.start,
                              left: 0,
                              right: 0,
                              height: O.size,
                              display: "grid",
                              gridTemplateColumns: `repeat(${Z}, 1fr)`,
                              gap: $i,
                            },
                            children: Ee.map((we) =>
                              l.jsxs(
                                "div",
                                {
                                  style: { position: "relative", minWidth: 0 },
                                  onClick: V ? () => zn(we.fileS3Key) : void 0,
                                  children: [
                                    V &&
                                      l.jsx("div", {
                                        style: {
                                          position: "absolute",
                                          top: 8,
                                          left: 8,
                                          zIndex: 10,
                                          width: 18,
                                          height: 18,
                                          borderRadius: 4,
                                          background: A.has(we.fileS3Key)
                                            ? "var(--accent)"
                                            : "rgba(0,0,0,0.5)",
                                          border: `2px solid ${A.has(we.fileS3Key) ? "var(--accent)" : "rgba(255,255,255,0.5)"}`,
                                          display: "flex",
                                          alignItems: "center",
                                          justifyContent: "center",
                                          color: "#fff",
                                          fontSize: "0.65rem",
                                          fontWeight: 700,
                                          cursor: "pointer",
                                          transition: "background 0.1s",
                                        },
                                        children: A.has(we.fileS3Key)
                                          ? "✓"
                                          : "",
                                      }),
                                    l.jsx(Fv, { doc: we }),
                                  ],
                                },
                                we.fileS3Key,
                              ),
                            ),
                          },
                          O.key,
                        );
                      }),
                    })
                : l.jsx(Jv, {
                    documents: it,
                    simulatedTagPaths: E,
                    filter: h,
                    sortKey: _,
                    selectedPath: m,
                    onSelect: (O) =>
                      w((O == null ? void 0 : O.fileS3Key) ?? null),
                    onChanged: T,
                  }),
              k !== "tree" &&
                a &&
                !C &&
                l.jsx("div", { ref: W, style: { height: 1, marginTop: 4 } }),
            ],
          }),
          (t.length > 0 || z) &&
            l.jsx("div", {
              style: {
                padding: "5px 16px",
                borderTop: "1px solid var(--border)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                flexShrink: 0,
                background: "var(--bg-surface)",
                fontSize: "0.68rem",
                color: "var(--text-3)",
                fontFamily: "JetBrains Mono, monospace",
              },
              children: z
                ? l.jsxs(l.Fragment, {
                    children: [
                      l.jsx("span", {
                        style: {
                          width: 6,
                          height: 6,
                          borderRadius: "50%",
                          background: "var(--accent)",
                          animation: "pulse 0.9s ease-in-out infinite",
                        },
                      }),
                      e.main_loadingMore,
                    ],
                  })
                : a
                  ? e.main_loadedOf(t.length, r)
                  : e.main_loadedAll(t.length),
            }),
        ],
      }),
    ],
  });
}
const jr = {
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
function wc({ label: e, count: t, active: n, onClick: r }) {
  return l.jsxs("button", {
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
      l.jsx("span", {
        style: {
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          maxWidth: 112,
        },
        children: e,
      }),
      l.jsx("span", {
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
function kc({ active: e, onClick: t, title: n, children: r }) {
  return l.jsx("button", {
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
function tx() {
  return l.jsxs("svg", {
    width: "13",
    height: "13",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    children: [
      l.jsx("rect", { x: "3", y: "3", width: "7", height: "7" }),
      l.jsx("rect", { x: "14", y: "3", width: "7", height: "7" }),
      l.jsx("rect", { x: "14", y: "14", width: "7", height: "7" }),
      l.jsx("rect", { x: "3", y: "14", width: "7", height: "7" }),
    ],
  });
}
function nx() {
  return l.jsxs("svg", {
    width: "13",
    height: "13",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    children: [
      l.jsx("line", { x1: "6", y1: "3", x2: "6", y2: "15" }),
      l.jsx("circle", { cx: "18", cy: "6", r: "3" }),
      l.jsx("circle", { cx: "6", cy: "18", r: "3" }),
      l.jsx("path", { d: "M18 9a9 9 0 0 1-9 9" }),
    ],
  });
}
function rx({ spin: e }) {
  return l.jsxs("svg", {
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
      l.jsx("polyline", { points: "23 4 23 10 17 10" }),
      l.jsx("path", { d: "M20.49 15a9 9 0 1 1-2.12-9.36L23 10" }),
    ],
  });
}
function _p(e) {
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
function wp(e) {
  const t = e.split(/(__HL__|__\/HL__)/g),
    n = [];
  let r = !1;
  for (const i of t) {
    if (i === "__HL__") {
      r = !0;
      continue;
    }
    if (i === "__/HL__") {
      r = !1;
      continue;
    }
    r
      ? n.push(l.jsx("mark", { className: "hl", children: i }, n.length))
      : n.push(i);
  }
  return n;
}
function ix({ filepath: e, hits: t, totalHits: n, baseIndex: r, onJump: i }) {
  const o = pe(),
    s = _p(e),
    a = t[0];
  return l.jsxs("div", {
    className: "card",
    style: { padding: 0, overflow: "hidden" },
    children: [
      l.jsxs("div", {
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
            l.jsx("div", {
              style: {
                width: 32,
                height: 32,
                borderRadius: 4,
                overflow: "hidden",
                flexShrink: 0,
                background: "var(--bg-base)",
              },
              children: l.jsx(Qo, {
                src: a.banner_img,
                alt: "",
                style: { width: "100%", height: "100%", objectFit: "cover" },
              }),
            }),
          l.jsxs("div", {
            style: { flex: 1, minWidth: 0 },
            children: [
              l.jsx("p", {
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
              l.jsxs("p", {
                style: {
                  margin: 0,
                  fontSize: "0.63rem",
                  color: "var(--text-3)",
                },
                children: [
                  t.length,
                  " hit",
                  t.length !== 1 ? "s" : "",
                  " ·",
                  " ",
                  e.split("/").slice(0, -1).join("/"),
                ],
              }),
            ],
          }),
          a.assigned_tags &&
            a.assigned_tags.length > 0 &&
            l.jsx("div", {
              style: { display: "flex", gap: 3, flexShrink: 0 },
              children: a.assigned_tags
                .slice(0, 2)
                .map((u) =>
                  l.jsx(
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
      l.jsx("div", {
        style: { display: "flex", flexDirection: "column" },
        children: t.map((u, c) => {
          const d = r + c,
            p = (u.formatted_text ?? u.searchable_text ?? "").slice(0, 280);
          return l.jsxs(
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
              onClick: () => i(u, d),
              children: [
                l.jsxs("span", {
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
                p &&
                  l.jsx("p", {
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
                    children: wp(p),
                  }),
                l.jsx("button", {
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
                    (g.stopPropagation(), i(u, d));
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
function ox({ hit: e, index: t, totalHits: n, onJump: r }) {
  const i = pe(),
    [o, s] = v.useState(!1),
    a = (e.formatted_text ?? e.searchable_text ?? "").slice(0, 320),
    u = _p(e.filepath ?? "");
  return l.jsxs("div", {
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
      e.pageIdx === 0 &&
        e.banner_img &&
        l.jsx("div", {
          style: {
            width: 56,
            height: 80,
            flexShrink: 0,
            background: "var(--bg-raised)",
          },
          children: l.jsx(Qo, {
            src: e.banner_img,
            alt: "",
            style: {
              width: 56,
              height: 80,
              objectFit: "cover",
              display: "block",
            },
          }),
        }),
      l.jsxs("div", {
        style: {
          padding: "8px 11px",
          flex: 1,
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
          gap: 3,
        },
        children: [
          l.jsxs("div", {
            style: { display: "flex", alignItems: "center", gap: 5 },
            children: [
              l.jsxs("span", {
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
              l.jsx("p", {
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
              l.jsx("button", {
                title: "Full path",
                onClick: (c) => {
                  (c.stopPropagation(), s((d) => !d));
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
          l.jsxs("p", {
            style: {
              margin: 0,
              fontSize: "0.61rem",
              color: "var(--text-3)",
              display: "flex",
              alignItems: "center",
              gap: 5,
            },
            children: [
              l.jsxs("span", { children: [i.sr_page, e.pageIdx + 1] }),
              e.assigned_tags &&
                e.assigned_tags.length > 0 &&
                l.jsx("span", {
                  style: { display: "flex", gap: 3 },
                  children: e.assigned_tags
                    .slice(0, 3)
                    .map((c) =>
                      l.jsx(
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
            l.jsx("p", {
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
            l.jsx("p", {
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
              children: wp(a),
            }),
        ],
      }),
      l.jsx("div", {
        style: {
          display: "flex",
          alignItems: "center",
          padding: "0 10px",
          flexShrink: 0,
        },
        children: l.jsx("button", {
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
          children: i.sr_open,
        }),
      }),
    ],
  });
}
function lx() {
  const e = pe(),
    [t, n] = Jo(),
    r = pt(),
    i = v.useRef(null),
    [o, s] = v.useState(t.get("q") ?? ""),
    [a, u] = v.useState(null),
    [c, d] = v.useState(!1),
    [p, g] = v.useState(null),
    [k, x] = v.useState(""),
    [_, S] = v.useState(""),
    [h, f] = v.useState(null),
    [m, w] = v.useState(!0),
    C = K((y) => y.apiUrl),
    R = "rain-dms-recent-searches",
    [z, P] = v.useState(() => {
      try {
        const y = localStorage.getItem(R);
        return y ? JSON.parse(y) : [];
      } catch {
        return [];
      }
    });
  function L(y) {
    const E = y.trim();
    E &&
      P((j) => {
        const N = [E, ...j.filter((T) => T !== E)].slice(0, 8);
        try {
          localStorage.setItem(R, JSON.stringify(N));
        } catch {}
        return N;
      });
  }
  function b() {
    P([]);
    try {
      localStorage.removeItem(R);
    } catch {}
  }
  function A(y) {
    return y
      ? /^https?:\/\//i.test(y)
        ? y
        : `${C}/download?fileKey=${encodeURIComponent(y)}`
      : null;
  }
  v.useEffect(() => {
    function y(E) {
      var j, N;
      (E.key === "/" &&
        document.activeElement !== i.current &&
        (E.preventDefault(), (j = i.current) == null || j.focus()),
        E.key === "Escape" &&
          document.activeElement === i.current &&
          ((N = i.current) == null || N.blur()));
    }
    return (
      window.addEventListener("keydown", y),
      () => window.removeEventListener("keydown", y)
    );
  }, []);
  async function F(y, E) {
    const j = E ? `${y} tag:${E}`.trim() : y.trim();
    if (!(!j && !k && !_)) {
      (d(!0), g(null));
      try {
        const N = {};
        (k && (N.created_after = k), _ && (N.created_before = _));
        const T = await L0(j, N);
        (u(T), n({ q: j }, { replace: !0 }), L(j));
      } catch (N) {
        g(N.message);
      } finally {
        d(!1);
      }
    }
  }
  (v.useEffect(() => {
    if (!o.trim() || o.trim().length < 2) return;
    const y = setTimeout(() => {
      F(o, h);
    }, 450);
    return () => clearTimeout(y);
  }, [o]),
    v.useEffect(() => {
      const y = t.get("q");
      y && (s(y), F(y));
    }, []));
  const V =
      a != null && a.tag_facets
        ? Object.entries(a.tag_facets).sort((y, E) => E[1] - y[1])
        : [],
    U = ((a == null ? void 0 : a.hits) ?? []).map((y) => {
      var E;
      return {
        filepath: y.filepath,
        pageIdx:
          typeof y.pageIdx == "string" ? parseInt(y.pageIdx, 10) : y.pageIdx,
        fileId: y.file_id,
        banner_img: A(y.banner_img) ?? void 0,
        assigned_tags: y.assigned_tags,
        searchable_text: y.searchable_text,
        formatted_text: (E = y._formatted) == null ? void 0 : E.searchable_text,
      };
    }),
    M = v.useMemo(() => {
      const y = new Map();
      for (const E of U) {
        const j = y.get(E.filepath) ?? [];
        (j.push(E), y.set(E.filepath, j));
      }
      return Array.from(y.entries());
    }, [U]);
  function Q(y, E) {
    r(
      `/document?filepath=${encodeURIComponent(y.filepath)}&page=${y.pageIdx}&q=${encodeURIComponent(o)}&hit=${E}`,
    );
  }
  const G = new Set(U.map((y) => y.filepath)).size;
  return l.jsxs("div", {
    className: "split-panel",
    style: { height: "100%", overflow: "hidden" },
    children: [
      l.jsxs("div", {
        className: "split-primary",
        style: { display: "flex", flexDirection: "column", overflow: "hidden" },
        children: [
          l.jsxs("div", {
            style: {
              padding: "12px 16px",
              borderBottom: "1px solid var(--border)",
              flexShrink: 0,
              background: "var(--bg-surface)",
            },
            children: [
              l.jsxs("form", {
                onSubmit: (y) => {
                  (y.preventDefault(), f(null), F(o));
                },
                style: { display: "flex", gap: 7 },
                children: [
                  l.jsxs("div", {
                    style: { flex: 1, position: "relative" },
                    children: [
                      l.jsxs("svg", {
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
                          l.jsx("circle", { cx: "11", cy: "11", r: "8" }),
                          l.jsx("line", {
                            x1: "21",
                            y1: "21",
                            x2: "16.65",
                            y2: "16.65",
                          }),
                        ],
                      }),
                      l.jsx("input", {
                        ref: i,
                        className: "input",
                        style: {
                          paddingLeft: 30,
                          paddingRight: o ? 28 : void 0,
                        },
                        placeholder: e.sr_placeholder,
                        value: o,
                        onChange: (y) => s(y.target.value),
                        autoFocus: !0,
                      }),
                      o &&
                        l.jsx("button", {
                          type: "button",
                          onClick: () => {
                            var y;
                            (s(""),
                              u(null),
                              (y = i.current) == null || y.focus());
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
                  l.jsx("button", {
                    className: "btn btn-primary",
                    type: "submit",
                    disabled: c,
                    style: { flexShrink: 0 },
                    children: c ? "…" : e.sr_search,
                  }),
                ],
              }),
              !o &&
                !a &&
                z.length > 0 &&
                l.jsxs("div", {
                  style: {
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    flexWrap: "wrap",
                    marginTop: 9,
                  },
                  children: [
                    l.jsx("span", {
                      style: {
                        fontSize: "0.66rem",
                        color: "var(--text-3)",
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                      },
                      children: e.sr_recent,
                    }),
                    z.map((y) =>
                      l.jsx(
                        "button",
                        {
                          onClick: () => {
                            (s(y), F(y));
                          },
                          style: {
                            background: "var(--bg-raised)",
                            border: "1px solid var(--border-soft)",
                            borderRadius: 999,
                            cursor: "pointer",
                            color: "var(--text-2)",
                            fontSize: "0.7rem",
                            padding: "2px 10px",
                            fontFamily: "JetBrains Mono, monospace",
                          },
                          children: y,
                        },
                        y,
                      ),
                    ),
                    l.jsx("button", {
                      onClick: b,
                      style: {
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: "var(--text-3)",
                        fontSize: "0.68rem",
                        textDecoration: "underline",
                        padding: "2px 4px",
                      },
                      children: e.sr_clearRecent,
                    }),
                  ],
                }),
              l.jsxs("div", {
                style: {
                  display: "flex",
                  gap: 8,
                  marginTop: 8,
                  flexWrap: "wrap",
                },
                children: [
                  l.jsxs("div", {
                    style: { flex: "1 1 120px" },
                    children: [
                      l.jsx("label", {
                        className: "label",
                        children: e.sr_after,
                      }),
                      l.jsx("input", {
                        className: "input",
                        type: "date",
                        value: k,
                        onChange: (y) => x(y.target.value),
                      }),
                    ],
                  }),
                  l.jsxs("div", {
                    style: { flex: "1 1 120px" },
                    children: [
                      l.jsx("label", {
                        className: "label",
                        children: e.sr_before,
                      }),
                      l.jsx("input", {
                        className: "input",
                        type: "date",
                        value: _,
                        onChange: (y) => S(y.target.value),
                      }),
                    ],
                  }),
                  l.jsx("div", {
                    style: {
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "flex-end",
                    },
                    children: l.jsx("button", {
                      type: "button",
                      onClick: () => w((y) => !y),
                      className: "btn btn-ghost",
                      style: {
                        fontSize: "0.72rem",
                        padding: "4px 9px",
                        borderColor: m ? "var(--accent)" : void 0,
                        color: m ? "var(--accent)" : void 0,
                      },
                      title: m ? e.sr_flat : e.sr_groupByFile,
                      children: m ? e.sr_flat : e.sr_groupByFile,
                    }),
                  }),
                ],
              }),
              a &&
                l.jsxs("div", {
                  style: {
                    marginTop: 7,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  },
                  children: [
                    l.jsxs("p", {
                      style: {
                        margin: 0,
                        fontSize: "0.7rem",
                        color: "var(--text-3)",
                      },
                      children: [
                        e.sr_results(U.length, G),
                        a.excludedTerms.length > 0 &&
                          l.jsxs(l.Fragment, {
                            children: [
                              " ",
                              "·",
                              " ",
                              l.jsxs("span", {
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
                      l.jsxs("span", {
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
                l.jsxs("p", {
                  style: {
                    margin: "6px 0 0",
                    fontSize: "0.63rem",
                    color: "var(--text-3)",
                  },
                  children: [
                    "Press",
                    " ",
                    l.jsx("kbd", {
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
                    " ",
                    "to focus",
                  ],
                }),
            ],
          }),
          l.jsxs("div", {
            style: {
              flex: 1,
              overflowY: "auto",
              padding: "12px 16px",
              display: "flex",
              flexDirection: "column",
              gap: 8,
            },
            children: [
              !o &&
                !a &&
                !c &&
                l.jsxs("div", {
                  style: {
                    textAlign: "center",
                    padding: "40px 20px",
                    color: "var(--text-3)",
                    maxWidth: 440,
                    margin: "0 auto",
                  },
                  children: [
                    l.jsx("div", {
                      style: { color: "var(--accent)", marginBottom: 10 },
                      children: l.jsxs("svg", {
                        width: "34",
                        height: "34",
                        viewBox: "0 0 24 24",
                        fill: "none",
                        stroke: "currentColor",
                        strokeWidth: "1.6",
                        strokeLinecap: "round",
                        strokeLinejoin: "round",
                        style: { margin: "0 auto" },
                        children: [
                          l.jsx("circle", { cx: "11", cy: "11", r: "7" }),
                          l.jsx("line", {
                            x1: "21",
                            y1: "21",
                            x2: "16.65",
                            y2: "16.65",
                          }),
                        ],
                      }),
                    }),
                    l.jsx("p", {
                      style: {
                        margin: "0 0 4px",
                        fontSize: "0.95rem",
                        fontWeight: 600,
                        color: "var(--text-1)",
                      },
                      children: e.sr_welcomeTitle,
                    }),
                    l.jsx("p", {
                      style: {
                        margin: "0 0 16px",
                        fontSize: "0.78rem",
                        lineHeight: 1.5,
                      },
                      children: e.sr_welcomeBody,
                    }),
                    l.jsx("div", {
                      style: {
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 6,
                        justifyContent: "center",
                      },
                      children: [
                        { label: e.sr_exTag, value: "tag:invoices" },
                        { label: e.sr_exExclude, value: "report -draft" },
                        { label: e.sr_exPhrase, value: '"quarterly summary"' },
                      ].map((y) =>
                        l.jsx(
                          "button",
                          {
                            onClick: () => {
                              (s(y.value), F(y.value));
                            },
                            title: y.value,
                            style: {
                              background: "var(--bg-raised)",
                              border: "1px solid var(--border-soft)",
                              borderRadius: 999,
                              cursor: "pointer",
                              color: "var(--text-2)",
                              fontSize: "0.7rem",
                              padding: "4px 12px",
                            },
                            children: y.label,
                          },
                          y.value,
                        ),
                      ),
                    }),
                  ],
                }),
              p &&
                l.jsx("div", {
                  style: {
                    padding: "8px 12px",
                    background: "rgba(248,113,113,0.07)",
                    border: "1px solid rgba(248,113,113,0.2)",
                    borderRadius: 7,
                    color: "var(--danger)",
                    fontSize: "0.8rem",
                  },
                  children: p,
                }),
              c &&
                l.jsx("div", {
                  style: { display: "flex", flexDirection: "column", gap: 6 },
                  children: [80, 100, 70].map((y, E) =>
                    l.jsx(
                      "div",
                      {
                        className: "card",
                        style: {
                          height: y,
                          animation: "pulse 1.5s ease-in-out infinite",
                        },
                      },
                      E,
                    ),
                  ),
                }),
              !c &&
                !p &&
                U.length === 0 &&
                a &&
                l.jsx("div", {
                  style: {
                    textAlign: "center",
                    padding: "48px",
                    color: "var(--text-3)",
                  },
                  children: l.jsx("p", {
                    style: { fontSize: "0.85rem" },
                    children: e.sr_noResults,
                  }),
                }),
              !c && m
                ? M.map(([y, E], j) => {
                    const N = M.slice(0, j).reduce(
                      (T, [, B]) => T + B.length,
                      0,
                    );
                    return l.jsx(
                      ix,
                      {
                        filepath: y,
                        hits: E,
                        totalHits: U.length,
                        baseIndex: N,
                        onJump: (T, B) => Q(T, B),
                      },
                      y,
                    );
                  })
                : !c &&
                  U.map((y, E) =>
                    l.jsx(
                      ox,
                      {
                        hit: y,
                        index: E,
                        totalHits: U.length,
                        onJump: () => Q(y, E),
                      },
                      `${y.fileId}_${y.pageIdx}_${E}`,
                    ),
                  ),
            ],
          }),
        ],
      }),
      V.length > 0 &&
        l.jsxs("aside", {
          className: "split-secondary",
          style: {
            width: 160,
            flexShrink: 0,
            borderLeft: "1px solid var(--border)",
            padding: "12px 6px",
            overflowY: "auto",
            background: "var(--bg-surface)",
            maxHeight: "40vh",
          },
          children: [
            l.jsx("p", {
              className: "label",
              style: { paddingLeft: 4, marginBottom: 6 },
              children: e.sr_filterByTag,
            }),
            V.map(([y, E]) =>
              l.jsxs(
                "button",
                {
                  onClick: () => {
                    const j = h === y ? null : y;
                    (f(j), F(o, j));
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
                    background: h === y ? "var(--accent-glow)" : "transparent",
                    color: h === y ? "var(--accent)" : "var(--text-2)",
                    transition: "background 0.1s",
                    marginBottom: 1,
                  },
                  children: [
                    l.jsx("span", {
                      style: {
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        maxWidth: 100,
                      },
                      children: y,
                    }),
                    l.jsx("span", {
                      style: {
                        fontSize: "0.61rem",
                        color: "var(--text-3)",
                        flexShrink: 0,
                        fontFamily: "JetBrains Mono, monospace",
                      },
                      children: E,
                    }),
                  ],
                },
                y,
              ),
            ),
          ],
        }),
    ],
  });
}
function sx(e) {
  if (!e) return [];
  if (typeof e == "object" && !Array.isArray(e) && "lines" in e)
    return jc(e.lines);
  if (Array.isArray(e)) {
    if (e.length === 0) return [];
    if ("boxes" in e[0]) return jc(e);
    if ("boundingBox" in e[0]) return e.map(kp);
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
function jc(e) {
  return e.flatMap((t) => t.boxes.map(kp));
}
function kp(e) {
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
function ax(e) {
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
function ux(e) {
  return (e || "")
    .replace(/tag:\S+/g, "")
    .split(/\s+/)
    .filter((t) => t && !t.startsWith("-"))
    .map((t) => t.toLowerCase());
}
const cx = 16,
  bc = 2;
function dx() {
  var Ha;
  const e = pe(),
    [t] = Jo(),
    n = t.get("filepath") ?? "",
    r = parseInt(t.get("page") ?? "", 10) || 0,
    i = t.get("q") ?? "",
    o = pt(),
    [s, a] = v.useState(null),
    [u, c] = v.useState([]),
    [d, p] = v.useState(!0),
    [g, k] = v.useState(null),
    [x, _] = v.useState(!1),
    [S, h] = v.useState(!1),
    [f, m] = v.useState(!1),
    [w, C] = v.useState(!0),
    [R, z] = v.useState("view"),
    [P, L] = v.useState(null),
    [b, A] = v.useState(800),
    [F, V] = v.useState(0),
    [U, M] = v.useState(0),
    [Q, G] = v.useState(800),
    y = v.useRef(null),
    E = v.useMemo(() => ux(i), [i]),
    { markers: j, setMarkers: N } = hp(n);
  v.useEffect(() => {
    if (!n) {
      o("/", { replace: !0 });
      return;
    }
    (p(!0),
      Promise.all([up(n), ap(n)])
        .then(([$, H]) => {
          (a($), c(H.pages));
        })
        .catch(($) => k($.message))
        .finally(() => p(!1)));
  }, [n, o]);
  function T($, H, te) {
    if (!n) return;
    const oe = `ocr_${te}_${$}`;
    if (j.find((He) => He.box_key === oe)) {
      (N((He) => He.filter((Go) => Go.box_key !== oe)), P === oe && L(null));
      return;
    }
    const ke = {
      box_key: oe,
      page_idx: te,
      kind: "ocr",
      x: H.x,
      y: H.y,
      w: H.w,
      h: H.h,
      note: null,
      created_at: new Date().toISOString(),
    };
    (N((He) => [...He, ke]), L(oe));
  }
  function B($, H, te) {
    if (!n) return;
    const oe = {
      box_key: `drawn_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      page_idx: $,
      kind: "drawn",
      x: H.x,
      y: H.y,
      w: H.w,
      h: H.h,
      note: null,
      created_at: new Date().toISOString(),
    };
    (N((Ue) => [...Ue, oe]), L(oe.box_key));
  }
  function W($, H) {
    N((te) => te.map((oe) => (oe.box_key === $ ? { ...oe, note: H } : oe)));
  }
  function he($) {
    (N((H) => H.filter((te) => te.box_key !== $)), P === $ && L(null));
  }
  async function ye() {
    if (!S) {
      h(!0);
      return;
    }
    _(!0);
    try {
      (await Na(n), or(e.toast_success, Oe), o("/", { replace: !0 }));
    } catch ($) {
      (k($.message), _(!1), h(!1));
    }
  }
  const Oe = ax((s == null ? void 0 : s.fileS3Key) ?? ""),
    it = s == null ? void 0 : s.encrypted_file_key,
    Z = v.useMemo(() => u.map(($) => ({ page: $, boxes: sx($.ocr) })), [u]),
    sn = v.useMemo(() => Z.reduce(($, H) => $ + H.boxes.length, 0), [Z]),
    me = v.useMemo(() => {
      const $ = [];
      return (
        Z.forEach(({ boxes: H }, te) => {
          H.forEach((oe, Ue) => {
            E.some((ke) => (oe.text ?? "").toLowerCase().includes(ke)) &&
              $.push({ pageIdx: te, boxIdx: Ue, text: oe.text });
          });
        }),
        $
      );
    }, [Z, E]),
    [an, zn] = v.useState(0);
  (v.useEffect(() => {
    zn(0);
  }, [n]),
    v.useEffect(() => {
      const $ = y.current;
      if (!$) return;
      const H = () => {
        const oe = $.clientWidth,
          Ue = oe < 480,
          Go = Math.max(Ue ? 200 : 360, Math.min(oe - (Ue ? 12 : 48), 1100));
        (A(Go), G($.clientHeight));
      };
      H();
      const te = new ResizeObserver(H);
      return (te.observe($), () => te.disconnect());
    }, []));
  const [Yo, fr] = v.useState(0.707),
    pr = b / Yo,
    O = pr + cx,
    q = Math.max(0, Math.floor(U / O) - bc),
    Ee = Math.min(u.length - 1, Math.ceil((U + Q) / O) + bc),
    we = u.length === 0 ? 0 : u.length * O + 40;
  function mi($) {
    M($.currentTarget.scrollTop);
    const H = Math.min(
      u.length - 1,
      Math.max(0, Math.floor($.currentTarget.scrollTop / O)),
    );
    V(H);
  }
  function Aa($) {
    const H = $ * O;
    y.current && y.current.scrollTo({ top: H, behavior: "smooth" });
  }
  const Fa = v.useMemo(() => {
    var H;
    return !i || r > 0 ? r : (((H = me[0]) == null ? void 0 : H.pageIdx) ?? 0);
  }, [i, r, me]);
  (v.useEffect(() => {
    if (d || u.length === 0) return;
    const $ = requestAnimationFrame(() => {
      Aa(Math.min(Fa, u.length - 1));
    });
    return () => cancelAnimationFrame($);
  }, [d, u.length, Fa]),
    v.useEffect(() => {
      if (me.length === 0) return;
      const $ = me[an];
      if (!$) return;
      const H = $.pageIdx * O;
      if (!y.current) return;
      y.current.scrollTo({ top: H, behavior: "smooth" });
      const te = setTimeout(() => {
        var Ue;
        const oe =
          (Ue = y.current) == null
            ? void 0
            : Ue.querySelector("[data-active-box='true']");
        oe &&
          oe.scrollIntoView({
            behavior: "smooth",
            block: "center",
            inline: "nearest",
          });
      }, 320);
      return () => clearTimeout(te);
    }, [an, me.length]));
  const bp = v.useMemo(() => {
      const $ = new Map(),
        H = me[an];
      return (H && $.set(H.pageIdx, H.boxIdx), $);
    }, [me, an]),
    Cp = E.length > 0 && me.length > 0,
    [Ba, Wa] = v.useState(!1),
    Ua = v.useRef(0);
  return (
    Ua.current !== me.length && ((Ua.current = me.length), Ba && Wa(!1)),
    d
      ? l.jsx(Cc, {
          children: l.jsx("p", {
            style: { color: "var(--text-3)", fontSize: "0.85rem" },
            children: e.doc_loading,
          }),
        })
      : g || !s
        ? l.jsxs("div", {
            style: { padding: 24 },
            children: [
              l.jsx("p", {
                style: { color: "var(--danger)", fontSize: "0.85rem" },
                children: g ?? e.doc_notFound,
              }),
              l.jsx("button", {
                className: "btn btn-ghost",
                onClick: () => o(-1),
                style: { marginTop: 8 },
                children: e.doc_back,
              }),
            ],
          })
        : l.jsxs("div", {
            style: {
              display: "flex",
              flexDirection: "column",
              height: "100%",
              overflow: "hidden",
            },
            children: [
              l.jsxs("div", {
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
                  l.jsx("button", {
                    className: "btn btn-ghost",
                    onClick: () => o(-1),
                    style: { padding: "3px 8px", fontSize: "0.78rem" },
                    children: e.doc_back,
                  }),
                  l.jsxs("div", {
                    style: { flex: 1, overflow: "hidden", minWidth: 0 },
                    children: [
                      l.jsxs("div", {
                        style: {
                          display: "flex",
                          alignItems: "center",
                          gap: 5,
                        },
                        children: [
                          l.jsx("p", {
                            className: "mono",
                            style: {
                              margin: 0,
                              fontSize: "0.76rem",
                              color: "var(--text-1)",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            },
                            title: s.fileS3Key,
                            children: Oe,
                          }),
                          l.jsx("button", {
                            title: f ? e.doc_hidePath : e.doc_showPath,
                            "aria-label": f ? e.doc_hidePath : e.doc_showPath,
                            onClick: () => m(($) => !$),
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
                      f &&
                        l.jsxs("div", {
                          style: {
                            margin: "2px 0 0",
                            fontSize: "0.62rem",
                            color: "var(--text-2)",
                            background: "var(--bg-raised)",
                            padding: "5px 7px",
                            borderRadius: 4,
                            display: "flex",
                            flexDirection: "column",
                            gap: 2,
                          },
                          children: [
                            l.jsxs("button", {
                              onClick: () => {
                                var $;
                                (($ = navigator.clipboard) == null ||
                                  $.writeText(s.fileS3Key).catch(() => {}),
                                  or(e.toast_success, s.fileS3Key));
                              },
                              title: s.fileS3Key,
                              className: "mono",
                              style: {
                                background: "none",
                                border: "none",
                                padding: 0,
                                margin: 0,
                                cursor: "pointer",
                                color: "var(--text-2)",
                                fontSize: "0.62rem",
                                textAlign: "left",
                                wordBreak: "break-all",
                              },
                              children: [s.fileS3Key, " ⧉"],
                            }),
                            l.jsxs("span", {
                              style: {
                                fontFamily: "JetBrains Mono, monospace",
                              },
                              children: [
                                e.doc_ingested,
                                ": ",
                                s.created_at
                                  ? new Date(s.created_at).toLocaleString()
                                  : "—",
                                s.spawned_time &&
                                  l.jsxs(l.Fragment, {
                                    children: [
                                      " · ",
                                      e.doc_pipeline,
                                      ": ",
                                      new Date(s.spawned_time).toLocaleString(),
                                    ],
                                  }),
                              ],
                            }),
                            s.file_id != null &&
                              l.jsxs("span", {
                                style: {
                                  fontFamily: "JetBrains Mono, monospace",
                                },
                                children: [
                                  e.doc_fileId,
                                  ": ",
                                  String(s.file_id),
                                ],
                              }),
                          ],
                        }),
                      i &&
                        l.jsxs("p", {
                          style: {
                            margin: "2px 0 0",
                            fontSize: "0.66rem",
                            color: "var(--accent)",
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                          },
                          children: [
                            l.jsxs("span", {
                              style: {
                                fontFamily: "JetBrains Mono, monospace",
                                background: "var(--accent-glow)",
                                padding: "1px 6px",
                                borderRadius: 3,
                                fontWeight: 600,
                              },
                              children: ["“", i, "”"],
                            }),
                            l.jsx("span", {
                              children: e.doc_matches(me.length),
                            }),
                          ],
                        }),
                      l.jsxs("p", {
                        style: {
                          margin: 0,
                          fontSize: "0.64rem",
                          color: "var(--text-3)",
                        },
                        children: [
                          e.doc_page(F + 1, u.length),
                          (Ha = s.assigned_tags) != null && Ha.length
                            ? " · " + s.assigned_tags.join(", ")
                            : "",
                          sn > 0 && ` · ${sn} ${e.doc_ocrBoxes}`,
                        ],
                      }),
                    ],
                  }),
                  l.jsxs("div", {
                    style: { display: "flex", gap: 5, flexShrink: 0 },
                    children: [
                      Cp &&
                        l.jsxs("div", {
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
                            animation: Ba
                              ? "none"
                              : "ocr-blink-border 1.4s ease-in-out 3, hit-pill-persist 1.8s ease-in-out 1.4s infinite",
                          },
                          children: [
                            l.jsx("button", {
                              onClick: () =>
                                zn(($) => ($ - 1 + me.length) % me.length),
                              style: Ai,
                              title: e.doc_prevHit,
                              "aria-label": e.doc_prevHit,
                              children: "↑",
                            }),
                            l.jsxs("button", {
                              onClick: () => {
                                zn(0);
                                const $ = me[0];
                                $ &&
                                  y.current &&
                                  y.current.scrollTo({
                                    top: $.pageIdx * O,
                                    behavior: "smooth",
                                  });
                              },
                              title: e.doc_jumpFirst,
                              "aria-label": e.doc_jumpFirst,
                              style: {
                                ...Ai,
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
                                l.jsx("span", {
                                  style: { fontSize: "0.78rem" },
                                  children: "●",
                                }),
                                l.jsxs("span", {
                                  children: ["HIT ", an + 1, "/", me.length],
                                }),
                              ],
                            }),
                            l.jsx("button", {
                              onClick: () => zn(($) => ($ + 1) % me.length),
                              style: Ai,
                              title: e.doc_nextHit,
                              "aria-label": e.doc_nextHit,
                              children: "↓",
                            }),
                            l.jsx("button", {
                              onClick: () => Wa(!0),
                              style: {
                                ...Ai,
                                fontSize: "0.62rem",
                                padding: "2px 6px",
                                borderLeft:
                                  "1px solid color-mix(in srgb, var(--accent) 25%, transparent)",
                                opacity: 0.6,
                              },
                              title: e.doc_dismiss,
                              "aria-label": "Dismiss",
                              children: "✕",
                            }),
                          ],
                        }),
                      sn > 0 &&
                        l.jsx("button", {
                          className: `btn ${w ? "btn-primary" : "btn-ghost"}`,
                          onClick: () => C(($) => !$),
                          style: { fontSize: "0.72rem" },
                          children: "OCR",
                        }),
                      l.jsx("button", {
                        className: `btn ${R !== "view" ? "btn-primary" : "btn-ghost"}`,
                        onClick: () =>
                          z(($) => ($ === "draw" ? "view" : "draw")),
                        style: { fontSize: "0.72rem" },
                        title:
                          R === "draw"
                            ? e.doc_markModeHint
                            : e.doc_markModeHint2,
                        children: R === "draw" ? e.doc_drawing : e.doc_mark,
                      }),
                      j.length > 0 &&
                        l.jsx("span", {
                          style: {
                            fontSize: "0.68rem",
                            color: "var(--warn)",
                            fontFamily: "JetBrains Mono, monospace",
                            background: "var(--bg-raised)",
                            padding: "2px 7px",
                            borderRadius: 4,
                          },
                          children: e.doc_marker(j.length),
                        }),
                      l.jsx("a", {
                        href: $0(s.fileS3Key),
                        download: !0,
                        className: "btn btn-ghost",
                        style: { fontSize: "0.72rem", textDecoration: "none" },
                        children: "↓",
                      }),
                      l.jsx("button", {
                        className: "btn btn-danger",
                        onClick: ye,
                        disabled: x,
                        style: { fontSize: "0.72rem" },
                        children: x
                          ? "…"
                          : S
                            ? e.doc_confirmDelete
                            : e.doc_delete,
                      }),
                      S &&
                        !x &&
                        l.jsx("button", {
                          className: "btn btn-ghost",
                          onClick: () => h(!1),
                          style: { fontSize: "0.72rem" },
                          children: "✕",
                        }),
                    ],
                  }),
                ],
              }),
              u.length > 1 &&
                l.jsxs("div", {
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
                    l.jsx("span", {
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
                    u.map(($, H) =>
                      l.jsx(
                        "button",
                        {
                          onClick: () => Aa(H),
                          style: {
                            padding: "2px 7px",
                            borderRadius: 4,
                            fontSize: "0.68rem",
                            background:
                              F === H
                                ? "var(--accent-glow)"
                                : "var(--bg-raised)",
                            border: `1px solid ${F === H ? "var(--accent)" : "var(--border)"}`,
                            color: F === H ? "var(--accent)" : "var(--text-2)",
                            cursor: "pointer",
                            flexShrink: 0,
                          },
                          children: $.pageIdx + 1,
                        },
                        $.pageIdx,
                      ),
                    ),
                  ],
                }),
              l.jsx("div", {
                ref: y,
                onScroll: mi,
                style: { flex: 1, overflowY: "auto", position: "relative" },
                children: l.jsxs("div", {
                  style: { height: we, position: "relative" },
                  children: [
                    Z.length === 0 &&
                      l.jsx(Cc, {
                        children: l.jsx("p", {
                          style: { color: "var(--text-3)" },
                          children: e.doc_noPages,
                        }),
                      }),
                    Z.map(({ page: $, boxes: H }, te) => {
                      const oe = te >= q && te <= Ee,
                        Ue = te * O + 20;
                      return oe
                        ? l.jsx(
                            fx,
                            {
                              page: $,
                              boxes: H,
                              showOcr: w,
                              markersMode: R,
                              markers: j.filter((ke) => ke.page_idx === te),
                              encryptedFileKey: it,
                              width: b,
                              height: pr,
                              index: te,
                              highlightTokens: E,
                              activeHighlightIdx: bp.get(te),
                              onAspectRatio: (ke, He) => {
                                ke && He && te === 0 && fr(ke / He);
                              },
                              top: Ue,
                              onToggleBoxMarker: (ke, He) => T(ke, He, te),
                              onAddDrawnMarker: (ke) => B(te, ke),
                              onRemoveMarker: (ke) => he(ke),
                              noteMarkerKey: P,
                              onSaveNote: (ke, He) => W(ke, He),
                              onCloseNote: () => L(null),
                            },
                            $.pageIdx,
                          )
                        : l.jsxs(
                            "div",
                            {
                              id: `page-${te}`,
                              style: {
                                position: "absolute",
                                top: Ue,
                                left: 0,
                                right: 0,
                                height: pr,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "var(--text-3)",
                                fontSize: "0.7rem",
                                fontFamily: "JetBrains Mono, monospace",
                              },
                              children: ["page ", $.pageIdx + 1],
                            },
                            $.pageIdx,
                          );
                    }),
                  ],
                }),
              }),
            ],
          })
  );
}
function fx({
  page: e,
  boxes: t,
  showOcr: n,
  markersMode: r,
  markers: i,
  encryptedFileKey: o,
  width: s,
  height: a,
  index: u,
  highlightTokens: c,
  activeHighlightIdx: d,
  onAspectRatio: p,
  top: g,
  onToggleBoxMarker: k,
  onAddDrawnMarker: x,
  onRemoveMarker: _,
  noteMarkerKey: S,
  onSaveNote: h,
  onCloseNote: f,
}) {
  const [m, w] = v.useState(null);
  return l.jsxs("div", {
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
      l.jsx(Qo, {
        src: e.banner_img,
        encryptedFileKey: o,
        alt: `Page ${e.pageIdx + 1}`,
        onLoad: (C, R) => {
          (w({ w: C, h: R }), p == null || p(C, R));
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
        m &&
        l.jsx(px, {
          boxes: t,
          markers: i,
          naturalWidth: m.w,
          naturalHeight: m.h,
          highlightTokens: c,
          activeHighlightIdx: d,
          markersMode: r,
          onToggleBoxMarker: k,
          onAddDrawnMarker: x,
          onRemoveMarker: _,
          noteMarkerKey: S,
          onSaveNote: h,
          onCloseNote: f,
        }),
    ],
  });
}
function px({
  boxes: e,
  markers: t,
  naturalWidth: n,
  naturalHeight: r,
  highlightTokens: i,
  activeHighlightIdx: o,
  markersMode: s,
  onToggleBoxMarker: a,
  onAddDrawnMarker: u,
  onRemoveMarker: c,
  noteMarkerKey: d,
  onSaveNote: p,
  onCloseNote: g,
}) {
  var Q, G;
  const [k, x] = v.useState(null),
    [_, S] = v.useState(null),
    h = v.useRef(null),
    [f, m] = v.useState(null),
    w = new Map();
  t.forEach((y) => {
    if (y.kind === "ocr") {
      const E = y.box_key.match(/^ocr_(\d+)_(\d+)$/);
      E && w.set(parseInt(E[2], 10), y);
    }
  });
  const C = i ?? [],
    R = e
      .map((y, E) => ({
        i: E,
        match:
          C.length > 0 &&
          C.some((j) => (y.text ?? "").toLowerCase().includes(j)),
      }))
      .filter((y) => y.match)
      .map((y) => y.i),
    z = o != null ? R.indexOf(o) : -1,
    P = k != null ? e[k] : null;
  function L(y, E) {
    var B;
    const j = (B = h.current) == null ? void 0 : B.getBoundingClientRect();
    if (!j) return { x: 0, y: 0 };
    const N = (y - j.left) / j.width,
      T = (E - j.top) / j.height;
    return { x: Math.round(N * n), y: Math.round(T * r) };
  }
  function b(y) {
    const E = y.target.closest("[data-box-key]");
    if (s === "draw") {
      if ((y.pointerType === "mouse" && y.button !== 0) || E) return;
      const { x: j, y: N } = L(y.clientX, y.clientY);
      m({ startX: j, startY: N, x: j, y: N });
      return;
    }
    y.pointerType !== "mouse" && !E && (x(null), S(null));
  }
  function A(y) {
    var E;
    if (y.pointerType === "mouse") {
      const j = (E = h.current) == null ? void 0 : E.getBoundingClientRect();
      j && S({ x: y.clientX - j.left, y: y.clientY - j.top });
    }
    if (f) {
      const { x: j, y: N } = L(y.clientX, y.clientY);
      m((T) => T && { ...T, x: j, y: N });
    }
  }
  function F() {
    if (!f) return;
    const y = Math.min(f.startX, f.x),
      E = Math.min(f.startY, f.y),
      j = Math.max(f.startX, f.x),
      N = Math.max(f.startY, f.y),
      T = j - y,
      B = N - E;
    (m(null),
      T > 10 &&
        B > 10 &&
        u({ x: y, y: E, w: T, h: B, text: "", confidence: null }));
  }
  function V(y) {
    (y.pointerType === "mouse" && (x(null), S(null)), f && m(null));
  }
  function U(y) {
    var j;
    const E = (j = h.current) == null ? void 0 : j.getBoundingClientRect();
    E && S({ x: y.clientX - E.left, y: y.clientY - E.top });
  }
  const M = t.filter((y) => y.kind === "drawn");
  return l.jsxs("div", {
    ref: h,
    onPointerDown: b,
    onPointerMove: A,
    onPointerUp: F,
    onPointerLeave: V,
    style: {
      position: "absolute",
      inset: 0,
      touchAction: s === "draw" ? "none" : void 0,
      pointerEvents: "none",
      cursor: s === "draw" ? "crosshair" : "default",
    },
    children: [
      e.map((y, E) => {
        const j = y.confidence ?? 1,
          N = E === k,
          T = R.includes(E),
          B = z >= 0 && R[z] === E,
          he = !!w.get(E),
          ye =
            j > 0.85
              ? "var(--ocr-conf-high)"
              : j > 0.6
                ? "var(--ocr-conf-mid)"
                : "var(--ocr-conf-low)",
          Oe = B
            ? "var(--ocr-active-border)"
            : he
              ? "var(--ocr-marker-border)"
              : T
                ? "var(--ocr-match-border)"
                : N
                  ? "var(--ocr-active-border)"
                  : ye,
          it = B
            ? "var(--ocr-active-bg)"
            : he
              ? "var(--ocr-marker-bg)"
              : T || N
                ? "var(--ocr-match-bg)"
                : "transparent";
        return l.jsx(
          "div",
          {
            "data-box-key": `ocr_${E}`,
            onPointerEnter: (Z) => {
              Z.pointerType === "mouse" && (x(E), U(Z));
            },
            onPointerMove: (Z) => {
              Z.pointerType !== "mouse" || k !== E || U(Z);
            },
            onPointerDown: (Z) => {
              Z.pointerType !== "mouse" &&
                (Z.stopPropagation(), x((sn) => (sn === E ? null : E)), U(Z));
            },
            onContextMenu: (Z) => {
              (Z.preventDefault(), a(E, y));
            },
            onDoubleClick: () => a(E, y),
            className: B ? "ocr-active-blink" : void 0,
            "data-active-box": B ? "true" : void 0,
            style: {
              position: "absolute",
              left: `${(y.x / n) * 100}%`,
              top: `${(y.y / r) * 100}%`,
              width: `${(y.w / n) * 100}%`,
              height: `${(y.h / r) * 100}%`,
              border: `2px solid ${Oe}`,
              background: it,
              cursor: "crosshair",
              boxSizing: "border-box",
              transition: "background 0.08s, border-color 0.08s",
              zIndex: B ? 4 : he ? 3 : T ? 2 : 1,
              pointerEvents: "auto",
              borderRadius: 2,
            },
          },
          E,
        );
      }),
      M.map((y) =>
        l.jsx(
          "div",
          {
            "data-box-key": y.box_key,
            style: {
              position: "absolute",
              left: `${(y.x / n) * 100}%`,
              top: `${(y.y / r) * 100}%`,
              width: `${(y.w / n) * 100}%`,
              height: `${(y.h / r) * 100}%`,
              border: "2px dashed var(--ocr-marker-border)",
              background: "var(--ocr-marker-bg)",
              zIndex: 5,
              pointerEvents: "auto",
              boxSizing: "border-box",
            },
            onDoubleClick: () => c(y.box_key),
            children:
              y.note &&
              l.jsxs("div", {
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
                title: y.note,
                children: ["✎ ", y.note],
              }),
          },
          y.box_key,
        ),
      ),
      f &&
        l.jsx("div", {
          style: {
            position: "absolute",
            left: `${(Math.min(f.startX, f.x) / n) * 100}%`,
            top: `${(Math.min(f.startY, f.y) / r) * 100}%`,
            width: `${(Math.abs(f.x - f.startX) / n) * 100}%`,
            height: `${(Math.abs(f.y - f.startY) / r) * 100}%`,
            border: "2px dashed var(--ocr-marker-border)",
            background: "var(--ocr-marker-bg)",
            zIndex: 6,
            pointerEvents: "none",
            boxSizing: "border-box",
          },
        }),
      P &&
        _ &&
        l.jsxs("div", {
          style: {
            position: "absolute",
            left: Math.min(
              _.x + 14,
              (((Q = h.current) == null ? void 0 : Q.clientWidth) ?? 0) - 260,
            ),
            top: Math.min(
              _.y + 14,
              (((G = h.current) == null ? void 0 : G.clientHeight) ?? 0) - 70,
            ),
            background: "var(--ocr-tooltip-bg)",
            border: "1px solid var(--ocr-tooltip-border)",
            borderRadius: 6,
            padding: "8px 10px",
            color: "var(--ocr-tooltip-fg)",
            pointerEvents: "auto",
            zIndex: 8,
            boxShadow: "0 8px 24px rgba(0,0,0,0.85)",
            maxWidth: 260,
          },
          onPointerDown: (y) => y.stopPropagation(),
          children: [
            l.jsx("div", {
              style: {
                fontSize: "0.82rem",
                fontWeight: 500,
                lineHeight: 1.4,
                color: "var(--ocr-tooltip-fg)",
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
              },
              children: P.text || "(empty)",
            }),
            l.jsxs("div", {
              style: {
                marginTop: 6,
                display: "flex",
                alignItems: "center",
                gap: 5,
                flexWrap: "wrap",
              },
              children: [
                P.confidence != null &&
                  l.jsxs("span", {
                    style: {
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 5,
                      padding: "2px 7px",
                      borderRadius: 999,
                      background:
                        P.confidence > 0.85
                          ? "var(--ocr-conf-high)"
                          : P.confidence > 0.6
                            ? "var(--ocr-conf-mid)"
                            : "var(--ocr-conf-low)",
                      fontSize: "0.7rem",
                      fontFamily: "JetBrains Mono, monospace",
                      fontWeight: 600,
                      color: "var(--ocr-tooltip-fg)",
                      letterSpacing: "0.04em",
                    },
                    children: ["conf ", (P.confidence * 100).toFixed(0), "%"],
                  }),
                l.jsx("button", {
                  onClick: (y) => {
                    (y.stopPropagation(), k != null && a(k, P));
                  },
                  style: {
                    background: "none",
                    border: "1px solid var(--ocr-tooltip-border)",
                    borderRadius: 999,
                    padding: "2px 8px",
                    fontSize: "0.66rem",
                    color: "var(--ocr-tooltip-fg)",
                    cursor: "pointer",
                  },
                  children: w.has(k ?? -1) ? "★ Unmark" : "☆ Mark",
                }),
              ],
            }),
          ],
        }),
      d &&
        (() => {
          const y = t.find((E) => E.box_key === d);
          return y
            ? l.jsx(hx, {
                marker: y,
                naturalWidth: n,
                naturalHeight: r,
                onSave: (E) => p(y.box_key, E),
                onClose: g,
                onDelete: () => {
                  (c(y.box_key), g());
                },
              })
            : null;
        })(),
    ],
  });
}
function hx({
  marker: e,
  naturalWidth: t,
  naturalHeight: n,
  onSave: r,
  onClose: i,
  onDelete: o,
}) {
  const s = pe(),
    [a, u] = v.useState(e.note ?? "");
  return l.jsxs("div", {
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
      maxWidth: "calc(100vw - 40px)",
      boxShadow: "0 8px 24px rgba(0,0,0,0.7)",
      pointerEvents: "auto",
    },
    onClick: (c) => c.stopPropagation(),
    children: [
      l.jsx("textarea", {
        autoFocus: !0,
        value: a,
        onChange: (c) => u(c.target.value),
        placeholder: s.doc_notePlaceholder,
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
      l.jsxs("div", {
        style: {
          marginTop: 6,
          display: "flex",
          gap: 4,
          justifyContent: "flex-end",
        },
        children: [
          l.jsx("button", {
            className: "btn btn-ghost",
            onClick: o,
            style: { fontSize: "0.68rem", padding: "3px 7px" },
            children: s.doc_noteDelete,
          }),
          l.jsx("button", {
            className: "btn btn-ghost",
            onClick: i,
            style: { fontSize: "0.68rem", padding: "3px 7px" },
            children: s.doc_noteClose,
          }),
          l.jsx("button", {
            className: "btn btn-primary",
            onClick: () => {
              (r(a), i());
            },
            style: { fontSize: "0.68rem", padding: "3px 9px" },
            children: s.doc_noteSave,
          }),
        ],
      }),
    ],
  });
}
function Cc({ children: e }) {
  return l.jsx("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      height: "100%",
    },
    children: e,
  });
}
const Ai = {
  background: "transparent",
  border: "none",
  color: "var(--accent)",
  cursor: "pointer",
  fontSize: "0.85rem",
  padding: "2px 6px",
  borderRadius: 3,
  lineHeight: 1,
};
function Fi(e) {
  return e < 1024
    ? `${e} B`
    : e < 1024 ** 2
      ? `${(e / 1024).toFixed(1)} KB`
      : e < 1024 ** 3
        ? `${(e / 1024 ** 2).toFixed(1)} MB`
        : `${(e / 1024 ** 3).toFixed(2)} GB`;
}
function br(e) {
  return e < 60
    ? `${e}s`
    : e < 3600
      ? `${Math.round(e / 60)}m ${e % 60}s`
      : `${(e / 3600).toFixed(1)}h`;
}
function Tn(e) {
  return e ? `${e.toFixed(1)} p/min` : "—";
}
function Ec({ value: e, max: t, warn: n }) {
  const r = t > 0 ? Math.min(100, (e / t) * 100) : 0;
  return l.jsx("div", {
    style: {
      height: 8,
      background: "var(--bg-raised)",
      borderRadius: 999,
      overflow: "hidden",
      width: "100%",
    },
    children: l.jsx("div", {
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
function zc({ data: e }) {
  if (!e.length)
    return l.jsx("div", {
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
  return l.jsx("div", {
    style: { display: "flex", alignItems: "flex-end", gap: 2, height: 36 },
    children: e.map((n, r) =>
      l.jsx(
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
function Xe({ value: e, suffix: t = "" }) {
  const [n, r] = v.useState(0),
    i = v.useRef(null);
  return (
    v.useEffect(() => {
      const o = e,
        s = 700,
        a = performance.now(),
        u = n;
      function c(d) {
        const p = Math.min(1, (d - a) / s),
          g = 1 - Math.pow(1 - p, 3);
        (r(Math.round(u + (o - u) * g)),
          p < 1 && (i.current = requestAnimationFrame(c)));
      }
      return (
        (i.current = requestAnimationFrame(c)),
        () => {
          i.current && cancelAnimationFrame(i.current);
        }
      );
    }, [e]),
    l.jsxs(l.Fragment, { children: [n.toLocaleString(), t] })
  );
}
function ce({ label: e, value: t, sub: n, accent: r, warn: i, mono: o }) {
  return l.jsxs("div", {
    className: "card",
    style: { padding: "14px 16px" },
    children: [
      l.jsx("p", {
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
      l.jsx("p", {
        style: {
          margin: "5px 0 0",
          fontSize: "1.45rem",
          fontWeight: 700,
          lineHeight: 1,
          color: i ? "var(--warn)" : r ? "var(--accent)" : "var(--text-1)",
          fontFamily: o ? "JetBrains Mono, monospace" : void 0,
        },
        children: t,
      }),
      n &&
        l.jsx("p", {
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
function Rc({ worker: e, type: t }) {
  const n = pe(),
    r = e.active || e.ack_per_sec > 0;
  return l.jsxs("div", {
    className: "card",
    style: {
      padding: "10px 12px",
      display: "flex",
      alignItems: "center",
      gap: 10,
    },
    children: [
      l.jsx("div", {
        style: {
          width: 7,
          height: 7,
          borderRadius: "50%",
          flexShrink: 0,
          background: r ? "var(--success)" : "var(--text-3)",
          boxShadow: r ? "0 0 6px var(--success)" : "none",
          transition: "background 0.4s, box-shadow 0.4s",
        },
      }),
      l.jsxs("div", {
        style: { flex: 1, overflow: "hidden" },
        children: [
          l.jsx("p", {
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
          l.jsxs("p", {
            style: { margin: 0, fontSize: "0.65rem", color: "var(--text-3)" },
            children: [
              t === "ocr" ? n.st_ocr : n.st_merge,
              " · ",
              n.st_pf(e.prefetch ?? "—"),
              e.unacked > 0 &&
                l.jsx("span", {
                  style: { color: "var(--warn)", marginLeft: 6 },
                  children: n.st_unacked(e.unacked),
                }),
            ],
          }),
        ],
      }),
      l.jsx("div", {
        style: { textAlign: "right", flexShrink: 0 },
        children: l.jsx("p", {
          style: {
            margin: 0,
            fontSize: "0.72rem",
            color: r ? "var(--accent)" : "var(--text-3)",
            fontFamily: "JetBrains Mono, monospace",
          },
          children:
            e.ack_per_sec > 0
              ? n.st_perSec(e.ack_per_sec.toFixed(2))
              : n.st_idle,
        }),
      }),
    ],
  });
}
function dn({ label: e, children: t, defaultOpen: n = !0 }) {
  const r = `rain-dms-stats-section:${e}`,
    [i, o] = v.useState(() => {
      try {
        const a = localStorage.getItem(r);
        return a === null ? n : a === "1";
      } catch {
        return n;
      }
    });
  function s() {
    o((a) => {
      const u = !a;
      try {
        localStorage.setItem(r, u ? "1" : "0");
      } catch {}
      return u;
    });
  }
  return l.jsxs("div", {
    style: { marginBottom: 24 },
    children: [
      l.jsxs("h3", {
        onClick: s,
        role: "button",
        tabIndex: 0,
        onKeyDown: (a) => {
          (a.key === "Enter" || a.key === " ") && (a.preventDefault(), s());
        },
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
          cursor: "pointer",
          userSelect: "none",
        },
        children: [
          l.jsx("svg", {
            width: "9",
            height: "9",
            viewBox: "0 0 24 24",
            fill: "none",
            stroke: "currentColor",
            strokeWidth: "3",
            style: {
              transform: i ? "rotate(90deg)" : "rotate(0deg)",
              transition: "transform 0.14s ease",
              flexShrink: 0,
            },
            children: l.jsx("polyline", { points: "9 18 15 12 9 6" }),
          }),
          e,
          l.jsx("div", {
            style: { flex: 1, height: 1, background: "var(--border-soft)" },
          }),
        ],
      }),
      i && t,
    ],
  });
}
function gx({ reminder: e, onOpen: t }) {
  const n = pe(),
    r = e.filepath.split("/").pop() ?? e.filepath,
    i = e.at ? new Date(e.at).getTime() < Date.now() : !1;
  return l.jsxs("div", {
    className: "card-sm",
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10,
      padding: "8px 12px",
    },
    children: [
      l.jsxs("div", {
        style: { flex: 1, minWidth: 0 },
        children: [
          l.jsx("p", {
            style: {
              margin: 0,
              fontSize: "0.78rem",
              fontWeight: 600,
              color: "var(--text-1)",
              fontFamily: "JetBrains Mono, monospace",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            },
            title: e.filepath,
            children: r,
          }),
          l.jsxs("p", {
            style: {
              margin: "2px 0 0",
              fontSize: "0.68rem",
              color: i ? "var(--danger)" : "var(--text-3)",
            },
            children: [
              e.at ? new Date(e.at).toLocaleString() : n.st_reminderNoDate,
              i && ` · ${n.st_reminderOverdue}`,
              e.note ? ` · ${e.note}` : "",
            ],
          }),
        ],
      }),
      l.jsx("button", {
        className: "btn btn-ghost",
        style: { fontSize: "0.7rem", padding: "3px 9px", flexShrink: 0 },
        onClick: () => ev(e.filepath),
        children: n.st_reminderMarkDone,
      }),
      l.jsx("button", {
        className: "btn btn-ghost",
        style: { fontSize: "0.7rem", padding: "3px 9px", flexShrink: 0 },
        onClick: () =>
          t(`/document?filepath=${encodeURIComponent(e.filepath)}`),
        children: n.st_reminderOpenFile,
      }),
    ],
  });
}
function mx() {
  var Q, G, y, E;
  const e = pe(),
    [t, n] = v.useState(null),
    [r, i] = v.useState(!0),
    [o, s] = v.useState(null),
    [a, u] = v.useState(null);
  async function c() {
    (i(!0), s(null));
    try {
      const j = await O0();
      (n(j), u(new Date()));
    } catch (j) {
      s(j.message);
    } finally {
      i(!1);
    }
  }
  v.useEffect(() => {
    c();
    let j = null;
    function N() {
      j || (j = setInterval(c, 5e3));
    }
    function T() {
      j && (clearInterval(j), (j = null));
    }
    function B() {
      document.hidden ? T() : (c(), N());
    }
    return (
      N(),
      document.addEventListener("visibilitychange", B),
      () => {
        (T(), document.removeEventListener("visibilitychange", B));
      }
    );
  }, []);
  const d = (t == null ? void 0 : t.stats) ?? {},
    p = (t == null ? void 0 : t.workers) ?? {},
    g = p.ocr ?? [],
    k = p.merge ?? [],
    x = d.sparkline ?? [],
    _ = d.sparkline_daily_30d ?? [],
    S = d.top_tags ?? [],
    h = d.ingest_duration ?? null,
    f = d.by_extension ?? {},
    m = d.biggest_files ?? [],
    w = (t == null ? void 0 : t.downloads) ?? {},
    C = w.workers ?? [],
    R = pt(),
    P = pp()
      .filter((j) => !j.done_at)
      .sort((j, N) =>
        !j.at && !N.at
          ? 0
          : j.at
            ? N.at
              ? new Date(j.at).getTime() - new Date(N.at).getTime()
              : -1
            : 1,
      ),
    L =
      d.total_pages > 0
        ? Math.round((d.total_size_bytes ?? 0) / d.total_pages / 1024)
        : null,
    b = d.pages_per_minute_30s,
    A = d.pages_per_minute_60s,
    F = d.eta_seconds,
    V = d.ocr_queue_length ?? 0,
    U = d.merge_queue_length ?? 0,
    M = Math.max(100, V, U);
  return l.jsxs("div", {
    style: { padding: "18px 24px", overflowY: "auto", height: "100%" },
    children: [
      l.jsxs("div", {
        style: {
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 20,
        },
        children: [
          l.jsx("h2", {
            style: {
              margin: 0,
              fontSize: "1rem",
              fontWeight: 700,
              color: "var(--text-1)",
            },
            children: e.st_title,
          }),
          l.jsx("button", {
            className: "btn btn-ghost",
            onClick: c,
            disabled: r,
            style: { fontSize: "0.72rem", padding: "3px 8px" },
            children: r ? "…" : e.st_refresh,
          }),
          a &&
            l.jsxs("span", {
              style: {
                fontSize: "0.64rem",
                color: "var(--text-3)",
                fontFamily: "JetBrains Mono, monospace",
              },
              children: [
                e.st_autoRefresh,
                " · ",
                e.st_last(a.toLocaleTimeString()),
              ],
            }),
        ],
      }),
      o &&
        l.jsx("div", {
          style: {
            marginBottom: 16,
            padding: "9px 13px",
            background: "rgba(248,113,113,0.07)",
            border: "1px solid rgba(248,113,113,0.2)",
            borderRadius: 7,
            color: "var(--danger)",
            fontSize: "0.8rem",
          },
          children: o,
        }),
      l.jsx(dn, {
        label:
          P.length > 0 ? `${e.st_reminders} (${P.length})` : e.st_reminders,
        defaultOpen: !0,
        children:
          P.length > 0
            ? l.jsx("div", {
                style: { display: "flex", flexDirection: "column", gap: 6 },
                children: P.map((j) =>
                  l.jsx(gx, { reminder: j, onOpen: R }, j.filepath),
                ),
              })
            : l.jsx("p", {
                style: {
                  margin: 0,
                  fontSize: "0.76rem",
                  color: "var(--text-3)",
                },
                children: e.st_remindersEmpty,
              }),
      }),
      l.jsxs(dn, {
        label: e.st_documents,
        children: [
          l.jsxs("div", {
            style: {
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(140px,1fr))",
              gap: 10,
              marginBottom: 14,
            },
            children: [
              l.jsx(ce, {
                label: e.st_total,
                value: l.jsx(Xe, { value: d.total_documents ?? 0 }),
                accent: !0,
              }),
              l.jsx(ce, {
                label: e.st_1h,
                value: l.jsx(Xe, { value: d.added_last_1h ?? 0 }),
              }),
              l.jsx(ce, {
                label: e.st_24h,
                value: l.jsx(Xe, { value: d.added_last_24h ?? 0 }),
              }),
              l.jsx(ce, {
                label: e.st_7d,
                value: l.jsx(Xe, { value: d.added_last_7d ?? 0 }),
              }),
              l.jsx(ce, {
                label: e.st_30d,
                value: l.jsx(Xe, { value: d.added_last_30d ?? 0 }),
              }),
              l.jsx(ce, {
                label: e.st_totalPages,
                value: l.jsx(Xe, { value: d.total_pages ?? 0 }),
                sub: e.st_avgPages(
                  ((Q = d.avg_pages_per_doc) == null ? void 0 : Q.toFixed(1)) ??
                    "—",
                ),
              }),
              l.jsx(ce, {
                label: e.st_ocrCoverage,
                value:
                  d.ocr_coverage_pct != null
                    ? l.jsxs(l.Fragment, {
                        children: [d.ocr_coverage_pct, "%"],
                      })
                    : "—",
                sub: e.st_ocrPages(d.pages_with_ocr ?? 0, d.total_pages ?? 0),
                accent: d.ocr_coverage_pct === 100,
                warn: d.ocr_coverage_pct != null && d.ocr_coverage_pct < 50,
              }),
              l.jsx(ce, {
                label: e.st_storage,
                value: Fi(d.total_size_bytes ?? 0),
                sub: L ? e.st_kbPerPage(L) : void 0,
                mono: !0,
              }),
            ],
          }),
          x.length > 0 &&
            l.jsxs("div", {
              className: "card",
              style: { padding: "12px 14px" },
              children: [
                l.jsx("p", {
                  style: {
                    margin: "0 0 8px",
                    fontSize: "0.63rem",
                    color: "var(--text-3)",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.07em",
                  },
                  children: e.st_sparkline,
                }),
                l.jsx(zc, { data: x }),
              ],
            }),
          _.length > 0 &&
            l.jsxs("div", {
              className: "card",
              style: { padding: "12px 14px", marginTop: 10 },
              children: [
                l.jsx("p", {
                  style: {
                    margin: "0 0 8px",
                    fontSize: "0.63rem",
                    color: "var(--text-3)",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.07em",
                  },
                  children: e.st_sparklineDaily,
                }),
                l.jsx(zc, { data: _ }),
              ],
            }),
          h &&
            h.sample_size > 0 &&
            l.jsxs("div", {
              style: {
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(140px,1fr))",
                gap: 10,
                marginTop: 10,
              },
              children: [
                l.jsx(ce, {
                  label: e.st_ingestAvg,
                  value: br(Math.round(h.avg_seconds ?? 0)),
                  mono: !0,
                }),
                l.jsx(ce, {
                  label: e.st_ingestMedian,
                  value: br(Math.round(h.median_seconds ?? 0)),
                  mono: !0,
                }),
                l.jsx(ce, {
                  label: e.st_ingestRange,
                  value: `${br(Math.round(h.min_seconds ?? 0))}–${br(Math.round(h.max_seconds ?? 0))}`,
                  mono: !0,
                }),
                l.jsx(ce, {
                  label: e.st_ingestSample,
                  value: l.jsx(Xe, { value: h.sample_size }),
                }),
              ],
            }),
          S.length > 0 &&
            l.jsxs("div", {
              style: { marginTop: 10 },
              children: [
                l.jsx("p", {
                  style: {
                    margin: "0 0 6px",
                    fontSize: "0.63rem",
                    color: "var(--text-3)",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.07em",
                  },
                  children: e.st_topTags,
                }),
                l.jsx("div", {
                  style: { display: "flex", flexWrap: "wrap", gap: 6 },
                  children: S.map((j) =>
                    l.jsxs(
                      "span",
                      {
                        className: "tag",
                        children: [j.tag, " · ", j.doc_count],
                      },
                      j.tag,
                    ),
                  ),
                }),
              ],
            }),
        ],
      }),
      l.jsxs(dn, {
        label: e.st_ocrPipeline,
        children: [
          l.jsxs("div", {
            style: {
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(140px,1fr))",
              gap: 10,
              marginBottom: 14,
            },
            children: [
              l.jsx(ce, {
                label: e.st_ocrQueue,
                value: l.jsx(Xe, { value: V }),
                warn: V > 20,
                mono: !0,
              }),
              l.jsx(ce, {
                label: e.st_mergeQueue,
                value: l.jsx(Xe, { value: U }),
                warn: U > 10,
                mono: !0,
              }),
              l.jsx(ce, {
                label: e.st_processing,
                value: l.jsx(Xe, { value: d.currently_processing ?? 0 }),
                accent: d.currently_processing > 0,
                mono: !0,
              }),
              l.jsx(ce, { label: e.st_rate30, value: Tn(b), mono: !0 }),
              l.jsx(ce, { label: e.st_rate60, value: Tn(A), mono: !0 }),
              l.jsx(ce, {
                label: e.st_eta,
                value: F != null ? br(F) : "—",
                warn: F != null && F > 600,
                mono: !0,
              }),
            ],
          }),
          l.jsxs("div", {
            className: "card",
            style: {
              padding: "12px 14px",
              display: "flex",
              flexDirection: "column",
              gap: 10,
            },
            children: [
              l.jsxs("div", {
                children: [
                  l.jsxs("div", {
                    style: {
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: 5,
                    },
                    children: [
                      l.jsx("span", {
                        style: {
                          fontSize: "0.68rem",
                          color: "var(--text-2)",
                          fontWeight: 600,
                        },
                        children: e.st_ocrQueue,
                      }),
                      l.jsx("span", {
                        style: {
                          fontSize: "0.68rem",
                          color: "var(--text-3)",
                          fontFamily: "JetBrains Mono, monospace",
                        },
                        children: e.st_jobs(V),
                      }),
                    ],
                  }),
                  l.jsx(Ec, { value: V, max: M, warn: !0 }),
                ],
              }),
              l.jsxs("div", {
                children: [
                  l.jsxs("div", {
                    style: {
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: 5,
                    },
                    children: [
                      l.jsx("span", {
                        style: {
                          fontSize: "0.68rem",
                          color: "var(--text-2)",
                          fontWeight: 600,
                        },
                        children: e.st_mergeQueue,
                      }),
                      l.jsx("span", {
                        style: {
                          fontSize: "0.68rem",
                          color: "var(--text-3)",
                          fontFamily: "JetBrains Mono, monospace",
                        },
                        children: e.st_jobs(U),
                      }),
                    ],
                  }),
                  l.jsx(Ec, { value: U, max: M }),
                ],
              }),
              (b || A) &&
                l.jsxs("div", {
                  children: [
                    l.jsxs("div", {
                      style: {
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: 5,
                      },
                      children: [
                        l.jsx("span", {
                          style: {
                            fontSize: "0.68rem",
                            color: "var(--text-2)",
                            fontWeight: 600,
                          },
                          children: e.st_throughput,
                        }),
                        l.jsxs("span", {
                          style: {
                            fontSize: "0.68rem",
                            color: "var(--text-3)",
                            fontFamily: "JetBrains Mono, monospace",
                          },
                          children: [Tn(b), " · ", Tn(A)],
                        }),
                      ],
                    }),
                    l.jsx("div", {
                      style: {
                        height: 8,
                        background: "var(--bg-raised)",
                        borderRadius: 999,
                        overflow: "hidden",
                        position: "relative",
                      },
                      children: l.jsx("div", {
                        style: {
                          height: "100%",
                          width: `${Math.min(100, ((b ?? 0) / Math.max(b ?? 1, A ?? 1, 1)) * 100)}%`,
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
      (g.length > 0 || k.length > 0) &&
        l.jsx(dn, {
          label: e.st_workers(g.length, k.length),
          children: l.jsxs("div", {
            style: {
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
              gap: 8,
            },
            children: [
              g.map((j) => l.jsx(Rc, { worker: j, type: "ocr" }, j.id)),
              k.map((j) => l.jsx(Rc, { worker: j, type: "merge" }, j.id)),
            ],
          }),
        }),
      C.length > 0 &&
        l.jsxs(dn, {
          label: e.st_downloads,
          children: [
            l.jsxs("div", {
              style: {
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(140px,1fr))",
                gap: 10,
                marginBottom: 10,
              },
              children: [
                l.jsx(ce, {
                  label: e.st_downloadsTotal,
                  value: l.jsx(Xe, { value: w.total ?? 0 }),
                  accent: !0,
                }),
                l.jsx(ce, {
                  label: e.st_downloadsBytes,
                  value: Fi(w.total_bytes ?? 0),
                  mono: !0,
                }),
                l.jsx(ce, {
                  label: e.st_downloadsRate,
                  value: `${Tn((G = w.summary) == null ? void 0 : G.agent_downloads_per_minute_30s)} · ${Tn((y = w.summary) == null ? void 0 : y.agent_downloads_per_minute_60s)}`,
                  mono: !0,
                }),
                l.jsx(ce, {
                  label: e.st_downloadsInFlight,
                  value: l.jsx(Xe, {
                    value:
                      ((E = w.summary) == null ? void 0 : E.in_flight) ?? 0,
                  }),
                }),
              ],
            }),
            l.jsx("div", {
              style: {
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                gap: 8,
              },
              children: C.map((j) =>
                l.jsxs(
                  "div",
                  {
                    className: "card-sm",
                    style: { padding: "9px 11px" },
                    children: [
                      l.jsx("p", {
                        style: {
                          margin: "0 0 4px",
                          fontSize: "0.72rem",
                          fontWeight: 600,
                          color: "var(--text-1)",
                          fontFamily: "JetBrains Mono, monospace",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        },
                        title: j.ip,
                        children: j.ip ?? j.tag,
                      }),
                      l.jsxs("p", {
                        style: {
                          margin: 0,
                          fontSize: "0.66rem",
                          color: "var(--text-3)",
                        },
                        children: [j.downloads, " dl · ", Fi(j.bytes ?? 0)],
                      }),
                      Array.isArray(j.recent_files) && j.recent_files.length > 0
                        ? l.jsxs("p", {
                            style: {
                              margin: "4px 0 0",
                              fontSize: "0.6rem",
                              color: "var(--text-3)",
                              fontFamily: "JetBrains Mono, monospace",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            },
                            title: j.recent_files.join(", "),
                            children: [
                              e.st_downloadsRecent,
                              ": ",
                              j.recent_files.slice(0, 2).join(", "),
                            ],
                          })
                        : l.jsx("p", {
                            style: {
                              margin: "4px 0 0",
                              fontSize: "0.6rem",
                              color: "var(--text-3)",
                            },
                            children: e.st_downloadsNoRecent,
                          }),
                    ],
                  },
                  j.id,
                ),
              ),
            }),
          ],
        }),
      Object.keys(f).length > 0 &&
        l.jsx(dn, {
          label: e.st_byExt,
          children: l.jsx("div", {
            className: "card",
            style: {
              padding: "12px 14px",
              display: "flex",
              flexDirection: "column",
              gap: 8,
            },
            children: Object.entries(f)
              .sort(([, j], [, N]) => N - j)
              .map(([j, N]) => {
                const T = Object.values(f).reduce((W, he) => W + he, 0),
                  B = T > 0 ? (N / T) * 100 : 0;
                return l.jsxs(
                  "div",
                  {
                    children: [
                      l.jsxs("div", {
                        style: {
                          display: "flex",
                          justifyContent: "space-between",
                          marginBottom: 3,
                        },
                        children: [
                          l.jsxs("span", {
                            style: {
                              fontSize: "0.7rem",
                              color: "var(--text-2)",
                              fontFamily: "JetBrains Mono, monospace",
                              fontWeight: 600,
                            },
                            children: [".", j],
                          }),
                          l.jsxs("span", {
                            style: {
                              fontSize: "0.67rem",
                              color: "var(--text-3)",
                              fontFamily: "JetBrains Mono, monospace",
                            },
                            children: [N, " · ", B.toFixed(1), "%"],
                          }),
                        ],
                      }),
                      l.jsx("div", {
                        style: {
                          height: 5,
                          background: "var(--bg-raised)",
                          borderRadius: 999,
                          overflow: "hidden",
                        },
                        children: l.jsx("div", {
                          style: {
                            height: "100%",
                            width: `${B}%`,
                            background: "var(--accent)",
                            borderRadius: 999,
                            transition: "width 0.6s",
                            opacity: 0.75,
                          },
                        }),
                      }),
                    ],
                  },
                  j,
                );
              }),
          }),
        }),
      m.length > 0 &&
        l.jsx(dn, {
          label: e.st_biggest,
          children: l.jsx("div", {
            className: "card",
            style: {
              padding: "10px 14px",
              display: "flex",
              flexDirection: "column",
              gap: 6,
            },
            children: m.slice(0, 10).map((j, N) => {
              var T;
              return l.jsxs(
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
                    l.jsxs("span", {
                      style: {
                        fontSize: "0.61rem",
                        color: "var(--text-3)",
                        fontFamily: "JetBrains Mono, monospace",
                        width: 16,
                        flexShrink: 0,
                      },
                      children: ["#", N + 1],
                    }),
                    l.jsx("span", {
                      style: {
                        flex: 1,
                        fontSize: "0.7rem",
                        color: "var(--text-2)",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        fontFamily: "JetBrains Mono, monospace",
                      },
                      title: j.filepath,
                      children:
                        ((T = j.filepath) == null
                          ? void 0
                          : T.split("/").pop()) ?? j.filepath,
                    }),
                    l.jsxs("span", {
                      style: {
                        fontSize: "0.66rem",
                        color: "var(--text-3)",
                        flexShrink: 0,
                        fontFamily: "JetBrains Mono, monospace",
                      },
                      children: [j.page_count, "p"],
                    }),
                    l.jsx("span", {
                      style: {
                        fontSize: "0.64rem",
                        color: "var(--text-3)",
                        flexShrink: 0,
                        fontFamily: "JetBrains Mono, monospace",
                      },
                      children: Fi(j.size_bytes ?? 0),
                    }),
                  ],
                },
                j.filepath,
              );
            }),
          }),
        }),
    ],
  });
}
function wt({ title: e, children: t }) {
  return l.jsxs("div", {
    style: { marginBottom: 24 },
    children: [
      l.jsx("h3", {
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
      l.jsx("div", {
        className: "card",
        style: { overflow: "hidden" },
        children: t,
      }),
    ],
  });
}
function fn({ label: e, sub: t, last: n, children: r }) {
  return l.jsxs("div", {
    className: "settings-row",
    style: {
      display: "flex",
      alignItems: "center",
      gap: 16,
      padding: "11px 14px",
      borderBottom: n ? "none" : "1px solid var(--border-soft)",
      transition: "background 0.1s",
    },
    onMouseEnter: (i) =>
      (i.currentTarget.style.background = "var(--bg-raised)"),
    onMouseLeave: (i) => (i.currentTarget.style.background = "transparent"),
    children: [
      l.jsxs("div", {
        style: { flex: 1 },
        children: [
          l.jsx("p", {
            style: {
              margin: 0,
              fontSize: "0.83rem",
              color: "var(--text-1)",
              fontWeight: 500,
            },
            children: e,
          }),
          t &&
            l.jsx("p", {
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
      l.jsx("div", { style: { flexShrink: 0 }, children: r }),
    ],
  });
}
function vx({ value: e, onChange: t }) {
  return l.jsx("button", {
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
    children: l.jsx("div", {
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
const Pc = {
  amber: "Amber",
  teal: "Teal",
  sky: "Sky",
  violet: "Violet",
  rose: "Rose",
  lime: "Lime",
  custom: "Custom",
};
function xx() {
  const e = K((M) => M.theme),
    t = K((M) => M.toggleTheme),
    n = K((M) => M.apiUrl),
    r = K((M) => M.setApiUrl),
    i = K((M) => M.accent),
    o = K((M) => M.setAccent),
    s = K((M) => M.customAccent),
    a = K((M) => M.setCustomAccent),
    u = K((M) => M.urlSubstitutions),
    c = K((M) => M.removeUrlSubstitution),
    d = K((M) => M.simulatedTagPaths),
    p = K((M) => M.setSimulatedTagPaths),
    g = K((M) => M.lang),
    k = K((M) => M.setLang),
    x = K((M) => M.allowedUploadExtensions),
    _ = K((M) => M.setAllowedUploadExtensions),
    S = pe(),
    h = Ae((M) => M.username),
    f = Ae((M) => M.mainEncryptionKey),
    m = Ae((M) => M.encryptionEnabled),
    w = Ae((M) => M.setEncryptionEnabled),
    [C, R] = v.useState(n),
    [z, P] = v.useState(!1),
    [L, b] = v.useState(
      d.join(`
`),
    ),
    [A, F] = v.useState(!1);
  function V() {
    (r(C), P(!0), setTimeout(() => P(!1), 2e3));
  }
  function U() {
    const M = L.split(
      `
`,
    )
      .map((Q) => Q.trim())
      .filter(Boolean);
    (p(M), F(!0), setTimeout(() => F(!1), 2e3));
  }
  return l.jsxs("div", {
    style: {
      padding: "22px",
      maxWidth: 580,
      margin: "0 auto",
      overflowY: "auto",
      height: "100%",
    },
    children: [
      l.jsx("h2", {
        style: { margin: "0 0 20px", fontSize: "0.95rem", fontWeight: 700 },
        children: S.st_settings,
      }),
      l.jsx(wt, {
        title: S.st_language,
        children: l.jsx(fn, {
          label: S.st_language,
          sub: S.st_langSub,
          last: !0,
          children: l.jsx("div", {
            style: { display: "flex", gap: 5 },
            children: ["en", "de"].map((M) =>
              l.jsx(
                "button",
                {
                  onClick: () => k(M),
                  className: "btn",
                  style: {
                    fontSize: "0.78rem",
                    padding: "4px 12px",
                    background:
                      g === M ? "var(--accent-glow)" : "var(--bg-raised)",
                    border: `1px solid ${g === M ? "var(--accent)" : "var(--border)"}`,
                    color: g === M ? "var(--accent)" : "var(--text-2)",
                  },
                  children: M === "en" ? S.st_english : S.st_german,
                },
                M,
              ),
            ),
          }),
        }),
      }),
      l.jsx(wt, {
        title: "Upload filters",
        children: l.jsx(fn, {
          label: "Allowed file extensions",
          sub: "Only files with these extensions will be accepted. One per line (with dot). Clear to disable filter.",
          last: !0,
          children: l.jsxs("div", {
            style: { display: "flex", flexDirection: "column", gap: 6 },
            children: [
              l.jsx("textarea", {
                className: "input",
                style: {
                  minHeight: 80,
                  fontFamily: "JetBrains Mono, monospace",
                  fontSize: "0.75rem",
                  resize: "vertical",
                },
                value: x.join(`
`),
                onChange: (M) => {
                  const Q = M.target.value
                    .split(
                      `
`,
                    )
                    .map((G) => G.trim().toLowerCase())
                    .filter((G) => G.startsWith("."));
                  _(Q);
                },
                placeholder: `.pdf
.png
.jpg`,
              }),
              l.jsxs("div", {
                style: { display: "flex", gap: 5 },
                children: [
                  l.jsx("button", {
                    className: "btn btn-ghost",
                    style: { fontSize: "0.72rem" },
                    onClick: () => _(op),
                    children: "Reset to defaults",
                  }),
                  l.jsx("button", {
                    className: "btn btn-ghost",
                    style: { fontSize: "0.72rem" },
                    onClick: () => _([]),
                    children: "Clear (block-list mode)",
                  }),
                ],
              }),
              l.jsxs("p", {
                style: {
                  margin: 0,
                  fontSize: "0.66rem",
                  color: "var(--text-3)",
                },
                children: [
                  "Current:",
                  " ",
                  x.length ? x.join(" ") : "using built-in block-list",
                ],
              }),
            ],
          }),
        }),
      }),
      l.jsxs(wt, {
        title: "Appearance",
        children: [
          l.jsx(fn, {
            label: "Theme",
            sub: `Currently ${e} mode`,
            children: l.jsx("button", {
              className: "btn btn-ghost",
              onClick: t,
              style: { fontSize: "0.78rem" },
              children: e === "dark" ? "☀ Light" : "☾ Dark",
            }),
          }),
          l.jsxs("div", {
            style: { padding: "12px 14px" },
            children: [
              l.jsx("p", {
                style: {
                  margin: "0 0 9px",
                  fontSize: "0.83rem",
                  fontWeight: 500,
                  color: "var(--text-1)",
                },
                children: S.st_accent,
              }),
              l.jsxs("div", {
                style: {
                  display: "flex",
                  gap: 7,
                  flexWrap: "wrap",
                  alignItems: "center",
                },
                children: [
                  Object.keys(Es).map((M) => {
                    const Q = Es[M],
                      G = i === M;
                    return l.jsxs(
                      "button",
                      {
                        onClick: () => o(M),
                        title: Pc[M],
                        style: {
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          padding: "5px 11px",
                          border: `2px solid ${G ? Q.accent : "transparent"}`,
                          borderRadius: 7,
                          background: G ? Q.glow : "var(--bg-raised)",
                          cursor: "pointer",
                          transition: "all 0.15s",
                        },
                        children: [
                          l.jsx("span", {
                            style: {
                              width: 10,
                              height: 10,
                              borderRadius: "50%",
                              background: Q.accent,
                              flexShrink: 0,
                              boxShadow: `0 0 5px ${Q.accent}77`,
                            },
                          }),
                          l.jsx("span", {
                            style: {
                              fontSize: "0.75rem",
                              fontWeight: 500,
                              color: G ? Q.accent : "var(--text-2)",
                            },
                            children: Pc[M],
                          }),
                        ],
                      },
                      M,
                    );
                  }),
                  l.jsxs("label", {
                    title: S.st_accentCustom,
                    style: {
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "5px 11px",
                      border: `2px solid ${i === "custom" ? (s ?? "var(--accent)") : "transparent"}`,
                      borderRadius: 7,
                      background:
                        i === "custom"
                          ? "var(--accent-glow)"
                          : "var(--bg-raised)",
                      cursor: "pointer",
                      transition: "all 0.15s",
                    },
                    children: [
                      l.jsx("span", {
                        style: {
                          width: 10,
                          height: 10,
                          borderRadius: "50%",
                          background:
                            i === "custom" && s
                              ? s
                              : "conic-gradient(from 0deg, #f59e0b, #fb7185, #a78bfa, #38bdf8, #84cc16, #f59e0b)",
                          flexShrink: 0,
                          position: "relative",
                          overflow: "hidden",
                        },
                        children: l.jsx("input", {
                          type: "color",
                          value: s ?? "#e8973a",
                          onChange: (M) => a(M.target.value),
                          style: {
                            position: "absolute",
                            inset: -4,
                            opacity: 0,
                            cursor: "pointer",
                            width: 18,
                            height: 18,
                          },
                        }),
                      }),
                      l.jsx("span", {
                        style: {
                          fontSize: "0.75rem",
                          fontWeight: 500,
                          color:
                            i === "custom" ? "var(--accent)" : "var(--text-2)",
                        },
                        children: S.st_accentCustom,
                      }),
                    ],
                  }),
                ],
              }),
              l.jsxs("p", {
                style: {
                  margin: "7px 0 0",
                  fontSize: "0.67rem",
                  color: "var(--text-3)",
                },
                children: [S.st_accentHint, " ", S.st_accentCustomHint],
              }),
            ],
          }),
        ],
      }),
      l.jsx(wt, {
        title: S.st_urlSubs,
        children: l.jsxs("div", {
          style: { padding: "12px 14px" },
          children: [
            l.jsx("p", {
              style: {
                margin: "0 0 10px",
                fontSize: "0.72rem",
                color: "var(--text-3)",
                lineHeight: 1.5,
              },
              children: S.st_urlSubsHint,
            }),
            u.length === 0
              ? l.jsx("p", {
                  style: {
                    margin: 0,
                    fontSize: "0.76rem",
                    color: "var(--text-3)",
                  },
                  children: S.st_urlSubsEmpty,
                })
              : l.jsx("div", {
                  style: { display: "flex", flexDirection: "column", gap: 6 },
                  children: u.map((M) =>
                    l.jsxs(
                      "div",
                      {
                        style: {
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          padding: "7px 10px",
                          background: "var(--bg-raised)",
                          border: "1px solid var(--border-soft)",
                          borderRadius: 7,
                          fontSize: "0.72rem",
                          fontFamily: "JetBrains Mono, monospace",
                        },
                        children: [
                          l.jsx("span", {
                            style: {
                              color: "var(--text-2)",
                              wordBreak: "break-all",
                            },
                            children: M.from,
                          }),
                          l.jsx("span", {
                            style: { color: "var(--text-3)", flexShrink: 0 },
                            children: "→",
                          }),
                          l.jsx("span", {
                            style: {
                              color: "var(--accent)",
                              wordBreak: "break-all",
                              flex: 1,
                            },
                            children: M.to,
                          }),
                          l.jsx("button", {
                            className: "btn btn-ghost",
                            onClick: () => c(M.from),
                            style: {
                              fontSize: "0.68rem",
                              padding: "2px 8px",
                              color: "var(--danger)",
                              flexShrink: 0,
                            },
                            children: S.st_urlSubsRevoke,
                          }),
                        ],
                      },
                      M.from,
                    ),
                  ),
                }),
          ],
        }),
      }),
      l.jsx(wt, {
        title: S.st_tree,
        children: l.jsxs("div", {
          style: { padding: "12px 14px" },
          children: [
            l.jsx("p", {
              style: {
                margin: "0 0 6px",
                fontSize: "0.83rem",
                color: "var(--text-1)",
                fontWeight: 500,
              },
              children: "Virtual folder paths",
            }),
            l.jsxs("p", {
              style: {
                margin: "0 0 8px",
                fontSize: "0.72rem",
                color: "var(--text-3)",
                lineHeight: 1.5,
              },
              children: [
                "Enter one tag path per line. Use",
                " ",
                l.jsx("span", {
                  className: "mono",
                  style: { color: "var(--text-2)" },
                  children: "/",
                }),
                " ",
                "to nest folders, e.g.",
                " ",
                l.jsx("span", {
                  className: "mono",
                  style: { color: "var(--text-2)" },
                  children: "Finance/2024/Q1",
                }),
                ". These appear as ",
                l.jsx("em", { children: "italic" }),
                " ghost folders in the tag tree — useful for planning your structure without touching any documents.",
              ],
            }),
            l.jsx("textarea", {
              value: L,
              onChange: (M) => b(M.target.value),
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
            l.jsxs("div", {
              style: {
                display: "flex",
                justifyContent: "flex-end",
                marginTop: 8,
                gap: 6,
              },
              children: [
                d.length > 0 &&
                  l.jsx("button", {
                    className: "btn btn-ghost",
                    style: { fontSize: "0.75rem" },
                    onClick: () => {
                      (b(""), p([]));
                    },
                    children: "Clear",
                  }),
                l.jsx("button", {
                  className: "btn btn-primary",
                  style: { fontSize: "0.75rem" },
                  onClick: U,
                  children: A ? "✓ Saved" : "Apply",
                }),
              ],
            }),
            d.length > 0 &&
              l.jsxs("p", {
                style: {
                  margin: "6px 0 0",
                  fontSize: "0.68rem",
                  color: "var(--text-3)",
                },
                children: [
                  d.length,
                  " simulated path",
                  d.length !== 1 ? "s" : "",
                  " active. Switch to Tree → By tags in Documents to preview.",
                ],
              }),
          ],
        }),
      }),
      l.jsx(wt, {
        title: "Connection",
        children: l.jsxs("div", {
          style: { padding: "12px 14px" },
          children: [
            l.jsx("label", { className: "label", children: "API base URL" }),
            l.jsxs("div", {
              style: { display: "flex", gap: 7, marginTop: 4 },
              children: [
                l.jsx("input", {
                  className: "input",
                  value: C,
                  onChange: (M) => R(M.target.value),
                  placeholder: "https://192.168.1.188:7443/api",
                  style: {
                    flex: 1,
                    fontFamily: "JetBrains Mono, monospace",
                    fontSize: "0.75rem",
                  },
                }),
                l.jsx("button", {
                  className: "btn btn-primary",
                  onClick: V,
                  style: { flexShrink: 0, fontSize: "0.78rem" },
                  children: z ? "✓" : "Save",
                }),
              ],
            }),
            l.jsxs("p", {
              style: {
                margin: "5px 0 0",
                fontSize: "0.67rem",
                color: "var(--text-3)",
              },
              children: [
                "Auto-detected from",
                " ",
                l.jsxs("span", {
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
      l.jsxs(wt, {
        title: S.st_encryption,
        children: [
          l.jsx(fn, {
            label: S.st_clientDecrypt,
            sub: S.st_clientDecryptSub,
            children: l.jsx(vx, { value: m, onChange: w }),
          }),
          l.jsxs("div", {
            style: { padding: "10px 14px" },
            children: [
              l.jsx("p", {
                style: {
                  margin: "0 0 5px",
                  fontSize: "0.78rem",
                  color: "var(--text-2)",
                  fontWeight: 500,
                },
                children: S.st_encStatus,
              }),
              l.jsx("div", {
                className: "mono",
                style: {
                  padding: "7px 9px",
                  background: "var(--bg-raised)",
                  borderRadius: 6,
                  fontSize: "0.68rem",
                  border: "1px solid var(--border)",
                  color: f ? "var(--success)" : "var(--text-3)",
                  wordBreak: "break-all",
                },
                children: f ? S.st_encUnlocked : S.st_encLocked,
              }),
            ],
          }),
        ],
      }),
      l.jsx(wt, {
        title: S.st_account,
        children: l.jsx(fn, {
          label: S.st_signedInAs,
          last: !0,
          children: l.jsx("span", {
            className: "mono",
            style: { fontSize: "0.8rem", color: "var(--accent)" },
            children: h ?? "—",
          }),
        }),
      }),
      l.jsxs(wt, {
        title: S.st_about,
        children: [
          l.jsx(fn, {
            label: "rain·dms",
            sub: S.st_aboutSub,
            children: l.jsx("span", {
              style: { fontSize: "0.72rem", color: "var(--text-3)" },
              children: "v1.0.0",
            }),
          }),
          l.jsx(fn, {
            label: S.st_source,
            last: !0,
            children: l.jsx("a", {
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
function yx(e) {
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
function El(e) {
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
function Bi(e) {
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
function Sx(e) {
  if (!e) return "";
  const t = new Date(e);
  if (Number.isNaN(t.getTime())) return "";
  const n = (r) => String(r).padStart(2, "0");
  return `${t.getFullYear()}-${n(t.getMonth() + 1)}-${n(t.getDate())}T${n(t.getHours())}:${n(t.getMinutes())}`;
}
function Tc(e, t) {
  if (!e || !t) return null;
  const n = new Date(e).getTime(),
    r = new Date(t).getTime();
  if (Number.isNaN(n) || Number.isNaN(r)) return null;
  const i = r - n;
  return i < 0
    ? null
    : i < 1e3
      ? `${i}ms`
      : i < 6e4
        ? `${(i / 1e3).toFixed(1)}s`
        : i < 36e5
          ? `${Math.floor(i / 6e4)}m ${Math.round((i % 6e4) / 1e3)}s`
          : `${Math.floor(i / 36e5)}h ${Math.floor((i % 36e5) / 6e4)}m`;
}
function jp(e) {
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
function _x(e) {
  return e.filter((t) => jp([t]) > 0).length;
}
function wx() {
  var P;
  const e = pe(),
    [t] = Jo(),
    n = pt(),
    r = t.get("filepath") ?? "",
    [i, o] = v.useState(null),
    [s, a] = v.useState(!0),
    [u, c] = v.useState(null),
    [d, p] = v.useState(""),
    [g, k] = v.useState(""),
    { markers: x, reminder: _, setMarkers: S, setReminder: h } = hp(r || null);
  (v.useEffect(() => {
    r &&
      (a(!0),
      c(null),
      Promise.all([up(r), ap(r)])
        .then(([L, b]) => {
          o({
            doc: L,
            pageCount: b.pages.length,
            totalBoxes: jp(b.pages),
            pagesWithOcr: _x(b.pages),
          });
        })
        .catch((L) => c(L.message))
        .finally(() => a(!1)));
  }, [r]),
    v.useEffect(() => {
      (p(Sx(_.at)), k(_.note ?? ""));
    }, [_.at, _.note]));
  function f() {
    const L = d && d.length > 0 ? new Date(d).toISOString() : null;
    h({ at: L, note: g || null, done_at: _.done_at });
  }
  function m() {
    h({ at: _.at, note: _.note, done_at: new Date().toISOString() });
  }
  function w(L) {
    S((b) => b.filter((A) => A.box_key !== L.box_key));
  }
  function C() {
    (typeof window < "u" && !window.confirm(e.fs_removeAllConfirm)) || S([]);
  }
  if (!r)
    return l.jsxs("div", {
      style: { padding: 24 },
      children: [
        l.jsx("p", {
          style: { color: "var(--danger)" },
          children: e.fs_missing,
        }),
        l.jsx("button", {
          className: "btn btn-ghost",
          onClick: () => n(-1),
          children: e.fs_back,
        }),
      ],
    });
  const R = yx(r),
    z = i == null ? void 0 : i.doc;
  return l.jsxs("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      height: "100%",
      overflow: "hidden",
    },
    children: [
      l.jsxs("div", {
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
          l.jsx("button", {
            className: "btn btn-ghost",
            onClick: () => n(-1),
            style: { padding: "3px 8px", fontSize: "0.78rem" },
            children: e.fs_back,
          }),
          l.jsx("button", {
            className: "btn btn-ghost",
            onClick: () => n(`/document?filepath=${encodeURIComponent(r)}`),
            style: { padding: "3px 8px", fontSize: "0.78rem" },
            children: e.fs_open,
          }),
          l.jsxs("div", {
            style: { flex: 1, minWidth: 0, overflow: "hidden" },
            children: [
              l.jsx("p", {
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
                title: r,
                children: R,
              }),
              l.jsx("p", {
                style: {
                  margin: 0,
                  fontSize: "0.64rem",
                  color: "var(--text-3)",
                  fontFamily: "JetBrains Mono, monospace",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                },
                title: r,
                children: r,
              }),
            ],
          }),
        ],
      }),
      l.jsxs("div", {
        style: { flex: 1, overflowY: "auto", padding: "18px 22px" },
        children: [
          s &&
            !i &&
            l.jsx("p", {
              style: { color: "var(--text-3)" },
              children: e.fs_loading,
            }),
          u &&
            l.jsx("p", {
              style: {
                color: "var(--danger)",
                padding: "8px 12px",
                background: "rgba(248,113,113,0.07)",
                border: "1px solid rgba(248,113,113,0.2)",
                borderRadius: 6,
                fontSize: "0.8rem",
                marginBottom: 14,
              },
              children: u,
            }),
          i &&
            l.jsxs(l.Fragment, {
              children: [
                l.jsxs("div", {
                  style: {
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                    gap: 10,
                    marginBottom: 18,
                  },
                  children: [
                    l.jsx(Cr, {
                      label: e.fs_pages,
                      value: String(i.pageCount),
                    }),
                    l.jsx(Cr, {
                      label: e.fs_ocrBoxes,
                      value: i.totalBoxes.toLocaleString(),
                    }),
                    l.jsx(Cr, {
                      label: e.fs_markers,
                      value: String(x.length),
                      accent: x.length > 0,
                    }),
                    l.jsx(Cr, {
                      label: e.fs_tags,
                      value: String(
                        ((P = z == null ? void 0 : z.assigned_tags) == null
                          ? void 0
                          : P.length) ?? 0,
                      ),
                    }),
                    l.jsx(Cr, {
                      label: e.fs_encrypted,
                      value:
                        z != null && z.encrypted_file_key ? e.fs_yes : e.fs_no,
                    }),
                  ],
                }),
                l.jsxs(zl, {
                  title: e.fs_timeline,
                  children: [
                    l.jsx(Mn, {
                      label: e.fs_created,
                      value: El(z == null ? void 0 : z.created_at),
                      hint: Bi(z == null ? void 0 : z.created_at),
                    }),
                    (z == null ? void 0 : z.spawned_time) &&
                      l.jsx(Mn, {
                        label: e.fs_pipelineAt,
                        value: El(z.spawned_time),
                        hint: Tc(
                          z.spawned_time,
                          z == null ? void 0 : z.created_at,
                        )
                          ? `${Bi(z.spawned_time)} · ${Tc(z.spawned_time, z == null ? void 0 : z.created_at)}`
                          : Bi(z.spawned_time),
                      }),
                    l.jsx(Mn, {
                      label: e.fs_ocrPages,
                      value: `${i.pagesWithOcr} / ${i.pageCount}`,
                      hint:
                        i.pageCount > 0
                          ? `${Math.round((i.pagesWithOcr / i.pageCount) * 100)}%`
                          : void 0,
                    }),
                    l.jsx(Mn, {
                      label: e.fs_fileId,
                      value:
                        (z == null ? void 0 : z.file_id) != null
                          ? String(z.file_id)
                          : "—",
                    }),
                    l.jsx(Mn, {
                      label: e.fs_path,
                      value: l.jsxs("button", {
                        onClick: () => {
                          var L;
                          r &&
                            ((L = navigator.clipboard) == null ||
                              L.writeText(r).catch(() => {}),
                            or(e.toast_success, r));
                        },
                        title: r,
                        style: {
                          background: "none",
                          border: "none",
                          padding: 0,
                          cursor: "pointer",
                          color: "var(--text-2)",
                          fontFamily: "JetBrains Mono, monospace",
                          fontSize: "0.72rem",
                          textAlign: "left",
                          maxWidth: 340,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          display: "block",
                        },
                        children: [r, " ⧉"],
                      }),
                    }),
                    (z == null ? void 0 : z.assigned_tags) &&
                      z.assigned_tags.length > 0 &&
                      l.jsx(Mn, {
                        label: e.fs_tags,
                        value: l.jsx("div", {
                          style: { display: "flex", flexWrap: "wrap", gap: 4 },
                          children: z.assigned_tags.map((L) =>
                            l.jsx("span", { className: "tag", children: L }, L),
                          ),
                        }),
                      }),
                  ],
                }),
                l.jsxs(zl, {
                  title: e.fs_reminder,
                  right:
                    _.at && !_.done_at
                      ? l.jsx("span", {
                          style: {
                            color: "var(--accent)",
                            fontSize: "0.7rem",
                            fontWeight: 600,
                          },
                          children: e.fs_active,
                        })
                      : _.done_at
                        ? l.jsx("span", {
                            style: {
                              color: "var(--success)",
                              fontSize: "0.7rem",
                              fontWeight: 600,
                            },
                            children: e.fs_done,
                          })
                        : l.jsx("span", {
                            style: {
                              color: "var(--text-3)",
                              fontSize: "0.7rem",
                            },
                            children: e.fs_no,
                          }),
                  children: [
                    l.jsxs("div", {
                      style: {
                        display: "flex",
                        gap: 8,
                        alignItems: "center",
                        flexWrap: "wrap",
                      },
                      children: [
                        l.jsx("input", {
                          type: "datetime-local",
                          className: "input",
                          value: d,
                          onChange: (L) => p(L.target.value),
                          style: { width: 230, fontSize: "0.78rem" },
                        }),
                        l.jsx("input", {
                          type: "text",
                          className: "input",
                          placeholder: e.fs_reminderNote,
                          value: g,
                          onChange: (L) => k(L.target.value),
                          style: {
                            flex: 1,
                            minWidth: 200,
                            fontSize: "0.78rem",
                          },
                        }),
                        l.jsx("button", {
                          className: "btn btn-primary",
                          onClick: f,
                          style: { fontSize: "0.78rem" },
                          children: e.fs_saveReminder,
                        }),
                        l.jsx("button", {
                          className: "btn btn-ghost",
                          onClick: m,
                          disabled: !_.at,
                          style: { fontSize: "0.78rem" },
                          children: e.fs_markDone,
                        }),
                        l.jsx("button", {
                          className: "btn btn-ghost",
                          onClick: () => h(null),
                          disabled: !_.at && !_.note,
                          style: { fontSize: "0.78rem" },
                          children: e.st_clear,
                        }),
                      ],
                    }),
                    _.at &&
                      l.jsxs("p", {
                        style: {
                          margin: "8px 0 0",
                          fontSize: "0.7rem",
                          color: "var(--text-3)",
                        },
                        children: [
                          El(_.at),
                          _.done_at &&
                            l.jsxs(l.Fragment, {
                              children: [
                                " · ",
                                e.fs_done.toLowerCase(),
                                " ",
                                Bi(_.done_at),
                              ],
                            }),
                        ],
                      }),
                    l.jsx("p", {
                      style: {
                        margin: "6px 0 0",
                        fontSize: "0.65rem",
                        color: "var(--text-3)",
                      },
                      children: e.fs_reminderHint,
                    }),
                  ],
                }),
                l.jsx(zl, {
                  title: e.fs_markersTitle(x.length),
                  right:
                    x.length > 0
                      ? l.jsx("button", {
                          className: "btn btn-ghost",
                          onClick: C,
                          style: { fontSize: "0.7rem", padding: "3px 8px" },
                          children: e.fs_removeAll,
                        })
                      : void 0,
                  children:
                    x.length === 0
                      ? l.jsx("p", {
                          style: {
                            margin: 0,
                            fontSize: "0.78rem",
                            color: "var(--text-3)",
                          },
                          children: e.fs_noMarkers,
                        })
                      : l.jsx("div", {
                          style: {
                            display: "grid",
                            gridTemplateColumns:
                              "repeat(auto-fill, minmax(220px, 1fr))",
                            gap: 10,
                          },
                          children: x.map((L) =>
                            l.jsxs(
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
                                  l.jsxs("div", {
                                    style: {
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 6,
                                    },
                                    children: [
                                      l.jsx("span", {
                                        style: {
                                          fontSize: "0.6rem",
                                          padding: "1px 5px",
                                          borderRadius: 3,
                                          background:
                                            L.kind === "drawn"
                                              ? "var(--warn)"
                                              : "var(--accent-glow)",
                                          color:
                                            L.kind === "drawn"
                                              ? "var(--bg-base)"
                                              : "var(--accent)",
                                          fontFamily:
                                            "JetBrains Mono, monospace",
                                          fontWeight: 600,
                                          textTransform: "uppercase",
                                        },
                                        children:
                                          L.kind === "drawn"
                                            ? e.fs_drawn
                                            : e.fs_ocr,
                                      }),
                                      l.jsx("span", {
                                        style: {
                                          fontSize: "0.7rem",
                                          color: "var(--text-2)",
                                          fontFamily:
                                            "JetBrains Mono, monospace",
                                        },
                                        children: e.fs_pageN(L.page_idx + 1),
                                      }),
                                    ],
                                  }),
                                  L.note &&
                                    l.jsx("p", {
                                      style: {
                                        margin: 0,
                                        fontSize: "0.74rem",
                                        color: "var(--text-1)",
                                        lineHeight: 1.4,
                                        wordBreak: "break-word",
                                      },
                                      children: L.note,
                                    }),
                                  l.jsx("p", {
                                    style: {
                                      margin: 0,
                                      fontSize: "0.62rem",
                                      color: "var(--text-3)",
                                      fontFamily: "JetBrains Mono, monospace",
                                    },
                                    children: e.fs_xy(L.x, L.y, L.w, L.h),
                                  }),
                                  l.jsxs("div", {
                                    style: {
                                      display: "flex",
                                      gap: 6,
                                      marginTop: 2,
                                    },
                                    children: [
                                      l.jsx("button", {
                                        className: "btn btn-ghost",
                                        onClick: () =>
                                          (window.location.href = `/document?filepath=${encodeURIComponent(r)}&page=${L.page_idx}`),
                                        style: {
                                          fontSize: "0.7rem",
                                          padding: "3px 8px",
                                          flex: 1,
                                        },
                                        children: e.fs_openBtn,
                                      }),
                                      l.jsx("button", {
                                        className: "btn btn-danger",
                                        onClick: () => w(L),
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
                              L.box_key,
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
function Cr({ label: e, value: t, accent: n }) {
  return l.jsxs("div", {
    className: "card",
    style: { padding: "11px 13px", borderColor: n ? "var(--accent)" : void 0 },
    children: [
      l.jsx("div", {
        style: {
          fontSize: "0.62rem",
          fontWeight: 600,
          letterSpacing: "0.07em",
          textTransform: "uppercase",
          color: "var(--text-3)",
        },
        children: e,
      }),
      l.jsx("div", {
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
function zl({ title: e, children: t, right: n }) {
  return l.jsxs("div", {
    className: "card",
    style: { padding: "14px 16px", marginBottom: 14 },
    children: [
      l.jsxs("div", {
        style: {
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 10,
        },
        children: [
          l.jsx("h3", {
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
function Mn({ label: e, value: t, hint: n }) {
  return l.jsxs("div", {
    style: {
      display: "flex",
      alignItems: "baseline",
      padding: "5px 0",
      borderTop: "1px solid var(--border-soft)",
      gap: 12,
    },
    children: [
      l.jsx("div", {
        style: {
          width: 130,
          flexShrink: 0,
          fontSize: "0.7rem",
          color: "var(--text-3)",
        },
        children: e,
      }),
      l.jsx("div", {
        style: {
          flex: 1,
          minWidth: 0,
          fontSize: "0.78rem",
          color: "var(--text-1)",
        },
        children: t,
      }),
      n &&
        l.jsx("div", {
          style: { fontSize: "0.68rem", color: "var(--text-3)", flexShrink: 0 },
          children: n,
        }),
    ],
  });
}
function kx({ children: e }) {
  return Ae((n) => n.token)
    ? l.jsx(l.Fragment, { children: e })
    : l.jsx(np, { to: "/login", replace: !0 });
}
function jx() {
  return l.jsx(n0, {
    children: l.jsxs(Jm, {
      children: [
        l.jsx(gt, { path: "/login", element: l.jsx(mv, {}) }),
        l.jsxs(gt, {
          path: "/",
          element: l.jsx(kx, { children: l.jsx(tv, {}) }),
          children: [
            l.jsx(gt, { index: !0, element: l.jsx(ex, {}) }),
            l.jsx(gt, { path: "search", element: l.jsx(lx, {}) }),
            l.jsx(gt, { path: "document", element: l.jsx(dx, {}) }),
            l.jsx(gt, { path: "file-stats", element: l.jsx(wx, {}) }),
            l.jsx(gt, { path: "stats", element: l.jsx(mx, {}) }),
            l.jsx(gt, { path: "settings", element: l.jsx(xx, {}) }),
          ],
        }),
        l.jsx(gt, { path: "*", element: l.jsx(np, { to: "/", replace: !0 }) }),
      ],
    }),
  });
}
const bx = K.getState().theme;
bx === "light"
  ? document.documentElement.classList.add("light")
  : document.documentElement.classList.remove("light");
Vf(document.getElementById("root")).render(
  l.jsx(v.StrictMode, { children: l.jsx(jx, {}) }),
);
