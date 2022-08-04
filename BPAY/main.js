const { print, stringInput, intInput } = require('./consoleIO');

const REGISTER_CODE = 0;
const LOGIN_CODE = 1;
const PAY_CODE = 0;
let loggedInUser = -1;
const users = [];
let exit = false;
const handledError = new Error();
const TRANSACTIONS_CODE = 1;
const STATS_CODE = 2;
const LOGOUT_CODE = 3;
const validateUserDetails = (user) => {
	if (
		user.age > 18 &&
		!isPhoneInArray(users, user) &&
		!isNameInArray(users, user) &&
		user.pin > 999 &&
		user.pin < 10000
	) {
		return true;
	}

	return false;
};

function isPhoneInArray(arr, user) {
	for (user2 in arr) {
		if (user2.phone == user.phone) return true;
	}

	return false;
}

function isNameInArray(arr, user) {
	for (user2 of arr) {
		if (user2.name == user.name) return true;
	}

	return false;
}

function handleRegister() {
	let user = {};

	print('Enter username');
	user.name = stringInput();
	print('Enter password');
	user.password = stringInput();
	print('Enter phone');
	user.phone = stringInput();
	print('Enter age');
	user.age = intInput();
	print('Enter PIN');
	user.pin = intInput();

	if (user.age >= 22) {
		user.frame = 2000;
	} else {
		user.frame = 1000;
	}

	user.transactions = new Array();

	if (validateUserDetails(user)) {
		users.push(user);
		loggedInUser = user;
	} else {
		print('Invalid details');
	}
}

function phoneExistsInArray(phone) {
	for (var i = 0; i < users.length; i++) {
		if (users[i].phone == phone) return true;
	}
}

const handlePay = () => {
	print('How much do you want to pay?');
	let amount = intInput();
	let sum = 0;

	for (trans of loggedInUser.transactions) {
		if (trans.kind == 'out') {
			sum += trans.amount;
		}
	}
	while (sum + amount > loggedInUser.frame) {
		print('Not enough credit frame');
		amount = intInput();
	}

	print('Phone number to pay to: ');
	let phone = stringInput();

	while (!phoneExistsInArray(phone) || loggedInUser == phone) {
		print('Phone number does not exists or it"s your number. Please try again:');
		phone = stringInput();
	}

	print('Enter PIN');
	let pin = intInput();
	while (loggedInUser.pin !== pin) {
		print('Incorrect PIN, please try again.');
		pin = intInput();
	}
	let transToAdd = {};
	transToAdd.kind = 'out';
	transToAdd.to = phone;
	transToAdd.amount = amount;
	loggedInUser.transactions.push(transToAdd);
	transToAdd.kind = 'in';
	transToAdd.from = loggedInUser.phone;
	transToAdd.amount = amount;
	users.find((currUser) => currUser.phone === phone).transactions.push(transToAdd);
};

const printTransactions = () => {
	print('All transactions:');

	loggedInUser.transactions.forEach((transaction) => {
		print(
			transaction.kind == 'out'
				? `-${transaction.amount} to: ${transaction.to}`
				: `+${transaction.amount} from: ${transaction.froms}`
		);
	});
};

function calcStats(transactions) {
	let sum = 0,
		avg;
	for (curr of transactions) {
		sum += curr.amount;
	}

	if (transactions.length === 0) {
		avg = 0;
	} else {
		avg = sum / transactions.length;
	}

	return [transactions.length, sum, avg];
}

// FIXME: doens't print all stats
const printStats = () => {
	let [length, sum, avg] = calcStats(
		loggedInUser.transactions.filter((transaction) => transaction.kind === 'out')
	);
	let [length2, sum2, avg2] = calcStats(
		loggedInUser.transactions.filter((transaction) => transaction.kind === 'in')
	);

	print('OUT:');
	print('Total payments amount: ' + length);
	print('Sum of payments:' + sum);
	print('Avg of payments: ' + avg);

	print('IN:');
	print('Total payments amount: ' + length2);
	print('Sum of payments:' + sum2);
	print('Avg of payments: ' + avg2);
};

const printOptions = (arguments = { printToConsole: true }) => {
	if (!arguments.printToConsole) {
		return;
	} else {
		print(
			'\nOptions: ' +
				PAY_CODE +
				' - To pay. ' +
				TRANSACTIONS_CODE +
				' - To see transactions. ' +
				STATS_CODE +
				' - To see stats. ' +
				LOGOUT_CODE +
				' - To log out. '
		);

		const choice = intInput();

		switch (choice) {
			case PAY_CODE: {
				handlePay();
				break;
			}
			case TRANSACTIONS_CODE: {
				printTransactions();
				break;
			}
			case STATS_CODE: {
				printStats();
				break;
			}
			case LOGOUT_CODE: {
				loggedInUser = '';
				print('Goodbye!');
				break;
			}
			default: {
				print('Invalid option.');
				break;
			}
		}
	}
};

const handleLogin = () => {
  debugger;
	print('Enter username');
	let name = stringInput();
	print('Enter password');
	let password = stringInput();

	let user = users.find((currUser) => currUser.name === name);

	while (!user || user.password !== password) {
		print('Incorrect username or password');
		print('Enter username');
		name = stringInput();
		print('Enter password');
		password = stringInput();
		user = users.find((currUser) => currUser.name === name);
	}
	loggedInUser = user;
};

const printGreetingMenu = () => {
	print(`Welcome to \" BSMCH PAY \"\n\
        To login enter ${LOGIN_CODE}\n\
        To create an account enter ${REGISTER_CODE}\n\
        To exit click anything else`);
	const userChoice = intInput();

	if (userChoice === REGISTER_CODE) {
		handleRegister();
	} else if (userChoice === LOGIN_CODE) {
		handleLogin();
	} else {
		exit = true;
		print('Goodbye :)');
	}
};

while (!exit) {
	printGreetingMenu();

	while (loggedInUser) {
		printOptions();
	}
}
