import {ErrorHandler, Injectable} from '@angular/core';
import {isObject} from '../../util/is-object';
import {getJiraResponseErrorTxt} from '../../util/get-jira-response-error-text';
import {HANDLED_ERROR, IS_ELECTRON} from '../../app.constants';
import {ElectronService} from 'ngx-electron';
import {BannerService} from '../banner/banner.service';
import {BannerId} from '../banner/banner.model';

const _createErrorAlert = (err: string) => {
  const errorAlert = document.createElement('div');
  errorAlert.classList.add('global-error-alert');
  errorAlert.innerHTML = `
    <h2>An error occurred<h2>
    <p><a href="https://github.com/johannesjo/super-productivity/issues/new" target="_blank">Please Report</a></p>
    <pre>${err}</pre>
    `;
  const btnReload = document.createElement('BUTTON');
  btnReload.innerText = 'Reload App';
  btnReload.addEventListener('click', () => {
    window.location.reload();
  });
  errorAlert.append(btnReload);
  document.body.append(errorAlert);
};

// chrome only??
const _getStackTrace = () => {
  const obj: any = {};
  Error.captureStackTrace(obj, _getStackTrace);
  return obj.stack;
};


@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  private _electronLogger: any;

  constructor(
    private _bannerService: BannerService,
    private _electronService: ElectronService,
  ) {
    if (IS_ELECTRON) {
      this._electronLogger = this._electronService.remote.require('electron-log');
    }
  }

  // TODO Cleanup this mess
  handleError(err: any) {
    const errStr = (typeof err === 'string') ? err : err.toString();

    // if not our custom error handler we have a critical error on our hands
    if (!err || (!err.handledError && (errStr && !errStr.match(HANDLED_ERROR)))) {
      const errorStr = this._getErrorStr(err) || errStr;

      // NOTE: snack won't work most of the time
      try {
        this._bannerService.open({
          id: BannerId.GlobalError,
          type: 'ERROR',
          ico: 'error',
          msg: 'ERROR: ' + errorStr.substring(0, 300),
          action: {
            label: 'Report',
            fn: () => window.open('https://github.com/johannesjo/super-productivity/issues/new'),
          },
          action2: {
            label: 'Reload App',
            fn: () => window.location.reload()
          },
          action3: {
            label: 'Dismiss',
            fn: () => {
            }
          }
        });
      } catch (e) {
        _createErrorAlert(errorStr);
      }
    }
    console.error('GLOBAL_ERROR_HANDLER', err);
    if (IS_ELECTRON) {
      let stackTrace;
      try {
        stackTrace = _getStackTrace();
      } catch (e) {
        stackTrace = '';
      }
      this._electronLogger.error('Frontend Error:', err, stackTrace);
    }

    // NOTE: rethrow the error otherwise it gets swallowed
    throw err;
  }

  private _getErrorStr(err: any): string {
    if (isObject(err)) {
      return getJiraResponseErrorTxt(err);
    } else {
      return err.toString();
    }
  }
}
