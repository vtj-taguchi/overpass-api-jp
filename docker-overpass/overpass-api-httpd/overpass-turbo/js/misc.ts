/* ---
 * Base64 encode / decode
 * initial version fom http://www.webtoolkit.info/
 * modified to support more url friendly variant "base64url".
 * modified to include Base64 for decimal numbers.
 * modified to support native (= much faster) base64 encoders
 * ---
 * lzw_* taken from jsolait library (http://jsolait.net/), LGPL
 * slightly modified to support utf8 strings.
 * ---
 * Levenshtein Distance from iD editor project, WTFPL
 */
export const Base64 = {
  // private property
  _keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",

  // public method for encoding
  encode(input, not_base64url) {
    let output = "";
    //input = Base64._utf8_encode(input);
    input = unescape(encodeURIComponent(input));

    if (typeof window.btoa == "function") {
      output = window.btoa(input);
    } else {
      let chr1, chr2, chr3, enc1, enc2, enc3, enc4;
      let i = 0;

      while (i < input.length) {
        chr1 = input.charCodeAt(i++);
        chr2 = input.charCodeAt(i++);
        chr3 = input.charCodeAt(i++);

        enc1 = chr1 >> 2;
        enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
        enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
        enc4 = chr3 & 63;

        if (isNaN(chr2)) {
          enc3 = enc4 = 64;
        } else if (isNaN(chr3)) {
          enc4 = 64;
        }

        output =
          output +
          this._keyStr.charAt(enc1) +
          this._keyStr.charAt(enc2) +
          this._keyStr.charAt(enc3) +
          this._keyStr.charAt(enc4);
      }
    }

    if (!not_base64url) return this._convert_to_base64url(output);
    else return output;
  },

  // public method for decoding
  // this decodes base64url as well as standard base64 with or without padding)
  decode(input, binary) {
    let output = "";
    input = this._convert_to_base64nopad(input);
    input = input.replace(/[^A-Za-z0-9+/]/g, "");
    //reappend the padding
    input = input + "==".substring(0, (4 - (input.length % 4)) % 4);

    if (typeof window.btoa == "function") {
      output = window.atob(input);
    } else {
      let chr1, chr2, chr3;
      let enc1, enc2, enc3, enc4;
      let i = 0;

      while (i < input.length) {
        enc1 = this._keyStr.indexOf(input.charAt(i++));
        enc2 = this._keyStr.indexOf(input.charAt(i++));
        enc3 = this._keyStr.indexOf(input.charAt(i++));
        enc4 = this._keyStr.indexOf(input.charAt(i++));

        chr1 = (enc1 << 2) | (enc2 >> 4);
        chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
        chr3 = ((enc3 & 3) << 6) | enc4;

        output = output + String.fromCharCode(chr1);

        if (enc3 != 64) {
          output = output + String.fromCharCode(chr2);
        }
        if (enc4 != 64) {
          output = output + String.fromCharCode(chr3);
        }
      }
    }

    function str2ab(str) {
      const buf = new ArrayBuffer(str.length); // 1 byte for each char
      const bufView = new Uint8Array(buf);
      for (let i = 0, strLen = str.length; i < strLen; i++) {
        bufView[i] = str.charCodeAt(i);
      }
      return buf;
    }

    if (!binary) {
      // try to decode utf8 characters
      try {
        output = decodeURIComponent(escape(output));
      } catch (e) {}
    } else {
      // convert binary string to typed (Uint8) array
      output = str2ab(output);
    }
    return output;
  },

  encodeNum(num, not_base64url) {
    let output = "";
    if (num == 0) return this._keyStr.charAt(0);
    let neg = false;
    if (num < 0) {
      neg = true;
      num = Math.abs(num);
    }
    while (num > 0) {
      output = this._keyStr.charAt(num % 64) + output;
      num -= num % 64;
      num /= 64;
    }
    if (neg) output = `~${output}`;
    if (!not_base64url) return this._convert_to_base64url(output);
    else return output;
  },

  decodeNum(input) {
    input = this._convert_to_base64nopad(input);
    input = input.replace(/[^A-Za-z0-9+/.]/g, "");
    let num = 0;
    let neg = false;
    if (input.charAt(0) == ".") {
      neg = true;
      input = input.substr(1);
    }
    for (let i = 0; i < input.length; i++) {
      num +=
        this._keyStr.indexOf(input.charAt(input.length - 1 - i)) *
        Math.pow(64, i);
    }
    return (neg ? -1 : 1) * num;
  },

  _convert_to_base64url(input) {
    return input.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
  },
  _convert_to_base64nopad(input) {
    return input.replace(/-/g, "+").replace(/_/g, "/");
  },

  // private method for UTF-8 encoding
  _utf8_encode(string) {
    string = string.replace(/\r\n/g, "\n");
    let utftext = "";

    for (let n = 0; n < string.length; n++) {
      const c = string.charCodeAt(n);

      if (c < 128) {
        utftext += String.fromCharCode(c);
      } else if (c > 127 && c < 2048) {
        utftext += String.fromCharCode((c >> 6) | 192);
        utftext += String.fromCharCode((c & 63) | 128);
      } else {
        utftext += String.fromCharCode((c >> 12) | 224);
        utftext += String.fromCharCode(((c >> 6) & 63) | 128);
        utftext += String.fromCharCode((c & 63) | 128);
      }
    }

    return utftext;
  },

  // private method for UTF-8 decoding
  _utf8_decode(utftext) {
    let string = "";
    let i = 0;

    while (i < utftext.length) {
      const c = utftext.charCodeAt(i);

      if (c < 128) {
        string += String.fromCharCode(c);
        i++;
      } else if (c > 191 && c < 224) {
        const c2 = utftext.charCodeAt(i + 1);
        string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
        i += 2;
      } else {
        const c2 = utftext.charCodeAt(i + 1);
        const c3 = utftext.charCodeAt(i + 2);
        string += String.fromCharCode(
          ((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63)
        );
        i += 3;
      }
    }

    return string;
  }
};

// LZW-compress a string
export function lzw_encode(s) {
  //s = Base64._utf8_encode(s);
  s = unescape(encodeURIComponent(s));
  const dict = {};
  const data = `${s}`.split("");
  const out = [];
  let currChar;
  let phrase = data[0];
  let code = 256;
  for (let i = 1; i < data.length; i++) {
    currChar = data[i];
    if (dict[phrase + currChar] != null) {
      phrase += currChar;
    } else {
      out.push(phrase.length > 1 ? dict[phrase] : phrase.charCodeAt(0));
      dict[phrase + currChar] = code;
      code++;
      phrase = currChar;
    }
  }
  out.push(phrase.length > 1 ? dict[phrase] : phrase.charCodeAt(0));
  for (let i = 0; i < out.length; i++) {
    out[i] = String.fromCharCode(out[i]);
  }
  return out.join("");
}

// Decompress an LZW-encoded string
export function lzw_decode(s) {
  const dict = {};
  const data = `${s}`.split("");
  let currChar = data[0];
  let oldPhrase = currChar;
  const out = [currChar];
  let code = 256;
  let phrase;
  for (let i = 1; i < data.length; i++) {
    const currCode = data[i].charCodeAt(0);
    if (currCode < 256) {
      phrase = data[i];
    } else {
      phrase = dict[currCode] ? dict[currCode] : oldPhrase + currChar;
    }
    out.push(phrase);
    currChar = phrase.charAt(0);
    dict[code] = oldPhrase + currChar;
    code++;
    oldPhrase = phrase;
  }
  //return Base64._utf8_decode(out.join(""));
  return decodeURIComponent(escape(out.join("")));
}

// escape strings to show them directly in the html.
export function htmlentities(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// Levenshtein Distance
// from https://github.com/systemed/iD/blob/1e78ee5c87669aac407c69493f3f532c823346ef/js/id/util.js#L97-L115
export function levenshteinDistance(a, b) {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  const matrix = [];
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          Math.min(
            matrix[i][j - 1] + 1, // insertion
            matrix[i - 1][j] + 1
          )
        ); // deletion
      }
    }
  }
  return matrix[b.length][a.length];
}
