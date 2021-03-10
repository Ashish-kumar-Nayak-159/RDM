import { Component, OnInit, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-loader',
  templateUrl: './loader.component.html',
  styleUrls: ['./loader.component.css']
})
export class LoaderComponent implements OnInit, AfterViewInit {

  constructor() { }


  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    const preloader = document.querySelector('.preloader') as HTMLElement;

    const fadeEffect = () => {
      // if we don't set opacity 1 in CSS, then   //it will be equaled to "", that's why we   // check it
      if (!preloader.style.opacity) {
        preloader.style.opacity = '1';
      }
      if (Number(preloader.style.opacity) > 0) {
        preloader.style.opacity  = (Number(preloader.style.opacity) - 0.1).toString();
      }
    };
    fadeEffect();

  }

}
