import { expect } from 'chai';
import App from '../src/App';

describe('App', () => {
	it('app should be booted', async () => {
		expect(App.app).is.null;
		await App.boot();
		expect(App.app).is.not.null;
		expect(App.app && App.app.isReady).is.true;
	});
});
