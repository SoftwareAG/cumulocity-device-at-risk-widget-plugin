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
import { Component, OnInit, Input, ViewChild, OnDestroy, isDevMode } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { GpDevicesAtRiskWidgetService, Device } from './gp-devices-at-risk-widget.service';
import { Router } from '@angular/router';
import { InventoryService, Realtime } from '@c8y/ngx-components/api';
import { GpAlertModalComponent } from './gp-modal/gp-alert-modal.component';
import { BsModalService } from 'ngx-bootstrap/modal';
import { IdReference } from '@c8y/client';
@Component({
  selector: 'lib-gp-devices-at-risk-widget',
  templateUrl: 'gp-devices-at-risk-widget.html',
  styleUrls: ['material-grid.component.css']
})
export class GpDevicesAtRiskWidgetComponent implements OnInit, OnDestroy {
  displayedColumns: string[] = [];
  totalPages = 0;
  currentPage = 1;
  deviceAtRiskData = [];
  dataSource = new MatTableDataSource<Device>([]);
  allSubscriptions: any = [];
  realtimeState = true;
  configDashboardList = [];
  realTimeDeviceSub: object;
  appId = '';
  @Input() config: { 
    device: { id: IdReference; }; 
    pageSize: any; 
    dashboardList: any; 
    selectedInputs: any; 
    withTabGroup: boolean;
  };
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  constructor(
    private devicelist: GpDevicesAtRiskWidgetService,
    private inventory: InventoryService,
    private router: Router,
    private realtimeService: Realtime,
    private modalService: BsModalService) { }
  
  toggle() {
    this.realtimeState = !this.realtimeState;
    if (this.realtimeState) {
      this.handleReatime();
    } else {
      this.clearSubscriptions();
    }
  }
  async handleReatime() {
    // Check that the response is a Group and not a device
    this.deviceAtRiskData.map(async (device) => {
      const manaogedObjectChannel = `/managedobjects/${device.id}`;
      const detailSubs = this.realtimeService.subscribe(
        manaogedObjectChannel,
        (resp) => {

          const data = (resp.data ? resp.data.data : {});
          this.manageRealtime(data);
        }
      );
      if (this.realtimeState) {
        this.allSubscriptions.push({
          id: device.id,
          subs: detailSubs,
          type: 'Realtime',
        });
      } else {
        this.realtimeService.unsubscribe(detailSubs);
      }
    });
  }

  async manageRealtime(childDevice: { id: string; }) {
    if (this.realtimeState) {

      const tableData = this.dataSource.data.filter(singleDevice => singleDevice.id !== childDevice.id);
      const x = await this.devicelist.fetchData(childDevice, this.displayedColumns);
      if (x != null) {
        if (x.availability === 'PARTIAL' || x.alarms || x.firmware || x.availability === 'UNAVAILABLE') {
          tableData.push(x);
        }
      }
      this.dataSource.data = [...tableData];
    }
  }
  async ngOnInit() {
    if (isDevMode()) {
      // config taken from sandbox
      /* this.config = {
          "selectedInputs": [
             "id",
             "name",
             "alarms",
             "availability"
         ],
         "pageSize": 10,
         "dashboardList": [
             {
                 "dashboarId": "8888572",
                 "tabGroupID": "Air Quality Sensor 001139 01",
                 "type": "Air Quality Monitor1"
             },
             {
                 "dashboarId": "8888573",
                 "tabGroupID": "Air Quality Sensor 001140 02",
                 "type": "Air Quality Monitor2"
             },
             {
                 "dashboarId": "8889241",
                 "tabGroupID": "Air Quality Sensor 001141 03",
                 "type": "Air Quality Monitor3"
             },
             {
                 "dashboarId": "8905657",
                 "tabGroupID": "Air Quality Sensor 001142 04",
                 "type": "Air Quality Monitor4"
             },
             {
                 "dashboarId": "8888574",
                 "tabGroupID": "Air Quality Sensor 001143 05",
                 "type": "Air Quality Monitor5"
             },
             {
                 "dashboarId": "8889243",
                 "tabGroupID": "Waste Bin 001239 01",
                 "type": "WasteBin1"
             },
             {
                 "dashboarId": "8889244",
                 "tabGroupID": "Waste Bin 001240 02",
                 "type": "WasteBin2"
             },
             {
                 "dashboarId": "8906064",
                 "tabGroupID": "Waste Bin 001241 03",
                 "type": "WasteBin3"
             },
             {
                 "dashboarId": "8905660",
                 "tabGroupID": "Waste Bin 001242 04",
                 "type": "WasteBin4"
             },
             {
                 "dashboarId": "8906065",
                 "tabGroupID": "Waste Bin 001243 05",
                 "type": "WasteBin5"
             },
             {
                 "dashboarId": "8889246",
                 "tabGroupID": "Eaton SmartMeter1",
                 "type": "SmartMeter1"
             },
             {
                 "dashboarId": "8889247",
                 "tabGroupID": "Eaton SmartMeter2",
                 "type": "SmartMeter2"
             },
             {
                 "dashboarId": "8907037",
                 "tabGroupID": "Eaton SmartMeter3",
                 "type": "SmartMeter3"
             },
             {
                 "dashboarId": "8905666",
                 "tabGroupID": "Eaton SmartMeter4",
                 "type": "SmartMeter4"
             },
             {
                 "dashboarId": "8907038",
                 "tabGroupID": "Eaton SmartMeter5",
                 "type": "SmartMeter5"
             },
             {
                 "dashboarId": "8905667",
                 "tabGroupID": "Eaton SmartMeter6",
                 "type": "SmartMeter6"
             },
             {
                 "dashboarId": "8907039",
                 "tabGroupID": "Eaton SmartMeter7",
                 "type": "SmartMeter7"
             },
             {
                 "type": "All"
             }
         ],
         "device": {
             "id": "8905637"
         },
         "withTabGroup": false
      }*/
    }

    //this.displayedColumns = this.displayedColumns.concat(this.config.tProps ? this.config.tProps : []);
    this.displayedColumns = this.config.selectedInputs ? this.config.selectedInputs : [];
    await this.loadDeviceData();
    this.pagination();
    this.appId = this.devicelist.getAppId();
    this.configDashboardList = this.config.dashboardList;
  }

