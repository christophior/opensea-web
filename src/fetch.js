import axios from 'axios';
import get from 'lodash.get';

const desc = (a, b) => a.usd_price - b.usd_price;
const asc = (a, b) => b.usd_price - a.usd_price;

const formatter = new Intl.NumberFormat('en-US', {
	style: 'currency',
	currency: 'USD',
});

const formatCash = (val) => formatter.format(val);
const formatNumber = (val) => formatCash(val).split('$')[1];

export const getAssets = async ({ account, setAssets, setTotals }) => {
	const { data } = await axios.get(
		`https://api.allorigins.win/get?url=https://api.opensea.io/api/v1/assets?owner=${account}&order_direction=desc&order_by=pk&offset=0&limit=20`
	);

	const { assets: userAssets } = JSON.parse(data.contents);

	const assetBaseInfo = userAssets.map((a) => ({
		id: a.id,
		name: a.name,
		description: a.description,
		link: a.permalink,
	}));

	const ids = userAssets.map((a) => `${a.asset_contract.address}/${a.token_id}`);
	const assetCalls = ids.map((id) =>
		axios.get(
			`https://api.allorigins.win/get?url=https://api.opensea.io/api/v1/asset/${id}`
		)
	);

	const results = await Promise.all(assetCalls.map((p) => p.catch((e) => e)));
	const assetInfoData = results.filter((result) => !(result instanceof Error));
	const assetInfo = assetInfoData.map((info) => {
		return processAssetInfo(JSON.parse(info.data.contents));
	});

	const totals = {
		topOffer: 0,
		cheapestListing: 0,
		lastSale: 0,
	};

	const assets = assetBaseInfo.map((baseInfo) => {
		const salesInfo = assetInfo.find((info) => info.id === baseInfo.id);

		totals.topOffer += get(salesInfo, 'topOffer.usd_price', 0);
		totals.cheapestListing += get(salesInfo, 'cheapestListing.usd_price', 0);
		totals.lastSale += get(salesInfo, 'lastSale.lastUsdPrice', 0);

		return { ...baseInfo, ...salesInfo };
	});

	setAssets(
		assets.map((a) => ({
			...a,
			topOffer: a.topOffer
				? `${formatNumber(a.topOffer.price)} ${
						a.topOffer.symbol
				  } (${formatCash(get(a, 'topOffer.usd_price', 0))})`
				: '',
			cheapestListing: a.cheapestListing
				? `${formatNumber(a.cheapestListing.price)} ${
						a.cheapestListing.symbol
				  } (${formatCash(get(a, 'cheapestListing.usd_price', 0))})`
				: '',
			lastSale: a.lastSale
				? `${formatNumber(a.lastSale.price)} ${
						a.lastSale.symbol
				  } (${formatCash(get(a, 'lastSale.lastUsdPrice', 0))})`
				: '',
		}))
	);

	setTotals({
		topOffer: formatCash(totals.topOffer),
		cheapestListing: formatCash(totals.cheapestListing),
		lastSale: formatCash(totals.lastSale),
	});
};

const processAssetInfo = (assetInfo) => {
	const { id, name, orders, last_sale } = assetInfo;
	const cleanOrders = orders.map(
		({
			maker,
			payment_token_contract,
			current_price,
			side,
			quantity: quantityString,
		}) => {
			const quantity = parseInt(quantityString);
			const { symbol, usd_price } = payment_token_contract;
			const price =
				symbol === 'USDC'
					? current_price / 1000000
					: current_price / 1000000000000000000;
			const usdPrice = Math.round(parseFloat(usd_price) * price * 100) / 100;

			return {
				username: (maker.user && maker.user.username) || maker.address,
				symbol,
				price: price / quantity,
				usd_price: usdPrice / quantity,
				side,
			};
		}
	);

	const listings = cleanOrders.filter((o) => o.side === 1).sort(desc);
	const offers = cleanOrders.filter((o) => o.side === 0).sort(asc);
	let lastSale = null;

	if (last_sale) {
		const lastSaleSymbol = last_sale.payment_token.symbol;
		const lastSaleTotalPrice =
			lastSaleSymbol === 'USDC'
				? last_sale.total_price / 1000000
				: last_sale.total_price / 1000000000000000000;
		lastSale = {
			symbol: lastSaleSymbol,
			price: lastSaleTotalPrice,
			lastUsdPrice: lastSaleTotalPrice * last_sale.payment_token.usd_price,
		};
	}

	const [topOffer] = offers;
	const [cheapestListing] = listings;

	return { id, name, topOffer, cheapestListing, lastSale };
};
