const urllib = require('urllib');

const api = {
  depth: `https://api2.bitmesh.com/?api=market.depth&params={%22market%22:%22btc_grin%22,%22limit%22:30,%22group%22:8}`,
  history: `https://api2.bitmesh.com/?api=market.tradeHistory&params={"market":"btc_grin"}`,
  statistics: `https://api2.bitmesh.com/?api=market.statistics&params={%22market%22:%22btc_grin%22}`
}

async function queryDepth() {
	const depth = await urllib.request(api.depth, {
	  method: 'GET',
	  dataType: 'json'
	});
	if (depth.data && depth.data.data) {
		return depth.data.data; //
	}
	return { asks: [], bids: [] }
}

async function queryHistory() {
	const history = await urllib.request(api.history, {
	  method: 'GET',
	  dataType: 'json'
	});
	if (history.data && history.data.data) {
		return history.data.data;
	}
	return [];
} //

async function queryStatistics() {
	const statistics = await urllib.request(api.statistics, {
	  method: 'GET',
	  dataType: 'json'
	});
	if (statistics.data && statistics.data.data) {
		return statistics.data.data;
	}
	return {};
}


async function query () {
	const depth = await queryDepth();
	const history = await queryHistory();
	const statistics = await queryStatistics();
	// console.log(JSON.stringify({
	// 	depth,
	// 	history,
	// 	statistics,
	// }))
	return {
		depth,
		history,
		statistics,
	}
}
query();

module.exports = query
