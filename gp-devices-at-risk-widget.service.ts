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

import { Injectable } from '@angular/core';
import { IdentityService, IManagedObject, IResultList, Severity, IAlarm } from '@c8y/client';
import { InventoryService, AlarmService, Realtime } from '@c8y/ngx-components/api';

@Injectable({providedIn:'root'})
export class GpDevicesAtRiskWidgetService {

  constructor(public inventory: InventoryService,
    public identity: IdentityService,
    public realtimeService: Realtime,
    private alarmService: AlarmService
  ) { }

  // Variables
  response: any;
  deviceResponse: any;
  dataSource: any;
  devicesAll: any;
  alldeviceid: any;
  realTimeDeviceSub;


  devicesAtRisk: Device[] = [];
  latestFirmwareVersion = 0;
  getAppId() {
    const currentURL = window.location.href;
    const routeParam = currentURL.split('#');
    if (routeParam.length > 1) {
      const appParamArray = routeParam[1].split('/');
      const appIndex = appParamArray.indexOf('application');
      if (appIndex !== -1) {
        return appParamArray[appIndex + 1];
      }
    }
    return '';
  }
  getAllDevices(id: string, pageToGet: number, allDevices: { data: any[], res: any }): Promise<IResultList<IManagedObject>> {
    const inventoryFilter = {
      // fragmentType: 'c8y_IsDevice',
      pageSize: 50,
      withTotalPages: true,
      currentPage: pageToGet
    };
    if (!allDevices) {
      allDevices = { data: [], res: null };
    }

    return new Promise(
      (resolve, reject) => {
        this.inventory.childAssetsList(id, inventoryFilter)
          .then((resp) => {
            if (resp.res.status === 200) {
              if (resp.data && resp.data.length >= 0) {
                allDevices.data.push.apply(allDevices.data, resp.data);
                if (resp.data.length < inventoryFilter.pageSize) {
                  resolve(allDevices);
                } else {
                  this.getAllDevices(id, resp.paging.nextPage, allDevices)
                    .then((np) => {
                      resolve(allDevices);
                    })
                    .catch((err) => reject(err));
                }
              }
            } else {
              reject(resp);
            }
          });
      });

  }
  async getDeviceList(config, displayedColumns) {
    this.alldeviceid = [];
    // Clear array
    this.devicesAtRisk.length = 0;

    const inventory = await this.inventory.detail(config.device.id);


    this.response = inventory.data;

    const firmwareData = await this.inventory.list({ type: 'sag_racm_currentFirmware' });
    if (firmwareData.data.length > 0) {
      this.latestFirmwareVersion = firmwareData.data[0].firmware.version;
    }

    // Check that the response is a Group and not a device
    if (this.response.hasOwnProperty('c8y_IsDevice')) {
      alert('Please select a group for this widget to function correctly');
    } else {
      // Get List of devices
      this.devicesAll = this.response.childAssets.references;

      // Check each device to see if there are any active ale rts
      // MAP***********************
      const promises = this.devicesAll.map(async (device) => {

        // tslint:disable-next-line: no-shadowed-variable
        const inventory = await this.inventory.detail(device.managedObject.id);
        this.alldeviceid.push(device.managedObject.id);
        const childDevice = inventory.data;

        const x = await this.fetchData(childDevice, displayedColumns);

        if (x != null) {
          if (x.availability === 'PARTIAL' || x.alarms || x.firmware || x.availability === 'UNAVAILABLE') {
            this.devicesAtRisk.push(x);
          }
        }
      });

      await Promise.all(promises);

    }
    this.devicesAtRisk.sort((a, b) => (a.alarms.localeCompare(b.alarms)));

    return this.devicesAtRisk;

  }
  async fetchData(childDevice, displayedColumns) {
    let childdeviceAvail = '';
    let alertDesc = '';
    let atRisk = false;

    let firmwaredesc = '';
    if (childDevice && displayedColumns.length > 0) {

      let dashboardId = '';
      let tabGroup = '';
      let type = '';
      let childdevices1: any = '';

      if (childDevice.deviceListDynamicDashboards && childDevice.deviceListDynamicDashboards.length > 0) {
        dashboardId = childDevice.deviceListDynamicDashboards[0].dashboardId;
        tabGroup = childDevice.deviceListDynamicDashboards[0].tabGroup;
      }
      if (childDevice.type) {
        type = childDevice.type;
      }


      if (displayedColumns.includes('externalid')) {

        const identity = await this.identity.list(childDevice.id);
        if (identity.data.length > 0) {
          const externalId = identity.data[0].externalId;
          childDevice.externalId = externalId;
        }

      }

      if (displayedColumns.includes('firmware')) {
        const firmwareStatus = childDevice.c8y_Firmware;
        let versionIssues = 0;
        if (firmwareStatus && firmwareStatus.version) {
          versionIssues = firmwareStatus.version - this.latestFirmwareVersion;
        }
        if (versionIssues < 0) {
          atRisk = true;
        }
        if (atRisk) {
          if (versionIssues >= 0) {
            firmwaredesc = 'No Risk';
          } else if (versionIssues === -1) {
            firmwaredesc = 'Low Risk';
          } else if (versionIssues === -2) {
            firmwaredesc = 'Medium Risk';
          } else if (versionIssues <= -3) {
            firmwaredesc = 'High Risk';
          }
        } else {
          firmwaredesc = 'No Risk';
        }
      }

      let parentCounter = 0;
      // Check for child Devices


      if (childDevice.hasOwnProperty('c8y_IsDevice') && (childDevice.childDevices.references.length > 0)) {

        childdevices1 = childDevice.childDevices.references;


      } else if (childDevice.hasOwnProperty('c8y_IsAsset') && (childDevice.childAssets.references.length > 0)) {
        childdevices1 = childDevice.childAssets.references;
      }

      // tslint:disable-next-line: triple-equals
      if (childdevices1 != '') {


        const promises1 = childdevices1.map(async (device) => {
          const inventory1 = await this.inventory.detail(device.managedObject.id);
          this.alldeviceid.push(device.managedObject.id);
          // tslint:disable-next-line: variable-name
          const child_childDevice = inventory1.data;

          if (displayedColumns.includes('availability')) {

            // tslint:disable-next-line: max-line-length
            if (childDevice.hasOwnProperty('c8y_Availability') && child_childDevice.hasOwnProperty('c8y_Availability') && childDevice.c8y_Availability.status === 'AVAILABLE' && child_childDevice.c8y_Availability.status === 'AVAILABLE') {

              childdeviceAvail = 'AVAILABLE';
              // tslint:disable-next-line: max-line-length
            } else if (childDevice.hasOwnProperty('c8y_Availability') && child_childDevice.hasOwnProperty('c8y_Availability') && childDevice.c8y_Availability.status === 'AVAILABLE' && child_childDevice.c8y_Availability.status === 'UNAVAILABLE') {
              childdeviceAvail = 'PARTIAL';
              // tslint:disable-next-line: max-line-length
            } else if (childDevice.hasOwnProperty('c8y_Availability') && child_childDevice.hasOwnProperty('c8y_Availability') && childDevice.c8y_Availability.status === 'UNAVAILABLE' && child_childDevice.c8y_Availability.status === 'AVAILABLE') {
              childdeviceAvail = 'PARTIAL';
            } else {
              childdeviceAvail = 'UNAVAILABLE';
            }

          }


          if (displayedColumns.includes('availability') && childDevice.hasOwnProperty('c8y_IsAsset')) {

            if (child_childDevice.hasOwnProperty('c8y_Availability') && child_childDevice.c8y_Availability.status === 'AVAILABLE') {

              childdeviceAvail = 'AVAILABLE';
            } else {
              childdeviceAvail = 'UNAVAILABLE';
            }

          }

          if (displayedColumns.includes('alarms') && childDevice.hasOwnProperty('c8y_IsDevice')) {

            const activeAlerts = childDevice.c8y_ActiveAlarmsStatus;
            const childactiveAlerts = child_childDevice.c8y_ActiveAlarmsStatus;

            if (activeAlerts !== undefined && parentCounter === 0) {
              alertDesc += this.getAlertDescription(activeAlerts);

              parentCounter += 1;
            }

            if (childactiveAlerts !== undefined) {
              alertDesc += this.getAlertDescription(childactiveAlerts);
            }

          }



        });
        await Promise.all(promises1);

        if (displayedColumns.includes('alarms') && childDevice.hasOwnProperty('c8y_IsAsset')) {
          const activeAlarms = await this.getAlarmsForAsset(childDevice);
          alertDesc += this.getAlertDescription(activeAlarms);
        }

      } else {

        if (displayedColumns.includes('availability')) {
          if (childDevice.hasOwnProperty('c8y_Availability') && childDevice.c8y_Availability.status === 'AVAILABLE') {
            childdeviceAvail = 'AVAILABLE';
          } else {
            childdeviceAvail = 'UNAVAILABLE';
          }

        }


        if (displayedColumns.includes('alarms')) {

          if (childDevice.hasOwnProperty('c8y_IsDevice')) {
            const activeAlerts = childDevice.c8y_ActiveAlarmsStatus;
            alertDesc += this.getAlertDescription(activeAlerts);
          } else if (childDevice.hasOwnProperty('c8y_IsAsset')) {
            const activeAlarms = await this.getAlarmsForAsset(childDevice);
            alertDesc += this.getAlertDescription(activeAlarms);
          }
        }



      }

      const temp: Device = {
        id: childDevice.id,
        name: childDevice.name,
        type,
        alarms: (alertDesc ? alertDesc : ''),
        firmware: (firmwaredesc ? firmwaredesc : ''),
        connection: (childDevice.c8y_Connection && childDevice.c8y_Connection.status ? childDevice.c8y_Connection.status : ''),
        availability: (childdeviceAvail ? childdeviceAvail : ''),
        externalid: (childDevice.externalId ? childDevice.externalId : ''),
        dashboardId,
        tabGroup
      };

      return temp;
    }
    return null;
  }

