function generateData() {
	const res = [];
	const time = new Date(Date.UTC(2018, 0, 1, 0, 0, 0, 0));
	for (let i = 0; i < 500; ++i) {
		res.push({
			time: time.getTime() / 1000,
			value: i,
		});

		time.setUTCDate(time.getUTCDate() + 1);
	}
	return res;
}

function runTestCase(container) {
	const chart = (window.chart = LightweightCharts.createChart(container, {
		localization: {
			percentageFormatter: p => `%${p.toFixed(3)}`,
		},
		layout: { attributionLogo: false },
	}));

	const mainSeries = chart.addSeries(LightweightCharts.LineSeries);
	mainSeries.priceScale().applyOptions({
		mode: LightweightCharts.PriceScaleMode.Percentage,
	});

	mainSeries.setData(generateData());
}
