import { Component, Inject, HostListener, NgZone, OnInit, AfterViewInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { DOCUMENT } from '@angular/common';
declare var $:any;
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, AfterViewInit {
  title = 'RDM';
  isLoginRoute = false;

  constructor(
    private router: Router,
    @Inject(DOCUMENT) private document: Document,
    private ngZone:NgZone
  ) {
  }
  ngAfterViewInit(): void {
    setTimeout(() => {
      const $containerDiv = $(".container-fluid");
      const $container1Div = $(".container1-fluid");

      $(window).resize(function () {
        // console.log($(window).width());
        if ($(window).width() < 750) {
          $containerDiv.removeClass("sb-notoggle");
          $containerDiv.addClass("sb-toggle");

          $container1Div.removeClass("sb1-notoggle");
          $container1Div.addClass("sb1-toggle");
        } else {
          $containerDiv.removeClass("sb-toggle");
          $containerDiv.addClass("sb-notoggle");
          $container1Div.removeClass("sb1-toggle");
          $container1Div.addClass("sb1-notoggle");
        }
      });
    }, 100)
  }


  ngOnInit(): void {
    console.log(localStorage.getItem('userData'));
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        if (event.url.includes('login')) {
          this.isLoginRoute = true;
          if (!this.document.body.classList.contains('bg-gradient-login')) {
            this.document.body.classList.add('bg-gradient-login');
          }
        } else {
          this.isLoginRoute = false;
          if (this.document.body.classList.contains('bg-gradient-login')) {
            this.document.body.classList.remove('bg-gradient-login');
          }
          setTimeout(() => {
            const $containerDiv = $(".container-fluid");
            const $container1Div = $(".container1-fluid");
            if ($(window).width() < 750) {
              $containerDiv.removeClass("sb-notoggle");
              $containerDiv.addClass("sb-toggle");

              $container1Div.removeClass("sb1-notoggle");
              $container1Div.addClass("sb1-toggle");
            } else {
              $containerDiv.removeClass("sb-toggle");
              $containerDiv.addClass("sb-notoggle");
              $container1Div.removeClass("sb1-toggle");
              $container1Div.addClass("sb1-notoggle");
            }
          }, 200);
        }
      }
    })

  }



}
