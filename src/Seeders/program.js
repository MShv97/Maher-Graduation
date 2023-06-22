const { Command, Option } = require('commander');

const program = new Command();
program
	.addOption(new Option('-e, --env <String>', 'Wroking Enviroment.'))
	.addOption(new Option('-t, --timeout <Number>', 'overwrite defult wating time.').default(11))
	.addOption(new Option('-d, --data-dir <String>', 'Data Directory.').default('./data/'))
	.addOption(
		new Option('-m, --mode <work_mode>', 'Working Mode.').choices(['clean', 'overwrite', 'normal']).makeOptionMandatory()
	)
	.addOption(
		new Option('-cm, --clean-method <String>', 'Cleaning Method (Clean Mode Should be Active)')
			.choices(['Drop', 'Empty'])
			.default('Drop')
	)
	.addOption(new Option('-i, --ignore [Models...]', 'Ignore this models when seed start.').default([]));

program.parse();

module.exports = program;
