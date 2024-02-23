class Fifteen_Min_Functions{

    multiplier = 0
    priceHist = []
    extendHist = []
    rejectionzones = new Array();
    extendHigh = []
    extendLow = []
    resistance = 0
    support = 0
    timeperiods = {}
    vals = []
    price = 0
    maxes = []
    mins = []
    recentHisto = []
    highs = []
    lows = []

/** load instrument name from json file */
    static instrument_name(){
        let raw = fs.readFileSync('instrument.json')
        let instrument = JSON.parse(raw)
        let dataspecific = instrument['instrument']
        return dataspecific
    }
/** load historical prices from json file */
    static async HistoryAssigner(){
        let instrument = Fifteen_Min_Functions.instrument_name()
        try{
            var { data, error } = await supabase
            .from('Fifteen_Min')
            .select('Data')
            .eq('Instrument', instrument)
            .eq('OHLC', 'c')
        datas['Fifteen_Min']['c']  = data[0]['Data']
        var { data, error} = await supabase
            .from('Fifteen_Min')
            .select('Data')
            .eq('Instrument', instrument)
            .eq('OHLC', 'h')
        datas['Fifteen_Min']['h']  = data[0]['Data']
            var { data, error} = await supabase
            .from('Fifteen_Min')
            .select('Data')
            .eq('Instrument', instrument)
            .eq('OHLC', 'l')
        datas['Fifteen_Min']['l']  = data[0]['Data']
            var { data, error} = await supabase
            .from('Fifteen_Min Extend')
            .select('Data')
            .eq('Instrument', instrument)
            .eq('OHLC', 'c')
        datas['Fifteen_Min_Extend']['c']  = data[0]['Data']
            var { data, error} = await supabase
            .from('Fifteen_Min Extend')
            .select('Data')
            .eq('Instrument', instrument)
            .eq('OHLC', 'h')
        datas['Fifteen_Min_Extend']['h']  = data[0]['Data']
            var { data, error} = await supabase
            .from('Fifteen_Min Extend')
            .select('Data')
            .eq('Instrument', instrument)
            .eq('OHLC', 'l')
        datas['Fifteen_Min_Extend']['l']  = data[0]['Data']}
            catch (error) {
            console.log(error)
        }
        let lens = []
        Fifteen_Min_Functions.priceHist = datas['Fifteen_Min']['c']
        Fifteen_Min_Functions.highs = datas['Fifteen_Min']['h']
        Fifteen_Min_Functions.lows = datas['Fifteen_Min']['l']
        Fifteen_Min_Functions.extendHist = datas['Fifteen_Min']['c']
        Fifteen_Min_Functions.extendHigh = datas['Fifteen_Min']['h']
        Fifteen_Min_Functions.extendLow = datas['Fifteen_Min']['l']
        lens.push(Fifteen_Min_Functions.priceHist.length)
        lens.push(Fifteen_Min_Functions.highs.length)
        lens.push(Fifteen_Min_Functions.lows.length)
        let minlens = Math.min(...lens)
        let lists = [Fifteen_Min_Functions.priceHist, Fifteen_Min_Functions.highs, Fifteen_Min_Functions.lows]
        let items;
        for (items in lists){
            if (items.length > minlens){
                if (items == Fifteen_Min_Functions.priceHist){
                    for(let item = 0; item < (Fifteen_Min_Functions.priceHist.length - minlens); item++){
                        Fifteen_Min_Functions.priceHist.splice(0,1)
                    }
                if (items == Fifteen_Min_Functions.lows){
                    for(let item = 0; item < (Fifteen_Min_Functions.lows.length - minlens); item++){
                        Fifteen_Min_Functions.lows.splice(0,1)
                    }
                if (items == Fifteen_Min_Functions.highs){
                    for(let item = 0; item < (Fifteen_Min_Functions.highs.length - minlens); item++){
                        Fifteen_Min_Functions.highs.splice(0,1)
                    }}}}}}
        lens = []
        lens.push(Fifteen_Min_Functions.extendHist.length)
        lens.push(Fifteen_Min_Functions.extendHigh.length)
        lens.push(Fifteen_Min_Functions.extendLow.length)
        minlens = Math.min(...lens)
        lists = [Fifteen_Min_Functions.extendHist, Fifteen_Min_Functions.extendHigh, Fifteen_Min_Functions.extendLow]

        for (items in lists){
            if (items.length > minlens){
                if (items == Fifteen_Min_Functions.extendHist){
                    for(let item = 0; item < (Fifteen_Min_Functions.extendHist.length - minlens); item++){
                        Fifteen_Min_Functions.extendHist.splice(0,1)
                    }
                if (items == Fifteen_Min_Functions.extendLow){
                    for(let item = 0; item < (Fifteen_Min_Functions.extendLow.length - minlens); item++){
                        Fifteen_Min_Functions.extendLow.splice(0,1)
                    }
                if (items == Fifteen_Min_Functions.extendHigh){
                    for(let item = 0; item < (Fifteen_Min_Functions.extendHigh.length - minlens); item++){
                        Fifteen_Min_Functions.extendHigh.splice(0,1)
                    }}}}}}
        }}


