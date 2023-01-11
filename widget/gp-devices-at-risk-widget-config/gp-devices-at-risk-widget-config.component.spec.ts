import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GpDevicesAtRiskWidgetConfigComponent } from './gp-devices-at-risk-widget-config.component';

describe('GpDevicesAtRiskWidgetConfigComponent', () => {
  let component: GpDevicesAtRiskWidgetConfigComponent;
  let fixture: ComponentFixture<GpDevicesAtRiskWidgetConfigComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [GpDevicesAtRiskWidgetConfigComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GpDevicesAtRiskWidgetConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
