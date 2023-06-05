function encode(text) {
  var a = 3
  var b = 7
  var result = ''

  for (var i = 0; i < text.length; i++) {
    var char = text.charAt(i)
    var charIndex = char.charCodeAt(0)
    //console.log(charIndex)
    var encryptedChar = a * charIndex + b
    result += String.fromCharCode(encryptedChar)
  }

  return result
}

function decode(text) {
  var a = 3
  var b = 7
  var result = ''

  for (var j = 0; j < text.length; j++) {
    //var char = text.charAt(i)
    var charIndex = text.charCodeAt(j)
    var decryptedChar = (charIndex - b) / a
    result += String.fromCharCode(decryptedChar)
  }

  return result
}

module.exports = { encode, decode }
