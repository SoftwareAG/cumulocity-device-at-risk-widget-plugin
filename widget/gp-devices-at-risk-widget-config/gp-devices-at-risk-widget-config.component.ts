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
import { Component, OnInit, Input, ViewEncapsulation, isDevMode, DoCheck} from '@angular/core';
import { GpDevicesAtRiskWidgetService } from '../gp-devices-at-risk-widget.service';
export interface DashboardConfig {
  type?: any;
  dashboarId?: string;
  tabGroupID?: string;
  tabGroup?: boolean;
}
@Component({
  selector: 'lib-gp-devices-at-risk-widget-config',
  templateUrl: './gp-devices-at-risk-widget-config.component.html',
  styleUrls: ['./gp-devices-at-risk-widget-config.component.css'],
  encapsulation: ViewEncapsulation.None
})

export class GpDevicesAtRiskWidgetConfigComponent implements OnInit, DoCheck {
  propertiesToDisplay: any[];
  selected: any[] = [];
  dashboardList: DashboardConfig[] = [];
  isExpandedDBS = false;
  deviceTypes = null;
  appId = null;
  configDevice = null;
  constructor(private deviceListService: GpDevicesAtRiskWidgetService) { }
  @Input() config: any = {};
  ngOnInit() {
    this.propertiesToDisplay = [
      { id: 'id', name: 'ID' },
      { id: 'name', name: 'Device Name' },
      { id: 'alarms', name: 'Alarms' },
      { id: 'externalid', name: 'External Id'},
      {id: 'firmware', name: 'Firmware'},
      {id: 'availability', name: 'Availability' }
  ];
    this.appId = this.deviceListService.getAppId();
    if (!this.config.dashboardList && this.appId) {
      const dashboardObj: DashboardConfig = {};
      dashboardObj.type = 'All';
      this.dashboardList.push(dashboardObj);
      this.config.dashboardList = this.dashboardList;
    }
    if (!this.config.device) {
      this.config.device = {};
    } else {
    this.configDevice = this.config.device.id;
    if (this.appId) {
      this.getAllDevices(this.configDevice);
    }
  }
    if (this.config.withTabGroup === undefined) {
      this.config.withTabGroup = false;
    }
  }
  ngDoCheck(): void {
    if (this.config.device && this.config.device.id  && this.config.device.id !== this.configDevice) {
      this.configDevice = this.config.device.id;
      this.getAllDevices(this.configDevice);
    }
  }

  onColChange() {
    this.selected = this.config.selectedInputs;
  }
  private getAllDevices(deviceId: string) {
    const deviceList: any = null;
    this.deviceListService.getAllDevices(deviceId,1, deviceList)
      .then((deviceFound) => {
        this.deviceTypes = Array.from(new Set(deviceFound.data.map(item => item.type)));
        this.deviceTypes = this.deviceTypes.filter(n => n);
      })
      .catch((err) => {
        if (isDevMode()) { console.log('+-+- ERROR while getting ALL devices ', err); }
      });
  }
  addNewRecord(currentIndex) {
    if ((currentIndex + 1) === this.config.dashboardList.length) {
      const dashboardObj: DashboardConfig = {};
      dashboardObj.type = 'All';
      this.config.dashboardList.push(dashboardObj);
    }
  }
}
