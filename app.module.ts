import { BrowserModule } from '@angular/platform-browser';
import { NgModule, Injectable } from '@angular/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { GpDevicesAtRiskWidgetModule } from './widget/gp-devices-at-risk-widget.module';
import { RouterModule as ngRouterModule } from '@angular/router';
import { InventoryService, Realtime } from '@c8y/ngx-components/api';
import { AppStateService, OptionsService } from '@c8y/ngx-components';
import { BehaviorSubject } from 'rxjs';
import { RouterModule } from '@angular/router';
import {
  BasicAuth,
  Client,
  IdentityService,
  AlarmService,
  IUser} from '@c8y/client';

import { NgSelectModule } from '@ng-select/ng-select';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { BootstrapComponent, CoreModule} from '@c8y/ngx-components';
import { BsModalRef } from 'ngx-bootstrap/modal';
const auth = new BasicAuth({
  user:'',
  password:'',
  tenant:''

});
const client = new Client(auth,'');
client.setAuth(auth);
const fetchClient = client.core;
@Injectable()
export class MockAppStateService {
  currentUser = new BehaviorSubject<IUser | null>(null);
}
@NgModule({
  imports: [
    BrowserAnimationsModule,
    ngRouterModule.forRoot([], { enableTracing: false, useHash: true }),
    RouterModule.forRoot([]),
    CoreModule.forRoot(),
    BrowserModule,
    NoopAnimationsModule,
    NgSelectModule,
    GpDevicesAtRiskWidgetModule
  ],
  providers: [
    BsModalRef,
      {
        provide: IdentityService,
        useFactory: () => {
          return new IdentityService(fetchClient);
        }
      },
        { provide: InventoryService, useValue: client.inventory},
        { provide: Realtime, useValue: client.realtime},
        { provide: AlarmService, useValue: client.alarm },
        { provide: InventoryService, useValue: client.inventory },
        { provide: Realtime, useValue: client.realtime },
        { provide: IdentityService, useValue: client.identity },
        { provide: AppStateService, useClass: MockAppStateService },
  ],
  bootstrap: [BootstrapComponent]
})
export class AppModule {}
