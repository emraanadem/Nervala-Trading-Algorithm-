const createClient = require('@supabase/supabase-js').createClient;

// Create a single supabase client for interacting with your database
const supabase = createClient('https://nvlbmpghemfunkpnhwee.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52bGJtcGdoZW1mdW5rcG5od2VlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDgxMTg3ODcsImV4cCI6MjAyMzY5NDc4N30.woZOGh5WaEcUtEyvsXaNP3Kg6BsNP8UOWhmv5RG4iMY')



let prices = []
async function main(){
    let values = []
    let instrument = "EUR_USD"
    async function asyncOperation() {
        return new Promise(async () => {
            var { data, error } = await supabase
                .from('One_Hour')
                .select('Data')
                .eq('Instrument', instrument)
                .eq('OHLC', 'c')
            values = data[0]['Data']
            prices = values
        });
        }
    const result = await asyncOperation();
    }
console.log(prices)
  
