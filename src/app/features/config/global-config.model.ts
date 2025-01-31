import { FormlyFieldConfig } from '@ngx-formly/core';
import { ProjectCfgFormKey } from '../project/project.model';

export type KeyboardConfig = Readonly<{
  globalShowHide: string,
  toggleBacklog: string,
  goToWorkView: string,
  goToFocusMode: string,
  goToDailyAgenda: string,
  goToSettings: string,
  addNewTask: string,
  globalToggleTaskStart: string,
  showHelp: string,
  addNewNote: string,
  openProjectNotes: string,
  toggleBookmarks: string;
  openDistractionPanel: string,
  zoomIn: string,
  zoomOut: string,
  zoomDefault: string,
  focusLastActiveTask: string,
  taskEditTitle: string,
  taskToggleAdditionalInfoOpen: string,
  taskOpenEstimationDialog: string,
  taskToggleDone: string,
  taskAddSubTask: string,
  taskDelete: string,
  taskSchedule: string,
  selectPreviousTask: string,
  selectNextTask: string,
  moveTaskUp: string,
  moveTaskDown: string,
  moveToBacklog: string,
  moveToTodaysTasks: string,
  expandSubTasks: string,
  collapseSubTasks: string,
  togglePlay: string,
}>;


export type MiscConfig = Readonly<{
  isHideNav: boolean;
  isAutMarkParentAsDone: boolean;
  isConfirmBeforeExit: boolean;
  isNotifyWhenTimeEstimateExceeded: boolean;
  isDisableRemindWhenForgotToFinishDay: boolean;
}>;

export type IdleConfig = Readonly<{
  isEnableIdleTimeTracking: boolean;
  isUnTrackedIdleResetsBreakTimer: boolean;
  minIdleTime: number;
  isOnlyOpenIdleWhenCurrentTask: boolean;
}>;

export type TakeABreakConfig = Readonly<{
  isTakeABreakEnabled: boolean;
  takeABreakMessage: string;
  takeABreakMinWorkingTime: number;
}>;


export type PomodoroConfig = Readonly<{
  isEnabled: boolean;
  isStopTrackingOnBreak: boolean;
  isStopTrackingOnLongBreak: boolean;
  isManualContinue: boolean;
  isPlaySound: boolean;
  isPlaySoundAfterBreak: boolean;
  // isGoToWorkView: boolean;
  isPlayTick: boolean;

  duration: number;
  breakDuration: number;
  longerBreakDuration: number;
  cyclesBeforeLongerBreak: number;
}>;

// NOTE: needs to be writable due to how we use it
export interface GoogleDriveSyncConfig {
  isEnabled: boolean;
  isAutoLogin: boolean;
  isAutoSyncToRemote: boolean;
  isNotifyOnSync: boolean;
  isLoadRemoteDataOnStartup: boolean;
  isCompressData: boolean;
  syncInterval: number;
  syncFileName: string;
  _lastSync: string;
  _backupDocId: string;
}


// SETTINGS (not configurable under config)
export type UiHelperSettings = Readonly<{
  _zoomFactor: number;
}>;

export type GoogleSession = Readonly<{
  accessToken: string,
  refreshToken: string,
  expiresAt: number,
}>;

export type LocalBackupConfig = Readonly<{
  isEnabled: boolean,
}>;


export type GlobalConfigState = Readonly<{
  misc: MiscConfig;
  idle: IdleConfig;
  takeABreak: TakeABreakConfig;
  pomodoro: PomodoroConfig;
  googleDriveSync: GoogleDriveSyncConfig;
  keyboard: KeyboardConfig;
  localBackup: LocalBackupConfig,
  _googleSession: GoogleSession;
  _uiHelper: UiHelperSettings;
}>;


export type GlobalConfigSectionKey = keyof GlobalConfigState | 'EMPTY';

export type GlobalSectionConfig
  = MiscConfig
  | PomodoroConfig
  | KeyboardConfig
  | GoogleSession
  | UiHelperSettings
  ;

// Intermediate model
export interface ConfigFormSection {
  title: string;
  key: GlobalConfigSectionKey | ProjectCfgFormKey;
  help?: string;
  customSection?: string;
  items?: FormlyFieldConfig[];
  isElectronOnly?: boolean;
}

export type ConfigFormConfig = Readonly<ConfigFormSection[]>;


