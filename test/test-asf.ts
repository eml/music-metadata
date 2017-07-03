import {} from "mocha";
import {assert} from 'chai';
import * as mm from '../src';
import {INativeTagDict} from "../src/index";
import * as path from 'path';

const t = assert;

it("should decode asf", () => {

  const filePath = path.join(__dirname, 'samples', 'asf.wma');

  function checkFormat(format) {
    t.strictEqual(format.duration, 244.885, 'format.duration');
    t.strictEqual(format.bitrate, 192639, 'format.bitrate');
  }

  function checkCommon(common) {
    t.strictEqual(common.title, "Don't Bring Me Down", 'common.title');
    t.deepEqual(common.artist, 'Electric Light Orchestra', 'common.artist');
    t.deepEqual(common.albumartist, 'Electric Light Orchestra', 'common.albumartist');
    t.strictEqual(common.album, 'Discovery', 'common.album');
    t.strictEqual(common.year, 2001, 'common.year');
    t.deepEqual(common.track, {no: 9, of: null}, 'common.track 9/0');
    t.deepEqual(common.disk, {no: null, of: null}, 'common.disk 0/0');
    t.deepEqual(common.genre, ['Rock'], 'common.genre');
  }

  function checkNative(native: INativeTagDict) {

    t.deepEqual(native['WM/AlbumTitle'], ['Discovery'], 'native: WM/AlbumTitle');
    t.deepEqual(native['WM/BeatsPerMinute'], [117], 'native: WM/BeatsPerMinute');
    t.deepEqual(native.REPLAYGAIN_TRACK_GAIN, ['-4.7 dB'], 'native: REPLAYGAIN_TRACK_GAIN');
  }

  return mm.parseFile(filePath, {native: true}).then((result) => {

    checkFormat(result.format);

    checkCommon(result.common);

    t.ok(result.native && result.native.asf, 'should include native ASF tags');
    checkNative(mm.orderTags(result.native.asf));
  });

});