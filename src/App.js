import React, { useEffect, useState } from 'react';
import Table from 'react-bootstrap/Table';
import Row from 'react-bootstrap/Row';
import qs from 'query-string';
import is from 'is_js';

import { getAssets } from './fetch';

const App = () => {
	const { account } = qs.parse(window.location.search);
	const [assets, setAssets] = useState([]);
	const [totals, setTotals] = useState({});

	useEffect(() => {
		if (account) {
			getAssets({ account, setAssets, setTotals });
		}
	}, []);

	if (!account) {
		window.location.replace(
			'/?account=0x2e924d2aba625bf153a2f1c5c445bb63bd0d79e1'
		);
	}

	return (
		<>
			<h3 style={{ textAlign: 'center', color: '#ffffff' }}>
				assets for{' '}
				<a href={`https://opensea.io/accounts/${account}`}>
					{is.mobile()
						? `${account.substring(0, 4)}...${account.substring(
								account.length - 4
						  )}`
						: account}
				</a>
			</h3>
			<ul></ul>
			<Row style={{ margin: '0.5rem' }}>
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
			</Row>
		</>
	);
};

export default App;
