import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-asset-model-json-packet-format',
  templateUrl: './asset-model-json-packet-format.component.html',
  styleUrls: ['./asset-model-json-packet-format.component.css']
})
export class AssetModelJsonPacketFormatComponent implements OnInit {
  @Input() assetModel: any;
  ngOnInit(): void {
  }
}
