import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {
  BreakNr,
  BreakTime,
  ExportedProject,
  GoogleTimeSheetExport,
  Project,
  ProjectAdvancedCfg,
  ProjectAdvancedCfgKey,
  ProjectBasicCfg,
  SimpleSummarySettings,
  WorklogExportSettings
} from './project.model';
import {PersistenceService} from '../../core/persistence/persistence.service';
import {select, Store} from '@ngrx/store';
import {ProjectActionTypes, UpdateProjectOrder} from './store/project.actions';
import shortid from 'shortid';
import {
  initialProjectState,
  ProjectState,
  selectAdvancedProjectCfg,
  selectArchivedProjects,
  selectCurrentProject,
  selectCurrentProjectId,
  selectIsRelatedDataLoadedForCurrentProject,
  selectProjectBasicCfg,
  selectProjectBreakNr,
  selectProjectBreakNrForDay,
  selectProjectBreakTime,
  selectProjectBreakTimeForDay,
  selectProjectById,
  selectProjectLastCompletedDay,
  selectProjectGithubCfg,
  selectProjectJiraCfg,
  selectProjectLastWorkEnd,
  selectProjectWorkEndForDay,
  selectProjectWorkStartForDay,
  selectUnarchivedProjects
} from './store/project.reducer';
import {IssueIntegrationCfg, IssueProviderKey} from '../issue/issue';
import {JiraCfg} from '../issue/jira/jira';
import {getWorklogStr} from '../../util/get-work-log-str';
import {GithubCfg} from '../issue/github/github';
import {Actions, ofType} from '@ngrx/effects';
import {distinctUntilChanged, take} from 'rxjs/operators';
import {isValidProjectExport} from './util/is-valid-project-export';
import {SnackService} from '../../core/snack/snack.service';
import {migrateProjectState} from './migrate-projects-state.util';

@Injectable({
  providedIn: 'root',
})
export class ProjectService {
  isRelatedDataLoadedForCurrentProject$: Observable<boolean> = this._store$.pipe(select(selectIsRelatedDataLoadedForCurrentProject));

  list$: Observable<Project[]> = this._store$.pipe(select(selectUnarchivedProjects));
  archived$: Observable<Project[]> = this._store$.pipe(select(selectArchivedProjects));
  currentProject$: Observable<Project> = this._store$.pipe(
    select(selectCurrentProject),
    // TODO investigate share replay issues
    // shareReplay(),
  );
  currentJiraCfg$: Observable<JiraCfg> = this._store$.pipe(
    select(selectProjectJiraCfg),
    // shareReplay(),
  );
  currentGithubCfg$: Observable<GithubCfg> = this._store$.pipe(
    select(selectProjectGithubCfg),
    // shareReplay(),
  );
  advancedCfg$: Observable<ProjectAdvancedCfg> = this._store$.pipe(
    select(selectAdvancedProjectCfg),
    // shareReplay(),
  );

  basicCfg$: Observable<ProjectBasicCfg> = this._store$.pipe(
    select(selectProjectBasicCfg),
    distinctUntilChanged((a, b) => !a || !b || (JSON.stringify(a) === JSON.stringify(b))),
  );

  currentId$: Observable<string> = this._store$.pipe(
    select(selectCurrentProjectId),
    distinctUntilChanged(),
  );
  currentId: string;

  onProjectChange$: Observable<any> = this._actions$.pipe(ofType(ProjectActionTypes.SetCurrentProject));

  onProjectRelatedDataLoaded$: Observable<any> = this._actions$.pipe(ofType(ProjectActionTypes.LoadProjectRelatedDataSuccess));

  breakTime$: Observable<BreakTime> = this._store$.pipe(select(selectProjectBreakTime));
  breakNr$: Observable<BreakNr> = this._store$.pipe(select(selectProjectBreakNr));

  lastWorkEnd$: Observable<number> = this._store$.pipe(select(selectProjectLastWorkEnd));

  lastCompletedDay$: Observable<string> = this._store$.pipe(select(selectProjectLastCompletedDay));


  constructor(
    private readonly _persistenceService: PersistenceService,
    private readonly _snackService: SnackService,
    // TODO correct type?
    private readonly _store$: Store<any>,
    private readonly _actions$: Actions,
  ) {
    this.currentId$.subscribe((id) => this.currentId = id);
  }

  async load() {
    const projectState_ = await this._persistenceService.project.load() || initialProjectState;
    // we need to do this to migrate to the latest model if new fields are added
    const projectState = migrateProjectState(projectState_);

    if (projectState) {
      if (!projectState.currentId) {
        projectState.currentId = projectState.ids[0] as string;
      }
      this.loadState(projectState);
    }
  }

  loadState(projectState: ProjectState) {
    this._store$.dispatch({
      type: ProjectActionTypes.LoadProjectState,
      payload: {state: projectState}
    });
  }

  archive(projectId: string) {
    this._store$.dispatch({
      type: ProjectActionTypes.ArchiveProject,
      payload: {id: projectId}
    });
  }

