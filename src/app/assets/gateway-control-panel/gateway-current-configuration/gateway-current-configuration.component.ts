import { Component, Input, OnInit } from '@angular/core';
import { Asset } from 'src/app/models/asset.model';

@Component({
  selector: 'app-gateway-current-configuration',
  templateUrl: './gateway-current-configuration.component.html',
  styleUrls: ['./gateway-current-configuration.component.css']
})
export class GatewayCurrentConfigurationComponent implements OnInit {

  @Input() asset: Asset = new Asset();
  assetMetadataKeys: any[] = [];
  ngOnInit(): void {
    this.assetMetadataKeys = Object.keys(this.asset.configuration);
  }

}
