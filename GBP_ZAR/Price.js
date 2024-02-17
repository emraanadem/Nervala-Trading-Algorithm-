const fs = require("node:fs")
const fx = require('simple-fxtrade');



        
let raw = fs.readFileSync('instrum.json')
let instrument = JSON.parse(raw)['instrument']





fx.configure({
    apiKey: '621ae0123cddaa0b8f1f132305ecacc7-102ed6d868da047d02178b0771a73853',                  
    live: false,       
    version: 'v3',     
    accountId: '101-001-17007027-003',
    dateTimeFormat: 'RFC3339', 
    fullResponse : false 
  });


async function Pricing() {

  try {
    const {prices} = await fx.pricing({ instruments: instrument })


    console.log(prices)
    // business logic goes here
} catch (error) {
    console.error(error) // from creation or business logic
}}

console.log(Pricing())