import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { IonListConversationsComponent } from './ion-list-conversations.component';

describe('ExtListConversationComponent', () => {
  let component: IonListConversationsComponent;
  let fixture: ComponentFixture<IonListConversationsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IonListConversationsComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(IonListConversationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
