var utils = require('../../../src/scripts/export/utils')

describe('utils module ', function () {

    it('createFilename will always return a name', function () {

        expect(utils.createFilename()).toBe('untitled.txt');
        expect(utils.createFilename('', '')).toBe('untitled.txt');
        expect(utils.createFilename('', 'png')).toBe('untitled.png');
        expect(utils.createFilename('mine', 'png')).toBe('mine.png');

    });
    it('createFilename replaces unhealthy characters', function () {

        expect(utils.createFilename()).toBe('untitled.txt');
        expect(utils.createFilename('naughty & nice !@£$€%^& (yo)')).toBe('naughty-and-nice-and-(yo).txt');

    });

});
