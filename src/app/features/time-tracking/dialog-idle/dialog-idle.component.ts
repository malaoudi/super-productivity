import {ChangeDetectionStrategy, Component, Inject, OnInit} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {TaskService} from '../../tasks/task.service';
import {Observable} from 'rxjs';
import {Task} from '../../tasks/task.model';
import {GlobalConfigService} from '../../config/global-config.service';
import {MetricService} from '../../metric/metric.service';

@Component({
  selector: 'dialog-idle',
  templateUrl: './dialog-idle.component.html',
  styleUrls: ['./dialog-idle.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DialogIdleComponent implements OnInit {
  public lastCurrentTask$: Observable<Task> = this._taskService.getById$(this.data.lastCurrentTaskId);
  public selectedTask: Task;
  public newTaskTitle: string;
  public isCreate: boolean;

  constructor(
    public configService: GlobalConfigService,
    private _taskService: TaskService,
    private _metricService: MetricService,
    private _matDialogRef: MatDialogRef<DialogIdleComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
    _matDialogRef.disableClose = true;
  }

  ngOnInit() {
    this.lastCurrentTask$.subscribe((task) => {
      this.selectedTask = task;
      this.isCreate = false;
    });
  }

  onTaskChange(taskOrTaskTitle: Task | string) {
    this.isCreate = (typeof taskOrTaskTitle === 'string');
    if (this.isCreate) {
      this.newTaskTitle = taskOrTaskTitle as string;
      this.selectedTask = null;
    } else {
      this.selectedTask = taskOrTaskTitle as Task;
      this.newTaskTitle = null;
    }
  }

  skipTrack() {
    this._matDialogRef.close({
      task: null,
      isResetBreakTimer: true
    });
  }

  trackAsBreak() {
    this._matDialogRef.close({
      task: null,
      isResetBreakTimer: true,
      isTrackAsBreak: true,
    });
  }

  track(isTrackAsBreak = false) {
    this._matDialogRef.close({
      task: this.selectedTask || this.newTaskTitle,
      isTrackAsBreak,
      isResetBreakTimer: isTrackAsBreak,
    });
  }
}
