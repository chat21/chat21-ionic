import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { UnassignedConversationsPage } from './unassigned-conversations.page';

describe('UnassignedConversationsPage', () => {
  let component: UnassignedConversationsPage;
  let fixture: ComponentFixture<UnassignedConversationsPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UnassignedConversationsPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(UnassignedConversationsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
