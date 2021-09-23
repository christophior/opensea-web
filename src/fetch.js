import axios from 'axios';

export const getAssets = async ({ account, setAssets, setTotals }) => {
	const { data } = await axios.get(
		`https://wxaiuf2t8f.execute-api.us-east-1.amazonaws.com/dev/getAccountAssets/${account}`
	);

	setAssets(data.assets);
	setTotals(data.totals);
};
