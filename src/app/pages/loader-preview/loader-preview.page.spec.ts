import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { LoaderPreviewPage } from './loader-preview.page';

describe('LoaderPreviewPage', () => {
  let component: LoaderPreviewPage;
  let fixture: ComponentFixture<LoaderPreviewPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LoaderPreviewPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(LoaderPreviewPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
