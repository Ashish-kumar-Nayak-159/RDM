import { Component, Inject, HostListener, NgZone, OnInit, AfterViewInit } from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { DOCUMENT } from '@angular/common';
import { CommonService } from 'src/app/services/common.service';
import { CONSTANTS } from './app.constants';
declare var $: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, AfterViewInit {
  title = 'RDM';
  isLoginRoute = false;
  isHomeRoute = false;
  appName: string;
  userData: any;
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private commonService: CommonService,
    @Inject(DOCUMENT) private document: Document
  ) {
  }
  ngAfterViewInit(): void {

    setTimeout(() => {
      if (!this.isLoginRoute && !this.isHomeRoute) {
        let node = document.createElement('script');
        node.src = './assets/js/kdm.min.js';
        node.type = 'text/javascript';
        node.async = false;
        node.charset = 'utf-8';
        document.getElementsByTagName('head')[0].appendChild(node);
      }
    }, 500);

  }


  ngOnInit(): void {
    this.userData = this.commonService.getItemFromLocalStorage(CONSTANTS.USER_DETAILS);
    if (this.userData) {
      this.appName = this.userData.apps[0].app;
    }
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        const list = event.url.split('/');
        if (list[1] === 'applications' && list[2]) {
          this.appName = list[2];
        }
        if (event.url.includes('login')) {
          this.isLoginRoute = true;
          this.isHomeRoute = false;
          if (!this.document.body.classList.contains('bg-white')) {
            this.document.body.classList.add('bg-white');
          }
        } else if (event.url === '/') {
          this.isHomeRoute = true;
          this.isLoginRoute = false;
        } else {
          this.isLoginRoute = false;
          this.isHomeRoute = false;
          if (this.document.body.classList.contains('bg-white')) {
            this.document.body.classList.remove('bg-white');
          }
        }
        console.log(this.isLoginRoute);
      }
    });

  }



}
