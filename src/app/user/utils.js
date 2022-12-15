const { Exception } = require('utils');
const { Order } = require('../Models');
const moment = require('moment');
const _ = require('lodash');

module.exports = {
	parseSubscription: (subscription) => {
		if (!subscription) return;
		const expiresAt = Order.calcSubscriptionExpiration(subscription.subscription, subscription.createdAt);
		if (moment().isSameOrAfter(expiresAt)) return;
		return {
			id: subscription.subscription._id,
			..._.omit(subscription.subscription, ['_id', 'price', 'duration', 'createdAt']),
			expiresAt,
		};
	},

	subscriptionPipeline: (conditions) => [
		{
			$lookup: {
				from: 'Order',
				localField: '_id',
				foreignField: 'user',
				as: 'subscription',
				pipeline: [
					{
						$match: {
							subscription: { $exists: true },
							$expr: { $eq: [{ $last: '$statuses.status' }, Order.STATUSES.DONE] },
						},
					},
					{ $project: { subscription: 1, createdAt: { $last: '$statuses.at' } } },
					{ $sort: { createdAt: -1 } },
					{ $limit: 1 },
				],
			},
		},
		{ $match: conditions.subscription },
	],
};
