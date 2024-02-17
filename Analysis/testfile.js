var { data, error } = await supabase
            .from('Thirty_Min')
            .select('Data')
            .eq('Instrument', instrument)
            .eq('OHLC', 'c')
        Thirty_Min_Functions.priceHist = data[0]['Data']
        var { data, error} = await supabase
            .from('Thirty_Min')
            .select('Data')
            .eq('Instrument', instrument)
            .eq('OHLC', 'h')
        Thirty_Min_Functions.highs = data[0]['Data']
        var { data, error} = await supabase
            .from('Thirty_Min')
            .select('Data')
            .eq('Instrument', instrument)
            .eq('OHLC', 'l')
        Thirty_Min_Functions.lows = data[0]['Data']
        var { data, error} = await supabase
            .from('Thirty_Min Extend')
            .select('Data')
            .eq('Instrument', instrument)
            .eq('OHLC', 'c')
        Thirty_Min_Functions.extendHist = data[0]['Data']
        var { data, error} = await supabase
            .from('Thirty_Min Extend')
            .select('Data')
            .eq('Instrument', instrument)
            .eq('OHLC', 'h')
        Thirty_Min_Functions.extendHigh = data[0]['Data']
        var { data, error} = await supabase
            .from('Thirty_Min Extend')
            .select('Data')
            .eq('Instrument', instrument)
            .eq('OHLC', 'l')
        Thirty_Min_Functions.extendLow = data[0]['Data']