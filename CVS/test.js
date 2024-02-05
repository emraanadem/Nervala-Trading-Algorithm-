class Weekly_Functions{

    multiplier = 0
    priceHist = []
    highs = []
    lows = []
    vals = []
    price = 0
    maxes = []
    mins = []
    recentHisto = []
    resistance = 0
    support = 0
    finlevs = []



    static HistoryAssigner(){
        let instrument = Daily_Functions.instrument_name()
        let raw = fs.readFileSync('Data.json')
        let rawtwo = fs.readFileSync('High.json')
        let rawthree = fs.readFileSync('Low.json')
        try{
            let data = JSON.parse(raw)
            let dataspecific = data[instrument]['Weekly']
            Weekly_Functions.priceHist = dataspecific
        }catch (error) {}
        try{
            let data = JSON.parse(rawtwo)
            let dataspecific = data[instrument]['Weekly']
            Weekly_Functions.highs = dataspecific
        }catch (error) {}
        try{
            let data = JSON.parse(rawthree)
            let dataspecific = data[instrument]['Weekly']
            Weekly_Functions.lows = dataspecific
        }catch (error) {}
        let lens = []
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
        }

    static ValueAssigner(){
        let instrument = Daily_Functions.instrument_name()
        let raw = fs.readFileSync('LivePrice.json')
        try{
            let data = JSON.parse(raw)
            let dataspecific = data[instrument]
            Weekly_Functions.price = dataspecific['Price']
        }catch (error) {}
        }
    
    /* make  function */
    /* let data = request() */
    static getPrice(){
        return Weekly_Functions.price}

    static trend(){
        Weekly_Functions.recentHist()
        let hist = Weekly_Functions.recentHisto
        const x = []
        let length = hist.length
        for(let value = 0; value < length; value++)
            x.push(value)
        const y = hist
        const regressions = new regression.SimpleLinearRegression(x, y);
        let slope = regressions.slope
        if(slope > 1){
            return true
        }
        else if(slope < 1){
            return false
        }
    }

    static priceHistory(){
        return Weekly_Functions.priceHist}

    static recentHist(){
        let history = Weekly_Functions.priceHist
        let historytwo = []
        for(let x = 0; x < 30; x++)
            historytwo.push(history.splice(-1,1)[0])
        Weekly_Functions.recentHisto = historytwo.reverse()
    }

    static priceZones(){
        Weekly_Functions.supreslevs()
        let biggersupres = Weekly_Functions.supreslevs()
        return biggersupres
    }

/* Add Key Part That the Levels Must Repeat 3x */
    static supreslevs(){
        let history = Weekly_Functions.priceHist
        let ceiling = Math.max(...history)
        let floor = Math.min(...history)
        let difference = ceiling-floor
        let levels = []
        let levelss = []
        let levelsss = []
        let finalLevs = []
        let count = 0
        for(let item = 0; item < history.length; item++)
            levels.push((history[item]-floor)/(difference))
        for(let item = 0; item < levels.length; item++)
            levels[item] = levels[item].toFixed(3)
        for(let item = 0; item < levels.length; item++){
            for(let items = 0; items < levels.length; items++){
                if(levels[item] == levels[items]){
                    count++}
                }
            if(count > 3){
                levelss.push(levels[item])}
            count = 0}
        levelsss = [...new Set(levelss)];
        finalLevs = levelsss
        Weekly_Functions.getPrice()
        let price = Weekly_Functions.price
        let larger = []
        let smaller = []
        let largertwo = []
        let smallertwo = []
        let smaller_diff = []
        let larger_diff = []
        for(let item = 0; item < finalLevs.length; item++) {
            if (price > ((finalLevs[item]*difference)+floor))
                smaller.push(((finalLevs[item]*difference)+floor))
            if (price < ((finalLevs[item]*difference)+floor))
                larger.push(((finalLevs[item]*difference)+floor))}
        for(let item = 0; item < smaller.length; item++){
            if (Math.abs(Daily_Functions.valdiff(price, smaller[item])) > .05){
                smallertwo.push(smaller[item])}}
        for(let item = 0; item < larger.length; item++){
            if (Math.abs(Daily_Functions.valdiff(price, larger[item])) > .05){
                largertwo.push(larger[item])}}
        if (smallertwo.length < 1){
            smallertwo.push(price-Daily_Functions.pipreverse(price, Daily_Functions.pipdiffy(price, Daily_Functions.stoploss())))}
        if (largertwo.length < 1){
            largertwo.push(price+Daily_Functions.pipreverse(price, Daily_Functions.pipdiffy(price, Daily_Functions.stoploss())))}
        for(let item = 0; item < smallertwo.length; item++){
            smaller_diff.push(Math.abs((smallertwo[item]-price)))}
        for(let item = 0; item < largertwo.length; item++){
            larger_diff.push(Math.abs((largertwo[item]-price)))}
        let support = price-Math.min(...smaller_diff)
        let resistance = price+Math.min(...larger_diff)
        Weekly_Functions.support = support
        Weekly_Functions.resistance = resistance
        for(const item in finalLevs){
            finalLevs[item] = (finalLevs[item]*difference)+floor
        }
        Weekly_Functions.finlevs = finalLevs
    }

    static pip(num1, num2){
        if(String(num1).indexOf('.') == 2) {
            Weekly_Functions.multiplier = 1000
        }else if(String(num1).indexOf('.') == 3){
            Weekly_Functions.multiplier = 100
        }else if(String(num1).indexOf('.') == 4){
            Weekly_Functions.multiplier = 10
        }else if(String(num1).indexOf('.') == 5){
            Weekly_Functions.multiplier = 1
        }else if(String(num1).indexOf('.') == 5){
            Weekly_Functions.multiplier = .1
        }else if(String(num1).indexOf('.') == 6){
            Weekly_Functions.multiplier = .01
        }else if(String(num1).indexOf('.') == 7){
            Weekly_Functions.multiplier = .001
        }else if(String(num1).indexOf('.') == 8){
            Weekly_Functions.multiplier = .0001
        }else if(String(num1).indexOf('.') == 9){
            Weekly_Functions.multiplier = .00001
        }else if(String(num1).indexOf('.') == 10){
            Weekly_Functions.multiplier = .000001
        }else{Weekly_Functions.multiplier = 10000}
        num1 *= Weekly_Functions.multiplier
        num2 *= Weekly_Functions.multiplier
        return [num1, num2]}

    static instrument_catalog(instrument){
    }

    static pipCountBuy(num1, num2){
        let nums
        nums = Weekly_Functions.pip(num1, num2)
        return(nums[1] - nums[0])}
}