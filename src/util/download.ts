import fs from 'fs';
import log from 'electron-log';
import { Series } from '@tiyo/common';
import { ipcRenderer } from 'electron';
import { getThumbnailPath } from './filesystem';
import ipcChannels from '../constants/ipcChannels.json';

/**
 * Download a series' cover to the filesystem.
 * The cover is saved in the internal thumbnail directory; see getThumbnailPath.
 * @param series the series to download cover for
 */
// eslint-disable-next-line import/prefer-default-export
export async function downloadCover(series: Series) {
  const thumbnailPath = await getThumbnailPath(series);
  if (thumbnailPath === null) return;

  log.debug(
    `Downloading cover for series ${series.id} (sourceId=${series.sourceId}, extId=${series.extensionId}) from ${series.remoteCoverUrl}`
  );

  ipcRenderer
    .invoke(ipcChannels.EXTENSION.GET_IMAGE, series.extensionId, series, series.remoteCoverUrl)
    .then((data) => {
      if (typeof data === 'string') {
        return data;
      }
      return URL.createObjectURL(new Blob([data]));
    })
    .then((url) => fetch(url))
    .then((response) => response.arrayBuffer())
    .then((buffer) => {
      fs.writeFile(thumbnailPath, Buffer.from(buffer), (err) => {
        if (err) {
          log.error(err);
        }
      });
    })
    .catch((e: Error) => log.error(e));
}
