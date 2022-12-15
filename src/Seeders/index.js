const { connect } = require('database');
const fs = require('fs').promises;
const mongoose = require('mongoose');
const program = require('./program');
const options = program.opts();
const env = options.env || process.env.NODE_ENV || 'development';
console.log('Script Started with this options:', options);

async function start() {
	await connect();

	if (options['mode'] === 'clean') {
		options.timeout = options.timeout * 2;
		console.log(
			'\nIf you are not sure what cleaning is or you want to abort it you can cancel this process before you run out of time'
		);
		console.log('\n*** This Operation can NOT be undone ***');
	}

	console.log(`\nScript Will Start After`, options.timeout, `Seconds`);
	console.time('\nSeeding finished in');
	await new Promise((resolve) => setTimeout(resolve, options.timeout * 1000));

	console.log('\nSeeding Start');
	// Cleaning
	if (options['mode'] === 'clean') {
		console.log(`\nStart Cleaning`);
		console.time(`Cleaning Finished in`);

		const collections = await mongoose.connection.db.collections();
		for (const collection of collections) {
			if (options.ignore.includes(collection.s.namespace.collection)) {
				console.log(`Ignoring Collection: (${collection.s.namespace.collection}) from Cleaning.`);
				continue;
			}
			if (options.cleanMethod === 'Drop') await collection.drop();
			else if (options.cleanMethod === 'Empty') await collection.deleteMany();
		}
		console.timeEnd(`Cleaning Finished in`);
	}

	console.log('Seeding Data Start\n');
	console.time('\nSeeding data finished in');

	const dirs = await fs.readdir('src/Seeders/data');
	let InsertedDocumentsCount = 0;
	const session = await mongoose.startSession();
	await session.withTransaction(async (session) => {
		const Models = require('../app/Models');

		// Seeding Data
		for (const dir of dirs) {
			if (dir === '.ignore') continue;

			const path = options['dataDir'] + dir;
			const seed = require(path);

			if (options.ignore.includes(seed.model)) {
				console.log(`Ignoring Model: (${seed.model}) from Data Seeding.`);
				continue;
			}
			console.log(`\nStart Seeding ${dir} Data`);
			console.time(`Seeding ${dir} Data Finished in`);

			const Model = Models[seed.model];
			if (!Model) throw `Error Model:( ${seed.model} ) Not Found.`;

			const seedDocuments = Array.isArray(seed.data) ? seed.data : seed.data[env];
			if (!seedDocuments) continue;

			switch (options['mode']) {
				case 'normal':
					{
						const ids = seedDocuments.map((val) => val._id);

						const currentData = await Model.find({ _id: ids }, '', { lean: true, session });
						const currentIds = currentData.map((val) => val._id.toString());

						const newDocuments = seedDocuments.filter((val) => !currentIds.includes(val._id));

						const result = await Model.insertMany(newDocuments, { session, rawResult: true, lean: true });

						const insertedCount = result.insertedCount || 0;
						console.log(seed.model + ' Inserted Documents Count:', insertedCount);
						InsertedDocumentsCount += insertedCount;
					}
					break;

				case 'overwrite':
					{
						const query = seedDocuments.map((val) => ({
							updateOne: { filter: { _id: val._id }, update: val, upsert: true },
						}));

						const result = await Model.bulkWrite(query, { session });

						console.log(seed.model + ' Inserted Documents Count:', result.nUpserted);
						InsertedDocumentsCount += result.nUpserted;
					}
					break;

				case 'clean':
					{
						const result = await Model.insertMany(seedDocuments, { session, rawResult: true, lean: true });

						console.log(seed.model + ' Inserted Documents Count:', result.insertedCount);
						InsertedDocumentsCount += result.insertedCount;
					}
					break;
				default:
					break;
			}

			console.timeEnd(`Seeding ${dir} Data Finished in`);
		}
	});
	await mongoose.disconnect();

	console.log('\nAll Inserted Documents Count:', InsertedDocumentsCount);
	console.log('\nAll Inserted Documents Count:', InsertedDocumentsCount);
	console.timeEnd('\nSeeding data finished in');
	console.timeEnd('\nSeeding finished in');
	process.exit(0);
}
start()
	.then(() => {})
	.catch(console.log);
