import { environment } from 'src/environments/environment';
import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent implements OnInit {

  @Input() isLoginRoute = false;
  currentYear = new Date().getFullYear();
  version = environment.version;
  constructor() { }

  ngOnInit(): void {
  }

}
