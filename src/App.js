import React, { useEffect, useState } from 'react';
import Table from 'react-bootstrap/Table';
import qs from 'query-string';

import { getAssets } from './fetch';

const App = () => {
	const { account = '0x2e924d2aba625bf153a2f1c5c445bb63bd0d79e1' } = qs.parse(
		window.location.search
	);
	const [assets, setAssets] = useState([]);
	const [totals, setTotals] = useState({});

	useEffect(() => {
		getAssets({ account, setAssets, setTotals });
	}, []);

	return (
		<>
			<h3 style={{ textAlign: 'center', color: '#ffffff' }}>
				assets for {account}
			</h3>
			<ul></ul>
			<Table striped bordered hover variant="dark">
				<thead>
					<tr>
						<th>name</th>
						<th>top offer</th>
						<th>cheapest listing</th>
						<th>last sale</th>
					</tr>
				</thead>
				<tbody>
					{assets.map(
						({
							id,
							name,
							link,
							topOffer,
							cheapestListing,
							lastSale,
						}) => (
							<tr key={id}>
								<td>
									<a href={link} target="_blankn">
										{name}
									</a>
								</td>
								<td>{topOffer}</td>
								<td>{cheapestListing}</td>
								<td>{lastSale}</td>
							</tr>
						)
					)}
					<tr>
						<td colSpan="4" />
					</tr>
					<tr>
						<td>totals</td>
						<td>{totals.topOffer}</td>
						<td>{totals.cheapestListing}</td>
						<td>{totals.lastSale}</td>
					</tr>
				</tbody>
			</Table>
		</>
	);
};

export default App;
