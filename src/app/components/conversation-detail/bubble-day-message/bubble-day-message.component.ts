import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-bubble-day-message',
  templateUrl: './bubble-day-message.component.html',
  styleUrls: ['./bubble-day-message.component.scss'],
})
export class BubbleDayMessageComponent implements OnInit {
  @Input() messageDate = '';
  constructor() { }

  ngOnInit() {}

}
