var OTP = (function () {
  function dec2hex(s) {
    return (s < 15.5 ? "0" : "") + Math.round(s).toString(16);
  }

  function hex2dec(s) {
    return parseInt(s, 16);
  }

  function leftpad(str, len, pad) {
    if (len + 1 >= str.length) {
      str = Array(len + 1 - str.length).join(pad) + str;
    }
    return str;
  }

  function base32tohex(base32) {
    var base32chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
    var bits = "";
    var hex = "";

    base32 = base32.replace(/=+$/, '');
    for (var i = 0; i < base32.length; i++) {
      var val = base32chars.indexOf(base32.charAt(i).toUpperCase());
      bits += leftpad(val.toString(2), 5, '0');
    }

    for (var i = 0; i + 4 <= bits.length; i += 4) {
      var chunk = bits.substr(i, 4);
      hex = hex + parseInt(chunk, 2).toString(16);
    }
    return hex;
  }

  function getTOTP(secret) {
    var epoch = Math.round(new Date().getTime() / 1000.0);
    var time = leftpad(dec2hex(Math.floor(epoch / 30)), 16, "0");

    var key = base32tohex(secret);
    var hmac = CryptoJS.HmacSHA1(
      CryptoJS.enc.Hex.parse(time),
      CryptoJS.enc.Hex.parse(key)
    );
    var hmacResult = hmac.toString();

    var offset = hex2dec(hmacResult.substring(hmacResult.length - 1));
    var otp = (hex2dec(hmacResult.substr(offset * 2, 8)) & hex2dec("7fffffff")) + "";
    return otp.substr(otp.length - 6, 6);
  }

  return {
    totp: function () {
      return {
        getTOTP: function (secret) {
          return getTOTP(secret);
        }
      };
    }
  };
})();