  private getAlertDescription(activeAlarmStatus: object): string {
    let majorAlerts = false;
    let minorAlerts = false;
    let criticalAlerts = false;
    let alertDesc = '';

    if (activeAlarmStatus !== undefined) {
      if (activeAlarmStatus.hasOwnProperty('minor')) {
        // tslint:disable-next-line: no-string-literal
        if (activeAlarmStatus['minor'] > 0) { minorAlerts = true; }
      }
      if (activeAlarmStatus.hasOwnProperty('major')) {
        // tslint:disable-next-line: no-string-literal
        if (activeAlarmStatus['major'] > 0) { majorAlerts = true; }
      }
      if (activeAlarmStatus.hasOwnProperty('critical')) {
        // tslint:disable-next-line: no-string-literal
        if (activeAlarmStatus['critical'] > 0) { criticalAlerts = true; }
      }
    }

    if (minorAlerts || majorAlerts || criticalAlerts) {
      // tslint:disable-next-line: no-string-literal
      if (criticalAlerts) { alertDesc += 'Critical(' + activeAlarmStatus['critical'] + ')'; }
      // tslint:disable-next-line: no-string-literal
      if (majorAlerts) { alertDesc += 'Major(' + activeAlarmStatus['major'] + ')'; }
      // tslint:disable-next-line: no-string-literal
      if (minorAlerts) { alertDesc += 'Minor(' + activeAlarmStatus['minor'] + ')'; }
    }

    return alertDesc;
  }