class Two_Hour_Functions{

    multiplier = 0
    priceHist = []
    extendHist = []
    rejectionzones = new Array();
    extendHigh = []
    extendLow = []
    resistance = 0
    support = 0
    timeperiods = {}
    vals = []
    price = 0
    maxes = []
    mins = []
    recentHisto = []
    highs = []
    lows = []

/** load instrument name from json file */
    static instrument_name(){
        let raw = fs.readFileSync('instrument.json')
        let instrument = JSON.parse(raw)
        let dataspecific = instrument['instrument']
        return dataspecific
    }
/** load historical prices from json file */
    static async HistoryAssigner(){
        let instrument = Two_Hour_Functions.instrument_name()
        try{
            var { data, error } = await supabase
            .from('Two_Hour')
            .select('Data')
            .eq('Instrument', instrument)
            .eq('OHLC', 'c')
        datas['Two_Hour']['c']  = data[0]['Data']
        var { data, error} = await supabase
            .from('Two_Hour')
            .select('Data')
            .eq('Instrument', instrument)
            .eq('OHLC', 'h')
        datas['Two_Hour']['h']  = data[0]['Data']
            var { data, error} = await supabase
            .from('Two_Hour')
            .select('Data')
            .eq('Instrument', instrument)
            .eq('OHLC', 'l')
        datas['Two_Hour']['l']  = data[0]['Data']
            var { data, error} = await supabase
            .from('Two_Hour Extend')
            .select('Data')
            .eq('Instrument', instrument)
            .eq('OHLC', 'c')
        datas['Two_Hour_Extend']['c']  = data[0]['Data']
            var { data, error} = await supabase
            .from('Two_Hour Extend')
            .select('Data')
            .eq('Instrument', instrument)
            .eq('OHLC', 'h')
        datas['Two_Hour_Extend']['h']  = data[0]['Data']
            var { data, error} = await supabase
            .from('Two_Hour Extend')
            .select('Data')
            .eq('Instrument', instrument)
            .eq('OHLC', 'l')
        datas['Two_Hour_Extend']['l']  = data[0]['Data']}
            catch (error) {
            console.log(error)
        }
        let lens = []
        Two_Hour_Functions.priceHist = datas['Two_Hour']['c']
        Two_Hour_Functions.highs = datas['Two_Hour']['h']
        Two_Hour_Functions.lows = datas['Two_Hour']['l']
        Two_Hour_Functions.extendHist = datas['Two_Hour']['c']
        Two_Hour_Functions.extendHigh = datas['Two_Hour']['h']
        Two_Hour_Functions.extendLow = datas['Two_Hour']['l']
        lens.push(Two_Hour_Functions.priceHist.length)
        lens.push(Two_Hour_Functions.highs.length)
        lens.push(Two_Hour_Functions.lows.length)
        let minlens = Math.min(...lens)
        let lists = [Two_Hour_Functions.priceHist, Two_Hour_Functions.highs, Two_Hour_Functions.lows]
        let items;
        for (items in lists){
            if (items.length > minlens){
                if (items == Two_Hour_Functions.priceHist){
                    for(let item = 0; item < (Two_Hour_Functions.priceHist.length - minlens); item++){
                        Two_Hour_Functions.priceHist.splice(0,1)
                    }
                if (items == Two_Hour_Functions.lows){
                    for(let item = 0; item < (Two_Hour_Functions.lows.length - minlens); item++){
                        Two_Hour_Functions.lows.splice(0,1)
                    }
                if (items == Two_Hour_Functions.highs){
                    for(let item = 0; item < (Two_Hour_Functions.highs.length - minlens); item++){
                        Two_Hour_Functions.highs.splice(0,1)
                    }}}}}}
        lens = []
        lens.push(Two_Hour_Functions.extendHist.length)
        lens.push(Two_Hour_Functions.extendHigh.length)
        lens.push(Two_Hour_Functions.extendLow.length)
        minlens = Math.min(...lens)
        lists = [Two_Hour_Functions.extendHist, Two_Hour_Functions.extendHigh, Two_Hour_Functions.extendLow]

        for (items in lists){
            if (items.length > minlens){
                if (items == Two_Hour_Functions.extendHist){
                    for(let item = 0; item < (Two_Hour_Functions.extendHist.length - minlens); item++){
                        Two_Hour_Functions.extendHist.splice(0,1)
                    }
                if (items == Two_Hour_Functions.extendLow){
                    for(let item = 0; item < (Two_Hour_Functions.extendLow.length - minlens); item++){
                        Two_Hour_Functions.extendLow.splice(0,1)
                    }
                if (items == Two_Hour_Functions.extendHigh){
                    for(let item = 0; item < (Two_Hour_Functions.extendHigh.length - minlens); item++){
                        Two_Hour_Functions.extendHigh.splice(0,1)
                    }}}}}}
        }}

