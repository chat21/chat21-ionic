import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { CreateCannedResponsePage } from './create-canned-response.page';

describe('CreateCannedResponsePage', () => {
  let component: CreateCannedResponsePage;
  let fixture: ComponentFixture<CreateCannedResponsePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateCannedResponsePage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(CreateCannedResponsePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
