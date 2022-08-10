import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { BsModalService } from 'ngx-bootstrap/modal';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';

@Component({
  selector: 'app-pagination',
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.css']
})
export class PaginationComponent implements OnInit {
  @Output() pageChangeEvent = new EventEmitter();
  // constructor() { }

  // ngOnInit(): void {
  // }

   contentArray: string[] = new Array(50).fill('');
   returnedArray: string[];
   showBoundaryLinks: boolean = true;
   showDirectionLinks: boolean = true;
   constructor() {}

   pageChanged(event: PageChangedEvent): void {
      const startItem = (event.page - 1) * event.itemsPerPage;
      const endItem = event.page * event.itemsPerPage;
      this.returnedArray = this.contentArray.slice(startItem, endItem);
      let ArrayObject = {
        startItem : startItem,
        endItem : endItem
      }
      this.pageChangeEvent.emit(ArrayObject);
   }
   ngOnInit(): void {
      this.contentArray = this.contentArray.map((v: string, i: number) => {
         return 'Line '+ (i + 1);
      });
      this.returnedArray = this.contentArray.slice(0, 10);
   }


}
