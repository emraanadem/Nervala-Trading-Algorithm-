"use strict";

var fs = require("node:fs");

var fx = require('simple-fxtrade');

var raw = fs.readFileSync('instrum.json');
var instrument = JSON.parse(raw)['instrument'];
fx.configure({
  apiKey: '621ae0123cddaa0b8f1f132305ecacc7-102ed6d868da047d02178b0771a73853',
  live: false,
  version: 'v3',
  accountId: '101-001-17007027-003',
  dateTimeFormat: 'RFC3339',
  fullResponse: false
});

function Pricing() {
  var _ref, prices;

  return regeneratorRuntime.async(function Pricing$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          _context.next = 3;
          return regeneratorRuntime.awrap(fx.pricing({
            instruments: instrument
          }));

        case 3:
          _ref = _context.sent;
          prices = _ref.prices;
          console.log(prices); // business logic goes here

          _context.next = 11;
          break;

        case 8:
          _context.prev = 8;
          _context.t0 = _context["catch"](0);
          console.error(_context.t0); // from creation or business logic

        case 11:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[0, 8]]);
}

console.log(Pricing());