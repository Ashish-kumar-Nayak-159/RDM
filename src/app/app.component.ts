import { Component, Inject } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'RDM';
  isLoginRoute = false;

  constructor(
    private router: Router,
    @Inject(DOCUMENT) private document: Document
  ) {}

  ngOnInit(): void {
    console.log(this.router.url);
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        if (event.url.includes('login')) {
          console.log('here');
          this.isLoginRoute = true;
          if (!this.document.body.classList.contains('bg-gradient-primary')) {
            this.document.body.classList.add('bg-gradient-primary');
          }
        } else {
          this.isLoginRoute = false;
          if (this.document.body.classList.contains('bg-gradient-primary')) {
            this.document.body.classList.remove('bg-gradient-primary');
          }
        }
      }
    })

  }
}
