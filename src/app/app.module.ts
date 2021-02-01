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
import { MonacoEditorModule, NgxMonacoEditorConfig } from 'ngx-monaco-editor';


const monacoConfig: NgxMonacoEditorConfig = {
  baseUrl: 'https://unpkg.com/monaco-editor@0.19.3/min/vs', // configure base path for monaco editor
  defaultOptions: { scrollBeyondLastLine: false }, // pass default options to be used
  onMonacoLoad: () => { console.log((window as any).monaco); }
  // here monaco object will be available as window.monaco use this function to extend monaco editor functionality.
};
@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    FooterComponent,
    RDMSideMenuComponent,
    RDMLoginComponent,
    RDMHomeComponent,
    ResetPasswordComponent
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
    MonacoEditorModule.forRoot(monacoConfig)
  ],
  providers: [
    HttpInterceptorProviders
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
