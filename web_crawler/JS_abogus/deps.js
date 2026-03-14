export function ir(t) {
  return ir = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (t) {
    return typeof t;
  } : function (t) {
    return t && "function" == typeof Symbol && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, ir(t);
}

export function sr(t) {
  var r = function (t, r) {
    if ("object" != ir(t) || !t) return t;
    var e = t[Symbol.toPrimitive];
    if (void 0 !== e) {
      var n = e.call(t, r || "default");
      if ("object" != ir(n)) return n;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return ("string" === r ? String : Number)(t);
  }(t, "string");
  return "symbol" == ir(r) ? r : r + "";
}

export function ur(t, r) {
  for (var e = 0; e < r.length; e++) {
    var n = r[e];
    n.enumerable = n.enumerable || !1, n.configurable = !0, "value" in n && (n.writable = !0), Object.defineProperty(t, sr(n.key), n);
  }
}

function dr(t, r) {
  return (t << (r %= 32) | t >>> 32 - r) >>> 0;
}
function yr(t) {
  return 0 <= t && t < 16 ? 2043430169 : 16 <= t && t < 64 ? 2055708042 : void console.error("invalid j for constant Tj");
}
function br(t, r, e, n) {
  return 0 <= t && t < 16 ? (r ^ e ^ n) >>> 0 : 16 <= t && t < 64 ? (r & e | r & n | e & n) >>> 0 : (console.error("invalid j for bool function FF"), 0);
}
function mr(t, r, e, n) {
  return 0 <= t && t < 16 ? (r ^ e ^ n) >>> 0 : 16 <= t && t < 64 ? (r & e | ~r & n) >>> 0 : (console.error("invalid j for bool function GG"), 0);
}
function wr(t) {
  return wr = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (t) {
    return typeof t;
  } : function (t) {
    return t && "function" == typeof Symbol && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, wr(t);
}

export const SM3 = function () {
  function t() {
    if (function (t, r) {
      if (!(t instanceof r)) throw new TypeError("Cannot call a class as a function");
    }(this, t), !(this instanceof t)) return new t();
    this.reg = new Array(8), this.chunk = [], this.size = 0, this.reset();
  }
  return function (t, r, e) {
    r && ur(t.prototype, r), e && ur(t, e), Object.defineProperty(t, "prototype", {
      writable: !1
    });
  }(t, [{
    key: "reset",
    value: function () {
      this.reg[0] = 1937774191, this.reg[1] = 1226093241, this.reg[2] = 388252375, this.reg[3] = 3666478592, this.reg[4] = 2842636476, this.reg[5] = 372324522, this.reg[6] = 3817729613, this.reg[7] = 2969243214, this.chunk = [], this.size = 0;
    }
  }, {
    key: "write",
    value: function (t) {
      var r = "string" == typeof t ? function (t) {
        var r = encodeURIComponent(t).replace(/%([0-9A-F]{2})/g, function (t, r) {
            return String.fromCharCode("0x" + r);
          }),
          e = new Array(r.length);
        return Array.prototype.forEach.call(r, function (t, r) {
          e[r] = t.charCodeAt(0);
        }), e;
      }(t) : t;
      this.size += r.length;
      var e = 64 - this.chunk.length;
      if (r.length < e) this.chunk = this.chunk.concat(r);else for (this.chunk = this.chunk.concat(r.slice(0, e)); this.chunk.length >= 64;) this._compress(this.chunk), e < r.length ? this.chunk = r.slice(e, Math.min(e + 64, r.length)) : this.chunk = [], e += 64;
    }
  }, {
    key: "sum",
    value: function (t, r) {
      t && (this.reset(), this.write(t)), this._fill();
      for (var e = 0; e < this.chunk.length; e += 64) this._compress(this.chunk.slice(e, e + 64));
      var n,
        o,
        i,
        u = null;
      if ("hex" == r) {
        u = "";
        for (e = 0; e < 8; e++) u += (n = this.reg[e].toString(16), o = 8, i = "0", n.length >= o ? n : i.repeat(o - n.length) + n);
      } else for (u = new Array(32), e = 0; e < 8; e++) {
        var s = this.reg[e];
        u[4 * e + 3] = (255 & s) >>> 0, s >>>= 8, u[4 * e + 2] = (255 & s) >>> 0, s >>>= 8, u[4 * e + 1] = (255 & s) >>> 0, s >>>= 8, u[4 * e] = (255 & s) >>> 0;
      }
      return this.reset(), u;
    }
  }, {
    key: "_compress",
    value: function (t) {
      if (t < 64) console.error("compress error: not enough data");else {
        for (var r = function (t) {
          for (var r = new Array(132), e = 0; e < 16; e++) r[e] = t[4 * e] << 24, r[e] |= t[4 * e + 1] << 16, r[e] |= t[4 * e + 2] << 8, r[e] |= t[4 * e + 3], r[e] >>>= 0;
          for (var n = 16; n < 68; n++) {
            var o = r[n - 16] ^ r[n - 9] ^ dr(r[n - 3], 15);
            o = o ^ dr(o, 15) ^ dr(o, 23), r[n] = (o ^ dr(r[n - 13], 7) ^ r[n - 6]) >>> 0;
          }
          for (n = 0; n < 64; n++) r[n + 68] = (r[n] ^ r[n + 4]) >>> 0;
          return r;
        }(t), e = this.reg.slice(0), n = 0; n < 64; n++) {
          var o = dr(e[0], 12) + e[4] + dr(yr(n), n),
            i = ((o = dr(o = (4294967295 & o) >>> 0, 7)) ^ dr(e[0], 12)) >>> 0,
            u = br(n, e[0], e[1], e[2]);
          u = (4294967295 & (u = u + e[3] + i + r[n + 68])) >>> 0;
          var s = mr(n, e[4], e[5], e[6]);
          s = (4294967295 & (s = s + e[7] + o + r[n])) >>> 0, e[3] = e[2], e[2] = dr(e[1], 9), e[1] = e[0], e[0] = u, e[7] = e[6], e[6] = dr(e[5], 19), e[5] = e[4], e[4] = (s ^ dr(s, 9) ^ dr(s, 17)) >>> 0;
        }
        for (var c = 0; c < 8; c++) this.reg[c] = (this.reg[c] ^ e[c]) >>> 0;
      }
    }
  }, {
    key: "_fill",
    value: function () {
      var t = 8 * this.size,
        r = this.chunk.push(128) % 64;
      for (64 - r < 8 && (r -= 64); r < 56; r++) this.chunk.push(0);
      for (var e = 0; e < 4; e++) {
        var n = Math.floor(t / 4294967296);
        this.chunk.push(n >>> 8 * (3 - e) & 255);
      }
      for (e = 0; e < 4; e++) this.chunk.push(t >>> 8 * (3 - e) & 255);
    }
  }]), t;
}()

export const RC4Like = function fn_280(a_0, a_1) {
  // BB: 0
  var v_0, v_1, v_2, v_3, v_4, v_5, v_6, v_7, v_8, v_9, v_10;
  v_0 = [];
  v_1 = 0;
  // BB: 20
  while (true) {
    // BB: 20
    if (!(v_1 < 256)) // BB: 48
      break;
    // BB: 28
    v_0[255 - v_1] = v_1;
    v_1 = v_1 + 1;
    // BB: 20
    continue;
  }
  // BB: 48
  v_2 = 0;
  v_3 = 0;
  // BB: 53
  while (true) {
    // BB: 53
    if (!(v_3 < 256)) // BB: 141
      break;
    // BB: 61
    v_10 = (v_2 * v_0[v_3] + v_2 + a_0.charCodeAt(v_3 % a_0.length)) % 256;
    v_8 = v_0[v_3];
    v_0[v_3] = v_0[v_10];
    v_0[v_10] = v_8;
    v_3 = v_3 + 1;
    v_2 = v_10;
    // BB: 53
    continue;
  }
  // BB: 141
  v_4 = 0;
  v_5 = 0;
  v_6 = 0;
  v_7 = '';
  // BB: 156
  while (true) {
    // BB: 156
    if (!(v_5 < a_1.length)) // BB: 287
      return v_7;
    // BB: 167
    v_8 = (v_4 + 1) % 256;
    v_9 = (v_6 + v_0[v_8]) % 256;
    v_10 = v_0[v_8];
    v_0[v_8] = v_0[v_9];
    v_0[v_9] = v_10;
    v_10 = String.fromCharCode(a_1.charCodeAt(v_5) ^ v_0[(v_0[v_8] + v_0[v_9]) % 256]);
    v_7 = v_7 + v_10;
    v_5 = v_5 + 1;
    v_4 = v_8;
    v_6 = v_9;
    // BB: 156
    continue;
  }
};

export const Base64Like = function fn_130(a_0, a_1) {
  // BB: 0
  var v_0, v_1, v_2, v_3, v_4, v_5, v_6, v_7;
  v_0 = {};
  v_0.s0 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
  v_0.s1 = 'Dkdpgh4ZKsQB80/Mfvw36XI1R25+WUAlEi7NLboqYTOPuzmFjJnryx9HVGcaStCe=';
  v_0.s2 = 'Dkdpgh4ZKsQB80/Mfvw36XI1R25-WUAlEi7NLboqYTOPuzmFjJnryx9HVGcaStCe=';
  v_0.s3 = 'ckdp1h4ZKsUB80/Mfvw36XIgR25+WQAlEi7NLboqYTOPuzmFjJnryx9HVGDaStCe';
  v_0.s4 = 'Dkdpgh2ZmsQB80/MfvV36XI1R45-WUAlEixNLwoqYTOPuzKFjJnry79HbGcaStCe';
  v_1 = v_0[a_1];
  v_0 = '';
  v_2 = 0;
  // BB: 64
  while (true) {
    // BB: 64
    if (!(a_0.length >= v_2 + 3)) // BB: 237
      break;
    // BB: 78
    v_5 = v_2 + 1;
    v_4 = v_5 + 1;
    v_7 = (a_0.charCodeAt(v_2) & 255) << 16 | (a_0.charCodeAt(v_5) & 255) << 8;
    v_2 = v_4 + 1;
    v_5 = v_7 | a_0.charCodeAt(v_4) & 255;
    v_7 = v_0 + v_1.charAt((v_5 & 16515072) >> 18) + v_1.charAt((v_5 & 258048) >> 12);
    v_0 = v_7 + v_1.charAt((v_5 & 4032) >> 6) + v_1.charAt(v_5 & 63);
    // BB: 64
    continue;
  }
  // BB: 237
  if (a_0.length - v_2 > 0) {
    // BB: 251
    v_4 = v_2 + 1;
    v_5 = (a_0.charCodeAt(v_2) & 255) << 16 | (a_0.length > v_4 ? (a_0.charCodeAt(v_4) & 255) << 8 : 0);
    v_6 = v_0 + v_1.charAt((v_5 & 16515072) >> 18) + v_1.charAt((v_5 & 258048) >> 12);
    v_7 = a_0.length > v_4 ? v_1.charAt((v_5 & 4032) >> 6) : '=';
    v_3 = v_6 + v_7 + '=';
  } else {
    // BB: 237_to_411_split1
    v_3 = v_0;
  }
  // BB: 411
  return v_3;
};

export const m_728 = function fn_142(a_0, a_1, a_2) {
  // BB: 0
  var v_0;
  v_0 = new Array(3);
  v_0['0'] = a_0 / 256;
  v_0['1'] = a_0 % 256;
  v_0['2'] = a_1 % 256;
  return RC4Like(String.fromCharCode.apply(null, v_0), a_2.trim());
}

export function nr() {
  return [0, 0, 0, 0, 129];
}

export const m_731 = function fn_140(a_0) {
  // BB: 0
  var v_0, m_711, m_710;
  m_711 = a_0;
  m_710 = '';
  v_0 = function fn_141(a_0, a_1) {
    // BB: 0
    if (a_1 === 0) {
      // BB: 8
      m_710 = m_710 + m_711[a_0];
    } else {
      // BB: 26
      m_710 = m_710 + '|'.concat(m_711[a_0]);
    }
  };
  Object.keys(m_711).forEach(v_0)
  return m_710;
};

export const m_732 = function fn_139(a_0) {
  // BB: 0
  var v_0, v_1, v_2, v_3, v_4;
  v_0 = [];
  v_1 = 0;
  // BB: 10
  while (true) {
    // BB: 10
    if (!(v_1 < a_0.length)) // BB: 94
      return v_0;
    // BB: 21
    v_2 = a_0.charCodeAt(v_1);
    if (v_2 & 65280) {
      // BB: 43
      v_4 = v_0.push;
      v_3 = new Array(1);
      v_3[0] = v_2 >> 8;
      v_4.apply(v_0, v_3)
      v_3 = v_0.push;
      v_4 = new Array(1);
      v_4[0] = v_2 & 255;
      v_3.apply(v_0, v_4)
    } else {
      // BB: 75
      v_3 = v_0.push;
      v_4 = new Array(1);
      v_4[0] = v_2;
      v_3.apply(v_0, v_4)
    }
    // BB: 87
    v_1 = v_1 + 1;
    // BB: 10
    continue;
  }
};

export const m_716 = function fn_144() {
  // BB: 0
  var v_0;
  if (nr()['4'] & 64) {
    // BB: 13
    v_0 = Math.random() * 109 >> 0;
    return v_0 + 110 + v_0 % 2;
  }
  // BB: 45
  v_0 = Math.random() * 240 >> 0;
  if (v_0 > 109) // BB: 69
    return v_0 + v_0 % 2 + 1;
  // BB: 85
  return v_0;
};

export const m_717 = function fn_145() {
  return 179; // Mock
};

export const m_715 = function fn_143() {
  return "Chrome"; // Mock
}

export const m_718 = function fn_146(a_0) {
  // BB: 0
  var v_0, v_1, v_2, v_3;
  v_0 = arguments.length > 1 && arguments['1'] !== undefined ? arguments['1'] : 0;
  v_1 = Math.random() * 65535;
  if (v_0 === 2) {
    // BB: 100
    v_2 = m_716();
    v_3 = m_717();
  } else {
    // BB: 92_to_118_split3
    v_2 = v_1 & 255;
    v_3 = v_0 === 1 ? m_715() : v_1 >> 8 & 255;
  }
  // BB: 118
  v_1 = new Array(4);
  v_1[0] = v_2 & 170 | a_0['0'] & 85;
  v_1[1] = v_2 & 85 | a_0['0'] & 170;
  v_1[2] = v_3 & 170 | a_0['1'] & 85;
  v_1[3] = v_3 & 85 | a_0['1'] & 170;
  return v_1;
};

export const m_733 = function fn_147(a_0) {
  // BB: 0
  var v_0, v_1, v_2, v_3, v_4, v_5, v_6, v_7, v_8;
  v_0 = m_718;
  v_1 = a_0['0'];
  v_2 = a_0['1'];
  v_3 = new Array(2);
  v_3[0] = v_1;
  v_3[1] = v_2;
  v_1 = v_0(v_3);
  v_3 = m_718;
  v_0 = a_0['2'];
  v_2 = a_0['3'];
  v_4 = new Array(2);
  v_4[0] = v_0;
  v_4[1] = v_2;
  v_0 = v_3(v_4, 2);
  v_4 = v_1['0'];
  v_3 = v_1['1'];
  v_2 = v_1['2'];
  v_5 = v_1['3'];
  v_1 = v_0['0'];
  v_6 = v_0['1'];
  v_7 = v_0['2'];
  v_8 = v_0['3'];
  v_0 = new Array(8);
  v_0[0] = v_4;
  v_0[1] = v_3;
  v_0[2] = v_2;
  v_0[3] = v_5;
  v_0[4] = v_1;
  v_0[5] = v_6;
  v_0[6] = v_7;
  v_0[7] = v_8;
  return v_0;
};

export const qt = Base64Like;

export const m_734 = function fn_133(a_0) {
  // BB: 0
  m_706(a_0)
  return m_705(a_0) && m_705(a_0) || m_707(a_0) || m_708();
};

export const m_706 = function fn_136(a_0) {
  // BB: 0
  var v_0;
  v_0 = 'undefined' != typeof Symbol && null != a_0[Symbol.iterator] || null != a_0['@@iterator'];
  if (v_0) // BB: 28
    return Array.from(a_0);
};

export const m_705 = function fn_137(a_0) {
  // BB: 0
  if (Array.isArray(a_0)) // BB: 12
    return m_709(a_0);
};

export const m_709 = function fn_138(a_0, a_1) {
  // BB: 0
  var v_0, v_1, v_2;
  v_0 = null == a_1 || a_1 > a_0.length ? a_0.length : a_1;
  v_1 = Array(v_0);
  v_2 = 0;
  // BB: 44
  while (true) {
    // BB: 44
    if (!(v_2 < v_0)) // BB: 74
      return v_1;
    // BB: 53
    v_1[v_2] = a_0[v_2];
    v_2 = v_2 + 1;
    // BB: 44
    continue;
  }
};

export const m_707 = function fn_135(a_0, a_1) {
  // BB: 0
  var v_0, v_1;
  if (!a_0) // BB: 148
    return;
  // BB: 5
  if ('string' == typeof a_0) // BB: 14
    return m_709(a_0, a_1);
  // BB: 27
  v_0 = {}.toString.call(a_0).slice(8, -1);
  v_1 = 'Object' === v_0 && a_0.constructor ? a_0.constructor.name : v_0;
  if ('Map' === v_1 || 'Set' === v_1) {
    // BB: 94
    v_0 = Array.from(a_0);
  } else {
    // BB: 106
    if ('Arguments' === v_1 || new RegExp('^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$').test(v_1)) {
      // BB: 130
      v_0 = m_709(a_0, a_1);
    } else {
      // BB: 144
      v_0 = undefined;
    }
  }
  // BB: 147
  return v_0;
};

export const m_708 = function fn_134() {
  // BB: 0
  throw new TypeError('Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.');
};

export const Ht = function fn_280(a_0, a_1) {
  // BB: 0
  var v_0, v_1, v_2, v_3, v_4, v_5, v_6, v_7, v_8, v_9, v_10;
  v_0 = [];
  v_1 = 0;
  // BB: 20
  while (true) {
    // BB: 20
    if (!(v_1 < 256)) // BB: 48
      break;
    // BB: 28
    v_0[255 - v_1] = v_1;
    v_1 = v_1 + 1;
    // BB: 20
    continue;
  }
  // BB: 48
  v_2 = 0;
  v_3 = 0;
  // BB: 53
  while (true) {
    // BB: 53
    if (!(v_3 < 256)) // BB: 141
      break;
    // BB: 61
    v_10 = (v_2 * v_0[v_3] + v_2 + a_0.charCodeAt(v_3 % a_0.length)) % 256;
    v_8 = v_0[v_3];
    v_0[v_3] = v_0[v_10];
    v_0[v_10] = v_8;
    v_3 = v_3 + 1;
    v_2 = v_10;
    // BB: 53
    continue;
  }
  // BB: 141
  v_4 = 0;
  v_5 = 0;
  v_6 = 0;
  v_7 = '';
  // BB: 156
  while (true) {
    // BB: 156
    if (!(v_5 < a_1.length)) // BB: 287
      return v_7;
    // BB: 167
    v_8 = (v_4 + 1) % 256;
    v_9 = (v_6 + v_0[v_8]) % 256;
    v_10 = v_0[v_8];
    v_0[v_8] = v_0[v_9];
    v_0[v_9] = v_10;
    v_10 = String.fromCharCode(a_1.charCodeAt(v_5) ^ v_0[(v_0[v_8] + v_0[v_9]) % 256]);
    v_7 = v_7 + v_10;
    v_5 = v_5 + 1;
    v_4 = v_8;
    v_6 = v_9;
    // BB: 156
    continue;
  }
};

export const m_735 = function fn_148(a_0) {
  // BB: 0
  var v_0, v_1, v_2, v_3, v_4, v_5;
  v_0 = [];
  v_1 = 0;
  // BB: 40
  while (true) {
    // BB: 40
    if (!(v_1 < a_0.length)) // BB: 280
      return v_0;
    // BB: 51
    if (v_1 + 2 < a_0.length) {
      // BB: 65
      v_4 = Math.random() * 1000 & 255;
      v_2 = a_0[v_1] & 145 | a_0[v_1 + 1] & 66 | a_0[v_1 + 2] & 44;
      v_3 = v_0.push;
      v_5 = new Array(4);
      v_5[0] = v_4 & 145 | a_0[v_1] & 110;
      v_5[1] = v_4 & 66 | a_0[v_1 + 1] & 189;
      v_5[2] = v_4 & 44 | a_0[v_1 + 2] & 211;
      v_5[3] = v_2;
      v_3.apply(v_0, v_5)
    } else {
      // BB: 220
      v_2 = v_0.push;
      v_3 = a_0[v_1];
      v_4 = new Array(1);
      v_4[0] = v_3;
      v_2.apply(v_0, v_4)
      if (a_0[v_1 + 1]) {
        // BB: 248
        v_3 = v_0.push;
        v_4 = a_0[v_1 + 1];
        v_2 = new Array(1);
        v_2[0] = v_4;
        v_3.apply(v_0, v_2)
      }
    }
    // BB: 267
    v_1 = v_1 + 3;
    // BB: 40
    continue;
  }
};