class Weekly_Functions{

    multiplier = 0
    priceHist = []
    extendHist = []
    rejectionzones = new Array();
    extendHigh = []
    extendLow = []
    resistance = 0
    support = 0
    timeperiods = {}
    vals = []
    price = 0
    maxes = []
    mins = []
    recentHisto = []
    highs = []
    lows = []

/** load instrument name from json file */
    static instrument_name(){
        let raw = fs.readFileSync('instrument.json')
        let instrument = JSON.parse(raw)
        let dataspecific = instrument['instrument']
        return dataspecific
    }
/** load historical prices from json file */
    static async HistoryAssigner(){
        let instrument = Weekly_Functions.instrument_name()
        try{
            var { data, error } = await supabase
            .from('Weekly')
            .select('Data')
            .eq('Instrument', instrument)
            .eq('OHLC', 'c')
        datas['Weekly']['c']  = data[0]['Data']
        var { data, error} = await supabase
            .from('Weekly')
            .select('Data')
            .eq('Instrument', instrument)
            .eq('OHLC', 'h')
        datas['Weekly']['h']  = data[0]['Data']
            var { data, error} = await supabase
            .from('Weekly')
            .select('Data')
            .eq('Instrument', instrument)
            .eq('OHLC', 'l')
        datas['Weekly']['l']  = data[0]['Data']
            var { data, error} = await supabase
            .from('Weekly Extend')
            .select('Data')
            .eq('Instrument', instrument)
            .eq('OHLC', 'c')
        datas['Weekly_Extend']['c']  = data[0]['Data']
            var { data, error} = await supabase
            .from('Weekly Extend')
            .select('Data')
            .eq('Instrument', instrument)
            .eq('OHLC', 'h')
        datas['Weekly_Extend']['h']  = data[0]['Data']
            var { data, error} = await supabase
            .from('Weekly Extend')
            .select('Data')
            .eq('Instrument', instrument)
            .eq('OHLC', 'l')
        datas['Weekly_Extend']['l']  = data[0]['Data']}
            catch (error) {
            console.log(error)
        }
        let lens = []
        Weekly_Functions.priceHist = datas['Weekly']['c']
        Weekly_Functions.highs = datas['Weekly']['h']
        Weekly_Functions.lows = datas['Weekly']['l']
        Weekly_Functions.extendHist = datas['Weekly']['c']
        Weekly_Functions.extendHigh = datas['Weekly']['h']
        Weekly_Functions.extendLow = datas['Weekly']['l']
        lens.push(Weekly_Functions.priceHist.length)
        lens.push(Weekly_Functions.highs.length)
        lens.push(Weekly_Functions.lows.length)
        let minlens = Math.min(...lens)
        let lists = [Weekly_Functions.priceHist, Weekly_Functions.highs, Weekly_Functions.lows]
        let items;
        for (items in lists){
            if (items.length > minlens){
                if (items == Weekly_Functions.priceHist){
                    for(let item = 0; item < (Weekly_Functions.priceHist.length - minlens); item++){
                        Weekly_Functions.priceHist.splice(0,1)
                    }
                if (items == Weekly_Functions.lows){
                    for(let item = 0; item < (Weekly_Functions.lows.length - minlens); item++){
                        Weekly_Functions.lows.splice(0,1)
                    }
                if (items == Weekly_Functions.highs){
                    for(let item = 0; item < (Weekly_Functions.highs.length - minlens); item++){
                        Weekly_Functions.highs.splice(0,1)
                    }}}}}}
        lens = []
        lens.push(Weekly_Functions.extendHist.length)
        lens.push(Weekly_Functions.extendHigh.length)
        lens.push(Weekly_Functions.extendLow.length)
        minlens = Math.min(...lens)
        lists = [Weekly_Functions.extendHist, Weekly_Functions.extendHigh, Weekly_Functions.extendLow]
        for (items in lists){
            if (items.length > minlens){
                if (items == Weekly_Functions.extendHist){
                    for(let item = 0; item < (Weekly_Functions.extendHist.length - minlens); item++){
                        Weekly_Functions.extendHist.splice(0,1)
                    }
                if (items == Weekly_Functions.extendLow){
                    for(let item = 0; item < (Weekly_Functions.extendLow.length - minlens); item++){
                        Weekly_Functions.extendLow.splice(0,1)
                    }
                if (items == Weekly_Functions.extendHigh){
                    for(let item = 0; item < (Weekly_Functions.extendHigh.length - minlens); item++){
                        Weekly_Functions.extendHigh.splice(0,1)
                    }}}}}}
        }}

