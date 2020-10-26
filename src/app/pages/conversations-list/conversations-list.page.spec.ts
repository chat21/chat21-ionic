import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ConversationListPage } from './conversations-list.page';

describe('ConversationListTestPage', () => {
  let component: ConversationListPage;
  let fixture: ComponentFixture<ConversationListPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConversationListPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ConversationListPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