  async getAlarmsForAsset(asset: IManagedObject): Promise<{
    minor: number,
    major: number,
    critical: number,
    warning: number
  }> {
    const filter = {
      dateFrom: '1970-01-01',
      dateTo: new Date().toISOString(),
      pageSize: 2000,
      severity: 'WARNING,MINOR,MAJOR,CRITICAL',
      source: asset.id,
      status: 'ACTIVE',
      withSourceAssets: true,
      withSourceDevices: true
    };

    const alarms = (await this.alarmService.list(filter)).data;
    const alarmCount = this.calculateAlarmCounts(alarms);

    return alarmCount;
  }

  private calculateAlarmCounts(alarms: IAlarm[]): {
    minor: number,
    major: number,
    critical: number,
    warning: number
  } {
    const alarmCount = {
      minor: 0,
      major: 0,
      critical: 0,
      warning: 0
    };

    alarms.forEach(alarm => {
      if (alarm.severity === Severity.CRITICAL) {
        alarmCount.critical += alarm.count;
      } else if (alarm.severity === Severity.MAJOR) {
        alarmCount.major += alarm.count;
      } else if (alarm.severity === Severity.MINOR) {
        alarmCount.minor += alarm.count;
      } else if (alarm.severity === Severity.WARNING) {
        alarmCount.warning += alarm.count;
      }
    });

    return alarmCount;
  }
}

export interface Device {
  id?: string;
  name?: string;
  type?: string;
  alarms?: string;
  firmware?: string;
  connection?: string;
  availability?: string;
  externalid?: string;
  dashboardId?: string;
  tabGroup?: string;
}
