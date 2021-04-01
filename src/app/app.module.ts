import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
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
import { MonacoEditorModule } from 'ngx-monaco-editor';
import { LoaderComponent } from './loader/loader.component';
import { AgmCoreModule } from '@agm/core';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    FooterComponent,
    RDMSideMenuComponent,
    RDMLoginComponent,
    RDMHomeComponent,
    ResetPasswordComponent,
    LoaderComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    ToastrModule.forRoot(),
    NoopAnimationsModule,
    MatNativeDateModule,
    BrowserAnimationsModule,
    MonacoEditorModule.forRoot(),
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyCGnaF9LBIEhAgc5wwktQtWOBu9pnNNfK0',
      libraries: ['places']
    })
  ],
  providers: [
    HttpInterceptorProviders
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
