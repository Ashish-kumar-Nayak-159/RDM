import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { TooltipModule } from 'ngx-bootstrap/tooltip';

import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { RDMSideMenuComponent } from './rdm-side-menu/rdm-side-menu.component';
import { HttpInterceptorProviders } from './Interceptor';
import { NoopAnimationsModule, BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrModule } from 'ngx-toastr';
import { MatNativeDateModule } from '@angular/material/core';
import { RDMLoginComponent } from './rdm-login/rdm-login.component';
import { RDMHomeComponent } from './rdmhome/rdmhome.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { LoaderComponent } from './loader/loader.component';
import { AgmCoreModule } from '@agm/core';
import { RdmGuestLoginComponent } from './rdm-guest-login/rdm-guest-login.component';
import { NgxIntlTelInputModule } from 'ngx-intl-tel-input';
import * as PlotlyJS from 'plotly.js-dist-min';
import { PlotlyModule } from 'angular-plotly.js';
PlotlyModule.plotlyjs = PlotlyJS;
@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    FooterComponent,
    RDMSideMenuComponent,
    RDMLoginComponent,
    RDMHomeComponent,
    ResetPasswordComponent,
    LoaderComponent,
    RdmGuestLoginComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    ToastrModule.forRoot(),
    TooltipModule.forRoot(),
    NoopAnimationsModule,
    MatNativeDateModule,
    BrowserAnimationsModule,
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyCGnaF9LBIEhAgc5wwktQtWOBu9pnNNfK0',
      libraries: ['places'],
    }),
    NgxIntlTelInputModule,
    PlotlyModule,
  ],
  providers: [HttpInterceptorProviders],
  bootstrap: [AppComponent],
})
export class AppModule { }
