export default {
	connection: 'mongodb://localhost:27017,localhost:27018,localhost:27019',
	name: 'mongo-test',
	options: '?retryWrites=true&replicaSet=rs0',
};
