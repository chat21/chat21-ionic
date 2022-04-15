import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { CreateRequesterPage } from './create-requester.page';

describe('CreateRequesterPage', () => {
  let component: CreateRequesterPage;
  let fixture: ComponentFixture<CreateRequesterPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateRequesterPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(CreateRequesterPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