  unarchive(projectId: string) {
    this._store$.dispatch({
      type: ProjectActionTypes.UnarchiveProject,
      payload: {id: projectId}
    });
  }

  // TODO add $
  getById$(id: string): Observable<Project> {
    return this._store$.pipe(select(selectProjectById, {id}), take(1));
  }

  // TODO consistent naming
  getWorkStart$(day: string = getWorklogStr()): Observable<number> {
    return this._store$.pipe(select(selectProjectWorkStartForDay, {day}));
  }

  getWorkEnd$(day: string = getWorklogStr()): Observable<number> {
    return this._store$.pipe(select(selectProjectWorkEndForDay, {day}));
  }

  getBreakTime$(day: string = getWorklogStr()): Observable<number> {
    return this._store$.pipe(select(selectProjectBreakTimeForDay, {day}));
  }

  getBreakNr$(day: string = getWorklogStr()): Observable<number> {
    return this._store$.pipe(select(selectProjectBreakNrForDay, {day}));
  }

  add(project: Partial<Project>) {
    this._store$.dispatch({
      type: ProjectActionTypes.AddProject,
      payload: {
        project: Object.assign(project, {
          id: shortid(),
        })
      }
    });
  }

  upsert(project: Partial<Project>) {
    this._store$.dispatch({
      type: ProjectActionTypes.AddProject,
      payload: {
        project: {
          id: project.id || shortid(),
          ...project
        }
      }
    });
  }

  remove(projectId) {
    this._store$.dispatch({
      type: ProjectActionTypes.DeleteProject,
      payload: {id: projectId}
    });
  }

  update(projectId: string, changedFields: Partial<Project>) {
    this._store$.dispatch({
      type: ProjectActionTypes.UpdateProject,
      payload: {
        project: {
          id: projectId,
          changes: changedFields
        }
      }
    });
  }

  updateWorkStart(id, date: string, newVal: number) {
    this._store$.dispatch({
      type: ProjectActionTypes.UpdateProjectWorkStart,
      payload: {
        id,
        date,
        newVal,
      }
    });
  }

  updateWorkEnd(id, date: string, newVal: number) {
    this._store$.dispatch({
      type: ProjectActionTypes.UpdateProjectWorkEnd,
      payload: {
        id,
        date,
        newVal,
      }
    });
  }

  updateLastCompletedDay(id = this.currentId, date: string) {
    this._store$.dispatch({
      type: ProjectActionTypes.UpdateLastCompletedDay,
      payload: {
        id,
        date,
      }
    });
  }

  addToBreakTime(id = this.currentId, date: string = getWorklogStr(), val: number) {
    this._store$.dispatch({
      type: ProjectActionTypes.AddToProjectBreakTime,
      payload: {
        id,
        date,
        val,
      }
    });
  }

  updateAdvancedCfg(projectId: string, sectionKey: ProjectAdvancedCfgKey, data: any) {
    this._store$.dispatch({
      type: ProjectActionTypes.UpdateProjectAdvancedCfg,
      payload: {
        projectId,
        sectionKey,
        data,
      }
    });
  }

  updateIssueProviderConfig(
    projectId: string,
    issueProviderKey: IssueProviderKey,
    providerCfg: IssueIntegrationCfg,
    isOverwrite = false
  ) {
    this._store$.dispatch({
      type: ProjectActionTypes.UpdateProjectIssueProviderCfg,
      payload: {
        projectId,
        issueProviderKey,
        providerCfg,
        isOverwrite
      }
    });
  }

  setCurrentId(projectId: string) {
    this._store$.dispatch({
      type: ProjectActionTypes.SetCurrentProject,
      payload: projectId,
    });
  }

  updateOrder(ids: string[]) {
    this._store$.dispatch(new UpdateProjectOrder({ids}));
  }

  // DB INTERFACE
  async importCompleteProject(data: ExportedProject): Promise<any> {
    console.log(data);
    const {relatedModels, ...project} = data;
    if (isValidProjectExport(data)) {
      const state = await this._persistenceService.project.load();
      if (state.entities[project.id]) {
        this._snackService.open({type: 'ERROR', msg: `Project "${project.title}" already exists`});
      } else {
        await this._persistenceService.restoreCompleteRelatedDataForProject(project.id, relatedModels);
        this.upsert(project);
      }
    } else {
      this._snackService.open({type: 'ERROR', msg: 'Invalid data for project file'});
    }
  }

  // HELPER
  updateTimeSheetExportSettings(projectId: string, data: GoogleTimeSheetExport, isExport = false) {
    this.updateAdvancedCfg(projectId, 'googleTimeSheetExport', {
      ...data,
      ...(isExport ? {lastExported: getWorklogStr()} : {})
    });
  }

  // HELPER
  updateSimpleSummarySettings(projectId: string, data: SimpleSummarySettings) {
    this.updateAdvancedCfg(projectId, 'simpleSummarySettings', {
      ...data,
    });
  }

  updateWorklogExportSettings(projectId: string, data: WorklogExportSettings) {
    this.updateAdvancedCfg(projectId, 'worklogExportSettings', {
      ...data,
    });
  }
}
