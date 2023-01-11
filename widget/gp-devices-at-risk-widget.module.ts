/*
* Copyright (c) 2020 Software AG, Darmstadt, Germany and/or its licensors
*
* SPDX-License-Identifier: Apache-2.0
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
import { NgModule } from '@angular/core';
import { CoreModule, HOOK_COMPONENTS } from '@c8y/ngx-components';
import { GpDevicesAtRiskWidgetComponent } from './gp-devices-at-risk-widget.component';
import { MatTableModule } from '@angular/material/table';
import { GpDevicesAtRiskWidgetConfigComponent } from './gp-devices-at-risk-widget-config/gp-devices-at-risk-widget-config.component';
import * as preview from './preview-image';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { GpAlertModalComponent } from './gp-modal/gp-alert-modal.component';
import { PaginationModule } from 'ngx-bootstrap/pagination';
@NgModule({
  declarations: [GpDevicesAtRiskWidgetComponent, GpDevicesAtRiskWidgetConfigComponent, GpAlertModalComponent],
  imports: [
    MatTableModule,
    FormsModule,
    ReactiveFormsModule,
    NgSelectModule,
    CoreModule,
    PaginationModule.forRoot()
  ],

  exports: [GpDevicesAtRiskWidgetComponent, GpDevicesAtRiskWidgetConfigComponent, GpAlertModalComponent],
  entryComponents: [GpDevicesAtRiskWidgetComponent, GpDevicesAtRiskWidgetConfigComponent, GpAlertModalComponent],
  providers: [
    {
      provide: HOOK_COMPONENTS,
      multi: true,
      useValue: {
        id: 'devices-at-risk.widget',
        previewImage: preview.previewImage,
        label: 'Devices At Risk',
        description: 'The Device At Risk Widget is designed to get a list of devices based on a group selection and display any device that has a Critical/Major Alarm or Medium/High-Risk Firmware raised against it.',
        component: GpDevicesAtRiskWidgetComponent,
        configComponent: GpDevicesAtRiskWidgetConfigComponent
      }
    }],
})
export class GpDevicesAtRiskWidgetModule { }
