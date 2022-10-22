var Buffer = require('safe-buffer').Buffer

export function xor (a, b) {
  // pad the shorter buffer with 0s
  let padded
  let a_
  let b_
  if(a.length > b.length){
    padded = Buffer.alloc(a.length)
    a_ = a
    b.copy(padded, padded.length-b.length)
    b_ = padded

  } else if(a.length < b.length){
    padded = Buffer.alloc(b.length)
    a_ = a.copy(padded, padded.length-a.length)
    a_ = padded
    b_ = b
  } else {
    a_ = a;
    b_ = b;
  }

  var length = a_.length
  var buffer = Buffer.allocUnsafe(length)

  for (var i = 0; i < length; ++i) {
    buffer[i] = a_[i] ^ b_[i]
  }
  return buffer
}
