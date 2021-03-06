import { assert } from 'chai';

import { parseStream } from '../lib';
import { IHttpClient, HttpClient } from './http-client';
import { IFileInfo } from 'strtok3';

interface IHttpClientTest {
  readonly name: string;
  client: IHttpClient;
}

const clients: IHttpClientTest[] = [
  {
    name: 'http',
    client: new HttpClient()
  }
];

// Skipped: https://github.com/Borewit/music-metadata/issues/160
describe('HTTP streaming', function() {

  // Increase time-out to 15 seconds because we retrieve files over HTTP(s)
  this.timeout(15 * 1000);
  this.retries(3); // Workaround for HTTP time-outs on Travis-CI

  describe('Stream HTTP using different clients', () => {

    clients.forEach(test => {

      describe(`HTTP client: ${test.name}`, () => {

        [true, false].forEach(hasContentLength => {

          it(`Should be able to parse M4A ${hasContentLength ? 'with' : 'without'} content-length specified`, async () => {

            const url = 'https://tunalib.s3.eu-central-1.amazonaws.com/plan.m4a';

            const response = await test.client.get(url);

            const fileInfo: IFileInfo = {
              mimeType: response.headers['content-type']
            };
            if (hasContentLength) {
              fileInfo.size = parseInt(response.headers['content-length'], 10); // Always pass this in production
            }

            const tags = await parseStream(response.stream, fileInfo);
            if (response.stream.destroy) {
              response.stream.destroy(); // Node >= v8 only
            }
            assert.strictEqual(tags.format.container, 'isom/mp42/M4A');
            assert.strictEqual(tags.format.codec, 'MPEG-4/AAC');
            assert.strictEqual(tags.format.lossless, false);

            assert.strictEqual(tags.common.title, 'We Made a Plan');
            assert.strictEqual(tags.common.artist, 'Adan Cruz');
            assert.strictEqual(tags.common.album, 'Quiérelo');
          });

        });

      });
    });
  });

});
