import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreModule } from '@ngrx/store';
import { CONFIG_FEATURE_NAME, globalConfigReducer } from './store/global-config.reducer';
import { EffectsModule } from '@ngrx/effects';
import { GlobalConfigEffects } from './store/global-config.effects';
import { ConfigSectionComponent } from './config-section/config-section.component';
import { ConfigFormComponent } from './config-form/config-form.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormlyModule } from '@ngx-formly/core';
import { FormlyMaterialModule } from '@ngx-formly/material';
import { UiModule } from '../../ui/ui.module';
import { KeyboardInputComponent } from './keyboard-input/keyboard-input.component';
import { GoogleSyncCfgComponent } from '../google/google-sync-cfg/google-sync-cfg.component';
import { FileImexModule } from '../../imex/file-imex/file-imex.module';

@NgModule({
  imports: [
    FormsModule,
    ReactiveFormsModule,
    FormlyModule.forChild({
      types: [{
        name: 'keyboard',
        component: KeyboardInputComponent,
        extends: 'input',
        wrappers: ['form-field'],
      }]
    }),
    FormlyMaterialModule,
    CommonModule,
    StoreModule.forFeature(CONFIG_FEATURE_NAME, globalConfigReducer),
    EffectsModule.forFeature([GlobalConfigEffects]),
    UiModule,
    FileImexModule,
  ],
  declarations: [
    GoogleSyncCfgComponent,
    ConfigSectionComponent,
    ConfigFormComponent,
    KeyboardInputComponent
  ],
  entryComponents: [
    GoogleSyncCfgComponent,
  ],
  exports: [
    ConfigSectionComponent,
    ConfigFormComponent
  ],
})
export class ConfigModule {
}
