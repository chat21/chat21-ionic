import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ConversationsArchivedListPage } from './conversations-archived-list.page';

describe('ConversationsArchivedListPage', () => {
  let component: ConversationsArchivedListPage;
  let fixture: ComponentFixture<ConversationsArchivedListPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConversationsArchivedListPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ConversationsArchivedListPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
