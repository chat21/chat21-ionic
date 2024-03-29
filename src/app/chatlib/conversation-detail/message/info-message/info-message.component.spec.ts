import { HtmlEntitiesEncodePipe } from './../../../../directives/html-entities-encode.pipe';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MarkedPipe } from 'src/app/directives/marked.pipe';

import { InfoMessageComponent } from './info-message.component';

describe('InfoMessageComponent', () => {
  let component: InfoMessageComponent;
  let fixture: ComponentFixture<InfoMessageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InfoMessageComponent, MarkedPipe, HtmlEntitiesEncodePipe ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InfoMessageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
