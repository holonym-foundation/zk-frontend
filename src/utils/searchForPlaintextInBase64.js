// Note: this is fairly untested currently
// arguments: plaintext, base64string

module.exports = {
  searchForPlainTextInBase64: function (plaintext, base64string) {
    // convert both to bytes, so there is no difference between base64 and plaintext -- this difference is only in interperetation of the bytes, not the bytes themselves:
    let searchBytes = Buffer.from(plaintext).toString("hex");
    let allBytes = Buffer.from(base64string, "base64").toString("hex");
    let start = allBytes.indexOf(searchBytes);
    if (start == -1) {
      return null;
    }
    let finish = start + searchBytes.length;
    return [start / 2, finish / 2]; //convert nibbles to bytes by dividing by 2
  },

  searchForPlainTextInBase64Url: function (plaintext, base64UrlString) {
    searchForPlainTextInBase64(plainText, base64UrlString.replaceAll("-", "+").replaceAll("_", "/"));
  },
};