  ngOnDestroy(): void {
    this.clearSubscriptions();
  }

  async refresh() {
    this.clearSubscriptions();
    await this.loadDeviceData();
  }
  // Navigate URL to dashboard if dashboard is exist else it will redirect to dialog box to create new Dasboard
  selectedRecord(id: any, deviceType: string) {
    if (deviceType && this.appId) {
      const dashboardObj = this.configDashboardList.find((dashboard) => dashboard.type === deviceType);
      if (dashboardObj && dashboardObj.dashboarId) {

        if (dashboardObj.withTabGroup) {
          this.router.navigate([
            `/application/${this.appId}/tabgroup/${id}/dashboard/${dashboardObj.dashboarId}/device/${id}`]);
        } else if (dashboardObj.tabGroupID) {
          this.router.navigate([
            `/application/${this.appId}/tabgroup/${dashboardObj.tabGroupID}/dashboard/${dashboardObj.dashboarId}/device/${id}`]);
        } else {
          this.router.navigate([`/application/${this.appId}/dashboard/${dashboardObj.dashboarId}/device/${id}`]);
        }
      } else {
        this.openDialogManual(' No dashboard available for ' + id);

      }
    } else if (deviceType) {
      this.router.navigate([`/device/${id}`]);
    }
  }

  private openDialogManual(message) {
    this.modalService.show(GpAlertModalComponent, { class: 'modal-lg', initialState: { message } });
   }

  pageChanged(pageEvent: any) {
    this.currentPage = pageEvent.page;
    this.pagination();
  }

  private pagination() {
    const startIndex = (this.currentPage - 1) * this.config.pageSize;
    const endIndex = (this.currentPage) * this.config.pageSize;
    this.dataSource.data = this.deviceAtRiskData.filter((record: any, index) => index >= startIndex && index < endIndex);
    this.dataSource.sort = this.sort;
  }

  private async loadDeviceData() {
    this.currentPage = 1;
    this.deviceAtRiskData = await this.devicelist.getDeviceList(this.config, this.displayedColumns);
    this.totalPages = this.deviceAtRiskData.length;
    this.pagination();
    this.handleReatime();
  }

  /**
   * Clear all Realtime subscriptions
   */
  private clearSubscriptions() {
    if (this.allSubscriptions) {
      this.allSubscriptions.forEach((s) => {
        this.realtimeService.unsubscribe(s.subs);
      });
    }
  }
}