class Five_Min_Functions{

    multiplier = 0
    priceHist = []
    extendHist = []
    rejectionzones = new Array();
    extendHigh = []
    extendLow = []
    resistance = 0
    support = 0
    timeperiods = {}
    vals = []
    price = 0
    maxes = []
    mins = []
    recentHisto = []
    highs = []
    lows = []

/** load instrument name from json file */
    static instrument_name(){
        let raw = fs.readFileSync('instrument.json')
        let instrument = JSON.parse(raw)
        let dataspecific = instrument['instrument']
        return dataspecific
    }
/** load historical prices from json file */
    static async HistoryAssigner(){
        let instrument = Five_Min_Functions.instrument_name()
        try{
            var { data, error } = await supabase
            .from('Five_Min')
            .select('Data')
            .eq('Instrument', instrument)
            .eq('OHLC', 'c')
        datas['Five_Min']['c']  = data[0]['Data']
        var { data, error} = await supabase
            .from('Five_Min')
            .select('Data')
            .eq('Instrument', instrument)
            .eq('OHLC', 'h')
        datas['Five_Min']['h']  = data[0]['Data']
            var { data, error} = await supabase
            .from('Five_Min')
            .select('Data')
            .eq('Instrument', instrument)
            .eq('OHLC', 'l')
        datas['Five_Min']['l']  = data[0]['Data']
            var { data, error} = await supabase
            .from('Five_Min Extend')
            .select('Data')
            .eq('Instrument', instrument)
            .eq('OHLC', 'c')
        datas['Five_Min_Extend']['c']  = data[0]['Data']
            var { data, error} = await supabase
            .from('Five_Min Extend')
            .select('Data')
            .eq('Instrument', instrument)
            .eq('OHLC', 'h')
        datas['Five_Min_Extend']['h']  = data[0]['Data']
            var { data, error} = await supabase
            .from('Five_Min Extend')
            .select('Data')
            .eq('Instrument', instrument)
            .eq('OHLC', 'l')
        datas['Five_Min_Extend']['l']  = data[0]['Data']}
            catch (error) {
            console.log(error)
        }
        let lens = []
        Five_Min_Functions.priceHist = datas['Five_Min']['c']
        Five_Min_Functions.highs = datas['Five_Min']['h']
        Five_Min_Functions.lows = datas['Five_Min']['l']
        Five_Min_Functions.extendHist = datas['Five_Min']['c']
        Five_Min_Functions.extendHigh = datas['Five_Min']['h']
        Five_Min_Functions.extendLow = datas['Five_Min']['l']
        lens.push(Five_Min_Functions.priceHist.length)
        lens.push(Five_Min_Functions.highs.length)
        lens.push(Five_Min_Functions.lows.length)
        let minlens = Math.min(...lens)
        let lists = [Five_Min_Functions.priceHist, Five_Min_Functions.highs, Five_Min_Functions.lows]
        let items;
        for (items in lists){
            if (items.length > minlens){
                if (items == Five_Min_Functions.priceHist){
                    for(let item = 0; item < (Five_Min_Functions.priceHist.length - minlens); item++){
                        Five_Min_Functions.priceHist.splice(0,1)
                    }
                if (items == Five_Min_Functions.lows){
                    for(let item = 0; item < (Five_Min_Functions.lows.length - minlens); item++){
                        Five_Min_Functions.lows.splice(0,1)
                    }
                if (items == Five_Min_Functions.highs){
                    for(let item = 0; item < (Five_Min_Functions.highs.length - minlens); item++){
                        Five_Min_Functions.highs.splice(0,1)
                    }}}}}}
        lens = []
        lens.push(Five_Min_Functions.extendHist.length)
        lens.push(Five_Min_Functions.extendHigh.length)
        lens.push(Five_Min_Functions.extendLow.length)
        minlens = Math.min(...lens)
        lists = [Five_Min_Functions.extendHist, Five_Min_Functions.extendHigh, Five_Min_Functions.extendLow]
        for (items in lists){
            if (items.length > minlens){
                if (items == Five_Min_Functions.extendHist){
                    for(let item = 0; item < (Five_Min_Functions.extendHist.length - minlens); item++){
                        Five_Min_Functions.extendHist.splice(0,1)
                    }
                if (items == Five_Min_Functions.extendLow){
                    for(let item = 0; item < (Five_Min_Functions.extendLow.length - minlens); item++){
                        Five_Min_Functions.extendLow.splice(0,1)
                    }
                if (items == Five_Min_Functions.extendHigh){
                    for(let item = 0; item < (Five_Min_Functions.extendHigh.length - minlens); item++){
                        Five_Min_Functions.extendHigh.splice(0,1)
                    }}}}}}
        }}

async function center(){
    await One_Hour_Functions.HistoryAssigner()
    await Four_Hour_Functions.HistoryAssigner()
    await Daily_Functions.HistoryAssigner() 
    await Thirty_Min_Functions.HistoryAssigner()  
    await Fifteen_Min_Functions.HistoryAssigner()
    await Two_Hour_Functions.HistoryAssigner()
    await Weekly_Functions.HistoryAssigner()
    await Five_Min_Functions.HistoryAssigner()
}
center()
function results(){
    return datas

}
module.exports = { Weekly_Functions, One_Hour_Functions, Four_Hour_Functions, Daily_Functions, Thirty_Min_Functions, Fifteen_Min_Functions, Two_Hour_Functions, Five_Min_Functions, center , results};