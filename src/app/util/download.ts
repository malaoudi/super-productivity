import {IS_ELECTRON} from '../app.constants';
import {IPC_DOWNLOAD} from '../../../electron/ipc-events.const';

export function download(filename: string, stringData: string) {
  if (IS_ELECTRON) {
    _downloadElectron(filename, stringData);
  } else {
    _downloadBrowser(filename, stringData);
  }
}

function _downloadElectron(filename: string, stringData: string) {
  const electron = window['require']('electron');
  electron.ipcRenderer.send(IPC_DOWNLOAD, {
    filename,
    stringData,
  });
}

function _downloadBrowser(filename: string, stringData: string) {
  const element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(stringData));
  element.setAttribute('download', filename);

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}

