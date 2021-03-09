var util = require('util');
var bleno = require('bleno');
var polling = require('./polling');

const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

const {fetchQuestionViaAPI} =require('./fetch-questions')

let json_string = ''

var { stringToBytes } = require('convert-string')

fetchQuestionViaAPI().then((res)=>{
  json_string = res
  console.log(json_string)
})


function SingleVoteCharacteristic(pizza) {
  bleno.Characteristic.call(this, {
    uuid: '13333333333333333333333333330003',
    properties: ['notify', 'write','read'],
    descriptors: [
      new bleno.Descriptor({
        uuid: '2901',
        value: 'Bakes the pizza and notifies when done baking.'
      })
    ]
  });

  this.pizza = pizza;
}

util.inherits(SingleVoteCharacteristic, bleno.Characteristic);

SingleVoteCharacteristic.prototype.onWriteRequest = function(data, offset, withoutResponse, callback) {
  console.log('--------------- data ------------------')
  console.log(data)
  // console.log(data.readUInt16BE(0))
  console.log(String.fromCharCode.apply(null,data))
  console.log()

  if (offset || withoutResponse) {
    callback(this.RESULT_ATTR_NOT_LONG);
    console.log(data)
    console.log(String.fromCharCode.apply(null,data))
  }
  // else if (data.length !== 2) {
  //   callback(this.RESULT_INVALID_ATTRIBUTE_LENGTH);
  //   console.log(data)
  //   console.log(String.fromCharCode.apply(null,data))
  // }
  else {
    console.log(data)
    console.log(String.fromCharCode.apply(null,data))
    // var temperature = data.readUInt16BE(0);
    var temperature = String.fromCharCode.apply(null,data)
    var self = this;
    // this.pizza.once('ready', function(result) {
    //   if (self.updateValueCallback) {
    //     var data = new Buffer(1);
    //     data.writeUInt8(result, 0);
    //     self.updateValueCallback(data);
    //   }
    // });
    this.pizza.vote(temperature);
    callback(this.RESULT_SUCCESS);
  }
};

module.exports = SingleVoteCharacteristic;