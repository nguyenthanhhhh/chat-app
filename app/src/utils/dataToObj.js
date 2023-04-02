module.exports = {
  dataToObj: function (ele) {
    return JSON.parse(JSON.stringify(ele));
  },

  dataToObj2: function (array) {
    return array.map((ele) => Object.assign({}, ele));
  },
};
