import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-bubble-system-message',
  templateUrl: './bubble-system-message.component.html',
  styleUrls: ['./bubble-system-message.component.scss'],
})
export class BubbleSystemMessageComponent implements OnInit {
  @Input() messageText = '';
  constructor() { }

  ngOnInit() {}

}
